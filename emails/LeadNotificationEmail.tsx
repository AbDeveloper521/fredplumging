import { Hr, Section, Text } from "@react-email/components";
import {
  CallToAction,
  DetailTable,
  EmailShell,
  type DetailRow,
  type EmailBrand,
} from "../lib/email/shell";
import { emailColors, emailFont, emailStyles } from "../lib/email/theme";

/**
 * INTERNAL notification — the email Fred's Plumbing receives when someone
 * submits a form. Built for phone triage: who, how to reach them, how urgent,
 * then the detail. `replyTo` is set to the customer's address by the sender
 * (lib/leadDelivery.tsx), so hitting reply writes to the customer.
 *
 * Pure and props-driven so React Email's preview server can render it — see
 * `PreviewProps` at the bottom and `npm run email`.
 */
export interface LeadNotificationEmailProps {
  brand: EmailBrand;
  preheader: string;
  /** Best available display name for the person who submitted. */
  customerName: string;
  company?: string;
  /** True when the submitted urgency was "emergency". */
  isEmergency: boolean;
  customerPhone?: string;
  customerPhoneHref?: string;
  customerEmail?: string;
  /** Every submitted field except the free-text message, already labelled. */
  rows: readonly DetailRow[];
  /** The free-text message, split into paragraphs. */
  messageParagraphs: readonly string[];
  /** Submission time, already formatted in US Central. */
  submittedAt: string;
  /** Which form it came from, e.g. "Contact page — request a quote". */
  formLabel: string;
  /** The page it was submitted from, absolute URL when known. */
  pageUrl?: string;
  pageLabel: string;
}

export function LeadNotificationEmail({
  brand,
  preheader,
  customerName,
  company,
  isEmergency,
  customerPhone,
  customerPhoneHref,
  customerEmail,
  rows,
  messageParagraphs,
  submittedAt,
  formLabel,
  pageUrl,
  pageLabel,
}: LeadNotificationEmailProps) {
  return (
    <EmailShell
      preheader={preheader}
      brand={brand}
      bandLabel={isEmergency ? "Emergency request" : "New service request"}
      footerNote="Sent automatically by the website contact forms. Reply to this email and your reply goes to the customer, not back to this inbox."
    >
      {isEmergency ? (
        <Section
          className="alert pad"
          bgcolor={emailColors.brand}
          style={{
            backgroundColor: emailColors.brand,
            padding: "14px 28px",
          }}
        >
          <Text
            style={{
              color: emailColors.white,
              fontFamily: emailFont,
              fontSize: "15px",
              fontWeight: 800,
              letterSpacing: "0.2px",
              lineHeight: "21px",
              margin: 0,
            }}
          >
            Marked as an emergency — they need someone now.
          </Text>
        </Section>
      ) : null}

      <Section className="pad" style={{ ...emailStyles.card, padding: "28px 28px 4px" }}>
        <Text style={emailStyles.eyebrow}>New lead</Text>
        <Text style={emailStyles.heading}>{customerName}</Text>
        {company ? (
          <Text
            style={{
              ...emailStyles.text,
              fontWeight: 600,
              color: emailColors.body,
              margin: "0 0 18px",
            }}
          >
            {company}
          </Text>
        ) : null}

        {customerPhoneHref && customerPhone ? (
          <Section style={{ margin: "0 0 10px" }}>
            <CallToAction
              href={customerPhoneHref}
              label={`Call ${customerPhone}`}
            />
          </Section>
        ) : null}
        {customerEmail ? (
          <Section style={{ margin: "0 0 18px" }}>
            <CallToAction
              href={`mailto:${customerEmail}`}
              label={`Email ${customerEmail}`}
              variant="dark"
            />
          </Section>
        ) : null}
      </Section>

      <Section className="pad" style={{ ...emailStyles.card, padding: "0 28px 4px" }}>
        <Hr
          style={{
            border: "none",
            borderTop: `1px solid ${emailColors.border}`,
            margin: "6px 0 18px",
          }}
        />
        <Text
          style={{
            ...emailStyles.eyebrow,
            color: emailColors.navy,
            margin: "0 0 14px",
          }}
        >
          What they submitted
        </Text>
        <DetailTable rows={rows} />

        {messageParagraphs.length > 0 ? (
          <Section
            bgcolor={emailColors.offwhite}
            style={{
              backgroundColor: emailColors.offwhite,
              borderLeft: `3px solid ${emailColors.brand}`,
              margin: "18px 0 4px",
              padding: "14px 16px",
            }}
          >
            <Text
              style={{
                color: emailColors.muted,
                fontFamily: emailFont,
                fontSize: "13px",
                fontWeight: 600,
                lineHeight: "20px",
                margin: "0 0 6px",
              }}
            >
              Details
            </Text>
            {messageParagraphs.map((paragraph, index) => (
              <Text
                key={index}
                style={{
                  color: emailColors.ink,
                  fontFamily: emailFont,
                  fontSize: "15px",
                  lineHeight: "23px",
                  margin:
                    index === messageParagraphs.length - 1 ? 0 : "0 0 10px",
                }}
              >
                {paragraph}
              </Text>
            ))}
          </Section>
        ) : null}
      </Section>

      <Section className="pad" style={{ ...emailStyles.card, padding: "18px 28px 26px" }}>
        <Hr
          style={{
            border: "none",
            borderTop: `1px solid ${emailColors.border}`,
            margin: "0 0 14px",
          }}
        />
        <Text style={{ ...emailStyles.small, margin: "0 0 4px" }}>
          Submitted {submittedAt}
        </Text>
        <Text style={{ ...emailStyles.small, margin: "0 0 4px" }}>
          Form: {formLabel}
        </Text>
        <Text style={{ ...emailStyles.small, margin: 0 }}>
          Page:{" "}
          {pageUrl ? (
            <a
              href={pageUrl}
              style={{ color: emailColors.muted, textDecoration: "underline" }}
            >
              {pageLabel}
            </a>
          ) : (
            pageLabel
          )}
        </Text>
      </Section>
    </EmailShell>
  );
}

