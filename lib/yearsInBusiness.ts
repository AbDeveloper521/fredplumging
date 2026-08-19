/**
 * The years-in-business figure, derived from ONE number: `foundedYear`.
 *
 * Every "30+ years" claim on the site and in the transactional emails comes
 * through here. It is a plain, pure function on purpose — the site reads it
 * behind a `'use cache'` boundary (`sanity/lib/getSite.ts`, where reading the
 * clock is only allowed inside a cache scope), the email path reads it
 * directly at send time. Both get the same answer from the same rule, so the
 * figure can never quietly age or disagree with itself the way the old
 * hardcoded "27+" did.
 *
 * ⚠️ Never write the figure out as a literal ("30+", "30 years in DFW").
 * Call this.
 */
export function derivedYearsInBusiness(
  foundedYear: number,
  now: Date = new Date(),
): string {
  return `${now.getFullYear() - foundedYear}+`;
}
