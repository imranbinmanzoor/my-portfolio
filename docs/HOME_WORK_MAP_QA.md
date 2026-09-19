# Homepage work map and About — 2026-09-19

The owner requested a tech-focused artifact connecting AI, code, mathematics and teaching,
then reported a connector through a label and excess space below the greeting. The final
map links to actual work, uses measured border-to-border SVG paths, and shares a compact
intro row with the contact controls aligned at its lower edge. About now separates a
personal account from the existing factual contribution list. No new credentials, client
results, simulated AI output or mathematical claims were added.

## Actual local Browser evidence

- All four fields inspected at 1440, 768, 430 and 320px widths, 900px height: 16 states,
  no horizontal overflow. Map heights stayed constant between fields at each width:
  256.82, 280.82, 280.82 and 279.13px respectively.
- Native SVG paths sampled at 101 points per path and compared with all four controls
  at 1440, 1043, 768, 700, 699, 430 and 320px: zero control collisions. Border attachment
  is recomputed from actual geometry; controls and their focus rings are above the wires.
- Desktop contact controls and map bottom aligned within 0.001px at 1440, 1043, 768
  and 700px. Minimum field-control height was 44px, increasing to 56px on smaller layouts.
- Right, Home, End and Tab operated the roving tabs and labelled panel. Selection updates
  its description, destination, colour and selected state together. Focus was retained
  across the 699/700px responsive boundary; the final implementation also scrolls the
  retained focus into view. Phone DOM order matches the visible order after role cards.
- Actual links opened research, projects, mathematics library and tutoring. Back navigation
  worked. Light and dark map/About appearance and keyboard focus were visually inspected.
- Final bounded reload diagnostics contained no runtime exceptions or failed requests;
  console warning/error log was empty.

Final screenshots, inspected outside public output in the task visualization directory:
work-map-home-final-{1440,768,430,320}.jpg. Additional evidence:
work-map-edges-{1440,320}.jpg, work-map-dark-1440.jpg and work-map-edge-checks.json.

Research and adopted principles are linked in DESIGN_SYSTEM.md. The implementation uses
native SVG and ResizeObserver; React Flow was a reference, not an added dependency.

## Scope and limitations

This is homepage presentation and navigation work. No book content, paper generation or
printing changed; existing A4 evidence remains in FOUNDATION_QA.md. Physical touch devices,
screen-reader speech and forced-colour rendering were not tested. Reduced-motion styles
are present; no autoplay is used. Abandoned local artifact experiments are not release evidence.

## Release

Final local run: 44 checks passed, zero failed; two builds produced 65 byte-identical
output files. Source digest: 8b1f48222474bae4e6ef7982607f5f388ef50da73bd13a390323057c951f1d0d.
Production verification pending. Immediate checked rollback:
771d13cca7188c4e8762d48c6626da3fde33ec46, digest
2e21955491283fed7fd94502b29b24982e154953eae79b5c748d784fef433ec7.
