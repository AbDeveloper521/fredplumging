import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { PageLinksContent } from "@/data/aboutPage";

/** The /about closing link-card grid (Partners, Careers, Testimonials, …). */
export function PageLinksSection({
  content,
  titleId,
}: {
  content: PageLinksContent;
  /** Unique per instance — sections can be duplicated in the Studio. */
  titleId: string;
}) {
  return (
    <section aria-labelledby={titleId} className="bg-white py-16 sm:py-24">
      <Container>
        <Reveal>
          <SectionHeading
            titleId={titleId}
            eyebrow={content.eyebrow}
            title={content.heading}
            align="center"
          />
        </Reveal>
        <ul className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3">
          {content.links.map((link, i) => (
            <li key={link.href}>
              <Reveal delay={i * 0.07} className="h-full">
                <Link
                  href={link.href}
                  className="group flex h-full flex-col rounded-2xl border border-grey-100 bg-white p-7 shadow-(--shadow-card) transition-all duration-200 hover:shadow-(--shadow-card-lg)"
                >
                  <h3 className="flex items-center justify-between gap-3 text-lg font-extrabold tracking-tight text-navy-900">
                    {link.title}
                    <ArrowUpRight
                      aria-hidden="true"
                      className="size-5 shrink-0 text-red-600 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                  </h3>
                  <p className="mt-3 text-[15px] leading-relaxed text-grey-500">
                    {link.description}
                  </p>
                </Link>
              </Reveal>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
