# Design system

Status: the owner rejected the published composition and chose their own unfinished
original portfolio as the new foundation. Read `ORIGINAL_DESIGN_REVIEW.md` for measured
design/interaction evidence and the current direction. `REDESIGN_QA.md` records the
published release's checks, not aesthetic acceptance.

The tokens and compositions below describe the current implementation, which remains
live while its replacement is developed. They are not the visual target for the next
pilot. Preserve source roles, accessibility, mathematical typography and print behavior;
replace the visual tokens deliberately rather than layering competing overrides.

## Next visual foundation

The reference uses a `#f0f1f5` canvas, white compact panels, 12px outer radii, black pill
actions, persistent personal navigation and green/cyan/purple discipline accents. Its
small image/arrow transitions and personal density should survive professionalization.
Use darker accent text for contrast, natural-height disclosures, accessible galleries
and a dependable mobile menu. Exact next-generation tokens remain to be implemented
and verified together. The old portrait and placeholder biography are not approved copy.

## Source roles

- `src/assets/tokens.css`: colour, spacing, typography, page-frame and appearance roles.
- `chrome.css`: shared header, mobile menu, footer and focus behaviour.
- `site.css`: portfolio, catalog, project and tutoring compositions.
- `book.css`: common book overview, reading workspace and screen controls.
- `complex-study.css`: the original interactive mathematical figure.
- `src/books/overview.mjs`: one overview renderer, fed by book metadata.
- Existing book CSS/runtime owns authored reading layout and printing. Consolidation
  remains incremental; do not change mathematics while moving presentation code.

Obsolete `styles.css`, `pilot.css`, `book-pilot.css` and book-return fragment were removed
once their consumers migrated. Historical root assets remain recoverable.

## Foundation

| Role | Light value |
|---|---|
| Page | `#f7f9fc` |
| Surface | `#ffffff` |
| Heading | `#162640` |
| Body | `#34455e` |
| Muted text | `#596a82` |
| Primary action | `#2855d9` |
| Border / input border | `#dbe3ef` / `#b7c7dd` |
| Mathematical hint | `#47668b` |

Dark appearance has explicit counterparts. Consume semantic roles, including in
preserved book components. Literal white screen surfaces must not override dark mode.
Spacing scale: 4, 8, 12, 16, 24, 32, 48 and 64px. Section spacing ranges from 64 to 112px.
Borders are normally 1px, radii 6–10px, without heavy shadows.

Inter is the prose/interface family, with genuine italic faces and system fallbacks.
Synthetic italic/slanted type is disabled. KaTeX owns Class 10 mathematics; Class 9's
mathematical SVGs remain preserved. Operators are upright; variables use math italics.
`Re(...)` and `Im(...)` inside Class 10 math delimiters are presented as named operators
without changing bank data, paper IDs, prose, or existing TeX commands.

## Composition

Shared outer frame: 1180px including two desktop 40px gutters (1100px content). Gutters
scale to a minimum of 20px. A shared frame does not imply identical layouts.

- Home: personal introduction and mathematical study; asymmetric selected projects;
  research ledger; teaching subjects; concise background; contact.
- Library: book covers, explicit availability, source board, coverage and entry links.
- Books: common overview, unit search and distinct available/planned entries. At 1100px
  and above, a 192px section rail and 40px gap sit beside a flexible reading region.
  Smaller screens use horizontal navigation. Wide mathematics scrolls locally.
- Practice: settings and summary; paper and key retain task-specific layouts. Only the
  return control is sticky in Class 10 paper view. Preserve measured MCQ fitting and A4.
- Tutoring: learning approach, subject-led sections and a direct enquiry path.
- Projects: visual index, factual introduction, project evidence and focused prose.

The portrait-free complex-plane study demonstrates teaching and frontend work together.
It uses actual multiplication by the imaginary unit, KaTeX labels, invariant modulus,
keyboard controls and reduced motion. It is not represented as client research.

## Controls and accessibility

Header: 76px desktop, 68px phone; mobile menu below 960px. Site pages keep the header
sticky; books let it scroll away so reading navigation has priority. Menu traps focus,
makes the background inert, closes on Escape and restores its trigger. Theme remains
available in the narrow menu. Unit tabs expose vertical/horizontal orientation and
support Up/Down on desktop as well as their existing navigation keys.

Contact fields are 52px high with 16px padding and a 16px chevron inset. Name/email share
a desktop row; message type and message follow. Native select behaviour remains intact;
forced-colour mode restores the native arrow. Same-page navigation moves focus and
clears the header. Focus states must remain visible.

Compact hints remain muted blue, thin-bordered and unfilled. Theme-aware ink changes
presentation only. Complete reasoning takes precedence over compactness.

## Verification

Inspect sections beyond the first viewport, both appearances, controls and expanded
states. Measure edges, field heights, insets, overflow and font loading. Test 1440, 768,
430 and 320 CSS pixels. After resizing, take a fresh state before capture. Full-page
stitching can duplicate segments in this environment; viewport captures are the reliable
evidence. Never describe uninspected states as pixel-perfect.
