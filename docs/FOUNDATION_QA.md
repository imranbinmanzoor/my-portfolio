# Original foundation pilot — verification

Date: 2026-09-19. Source branch: codex/original-design-foundation.
Build source digest: 7a35ed57df7194af9b0a0f1801f97ffbf4b3587d7448be125c6c0c5728ce1cab.
Immediate production rollback source: 055b4c078c82c935818541dbce21b44e604c7135.

## Automated and output checks

- Build executed twice: all 63 output files byte-identical; 20 HTML routes.
- npm run check: 43 passed, 0 failed on this build.
- Checks include local URLs/IDs, JavaScript syntax, public boundaries, authored book data/bank hashes, Class 9 reading SVG preservation, and Practice regression cases across 100 seeds.
- .nojekyll is upload metadata; 62 files are expected to be publicly served. Live comparison is recorded after deployment.
- Records: ignored test-results/check.json and foundation-reproducibility.json. Preservation does not establish mathematical correctness.

## Actual Browser coverage

Final matrix: 10 representative routes at each of 1440, 768, 430 and 320px (40 unique observations): home, library, Class 10 overview, Exercise 1.1, Practice, Class 9 overview, project index, Omnifood case page, tutoring and planned Class 11.
No document/frame horizontal overflow, broken loaded images, KaTeX error elements, JavaScript exceptions or failed requests appeared in these bounded route checks. Each diagnostic window was untruncated. Screenshots were captured for all observations; representative changed states were visually inspected. This does not certify every possible state or device.

Additional boundary samples during implementation: 481, 799, 800, 1024, 1199, 1200 and 1280px. Desktop frame and sidebar remain aligned while the body scrolls; mobile uses the document. At 1440px, both frame and rail start at 16px. Breadcrumb height is 45px. Deep compact links clear the breadcrumb, local navigation and restored 36px question label: the target lands at 166px on 1440px desktop and 150px on 320px mobile, 16px beneath the marker. Class 9 and Class 10 markers were observed at 114px on desktop; Class 10 handover from Question 1 to Question 2 was checked. Class 9 Examples navigation lands below its controls. Parent Class 10 breadcrumb returns to the overview. In the generated paper only the return control is sticky.

Interaction evidence covers menu focus cycling/Escape/return and inert background; mobile header direction and desktop reset; discipline open/switch/close with keyboard; homepage anchors; empty/typed/cleared search; Practice search results and back/forward; Review MCQ feedback; Class 9 paper generation; Class 10 marks, long questions, randomization and lowercase answer keys. Dark home/library/reading/Practice were sampled. The latest card connector measured zero left/bottom error and less than 0.001px width error in the desktop sample.

Contact validation and success were checked in Browser. Success used a temporary exact-action fetch mock at desktop and 320px: one intercepted request, prominent status focus, animated check and Send another message restoring blank fields/name focus. The mock was restored and removed. No external message was sent and delivery itself was not tested.

Evidence: ignored foundation-verified-layout.json (matrix with asserted actual viewport width), foundation-search-controls.json, foundation-connected-cards.json and other foundation records. Screenshots are in the local Codex visualization directory with foundation- prefixes, including verified-<route>-<width>, reading-nav-final-desktop, reading-nav-final-320, connected-card-final, contact-success-final-320 and paper-return-final-320. Earlier intermediate screenshots may show defects corrected later; use the named final evidence.

## Final explorer and type checks

The complex-number widget was replaced with an opening explorer covering patterns, curves and chance. Model checks cover all ten square widths; every quarter-step tangent position from minus two to two; and exhaustive binary outcome counts for every coin-toss count from two through twelve. Known assumptions and non-exact percentage rounding are explicit. These are mathematical checks of this artifact, independent of browser rendering.

Actual Browser interaction covered tab arrow keys, slider Home/End and intermediate values, one/hundred-tile squares, negative/zero/positive tangent slopes, magnification, probability endpoints and clamping the chosen head count when the toss count decreases. Open explanations were inspected at 1440, 768, 430 and 320px; dark mode was sampled. A coordinate-label overlap and unwanted formula scrollbar were found and corrected. Changed homepage states were rechecked after the last adjustments; other matrix routes were unaffected by those homepage-only changes. Records: foundation-explorer.json and screenshots foundation-lab-*, foundation-home-final-1440, foundation-question-sticky-1440/320 and foundation-question-class9-1440.

Measured intro typography is identical across library, projects, tutoring and published-book overview: Inter; eyebrow 11px/16.5px with weight 500; title 34px/39.1px with weight 600; lead 15px/27px with weight 400. Eyebrow bottom margin is 12px and lead top margin is 20px. Library/project/tutoring text edges match; the book cover deliberately precedes its text column. Evidence: foundation-type-roles.json.

## A4 proof inspection

The real Print workflow's prepared DOM was captured locally, then rendered with installed Edge headless and inspected with Poppler. This is a print-DOM fallback, not native in-app PDF export. The questions proof has 2 A4 pages; the questions plus worked-key proof has 10 A4 pages, 594.96 by 841.92pt. Objective/Subjective start on separate pages and preserve separate timing, total marks, student header fields, short/long parts and option layout.

A derivation crossing a bottom margin was found and corrected: native details contents and the answer-stack grid now yield to normal block fragmentation during worked-key printing, and a short stage stays with its derivation. All 10 pages of the final foundation-worked-verified proof were visually inspected. Both question pages were inspected. PDF files and snapshots remain under ignored .local/.

## Limits and follow-up

No physical touch-device certification, broad cross-browser certification, exhaustive accessibility certification or independent full mathematics audit is claimed. Wide mathematics still requires local horizontal scrolling on narrow phones. Class 9 original authoring-source recovery, historical-unit recovery, editorial correctness, and incremental common book-engine consolidation remain separate work. The original archive remains unmodified. This release is for live visual review under standing publication authorization.

## Publication verification

Released as `e14dc18dc9752407e0240411164af993ef3883a5` through the [successful Pages workflow](https://github.com/imranbinmanzoor/my-portfolio/actions/runs/35445626091). All 62 served files compare byte for byte with the local build. AGENTS.md, content/library.json, docs/PROJECT_STATE.md and the private release helper return 404 publicly.

Actual HTTPS Browser checks covered home at 1440px, library at 430px, Class 10 compact reading at 320px, Class 9 at 768px and Practice at 1440px. The explorer's live Chance controls produced the expected one-head probability in two tosses. Paper generation and the lowercase answer key worked; only paper-return was sticky. The mobile question marker is 36px tall at 98px, with the compact target at 150px. Final bounded route diagnostics are untruncated with no exceptions or network failures, and no overflow, broken loaded images or KaTeX errors. The first capture after changing origins was truncated and discarded, then repeated successfully.

Records: test-results/live-release.json and foundation-live-browser.json. Screenshots: foundation-live-home-1440, foundation-live-library-430, foundation-live-compact-320 and foundation-live-class9-768. Rollback remains `055b4c078c82c935818541dbce21b44e604c7135`. The release is for continued visual review; mathematics editorial/source-recovery work remains outstanding.
