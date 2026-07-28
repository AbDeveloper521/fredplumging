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

/**
 * A published section failed its render gate and is NOT on the page. Without
 * this log the drop is invisible: the Studio says "Published", the page just
 * quietly misses a section. Names the Studio field titles (what the owner
 * actually sees on screen), not the schema field names.
 */
export function logSectionDropped(options: {
  /** Which document, e.g. `service "plumbing"`. */
  context: string;
  sectionType: string;
  sectionKey: string;
  index: number;
  /** Studio field titles that were empty/invalid, e.g. `"Big heading"`. */
  studioFields: string[];
}): void {
  const fields =
    options.studioFields.length > 0
      ? options.studioFields.map((f) => `“${f}”`).join(", ")
      : "(could not identify which — inspect the section in /studio)";
  console.warn(
    [
      "",
      BAR,
      `⚠️  [SANITY SECTION DROPPED] ${options.context} → sections[${options.index}]`,
      `    (${options.sectionType}, key ${options.sectionKey}) is published but NOT`,
      `    rendered — required content is missing.`,
      `    Empty required field(s): ${fields}`,
      `    Fix: open the document in /studio, fill in the field(s) named above`,
      `    on that section, then Publish.`,
      BAR,
      "",
    ].join("\n"),
  );
}

/** A successful fetch returned zero documents — legitimate, but worth a note. */
export function logEmpty(fetcher: string, consequence: string): void {
  console.warn(
    `[sanity] ${fetcher}: fetch succeeded but returned 0 documents — ${consequence}`,
  );
}
