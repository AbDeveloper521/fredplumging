import "server-only";

const BAR = "═".repeat(72);

/**
 * Unmissable build-output warning for when a Sanity fetch FAILS and static
 * fallback content is baked into prerendered pages. During `next build` this
 * prints once per worker per fetcher — repetition is intentional volume.
 */
export function logFallback(options: {
  fetcher: string;
  fallbackFile: string;
  affects: string;
  error?: unknown;
}): void {
  console.error(
    [
      "",
      BAR,
      `⚠️  [SANITY FALLBACK] ${options.fetcher} FAILED — static fallback from`,
      `    ${options.fallbackFile} is being baked into the prerendered pages.`,
      `    Affected: ${options.affects}`,
      `    If this appears in a production build, the deployed site is serving`,
      `    fallback content, NOT what is published in the Studio.`,
      BAR,
      "",
    ].join("\n"),
    options.error ?? "",
  );
}

/**
 * An image WAS uploaded in the Studio but is deliberately not rendered
 * because its alt text is empty (accessibility is enforced, see
 * sanity/schemas/fields.ts). Without this log the drop is silent and looks
 * identical to "no image uploaded".
 */
export function logImageSkipped(options: {
  /** Which document/field, e.g. `service "commercial-plumbing" → photo`. */
  context?: string;
  /** Sanity asset _ref, when the caller has no document context. */
  assetRef?: string;
}): void {
  const where =
    options.context ??
    (options.assetRef ? `asset ${options.assetRef}` : "an image field");
  console.warn(
    `[sanity] IMAGE SKIPPED: ${where} has an image uploaded but no alt text — ` +
      "the site is showing a placeholder instead. Fix: open the document in " +
      "/studio and fill in “Describe this image” under that image, then Publish.",
  );
}

/** A successful fetch returned zero documents — legitimate, but worth a note. */
export function logEmpty(fetcher: string, consequence: string): void {
  console.warn(
    `[sanity] ${fetcher}: fetch succeeded but returned 0 documents — ${consequence}`,
  );
}
