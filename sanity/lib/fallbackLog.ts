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

/** A successful fetch returned zero documents — legitimate, but worth a note. */
export function logEmpty(fetcher: string, consequence: string): void {
  console.warn(
    `[sanity] ${fetcher}: fetch succeeded but returned 0 documents — ${consequence}`,
  );
}
