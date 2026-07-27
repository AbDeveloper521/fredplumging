/**
 * Environment validation for the Sanity integration. Fails loudly at module
 * load rather than letting the site silently render empty content.
 */
function requireEnv(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(
      `[sanity] Missing required environment variable ${name}. ` +
        `Copy .env.example to .env.local and fill in the values from https://sanity.io/manage.`,
    );
  }
  return value;
}

export const projectId = requireEnv(
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  "NEXT_PUBLIC_SANITY_PROJECT_ID",
);

export const dataset = requireEnv(
  process.env.NEXT_PUBLIC_SANITY_DATASET,
  "NEXT_PUBLIC_SANITY_DATASET",
);

/** Pin the API version so query behaviour doesn't shift under us. */
export const apiVersion = "2026-07-01";
