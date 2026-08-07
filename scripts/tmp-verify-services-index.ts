/** TEMPORARY — deleted before commit. Exercises the shared mapper with a
 *  servicesIndexPage stack that has been added to, reordered and hidden.
 *  Stubs `server-only` so the mapper can be loaded outside Next. */
import Module from "node:module";

const load = (Module as unknown as { _load: (...a: unknown[]) => unknown })._load;
(Module as unknown as { _load: (...a: unknown[]) => unknown })._load = function (
  request: unknown,
  ...rest: unknown[]
) {
  if (request === "server-only") return {};
  return load.call(this, request, ...rest);
} as never;

const raw = [
  // reordered: grid first, banner second
  { _type: "homeServices", _key: "services", heading: "Our Plumbing Services" },
  {
    _type: "serviceHero",
    _key: "hero",
    heading: "Plumbing Services for Commercial & Multi-Family Properties",
  },
  // added from the shared library
  {
    _type: "serviceFaq",
    _key: "faq",
    heading: "Common Questions",
    faqs: [{ _key: "q1", question: "Do you serve DFW?", answer: "Yes." }],
  },
  // hidden
  { _type: "homeFinalCta", _key: "cta", hidden: true, heading: "Get in touch" },
  // malformed: serviceFaq with no Q&A pairs must be dropped and logged
  { _type: "serviceFaq", _key: "broken", heading: "Empty", faqs: [] },
];

async function main() {
  const { toLibrarySections } = await import("../sanity/lib/sectionLibrary");
  const out = toLibrarySections(raw, "servicesIndexPage");
  console.log(
    "RESULT: " +
      JSON.stringify(out?.map((s) => `${s._type}:${s._key}`) ?? null),
  );
}

main();
