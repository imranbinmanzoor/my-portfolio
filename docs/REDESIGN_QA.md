# Broader redesign verification

Date: 2026-09-19. Local branch: `codex/site-wide-redesign`. Not published.
Source digest: `7cb70abac538ffb5bf1b49ff53b746fbc645ff944ab58f779287d2d1928fdd28`.
Live recovery point: `1478f06bfc0a8aa679564497bb2c94f2a31b8034`.

## Automated checks

- Final `npm run build`: 20 HTML routes, 54 output files.
- Final `npm run check`: **38 passed, 0 failed**. Results: ignored `test-results/check.json`.
- Repeated build: all 54 output files byte-identical.
- Authored Class 10 content, both banks, item IDs and Class 9 reading SVGs match the
  baseline preservation hashes. Existing Practice selection/serialization regressions pass.
- Added a typography regression: bare Re/Im function notation is made upright inside
  math delimiters while existing TeX and prose remain unchanged.
- `git diff --check` passes. No production branch push or deployment performed.

## Browser measurements

Actual built-in Browser, local preview, 320 / 430 / 768 / 1440 CSS-pixel widths.
The final matrix has 40 route/state observations, all with zero document-width overflow
and exactly one visible h1. Measurements: ignored `test-results/redesign-responsive.json`.

| Screen | Route/state |
|---|---|
| Homepage | `/` |
| Library | `/solutions/` |
| Class 9 overview | `/solutions/class-9/` |
| Class 10 overview | `/solutions/class-10/` |
| Compact solution | Class 10 Exercise 1.1, Q1(i), compact anchor |
| Practice settings | Class 10 Unit 1 generator |
| Tutoring | `/tutoring/` |
| Projects index | `/projects/` |
| Case study | `/projects/omnifood/` |
| Planned book | `/solutions/class-11/` |

Viewport screenshots were captured for the matrix. Representative screens and changed
states were visually inspected, including desktop selected work/contact, portfolio case
study, Class 9 reading/number controls, and dark homepage/Class 9/Class 10 lessons/Practice.
The screenshot directory is:
`C:/Users/imran/.codex/visualizations/2026/09/19/01a0b813-35c5-7932-b1c0-7d287e96cc81/`.
Files use `redesign-{screen}-{width}.jpg`, plus named interaction/appearance captures.
Full-page stitched images duplicated segments in this Browser; use viewport captures.

Measured contact controls: height 52px; decorative select-chevron inset 16px. After
scroll animation settled, Contact began at 99.95px below a 76.67px header. Focus moved
to the section. Inter italic 400 was loaded in Browser; font-synthesis-style is `none`.
Dark compact hint ink resolves to rgb(164,188,224), with transparent hint backgrounds.

## Interactions actually exercised

- Homepage multiplication rotates the point from 3+4i to -4+3i; Reset restores it.
- Mobile menu opens with Close focused, keyboard focus stays inside, Escape returns
  to Open menu. Contact form was not submitted.
- Book unit filtering, no-result state, chapter visibility and start-reading links.
- Class 10 search from Practice (conjugate), result navigation, browser Back/Forward.
  Search placement was corrected for the new desktop grid and rechecked at 868px wide.
- Desktop Down-arrow moves Review to Practice; mobile exposes horizontal tab orientation.
- Review Q1(i), option b reports Correct and exposes its solution disclosure.
- Compact deep-link opens its solution. Long mathematics stays within local scrolling
  regions; document width is preserved on narrow screens.
- Class 10 custom paper and 75-mark unit-test generation; Objective randomization changes
  the paper; answer key and a worked-answer disclosure open.
- Generated paper view has only `.paper-return` sticky at desktop and 320px. Randomize
  controls precede the paper; Print/Save/Answer key follow it. Narrow options are measured
  as two columns and render in a/b then c/d rows; desktop fitting can use four columns.
- Class 9 generation and labelled number stepper: increment changes 8 to 9. The default
  60-minute value now falls within its declared 1–180 input range.
- No Runtime exceptions or Network loading failures were observed in the bounded
  route-matrix event window; the event read was not truncated. No KaTeX errors in sampled
  generated paper and compact-solution states.

## A4 inspection

Captured the actual prepared Class 10 Print DOM for Questions only and Questions + full
working. The built-in Browser's PDF export is unavailable; installed Edge headless rendered
those local snapshots with the current CSS. The temporary print capture hook was restored,
and the interactive page exited its printing state. No contact/student information was used.

- Question paper: **3 A4 pages**, approximately 595 × 842 points. All three were inspected.
  Objective is page 1; Subjective starts page 2. Separate times (20 minutes / 2 hours
  10 minutes), 75 total marks, Name/Roll number/Date and attempt instructions are present.
- Full working: **42 A4 pages** for this full unit test; all rendered to PNG. Representative
  pages 4, 29 and 42 were visually inspected for formulas, hints and marking guides.
  This is not a claim of mathematical review or full manual inspection of all 42 pages.
- Local evidence: `.local/redesign-paper.pdf`, `.local/redesign-worked.pdf`, corresponding
  page PNGs and ignored `test-results/redesign-print.json`. These are QA artifacts, not
  public site output. The print CSS was not redesigned in this pass.

## Limits and next review

The owner has not accepted this new visual direction. No live verification is claimed
for these local changes. Browser testing is viewport emulation, not physical-device,
screen-reader, or cross-browser certification. External project demos, form delivery,
all historical content anchors and every possible question combination were not retested.

Class 9 retains its recovered legacy Practice renderer and paper conventions; it now
shares the visual foundations/overview/reading layout, but complete cross-book Practice
consolidation remains separate work. Its original authoring source is still missing.
No exhaustive mathematical correctness audit, every-solution typography review, or
restoration of unpublished units has been claimed. Remaining organization/date claims
retain prior site provenance and need factual review before a final publication decision.
