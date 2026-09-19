# Representative pilot — evidence and limits

Date: 2026-09-19. Branch: `codex/portfolio-math-pilot`. Pilot approved for publication.
Production rollback identity: `7a2d89409c81312b0439727e18dd93724357968e`.
Browser-reviewed pilot source digest: `6c05e36f200c6eb310706133aaf2316bca1fcda88abf4a364f9639afe95453d4`.

## Release preparation

The owner approved the visual pilot and requested early publication before further rollout.
`.gitattributes` now fixes text files to LF for reproducible Windows/Linux builds. Only
`src/assets/complex-study.css` required a local CRLF-to-LF change; there is no semantic CSS
change. Release digest: `a510818d1835a7f84afef86082c6af5e8807c7c3b0657b5f8036944abaaec7c2`.
Build and Check were rerun on these bytes: 35 checks passed, zero failed. Two consecutive
release builds produced 52 byte-identical files; see `test-results/reproducibility-release.json`.
The detailed browser matrix below retains its original build identity. Live release
verification and CI results will be recorded after publication; they are not yet claimed.

## Automated validation actually run

- `npm run build`: 20 HTML routes, 52 output files in allowlisted `dist/`.
- Two consecutive builds produced 52 byte-identical files.
- `npm run check`: **35 checks passed, 0 failed** on the final build.
- Checks cover HTML structure, local targets, emitted JavaScript syntax, public-output
  boundaries, manifest consistency, exact authored data hashes and question identities,
  and Class 9 SVG preservation. Both banks retain their 367 and 388 items.
- Practice checks run 100 seeds, question uniqueness, marks/attempts, section timing,
  paper-code round trips, correct option shuffling, partial randomization, invalid inputs,
  and the 75-mark unit-test pattern.
- Staged review identified trailing blank whitespace in four extracted files; it was
  removed without altering behaviour or content. Build and all 35 checks were rerun.

Machine-readable local results are in ignored `test-results/check.json`,
`test-results/reproducibility.json`, and `test-results/browser.json`.
The final browser matrix is recorded separately in `test-results/browser-final.json`;
earlier results remain historical evidence and are not relabelled as final-build runs.

## Browser and visual evidence

Actual built-in Chromium browser interaction, not source-only inspection. Viewports:
320 × 800, 430 × 932, 768 × 1024, and 1440 × 1000. All four representative screens
had document scroll width equal to client width, and zero visible KaTeX error nodes
in those sampled states. Screenshots were captured after viewport repaint and inspected.
After the desktop-width refinement, the final matrix additionally includes Class 9
contents and a lesson: **24 sampled states**, with no page overflow or KaTeX error nodes.
Class 9 mathematics is preserved SVG, so a KaTeX-node count does not validate that content.

- Homepage: portrait-free introduction, Layyah location, original live complex-plane
  study, shared palette, light/dark states, 200% root text at 430px without page overflow.
- Study: nine mathematical labels render through KaTeX; real/imaginary axes use upright
  `\mathrm{Re}` / `\mathrm{Im}` with KaTeX_Main. Keyboard activation works, four quarter
  turns cycle through the exact integer coordinates and return to the start, reset works,
  guides move to the correct coordinates, and reduced motion removes the transition.
  Independently checked mapping `(a,b) -> (-b,a)` and preserved squared length 25.
- Site menu: Tab remains inside, Escape closes and returns focus; background is inert.
  Anchor navigation updates history and focus; browser Back/Forward works. An empty
  contact form was tested locally; no message was sent.
- A final real mobile menu interaction exposed a header overlap and missing section focus
  for root-relative links. Same-page anchor handling now covers both URL forms, preserves
  modified clicks, and uses an 82px scroll margin. The measured contact landing is 82.08px
  below the viewport top and focus is on the section. Returning home clears the active
  Research navigation marker.
- Measured homepage refinements: shared desktop three-column gaps are 24px; project-card
  proof footers align exactly within each row; name, topic and email controls are each
  56px high. The dropdown arrow is inset 16px to match the field padding at 320px and
  1440px. Native keyboard selection works; forced-colour mode restores the native arrow.
- Genuine italic faces were observed loaded: Inter 400/500 and KaTeX_Math 400.
  Computed `font-synthesis-style` is `none`. Font requests include real italic variants;
  the owner prohibits oblique or artificially skewed text.
- Desktop width refinement: at 1440px, the portfolio/library, both book contents,
  chapter headers/tabs and Class 10 Practice settings share a 1180px outer frame with
  40px gutters (1100px usable width). Measured left frame edge is 122.33px and content
  edge 162.33px. The Class 10 lesson retains its 831.39px wrapper and 799.39px inner
  reading area. Generated papers/keys use 800px. A separate 1024px Practice screenshot
  confirms that the title and 400px search field fit without overlap. These desktop
  rules apply above 960px; existing phone/tablet reading layouts are preserved.
