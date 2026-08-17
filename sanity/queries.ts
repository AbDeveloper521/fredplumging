import { defineQuery } from "next-sanity";

/**
 * The one `sections[]` projection every page query shares — the library is
 * one union everywhere, so every query must surface every photo field any
 * library type carries (fields a section doesn't have project as null and
 * the mapper ignores them). Secondary photos carry no "Frame shape"
 * override (their frames are fixed compositions), so no frameRatio there.
 *
 * `faqSet->` dereferences the shared Q&A set INSIDE the page query, so a
 * `faqBand` section arrives with its questions already attached — one round
 * trip, no second fetch. Pages that carry no such band project it as null.
 */
const SECTIONS_PROJECTION = `sections[]{
    ...,
    photo{ asset, hotspot, crop, alt, frameRatio },
    photoPrimary{ asset, hotspot, crop, alt, frameRatio },
    photoSecondary{ asset, hotspot, crop, alt },
    primaryPhoto{ asset, hotspot, crop, alt, frameRatio },
    secondaryPhoto{ asset, hotspot, crop, alt },
    faqSet->{ heading, intro, items[]{ _key, question, answer } }
  }`;

export const SITE_SETTINGS_QUERY = defineQuery(
  `*[_type == "siteSettings" && _id == "siteSettings"][0]{
    name,
    legalName,
    tagline,
    phone,
    phoneHref,
    email,
    emailHref,
    serviceArea,
    foundedYear,
    yearsInBusiness,
    url,
    licenseNumber,
    streetAddress,
    addressLocality,
    addressRegion,
    postalCode,
    mapHeading,
    mapDescription,
    mapEmbedUrl,
    serviceAreaCities
  }`,
);

const JOB_POSTING_FIELDS = `
  title,
  "slug": slug.current,
  employmentType,
  team,
  shift,
  openings,
  summary,
  responsibilities,
  requirements,
  compensationNote,
  applyEmail,
  applyUrl,
  datePosted,
  validThrough,
  open
`;

export const JOB_POSTINGS_QUERY = defineQuery(
  `*[_type == "jobPosting" && open == true] | order(order asc){${JOB_POSTING_FIELDS}}`,
);

/** No `open` filter — a filled role's URL must resolve, not 404. */
export const JOB_POSTING_QUERY = defineQuery(
  `*[_type == "jobPosting" && slug.current == $slug][0]{${JOB_POSTING_FIELDS}}`,
);

export const NAVIGATION_QUERY = defineQuery(
  `*[_type == "navigation" && _id == "navigation"][0]{
    items[]{
      _key,
      label,
      href,
      layout,
      showServiceAreaCities,
      children[]{
        _key,
        label,
        href,
        description,
        icon
      }
    },
    cta{ label, href }
  }`,
);

export const FAQS_QUERY = defineQuery(
  `*[_type == "faq"] | order(order asc){ question, answer }`,
);

export const TESTIMONIALS_QUERY = defineQuery(
  `*[_type == "testimonial"] | order(order asc){
    "id": _id, name, role, rating, quote, date, featured,
    source, reviewerMeta, sourceUrl, serviceTags, verified,
    ownerReply, ownerReplyDate
  }`,
);

export const REVIEW_SETTINGS_QUERY = defineQuery(
  `*[_type == "reviewSettings" && _id == "reviewSettings"][0]{
    rating,
    reviewCount,
    verifiedOn,
    reviewsUrl,
    writeReviewUrl,
    headline
  }`,
);

export const SERVICES_QUERY = defineQuery(
  `*[_type == "service"] | order(order asc){
    title,
    "slug": slug.current,
    shortDescription,
    icon,
    featured,
    photo{ asset, hotspot, crop, alt },
    body,
    seoTitle,
    seoDescription
  }`,
);

export const SERVICE_BY_SLUG_QUERY = defineQuery(
  `*[_type == "service" && slug.current == $slug][0]{
    title,
    "slug": slug.current,
    shortDescription,
    icon,
    featured,
    photo{ asset, hotspot, crop, alt },
    body,
    ${SECTIONS_PROJECTION},
    seoTitle,
    seoDescription
  }`,
);

export const INDUSTRIES_QUERY = defineQuery(
  `*[_type == "industry"] | order(order asc){
    title,
    "slug": slug.current,
    description,
    bulletPoints,
    photo{ asset, hotspot, crop, alt },
    body,
    seoTitle,
    seoDescription
  }`,
);

