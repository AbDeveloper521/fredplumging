import "server-only";
import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "./env";

/**
 * Read client for published content. `useCdn: false` because reads happen at
 * build time / tag revalidation on the server — hitting the live API means a
 * webhook-triggered revalidation never serves a stale CDN copy.
 */
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  perspective: "published",
});