- Following that change, generated another paper and opened all ten working disclosures:
  zero KaTeX error nodes and no page overflow. Its five MCQ rows measured 712px and used
  four columns, with scroll width equal to client width. The paper workspace measured
  exactly 800px. No selection, timing, scoring or mathematical data changed.
- Library: honest one-unit availability for Classes 9/10 and planned status for 11/12.
  Book return links, the Class 9 visible contents heading, and legacy Class 10 unit hash work.
- Class 10: exercise and compact disclosure routes, Review MCQ feedback, search rendering,
  and exercise/Practice Back/Forward checked. Search for `frac` produced 65 results
  (first 60 shown), 72 rendered math spans, and no raw fraction/division commands.
- Practice: generated a 19-mark paper and a separate 21-mark choice paper. The latter
  offers two sets of three short questions, attempts two from each, and attempts one
  of two long questions; Objective/Subjective times are 10/35 minutes. Both section
  headers show Name/Roll number/Date and the total is 21 marks.
- Objective-only randomization preserved Subjective content. Invalid count input retained
  the paper. Local save/recall restored the same question text. Full working expanded.
  Search and topics remain available; only Back to paper settings is sticky in the paper
  workspace; Randomize precedes the paper, Print/Save/Answer key follow it.
- MCQs use measured four-column rows when they fit and two-column rows at 320px. The
  final sampled narrow paper had five `is-c2` option groups, each 201px wide with no
  option-container overflow. Key option letters are lowercase. Long mathematics and
  worked keys were visually inspected on desktop, phone and tablet during the session.
- Scoped CDP event windows returned no runtime exceptions or network failures, with
  `truncated: false`. A later request spanning the whole width-refinement pass returned
  no retained failures but reported older events evicted. No full-session clean-log claim
  is made; browser observations and the measured matrix have their stated scope.

## Screenshots

Local evidence directory:
`C:/Users/imran/.codex/visualizations/2026/09/19/01a0b813-35c5-7932-b1c0-7d287e96cc81/`

Final review images use `.jpg`: `pilot-home-1440.jpg`, `pilot-library-1440.jpg`,
`pilot-compact-desktop.jpg`, and `pilot-practice-1440.jpg`. The four responsive sets
are named `pilot-{home,library,exercise,practice}-{320,430,768,1440}.jpg`.
Additional study, search, generated-paper and key captures are in the same directory.
Earlier screenshots are historical iterations, not the final visual proposal.

## A4 proof inspection

The built-in browser's PDF command reports printing unavailable. The fallback used the
actual prepared Print DOM and CSS, captured without truncation, and installed Edge
headless to render local A4 PDFs. Normal browser print state was restored afterwards.

- `.local/paper-final.pdf`: 2 A4 pages; Subjective starts on page 2.
- `.local/worked-final.pdf`: 10 A4 pages; worked key starts on page 3.
- Poppler page images were inspected for section headers, timing/marks, MCQ options,
  long derivations, key letters and unwanted controls. No clipped mathematics observed.
- The final proofs reuse the actual prepared Print DOM with the final font stylesheet
  and current built CSS. Every rendered page is pixel-identical to the visually inspected
  earlier proofs at 1.25x scale (pypdfium2/Pillow comparison). Earlier truncated test
  exports in `.local/` are discarded evidence and must not be cited as successful proofs.
  The subsequent desktop-frame refinement is inside `@media screen`; it does not
  change the print cascade or authored paper DOM.

## Remaining work and limits

This is a representative pilot, not the completed full-site redesign.
Viewport emulation does not certify physical devices, Firefox/WebKit, or screen-reader
behaviour. No broad automated accessibility score is claimed. Portable paper-file import
was not exercised in Browser; local recall and underlying serialization were exercised.

Mathematical preservation/rendering is not independent verification of all solutions.
Existing prose/typography still needs a separate editorial review. Class 9's original
LaTeX/generator is missing; its reading SVGs are preserved. Historical extra Class 10
units are not restored or accepted. The shared Practice modules are an incremental
extraction; cross-book rendering consolidation is not complete.

Public GitHub context was read; LinkedIn was behind authentication, and two earlier
ChatGPT conversation reads timed out. Remaining historical organization names and dates
need factual publication review. No private client materials were repurposed.

Pages settings were inspected in the signed-in built-in browser: branch deployment from
`main` / `(root)`, custom domain `imranbinmanzoor.com`, successful DNS check, and Enforce
HTTPS enabled. The release will publish only the checked `dist/` artifact. Deployment
completion and live verification remain pending.