/**
 * React Email's preview server resolves the DEFAULT export, which is why this
 * file carries one alongside the named export the rest of the codebase uses.
 */
export default LeadNotificationEmail;

LeadNotificationEmail.PreviewProps = {
  brand: {
    name: "Fred's Plumbing",
    phone: "972-564-9081",
    phoneHref: "tel:+19725649081",
    email: "contact@fredsplumbing.com",
    siteUrl: "https://fredplumging.vercel.app",
    logoUrl:
      "https://fredplumging.vercel.app/logos/freds-plumbing-logo-email.png",
    serviceArea: "Dallas–Fort Worth Metroplex",
  },
  preheader:
    "214-555-0148 · Drain & sewer · Oakline Apartments, Plano · submitted 4:12 PM CDT",
  customerName: "Marissa Delgado",
  company: "Cardinal Property Group",
  isEmergency: true,
  customerPhone: "214-555-0148",
  customerPhoneHref: "tel:+12145550148",
  customerEmail: "m.delgado@cardinalpg.com",
  rows: [
    { label: "Name", value: "Marissa Delgado" },
    { label: "Company", value: "Cardinal Property Group" },
    { label: "Phone", value: "214-555-0148", href: "tel:+12145550148" },
    {
      label: "Email",
      value: "m.delgado@cardinalpg.com",
      href: "mailto:m.delgado@cardinalpg.com",
    },
    { label: "Preferred contact", value: "Phone" },
    { label: "Urgency", value: "Emergency — need someone now" },
    { label: "Service needed", value: "Drain & Sewer" },
    { label: "Property type", value: "Apartment / multi-family" },
    {
      label: "Property address",
      value: "1420 Oakline Dr, Plano, TX 75024",
    },
    { label: "How they found us", value: "Referral from a colleague" },
  ],
  messageParagraphs: [
    "Main line backing up into two ground-floor units at Oakline Apartments. Residents are calling the office and we have had to shut the water off to building C.",
    "Property manager is on site until 6pm and can let your crew in.",
  ],
  submittedAt: "Tue, Aug 18, 2026 at 4:12 PM CDT",
  formLabel: "Contact page — request a quote",
  pageUrl: "https://fredplumging.vercel.app/contact",
  pageLabel: "/contact",
} satisfies LeadNotificationEmailProps;
