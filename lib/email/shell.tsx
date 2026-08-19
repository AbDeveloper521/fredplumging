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
 * THE shared email design system. Both transactional emails — the internal
 * lead notification and the customer confirmation — are assembled entirely
 * from the pieces in this file: the dark header band, the navy footer, the
 * buttons, the detail rows and the panels. Nothing here is specific to either
 * one.
 *
 * That is the whole point. Two templates that each own their own padding and
 * their own idea of "the red" is how a brand looks sloppy six months later,
 * and it is how the logo ends up 8px smaller in one email than the other. If
 * a template needs a new visual element, add it HERE and let both use it.
 *
 * The two emails share this look but do NOT share a job:
 *   • Customer confirmation — reassurance. Tick, what-you-sent, what happens
 *     next, and the emergency number where it cannot be missed.
 *   • Business notification — triage speed. Who, where, what, how urgent, one
 *     tap to call. No reassurance blocks; Fred does not need reassuring, he
 *     needs to dispatch. See each template's header comment.
 */

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
  /** State plumbing licence, e.g. "RMP 44890". */
  licenseNumber: string;
  /**
   * Years-in-business figure, e.g. "30+". DERIVED from `foundedYear` by
   * lib/yearsInBusiness.ts — never a literal, or it goes stale in an inbox
   * where nobody will ever see it to correct it.
   */
  yearsInBusiness: string;
}

/**
 * The only CSS that cannot be inlined: media queries and the dark-mode
 * overrides. Kept deliberately short — everything else is an inline style.
 *
 * `.band` is the dark header, `.footerband` the dark footer. Several clients
 * (Outlook.com via [data-ogsc], Apple Mail, Gmail on Android) recolour
 * backgrounds in dark mode, which is how a navy band with a white wordmark
 * becomes black-on-black or, worse, white-on-white. Pinning them with
 * !important plus the legacy `bgcolor` attribute on the cell is the
 * combination that survives the most clients.
 *
 * `.dim` is the secondary text inside the footer band. Its rule is two
 * classes deep so it outranks the blanket "everything in the band is white"
 * rule above it — without it, forcing the band's text white would flatten the
 * footer's hierarchy into one shouty block.
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
  .footerband, .footerband td { background-color:${emailColors.navyDeep} !important; }
  .footerband a, .footerband img, .footerband span, .footerband p { color:${emailColors.white} !important; }
  .footerband .dim, .footerband .dim a, .footerband .dim span { color:${emailColors.onNavyMuted} !important; }
  .alert, .alert td { background-color:${emailColors.brand} !important; }
  .alert span, .alert a, .alert p { color:${emailColors.white} !important; }
  @media (prefers-color-scheme: dark) {
    .band, .band td { background-color:${emailColors.navy} !important; }
    .footerband, .footerband td { background-color:${emailColors.navyDeep} !important; }
    .alert, .alert td { background-color:${emailColors.brand} !important; }
  }
  [data-ogsc] .band, [data-ogsc] .band td { background-color:${emailColors.navy} !important; }
  [data-ogsc] .band p, [data-ogsc] .band a { color:${emailColors.white} !important; }
  [data-ogsc] .footerband, [data-ogsc] .footerband td { background-color:${emailColors.navyDeep} !important; }
  [data-ogsc] .footerband p, [data-ogsc] .footerband a { color:${emailColors.white} !important; }
  [data-ogsc] .footerband .dim, [data-ogsc] .footerband .dim a { color:${emailColors.onNavyMuted} !important; }
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
  /**
   * The request reference, e.g. "FP-7K2QM" — the SAME value in both emails
   * for one submission, so the customer and the business are talking about
   * the same job on the phone. See lib/email/reference.ts.
   */
  reference: string;
  children: ReactNode;
  /** One line above the contact details, e.g. why this email was sent. */
  footerNote?: string;
}

export function EmailShell({
  preheader,
  brand,
  bandLabel,
  reference,
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
            <ReferenceChip reference={reference} />
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

          <EmailFooter brand={brand} footerNote={footerNote} />
        </Container>
      </Body>
    </Html>
  );
}

/**
 * The reference, as a bordered chip in the header band. Monospace so the
 * characters are unambiguous when someone reads them down a phone line —
 * Consolas covers the Word-rendered Outlooks, Menlo/SF Mono the Apple
 * clients, and the generic `monospace` everything else.
 */
function ReferenceChip({ reference }: { reference: string }) {
  return (
    <table
      role="presentation"
      cellPadding={0}
      cellSpacing={0}
      border={0}
      align="center"
      style={{ margin: "12px auto 0", borderCollapse: "collapse" }}
    >
      <tbody>
        <tr>
          <td
            {...({ bgcolor: emailColors.navyDeep } as Record<string, string>)}
            style={{
              backgroundColor: emailColors.navyDeep,
              border: `1px solid ${emailColors.navyLine}`,
              borderRadius: "6px",
              padding: "7px 14px",
            }}
          >
            <span
              style={{
                color: emailColors.white,
                fontFamily:
                  "'SFMono-Regular', Consolas, Menlo, 'Liberation Mono', monospace",
                fontSize: "13px",
                fontWeight: 700,
                letterSpacing: "1px",
                lineHeight: "17px",
              }}
            >
              Request #{reference}
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  );
}

