# Design system

Current implementation: the owner's original portfolio foundation, rebuilt in the maintained static source system. This is a checked visual pilot for live review, not final aesthetic acceptance. Reference evidence: ORIGINAL_DESIGN_REVIEW.md. Current checks: FOUNDATION_QA.md.

Project detail pages use the shared case renderer and authored `content/projects.json`.
Lead with context and inspectable work: genuine device captures, stable keyboard tabs,
an enlarged-image dialog, then brief decisions and learning. Preserve learning-project
attribution and distinguish a visual prototype from a production service. Keep image
boxes contained in their stage; never crop device previews accidentally. Current review:
PROJECT_CASE_REVIEW.md.

General pages share a compact 44px breadcrumb row at the top of the panel. Desktop trails
stay visible; mobile trails flow with the page to avoid competing with the mobile header.
Use sentence case in the actual interface text, including labels and previous/next links.
Preserve intentional brand marks, code, URLs and mathematical notation.

The shared footer uses 20px internal vertical padding, a 16px preceding gap, compact
desktop identity/navigation columns and a two-column mobile link grid. Its gutter follows
the surrounding site or book frame. Every footer is its own rounded surface, separated
from the content by the page background. The scrolling workspace must not be painted
in the surface colour, which makes the footer appear attached. Reading containers own
one 32px bottom inset; avoid accumulating panel padding and trailing section margins.
Do not add page-specific footer spacing patches.

## Source roles

- src/assets/tokens.css: semantic colour, typography, spacing, frame and appearance roles.
- chrome.css: shared personal navigation, mobile dialog, footer and focus rules.
- scroll-frame.js: SiteScroll API; one scrolling owner on each viewport.
- site.css: portfolio, library, project and tutoring compositions.
- book.css and book-layout.js: shared book overview, reading workspace and screen controls.
- src/books/overview.mjs: one metadata-driven overview renderer for published books.
- math-lab.css / math-lab.js and math-models.js: optional library explorer and independently checked models. Existing book sources retain mathematical rendering and Practice behavior.

## Foundation and density

| Role | Light value |
|---|---|
| Canvas | #f0f1f5 |
| Panel | #ffffff |
| Heading / body | #202329 / #4b5059 |
| Muted | #646a75 |
| Primary action | #24272d |
| Border / field border | #e1e4eb / #bec5d0 |
| Research / development / teaching | #28775c / #27697e / #8050a2 |
| Mathematical study / hint | #456da4 / #47668b |

Dark mode uses explicit semantic counterparts. Prefer shared tokens to literal screen colours. Panels use 12px radii and a very light shadow; primary actions are dark pills. Inputs and compact controls use 6–8px radii. Accent colour identifies a discipline, not every action.

Use compact, purposeful spacing: enough separation to distinguish groups without empty columns, tall introductions, or gratuitous blank panels. Typical panel gaps are 20px desktop and 12–16px mobile; content padding is normally 24–28px desktop, 18–20px mobile. Mathematical derivations retain the space their structure needs. Do not compress reasoning to achieve visual density.

Inter owns prose and controls, including genuine italic faces. Synthetic slant is disabled. KaTeX owns Class 10 mathematics and the library explorer; Class 9 mathematical SVGs remain preserved. Named operators are upright; mathematical variables use math italics. Standard operators replace bare Re/Im in rendered Class 10 expressions without changing authored data or paper identities.

Both typefaces are self-hosted (`public/vendor/`): Inter 4 variable (upright and italic,
latin and latin-ext, OFL) with a metric-matched fallback, and KaTeX 0.16.47 (MIT), the same
release as the build-time renderer. No page loads scripts, styles or fonts from another host;
a blocked CDN previously left Class 10 showing raw LaTeX. `npm run check` enforces this.

Type and rhythm tokens live in tokens.css: `--ds-h1` (40/36/31px), `--ds-h1-page`, `--ds-h2`
(26/24/22px), `--ds-h3`, body 15px, lead 16px, UI 13px, meta 11–12px, `--ds-panel-pad`
(28/20px) and `--ds-gap` (20/16px). Element defaults in site.css use zero-specificity
`:where()` so component classes win without `!important`.

