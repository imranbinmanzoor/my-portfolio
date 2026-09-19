# Design system

Current implementation: the owner's original portfolio foundation, rebuilt in the maintained static source system. This is a checked visual pilot for live review, not final aesthetic acceptance. Reference evidence: ORIGINAL_DESIGN_REVIEW.md. Current checks: FOUNDATION_QA.md.

## Source roles

- src/assets/tokens.css: semantic colour, typography, spacing, frame and appearance roles.
- chrome.css: shared personal navigation, mobile dialog, footer and focus rules.
- scroll-frame.js: SiteScroll API; one scrolling owner on each viewport.
- site.css: portfolio, library, project and tutoring compositions.
- book.css and book-layout.js: shared book overview, reading workspace and screen controls.
- src/books/overview.mjs: one metadata-driven overview renderer for published books.
- math-lab.css / math-lab.js and math-models.js: opening mathematical explorer and independently checked models. Existing book sources retain mathematical rendering and Practice behavior.

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

Inter owns prose and controls, including genuine italic faces. Synthetic slant is disabled. KaTeX owns Class 10 mathematics and the homepage explorer; Class 9 mathematical SVGs remain preserved. Named operators are upright; mathematical variables use math italics. Standard operators replace bare Re/Im in rendered Class 10 expressions without changing authored data or paper identities.

## Page frame and scrolling

At 800px and wider, the personal navigation and right workspace share a 16px top/bottom inset. The right workspace scrolls internally; navigation remains aligned with its frame. The rail is 80px at 800–1199px and 248px from 1200px. At narrower widths, the document scrolls normally with a compact personal header and accessible menu. SiteScroll handles the owner change; book code must not assume window.scrollY is always the page position.

Shared content maximum is 1280px; book gutters are 24px, reducing to 18px on phones. Exercise navigation, section headings and reading wrappers share their appropriate content edge. At 1000px, a 140px unit rail sits beside the reading area with a 20px gap. Smaller screens use a horizontal exercise strip.

Book breadcrumbs use one 45px sticky row at the top of the reading frame, with a 44px link height and a subtle glass surface after scrolling. The horizontal exercise strip scrolls away; Concepts / Examples / Exercise remains below the breadcrumb. The current question/example label occupies a compact 36px sticky row below the local jump controls, constrained to its own question block. Deep part/compact links include that height in their scroll margin. Parent links remain present at all widths; the home icon has a text alternative, and the shortened unit name remains available to assistive technology. Overview and unit breadcrumbs share the same vertical rhythm. In generated paper view only Back to paper settings is sticky.

Book introductions place a modest cover beside the text instead of at the far end of a large empty row. Covers disappear on small screens. The useful contents follow promptly. Public book links are explicit high-contrast Open book controls; planned books accurately indicate their status.

## Interaction and grouping

The three discipline controls are disclosures, with native buttons, aria-expanded and aria-controls. One can be open at a time. On desktop, the detail spans the row and forms a continuous boundary with its selected card; its accessible name comes from the selected button without a duplicate visible title. On mobile it follows its card. Connector geometry is measured from actual border boxes, including fractional browser scaling, rather than inferred from nominal grid widths. Enter and Space operate the button; opening a panel does not move focus unexpectedly.

This applies NN/g's common-region guidance (https://www.nngroup.com/articles/common-region/) and the W3C disclosure pattern (https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/), consulted 2026-09-19. It is a design judgment, not a claim of user-study validation.

Project tiles are single links with a View project hover/focus cue and no decorative arrows. Tutoring uses concise subject introductions and three grouped learning cards instead of a tall asymmetric text split. Footer links have 44px targets, coherent padding and a separate copyright row.

Contact success replaces the form with a prominent Message sent panel, animated checkmark, focused status and Send another message control. Reduced motion disables the animation. Failure preserves entered fields. Never send real test messages just to verify presentation.

## Accessibility, mathematics and print

Use visible focus, semantic controls, measured contrast, reduced-motion behavior, mobile-menu focus containment and Escape return. Keep long mathematics in its own accessible horizontal scroller. Empty search fields must not show a clear button; the clear control appears immediately when text is entered. The search wrapper owns the border and focus ring.

The homepage explorer sits immediately after the compact personal introduction and before the discipline cards. It offers three independent views: odd-number square layers, a parabola and its tangent, and exact fair-coin probabilities. Native sliders, keyboard tabs and a magnification checkbox update the visual and mathematical account together. A compact disclosure gives the reasoning and assumptions. There is no autoplay, experimental simulation, or claim of research provenance. Math labels use KaTeX; model functions are separate from rendering.

Print uses normal document flow, independent of the fixed desktop workspace. Worked keys use block fragmentation instead of the answer stack's screen grid; short explanatory stages stay with their derivations. Preserve A4 section starts, measured MCQ options, split timing, lowercase key letters and existing paper serialization. Mathematical correctness remains a separate review obligation.

Shared interface text is 13px; metadata is 11–12px, portfolio body 14–15px, and book reading prose 16px. Catalogue, project, tutoring and book overview intros share the same measured typography: 11px/1.5 eyebrow, 34px/1.15 title, and 15px/1.8 lead; phones use 30px titles and 14px leads. Eyebrow-to-title spacing is 12px and title-to-lead spacing is 20px. Page composition may differ: a book cover sits beside its text, while the catalogue has one text column. Unit/home headings are 32px on desktop and section headings normally 24px. KaTeX keeps its mathematical metrics. Library and project catalogue introductions share a divider and bottom spacing.

Functional icons use a common line family. Generic action labels stay stationary; primary pills are never underlined. Text links retain an underline at rest and on hover, with consistent colour and focus treatment. Decorative arrows and the earlier arriving-arrow motion are removed with the owner's permission. Directional icons remain where direction conveys meaning, such as Back, Next and breadcrumb separators. Do not reintroduce label shifts or duplicate arrows.

The single homepage introduction identifies the person and their work; there is no competing promotional headline beside it. The explorer adds a concrete invitation to interact. This follows visual-hierarchy and homepage-purpose guidance, not a claim of usability-study validation.

Research consulted: [NN/g visual hierarchy](https://www.nngroup.com/articles/visual-hierarchy-ux-definition/), [homepage guidelines](https://www.nngroup.com/articles/top-ten-guidelines-for-homepage-usability/), [Carbon button usage](https://carbondesignsystem.com/components/button/usage/), [USWDS links](https://designsystem.digital.gov/components/link/) and [W3C consistent identification](https://www.w3.org/WAI/WCAG21/Understanding/consistent-identification), 2026-09-19.

Mathematical references checked: [OpenStax derivatives](https://openstax.org/books/calculus-volume-1/pages/3-1-defining-the-derivative), [OpenStax binomial distribution](https://openstax.org/books/contemporary-mathematics/pages/7-10-the-binomial-distribution), and [University of Hawaii odd-number reasoning notes](https://crdg.hawaii.edu/developing-teacher-expertise-mathematics/modules/facilitator-resources/facilitator-reasoning-and-explanations-resources/Session5/resources/s05_p3_mathnotes_sum-consecutive-odd-problem.pdf). Diagrams, copy and controls are implemented locally; the references are not copied designs.
