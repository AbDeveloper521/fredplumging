import "server-only";

/**
 * Lead transport — the ONE place a captured lead leaves the app, so the
 * mechanism is swappable without touching the route or the forms.
 *
 * - With RESEND_API_KEY + CONTACT_TO_EMAIL set: the lead is emailed via
 *   Resend's REST API (plain fetch — deliberately no npm dependency).
 * - Without them: the lead is written to the server log in a greppable
 *   format and delivery "succeeds". That degrades to "lead is recoverable
 *   from Vercel logs", which is strictly better than the mock it replaces
 *   (which silently discarded every enquiry while telling the customer it
 *   went through).
 */

export interface Lead {
  /** Which form sent it, e.g. "contact-page", "hero", "final-cta". */
  source: string;
  fields: Record<string, string>;
}

const RESEND_ENDPOINT = "https://api.resend.com/emails";

function emailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.CONTACT_TO_EMAIL);
}

// One-time startup visibility: a missing transport must be a known gap, not
// a silent one. Availability only — never the key itself.
let warnedOnce = false;
function warnOnceIfUnconfigured(): void {
  if (warnedOnce || emailConfigured()) return;
  warnedOnce = true;
  console.warn(
    "[LEAD DELIVERY] RESEND_API_KEY / CONTACT_TO_EMAIL are not set — leads are " +
      "logged to the server console instead of emailed. Grep for [LEAD] in the " +
      "host's runtime logs to recover them.",
  );
}

function formatLines(lead: Lead): string {
  return Object.entries(lead.fields)
    .filter(([, value]) => value !== "")
    .map(([key, value]) => `${key}: ${value}`)
    .join("\n");
}

/**
 * Delivers a lead. Resolves on success; throws when the configured email
 * transport fails (the route turns that into a 502 so the visitor is told
 * to call instead of being shown a false success).
 */
export async function deliverLead(lead: Lead): Promise<void> {
  warnOnceIfUnconfigured();

  if (!emailConfigured()) {
    // Greppable, one block per lead. This is the fallback of record.
    console.warn(
      `[LEAD] source=${lead.source} received=${new Date().toISOString()}\n${formatLines(lead)}`,
    );
    return;
  }

  const from =
    process.env.CONTACT_FROM_EMAIL ?? "leads@notifications.invalid";
  const response = await fetch(RESEND_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [process.env.CONTACT_TO_EMAIL],
      subject: `New website lead (${lead.source}): ${lead.fields.name ?? "unknown"}`,
      text: formatLines(lead),
    }),
  });

  if (!response.ok) {
    // Status only — the response body could echo addresses; the lead itself
    // is re-logged so it is never lost even when email fails.
    console.error(
      `[LEAD DELIVERY] Resend returned ${response.status} — falling back to log.\n` +
        `[LEAD] source=${lead.source}\n${formatLines(lead)}`,
    );
    throw new Error(`Lead email failed with status ${response.status}`);
  }
}
