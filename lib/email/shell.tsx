import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import type { ReactNode } from "react";
import { emailColors, emailFont, emailStyles } from "./theme";

/**
 * The business facts an email needs. Passed in as props rather than imported
 * from `@/data/site` so the templates stay pure and render in React Email's
 * preview server (`npm run email`) with no app context — see each template's
 * `PreviewProps`.
 */
export interface EmailBrand {
  name: string;
  phone: string;
  /** `tel:` URL. */
  phoneHref: string;
  email: string;
  /** Absolute origin, no trailing slash. */
  siteUrl: string;
  /**
   * ABSOLUTE https URL — a relative path or a bundler import cannot load in
   * an inbox. See `emailOrigin()` in lib/email/config.ts.
   */
  logoUrl: string;
  serviceArea: string;
}

/**
 * The only CSS that cannot be inlined: media queries and the dark-mode
 * overrides. Kept deliberately short — everything else is an inline style.
 *
 * `.band` is the dark header. Several clients (Outlook.com via [data-ogsc],
 * Apple Mail, Gmail on Android) recolour backgrounds in dark mode, which is
 * how a navy band with a white wordmark becomes black-on-black or, worse,
 * white-on-white. Pinning it with !important plus the legacy `bgcolor`
 * attribute on the cell is the combination that survives the most clients.
 */
const headCss = `
  :root { color-scheme: light; supported-color-schemes: light; }
  body { margin:0; padding:0; width:100% !important; -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }
  /* NO global "table { border-collapse: collapse }" here. Every layout band
     is a <Section>, which puts its padding on the <table> element — and the
     CSS spec says padding is ignored on a collapsed-border table, so that
     one-line reset silently flattens the whole email to zero padding. The
     gaps it normally guards against are already handled by the cellspacing=0
     / cellpadding=0 attributes React Email emits on every table. The two
     tables that DO want collapsed borders set it inline. */
  img { border:0; outline:none; text-decoration:none; -ms-interpolation-mode:bicubic; }
  .band, .band td { background-color:${emailColors.navy} !important; }
  .band a, .band img, .band span, .band p { color:${emailColors.white} !important; }
  .alert, .alert td { background-color:${emailColors.brand} !important; }
  .alert span, .alert a, .alert p { color:${emailColors.white} !important; }
  @media (prefers-color-scheme: dark) {
    .band, .band td { background-color:${emailColors.navy} !important; }
    .alert, .alert td { background-color:${emailColors.brand} !important; }
  }
  [data-ogsc] .band, [data-ogsc] .band td { background-color:${emailColors.navy} !important; }
  [data-ogsc] .band p, [data-ogsc] .band a { color:${emailColors.white} !important; }
  [data-ogsc] .alert, [data-ogsc] .alert td { background-color:${emailColors.brand} !important; }
  [data-ogsc] .alert p, [data-ogsc] .alert a { color:${emailColors.white} !important; }
  @media only screen and (max-width: 600px) {
    .pad { padding-left:20px !important; padding-right:20px !important; }
  }
`;

interface EmailShellProps {
  /**
   * The grey line an inbox shows next to the subject. Always set it — left
   * unset, clients scrape whatever text happens to come first.
   */
  preheader: string;
  brand: EmailBrand;
  /** Small-caps label rendered under the logo in the dark band. */
  bandLabel: string;
  children: ReactNode;
  /** One line above the contact details, e.g. why this email was sent. */
  footerNote?: string;
}

