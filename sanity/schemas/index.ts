import type { SchemaTypeDefinition } from "sanity";
import { siteSettings } from "./siteSettings";
import { homePage, homeSectionTypes } from "./homePage";
import { aboutPage, aboutSectionTypes } from "./aboutPage";
import { partnersPage, partnersSectionTypes } from "./partnersPage";
import { contactPage } from "./contactPage";
import { cityPage } from "./cityPage";
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
  homePage,
  aboutPage,
  partnersPage,
  contactPage,
  cityPage,
  reviewSettings,
  navigation,
  faq,
  testimonial,
  service,
  industry,
  trustLogo,
  jobPosting,
  ...serviceSectionTypes,
  ...homeSectionTypes,
  ...aboutSectionTypes,
  ...partnersSectionTypes,
];
