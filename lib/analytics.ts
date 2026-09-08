/**
 * Google Analytics 4 events — the ONE place the site talks to gtag.
 *
 * Every call site goes through `trackEvent`; no component touches
 * `window.gtag` or `window.dataLayer` directly. The function is a safe
 * no-op whenever gtag is not on the page: analytics disabled (no
 * measurement ID, preview deployment, local dev without the debug flag),
 * blocked by an ad blocker, or simply not loaded yet.
 *
 * ⚠️ PRIVACY RULE — nothing about WHO. Events carry what happened, where on
 * the site and on which page. A submitter's name, email, phone, address or
 * message must never be passed here; the `AnalyticsEvent` union below is
 * deliberately closed so a form field cannot be added by accident.
 *
 * Client-safe: this module reads no environment variables. Whether gtag is
 * loaded at all is decided server-side in `lib/analyticsConfig.ts`.
 */

declare global {
  interface Window {
    /** Defined by the gtag init snippet that `<GoogleAnalytics>` injects. */
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * The `data-*` attribute that names WHERE a phone/email link sits (header,
 * hero, footer, emergency band…). Put it on the link itself, or on any
 * ancestor to label every link inside it. Read by `ClickTracker`.
 */
export const LOCATION_ATTR = "data-analytics-location";

/**
 * Which form: the `source` label `submitLead` already sends — currently
 * "contact-page", "homepage-hero" and "final-cta".
 */
type LeadFormId = string;

export type AnalyticsEvent =
  | {
      name: "phone_click" | "email_click";
      params: { link_location: string; page_path: string };
    }
  | {
      /** GA4's recommended lead event name — mark it as a key event in GA. */
      name: "generate_lead";
      params: { form_id: LeadFormId; page_path: string };
    }
  | {
      /** A submission the visitor saw fail (LEAD_DELIVERY_FAILED and co.). */
      name: "lead_submit_failed";
      params: { form_id: LeadFormId; page_path: string; error_status: number };
    };

/** Current path only — never the query string, which could carry anything. */
export function currentPagePath(): string {
  return typeof window === "undefined" ? "" : window.location.pathname;
}

export function trackEvent<E extends AnalyticsEvent>(
  name: E["name"],
  params: E["params"],
): void {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", name, params);
}