Wide Class 10 expressions scroll inside their own box; an edge fade marks the side that still
hides mathematics (as Class 9 already did) and disappears at each end. On phones and tablets,
where there is no margin beside the text, Back to top appears only while scrolling up.

## Page frame and scrolling

At 800px and wider, the personal navigation and right workspace share a 16px inset
(`--frame-inset`). The rail is 80px at 800–1199px and 248px from 1200px. The **document is
the only scroller at every width** (September 2026): the rounded workspace frame is drawn by a
fixed, click-through mask (`body::after`: a rounded window with a page-coloured spread shadow),
so content appears to scroll inside the frame while keyboard scrolling, find-in-page, zoom and
back/forward scroll restoration stay native. The earlier fixed, internally scrolling `<body>`
broke all three and left WebKit unable to paint the fixed sidebar; do not reintroduce it.

`--site-chrome-top` is where sticky layers start: the frame inset on desktop, the floating
header's height while it is shown on phones. Every sticky `top` and `scroll-margin-top` is
computed from it, and `SiteScroll.top` reads the same property, so CSS and scripts agree.
Breakpoints use range syntax (`width < 800px`, `width >= 800px`): paired `max-width: 799px`
and `min-width: 800px` leave fractional widths (reachable with browser zoom) unmatched.

Shared content maximum is 1280px; book gutters are 24px, reducing to 18px on phones. Exercise navigation, section headings and reading wrappers share their appropriate content edge. At 1000px, a content-sized unit rail sits beside the reading area with a 16px gap. Its longest label determines the rail width, while each button fits its own label. Smaller screens use a horizontal exercise strip.

Exercise controls use 12px inline padding; local Concepts / Examples / Exercise links retain 6px. Apply these values at every viewport, including active highlights. Keep labels at 13px and control heights at 36px and 32px respectively. Use a 4px gap between controls, 2px vertical strip padding and 4px local-navigation padding. Breakpoints change the layout, not the button density; do not stretch active boxes across the desktop rail. The owner requested compact heights, then extra horizontal breathing room for exercise navigation only.

Book breadcrumbs use one 45px sticky row at the top of the reading frame, with a 44px link height and a subtle glass surface after scrolling. Below 1000px, the horizontal exercise strip stays sticky beneath it; Concepts / Examples / Exercise follows the measured strip height. The current question/example label occupies a compact 36px sticky row below the local jump controls, constrained to its own question block. Deep part/compact links include every sticky layer in their scroll margin. At 1000px and above the exercise rail sits beside the content, contributing no vertical sticky height. Parent links remain present at all widths; the home icon has a text alternative, and the shortened unit name remains available to assistive technology. Overview and unit breadcrumbs share the same vertical rhythm. In the Class 10 generated-paper workspace only Back to paper settings is sticky.

Book introductions place a modest cover beside the text instead of at the far end of a large empty row. Covers disappear on small screens. The useful contents follow promptly. Public book links are explicit high-contrast Open book controls; planned books accurately indicate their status.

## Interaction and grouping

Homepage order (September 2026): introduction with the work map → evidence row
(Selected contributions beside About me; equal-height panels) → Projects → Learn with me
(library beside tutoring) → Tools → Contact. The introduction's two text links still offer
the professional and learning paths (`#professional-work`, `#learning`). The previous layout
headed "AI & digital work" with frontend course projects only, placed the AI-evaluation
evidence third, and showed the same projects twice; those duplicates are merged, not deleted.

Projects is one browser with native Cards / List pressed buttons; a native disclosure shows
the CSS for the current layout. Card columns follow the browser's own width through a
container query (1, 2 or 4, never an orphan). Cards and the /projects/ tiles are both
generated from `content/projects.json` (`summary`, `tags`, `thumb`), so they cannot drift.
Preview links work without script; layout controls appear only after enhancement.
Implementation: home-projects.html, home.css and project-browser.js.

