import type { SchemaTypeDefinition } from "sanity";
import { siteSettings } from "./siteSettings";
import { reviewSettings } from "./reviewSettings";
import { navigation } from "./navigation";
import { faq } from "./faq";
import { testimonial } from "./testimonial";
import { service } from "./service";
import { industry } from "./industry";
import { trustLogo } from "./trustLogo";
import { serviceSectionTypes } from "./serviceSections";

export const schemaTypes: SchemaTypeDefinition[] = [
  siteSettings,
  reviewSettings,
  navigation,
  faq,
  testimonial,
  service,
  industry,
  trustLogo,
  ...serviceSectionTypes,
];
