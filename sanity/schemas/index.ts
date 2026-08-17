import type { SchemaTypeDefinition } from "sanity";
import { siteSettings } from "./siteSettings";
import { homePage, homeSectionTypes } from "./homePage";
import { aboutPage, aboutSectionTypes } from "./aboutPage";
import { partnersPage, partnersSectionTypes } from "./partnersPage";
import { careersPage, careersSectionTypes } from "./careersPage";
import { servicesIndexPage } from "./servicesIndexPage";
import { areasIndexPage } from "./areasIndexPage";
import { multifamilyIndexPage } from "./multifamilyIndexPage";
import { commercialPage } from "./commercialPage";
import { contactPage } from "./contactPage";
import { legalPage } from "./legalPage";
import { cityPage, citySectionTypes } from "./cityPage";
import { contactSectionTypes } from "./contactSections";
import { reviewSettings } from "./reviewSettings";
import { navigation } from "./navigation";
import { faq } from "./faq";
import { faqSet, faqBand } from "./faqSet";
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
  careersPage,
  servicesIndexPage,
  areasIndexPage,
  multifamilyIndexPage,
  commercialPage,
  contactPage,
  legalPage,
  cityPage,
  reviewSettings,
  navigation,
  faq,
  faqSet,
  faqBand,
  testimonial,
  service,
  industry,
  trustLogo,
  jobPosting,
  ...serviceSectionTypes,
  ...homeSectionTypes,
  ...aboutSectionTypes,
  ...partnersSectionTypes,
  ...careersSectionTypes,
  ...citySectionTypes,
  ...contactSectionTypes,
];
