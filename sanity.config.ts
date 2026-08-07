import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { dataset, projectId } from "./sanity/env";
import { schemaTypes } from "./sanity/schemas";
import { structure } from "./sanity/structure";

/**
 * Document types with a FIXED set of documents — no create/delete/duplicate.
 * `legalPage` is here for the same reason as the true singletons: the site has
 * exactly two legal documents, both pinned by id in the structure, so a third
 * one created from the global menu would be an orphan with no route.
 */
const SINGLETONS = new Set(["siteSettings", "navigation", "legalPage"]);

export default defineConfig({
  name: "default",
  title: "Fred's Plumbing",
  basePath: "/studio",
  projectId,
  dataset,
  plugins: [structureTool({ structure }), visionTool()],
  schema: {
    types: schemaTypes,
    // One trustLogo type, two Studio lists: creating from a list pre-sets
    // the category that puts the document in that list (sanity/structure.ts
    // wires each list to its template).
    templates: (prev) => [
      ...prev,
      {
        id: "trustLogo-vendor",
        title: "Vendor platform / partner",
        schemaType: "trustLogo",
        value: { category: "vendor-portal" },
      },
      {
        id: "trustLogo-badge",
        title: "Certification / association badge",
        schemaType: "trustLogo",
        value: { category: "credential" },
      },
    ],
  },
  document: {
    // Hide singletons from the global "create new document" menu; the bare
    // trustLogo template hides too so the global menu offers the two
    // labelled variants instead of an ambiguous third.
    newDocumentOptions: (prev, { creationContext }) =>
      creationContext.type === "global"
        ? prev.filter(
            (template) =>
              !SINGLETONS.has(template.templateId) &&
              template.templateId !== "trustLogo",
          )
        : prev,
    // Strip destructive actions from singletons.
    actions: (prev, { schemaType }) =>
      SINGLETONS.has(schemaType)
        ? prev.filter(
            ({ action }) =>
              action !== "delete" &&
              action !== "duplicate" &&
              action !== "unpublish",
          )
        : prev,
  },
});
