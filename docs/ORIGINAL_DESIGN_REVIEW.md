# Original portfolio: design and interaction review

Inspected 2026-09-19. This is the owner's unfinished, self-built design reference.
The owner prefers its character to the currently published redesign and requested
close inspection of every page, component, JavaScript file and responsive behavior.
Its unfinished implementation is not a reason to discard its visual ideas.

## Source and scope

- Supplied archive: `C:\Users\imran\Downloads\my-portfolio-main (2).zip`.
- SHA-256: `902666330A979CBA2690CA11278365CA295F1873CED722713F790C66B5C2086C`.
- 110 files, nine HTML pages and four JavaScript files.
- Unmodified extraction: `.local/original-design-reference/my-portfolio-main/`.
- Isolated local preview: `http://127.0.0.1:4180/`. Its helper serves only the
  extracted reference on loopback. Neither the archive nor extraction is public output.
- Current production remains `055b4c078c82c935818541dbce21b44e604c7135`.
  This inspection changed no production source, mathematics or deployed files.
- Final integrity verification compared every extracted file with its ZIP entry:
  all 110 matched; no changed files. Evidence: `test-results/original-integrity.json`.

The original's biographies, dates, testimonials, metrics and project authorship claims
are not independently verified facts. Preserve the design evidence without adopting
placeholder content. The portrait in this archive does not override the owner's later
preference for a portrait-free site.

## Coverage and evidence

These counts describe observations, not passing tests or an accessibility certification.

| Inspection | Actual coverage |
|---|---|
| Pages | Home, About, Stack, Projects, Contact, and four project details |
| Layout matrix | 137 page/viewport observations; 29,835 element records |
| Common widths | 320, 375, 430, 480, 481, 768, 799, 800, 1024, 1199, 1200, 1440, 1920 CSS px on all nine pages |
| Additional case-page boundaries | 570, 571, 620, 621, 1201 CSS px on all four case pages |
| Control appearance | 145 default/hover pairs, including computed pseudo-element and child styles |
| Keyboard | 18 page/width traversals at 1440 and 430px; 262 recorded Tab steps |
| Navigation | 87 recorded states, including scroll, menu, resize, short-screen and mouse-drag cases |
| Expertise cards | 42 open/closed observations at seven widths; three desktop hover details |
| Image galleries | 24 selection actions: three galleries, four selections each, at two widths |
| Contact form | Nine local-only states including validation, pending, success and failures |
| JavaScript | All four source files read; active behaviors exercised as described below |

Matrix heights were 860px for widths through 480px and 1000px above that. Additional
manual samples included 430 × 640 and 812 × 375. Screenshots were captured throughout;
manual visual inspection covered all nine pages and representative lower sections and
component states. The 137 captures were not all individually reviewed pixel by pixel.
Computed inspection covered every relevant DOM element in the sampled layouts.

Machine-readable records are in ignored `test-results/original-*.json`:

- `detailed-layout`: per-element geometry, computed type/color/spacing/borders,
  visibility, overflow, semantics, page statistics and bounded browser diagnostics.
- `control-states`, `keyboard`, `navigation`, `gallery`, `card-states`, `form-states`:
  the actual interaction records behind the counts above.
- `js-edge-cases`: reduced-motion measurements and the captured runtime exception.
- `extra-states`: additional hover and motion observations.
- `source-inspection`: file inventory, missing local references and contrast calculations.

Screenshots and a browsable local inspection atlas are under
`C:\Users\imran\.codex\visualizations\2026\09\19\01a0b813-35c5-7932-b1c0-7d287e96cc81\`.
The atlas is `original-review.html`, served locally at `http://127.0.0.1:4181/`;
matrix captures use
`original-matrix-{page}-{width}.jpg`. It shows the archived design, not a proposed redesign.
Raw records and screenshots are local evidence and are excluded from deployment.

## Visual language to preserve

