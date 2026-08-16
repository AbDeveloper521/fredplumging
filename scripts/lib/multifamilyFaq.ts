/**
 * The decision logic behind `scripts/append-multifamily-faq.ts`, kept apart
 * from the client and the transaction so it can be exercised against fixture
 * documents without touching a dataset — the append is idempotent by this
 * logic, and that is the property worth being able to test offline.
 *
 * Nothing here writes anything. It answers two questions per document:
 * does it already carry a Q&A band, and where would the new one go.
 */
import { MULTIFAMILY_FAQ_SET, MULTIFAMILY_FAQ_SET_ID } from "../../data/faqSets";

export type Raw = Record<string, unknown>;

/** The section `_key`, stable across every page so diffs stay readable. */
export const BAND_KEY = "multifamily-faq";

export interface Target {
  id: string;
  /** How many sections the document has today (the band goes after them). */
  length: number;
  /** True when a faqBand is already there — skip, this is the idempotency. */
  hasBand: boolean;
  /** Set when `sections` is absent/empty and must be created outright. */
  createArray: boolean;
  /** A different key, in the unlikely case BAND_KEY is already taken. */
  key: string;
}

/** The section to append — a reference, never a copy of the questions. */
export function bandSection(key: string = BAND_KEY): Raw {
  return {
    _type: "faqBand",
    _key: key,
    source: "set",
    faqSet: { _type: "reference", _ref: MULTIFAMILY_FAQ_SET_ID },
    hidden: false,
  };
}

/** The FAQ set document, with `_type`/`_key` on every question. */
export function faqSetDocument(): Raw {
  return {
    _id: MULTIFAMILY_FAQ_SET_ID,
    _type: "faqSet",
    title: MULTIFAMILY_FAQ_SET.title,
    ...(MULTIFAMILY_FAQ_SET.heading ? { heading: MULTIFAMILY_FAQ_SET.heading } : {}),
    ...(MULTIFAMILY_FAQ_SET.intro ? { intro: MULTIFAMILY_FAQ_SET.intro } : {}),
    items: MULTIFAMILY_FAQ_SET.items.map((item) => ({
      _type: "faqItem",
      _key: item._key,
      question: item.question,
      answer: item.answer,
    })),
  };
}

/** Reads one document and decides what, if anything, happens to it. */
export function inspect(id: string, doc: Raw): Target {
  const sections = Array.isArray(doc.sections) ? (doc.sections as Raw[]) : [];
  const hasBand = sections.some(
    (section) => section && section._type === "faqBand",
  );
  const keys = new Set(sections.map((section) => String(section?._key ?? "")));
  return {
    id,
    length: sections.length,
    hasBand,
    createArray: sections.length === 0,
    key: keys.has(BAND_KEY) ? `${BAND_KEY}-2` : BAND_KEY,
  };
}

/**
 * The document state a successful append produces — the input to a second
 * run, so idempotency can be checked without a round trip to the dataset.
 */
export function afterAppend(doc: Raw, target: Target): Raw {
  const sections = Array.isArray(doc.sections) ? (doc.sections as Raw[]) : [];
  return { ...doc, sections: [...sections, bandSection(target.key)] };
}
