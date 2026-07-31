import "server-only";
import { createImageUrlBuilder } from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url";
import { client } from "@/sanity/client";
import { logImageSkipped } from "@/sanity/lib/fallbackLog";
import type { CmsPhoto } from "@/data/services";

const builder = createImageUrlBuilder(client);

function assetRefOf(asset: unknown): string | undefined {
  if (asset && typeof asset === "object" && "_ref" in asset) {
    const ref = (asset as { _ref?: unknown })._ref;
    if (typeof ref === "string") return ref;
  }
  return undefined;
}

/**
 * The editor-facing "Frame shape" override values, defined in
 * `imageWithAlt` (sanity/schemas/fields.ts) — keep the two in sync.
 * "default"/absent means "use the call site's design ratio".
 */
const FRAME_RATIO_OVERRIDES: Record<string, number> = {
  square: 1,
  landscape: 4 / 3,
  wide: 16 / 9,
  portrait: 3 / 4,
};

/**
 * Bounds for the "Original — uncropped" option. Layouts must absorb whatever
 * frame it produces, so extreme panoramas/towers are cropped to the nearest
 * bound (with hotspot) instead of rendering as a sliver.
 */
const MAX_ORIGINAL_RATIO = 2.4; // widest: 2.4:1
const MIN_ORIGINAL_RATIO = 1 / 1.6; // tallest: 1:1.6

interface CmsImageValue {
  asset?: unknown;
  alt?: string | null;
  frameRatio?: string | null;
  crop?: {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
  } | null;
}

/**
 * The upload's own width/height ratio, parsed from the asset ref (its
 * dimensions are encoded, e.g. `image-<hash>-1254x836-png`) — no metadata
 * fetch needed. Adjusted for any manual crop rectangle the editor drew, so
 * an "Original" frame matches what the CDN actually serves.
 */
function intrinsicRatioOf(image: CmsImageValue): number | undefined {
  const ref = assetRefOf(image.asset);
  const match = ref ? /-(\d+)x(\d+)-/.exec(ref) : null;
  if (!match) return undefined;
  let width = Number(match[1]);
  let height = Number(match[2]);
  if (!width || !height) return undefined;
  const crop = image.crop;
  if (crop) {
    width *= 1 - (crop.left ?? 0) - (crop.right ?? 0);
    height *= 1 - (crop.top ?? 0) - (crop.bottom ?? 0);
  }
  return width > 0 && height > 0 ? width / height : undefined;
}

/**
 * Resolves a Sanity image + alt into a plain serializable `CmsPhoto`
 * (URL string + alt + frame ratio) server-side, so client components never
 * need `@sanity/image-url` in their bundle. Returns undefined when no image
 * is set or alt is missing — callers fall back to `ImagePlaceholder`.
 *
 * The alt-missing case is a deliberate drop of an uploaded asset, so it
 * warns via `logImageSkipped` — silently rendering a placeholder over a real
 * upload is the bug this guards against. `context` names the document/field
 * in that warning; callers without document context omit it and the asset
 * reference is logged instead.
 *
 * `aspect` (width / height) is the call site's DESIGN ratio. Only with a
 * fixed target shape can `fit("crop")` honour the hotspot the editor set in
 * Studio — without `aspect` the URL keeps `fit("max")`, which never crops,
 * so the hotspot cannot apply and the browser centre-crops via CSS instead.
 *
 * The editor's "Frame shape" override (`frameRatio` on the image) beats the
 * design ratio: a named shape crops to that shape; "original" renders the
 * upload's own ratio uncropped, clamped to [1:1.6, 2.4:1] — outside the
 * bounds it crops (hotspot-aware) to the nearest bound. The returned `ratio`
 * lets components size the frame from data; it is absent exactly when the
 * URL is uncropped-by-design (no `aspect`, no override).
 */
export function resolvePhoto(
  image: CmsImageValue | null | undefined,
  width = 1600,
  context?: string,
  aspect?: number,
): CmsPhoto | undefined {
  if (!image?.asset) return undefined;
  if (!image.alt) {
    logImageSkipped({ context, assetRef: assetRefOf(image.asset) });
    return undefined;
  }

  const override =
    typeof image.frameRatio === "string" ? image.frameRatio : undefined;

  let effective: number | undefined;
  let crop = true;
  if (override === "original") {
    const intrinsic = intrinsicRatioOf(image);
    if (intrinsic === undefined) {
      effective = aspect; // unparsable ref — fall back to the design shape
    } else if (intrinsic > MAX_ORIGINAL_RATIO) {
      effective = MAX_ORIGINAL_RATIO;
    } else if (intrinsic < MIN_ORIGINAL_RATIO) {
      effective = MIN_ORIGINAL_RATIO;
    } else {
      effective = intrinsic;
      crop = false; // within bounds: the whole image, no crop
    }
  } else if (override && FRAME_RATIO_OVERRIDES[override]) {
    effective = FRAME_RATIO_OVERRIDES[override];
  } else {
    effective = aspect; // includes the explicit "default" value
  }

  let url = builder.image(image as SanityImageSource).width(width);
  url =
    effective && crop
      ? url.height(Math.round(width / effective)).fit("crop")
      : url.fit("max");
  return {
    url: url.auto("format").url(),
    alt: image.alt,
    ratio: effective,
  };
}
