/**
 * The response-time commitment — the ONE place the figure is written.
 *
 * ⚠️ UNAPPROVED, DELIBERATELY EMPTY. The customer-confirmation mockup carried
 * the line "Typical response: within one business hour during business
 * hours." The client has NOT approved that figure — it is the same open
 * question that kept a response time out of the Multi-Family FAQ answer and
 * out of the emergency band, so it is not being published from an email
 * either. Everything that would render it degrades to rendering nothing:
 * `CustomerConfirmationEmail`'s "What happens next" panel simply omits the
 * line and still reads correctly.
 *
 * WHEN THE CLIENT CONFIRMS: set the string here — e.g.
 *
 *   export const RESPONSE_TIME_COMMITMENT = "within one business hour during business hours";
 *
 * and it appears in the confirmation email immediately. It should then be
 * adopted in the same words by the other three places that have been waiting
 * on it, each reading THIS constant rather than retyping the figure:
 *   • the Multi-Family FAQ answer (Sanity `faqSet` — "How fast can you get here?")
 *   • the homepage emergency band
 *   • the /contact page details column
 * A response time that says one thing in an email and another on the site is
 * worse than none.
 */
export const RESPONSE_TIME_COMMITMENT = "";

/** The rendered sentence, or `undefined` when the figure is not approved. */
export function responseTimeNote(): string | undefined {
  const value = RESPONSE_TIME_COMMITMENT.trim();
  return value ? `Typical response: ${value}.` : undefined;
}