| Element | Observed treatment | Direction for the rebuild |
|---|---|---|
| Canvas and panels | `#f0f1f5` canvas; white panels; 12px outer and 8px inner radii; faint `0 4px 12px rgba(52,72,84,.05)` shadow | Keep the quiet, compact panel composition; establish shared tokens |
| Personal navigation | 256px desktop sidebar, 16px outer inset; 96px intermediate icon rail; floating mobile identity header | Keep persistent personal navigation, with a dependable accessible mobile version |
| Identity block | 56px round portrait, compact name and two small descriptive lines | Preserve its personal scale; use a considered mark/monogram unless the owner requests the photo |
| Navigation details | Icon and label; soft active fill; 4px black active marker; arrows animate into view | Retain the distinctive active treatment and restrained directional feedback |
| Introduction | Compact 32px greeting/title, availability dot, black pill action | Keep the approachable density; avoid another oversized generic marketing hero |
| Expertise cards | Green, cyan and purple accents; large illustrations and clipped radial washes; icon/text rearrangement | Preserve the three disciplines and visual character; make all content reachable without hover |
| Background panel | Two-by-two education/experience structure, small icons, timeline dots, thin separators | Keep structured personal evidence; populate only verified facts |
| Stack | Logos in gray wells; compact labels; categorized explanations on the full page | Preserve useful grouping without turning tool lists into unsupported expertise claims |
| Project previews | Distinct colored image fields and device imagery; image contracts to 95%; blurred eye/action overlay | Keep project-specific imagery and color; ensure the title and action work for keyboard and touch |
| Project details | White case panel, back link and tool chips, large image and device thumbnails, prose and technical examples | Keep the layered case-study structure; give long text a reading measure and galleries real controls |
| Buttons | Black pill with a white hover wipe and arriving arrow; outlined secondary pill | Keep the character, with consistent dimensions and visible focus/reduced-motion states |
| Contact | Cropped pastel icon circles, 70px contact rows, gray fields, full-width black action | Keep the calm form language; add robust feedback and submission state |
| Closing panel | Very faint perspective grid, rotated 60 degrees with 1200px perspective | Retain only where it supports the composition and stays subordinate to content |

Measured desktop landmarks at 1440px: sidebar x=16px / width=256px, main x=288px,
and inner content x=304px. These are reference measurements, not immutable new tokens.
The original uses Segoe UI with black headings and `#4d4d4d` prose. A professional
rebuild should retain its compact rhythm while keeping genuine italics and the existing
mathematics font rules. Color should distinguish meaningful subjects and projects.

## Page-by-page observations

| Page | Components and details inspected | Main completion work |
|---|---|---|
| Home `/` | Profile/navigation; greeting, availability and action; all three expertise cards; background grid; stack tiles; project previews; contact/grid closing panel | Natural-height mobile disclosures, correct keyboard behavior, verified personal copy, deliberate mathematics entry |
| About `/2-ABOUT/about.html` | Introduction; education/experience timeline; dot/line alignment, tenure labels and institution text; lower contact panel | Replace explicit placeholder dates and unverified organizations before reuse; retain the timeline's compact hierarchy |
| Stack `/3-STACK/stack.html` | Categorized tool rows, logo wells, column transitions, explanation text and lower sections | Edit repetitive/general copy and distinguish actual use from proficiency; use consistent row dimensions |
| Projects `/4-PROJECTS/projects.html` | Grid, colored previews, title links, tags, hover overlays and lower page | Repair the malformed Pig Game title link; make every project accessible through a stable visible link |
| Omnifood `/4-PROJECTS/Project-1/project-1.html` | Back/tool bar, three-image gallery, selected borders, prose, technical discussion, challenge insets, feedback and related work | Constrain prose width; rebuild gallery semantics; verify course attribution and remove unsupported performance/testimonial claims |
| Sign-in/sign-up `/4-PROJECTS/Project-2/project-2.html` | Long title, device gallery, code/example section, headings, challenges, feedback and related work | Reduce title/toolbar crowding on phones; use real headings instead of styled generic elements; describe the demo's actual authentication limits |
| Pig Game `/4-PROJECTS/Project-3/project-3.html` | Main preview, rules/implementation prose, code section, feedback and related work | Honest learning-project attribution and readable code/text; this page has no three-device selector to count as a gallery test |
| Portfolio `/4-PROJECTS/Project-4/project-4.html` | Self-referential case, device gallery, design/JS discussion, technical screenshots, feedback and related work | Describe what was implemented versus planned; avoid claiming that this unfinished version already passes production quality checks |
| Contact `/5-CONTACT/contact.html` | Contact cards, form labels/fields/focus, validation, submit, success and failure presentations | Align the outer frame; make submit pending/error/success explicit and accessible |

