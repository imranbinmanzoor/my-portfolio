# Project state

Updated: 2026-09-19. Phase: published direction rejected by owner; detailed inspection
of the owner's original design completed; new foundation selected.

## Current production release

- Live site: https://imranbinmanzoor.com/
- Published source: `055b4c078c82c935818541dbce21b44e604c7135` (redesign implementation: `0822093`).
- Successful [Pages run](https://github.com/imranbinmanzoor/my-portfolio/actions/runs/35430190214).
- Source digest: `7cb70abac538ffb5bf1b49ff53b746fbc645ff944ab58f779287d2d1928fdd28`.
- All 38 checks passed locally; GitHub's build/check job succeeded. All 53 publicly served files
  match the local output byte for byte. `.nojekyll` is upload metadata and is not served.
- Pages now publishes a checked `dist/` artifact. Custom domain and enforced HTTPS remain
  unchanged; the `github-pages` environment still permits only `main`.
- Actual live Browser checks covered home/library, Class 10 compact/search/Practice,
  paper generation/randomization/keys, Class 9 overview, mobile navigation and legacy
  links, with responsive samples at 320/430/768/1440px. Evidence: `docs/REDESIGN_QA.md`.
- Previous checked release / rollback: `1478f06bfc0a8aa679564497bb2c94f2a31b8034`.
  Its digest is `afc43465ab6771612db9f23e68e14f303f839762e1841fc723fe6bbd49a42071`.
- Pre-pilot recovery point: `7a2d89409c81312b0439727e18dd93724357968e`.
  Use the documented recovery procedure; the old source has no new build pipeline.

## Accepted baseline and authority

- Pre-pilot production/recovery commit: `7a2d89409c81312b0439727e18dd93724357968e`.
- Repository: `imranbinmanzoor/my-portfolio`; domain: `imranbinmanzoor.com`.
- Working branch: `codex/original-design-foundation`, branched from documentation
  milestone `4963915` after the broader redesign release.
- Pre-existing untracked file: `PORTFOLIO_MATH_CODEX_BRIEF.md`; preserve without staging.
- User authorizes routine engineering and local commits. On 2026-09-19 the owner requested
  publication of the broader redesign and gave standing approval: "whatever new update,
  push it live to visualize". Publish completed, checked website updates and verify live
  without another publication question. This supersedes the earlier per-release approval
  requirement. Live visual review does not imply final acceptance of the direction.
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
snapshot at root. The approved release uses a Pages workflow that builds and publishes
only `dist/`; root publishing would otherwise serve the old snapshot and expose source files.
Do not restore repository-root publishing while `main` contains these source files.

Class 9 SVG preservation does not reconstruct its missing LaTeX or certify its mathematics.
Class 10 uses an extracted compatibility runtime during the pilot. The subsequent approved
rollout will consolidate the reusable book/practice interface across books incrementally.

## Completed pilot history

- Repository instructions and audit handoff read; production baseline observed in Browser.
- Dedicated branch created; pushed to GitHub and fast-forwarded into `main` after approval.
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
- Local milestone `cf82aef` saved the recovered sources and tested pilot. The owner's
  subsequent width feedback led to shared 1180px desktop frames (1100px inside gutters)
  for book contents/navigation and Practice settings; lesson and paper reading widths
  remain narrower intentionally. This refinement remains part of the visual pilot.
- Final automated checks: 35 passed, zero failed. Two builds: 52 byte-identical files.
  Four screens at four viewport widths, keyboard/search/paper/key checks, and A4 proofs
  inspected. Exact evidence, build identity and limitations: `docs/PILOT_QA.md`.
- Existing authored book data and Class 9 reading SVGs remain unchanged. Their preservation
  does not certify mathematical correctness. The approved pilot is now published.
- Initial release `54e7efe` deployed successfully. Live byte comparison found that zlib's
  gzip header recorded Windows versus Linux in its OS byte. Release `1478f06` normalizes
  that informational byte to RFC 1952's unknown value. The decompressed bank is identical;
  all served files now match across the two build platforms.

## Broader redesign — published history

The owner requested a real redesign instead of a consistency-patching pass.
The published implementation now includes:

- A fresh work-led homepage: original mathematical study, selected projects, research
  ledger, teaching, background and contact; repeated overview grids removed.
- Shared typography, colour, appearance, header and footer; distinct layouts for the
  library, project index/case studies and tutoring.
- A common book-overview renderer and Class 9 catalog metadata. Reading SVGs, authored
  Class 10 JSON and both banks remain preserved.
- Desktop section rails for both books, horizontal navigation on smaller screens,
  search placement, and Practice theme/control integration.
- Upright named operators in rendered Class 10 math; underlying content identity and
  paper serialization remain unchanged.
- Obsolete pilot styles removed. Historical root files and the owner's brief untouched.

Evidence: docs/REDESIGN_QA.md. Direction: docs/REDESIGN.md and docs/DESIGN_SYSTEM.md.
The deployed rollback point remains 1478f06bfc0a8aa679564497bb2c94f2a31b8034.
Published through the checked Pages workflow on 2026-09-19 for the owner's live review.

## Original design foundation — current work

The owner found the published design too typical and supplied their own older, unfinished
portfolio. They explicitly requested minute visual, responsive and JavaScript inspection,
including mobile scroll behavior. Its character is the new visual foundation; the earlier
blue direction is no longer the aesthetic target.

The archive was extracted without modification under ignored `.local/` and previewed on
loopback port 4180. Inspection covered all nine pages, 137 page/viewport observations,
145 default/hover control pairs, keyboard/navigation behavior, galleries, card disclosures,
all four JavaScript files and locally simulated contact-form states. Exact evidence,
working behaviors, reproducible defects, design decisions and limitations are recorded in
`docs/ORIGINAL_DESIGN_REVIEW.md`. Raw records are in ignored `test-results/`; screenshots
and a local visual atlas are outside public output. Native physical touch remains untested.

No production sources or archive contents changed during this inspection. Production
remains `055b4c078c82c935818541dbce21b44e604c7135`; use this as the immediate recoverable
source for the next design implementation. The earlier rollback remains documented above.

## Next checkpoint

Build the representative home/library/lesson/Practice implementation from the original's
neutral panels, compact personal navigation, colored discipline details and deliberate
interactions. Retain the maintained static build and recovered book/runtime boundaries.
Use verified current biography, keep Layyah, and do not restore the old portrait without
a new owner instruction. Give the mathematical artifact a deliberate place in the new
composition. Validate the new pilot and publish checked website updates for live review
under the standing approval. Publication does not mean final aesthetic acceptance.
The separate mathematics work still includes independent editorial/correctness review,
Class 9 authoring-source recovery and further shared Practice/renderer consolidation.
A visual redesign does not complete those tasks.

After the website is complete, revise the owner's LinkedIn profile using accepted
positioning and verified facts. No LinkedIn profile edits have been made.
