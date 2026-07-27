import type { SchemaTypeDefinition } from "sanity";
import { siteSettings } from "./siteSettings";
import { navigation } from "./navigation";
import { faq } from "./faq";
import { testimonial } from "./testimonial";
import { service } from "./service";
import { industry } from "./industry";
import { trustLogo } from "./trustLogo";

export const schemaTypes: SchemaTypeDefinition[] = [
  siteSettings,
  navigation,
  faq,
  testimonial,
  service,
  industry,
  trustLogo,
];
