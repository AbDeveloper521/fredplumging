import "server-only";
import { plainTextSelectors, render } from "@react-email/components";
import type { ReactElement } from "react";
import { Resend } from "resend";
import { LeadNotificationEmail } from "@/emails/LeadNotificationEmail";
import { CustomerConfirmationEmail } from "@/emails/CustomerConfirmationEmail";
import {
  emailBrand,
  hasResendApiKey,
  leadFromAddress,
  leadToAddress,
} from "@/lib/email/config";
import {
  fingerprintLead,
  previousDelivery,
  rememberDelivery,
} from "@/lib/email/dedupe";
import { prepareLead, type Lead, type PreparedLead } from "@/lib/email/lead";
import { createLeadReference } from "@/lib/email/reference";

/**
 * Lead transport — the ONE place a captured lead leaves the app, so the
 * provider can be swapped without touching the route or the forms.
 *
 * TWO emails go out per submission, in this order and with these rules:
 *
 *  1. The internal notification to Fred's Plumbing, `replyTo` the customer so
 *     hitting reply writes to them. FAILING THIS IS FATAL: this function
 *     throws, the visitor sees the error state with the phone number, and the
 *     complete submission is written to the log under LEAD_DELIVERY_FAILED.
 *     Telling someone with a burst line "request received" when nothing was
 *     sent is the exact bug this module exists to prevent.
 *
 *  2. The confirmation to the customer, `replyTo` the business so a reply
 *     reaches Fred. FAILING THIS IS NOT FATAL: it is logged and the
 *     submission still succeeds. The lead is what matters; a courtesy email
 *     that did not send is not worth showing an error to someone who did
 *     nothing wrong. It is sent SECOND for the same reason — never confirm to
 *     a customer that a request landed when nobody received it. It is skipped
 *     silently when no usable email address was submitted.
 *
 * Both carry the same short reference (see lib/email/reference.ts), which is
 * also in the notification's subject line and in every log line here, so a
 * phone call about "FP-7K2QM" means the same job to everyone holding it.
 *
 * ⚠️ RESEND_API_KEY is read here and handed straight to the SDK. It is never
 * logged, echoed, returned to the browser, or put in an error message.
 */

export type { Lead } from "@/lib/email/lead";

/** Grep this in Vercel's runtime logs to recover leads that did not send. */
const FAILURE_MARKER = "LEAD_DELIVERY_FAILED";
/** The non-fatal one: the lead DID reach the business, the courtesy did not. */
const CONFIRMATION_MARKER = "LEAD_CONFIRMATION_FAILED";

/** Last-resort dump if the lead could not even be formatted. */
function rawSummary(lead: Lead, reference: string): string {
  const fields = Object.entries(lead.fields)
    .map(([key, value]) => `${key}: ${(value ?? "").trim() || "(blank)"}`)
    .join("\n");
  return `reference: ${reference}\nsource: ${lead.source}\npage: ${lead.pageUrl ?? "(unknown)"}\n${fields}`;
}

function logFailure(
  reason: string,
  reference: string,
  body: string,
  subject?: string,
): void {
  console.error(
    [
      `${FAILURE_MARKER} reason=${reason} reference=${reference}`,
      "This lead was NOT emailed. Recover it from the fields below.",
      subject ? `subject: ${subject}` : null,
      body,
    ]
      .filter(Boolean)
      .join("\n"),
  );
}

/**
 * HTML plus its plain-text alternative, generated from the SAME element tree
 * so the two can never drift apart.
 *
 * The submitted fields and the confirmation's numbered steps are laid out
 * with tables, which the converter flattens into one run-on line
 * ("NameMarissa DelgadoCompanyCardinal…") unless it is told they are data.
 *
 * They are targeted BY CLASS here rather than by React Email's newer
 * `data-text-format="dataTable"` attribute, which the templates also carry.
 * The attribute is only honoured by @react-email/render 2.1+, and the copy
 * that actually renders these emails is the 2.0.6 one pinned inside
 * @react-email/components — whose default selector list does not include it.
 * Relying on the attribute alone silently reintroduced exactly the run-on
 * table this comment exists to prevent, so the class selectors stay until
 * the components package moves its pin.
 */
async function renderBoth(
  email: ReactElement,
): Promise<{ html: string; text: string }> {
  const [html, text] = await Promise.all([
    render(email),
    render(email, {
      plainText: true,
      htmlToTextOptions: {
        selectors: [
          ...plainTextSelectors,
          { selector: "table.detail-table", format: "dataTable" },
          { selector: "table.step-list", format: "dataTable" },
          // Otherwise every address prints twice — once as the link text
          // and again as "mailto:the-same-address".
          {
            selector: 'a[href^="mailto:"]',
            format: "anchor",
            options: { ignoreHref: true },
          },
          // Same for the tel: links on the phone numbers, and for the footer's
          // domain link, whose text is the bare host.
          {
            selector: 'a[href^="tel:"]',
            format: "anchor",
            options: { ignoreHref: true },
          },
          {
            selector: "a.site-link",
            format: "anchor",
            options: { ignoreHref: true },
          },
        ],
      },
    }),
  ]);
  return { html, text };
}

