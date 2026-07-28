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
    serviceAreaCities
  }`,
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
    source, reviewerMeta, sourceUrl, serviceTags, verified
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
      photoPrimary{ asset, hotspot, crop, alt },
      photoSecondary{ asset, hotspot, crop, alt }
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
      photoPrimary{ asset, hotspot, crop, alt },
      photoSecondary{ asset, hotspot, crop, alt }
    },
    seoTitle,
    seoDescription
  }`,
);

export const TRUST_LOGOS_QUERY = defineQuery(
  `*[_type == "trustLogo"] | order(order asc){
    name,
    logo{ asset, hotspot, crop, alt }
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
