# Project state

Updated: 2026-09-19. Phase: verified local visual pilot, awaiting owner review.

## Accepted baseline and authority

- Production/recovery commit: `7a2d89409c81312b0439727e18dd93724357968e`.
- Repository: `imranbinmanzoor/my-portfolio`; domain: `imranbinmanzoor.com`.
- Working branch: `codex/portfolio-math-pilot`.
- Pre-existing untracked file: `PORTFOLIO_MATH_CODEX_BRIEF.md`; preserve without staging.
- User authorizes routine engineering and local commits. Visual approval precedes full
  rollout; separate explicit approval precedes production publication.
- The read-only audit task **Full website audit before redesign** completed before any
  implementation. Audit task ID: `01a0b80d-e741-7533-b84d-854aac1f80da`.
  Its final report is the baseline evidence, not a fresh audit by this task.

## Audit evidence and implementation priorities

1. Root HTML contains patch text and an embedded older Class 10 document. Production
   matches it and is in quirks mode. Recover the intact portfolio without losing real content.
2. Homepage/library claim three Class 10 units; current book has only Complex Numbers.
3. Class 9 has only rendered SVG mathematics; the original authoring pipeline is absent.
4. Class 10 JSON, TeX, CSS, and runtime can be extracted, but its original assembly sources
   and tests are absent. Preserve edition/provenance and saved-paper identities.
5. Both books lack return navigation. Mobile menu focus escapes. Class 10 search shows
   raw TeX. Old `#unit-1` bookmarks fail. Canonicals are missing on the books.
6. No build/check/preview workflow or public-output boundary exists.

The audit found one published unit in each book: Class 9 Real Numbers (367 bank items),
Class 10 Complex Numbers (388 bank items). Remaining contents entries are not published.
Historical Class 10 at `ff3fe31` has Units 1–6; `7dcf3a5` has Units 1, 2, 6. Those revisions
remain recoverable in Git; restoration requires content comparison and mathematics review.

## Source strategy for the pilot

Recover separated sources into `src/`, book data into `content/books/`, static assets
into `public/`, and build an allowlisted `dist/` locally. Preserve the tracked production
snapshot at root until release planning. This is a reversible pilot, not an approved
Pages publishing migration. Do not push this source branch to the publishing branch.

Class 9 SVG preservation does not reconstruct its missing LaTeX or certify its mathematics.
Class 10 uses an extracted compatibility runtime during the pilot. The subsequent approved
rollout will consolidate the reusable book/practice interface across books incrementally.

## Current work

- Repository instructions and audit handoff read; production baseline observed in Browser.
- Dedicated local branch created; no changes to production or external settings.
- Recovered the intact homepage and separated page sources, book data, styles, runtimes,
  static assets, and generated output. Build has 20 HTML routes and 52 output files.
- Extracted shared Practice selection/serialization and UI modules without changing
  bank identities or paper compatibility. Cross-book UI consolidation remains incremental.
- Added `npm run build`, `npm run check`, and `npm run preview` with no package install.
  Preview serves only `dist/` at `http://127.0.0.1:4173/`.
- Fixed malformed homepage output, availability claims, missing project/legacy routes,
  book return navigation/canonicals, raw-TeX search, legacy unit bookmarks, menu focus,
  anchor history/focus, and narrow-screen overflow.
- Completed the four-screen pilot: portfolio home, library, Class 10 Exercise 1.1 and
  Practice. The owner requested a portrait-free alternative, corrected location to
  Layyah, and required standard LaTeX typography. The hero now contains an original
  interactive complex-plane study integrated with the page palette and KaTeX fonts.
  Personal copy is calmer and grounded in project/public evidence; see PROFILE_AND_VOICE.md.
- Follow-up precision pass standardized card gaps, aligned proof footers and field heights,
  inset the dropdown arrow, corrected root-relative anchor focus/offset, and verified
  genuine italic fonts with synthetic slant disabled.
- Final automated checks: 35 passed, zero failed. Two builds: 52 byte-identical files.
  Four screens at four viewport widths, keyboard/search/paper/key checks, and A4 proofs
  inspected. Exact evidence, build identity and limitations: `docs/PILOT_QA.md`.
- Existing authored book data and Class 9 reading SVGs remain unchanged. Their preservation
  does not certify mathematical correctness. No production publication or push occurred.

## Next checkpoint

Present the tested pilot and source structure for visual approval. Recommended direction:
personal portfolio led by real work, cool shared foundations, working mathematical visuals,
and task-specific lesson/Practice layouts. Preserve the owner's standard typography rules.

After approval: roll out the design, consolidate reusable book rendering across Classes
9–12, review mathematics/editorial content independently, recover missing authoring material
where possible, complete full-site QA and verify actual Pages settings. Prepare the concrete
release/rollback procedure and request separate approval before production publication.

After the website is complete, revise the owner's entire LinkedIn profile using accepted
positioning and verified facts. This follow-on request is recorded; no profile edits yet.
