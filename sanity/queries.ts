import { defineQuery } from "next-sanity";

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
    sections[]{
      ...,
      photo{ asset, hotspot, crop, alt },
      photoPrimary{ asset, hotspot, crop, alt }
    },
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
    sections[]{
      ...,
      photo{ asset, hotspot, crop, alt },
      photoPrimary{ asset, hotspot, crop, alt }
    },
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
    sections[]{
      ...,
      photo{ asset, hotspot, crop, alt },
      primaryPhoto{ asset, hotspot, crop, alt },
      secondaryPhoto{ asset, hotspot, crop, alt }
    }
  }`,
);

export const ABOUT_PAGE_QUERY = defineQuery(
  `*[_type == "aboutPage" && _id == "aboutPage"][0]{
    heroEyebrow,
    heroHeading,
    heroParagraphs,
    storyHeading,
    storyParagraphs,
    storyPhotoPrimary{ asset, hotspot, crop, alt },
    storyPhotoSubjectPrimary,
    storyPhotoSecondary{ asset, hotspot, crop, alt },
    storyPhotoSubjectSecondary,
    evolutionHeading,
    evolutionParagraphs,
    evolutionPhoto{ asset, hotspot, crop, alt },
    evolutionPhotoSubject,
    valuesHeading,
    values[]{ icon, title, description },
    linksHeading,
    links[]{ title, description, href }
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

export const CITY_PAGE_QUERY = defineQuery(
  `*[_type == "cityPage" && slug.current == $slug][0]{
    city,
    "slug": slug.current,
    heroHeading,
    heroIntro,
    servicesHeading,
    serviceCards[]{ _key, title, description, href, icon },
    whyChooseHeading,
    whyChooseBody,
    reviewsHeading,
    heritageHeading,
    heritageParagraphs,
    heritagePhoto{ asset, hotspot, crop, alt },
    heritagePhotoSubject,
    communitiesHeading,
    communitiesBody,
    communities,
    showLogoStrip,
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
