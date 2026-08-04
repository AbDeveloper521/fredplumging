/** Temp check: diff the plumbing fallback stack against the spec, word for word. */
import { services } from "../data/services";

const DASH = "–"; // en dash

// prettier-ignore
const expected = [
  { _type: "serviceHero", eyebrow: "FRED'S PLUMBING", heading: `Plumbing Services in the Dallas${DASH}Fort Worth Metroplex`, subheading: `Fred's Plumbing provides high-quality plumbing solutions for multi-family and commercial properties throughout the Dallas${DASH}Fort Worth Metroplex. From complex system installations to routine repairs, our licensed plumbers deliver precise, reliable work that keeps your property running smoothly.` },
  { _type: "serviceAbout", heading: "About Our Plumbing Services", paragraphs: [
      `Since 1996, Fred's Plumbing has been trusted by property managers, facility owners, and investors throughout the Dallas${DASH}Fort Worth Metroplex. Our technicians are fully licensed, insured, and trained to meet the highest safety and quality standards.`,
      "We handle every aspect of plumbing repair and installation for large-scale residential and commercial buildings. Whether replacing pipes, repairing leaks, or upgrading outdated systems, we use advanced tools and proven methods to deliver long-lasting performance.",
    ], ctaLabel: "Contact Us", ctaHref: "/contact" },
  { _type: "propertyTypes", cards: [
      { title: "Slab Leak Repair", blurb: "Our advanced leak detection and repair techniques prevent structural damage and save you from costly water loss beneath concrete foundations.", linkLabel: "Get Started" },
      { title: "Piping Services", blurb: "From copper to PEX systems, our team repairs, replaces and installs plumbing pipes for projects across DFW.", linkLabel: "Get Started" },
      { title: "Commercial Installs & Replacements", blurb: "We handle plumbing equipment installations and replacements for multi-unit buildings, offices, and commercial properties, providing efficient, code-compliant service every time.", linkLabel: "Get Started" },
    ] },
  { _type: "serviceTrust", heading: "Trusted Plumbing Professionals Across the DFW Metroplex", items: [
      { title: "Proven Experience", description: "Over 30 years of delivering reliable plumbing solutions to commercial and multi-family properties across Dallas and Fort Worth." },
      { title: "Fast Response Times", description: "Our 24/7 emergency service ensures you get immediate help whenever you need it." },
      { title: "Advanced Technology", description: "We use modern equipment for diagnostics, leak detection, and repairs to ensure precision and minimize disruption." },
    ] },
  { _type: "serviceTestimonials", heading: "What Our Clients Say" },
  { _type: "serviceAbout", heading: "Trusted Commercial Plumbers Serving the DFW Metroplex Since 1996", paragraphs: [
      "Founded in 1996, Fred's Plumbing has built a reputation for professionalism, reliability, and precision workmanship. We specialize in providing plumbing services for property management companies, facility owners, and real estate investors who value fast, dependable results.",
      "By combining advanced techniques with top-quality materials, we deliver plumbing systems that meet the demands of high-occupancy properties and complex infrastructure. Every project reflects our dedication to safety, efficiency, and lasting performance.",
    ], ctaLabel: "Contact Us", ctaHref: "/contact" },
  { _type: "serviceArea", heading: `Proudly Serving the Entire Dallas${DASH}Fort Worth Metroplex`, body: `Fred's Plumbing serves commercial and multi-family clients across Dallas, Fort Worth, Arlington, Irving, Plano, Garland, Grand Prairie, and surrounding areas. Wherever you manage property in North Texas, our experienced team is ready to help.`, ctaLabel: "Contact Us", ctaHref: "/contact" },
  { _type: "trustLogoStrip" },
];

const actual = services.find((s) => s.slug === "plumbing")?.sections;
if (!actual) {
  console.error("FAIL: plumbing fallback has no sections");
  process.exit(1);
}

let failures = 0;
function compare(exp: unknown, act: unknown, path: string) {
  if (Array.isArray(exp)) {
    const arr = Array.isArray(act) ? act : [];
    if (arr.length !== exp.length) {
      failures++;
      console.error(`DIFF ${path}: expected ${exp.length} entries, got ${arr.length}`);
    }
    exp.forEach((e, i) => compare(e, arr[i], `${path}[${i}]`));
    return;
  }
  if (exp && typeof exp === "object") {
    for (const [k, v] of Object.entries(exp)) {
      compare(v, (act as Record<string, unknown> | undefined)?.[k], `${path}.${k}`);
    }
    return;
  }
  if (exp !== act) {
    failures++;
    console.error(`DIFF ${path}:\n  expected: ${JSON.stringify(exp)}\n  actual:   ${JSON.stringify(act)}`);
  }
}

if (actual.length !== expected.length) {
  failures++;
  console.error(`DIFF: expected ${expected.length} sections, got ${actual.length} (${actual.map((s) => s._type).join(", ")})`);
}
expected.forEach((e, i) => compare(e, actual[i], `sections[${i}]`));

if (failures === 0) console.log("OK: plumbing fallback stack matches the spec word for word, all 8 bands in order.");
else {
  console.error(`${failures} difference(s).`);
  process.exit(1);
}
