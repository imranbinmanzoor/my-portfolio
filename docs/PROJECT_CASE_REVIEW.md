# Project stories and cross-site review — 2026-09-19

## Evidence and design decisions

The owner requested engaging project detail pages, restoration of the original device
views, sentence-case interface labels, a thorough cross-page review and footer repairs.
The earlier original-archive audit remains evidence; this pass inspected the current
implementation instead of repeating that audit. The original sign-in gallery was opened
in Browser and its tablet/mobile image switches exercised. Original images remain intact.

Research consulted:

- [NN/g portfolio guidance](https://www.nngroup.com/articles/ux-design-portfolios/): show
  the problem, contribution, decisions and learning alongside images; make the account
  scannable. This informed the short brief, decisions and reflection sections. No invented
  user research, metrics or client outcomes were added.
- [W3C tabs](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/): selected state, labelled
  panel and roving Left/Right/Home/End keyboard controls for the three device previews.
- [GOV.UK breadcrumbs](https://design-system.service.gov.uk/components/breadcrumbs/):
  communicate hierarchy and link to parent sections. Our compact trail uses Home,
  Projects and the current project; it remains in the shared page frame. It is sticky
  on desktop and in normal flow on mobile to avoid competing with the mobile header.
- [Mailchimp web elements](https://styleguide.mailchimp.com/web-elements/): sentence-case
  labels and meaningful link text. Capitalization is authored in HTML, not faked with CSS.

These sources inform design choices, not evidence that this site has passed a user study.

## Findings and changes

| Area | Observed issue | Resolution |
| --- | --- | --- |
| Four project details | Back link, separate metadata row and oversized image delayed the story; device views removed | Shared case renderer with compact context, inspectable gallery, brief and decisions |
| Gallery | Original tablet/mobile assets existed but were unused | Restore genuine captures, explanatory captions and a native enlarged-image dialog |
| Pig Game | Only one original gameplay image exists | Show it honestly with a working demo link; no fabricated device views |
| Portfolio case | Still described a complex-plane homepage that no longer exists | Current homepage captures and an accurate account of the portfolio/library architecture |
| Navigation | Lowercase back/previous/next text; no consistent parent trail on general pages | Compact semantic breadcrumbs and named previous/next project links |
| Homepage contact | Lowercase source labels were visually capitalized by CSS | Sentence case in authored labels and accessible names |
| Footer | Extra desktop copyright row height; narrow-mobile gutter exception; short page placement | Shared compact grid, consistent mobile gutter and footer at the bottom of short desktop pages |
| Planned books | Arbitrary minimum content height | Remove the page-specific minimum; let the common frame handle short pages |

Three existing public demos returned HTTP 200 with their expected titles. Links were
restored from the owner's archive. A working visual demo does not establish production
authentication, accessibility or business results.

## Implementation

`content/projects.json` holds authored project data. `src/projects/render.mjs` generates
all four cases through the build's PROJECT include. Shared `project-case.css` and
`project-case.js` provide the presentation and interaction. URLs and legacy redirects
are preserved. Without JavaScript, the first image and links to all available images remain.
Preview enlargement uses a native dialog with a visible close control, Escape dismissal
and focus restoration. No autoplay, external embeds or added framework is required.

## Browser QA

- All 12 main routes at 1440, 768, 430 and 320px, height 900px: 48 measured layouts,
  each with top and footer screenshots. No horizontal overflow, missing footer or
  lowercase interface label was found in that matrix. Brand monograms and mathematical
  notation are not sentence-case labels.
- The four project galleries exercised in all available views at all four widths:
  40 states, all images loaded, no overflow, and no gallery-height change between views.
- Visual review found an image sizing problem after a responsive transition: the image
  box could exceed the frame. The final image is explicitly contained inside the frame;
  all three views remeasured at four widths with exactly matching image/frame bounds.
- Device arrows/End, native dialog opening, close button and Escape, focus restoration,
  story-link focus, breadcrumb return, browser Back and next-project destination exercised.
- Desktop and narrow-mobile enlargement and the dark case layout inspected visually.
- Footer height is the same across the 12 routes at each width: approximately 106.26px
  at 1440px and 221.46px at 320px. Book footers follow the book reading gutter; general
  footers follow the site gutter. Link rows retain 44px targets.
- Class 9 Unit 1 reading/footer inspected. A Class 10 Practice paper and answer key were
  generated; no mathematical rendering error elements or horizontal overflow were found.

Local evidence is outside public output in the task visualization directory:
`page-research.json`, `all-page-review.json`, `project-case-matrix.json`,
`review-final-*.jpg`, `case-*.jpg` and the final project captures. Screenshots were
inspected for representative top, lower-content, footer and interaction states; this is
not a claim that every image was individually checked pixel by pixel.

One image-readiness check initially waited for offscreen lazy images; it was corrected to
wait only for images in the viewport. Early navigation observations were taken before
navigation completed; the actual destinations were subsequently verified using explicit
navigation waits. These tool timing issues are not site failures.

## Limits and next work

Physical touch devices, screen-reader speech and every possible book disclosure/paper
combination were not exhaustively tested. No print layout changed; prior A4 evidence
remains in FOUNDATION_QA.md. This pass does not certify the mathematical content or finish
the Class 9 source recovery and shared-book architecture work. Independent editorial and
mathematical review remain separate tasks. The external learning demos were not redesigned.

Final local run: 45 checks passed, zero failed. Two builds produced 70 byte-identical
output files. Source digest: 833f1349c9ddfadf580e1d537264c16e5329c58283f180e82d5d9f2a7c08fcc0.
The long diagnostic window was truncated; a fresh bounded reload window was complete
with no runtime exceptions or failed requests. Console warning/error log was empty.
Production verification pending. Immediate checked rollback:
ce4eaa016b0db82a50945dcfaeb8cff0810e606f, digest
8b1f48222474bae4e6ef7982607f5f388ef50da73bd13a390323057c951f1d0d.
