import { MapPin } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";

interface CityCommunitiesSectionProps {
  heading: string;
  body: string;
  /** The client's own list of nearby communities — rendered exactly as given. */
  communities: string[];
  id: string;
}

/**
 * "Proudly Serving …" band: copy plus map-pin chips for the client's own
 * community list (never padded with extra cities), closed by a Contact CTA.
 */
export function CityCommunitiesSection({
  heading,
  body,
  communities,
  id,
}: CityCommunitiesSectionProps) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="bg-offwhite py-16 sm:py-24 lg:py-28">
      <Container className="flex flex-col items-center text-center">
        <Reveal>
          <SectionHeading
            titleId={`${id}-heading`}
            title={heading}
            description={body}
            align="center"
            className="max-w-3xl"
          />
        </Reveal>

        {communities.length > 0 && (
          <Reveal delay={0.1}>
            <ul className="mt-9 flex flex-wrap justify-center gap-2.5">
              {communities.map((community) => (
                <li key={community}>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-grey-300 bg-white px-4 py-2 text-sm font-semibold text-navy-900">
                    <MapPin aria-hidden="true" className="size-3.5 text-red-600" />
                    {community}
                  </span>
                </li>
              ))}
            </ul>
          </Reveal>
        )}

        <Reveal delay={0.16}>
          <div className="mt-10">
            <Button href="/contact" size="lg" withArrow>
              Contact Us
            </Button>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
