import "server-only";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url";
import { client } from "@/sanity/client";
import type { CmsPhoto } from "@/data/services";

const builder = imageUrlBuilder(client);

/**
 * Resolves a Sanity image + alt into a plain serializable `CmsPhoto`
 * (URL string + alt) server-side, so client components never need
 * `@sanity/image-url` in their bundle. Returns undefined when no image is
 * set or alt is missing — callers fall back to `ImagePlaceholder`.
 */
export function resolvePhoto(
  image: { asset?: unknown; alt?: string | null } | null | undefined,
  width = 1600,
): CmsPhoto | undefined {
  if (!image?.asset || !image.alt) return undefined;
  return {
    url: builder
      .image(image as SanityImageSource)
      .width(width)
      .fit("max")
      .auto("format")
      .url(),
    alt: image.alt,
  };
}