export function EmailShell({
  preheader,
  brand,
  bandLabel,
  children,
  footerNote,
}: EmailShellProps) {
  return (
    <Html lang="en" dir="ltr">
      <Head>
        <meta name="color-scheme" content="light" />
        <meta name="supported-color-schemes" content="light" />
        <style
          type="text/css"
          // Authored above as a static string — no submitted or CMS value
          // ever reaches it.
          dangerouslySetInnerHTML={{ __html: headCss }}
        />
      </Head>
      <Preview>{preheader}</Preview>
      <Body style={emailStyles.body}>
        <Container style={emailStyles.container}>
          {/* Dark header band. The supplied logo's wordmark is pure white, so
              it only works on a dark ground — hence the band rather than a
              white header. `bgcolor` duplicates the inline style for the
              Word-rendered Outlooks that drop CSS backgrounds. */}
          <Section
            className="band pad"
            bgcolor={emailColors.navy}
            style={{
              backgroundColor: emailColors.navy,
              padding: "26px 28px 22px",
              textAlign: "center",
            }}
          >
            <Img
              src={brand.logoUrl}
              // Images are blocked by default in a lot of inboxes, so this alt
              // text IS the header for those readers — styled white and bold
              // so it still reads on the navy band.
              alt={brand.name}
              width={180}
              height={71}
              style={{
                display: "block",
                margin: "0 auto",
                color: emailColors.white,
                fontFamily: emailFont,
                fontSize: "20px",
                fontWeight: 800,
                lineHeight: "24px",
              }}
            />
            <Text
              style={{
                color: emailColors.white,
                fontFamily: emailFont,
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "1.6px",
                textTransform: "uppercase",
                margin: "14px 0 0",
              }}
            >
              {bandLabel}
            </Text>
          </Section>

          {/* Brand hairline between the band and the white card. */}
          <Section
            data-skip-in-text="true"
            bgcolor={emailColors.brand}
            style={{
              backgroundColor: emailColors.brand,
              fontSize: "1px",
              lineHeight: "4px",
            }}
          >
            <Text
              style={{
                margin: 0,
                fontSize: "1px",
                lineHeight: "4px",
                color: emailColors.brand,
              }}
            >
              &nbsp;
            </Text>
          </Section>

          {children}

          <Section
            className="pad"
            bgcolor={emailColors.offwhite}
            style={{
              backgroundColor: emailColors.offwhite,
              padding: "22px 28px 30px",
            }}
          >
            {footerNote ? (
              <Text style={{ ...emailStyles.small, margin: "0 0 14px" }}>
                {footerNote}
              </Text>
            ) : null}
            <Text
              style={{
                color: emailColors.navy,
                fontFamily: emailFont,
                fontSize: "15px",
                fontWeight: 800,
                margin: "0 0 6px",
              }}
            >
              {brand.name}
            </Text>
            <Text style={{ ...emailStyles.small, margin: "0 0 4px" }}>
              <Link href={brand.phoneHref} style={emailStyles.link}>
                {brand.phone}
              </Link>
              {" · "}
              <Link href={`mailto:${brand.email}`} style={emailStyles.link}>
                {brand.email}
              </Link>
            </Text>
            <Text style={{ ...emailStyles.small, margin: "0 0 12px" }}>
              {brand.serviceArea}
            </Text>
            <Hr
              style={{
                border: "none",
                borderTop: `1px solid ${emailColors.border}`,
                margin: "0 0 12px",
              }}
            />
            <Text style={{ ...emailStyles.small, margin: 0 }}>
              <Link
                href={brand.siteUrl}
                style={{ ...emailStyles.link, color: emailColors.muted }}
              >
                {brand.siteUrl.replace(/^https?:\/\//, "")}
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

/**
 * A full-width call to action. Hand-built rather than React Email's
 * `<Button>` so the clickable area is the whole cell in Outlook too — Word
 * ignores padding on an inline `<a>`, which shrinks the tap target to the
 * text itself on exactly the device this is aimed at.
 */
export function CallToAction({
  href,
  label,
  variant = "primary",
}: {
  href: string;
  label: string;
  variant?: "primary" | "dark";
}) {
  const background =
    variant === "primary" ? emailColors.brand : emailColors.navy;
  return (
    <table
      role="presentation"
      cellPadding={0}
      cellSpacing={0}
      border={0}
      width="100%"
      style={{ width: "100%", borderCollapse: "collapse" }}
    >
      <tbody>
        <tr>
          <td
            align="center"
            // `bgcolor` is a presentational attribute React's <td> types omit.
            // It stays because Word-rendered Outlook honours it in places
            // where it drops the CSS background and would otherwise paint a
            // white button with white text.
            {...({ bgcolor: background } as Record<string, string>)}
            style={{ backgroundColor: background, borderRadius: "8px" }}
          >
            <a
              href={href}
              style={{
                display: "block",
                padding: "15px 20px",
                color: emailColors.white,
                fontFamily: emailFont,
                fontSize: "16px",
                fontWeight: 700,
                lineHeight: "20px",
                textAlign: "center",
                textDecoration: "none",
              }}
            >
              {label}
            </a>
          </td>
        </tr>
      </tbody>
    </table>
  );
}

/** One `label: value` line of a submitted lead. */
export interface DetailRow {
  label: string;
  value: string;
  /** `tel:` / `mailto:` so the value is tappable from a phone. */
  href?: string;
}

/**
 * The submitted fields as a two-column table: labels in a fixed left column
 * so the values line up down the page. Values that carry an `href` (phone,
 * email) render as links — the whole point of the internal email is that it
 * can be acted on from a phone without retyping anything.
 */
export function DetailTable({ rows }: { rows: readonly DetailRow[] }) {
  return (
    <table
      role="presentation"
      // Targeted by the plain-text converter so this renders as an aligned
      // two-column block instead of one run-on line — see lib/leadDelivery.tsx.
      className="detail-table"
      cellPadding={0}
      cellSpacing={0}
      border={0}
      width="100%"
      style={{ width: "100%", borderCollapse: "collapse" }}
    >
      <tbody>
        {rows.map((row, index) => {
          const cell = {
            borderTop:
              index === 0 ? "none" : `1px solid ${emailColors.borderSoft}`,
            padding: index === 0 ? "0 0 11px" : "11px 0",
            verticalAlign: "top" as const,
          };
          return (
            <tr key={row.label}>
              <td
                style={{
                  ...cell,
                  width: "38%",
                  paddingRight: "12px",
                  color: emailColors.muted,
                  fontFamily: emailFont,
                  fontSize: "13px",
                  fontWeight: 600,
                  lineHeight: "21px",
                }}
              >
                {row.label}
              </td>
              <td
                style={{
                  ...cell,
                  color: emailColors.ink,
                  fontFamily: emailFont,
                  fontSize: "15px",
                  fontWeight: 600,
                  lineHeight: "22px",
                }}
              >
                {row.href ? (
                  <a
                    href={row.href}
                    style={{
                      color: emailColors.brand,
                      fontWeight: 700,
                      textDecoration: "underline",
                    }}
                  >
                    {row.value}
                  </a>
                ) : (
                  row.value
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
