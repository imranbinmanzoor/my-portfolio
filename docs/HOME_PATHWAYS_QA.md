# Homepage audience paths and interface preview

2026-09-20. Implements the owner's request for visual evidence of interface work and
clearer grouping for professional visitors versus learners. The established personal
introduction, connected work map, colours, sidebar and typography remain the foundation.

## Change

- Replaced the repetitive three role disclosures with professional and learning paths.
- The larger professional column includes research/project routes and two existing
  project previews. Cards / List changes actual layout; an optional CSS inspector
  shows the corresponding rules. The images are previews, not embedded applications.
- The learning column groups the two published books and mathematics, programming,
  and Arabic & Quran tutoring. Hero entry links lead directly to either path.
- Removed the now-duplicated lower library/tutoring panels. About, factual contributions,
  selected projects, tools and contact remain. Refreshed the portfolio case's three
  genuine homepage screenshots.
- No dependencies, external requests, code execution or new professional claims.

Design references: [NN/g homepage iteration](https://www.nngroup.com/articles/case-study-iterative-design-prototyping/)
for showing work alongside service routes, and [W3C animation guidance](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html)
for optional motion. These inform the design; no visitor usability study was conducted.

## Browser evidence

Actual Codex Browser interaction with the local built site, including screenshots at
320, 430, 768, 1024, 1440 and 1920 CSS pixels. No document or new-component horizontal
overflow at those widths. The closed desktop audience panels finish about 10px apart
in height at 1024, 1440 and 1920px; they are not stretched to create empty interiors.

- Cards/List changes the layout and pressed state; Enter and Space work and retain focus.
- The CSS inspector updates for the selected layout and fits a 320px viewport.
- Dark theme inspected on the new controls and code panel.
- Reduced-motion emulation: switching succeeds with zero preview animations.
- Site loaded with script execution disabled: both project links and native CSS
  disclosure remain available; layout buttons stay hidden. Execution was re-enabled
  for Browser inspection without reloading the page; SiteScroll was still absent,
  confirming the site's scripts had not executed. Normal scripting restored afterward.
- The work map retains the selected Mathematics tab and focus when moving from the
  phone layout into the tablet hero. Existing keyboard arrow selection still works.
- Find learning support moves focus to the learning region and places its top at 112px
  on the tested phone. The library link opens the correct catalogue. Both hero paths
  set the expected hash and destination focus.
- No captured console errors or warnings during the homepage checks.

Evidence is local, not published: `home-pathways-*.png` and `home-pathways-matrix.json`
under the task's visualization directory. The case-study images are the reviewed
`public/IMAGES/portfolio-current-{desktop,tablet,mobile}.jpg` captures.

This is responsive Chromium emulation, not physical-device/cross-browser certification.
Contact submission, mathematical correctness and print were not re-tested for this
homepage-only change. Existing book source/data were not edited.

## Release

The source branch was merged with the newly published SEO foundation at
`c8dc702bcd8a9ad7c776aa7d8d5cb00e699b1eed`. Both the homepage CSS and factual Person/
WebSite JSON-LD were retained; the duplicate author meta was consolidated. The six
new static reading pages, book links, noindex rules and SEO regression checks remain.

Combined build: 60 checks passed, zero failed; two builds produced 79 identical files
across 26 HTML routes. Source digest:
`a120473cac6bb7ff38cd81657f0f29dea39541c294a122816d483fa72e436ace`.
The project preview link and all three updated portfolio device views were exercised
again on this combined build. Live identity and rollback are recorded after publication.