All pages were included in layout, control and keyboard records. Lower-section images
include `original-about-timeline-1440.jpg`, `original-home-stack-1440.jpg`,
`original-project-1-prose-1440.jpg`, `original-project-1-challenges-detail-1440.jpg`,
`original-project-1-feedback-1440.jpg`, and the project-2/3/4 code-section captures.

## JavaScript and mobile behavior

### `1-INDEX/index.js`

The script controls header translation from scroll deltas, blur opacity, drag snapping,
menu expansion/body locking, expertise cards and project overlays. Fresh mobile loads
correctly hide the 88px header after sufficient downward scrolling and reveal it on
upward scrolling. Tested mouse drags snap a partly moved header open or closed. The
menu toggle opens/closes and its long contents can scroll internally on a short screen.
The desktop card and project transitions run and reverse.

Confirmed problems:

1. **Height and translation become stale across responsive changes.** `TOTAL_HEIGHT`
   is calculated once. After hiding the mobile header then resizing to desktop, the
   desktop sidebar retained `translateY(-104px)` and its top was -88px. Loading desktop
   then resizing to mobile produced a -240px transform for an 88px header after 240px
   of scrolling, with blur opacity still about 0.756. Resize must reset/recompute state.
2. **JavaScript and CSS boundaries disagree.** JS uses `max-width: 800px`; CSS enters
   the intermediate sidebar at 800px. The icon rail can therefore still receive mobile
   hiding behavior. An open menu also retained expanded state at that boundary.
3. **The top-edge mouse case throws.** At 430px, scroll 30px to partly hide the header,
   then press it at viewport y=0. `e.clientY || e.touches[0].clientY` at line 78 treats
   zero as absent and reads `touches` on a mouse event. Browser captured a TypeError.
   The move handler uses the same fragile coordinate selection.
4. **Collapsed links remain in Tab order.** Nine hidden navigation/social links were
   encountered on each mobile page. Opacity and pointer-events do not remove keyboard
   focus. The expanded menu has no focus containment/background inert state; Escape
   does not close it; initial `aria-expanded` is absent until interaction.
5. **Short-screen closure is awkward.** At 430 × 640, scrolling the expanded menu
   exposed the last social item but moved its close control offscreen. Escape still
   did nothing. Preserve reachable closure independently of the menu's scroll area.
6. **Card disclosure controls are images.** The 24px carets are not buttons, are not
   keyboard focusable and do not expose expanded state. Desktop descriptions depend
   on mouse hover. Content must have a keyboard/touch equivalent and natural height.
7. **Reduced motion is ignored.** With the preference emulated, card transitions
   remained 0.4s and button transitions 0.25s. A reduced-motion version is needed.

The source also reads the navigation height before its missing-element guard. That
is a reuse concern, not an observed failure on these nine pages.

### `4-PROJECTS/projects.js`

Project hover overlays and image scaling work in the observed pages. Equivalent
listeners already exist in `index.js`; registering both is redundant. Consolidate the
behavior, ideally using CSS hover/focus styles around semantic links. Avoid requiring
an eye-overlay hover to discover the only working project link.

### `4-PROJECTS/Project-1/project-1.js`

The shared gallery changes the main image and moves the selected thumbnail outline.
Selection sequences 0 → 1 → 2 → 0 worked for Omnifood, sign-in/sign-up and portfolio
at 1440px and 430px. Thumbnail hover scaling and large-image overlay were inspected.
The selectors are generic divs without keyboard roles or selected-state semantics;
image alt text stays generic. Rebuild as real controls with meaningful image descriptions.

### `5-CONTACT/contact.js`

Native required/email validation works. A successful local response hides and resets
the form and displays the thank-you message. Simulated API validation errors, generic
errors and network failure preserve the entered values and show an alert.

The button stays enabled during a pending request; two clicks produced two local
POSTs. There is no pending indicator, no live status region, and success leaves focus
on the body after the form disappears. A robust version needs explicit request state,
duplicate-submit prevention, inline errors, and deliberate status/focus handling.