The sidebar marks the listed section that contains the reading line, and nothing while the
reader is in an unlisted section (projects, learning, tools). Navigation order matches page
order: Home, Research, About me, Projects, Mathematics, Tutoring, Contact.

Discipline colours mean the same thing everywhere: AI & research green, code cyan,
mathematics study blue, teaching purple. Tutoring subjects follow them (mathematics blue,
programming cyan, Arabic purple). No green "status" dots: the monogram and location carry no
availability claim.

This uses evidence of actual work alongside clear service routes, informed by
[NN/g's homepage iteration study](https://www.nngroup.com/articles/case-study-iterative-design-prototyping/)
and [W3C animation guidance](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html),
consulted 2026-09-20. This is a design judgment, not user-study validation of this site.

Project tiles are single links with a View project hover/focus cue and no decorative arrows. Tutoring uses concise subject introductions and three grouped learning cards instead of a tall asymmetric text split. Footer links have 44px targets, coherent padding and a separate copyright row.

Contact success replaces the form with a prominent Message sent panel, animated checkmark, focused status and Send another message control. Reduced motion disables the animation. Failure preserves entered fields. Never send real test messages just to verify presentation.

## Accessibility, mathematics and print

Use visible focus, semantic controls, measured contrast, reduced-motion behavior, mobile-menu focus containment and Escape return. Keep long mathematics in its own accessible horizontal scroller. Empty search fields must not show a clear button; the clear control appears immediately when text is entered. The search wrapper owns the border and focus ring.

The homepage leads with the compact personal introduction and explicit professional
and learning paths. The mathematical explorer lives after the library book catalogue
inside a native, initially closed "Interactive mathematics" disclosure. The direct
/solutions/#interactive-ideas route opens the disclosure and focuses its summary.
Closing it removes its controls from keyboard navigation. The homepage does not load
explorer or KaTeX assets.

The explorer offers three independent views: odd-number square layers, a parabola and its tangent, and exact fair-coin probabilities. Native sliders, keyboard tabs and a magnification checkbox update the visual and mathematical account together. A compact disclosure gives the reasoning and assumptions. Diagram and explanation align at their top edges so opening a proof does not push its diagram down. There is no autoplay, experimental simulation, or claim of research provenance. Math labels use KaTeX; model functions are separate from rendering.

Print uses normal document flow, independent of the fixed desktop workspace. Worked keys use block fragmentation instead of the answer stack's screen grid; short explanatory stages stay with their derivations. Preserve A4 section starts, measured MCQ options, split timing, lowercase key letters and existing paper serialization. Mathematical correctness remains a separate review obligation.

Shared interface text is 13px; metadata is 11–12px, portfolio body 14–15px, and book reading prose 16px. Catalogue, project, tutoring and book overview intros share the same measured typography: 11px/1.5 eyebrow, 34px/1.15 title, and 15px/1.8 lead; phones use 30px titles and 14px leads. Eyebrow-to-title spacing is 12px and title-to-lead spacing is 20px. Page composition may differ: a book cover sits beside its text, while the catalogue has one text column. Unit/home headings are 32px on desktop and section headings normally 24px. KaTeX keeps its mathematical metrics. Library and project catalogue introductions share a divider and bottom spacing.

Functional icons use a common line family. Generic action labels stay stationary; primary pills are never underlined. Text links retain an underline at rest and on hover, with consistent colour and focus treatment. Decorative arrows and the earlier arriving-arrow motion are removed with the owner's permission. Directional icons remain where direction conveys meaning, such as Back, Next and breadcrumb separators. Do not reintroduce label shifts or duplicate arrows.

Editorial card headings use text alone. Do not add isolated corner badges just to fill
space: the homepage library and tutoring header badges were removed. Icons remain in
navigation, controls, the connected-work map and coherent discipline/subject groups;
tool logos identify the named technology. Consistency follows the role of an element,
not a requirement to put an icon on every rectangle.

The single homepage introduction identifies the person and their work; there is no competing promotional headline beside it. The owner rejected the explorer's prominence on the homepage because it distracted from professional roles. Keep interactive learning optional within the library. This is an owner-directed hierarchy decision, not a claim of usability-study validation.

The homepage work map connects AI & research, Code, Mathematics and Teaching to actual
work destinations. At 700px and above it shares the compact introduction; below that it
follows the two audience paths in both DOM and visual order. Use the shared colours and SVG line-icon family,
one selected-field description and no repeated heading. About is a personal account
beside the factual contributions panel, with aligned section typography.

Connectors use measured border attachment points, redrawn after resize and font loading.
Keep paths outside control bounds and underneath opaque controls and focus indicators.
Preserve roving keyboard tabs and focus when responsive placement changes. Implementation:
work-specimen.html, work-specimen.css and work-specimen.js; no graph framework dependency.
Research: [React Flow handles](https://reactflow.dev/learn/customization/handles),
[W3C tabs](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/) and
[focus visibility](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html).

Research consulted: [NN/g visual hierarchy](https://www.nngroup.com/articles/visual-hierarchy-ux-definition/), [homepage guidelines](https://www.nngroup.com/articles/top-ten-guidelines-for-homepage-usability/), [Carbon button usage](https://carbondesignsystem.com/components/button/usage/), [USWDS links](https://designsystem.digital.gov/components/link/) and [W3C consistent identification](https://www.w3.org/WAI/WCAG21/Understanding/consistent-identification), 2026-09-19.

Mathematical references checked: [OpenStax derivatives](https://openstax.org/books/calculus-volume-1/pages/3-1-defining-the-derivative), [OpenStax binomial distribution](https://openstax.org/books/contemporary-mathematics/pages/7-10-the-binomial-distribution), and [University of Hawaii odd-number reasoning notes](https://crdg.hawaii.edu/developing-teacher-expertise-mathematics/modules/facilitator-resources/facilitator-reasoning-and-explanations-resources/Session5/resources/s05_p3_mathnotes_sum-consecutive-odd-problem.pdf). Diagrams, copy and controls are implemented locally; the references are not copied designs.

## Review pass decisions (2026-09-23)

- **Sticky layers.** Desktop and tablet books keep the breadcrumb, exercise strip, section
  links and question label. Below 600px wide only the breadcrumb and exercise strip stay;
  section links and the question label scroll with the page. Below 480px tall none of the
  reading layers stick. A generated paper, in either book, has exactly one sticky layer:
  Back to paper settings.
- **Practice order in both books.** Settings; Back to paper settings (sticky while a paper is
  open); Randomize; the paper, which takes focus after Generate; then Print, Save (Class 10)
  and Answer key. Class 9 has no Save: its papers are not serialized, and adding that is a
  feature decision, not a layout fix.
- **Focus.** One focus colour (`--ds-focus`) on site and book pages. After keyboard focus
  moves, it is checked again once the phone header has settled, so no control is left under
  a sticky bar.
- **Print.** Dark is a screen theme only; every printed page uses the light roles. The
  browser's own Print command on a generated paper prints what the Print button prints.
  Class 9 prints page numbers and starts its answer key on a new page.
- **Width.** Portfolio pages use a 1280px column, widening to 1440px from 1760px windows.
  Book reading stays capped at 1160px for line length.
- **Project case studies.** From 1000px, "01 The brief" is a full-width numbered section
  like 02 and 03, so the preview never leaves an empty block beside it.

## Shared mobile chrome and real book routes (2026-09-20)

The mobile header has a restrained border, translucent surface and shadow. Every sticky
breadcrumb uses the measured --site-chrome-top property; when the header appears, book
exercise/local/question rows move with it. Animate that shared property, not each row's
top independently. Reduced motion removes the transition.

Below 1000px, horizontal exercise and local navigation scroll across the full book panel
width. Put the normal gutter inside the scrolling content, not around its clipping box.
At rest the first label aligns with content; overflow enters from the panel edges. Keep
the existing 36px/32px control heights and 12px/6px inline padding.

Canonical Class 10 exercise paths render the same book UI, not an additional reading
format. Native links and solution disclosures must remain usable before enhancement.
The shared pure renderer is the only presentation implementation for authored lessons.
