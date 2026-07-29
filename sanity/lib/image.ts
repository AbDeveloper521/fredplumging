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
 * Resolves a Sanity image + alt into a plain serializable `CmsPhoto`
 * (URL string + alt) server-side, so client components never need
 * `@sanity/image-url` in their bundle. Returns undefined when no image is
 * set or alt is missing — callers fall back to `ImagePlaceholder`.
 *
 * The alt-missing case is a deliberate drop of an uploaded asset, so it
 * warns via `logImageSkipped` — silently rendering a placeholder over a real
 * upload is the bug this guards against. `context` names the document/field
 * in that warning; callers without document context omit it and the asset
 * reference is logged instead.
 *
 * `aspect` (width / height) asks the CDN to crop to that shape. Only with a
 * fixed target shape can `fit("crop")` honour the hotspot the editor set in
 * Studio — without `aspect` the URL keeps `fit("max")`, which never crops,
 * so the hotspot cannot apply and the browser centre-crops via CSS instead.
 */
export function resolvePhoto(
  image: { asset?: unknown; alt?: string | null } | null | undefined,
  width = 1600,
  context?: string,
  aspect?: number,
): CmsPhoto | undefined {
  if (!image?.asset) return undefined;
  if (!image.alt) {
    logImageSkipped({ context, assetRef: assetRefOf(image.asset) });
    return undefined;
  }
  let url = builder.image(image as SanityImageSource).width(width);
  url = aspect
    ? url.height(Math.round(width / aspect)).fit("crop")
    : url.fit("max");
  return {
    url: url.auto("format").url(),
    alt: image.alt,
  };
}
