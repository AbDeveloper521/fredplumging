# Claude Code prompt — separate "Certification & Association Badges" from "Partners & Vendor Systems"

## The problem, confirmed in code

The owner is about to upload six certification/association badges (AAGD, Fort Worth
Apartment Association, NMSDC MBE, Minority Owned Business, TSBPE, TDLR). The new
`AssociationBadgeStrip` on service pages correctly filters `getTrustLogos()` by category —
but the **vendor-facing strips do not filter**: check `TrustBar` (homepage) and
`ComplianceSection`'s logo row — they render every `trustLogo` document regardless of
category. Upload a TDLR badge today and it appears merged into the vendor platform strips
next to VendorCafe and RealPage. The owner wants the two groups fully separate — separate
on the pages AND as two separate places in Studio.

## The fix — one document type, two filtered experiences

Do **not** create a second document type. A parallel `certificationBadge` type would
duplicate the schema, fetcher, image handling and cache wiring for no benefit. The
`category` field already distinguishes them; what is missing is filtering at both ends:

### 1. Filter the vendor strips (the actual bug)

Define the two category sets once, next to the existing allow-lists in `data/navigation.ts`
(`ASSOCIATION_BADGE_CATEGORIES` already exists — add its complement, e.g.
`VENDOR_PLATFORM_CATEGORIES`, derived so the two sets partition `TRUST_LOGO_CATEGORIES`
with no overlap and no orphan; add a unit-style assertion or a comment-enforced check in
`check:drift` if that script validates data invariants).

Then make every vendor-facing consumer filter to vendor categories:

- `TrustBar` (homepage strip)
- `ComplianceSection` logo row
- any other `getTrustLogos()` consumer found by grep, **except** `AssociationBadgeStrip`
  (which keeps its association/credential filter) — audit and list them all in the report.

Decide and state what happens to a logo with **no category set** (legacy documents): it
should keep appearing where it appears today (vendor strips) so nothing published silently
vanishes — treat uncategorised as vendor, and note in the report which live documents are
uncategorised so the owner can tidy them in Studio.

### 2. Split the Studio experience (what the owner sees)

In the Studio structure (`sanity/structure.ts` or wherever the desk structure lives), turn
the single "Partners & Vendor Systems" list into two filtered lists of the same type:

- **Partners & Vendor Systems** — documents whose category is a vendor category (or unset).
- **Certification & Association Badges** — documents whose category is `association` or
  `credential`.

Use `S.documentTypeList`-style filtered lists with GROQ filters. Give each list an initial
value template so a document created from the "Certification & Association Badges" list is
**pre-set to the credential category** (the single most likely one), and one created from
Partners & Vendor Systems pre-sets the platform/vendor category — the owner should not have
to remember the category field for the common case; it should just land in the list he
created it from. The category field stays visible and editable inside the document.

Field description updates: on `category`, spell out the routing in owner language — "Vendor
platform categories appear in the partner strips on the homepage; Trade association and
Certification categories appear in the credentials strip on every service page."

### 3. No dataset writes

The owner's four existing vendor logos keep working untouched (they either have vendor
categories or none). Do not patch any documents; the Studio split and page filters are all
code. If any existing published document already carries `association`/`credential` (the
report from the badge-strip task said the fallback data got categories — check the
*dataset*, not just the fallback), list them so the owner knows they will move lists.

## Verify

1. `npx tsc --noEmit`, lint, build, typegen, `check:drift` — clean.
2. With a draft credential-category logo (discard after): it appears in the service-page
   badge strip and does NOT appear in the homepage TrustBar or the compliance row. And the
   inverse: a vendor-category draft appears in the vendor strips, not the badge strip.
3. Studio sidebar shows the two lists; creating from each pre-sets the right category;
   existing vendor logos appear only under Partners & Vendor Systems.
4. Homepage renders pixel-identically with the current dataset (all existing logos are
   vendor/uncategorised).
5. One commit.

## Report

Every `getTrustLogos()` consumer and which filter it got; the uncategorised-document
handling; any live document that will change lists; and the owner's final workflow in two
sentences (which Studio list to open for badge uploads, and confirmation the category is
pre-filled).
