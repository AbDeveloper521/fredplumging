import type { RichBody } from "@/data/services";

export interface LegalHeading {
  /** Slugified, stable anchor id — `/terms-of-service#payments-and-billing`. */
  id: string;
  text: string;
}

/** Plain text of a Portable Text block, from its spans. */
function blockText(block: RichBody[number]): string {
  const children = block.children;
  if (!Array.isArray(children)) return "";
  return children
    .map((child) =>
      child && typeof child === "object" && typeof (child as { text?: unknown }).text === "string"
        ? (child as { text: string }).text
        : "",
    )
    .join("")
    .trim();
}

/** "Payments and Billing" → "payments-and-billing". */
export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * The `h2` blocks of a legal document, in order, with a stable anchor id each
 * — the "On this page" list and the rendered headings both read from this one
 * result, keyed by block `_key`, so an id can never differ between the two.
 * Repeated heading text gets a numeric suffix so ids stay unique.
 */
export function legalHeadings(body: RichBody): {
  headings: LegalHeading[];
  idByKey: Record<string, string>;
} {
  const headings: LegalHeading[] = [];
  const idByKey: Record<string, string> = {};
  const used = new Map<string, number>();

  for (const block of body) {
    if (block._type !== "block" || block.style !== "h2") continue;
    const text = blockText(block);
    if (!text) continue;
    const base = slugifyHeading(text) || "section";
    const seen = used.get(base) ?? 0;
    used.set(base, seen + 1);
    const id = seen === 0 ? base : `${base}-${seen + 1}`;
    headings.push({ id, text });
    idByKey[block._key] = id;
  }

  return { headings, idByKey };
}
