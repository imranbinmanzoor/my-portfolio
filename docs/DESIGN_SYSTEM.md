# Design system — representative pilot

Status: proposed locally; awaiting visual approval before broad rollout.

`src/assets/tokens.css` is the shared foundation. `pilot.css` adapts portfolio/library
layouts; `book-pilot.css` adapts book chrome without changing mathematical layout.

| Token | Value | Purpose |
|---|---|---|
| Page | `#F8FAFD` | Cool background |
| Surface | `#FFFFFF` | Reading and controls |
| Ink | `#18243D` | Headings |
| Body | `#33445F` | Prose |
| Muted | `#52627B` | Metadata |
| Primary | `#2855D9` | Actions and selected states |
| Border | `#DCE4F0` | Quiet separation |
| Hint | `#47668B` | Mathematical explanations |

Inter is the shared interface/prose family with system fallbacks. Keep mathematical
fonts controlled by KaTeX (Class 10) or preserved source SVGs (Class 9).
Use genuine italic faces when italics are intended; never oblique styling, skew
transforms on text, or synthetic slant. Inter requests include the true italic axis,
and shared foundations set `font-synthesis-style: none`. Keep mathematical variables
in KaTeX's actual italic fonts and named operators upright. Existing Fraunces requests
already include real italic faces. Verify loaded faces in Browser, not only CSS declarations.
Portfolio width is 1180px; book reading measure remains approximately 68ch.
Phone gutters are at least 20px on the portfolio/library, and the existing book
layout preserves its local mathematics scroll regions.

Use restrained borders and 6–10px corner radii. Do not introduce warm highlights.
The portfolio retains personal identity, research, projects, teaching,
about, and contact. The library is a catalog with explicit availability and edition
status. Lessons and Practice retain their task-specific layouts.

The owner requested a portrait-free alternative. The homepage now uses an original
interactive complex-plane study, on the page's light surface with blue line work. Integer
coordinates rotate under multiplication by the imaginary unit; the mathematics is real,
not a decorative stock pattern. SVG supplies the diagram; the existing pinned KaTeX
renderer supplies all equations and axis labels in LaTeX fonts with accessible MathML.
Upright real/imaginary labels follow the author's typography requirements. Reduced motion
removes rotation animation. The owner rejected the initial separate dark panel and mixed
math fonts; do not reintroduce that treatment.
The monogram replaces the photo favicon. Source photographs remain preserved for future
choices. See `PROFILE_AND_VOICE.md` for the personal and editorial evidence.

Navigation: shared site header for pilot pages; compact home/library return strip
for books. Current book internals retain their routes. Mobile menu contains focus,
makes the background inert, closes on Escape, and returns focus to its trigger.
Theme remains available in the mobile menu when the narrow header hides its toggle.
Same-page links use the shared 82px scroll margin and move focus to their destination.
Contact inputs/selects are 56px tall. Native selects retain browser keyboard behaviour;
their decorative chevron sits 16px inside the field edge to match its padding. Restore
the native arrow in forced-colour mode. Repeated desktop three-column grids use 24px gaps.

Compact side hints: readable muted blue, thin border, no background fill. Keep each
hint adjacent to the transition it explains. Preserve complete reasoning.

Scope: homepage, library, Class 10 lesson/Practice chrome, book return navigation,
and small missing-route/status pages. Existing case-study/tutoring layouts are
preserved pending approval; they are not evidence of completed site-wide rollout.

## Visual acceptance

The owner expects exacting visual QA. Inspect full page sections as well as the initial
viewport. Measure shared container edges, repeated card widths, row/column gaps, control
heights, heading/body sizes, line heights and borders through computed layout. Check light,
dark, focus, hover, selected, expanded and invalid states where applicable. Use the same
tokens for repeated roles; intentional lesson/portfolio layout differences remain valid.
Record defects and the exact scope checked. Never call uninspected states pixel-perfect.
After a viewport change, wait for browser repaint before saving a screenshot; immediate
captures can contain a stale resized surface even when DOM dimensions are correct.
