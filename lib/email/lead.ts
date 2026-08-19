import { CONTACT_METHOD_OPTIONS, URGENCY_OPTIONS } from "@/lib/validations";
import { responseTimeNote } from "@/lib/responseTime";
import type { DetailRow, EmailBrand } from "./shell";
import type { LeadNotificationEmailProps } from "@/emails/LeadNotificationEmail";
import type { CustomerConfirmationEmailProps } from "@/emails/CustomerConfirmationEmail";

/**
 * Turns a validated form submission into everything BOTH emails need.
 *
 * Two emails go out per submission, and they do different jobs:
 *   1. the internal notification to Fred's Plumbing — triage;
 *   2. the confirmation to the customer — reassurance, and only when they
 *      actually gave a usable email address.
 * They carry the SAME reference so a phone call about "FP-7K2QM" means the
 * same job to both of them. Ordering, failure handling and the double-send
 * guard live in lib/leadDelivery.tsx; this module is content only.
 *
 * This module is the ONLY place that knows the shape of a lead, and it is
 * built from the fields the three live forms actually submit — see
 * `lib/validations.ts`. Nothing is invented: an unrecognised key is still
 * rendered (with a humanised label) rather than dropped, because a lead the
 * business cannot read is a lead lost.
 */

/** A submission as it arrives from /api/contact. */
export interface Lead {
  /** Which form sent it: "contact-page" | "homepage-hero" | "final-cta". */
  source: string;
  /** Validated values, stringified. */
  fields: Record<string, string>;
  /** Absolute URL of the page it was submitted from, from the Referer. */
  pageUrl?: string;
  submittedAt: Date;
}

/** The internal notification: what to send, and to whom to reply. */
export interface PreparedNotification {
  subject: string;
  /** The customer's address — set as the notification's replyTo. */
  replyTo?: string;
  props: LeadNotificationEmailProps;
}

/** The customer confirmation. Absent when no usable address was submitted. */
export interface PreparedConfirmation {
  to: string;
  subject: string;
  /** The business address — a reply to the confirmation reaches Fred. */
  replyTo: string;
  props: CustomerConfirmationEmailProps;
}

export interface PreparedLead {
  /** Short reference, shared by both emails and the failure log. */
  reference: string;
  business: PreparedNotification;
  /**
   * `undefined` when the submission carried no usable email address. Every
   * live form requires one today, but the endpoint accepts a union of
   * schemas and a future form may not — a missing address skips the courtesy
   * email silently rather than failing the lead.
   */
  customer?: PreparedConfirmation;
  /**
   * The whole submission as text, for the LEAD_DELIVERY_FAILED log line.
   * Includes empty fields as "(blank)" so the log is a complete record.
   */
  plainSummary: string;
}

const TIME_ZONE = "America/Chicago";

const centralDate = new Intl.DateTimeFormat("en-US", {
  timeZone: TIME_ZONE,
  weekday: "short",
  month: "short",
  day: "numeric",
  year: "numeric",
});

const centralTime = new Intl.DateTimeFormat("en-US", {
  timeZone: TIME_ZONE,
  hour: "numeric",
  minute: "2-digit",
  timeZoneName: "short",
});

/**
 * Fred's is a DFW business — a UTC timestamp in a notification is one more
 * thing to convert while standing in a mechanical room.
 */
export function formatCentral(date: Date): string {
  return `${centralDate.format(date)} at ${centralTime.format(date)}`;
}

/** Short version for the preheader, where every character counts. */
export function formatCentralTimeOnly(date: Date): string {
  return centralTime.format(date);
}

/** Ordered because this is the order the notification email reads in. */
const FIELD_LABELS: Record<string, string> = {
  name: "Name",
  company: "Company",
  phone: "Phone",
  email: "Email",
  contactMethod: "Preferred contact",
  urgency: "Urgency",
  service: "Service needed",
  propertyType: "Property type",
  location: "Property address",
  referral: "How they found us",
};

const FIELD_ORDER = Object.keys(FIELD_LABELS);

/**
 * Fields the confirmation does NOT read back to the customer. "How they found
 * us" is answered for the business's benefit, not the customer's, and quoting
 * it back reads like being profiled. Everything else they typed is echoed, so
 * they can see exactly what landed.
 */
const CUSTOMER_HIDDEN_FIELDS = new Set(["referral"]);

/** Which form it came from, in words the business will recognise. */
const FORM_LABELS: Record<string, string> = {
  "contact-page": "Contact page — request a quote",
  "homepage-hero": "Homepage hero — need plumbing assistance",
  "final-cta": "Homepage closing form — request a quote",
  "website-form": "Website form",
};

const URGENCY_LABELS = new Map<string, string>(
  URGENCY_OPTIONS.map((option) => [option.value, option.label]),
);

