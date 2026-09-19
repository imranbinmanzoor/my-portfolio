# Redesign direction and history

## Current direction: the owner's original portfolio

The owner rejected the broader redesign after live review and selected their own older,
unfinished design as the base. The new source branch is `codex/original-design-foundation`.
Read `ORIGINAL_DESIGN_REVIEW.md`: it records the archive identity, detailed page/element/
state inspection, JavaScript and scroll findings, and the decisions for the next pilot.

Preserve the compact personal sidebar, neutral canvas and white panels, discipline
colors, project-specific imagery and careful animated details. Rebuild the incomplete
interaction machinery with shared semantic components. Bring the mathematics library,
reading and Practice into that language without changing reasoning or paper behavior.
The foundation is implemented; current checks are in FOUNDATION_QA.md and the active
visual contract is DESIGN_SYSTEM.md. Previous live source `055b4c0` is the immediate
recovery point for this release. The reference archive remains
local and unmodified; it is not a release candidate.

## Previous direction — published, then rejected visually

The owner rejected a consistency-only pass on 2026-09-19 and asked for a real redesign.
The published pilot at `1478f06` is a recovery point, not the visual acceptance standard.
Work is on `codex/site-wide-redesign`. The owner requested publication for live review
and gave standing approval to publish completed, checked updates on 2026-09-19.

## Previous product direction (historical)

A personal portfolio led by work and clear explanations. It should feel like a thoughtful
mathematician's working space, not an agency landing page with repeated service cards.
Keep the original interactive mathematical study, but give it a deliberate place in the
composition. Use a confident editorial hierarchy, a restrained blue palette, readable
metadata, real project imagery, and purposeful whitespace. Do not change authored
mathematical reasoning in the course of a visual redesign.

- Home: personal introduction → selected work → research approach → mathematics library
  and teaching → concise background → contact. Remove repeated overviews and tool lists
  from the main narrative; retain useful facts where they belong.
- Projects: browsable visual index and clear case-study introductions, with actual
  evidence and an honest distinction between learning projects and professional work.
- Library: a recognisable book catalog, clear availability, direct routes into the two
  published units, and restrained planned-book entries.
- Books: book overview → a focused reading workspace with desktop section navigation;
  narrow screens keep compact, reachable navigation and local equation scrolling.
- Practice: deliberate paper-building workspace and clearly separated paper/key views.
- Tutoring: subjects, audience, learning approach and enquiry path, without inflated
  promises of completed books or videos.

## Research notes

Primary sites inspected: [Mathigon](https://mathigon.org/),
[3Blue1Brown](https://www.3blue1brown.com/), and [Nicky Case](https://ncase.me/).
Useful patterns: lead with things people can explore; make the learning catalog easy
to browse; demonstrate a creator's work rather than repeating claims about ability.
These inform content and interaction decisions, not a copied visual design.

## Acceptance work

- Build new compositions before asking the owner to judge the direction.
- Check every route family at 1440, 768, 430 and 320 CSS pixels, with screenshots and
  measurements. Verify navigation, dark/light, keyboard, search, disclosures and Practice.
- Preserve book content hashes, question IDs, old URLs and generated-paper behaviour.
- Inspect A4 output if shared styles affect printing. Record actual checks and limits.
- Publish the checked direction for live review under the owner's standing approval;
  verify the deployment and report its rollback point.
