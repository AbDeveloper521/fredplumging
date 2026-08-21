import { Section, Text } from "@react-email/components";
import {
  CallToAction,
  Card,
  DetailTable,
  Divider,
  EmailShell,
  Eyebrow,
  Panel,
  PanelText,
  type DetailRow,
  type EmailBrand,
} from "../lib/email/shell";
import { emailColors, emailFont, emailStyles } from "../lib/email/theme";

/**
 * INTERNAL notification — the email Fred's Plumbing receives when someone
 * submits a form.
 *
 * Its job is TRIAGE SPEED, and that is the whole reason it is not just the
 * customer confirmation with different words. Fred is reading this on a phone,
 * possibly under a sink: who, where, what, how urgent, one tap to call. So it
 * shares the confirmation's header band, footer, buttons, detail rows and
 * panels — the visual system — and deliberately NONE of its reassurance
 * furniture. No confirmation tick. No "what happens next". No "we'll be in
 * touch shortly": he is the one being got in touch with. If a reassurance
 * block ever turns up in here, it came from copy-paste, not from a decision.
 *
 * `replyTo` is set to the customer's address by the sender
 * (lib/leadDelivery.tsx), so hitting reply writes to the customer.
 *
 * Pure and props-driven so React Email's preview server can render it — see
 * `PreviewProps` at the bottom and `npm run email`.
 */
export interface LeadNotificationEmailProps {
  brand: EmailBrand;
  preheader: string;
  /** Shared with the customer's confirmation for the same submission. */
  reference: string;
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
  /** Path of that page. Undefined when the Referer did not say. */
  pageLabel?: string;
}

export function LeadNotificationEmail({
  brand,
  preheader,
  reference,
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
      reference={reference}
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

      <Card padding="28px 28px 4px">
        <Eyebrow>New lead</Eyebrow>
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
      </Card>

      <Card padding="0 28px 4px">
        <Divider margin="6px 0 18px" />
        <Eyebrow tone="navy">What they submitted</Eyebrow>
        <DetailTable rows={rows} />

        {messageParagraphs.length > 0 ? (
          <Panel title="Details">
            {messageParagraphs.map((paragraph, index) => (
              <PanelText
                key={index}
                margin={index === messageParagraphs.length - 1 ? "0" : "0 0 10px"}
              >
                {paragraph}
              </PanelText>
            ))}
          </Panel>
        ) : null}
      </Card>

      <Card padding="18px 28px 26px">
        <Divider margin="0 0 14px" />
        <Text style={{ ...emailStyles.small, margin: "0 0 4px" }}>
          Reference {reference}
        </Text>
        <Text style={{ ...emailStyles.small, margin: "0 0 4px" }}>
          Submitted {submittedAt}
        </Text>
        <Text style={{ ...emailStyles.small, margin: pageLabel ? "0 0 4px" : 0 }}>
          Form: {formLabel}
        </Text>
        {/* Only when the Referer told us. Without it this row used to repeat
            the form label under a second heading, which reads like a bug. */}
        {pageLabel ? (
          <Text style={{ ...emailStyles.small, margin: 0 }}>
            Page:{" "}
            {pageUrl ? (
              <a
                href={pageUrl}
                style={{
                  color: emailColors.muted,
                  textDecoration: "underline",
                }}
              >
                {pageLabel}
              </a>
            ) : (
              pageLabel
            )}
          </Text>
        ) : null}
      </Card>
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
    siteUrl: "https://fredsplumbing.com",
    logoUrl: "https://fredsplumbing.com/logos/freds-plumbing-logo-email.png",
    serviceArea: "Dallas–Fort Worth Metroplex",
    licenseNumber: "RMP 44890",
    yearsInBusiness: "30+",
  },
  preheader:
    "214-555-0148 · Drain & sewer · Oakline Apartments, Plano · submitted 4:12 PM CDT",
  reference: "FP-7K2QM",
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
  pageUrl: "https://fredsplumbing.com/contact",
  pageLabel: "/contact",
} satisfies LeadNotificationEmailProps;