const CONTACT_METHOD_LABELS = new Map<string, string>(
  CONTACT_METHOD_OPTIONS.map((option) => [option.value, option.label]),
);

/** "propertyType" → "Property type", for any key not in FIELD_LABELS. */
function humaniseKey(key: string): string {
  const spaced = key
    .replace(/[_-]+/g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1).toLowerCase();
}

/**
 * A tappable `tel:` URL. Submitted phone numbers are free text (the schema
 * only checks shape), so this normalises to E.164 where it safely can and
 * otherwise falls back to the digits as typed.
 */
export function telHref(raw: string): string | undefined {
  const trimmed = raw.trim();
  const digits = trimmed.replace(/\D/g, "");
  if (digits.length < 7) return undefined;
  if (digits.length === 10) return `tel:+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `tel:+${digits}`;
  return `tel:${trimmed.startsWith("+") ? "+" : ""}${digits}`;
}

/**
 * Whether an address is worth handing to the email provider.
 *
 * Not a re-validation of the form — the zod schemas already did that, and
 * every live form requires an email. This is the guard for the case the
 * sending rules call out: a submission that arrives WITHOUT a usable address
 * (a future form with an optional email field, or a lead replayed from a log)
 * must skip the confirmation silently, never throw and never take the lead
 * down with it. Deliberately conservative: one @, something either side, a
 * dot in the domain, no whitespace.
 */
export function isSendableEmail(value: string | undefined): value is string {
  const trimmed = (value ?? "").trim();
  if (!trimmed || trimmed.length > 254) return false;
  return /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/.test(trimmed);
}

function value(fields: Record<string, string>, key: string): string {
  return (fields[key] ?? "").trim();
}

/** Display value for a field whose stored value is an option code. */
function displayValue(key: string, raw: string): string {
  if (key === "urgency") return URGENCY_LABELS.get(raw) ?? raw;
  if (key === "contactMethod") return CONTACT_METHOD_LABELS.get(raw) ?? raw;
  return raw;
}

function hrefFor(key: string, raw: string): string | undefined {
  if (key === "phone") return telHref(raw);
  if (key === "email") return `mailto:${raw}`;
  return undefined;
}

/**
 * The homepage hero form submits firstName + lastName; the other two submit
 * a single `name`. Normalise to one display name so the subject line and the
 * details table read the same whichever form sent the lead.
 */
function displayName(fields: Record<string, string>): string {
  const single = value(fields, "name");
  if (single) return single;
  return [value(fields, "firstName"), value(fields, "lastName")]
    .filter(Boolean)
    .join(" ");
}

/**
 * First name only, for the confirmation's greeting. "Thanks, Marissa" reads
 * like a person wrote it; "Thanks, Marissa Delgado" reads like a mail merge.
 * Empty when nothing usable was submitted — the template drops the greeting
 * rather than addressing someone as "there".
 */
function firstNameOf(fields: Record<string, string>): string | undefined {
  const first = value(fields, "firstName") || displayName(fields).split(" ")[0];
  const trimmed = (first ?? "").trim();
  return trimmed.length > 0 && trimmed.length <= 40 ? trimmed : undefined;
}

/** Splits a free-text message into paragraphs; blank input yields none. */
function paragraphsOf(message: string): string[] {
  return message
    .split(/\n\s*\n|\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

/** Keeps a subject line readable when someone pastes a whole address in. */
function truncate(text: string, max: number): string {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length <= max ? clean : `${clean.slice(0, max - 1).trimEnd()}…`;
}

/**
 * The submitted fields as labelled rows.
 *
 * `audience: "customer"` drops the internal-only fields and strips the
 * `tel:`/`mailto:` links: the business email exists to be acted on from a
 * phone, but linking the customer's own number back at them just invites a
 * misdial.
 */
function buildRows(
  fields: Record<string, string>,
  audience: "business" | "customer" = "business",
): DetailRow[] {
  const name = displayName(fields);
  const rows: DetailRow[] = [];
  const rendered = new Set(["message", "firstName", "lastName"]);
  const forCustomer = audience === "customer";

  for (const key of FIELD_ORDER) {
    const raw = key === "name" ? name : value(fields, key);
    if (!raw) continue;
    rendered.add(key);
    if (forCustomer && CUSTOMER_HIDDEN_FIELDS.has(key)) continue;
    rows.push({
      label: FIELD_LABELS[key],
      value: displayValue(key, raw),
      href: forCustomer ? undefined : hrefFor(key, raw),
    });
  }

  // Anything the forms start sending that this map has not caught up with
  // still reaches the business, labelled as well as we can manage.
  for (const [key, raw] of Object.entries(fields)) {
    if (rendered.has(key)) continue;
    const trimmed = (raw ?? "").trim();
    if (!trimmed) continue;
    rows.push({ label: humaniseKey(key), value: trimmed });
  }

  return rows;
}

function buildSubject(
  fields: Record<string, string>,
  name: string,
  isEmergency: boolean,
  reference: string,
): string {
  // Phone triage: the words that matter go before the truncation point, so
  // the lead is identifiable from a notification preview alone. The reference
  // goes last — it is what you quote once you are already on the call, not
  // what you scan the inbox for.
  const qualifier =
    value(fields, "location") ||
    value(fields, "propertyType") ||
    value(fields, "service");
  const who = name || value(fields, "company") || "website enquiry";
  const lead = isEmergency ? "EMERGENCY service request" : "New service request";
  const body = qualifier
    ? `${lead} — ${truncate(who, 40)}, ${truncate(qualifier, 45)}`
    : `${lead} — ${truncate(who, 60)}`;
  return `${body} [${reference}]`;
}

/**
 * A complete, greppable text record of the submission. This is what gets
 * written to the log when delivery fails, so it has to be enough on its own
 * to call the customer back from — including the fields that came in blank,
 * and the reference the customer may already be holding.
 */
function buildPlainSummary(
  lead: Lead,
  name: string,
  reference: string,
): string {
  return [
    `reference: ${reference}`,
    // Only when the form did not submit a `name` field of its own (the
    // homepage hero splits it into firstName/lastName) — otherwise this
    // would print the same name twice.
    lead.fields.name ? null : `name (derived): ${name || "(blank)"}`,
    ...Object.entries(lead.fields).map(
      ([key, raw]) => `${key}: ${(raw ?? "").trim() || "(blank)"}`,
    ),
    `source: ${lead.source}`,
    `page: ${lead.pageUrl ?? "(unknown)"}`,
    `submitted: ${formatCentral(lead.submittedAt)} (${lead.submittedAt.toISOString()})`,
  ]
    .filter((line): line is string => line !== null)
    .join("\n");
}

export function prepareLead(
  lead: Lead,
  brand: EmailBrand,
  reference: string,
): PreparedLead {
  const { fields } = lead;
  const name = displayName(fields);
  const phone = value(fields, "phone");
  const email = value(fields, "email");
  const company = value(fields, "company");
  const service = value(fields, "service");
  const isEmergency = value(fields, "urgency") === "emergency";
  const formLabel = FORM_LABELS[lead.source] ?? humaniseKey(lead.source);
  const submittedAt = formatCentral(lead.submittedAt);

  // Left undefined when the Referer did not tell us which page it was: the
  // notification then omits the row instead of printing the form label twice
  // under two different headings.
  let pageLabel: string | undefined;
  if (lead.pageUrl) {
    try {
      const parsed = new URL(lead.pageUrl);
      pageLabel = `${parsed.pathname}${parsed.search}`;
    } catch {
      pageLabel = lead.pageUrl;
    }
  }

  const preheader = [
    phone || undefined,
    email || undefined,
    service || undefined,
    `submitted ${formatCentralTimeOnly(lead.submittedAt)}`,
  ]
    .filter(Boolean)
    .join(" · ");

  const business: PreparedNotification = {
    subject: buildSubject(fields, name, isEmergency, reference),
    replyTo: email || undefined,
    props: {
      brand,
      preheader,
      reference,
      customerName: name || company || "Website enquiry",
      company: company || undefined,
      isEmergency,
      customerPhone: phone || undefined,
      customerPhoneHref: phone ? telHref(phone) : undefined,
      customerEmail: email || undefined,
      rows: buildRows(fields),
      messageParagraphs: paragraphsOf(value(fields, "message")),
      submittedAt,
      formLabel,
      pageUrl: lead.pageUrl,
      pageLabel,
    },
  };

  const customer: PreparedConfirmation | undefined = isSendableEmail(email)
    ? {
        to: email,
        // Calm and recognisable: no "RE:", no manufactured urgency, nothing
        // that reads as marketing. Someone who has just filled in a form
        // should be able to tell at a glance that it worked.
        subject: `We've received your request — ${brand.name}`,
        replyTo: brand.email,
        props: {
          brand,
          preheader: `We've got your request (${reference}) and someone from our team will be in touch. Emergency? Call ${brand.phone}.`,
          reference,
          firstName: firstNameOf(fields),
          isEmergency,
          rows: buildRows(fields, "customer"),
          messageParagraphs: paragraphsOf(value(fields, "message")),
          submittedAt,
          // Empty until the client approves a figure — the panel renders
          // without it. See lib/responseTime.ts.
          responseTimeNote: responseTimeNote(),
        },
      }
    : undefined;

  return {
    reference,
    business,
    customer,
    plainSummary: buildPlainSummary(lead, name, reference),
  };
}
