import type { Metadata, Viewport } from "next";
import {
  metadata as studioMetadata,
  viewport as studioViewport,
} from "next-sanity/studio";
import { Studio } from "./Studio";

export const dynamic = "force-static";

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
