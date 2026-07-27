"use client";

import { NextStudio } from "next-sanity/studio/client-component";
import config from "@/sanity.config";

/**
 * Client boundary for the embedded Studio. `sanity.config.ts` must only be
 * imported from a Client Component: the `sanity` package depends on `swr`,
 * whose react-server build has no default export, so pulling the config into
 * the RSC graph breaks the production build.
 */
export function Studio() {
  return <NextStudio config={config} />;
}
