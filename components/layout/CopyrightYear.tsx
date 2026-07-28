"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};
const year = () => new Date().getFullYear();

/**
 * Current year for the footer copyright. Cache Components forbids
 * `new Date()` during prerender (a cached shell would bake a stale year),
 * so the year resolves at request/hydration time. The caller must wrap
 * this in <Suspense> — that boundary is what tells the prerenderer the
 * value is deliberately runtime.
 */
export function CopyrightYear() {
  return useSyncExternalStore(subscribe, year, year);
}
