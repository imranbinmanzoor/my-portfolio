# Preview, Check, Build

Node 22+ is required (tested here with Node 24.20.0). No package installation is needed.

```powershell
npm run build
npm run check
npm run preview
```

Preview: `http://127.0.0.1:4173/`, serving only `dist/`. Set `$env:PORT` to choose
another port if occupied; never stop another project's server. Stop this server
with Ctrl+C. Reload Browser after a build. Build and Check never publish.

`check` validates public-output boundaries, HTML document structure/IDs, local file
targets, JavaScript syntax, exact embedded data hashes, question counts/IDs, Class 9
SVG preservation, and publication metadata. Practice regression cases exercise 100
seeds, unique calculations, attempt-based marks, split timing, code round trips,
option-answer consistency, invalid inputs, partial randomization and the unit-test pattern.
Details are written to ignored `test-results/check.json` with the build identity.

`check` also runs `tests/site.mjs`: locked mathematics sources match `tests/locked-sources.json`
byte for byte; no page loads third-party scripts, styles or fonts; the skip link is the first
focusable element and targets a visible element; headings keep word spacing; portfolio copy
uses US spelling; stylesheets use range media queries; homepage anchors and project data agree;
the contact form validates natively without script and each field is described by its error.
Each of these checks fails on the pre-audit build (8421208) for the defect it names.

## Browser regression suite

`tests/browser.mjs` drives Chromium through real interactions on a served build and checks
outcomes: keyboard scrolling and scroll restoration, skip links, in-page link focus and offset,
current-section marking, theme persistence (including blocked storage), work-map keyboard
tabs, the project browser, every contact-form state against an intercepted endpoint (nothing
is sent), 404 status, legacy redirects with fragments, Class 10 exercise routing, search and
Practice, Class 9 views, the library explorer deep link, case-study gallery and dialog, the
phone menu (focus trap, scroll lock, Escape, resize), reduced motion, JavaScript disabled, and
unreachable third-party hosts.

```powershell
npm run build
npm run preview                      # keep running
npm i --no-save playwright@1.56.0    # not a project dependency
npx playwright install chromium
node tests/browser.mjs http://127.0.0.1:4173 --json test-results/browser.json
```

## Browser checks

For every changed major screen inspect 1440px desktop, 768px tablet, 320px narrow mobile,
and 430px wider mobile; include intermediate breakpoints when needed. Save and inspect
screenshots. Verify document scroll width against client width; keep wide mathematics
inside its own scrolling region. Revisit corrected states on the final build.

Check real menu focus cycling and Escape return, site/book navigation and browser
back/forward, search with mathematics, disclosures, compact solutions, Review MCQs,
Practice configuration, generation, choices, randomization, restore, recall, keys,
lowercase letters, measured MCQ option rows, and invalid settings preserving the paper.
Do not submit the contact form as a QA shortcut.
Measure dropdown arrow insets against field padding and repeated control heights.
Verify genuine italic font faces are loaded and synthetic slant is disabled. Test actual
header/menu links as well as direct hashes: labels must clear the fixed header and
same-page link activation must move keyboard focus to its destination.

Inspect console/runtime/network failures. A no-error JavaScript parse is not browser QA.
Viewport testing is emulation, not physical-device or cross-browser certification.
Content hashes prove preservation, not mathematical correctness.

## Print

Use the actual Print choices. Inspect A4 questions and worked-key proofs. Verify
Subjective begins on a fresh page, headers/marks/timing appear, options fit, and controls
do not print. Check that normal interactive state is restored afterwards.
This session's built-in browser reports PDF export unavailable. The fallback captures
the actual prepared print DOM in bounded chunks (large DOM strings are truncated),
retains its CSS and ancestor structure, and renders the local snapshot with installed
Edge headless. Proofs remain in ignored `.local/`; inspect with Poppler and pypdf.
Do not claim PDF success until a real file and page content have been checked.

Pilot evidence remains in `docs/PILOT_QA.md`; redesign evidence is in `docs/REDESIGN_QA.md`. Run the final build first,
then checks on those exact bytes. Keep successful test history separate from current results.

## Current foundation checks

For project cases, exercise every available device tab, verify captions/alt text and
constant gallery height, inspect actual image/frame bounds, enlarge and dismiss with
the close button and Escape, and check focus restoration. Follow breadcrumb, story and
previous/next links with navigation waits. Inspect all four cases and shared footers at
1440, 768, 430 and 320px. Confirm short-page footer placement and no horizontal overflow.
Current evidence: PROJECT_CASE_REVIEW.md. Repeat book/Practice smoke checks when shared
chrome changes; mathematical correctness and print testing remain separate requirements.

For the homepage work map, inspect all four fields at 1440, 768, 430 and 320px. Check
connector clearance against button bounds at 1440, 1043, 768, 700, 699, 430 and 320px,
including focused controls. Verify constant panel height between fields, no horizontal
overflow, desktop contact-row alignment, and DOM/focus order when crossing 700px.
Exercise Left/Right, Home/End and Tab; follow all four destinations and test back navigation.
Inspect light/dark appearance and the final screenshots. Evidence: HOME_WORK_MAP_QA.md.

Current evidence: FOUNDATION_QA.md. Verify the 800px scrolling-owner boundary and 1200px
personal-rail boundary; book unit navigation changes at 1000px. Check SiteScroll consumers,
anchor offsets, breadcrumbs, independent math overflow and resize transitions. Breadcrumbs
occupy one 45px row; the current question label adds 36px below the local section navigation. Verify handover at question boundaries and part/compact anchors clearing all three layers.
In generated Class 10 paper view only Back to paper settings stays sticky.

For discipline disclosures check open/switch/close at all four viewports, keyboard focus,
selected-title association, and measured connector joins at fractional browser scaling.
Contact success must be tested with an exact-endpoint mock restored afterwards, not a real
message. Check success focus, reduced motion, repeat-entry and failure retention.

Verify stationary button labels and consistent link underlines with pointer and keyboard. Compare the measured eyebrow/title/lead roles across catalogue, projects, tutoring and book overview; identical role values do not require identical page compositions.

The homepage must put the three professional roles immediately after its introduction, without explorer or KaTeX assets. The library explorer follows the book catalogue and starts collapsed. Check the homepage "Interactive ideas" link, direct hash navigation, back/forward, summary focus, Enter/Space disclosure control, and exclusion of collapsed content from Tab navigation. Check all three tabs, keyboard arrows/Home/End, slider endpoints, preserved per-view values, curve magnification, coin-count clamping, and closed/open explanations at all four viewport widths when those controls change. Inspect light/dark diagrams, top alignment and formula overflow. The pure-model checks independently count square cells, compare tangent properties, and exhaustively enumerate coin outcomes for every supported toss count. These checks do not certify the separate authored books.
