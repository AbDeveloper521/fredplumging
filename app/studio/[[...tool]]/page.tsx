import type { Metadata, Viewport } from "next";
import {
  metadata as studioMetadata,
  viewport as studioViewport,
} from "next-sanity/studio";
import { Studio } from "./Studio";

// `dynamic = "force-static"` is removed under Cache Components
// (node_modules/next/dist/docs/01-app/02-guides/
// migrating-to-cache-components.md). The base /studio path prerenders via
// generateStaticParams; deeper tool paths (e.g. /studio/structure) resolve
// at request time and route client-side inside the Studio itself.
export function generateStaticParams() {
  return [{ tool: [] }];
}

export const metadata: Metadata = {
  ...studioMetadata,
  title: "Sanity Studio",
  // Belt-and-braces with app/robots.ts: never index the Studio.
  robots: { index: false, follow: false },
};

export const viewport: Viewport = studioViewport;

export default function StudioPage() {
  return <Studio />;
}
