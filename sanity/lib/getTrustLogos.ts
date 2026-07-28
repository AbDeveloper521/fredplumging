import "server-only";
import { serverClient } from "@/sanity/lib/serverClient";
import { resolvePhoto } from "@/sanity/lib/image";
import { logEmpty, logFallback } from "@/sanity/lib/fallbackLog";
import { sanityFetchOptions } from "@/sanity/lib/cacheOptions";
import { TRUST_LOGOS_QUERY } from "@/sanity/queries";
import {
  STATIC_TRUST_LOGOS,
  TRUST_LOGO_CATEGORIES,
  type TrustLogo,
  type TrustLogoCategory,
} from "@/data/navigation";

/** Cache tag invalidated by the /api/revalidate webhook. */
export const TRUST_LOGO_TAG = "trustLogo";

/**
 * Trust logos ordered by the client-controlled `order` field.
 * FAILED fetch → static fallback (loud). Successful EMPTY result → empty
 * array: the trust bar and the compliance logo strip hide.
 */
export async function getTrustLogos(): Promise<TrustLogo[]> {
  try {
    const result = await serverClient.fetch(
      TRUST_LOGOS_QUERY,
      {},
      sanityFetchOptions(TRUST_LOGO_TAG),
    );

    const logos: TrustLogo[] = [];
    for (const item of result) {
      if (!item.name) continue;
      logos.push({
        name: item.name,
        photo: resolvePhoto(item.logo, 400, `trust logo "${item.name}" → Logo`),
        headline: item.headline ?? undefined,
        blurb: item.blurb ?? undefined,
        // Unknown category → dropped, so the UI never renders a pill label
        // it doesn't have wording for.
        category: (TRUST_LOGO_CATEGORIES as readonly string[]).includes(
          item.category ?? "",
        )
          ? (item.category as TrustLogoCategory)
          : undefined,
        url: item.url ?? undefined,
        // Mirrors the schema's initialValue — docs created before the field
        // existed count as verified until an editor unticks them.
        verified: item.verified ?? true,
      });
    }

    if (logos.length === 0) {
      logEmpty("getTrustLogos", "the trust bar and compliance logo strip are hidden.");
    }
    return logos;
  } catch (error) {
    logFallback({
      fetcher: "getTrustLogos",
      fallbackFile: "data/navigation.ts (STATIC_TRUST_LOGOS)",
      affects: "homepage trust bar + compliance section logo strip",
      error,
    });
    return STATIC_TRUST_LOGOS;
  }
}