/**
 * Sends the lead. Resolves with the reference the submission was given, or
 * throws if the BUSINESS notification could not be delivered.
 */
export async function deliverLead(lead: Lead): Promise<string> {
  const fingerprint = fingerprintLead(lead);

  // Double-click, double-submit, client retry: the same lead arriving twice
  // must not put two notifications in the inbox. Only submissions that were
  // actually delivered are remembered, so a retry after a failure still gets
  // a real attempt. See lib/email/dedupe.ts for the honest caveats.
  const alreadyDelivered = previousDelivery(fingerprint);
  if (alreadyDelivered) {
    console.info(
      `[LEAD] duplicate suppressed reference=${alreadyDelivered} source=${lead.source}`,
    );
    return alreadyDelivered;
  }

  const reference = createLeadReference();

  let prepared: PreparedLead;
  try {
    prepared = prepareLead(lead, emailBrand(), reference);
  } catch (error) {
    // Formatting must never be the reason a lead disappears.
    logFailure("prepare-failed", reference, rawSummary(lead, reference));
    throw error instanceof Error ? error : new Error("Lead preparation failed");
  }

  if (!hasResendApiKey()) {
    logFailure(
      "missing-RESEND_API_KEY",
      reference,
      prepared.plainSummary,
      prepared.business.subject,
    );
    throw new Error("RESEND_API_KEY is not configured");
  }

  let notification: { html: string; text: string };
  try {
    notification = await renderBoth(
      <LeadNotificationEmail {...prepared.business.props} />,
    );
  } catch (error) {
    const reason = error instanceof Error ? error.message : "unknown";
    logFailure(
      `render-failed: ${reason}`,
      reference,
      prepared.plainSummary,
      prepared.business.subject,
    );
    throw new Error("Lead notification could not be rendered");
  }

  const to = leadToAddress();
  const from = leadFromAddress();
  const resend = new Resend(process.env.RESEND_API_KEY);

  let result;
  try {
    result = await resend.emails.send({
      from,
      to: [to],
      // The single most useful line in the whole flow: Fred hits reply and
      // he is writing to the customer, not to his own inbox.
      replyTo: prepared.business.replyTo,
      subject: prepared.business.subject,
      html: notification.html,
      text: notification.text,
    });
  } catch (error) {
    // Network/DNS/timeout — the SDK threw rather than returning an error.
    const reason = error instanceof Error ? error.message : "unknown";
    logFailure(
      `resend-threw: ${reason}`,
      reference,
      prepared.plainSummary,
      prepared.business.subject,
    );
    throw new Error("Lead notification could not be sent");
  }

  if (result.error) {
    // Resend's own rejection — an unverified sending domain lands here.
    // Provider text is logged, never returned to the browser.
    logFailure(
      `resend-rejected: ${result.error.name}: ${result.error.message}`,
      reference,
      prepared.plainSummary,
      prepared.business.subject,
    );
    throw new Error("Lead notification was rejected by the email provider");
  }

  rememberDelivery(fingerprint, reference);
  console.info(
    `[LEAD] delivered id=${result.data?.id ?? "unknown"} reference=${reference} source=${lead.source} to=${to}`,
  );

  await sendConfirmation(prepared, resend, from);

  return reference;
}

/**
 * The customer's copy. Everything in here is best-effort by design: it cannot
 * throw, and nothing it does can affect the lead that has already been
 * delivered.
 */
async function sendConfirmation(
  prepared: PreparedLead,
  resend: Resend,
  from: string,
): Promise<void> {
  const { customer, reference } = prepared;

  if (!customer) {
    // Not an error. Every live form requires an email address today, so this
    // is the guard for a form that stops requiring one.
    console.info(
      `[LEAD] confirmation skipped reference=${reference} reason=no-usable-email`,
    );
    return;
  }

  try {
    const confirmation = await renderBoth(
      <CustomerConfirmationEmail {...customer.props} />,
    );
    const result = await resend.emails.send({
      from,
      to: [customer.to],
      // A reply to the confirmation should reach the business, not vanish.
      replyTo: customer.replyTo,
      subject: customer.subject,
      html: confirmation.html,
      text: confirmation.text,
    });
    if (result.error) {
      console.warn(
        `${CONFIRMATION_MARKER} reason=resend-rejected: ${result.error.name}: ${result.error.message} reference=${reference} to=${customer.to}\n` +
          "The lead itself WAS delivered to the business — no action needed for the lead, only the customer's courtesy copy is missing.",
      );
      return;
    }
    console.info(
      `[LEAD] confirmation sent id=${result.data?.id ?? "unknown"} reference=${reference} to=${customer.to}`,
    );
  } catch (error) {
    const reason = error instanceof Error ? error.message : "unknown";
    console.warn(
      `${CONFIRMATION_MARKER} reason=${reason} reference=${reference} to=${customer.to}\n` +
        "The lead itself WAS delivered to the business — no action needed for the lead, only the customer's courtesy copy is missing.",
    );
  }
}
