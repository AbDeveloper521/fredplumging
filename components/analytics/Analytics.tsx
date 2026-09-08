import { GoogleAnalytics } from "@next/third-parties/google";
import { analyticsConfig } from "@/lib/analyticsConfig";
import { ClickTracker } from "./ClickTracker";

/**
 * Google Analytics 4 for the marketing site. Renders nothing at all unless
 * `analyticsConfig()` says so (production with a measurement ID, or local
 * with the debug flag) — so a disabled build ships no gtag script, no
 * listener and no console noise.
 *
 * `@next/third-parties` is used instead of Google's raw snippet: it loads
 * gtag after hydration (deferred, never render-blocking) and, through GA4's
 * history-change detection, records a pageview on every App Router
 * navigation rather than only the first load. It must be the ONLY gtag on
 * the page — adding the raw snippet alongside it double-counts traffic.
 */
export function Analytics() {
  const config = analyticsConfig();
  if (!config) return null;

  return (
    <>
      <GoogleAnalytics gaId={config.gaId} debugMode={config.debugMode} />
      <ClickTracker />
    </>
  );
}