These were **local simulations** at port 4182: the response HTML pointed the form to
a loopback handler and a restrictive CSP prevented external connection/submission.
Synthetic values were discarded. The archive was untouched and no message was sent
to Formspree or another person. Real form delivery remains unverified.

## Layout, typography and content findings

- **Fractional breakpoint gap:** disjoint `max-width: 799px` and `min-width: 800px`
  rules leave a fractional interval unmatched. In the Browser's 799px test,
  `innerWidth` was 799 but `(max-width:799px)` was false and `(max-width:799.5px)`
  true. The desktop sidebar returned and the homepage grew to 983px wide. The 1199px
  boundary also exposed the same pattern. Avoid assuming every browser's rounded
  `innerWidth` equals the exact media-query width. Use continuous breakpoints.
- **Expanded card clipping:** at 320px, cards one and three needed 107px of copy
  height but had 86px. At 481px all three expanded descriptions were clipped after
  the card height fell from 160px to about 121.6px. Samples at 375/430/480/768/1024px
  did not show this specific clipping. Fixed-height disclosures are inappropriate.
- **Case header crowding:** the 36px back/tool row wraps its back text into three
  lines at 320px, encroaching on the gallery. Long case titles consume four to six
  lines on phones. Toolbar and heading layout need content-driven wrapping.
- **Overlay obstruction:** the floating mobile contact action covers reading content.
  It needs a reserved region or a less intrusive placement.
- **Reading measure:** some case prose stretches to roughly 1056px on desktop.
  Share outer alignment while constraining prose separately from images/math/papers.
- **Contact alignment:** its main panel extends one 16px increment farther right than
  the standard inner content edge. Shared container rules should replace page drift.
- **Accent text contrast:** green `#00e663`, cyan `#00d0ff`, purple `#be4dff` against
  white measured 1.68:1, 1.83:1 and 3.69:1 respectively. Body `#4d4d4d` measured
  8.45:1. Keep vivid color in art and use darker text variants; this is a local ratio
  calculation, not a complete contrast audit of every composited/hover state.
- **Broken local title link:** Projects uses `../4-Projects/project-3` followed by
  whitespace and `.html`. Source/path validation found no such target. Its overlay
  points to the correct `Project-3/project-3.html`. One real missing local reference
  remained after excluding comments; no Browser 404 observation is claimed.
- **Semantics/content:** heading levels, icon alternatives and current-navigation
  indication need systematic completion. Placeholder dates such as `2047–81`,
  organization names, testimonials and performance figures need factual review.

## Design decision and next implementation checkpoint

Use this archive as the primary visual foundation. Preserve its personal sidebar,
neutral canvas, compact panels, discipline accents, project imagery, and thoughtful
small transitions. Complete these ideas through shared components, precise alignment,
readable typography and robust interactions. Do not merely transplant the old CSS/JS,
restore placeholders, or continue polishing the rejected blue composition.

Build a coherent representative implementation of home, library, one lesson and
Practice in the maintained static source structure. A personal mark can carry the
sidebar identity without restoring the photo. The complex-plane study can become
a purposeful mathematical artifact inside this system; its exact placement requires
composition work, not automatic reuse of the previous hero.

Keep the current source/build separation, URLs, recovered content, question IDs,
shared Practice behavior, real math fonts and A4 constraints. The old archive did not
include these products; their layouts must be designed within its visual language,
not squeezed into every portfolio card. Independent mathematics review still remains.

The owner has already selected this visual foundation and authorized professional
interpretation. Proceed with a reviewable pilot and the established measured/browser
QA. Standing approval covers publishing completed, checked website updates for live
review; it does not authorize presenting this unfinished reference as the final site.

## Limits

This inspection does not cover every possible viewport, operating system or input
device. Native touch injection was unsupported in this Browser; touch handlers were
read, mobile layouts and actual scroll responses tested, and mouse drags exercised,
but physical touch inertia, overscroll and mobile browser chrome remain unverified.
Screen-reader output, cross-browser rendering, OS-native form variations and linked
external demo applications were not comprehensively tested. No mathematics correctness
certification or production build rerun is implied by this archive review.

The bounded load/layout diagnostic windows recorded no exceptions or failed responses;
the separately exercised top-edge input case did produce the exception above. Do not
summarize the archive as error-free or describe this evidence as every pixel verified.
