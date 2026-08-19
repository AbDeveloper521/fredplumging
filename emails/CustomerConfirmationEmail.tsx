import { Text } from "@react-email/components";
import {
  CallToAction,
  Card,
  CheckBadge,
  DetailTable,
  Divider,
  EmailShell,
  Eyebrow,
  Panel,
  PanelText,
  StepList,
  type DetailRow,
  type EmailBrand,
} from "../lib/email/shell";
import { emailColors, emailFont, emailStyles } from "../lib/email/theme";

/**
 * CUSTOMER confirmation — the email the person who filled in the form
 * receives.
 *
 * Its job is reassurance: they have just handed over their phone number and
 * their problem, and they want to know it landed. So: a tick, exactly what
 * they sent read back to them, what happens next, and the phone number where
 * it cannot be missed — because someone with a burst line should be calling,
 * not sitting in an inbox waiting for a reply.
 *
 * TRANSACTIONAL, not marketing. No offers, no newsletter, no cross-sell, and
 * nothing that would need an unsubscribe link to be legitimate. It contains
 * what they submitted and how to reach the business, and that is all.
 *
 * `replyTo` is the BUSINESS address (set in lib/leadDelivery.tsx), so a
 * customer who just hits reply reaches Fred rather than a no-reply void.
 *
 * Pure and props-driven so React Email's preview server can render it — see
 * `PreviewProps` at the bottom and `npm run email`.
 */
export interface CustomerConfirmationEmailProps {
  brand: EmailBrand;
  preheader: string;
  /** Shared with the business notification for the same submission. */
  reference: string;
  /** First name only — omitted when nothing usable was submitted. */
  firstName?: string;
  /** True when the submitted urgency was "emergency". */
  isEmergency: boolean;
  /** What they submitted, read back to them. */
  rows: readonly DetailRow[];
  /** Their free-text message, split into paragraphs. */
  messageParagraphs: readonly string[];
  /** Submission time, already formatted in US Central. */
  submittedAt: string;
  /**
   * "Typical response: …" — rendered only when the client has approved a
   * figure. Undefined today, and the panel below reads correctly without it.
   * See lib/responseTime.ts.
   */
  responseTimeNote?: string;
}

export function CustomerConfirmationEmail({
  brand,
  preheader,
  reference,
  firstName,
  isEmergency,
  rows,
  messageParagraphs,
  submittedAt,
  responseTimeNote,
}: CustomerConfirmationEmailProps) {
  const steps = [
    "We review the details you sent.",
    "Someone from our team contacts you to confirm the details and arrange a time.",
    `Quote your reference, ${reference}, if you call us before then.`,
  ];

  return (
    <EmailShell
      preheader={preheader}
      brand={brand}
      bandLabel="Request received"
      reference={reference}
      footerNote={`You're receiving this because a request was submitted at ${brand.siteUrl.replace(/^https?:\/\//, "")}. It's a one-off confirmation, not a marketing email — reply to it and your reply reaches our team.`}
    >
      <Card padding="30px 28px 6px">
        <CheckBadge />
        <Text style={emailStyles.heading}>
          {firstName
            ? `Thanks, ${firstName} — we've got your request.`
            : "Thanks — we've got your request."}
        </Text>
        <Text style={{ ...emailStyles.text, margin: "0 0 6px" }}>
          Your request reached {brand.name} on {submittedAt}. There is nothing
          else you need to do right now — the details you sent are below, so
          you can check we have them right.
        </Text>
      </Card>

      {/* High in the email on purpose. A confirmation that quietly buries the
          phone number is the wrong email to send someone standing in water. */}
      <Card padding="16px 28px 6px">
        <Panel tone="alert" margin="0" title="Need someone now?">
          <PanelText margin="0 0 12px">
            {isEmergency
              ? "You marked this as an emergency. Don't wait for a reply to this email — call us and we'll get a technician moving. The line is answered 24/7."
              : "If water is running, a line is backing up, or the building has no water, call us rather than waiting on this email. The line is answered 24/7."}
          </PanelText>
          <CallToAction
            href={brand.phoneHref}
            label={`Call ${brand.phone}`}
          />
        </Panel>
      </Card>

      <Card padding="18px 28px 6px">
        <Divider margin="0 0 18px" />
        <Eyebrow tone="navy">What you sent us</Eyebrow>
        <DetailTable rows={rows} />

        {messageParagraphs.length > 0 ? (
          <Panel title="What you told us">
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

      <Card padding="18px 28px 30px">
        <Divider margin="0 0 18px" />
        <Eyebrow tone="navy">What happens next</Eyebrow>
        <StepList steps={steps} />
        {responseTimeNote ? (
          <Text
            style={{
              color: emailColors.body,
              fontFamily: emailFont,
              fontSize: "14px",
              fontWeight: 600,
              lineHeight: "21px",
              margin: "14px 0 0",
            }}
          >
            {responseTimeNote}
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
export default CustomerConfirmationEmail;

CustomerConfirmationEmail.PreviewProps = {
  brand: {
    name: "Fred's Plumbing",
    phone: "972-564-9081",
    phoneHref: "tel:+19725649081",
    email: "contact@fredsplumbing.com",
    siteUrl: "https://fredplumging.vercel.app",
    logoUrl:
      "https://fredplumging.vercel.app/logos/freds-plumbing-logo-email.png",
    serviceArea: "Dallas–Fort Worth Metroplex",
    licenseNumber: "RMP 44890",
    yearsInBusiness: "30+",
  },
  preheader:
    "We've got your request (FP-7K2QM) and someone from our team will be in touch. Emergency? Call 972-564-9081.",
  reference: "FP-7K2QM",
  firstName: "Marissa",
  isEmergency: true,
  rows: [
    { label: "Name", value: "Marissa Delgado" },
    { label: "Company", value: "Cardinal Property Group" },
    { label: "Phone", value: "214-555-0148" },
    { label: "Email", value: "m.delgado@cardinalpg.com" },
    { label: "Preferred contact", value: "Phone" },
    { label: "Urgency", value: "Emergency — need someone now" },
    { label: "Service needed", value: "Drain & Sewer" },
    { label: "Property type", value: "Apartment / multi-family" },
    { label: "Property address", value: "1420 Oakline Dr, Plano, TX 75024" },
  ],
  messageParagraphs: [
    "Main line backing up into two ground-floor units at Oakline Apartments. Residents are calling the office and we have had to shut the water off to building C.",
    "Property manager is on site until 6pm and can let your crew in.",
  ],
  submittedAt: "Tue, Aug 18, 2026 at 4:12 PM CDT",
  // Deliberately absent: the "within one business hour" figure in the mockup
  // is not an approved claim yet. See lib/responseTime.ts.
  responseTimeNote: undefined,
} satisfies CustomerConfirmationEmailProps;
