import "server-only";

/**
 * THE decision on whether Google Analytics loads. Nothing else in the
 * codebase checks these variables — every "should analytics run?" question
 * is answered here, once.
 *
 *   NEXT_PUBLIC_GA_ID     the GA4 measurement ID (G-XXXXXXXXXX). PUBLIC by
 *                         design — it sits in the page source of every site
 *                         running GA, so it is safe in .env.example. Unset
 *                         (or blank) means analytics is off everywhere and
 *                         nothing is rendered or logged.
 *   NEXT_PUBLIC_GA_DEBUG  "true" lets analytics fire OUTSIDE production —
 *                         i.e. on localhost — so events can be verified,
 *                         and switches gtag into debug_mode so they show up
 *                         in GA's DebugView. Unset it again afterwards so
 *                         day-to-day development does not pollute the data.
 *   VERCEL_ENV            set by the platform: "production", "preview" or
 *                         "development". Previews never report, whatever
 *                         the other two say — a branch deploy is not
 *                         traffic.
 */
export function analyticsConfig(): { gaId: string; debugMode: boolean } | null {
  const gaId = process.env.NEXT_PUBLIC_GA_ID?.trim();
  if (!gaId) return null;

  const debugMode = process.env.NEXT_PUBLIC_GA_DEBUG === "true";

  switch (process.env.VERCEL_ENV) {
    case "production":
      return { gaId, debugMode: false };
    case "preview":
      return null;
    default:
      // Local development (`next dev`, or `next start` on a laptop —
      // VERCEL_ENV is unset or "development"): opt in with the debug flag.
      return debugMode ? { gaId, debugMode } : null;
  }
}
