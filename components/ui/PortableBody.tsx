import Link from "next/link";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import type { RichBody } from "@/data/services";
import type { SiteContent } from "@/data/site";
import { Button } from "@/components/ui/Button";

interface PortableBodyProps {
  value: RichBody;
  site: SiteContent;
}

/**
 * Renders the constrained rich body from Sanity in the site's design system:
 * Manrope headings (global h2–h4 rule), Inter body copy at the existing
 * scale, brand-red accents. Server component — @portabletext/react ships an
 * RSC build, so no client boundary is introduced.
 */
export function PortableBody({ value, site }: PortableBodyProps) {
  const components: PortableTextComponents = {
    block: {
      normal: ({ children }) => (
        <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-grey-700 first:mt-0">
          {children}
        </p>
      ),
      h2: ({ children }) => (
        <h2 className="mt-12 text-[26px] font-extrabold tracking-tight text-navy-900 first:mt-0 sm:text-[30px]">
          {children}
        </h2>
      ),
      h3: ({ children }) => (
        <h3 className="mt-8 text-xl font-extrabold tracking-tight text-navy-900 first:mt-0">
          {children}
        </h3>
      ),
    },
    list: {
      bullet: ({ children }) => (
        <ul className="mt-5 max-w-2xl list-disc space-y-2 pl-5 text-[16px] leading-relaxed text-grey-700 marker:text-red-600">
          {children}
        </ul>
      ),
      number: ({ children }) => (
        <ol className="mt-5 max-w-2xl list-decimal space-y-2 pl-5 text-[16px] leading-relaxed text-grey-700 marker:font-semibold marker:text-red-600">
          {children}
        </ol>
      ),
    },
    marks: {
      strong: ({ children }) => (
        <strong className="font-semibold text-navy-900">{children}</strong>
      ),
      em: ({ children }) => <em>{children}</em>,
      link: ({ children, value: link }) => {
        const href = typeof link?.href === "string" ? link.href : "#";
        const isInternal = href.startsWith("/");
        const classes =
          "font-semibold text-navy-900 underline decoration-red-600/60 underline-offset-4 transition-colors hover:text-red-600";
        return isInternal ? (
          <Link href={href} className={classes}>
            {children}
          </Link>
        ) : (
          <a href={href} rel="noopener noreferrer" className={classes}>
            {children}
          </a>
        );
      },
    },
    types: {
      callout: ({ value: callout }) => (
        <aside className="mt-8 max-w-2xl rounded-xl border-l-4 border-red-600 bg-offwhite p-6">
          <p className="text-lg font-extrabold tracking-tight text-navy-900">
            {typeof callout.heading === "string" ? callout.heading : ""}
          </p>
          <p className="mt-2 text-[15px] leading-relaxed text-grey-700">
            {typeof callout.text === "string" ? callout.text : ""}
          </p>
          {callout.showPhoneButton !== false && (
            <div className="mt-4">
              <Button href={site.phoneHref} withPhoneIcon>
                Call {site.phone}
              </Button>
            </div>
          )}
        </aside>
      ),
    },
    hardBreak: () => <br />,
  };

  return <PortableText value={value} components={components} />;
}
