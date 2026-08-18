import "server-only";
import { plainTextSelectors, render } from "@react-email/components";
import { Resend } from "resend";
import { LeadNotificationEmail } from "@/emails/LeadNotificationEmail";
import {
  emailBrand,
  hasResendApiKey,
  leadFromAddress,
  leadToAddress,
} from "@/lib/email/config";
import { prepareLead, type Lead, type PreparedLead } from "@/lib/email/lead";

/**
 * Lead transport — the ONE place a captured lead leaves the app, so the
 * provider can be swapped without touching the route or the forms.
 *
 * ONE email goes out per submission: the internal notification to Fred's
 * Plumbing, with `replyTo` set to the customer so hitting reply writes to
 * them. The customer is NOT sent a confirmation — the on-page success state
 * is their receipt.
 *
 * The contract with the caller is deliberately blunt: this function either
 * resolves because the email provider accepted the message, or it throws.
 * It never resolves on a lead it failed to deliver — telling someone with a
 * burst line "request received" when nothing was sent is the exact bug this
 * module exists to prevent. Every failure also writes the complete
 * submission to the log under LEAD_DELIVERY_FAILED so it can be recovered
 * from the host's runtime logs and called back by hand.
 *
 * ⚠️ RESEND_API_KEY is read here and handed straight to the SDK. It is never
 * logged, echoed, returned to the browser, or put in an error message.
 */

export type { Lead } from "@/lib/email/lead";

/** Grep this in Vercel's runtime logs to recover leads that did not send. */
const FAILURE_MARKER = "LEAD_DELIVERY_FAILED";

/** Last-resort dump if the lead could not even be formatted. */
function rawSummary(lead: Lead): string {
  const fields = Object.entries(lead.fields)
    .map(([key, value]) => `${key}: ${(value ?? "").trim() || "(blank)"}`)
    .join("\n");
  return `source: ${lead.source}\npage: ${lead.pageUrl ?? "(unknown)"}\n${fields}`;
}

function logFailure(reason: string, body: string, subject?: string): void {
  console.error(
    [
      `${FAILURE_MARKER} reason=${reason}`,
      "This lead was NOT emailed. Recover it from the fields below.",
      subject ? `subject: ${subject}` : null,
      body,
    ]
      .filter(Boolean)
      .join("\n"),
  );
}

export async function deliverLead(lead: Lead): Promise<void> {
  let prepared: PreparedLead;
  try {
    prepared = prepareLead(lead, emailBrand());
  } catch (error) {
    // Formatting must never be the reason a lead disappears.
    logFailure("prepare-failed", rawSummary(lead));
    throw error instanceof Error ? error : new Error("Lead preparation failed");
  }

  if (!hasResendApiKey()) {
    logFailure(
      "missing-RESEND_API_KEY",
      prepared.plainSummary,
      prepared.subject,
    );
    throw new Error("RESEND_API_KEY is not configured");
  }

  let html: string;
  let text: string;
  try {
    const email = <LeadNotificationEmail {...prepared.notification} />;
    // The plain-text alternative is generated from the same tree as the HTML,
    // so the two can never drift apart. The submitted fields are laid out
    // with tables, which the default converter flattens into one run-on line
    // ("NameMarissa DelgadoCompanyCardinal…") — `dataTable` keeps them as an
    // aligned two-column block.
    [html, text] = await Promise.all([
      render(email),
      render(email, {
        plainText: true,
        htmlToTextOptions: {
          selectors: [
            ...plainTextSelectors,
            { selector: "table.detail-table", format: "dataTable" },
            // Otherwise every address prints twice — once as the link text
            // and again as "mailto:the-same-address".
            { selector: 'a[href^="mailto:"]', format: "anchor", options: { ignoreHref: true } },
          ],
        },
      }),
    ]);
  } catch (error) {
    const reason = error instanceof Error ? error.message : "unknown";
    logFailure(
      `render-failed: ${reason}`,
      prepared.plainSummary,
      prepared.subject,
    );
    throw new Error("Lead notification could not be rendered");
  }

  const to = leadToAddress();
  let result;
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    result = await resend.emails.send({
      from: leadFromAddress(),
      to: [to],
      // The single most useful line in the whole flow: Fred hits reply and
      // he is writing to the customer, not to his own inbox.
      replyTo: prepared.replyTo,
      subject: prepared.subject,
      html,
      text,
    });
  } catch (error) {
    // Network/DNS/timeout — the SDK threw rather than returning an error.
    const reason = error instanceof Error ? error.message : "unknown";
    logFailure(
      `resend-threw: ${reason}`,
      prepared.plainSummary,
      prepared.subject,
    );
    throw new Error("Lead notification could not be sent");
  }

  if (result.error) {
    // Resend's own rejection — an unverified sending domain lands here.
    // Provider text is logged, never returned to the browser.
    logFailure(
      `resend-rejected: ${result.error.name}: ${result.error.message}`,
      prepared.plainSummary,
      prepared.subject,
    );
    throw new Error("Lead notification was rejected by the email provider");
  }

  console.info(
    `[LEAD] delivered id=${result.data?.id ?? "unknown"} source=${lead.source} to=${to}`,
  );
}
