# Homepage hierarchy revision — 2026-09-19

The owner found that the opening mathematical questions distracted from their professional
roles. This revision moves the existing explorer to the mathematics library, after all four
book cards, inside a native disclosure. The homepage introduction leads straight into
research, development and teaching. Its existing library panel has a secondary
"Interactive ideas" link. No new biography, book content or mathematical models were added.

## Browser evidence

Actual in-app Browser inspection covered homepage and library at 1440, 768, 430 and 320px
viewport widths (900px height). Screenshots were inspected, not just captured.

- Homepage role cards immediately follow the introduction; no explorer or KaTeX scripts.
- No horizontal page overflow at the four widths. Both homepage library links have 44px
  minimum target height. Desktop and narrow-mobile role disclosures still operate with Enter.
- Fresh library navigation starts collapsed with four book cards before the explorer.
- Following the homepage link opens the disclosure, scrolls to it and focuses its summary.
  Browser back returns to the homepage; forward opens and focuses the explorer again.
- Enter closes the disclosure. Tab then reaches the footer, skipping hidden explorer controls.
  The summary has a visible keyboard focus ring.
- Patterns, Curves and Chance render correctly after relocation. Square-width endpoints,
  a keyboard curve-position change and both probability sliders at their upper endpoints
  update the rendered maths. Zero KaTeX error elements were observed.
- Open explanations and light/dark explorer appearance were inspected. A tablet layout
  defect found during this pass was fixed: diagram and explanation now share the same top
  coordinate (264.53125px in the measured open state), instead of vertically centring the
  diagram beside a long explanation. The short eyebrow no longer wraps unnecessarily.
- Bounded reload/navigation diagnostic windows for both changed routes had no runtime
  exceptions or failed network requests; console warning/error log was empty.

Screenshots are outside public output in the task's local visualization directory:
`hierarchy-home-{1440,768,430,320}.jpg`, `hierarchy-library-1440-closed.jpg`,
`hierarchy-library-1440-dark.jpg`, and `hierarchy-library-{768,430,320}-open.jpg`.

This is a hierarchy/layout revision. It does not re-certify the authored books. Existing
print evidence remains in FOUNDATION_QA.md; no print changes were made here. Physical
touch devices and screen-reader speech were not tested.

## Release

The final local run passed 43 checks, with zero failures. Two builds produced 63 byte-identical
output files. Source digest: 2e21955491283fed7fd94502b29b24982e154953eae79b5c748d784fef433ec7.
Live verification is pending. The pre-revision rollback source is
e14dc18dc9752407e0240411164af993ef3883a5.