export const INDUSTRY_BY_SLUG_QUERY = defineQuery(
  `*[_type == "industry" && slug.current == $slug][0]{
    title,
    "slug": slug.current,
    description,
    bulletPoints,
    photo{ asset, hotspot, crop, alt },
    body,
    ${SECTIONS_PROJECTION},
    seoTitle,
    seoDescription
  }`,
);

export const TRUST_LOGOS_QUERY = defineQuery(
  `*[_type == "trustLogo"] | order(order asc){
    name,
    logo{ asset, hotspot, crop, alt },
    headline,
    blurb,
    category,
    url,
    verified
  }`,
);

export const HOME_PAGE_QUERY = defineQuery(
  `*[_type == "homePage" && _id == "homePage"][0]{
    ${SECTIONS_PROJECTION}
  }`,
);

export const ABOUT_PAGE_QUERY = defineQuery(
  `*[_type == "aboutPage" && _id == "aboutPage"][0]{
    ${SECTIONS_PROJECTION}
  }`,
);

export const PARTNERS_PAGE_QUERY = defineQuery(
  `*[_type == "partnersPage" && _id == "partnersPage"][0]{
    ${SECTIONS_PROJECTION}
  }`,
);

export const CAREERS_PAGE_QUERY = defineQuery(
  `*[_type == "careersPage" && _id == "careersPage"][0]{
    ${SECTIONS_PROJECTION}
  }`,
);

export const SERVICES_INDEX_PAGE_QUERY = defineQuery(
  `*[_type == "servicesIndexPage" && _id == "servicesIndexPage"][0]{
    ${SECTIONS_PROJECTION}
  }`,
);

export const AREAS_INDEX_PAGE_QUERY = defineQuery(
  `*[_type == "areasIndexPage" && _id == "areasIndexPage"][0]{
    ${SECTIONS_PROJECTION}
  }`,
);

export const MULTIFAMILY_INDEX_PAGE_QUERY = defineQuery(
  `*[_type == "multifamilyIndexPage" && _id == "multifamilyIndexPage"][0]{
    ${SECTIONS_PROJECTION}
  }`,
);

export const COMMERCIAL_PAGE_QUERY = defineQuery(
  `*[_type == "commercialPage" && _id == "commercialPage"][0]{
    ${SECTIONS_PROJECTION}
  }`,
);

export const HYDRO_JETTING_PAGE_QUERY = defineQuery(
  `*[_type == "hydroJettingPage" && _id == "hydroJettingPage"][0]{
    ${SECTIONS_PROJECTION}
  }`,
);

export const CONTACT_PAGE_QUERY = defineQuery(
  `*[_type == "contactPage" && _id == "contactPage"][0]{
    heroEyebrow,
    heroHeading,
    heroIntro,
    responsePromise,
    hours[]{ days, hours },
    emergencyHeading,
    emergencyBody,
    faqs[]{ question, answer }
  }`,
);

/**
 * One legal document by slug. Not a section stack — a legal page is one prose
 * run, so the body is Portable Text and the banner has its own fields.
 */
export const LEGAL_PAGE_QUERY = defineQuery(
  `*[_type == "legalPage" && slug == $slug][0]{
    slug,
    title,
    eyebrow,
    intro,
    body,
    contact{ name, phoneDisplay, website },
    bannerPhoto{ asset, hotspot, crop, alt },
    darkOverlay,
    lastUpdated,
    seoTitle,
    seoDescription
  }`,
);

/**
 * Every city that has a page, link-shaped — what the coverage band lists so
 * a third city needs a `cityPage` document and nothing else. Ordered by name
 * (the same `order(city asc)` the drift check and Studio list use).
 */
export const CITIES_QUERY = defineQuery(
  `*[_type == "cityPage" && defined(slug.current)]|order(city asc){
    city,
    "slug": slug.current
  }`,
);

export const CITY_PAGE_QUERY = defineQuery(
  `*[_type == "cityPage" && slug.current == $slug][0]{
    city,
    "slug": slug.current,
    ${SECTIONS_PROJECTION},
    seoTitle,
    seoDescription
  }`,
);

export const FOOTER_NAVIGATION_QUERY = defineQuery(
  `*[_type == "navigation" && _id == "navigation"][0]{
    footerColumns[]{
      _key,
      heading,
      links[]{ _key, label, href }
    },
    legalLinks[]{ _key, label, href }
  }`,
);
