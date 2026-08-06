# Claude Code prompt — job cards match the reference exactly, every visible word editable

## The gap the owner spotted

His reference card is minimal: **title → red "Full Time" label → description → Apply Now.**
The current cards add things his reference does not have: the red top bar, a
"Field Operations"/"Service" department chip, a red "2 positions"/"5 positions" line, and an
"Evening shift · 4 PM – 12 AM" chip. He wants the cards to match the reference — and every
word on the card editable from Studio.

## Changes

### 1. Simplify the card (`JobOpeningsSection` / the job card component)

Render exactly: title, the employment-type label in red ("Full Time"), the description, and
the Apply Now button. **Remove from the card**: the department chip, the positions-count
line, the shift chip, and the red top bar. Card styling stays consistent with the site
(rounded, shadow, equal heights, Apply pinned at the bottom).

Do NOT delete the underlying fields from the `jobPosting` schema — department, positions,
shift very likely render on the job **detail** page (`/about/careers/[slug]`) and are used
by the JobPosting structured-data gating. Check where each is used; the detail page keeps
them. Only the card stops showing them. If any field turns out to be rendered nowhere after
this change, report it — don't remove it unasked.

### 2. Every visible word comes from Studio — verify field by field

For each thing on the card, confirm it is editable in the Job Postings documents and fix
anything that isn't:

- **Title** — from `jobPosting.title`. (The reference says "Apprentice"/"Journeyman"; the
  documents currently say "Apprentice Plumber"/"Journeyman Plumber". Do not change the
  documents — titles are the owner's to edit in Studio; note the difference in the report
  so he can shorten them himself if he wants the reference wording.)
- **"Full Time" label** — check how employment type is stored. If it's an enum rendered as
  hardcoded display text, make the display string derive from the document value and confirm
  the value is editable; format as the reference writes it ("Full Time").
- **Description** — from the document. Verify the card shows the document text verbatim
  (no truncation that cuts mid-sentence — if the card clamps long text, clamp cleanly with
  line-clamp and confirm the full text lives on the detail page).
- **Apply Now** — label + target: check whether the label is hardcoded; make it an optional
  field on the careers page section (default "Apply Now") or the posting, whichever the
  existing structure suggests — and say which you chose.
- The band heading ("Work With a Company That Invests in Your Success") — editable via the
  careers page (the `careersPage` stack item if the CAREERS-PAGE-SECTIONS conversion has
  run; if it hasn't run yet, fold this task into that conversion rather than doing it
  twice — check the repo state first and say which path you took).

### 3. No dataset writes

Everything here is code + schema. The owner edits job text in Studio → Job Postings.

## Verify

1. `npx tsc --noEmit`, lint, build, typegen, `check:drift` — clean.
2. `/about/careers`: three cards showing only title / Full Time / description / Apply Now —
   visually matching the reference structure at 375/768/1024/1440.
3. Edit a job title in a local Studio draft (discard after) → card updates.
4. Job detail pages still show department/shift/positions where they did before; JobPosting
   structured-data behaviour unchanged.
5. One commit.

Report: where each removed chip still appears (detail page or nowhere); which fields needed
work to become truly editable; the title-wording note for the owner; and whether this was
folded into the careers-page conversion or applied on top of it.
