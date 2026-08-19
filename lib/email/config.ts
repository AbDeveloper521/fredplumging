import "server-only";
import { site } from "@/data/site";
import { derivedYearsInBusiness } from "@/lib/yearsInBusiness";
import type { EmailBrand } from "./shell";

/**
 * Environment wiring for outbound email. Every value here is deliberately
 * read through a function rather than a module constant so it is resolved
 * per request on the server, and so a missing one is a runtime condition the
 * delivery module can log — not a build-time inline.
 *
 * ⚠️ `RESEND_API_KEY` is a SECRET. It is read here and passed straight to the
 * SDK; it is never logged, echoed, returned to the browser, or interpolated
 * into an error message. `hasResendApiKey()` exists so callers can report
 * "present"/"missing" without touching the value.
 */

/**
 * The origin the emails' images and links point at.
 *
 * Email clients cannot resolve a relative path or a bundler import, so the
 * logo has to be an absolute https URL on a host that is serving RIGHT NOW.
 * `SITE_URL`'s default (https://fredsplumbing.com) is the domain the site
 * will move to, which does not resolve yet — pointing email images there
 * would ship a permanently broken logo. So the order is:
 *
 *   1. EMAIL_ASSET_ORIGIN     — explicit override
 *   2. NEXT_PUBLIC_SITE_URL   — set once the real origin is known
 *   3. the Vercel deployment currently serving the site
 *
 * ⚠️ PLACEHOLDER: step 3 must be replaced at domain cutover by setting
 * NEXT_PUBLIC_SITE_URL (or EMAIL_ASSET_ORIGIN) to https://fredsplumbing.com.
 */
const CURRENT_PUBLIC_ORIGIN = "https://fredplumging.vercel.app";

function normaliseOrigin(value: string): string {
  return value.trim().replace(/\/+$/, "");
}

export function emailOrigin(): string {
  const override = process.env.EMAIL_ASSET_ORIGIN?.trim();
  if (override) return normaliseOrigin(override);
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) return normaliseOrigin(configured);
  return CURRENT_PUBLIC_ORIGIN;
}

/**
 * A 360px-wide, 8 KB copy of the logo generated for email — the 417 KB
 * original in the site header is far too heavy for an inbox.
 *
 * Both templates use it TWICE (header band and footer). Neither placement is
 * allowed to be load-bearing: images are blocked by default in a lot of
 * inboxes, so the alt text is the business name and every fact around it is
 * real text. See `EmailShell` in lib/email/shell.tsx.
 */
export function emailLogoUrl(): string {
  return `${emailOrigin()}/logos/freds-plumbing-logo-email.png`;
}

/** Business facts as the templates want them. */
export function emailBrand(): EmailBrand {
  return {
    name: site.name,
    phone: site.phone,
    phoneHref: site.phoneHref,
    email: site.email,
    siteUrl: emailOrigin(),
    logoUrl: emailLogoUrl(),
    serviceArea: site.serviceArea,
    licenseNumber: site.licenseNumber,
    // DERIVED, never written out as "30+": the same rule the site uses, so
    // the figure in an inbox cannot drift from the figure on the page. An
    // email is the worst place for a stale claim — nobody revisits it.
    yearsInBusiness: derivedYearsInBusiness(site.foundedYear),
  };
}

/**
 * Where the internal notification goes. `LEAD_TO_EMAIL` is the current name;
 * `CONTACT_TO_EMAIL` is honoured because it was documented in .env.example
 * before this and may already be set on the host. Defaults to the business
 * address from data/site.ts.
 */
export function leadToAddress(): string {
  return (
    process.env.LEAD_TO_EMAIL?.trim() ||
    process.env.CONTACT_TO_EMAIL?.trim() ||
    site.email
  );
}

/**
 * Who the emails come FROM.
 *
 * ⚠️ Resend only accepts a `from` address on a domain VERIFIED in the Resend
 * dashboard. Until fredsplumbing.com is verified, the only address that
 * works is Resend's own test sender, which is therefore the default — so the
 * feature works out of the box and cutover is an env change, not a code
 * change. After verification set:
 *   LEAD_FROM_EMAIL="Fred's Plumbing <contact@fredsplumbing.com>"
 */
export function leadFromAddress(): string {
  return (
    process.env.LEAD_FROM_EMAIL?.trim() ||
    process.env.CONTACT_FROM_EMAIL?.trim() ||
    `${site.name} <onboarding@resend.dev>`
  );
}

/** Availability only — the key itself never leaves this module. */
export function hasResendApiKey(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}
