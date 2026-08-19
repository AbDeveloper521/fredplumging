/**
 * Brand tokens for the transactional emails.
 *
 * Deliberately separate from `app/globals.css`: email clients do not run
 * Tailwind, custom properties, `@theme`, or web fonts, so every value an
 * email needs has to exist as a literal hex string and a system font stack.
 * These are the SAME brand colours as the site — the red is sampled from
 * `public/logos/freds-plumbing-logo.png` (its dominant pixel is #D32127,
 * 9,214 pixels; the site's `red-600` token, #d9272e, is a slightly brighter
 * screen-tuned variant of it), and the navy matches `navy-900`.
 */
export const emailColors = {
  /** Sampled from the logo artwork — the wordmark's own red. */
  brand: "#D32127",
  /** One step brighter, for text-on-navy where #D32127 is a little dense. */
  brandBright: "#EA3038",
  brandTint: "#FDEBEC",
  navy: "#0B1727",
  navyDeep: "#07111F",
  navyLine: "#1B3049",
  /**
   * Secondary text ON the navy bands (header chip, footer details). Pure
   * white for everything flattens the hierarchy; this still clears 7:1
   * against #0B1727, so it is readable rather than merely decorative.
   */
  onNavyMuted: "#9BA8B9",
  ink: "#111318",
  body: "#354052",
  muted: "#687383",
  border: "#CBD2DA",
  borderSoft: "#E4E8ED",
  offwhite: "#F7F8FA",
  white: "#FFFFFF",
} as const;

/**
 * No web fonts: Outlook renders through Word and Gmail strips @font-face,
 * so a downloaded font is a guaranteed inconsistency. System stack only.
 */
export const emailFont =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

/** Every email in this app is a single 600px column. */
export const EMAIL_WIDTH = 600;

/**
 * Only the styles shared by more than one place. Anything that belongs to a
 * single component (the card padding, the footer links) lives in that
 * component in lib/email/shell.tsx — a token nobody reads is the start of two
 * templates drifting apart.
 */
export const emailStyles = {
  body: {
    backgroundColor: emailColors.offwhite,
    fontFamily: emailFont,
    margin: 0,
    padding: 0,
  },
  container: {
    width: "100%",
    maxWidth: `${EMAIL_WIDTH}px`,
    margin: "0 auto",
  },
  heading: {
    color: emailColors.navy,
    fontFamily: emailFont,
    fontSize: "23px",
    lineHeight: "30px",
    fontWeight: 800,
    letterSpacing: "-0.4px",
    margin: "0 0 10px",
  },
  text: {
    color: emailColors.body,
    fontFamily: emailFont,
    fontSize: "16px",
    lineHeight: "25px",
    margin: "0 0 16px",
  },
  small: {
    color: emailColors.muted,
    fontFamily: emailFont,
    fontSize: "13px",
    lineHeight: "20px",
    margin: "0 0 6px",
  },
  eyebrow: {
    color: emailColors.brand,
    fontFamily: emailFont,
    fontSize: "12px",
    lineHeight: "16px",
    fontWeight: 700,
    letterSpacing: "1.2px",
    textTransform: "uppercase" as const,
    margin: "0 0 8px",
  },
} as const;
