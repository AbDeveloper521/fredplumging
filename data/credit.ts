/**
 * Build credit shown in the footer bottom bar.
 *
 * Deliberately NOT in Sanity: who built the site is a build fact, not
 * client-editable content, so it can't be blanked or rewritten from Studio.
 * The URL lives here alone — never inline in JSX — so it changes in one place.
 *
 * The anchor text stays exactly "Website by {name}". A plain designer credit
 * is normal; a keyword-rich site-wide footer link repeated across a portfolio
 * of client sites is a link scheme and would hurt both parties.
 */
export const SITE_CREDIT = {
  /** Muted lead-in, kept in the same tone as the rest of the bottom bar. */
  prefix: "Website by",
  /** The only part that reads as a brand — and the only part that links. */
  name: "ThemeTrek",
  href: "https://themetrek.com/quote",
} as const;
