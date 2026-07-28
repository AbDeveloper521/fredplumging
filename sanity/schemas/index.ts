import type { SchemaTypeDefinition } from "sanity";
import { siteSettings } from "./siteSettings";
import { aboutPage } from "./aboutPage";
import { contactPage } from "./contactPage";
import { reviewSettings } from "./reviewSettings";
import { navigation } from "./navigation";
import { faq } from "./faq";
import { testimonial } from "./testimonial";
import { service } from "./service";
import { industry } from "./industry";
import { trustLogo } from "./trustLogo";
import { jobPosting } from "./jobPosting";
import { serviceSectionTypes } from "./serviceSections";

export const schemaTypes: SchemaTypeDefinition[] = [
  siteSettings,
  aboutPage,
  contactPage,
  reviewSettings,
  navigation,
  faq,
  testimonial,
  service,
  industry,
  trustLogo,
  jobPosting,
  ...serviceSectionTypes,
];