/**
 * The navy footer. It carries the logo a second time, which is a problem
 * worth being explicit about: with images blocked — the default in a lot of
 * inboxes — an image-only footer is a black rectangle with nothing in it. So
 * the logo's alt text is the business name, styled white and bold, and every
 * other line here is real text: phone, email, service area, licence, years,
 * domain. Images off, this footer still says who sent the email and how to
 * reach them.
 */
function EmailFooter({
  brand,
  footerNote,
}: {
  brand: EmailBrand;
  footerNote?: string;
}) {
  return (
    <Section
      className="footerband pad"
      bgcolor={emailColors.navyDeep}
      style={{
        backgroundColor: emailColors.navyDeep,
        padding: "26px 28px 30px",
        textAlign: "center",
      }}
    >
      <Img
        src={brand.logoUrl}
        alt={brand.name}
        width={132}
        height={52}
        style={{
          display: "block",
          margin: "0 auto 14px",
          color: emailColors.white,
          fontFamily: emailFont,
          fontSize: "16px",
          fontWeight: 800,
          lineHeight: "20px",
        }}
      />
      <Text
        style={{
          color: emailColors.white,
          fontFamily: emailFont,
          fontSize: "15px",
          fontWeight: 700,
          lineHeight: "22px",
          margin: "0 0 6px",
        }}
      >
        <Link
          href={brand.phoneHref}
          style={{
            color: emailColors.white,
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          {brand.phone}
        </Link>
        {" · "}
        <Link
          href={`mailto:${brand.email}`}
          style={{
            color: emailColors.white,
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          {brand.email}
        </Link>
      </Text>
      <Text
        className="dim"
        style={{
          color: emailColors.onNavyMuted,
          fontFamily: emailFont,
          fontSize: "13px",
          lineHeight: "20px",
          margin: "0 0 4px",
        }}
      >
        {brand.serviceArea}
      </Text>
      <Text
        className="dim"
        style={{
          color: emailColors.onNavyMuted,
          fontFamily: emailFont,
          fontSize: "13px",
          lineHeight: "20px",
          margin: "0 0 16px",
        }}
      >
        Licensed · {brand.licenseNumber} · {brand.yearsInBusiness} years in DFW
        · 24/7 dispatch
      </Text>
      <Hr
        style={{
          border: "none",
          borderTop: `1px solid ${emailColors.navyLine}`,
          margin: "0 0 14px",
        }}
      />
      {footerNote ? (
        <Text
          className="dim"
          style={{
            color: emailColors.onNavyMuted,
            fontFamily: emailFont,
            fontSize: "12px",
            lineHeight: "19px",
            margin: "0 0 10px",
          }}
        >
          {footerNote}
        </Text>
      ) : null}
      <Text
        className="dim"
        style={{
          color: emailColors.onNavyMuted,
          fontFamily: emailFont,
          fontSize: "12px",
          lineHeight: "19px",
          margin: 0,
        }}
      >
        <Link
          href={brand.siteUrl}
          // The link text is the bare domain and the href carries the scheme,
          // so the plain-text converter would print both ("fredsplumbing.com
          // https://fredsplumbing.com"). lib/leadDelivery.tsx targets this
          // class to drop the duplicate.
          className="site-link"
          style={{
            color: emailColors.onNavyMuted,
            textDecoration: "underline",
          }}
        >
          {brand.siteUrl.replace(/^https?:\/\//, "")}
        </Link>
      </Text>
    </Section>
  );
}

/**
 * A white content card. Both templates stack these, so the horizontal padding
 * and the mobile `.pad` override are decided once.
 */
export function Card({
  children,
  padding = "28px 28px 8px",
}: {
  children: ReactNode;
  padding?: string;
}) {
  return (
    <Section
      className="pad"
      style={{ backgroundColor: emailColors.white, padding }}
    >
      {children}
    </Section>
  );
}

/** The small red uppercase label above a block of content. */
export function Eyebrow({
  children,
  tone = "brand",
}: {
  children: ReactNode;
  tone?: "brand" | "navy";
}) {
  return (
    <Text
      style={{
        ...emailStyles.eyebrow,
        color: tone === "navy" ? emailColors.navy : emailColors.brand,
      }}
    >
      {children}
    </Text>
  );
}

/** Hairline rule between blocks inside a card. */
export function Divider({ margin = "18px 0" }: { margin?: string }) {
  return (
    <Hr
      style={{
        border: "none",
        borderTop: `1px solid ${emailColors.border}`,
        margin,
      }}
    />
  );
}

/**
 * The confirmation tick.
 *
 * A Unicode glyph in a filled square, NOT an image and NOT an SVG: an image
 * disappears the moment a client blocks images (which is exactly when a
 * reassurance email most needs to look like it worked), and Outlook's Word
 * renderer does not draw inline SVG at all. U+2713 is in the core Windows and
 * macOS system fonts, with a symbol-font stack in front of it for the older
 * Outlooks. `border-radius` is a progressive nicety — Word ignores it and
 * draws a square, which is fine.
 *
 * Skipped in the plain-text alternative: a lone tick on its own line reads as
 * a typo.
 */
export function CheckBadge() {
  return (
    <table
      role="presentation"
      data-skip-in-text="true"
      cellPadding={0}
      cellSpacing={0}
      border={0}
      style={{ borderCollapse: "collapse", margin: "0 0 16px" }}
    >
      <tbody>
        <tr>
          <td
            width={46}
            height={46}
            align="center"
            valign="middle"
            {...({ bgcolor: emailColors.brand } as Record<string, string>)}
            style={{
              backgroundColor: emailColors.brand,
              borderRadius: "23px",
              width: "46px",
              height: "46px",
              textAlign: "center",
              verticalAlign: "middle",
            }}
          >
            <span
              style={{
                color: emailColors.white,
                fontFamily:
                  "'Segoe UI Symbol', 'Apple Symbols', 'Arial Unicode MS', Arial, sans-serif",
                fontSize: "24px",
                fontWeight: 700,
                lineHeight: "46px",
              }}
            >
              {"✓"}
            </span>
          </td>
        </tr>
      </tbody>
    </table>
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

/**
 * A tinted panel with a red rule down its left edge — the shared container
 * for anything that is set apart from the flow of the email: the customer's
 * "what happens next" steps, the emergency call-out, the free-text message
 * quoted back.
 *
 * `tone="alert"` tints it brand-red for the one block that must not be
 * skimmed past; `tone="soft"` is the neutral off-white.
 */
export function Panel({
  title,
  tone = "soft",
  children,
  margin = "18px 0 4px",
}: {
  title?: string;
  tone?: "soft" | "alert";
  children: ReactNode;
  margin?: string;
}) {
  const background =
    tone === "alert" ? emailColors.brandTint : emailColors.offwhite;
  return (
    <Section
      bgcolor={background}
      style={{
        backgroundColor: background,
        borderLeft: `3px solid ${emailColors.brand}`,
        margin,
        padding: "16px 18px",
      }}
    >
      {title ? (
        <Text
          style={{
            color: tone === "alert" ? emailColors.brand : emailColors.navy,
            fontFamily: emailFont,
            fontSize: "13px",
            fontWeight: 700,
            letterSpacing: "0.6px",
            lineHeight: "20px",
            margin: "0 0 10px",
            textTransform: "uppercase",
          }}
        >
          {title}
        </Text>
      ) : null}
      {children}
    </Section>
  );
}

/** Body copy inside a `Panel`. */
export function PanelText({
  children,
  margin = "0",
}: {
  children: ReactNode;
  margin?: string;
}) {
  return (
    <Text
      style={{
        color: emailColors.ink,
        fontFamily: emailFont,
        fontSize: "15px",
        lineHeight: "23px",
        margin,
      }}
    >
      {children}
    </Text>
  );
}

/**
 * A numbered list of steps, as a table.
 *
 * The numbers are the reason this is not a `<ol>`: Outlook's Word renderer
 * mangles list indentation, and the mockup's step icons are not an option
 * here (an icon font and an inline SVG both fail in Outlook, and a PNG
 * vanishes with images blocked). Numerals in a fixed-width first column carry
 * the sequence with type alone and survive everywhere.
 */
export function StepList({ steps }: { steps: readonly string[] }) {
  return (
    <table
      role="presentation"
      // Kept as an aligned two-column block in the plain-text alternative
      // instead of being flattened into one run-on line. BOTH hooks are
      // needed: the data attribute is the current React Email convention,
      // and the class is what lib/leadDelivery.tsx targets explicitly,
      // because the renderer actually resolved at runtime
      // (@react-email/components pins an older @react-email/render) does not
      // yet carry the data-attribute selector in its defaults.
      className="step-list"
      data-text-format="dataTable"
      cellPadding={0}
      cellSpacing={0}
      border={0}
      width="100%"
      style={{ width: "100%", borderCollapse: "collapse" }}
    >
      <tbody>
        {steps.map((step, index) => (
          <tr key={step}>
            <td
              style={{
                width: "26px",
                paddingBottom: index === steps.length - 1 ? 0 : "10px",
                verticalAlign: "top",
                color: emailColors.brand,
                fontFamily: emailFont,
                fontSize: "15px",
                fontWeight: 800,
                lineHeight: "23px",
              }}
            >
              {index + 1}.
            </td>
            <td
              style={{
                paddingBottom: index === steps.length - 1 ? 0 : "10px",
                verticalAlign: "top",
                color: emailColors.ink,
                fontFamily: emailFont,
                fontSize: "15px",
                lineHeight: "23px",
              }}
            >
              {step}
            </td>
          </tr>
        ))}
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
      data-text-format="dataTable"
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
