import { timingSafeEqual } from "node:crypto";
import { type NextRequest, NextResponse } from "next/server";
import { client } from "@/sanity/client";
import { resolvePhoto } from "@/sanity/lib/image";
import { toSectionsWithReport } from "@/sanity/lib/sectionLibrary";
import { apiVersion, dataset, projectId } from "@/sanity/env";

/**
 * Diagnostic route: answers "is the Sanity → site pipeline working?" in one
 * URL, identically on localhost and production.
 *
 * - Development: open http://localhost:3000/api/health/sanity
 * - Production: requires ?secret=<SANITY_REVALIDATE_SECRET>; anything else
 *   404s so the route is not discoverable. Never linked anywhere and not in
 *   sitemap.ts (which lists only explicit page paths).
 *
 * Reports env-var PRESENCE only — never a secret value.
 */

// No segment config: under Cache Components a GET handler that reads the
// request is dynamic by default, and `dynamic = "force-dynamic"` is removed —
// see node_modules/next/dist/docs/01-app/02-guides/
// migrating-to-cache-components.md ("dynamic = force-dynamic").

/** Timing-safe string comparison; length guard first so it cannot throw. */
function secretMatches(provided: string | null, expected: string | undefined): boolean {
  if (!provided || !expected) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

type RawImage = { asset?: { _ref?: string }; alt?: string | null } | null;

type ImageReport = {
  field: string;
  imageUploaded: boolean;
  altTextSet: boolean;
  resolvedUrl?: string;
  status:
    | "rendering"
    | "no image uploaded"
    | "image uploaded but alt text is missing — the site is showing a placeholder instead";
};

function reportImage(field: string, image: RawImage): ImageReport {
  const imageUploaded = Boolean(image?.asset);
  const altTextSet = Boolean(image?.alt);
  if (!imageUploaded) {
    return { field, imageUploaded, altTextSet, status: "no image uploaded" };
  }
  if (!altTextSet) {
    return {
      field,
      imageUploaded,
      altTextSet,
      status:
        "image uploaded but alt text is missing — the site is showing a placeholder instead",
    };
  }
  return {
    field,
    imageUploaded,
    altTextSet,
    // alt is verified present above, so this never triggers the skip warning.
    resolvedUrl: resolvePhoto(image, 1600, field)?.url,
    status: "rendering",
  };
}

type RawSection = {
  _type?: string;
  photo?: RawImage;
  photoPrimary?: RawImage;
  cards?: Array<{ title?: string; photo?: RawImage }>;
};

type RawDoc = {
  _type: string;
  slug: string | null;
  _updatedAt: string;
  photo?: RawImage;
  sections?: RawSection[];
};

/** Every image field on the document and inside its sections array. */
function imagesOf(doc: RawDoc): ImageReport[] {
  const reports: ImageReport[] = [reportImage("photo (document-level)", doc.photo ?? null)];
  (doc.sections ?? []).forEach((section, i) => {
    const at = `sections[${i}] (${section._type ?? "unknown"})`;
    if (section._type === "serviceHero" || section._type === "serviceArea") {
      reports.push(reportImage(`${at}.photo`, section.photo ?? null));
    }
    if (section._type === "serviceAbout") {
      reports.push(reportImage(`${at}.photoPrimary`, section.photoPrimary ?? null));
    }
    if (section._type === "propertyTypes") {
      (section.cards ?? []).forEach((card, j) => {
        reports.push(
          reportImage(`${at}.cards[${j}] "${card.title ?? "?"}".photo`, card.photo ?? null),
        );
      });
    }
  });
  return reports;
}

/**
 * Which sections of a document render and which are silently dropped —
 * the render-gate outcome the owner cannot otherwise see in production.
 */
function sectionsOf(doc: RawDoc):
  | {
      kept: string[];
      dropped: Array<{ section: string; fillInStudio: string[] }>;
      note?: string;
    }
  | { note: string } {
  if (!doc.sections) {
    return { note: "no sections array — page uses the legacy layout" };
  }
  const { sections, dropped } = toSectionsWithReport(doc.sections);
  return {
    kept: (sections ?? []).map((s) => s._type),
    dropped: dropped.map((d) => ({
      section: `sections[${d.index}] (${d._type})`,
      fillInStudio: d.studioFields,
    })),
    ...(sections === undefined && doc.sections.length > 0
      ? {
          note: "EVERY section was dropped — this page is silently falling back to the legacy layout",
        }
      : {}),
  };
}

const HEALTH_QUERY = `*[_type in ["service", "industry"]] | order(_type asc, slug.current asc) {
  _type,
  "slug": slug.current,
  _updatedAt,
  photo,
  sections
}`;

export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV !== "development") {
    const ok = secretMatches(
      req.nextUrl.searchParams.get("secret"),
      process.env.SANITY_REVALIDATE_SECRET,
    );
    // 404 (not 401) so probing cannot discover that the route exists.
    if (!ok) return new NextResponse(null, { status: 404 });
  }

  const tokenPresent = Boolean(process.env.SANITY_API_READ_TOKEN);
  const base = {
    projectId,
    dataset,
    apiVersion,
    nodeEnv: process.env.NODE_ENV,
    ...(process.env.VERCEL_ENV ? { vercelEnv: process.env.VERCEL_ENV } : {}),
    tokenPresent,
    revalidateSecretPresent: Boolean(process.env.SANITY_REVALIDATE_SECRET),
  };

  try {
    // Same token the app's fetchers use, but resolved lazily: importing
    // serverClient would throw at module load when the token is missing —
    // the exact failure this route exists to report.
    const readClient = tokenPresent
      ? client.withConfig({ token: process.env.SANITY_API_READ_TOKEN })
      : client;
    const docs = await readClient.fetch<RawDoc[]>(
      HEALTH_QUERY,
      {},
      { cache: "no-store" },
    );

    return NextResponse.json({
      ...base,
      sanityReachable: true,
      documents: docs.map((doc) => ({
        type: doc._type,
        slug: doc.slug,
        _updatedAt: doc._updatedAt,
        images: imagesOf(doc),
        sections: sectionsOf(doc),
      })),
    });
  } catch (error) {
    return NextResponse.json({
      ...base,
      sanityReachable: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
