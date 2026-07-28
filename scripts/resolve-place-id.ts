/**
 * One-shot Place ID lookup — run with:
 *   npx tsx scripts/resolve-place-id.ts
 * (or `sanity exec scripts/resolve-place-id.ts` for its env loading).
 *
 * The Google listing's hex feature ID (0x6d28a9a9242e61cb:0x10c8773cb4095848)
 * CANNOT be converted to a Places API Place ID computationally — it has to be
 * looked up. This calls Places API (New) `places:searchText` biased around
 * the business's location and prints the `places/ChIJ…` resource name, ready
 * to paste into the Google Reviews (reviewSettings) document / the `placeId`
 * field in data/googleReviews.ts.
 *
 * Needs GOOGLE_PLACES_API_KEY (server-only, .env.local).
 */

async function main() {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    console.error(
      "GOOGLE_PLACES_API_KEY is not set. Add it to .env.local first.",
    );
    process.exit(1);
  }

  const response = await fetch(
    "https://places.googleapis.com/v1/places:searchText",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask":
          "places.name,places.displayName,places.formattedAddress,places.rating,places.userRatingCount",
      },
      body: JSON.stringify({
        textQuery: "Fred's Plumbing",
        locationBias: {
          circle: {
            // The listing's coordinates (Dallas–Fort Worth).
            center: { latitude: 32.7430719, longitude: -96.963595 },
            radius: 5000,
          },
        },
      }),
    },
  );

  if (!response.ok) {
    console.error(
      `places:searchText failed with ${response.status}: ${await response.text()}`,
    );
    process.exit(1);
  }

  const data = (await response.json()) as {
    places?: Array<{
      name: string;
      displayName?: { text?: string };
      formattedAddress?: string;
      rating?: number;
      userRatingCount?: number;
    }>;
  };

  if (!data.places?.length) {
    console.error("No places matched — widen the radius or adjust the query.");
    process.exit(1);
  }

  for (const place of data.places) {
    console.log(
      `${place.name}\n  ${place.displayName?.text ?? "?"} — ${place.formattedAddress ?? "?"}` +
        `\n  ${place.rating ?? "?"}★ · ${place.userRatingCount ?? "?"} reviews\n`,
    );
  }
  console.log(
    "Paste the matching places/ChIJ… resource name into the placeId field.",
  );
}

main().catch((error) => {
  console.error("resolve-place-id failed:", error);
  process.exit(1);
});
