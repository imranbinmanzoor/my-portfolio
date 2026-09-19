# Navigation density release

Checked 2026-09-19. The owner clarified that "wide" meant the top-to-bottom size
of active exercise and Concepts / Examples / Exercise boxes, on every screen size.

## Changes

- Shared screen CSS gives exercise controls a 36px minimum height (previously 44px)
  and local section links 32px (previously 36px). Labels remain 13px.
- Active and inactive controls share their dimensions; selection does not move text.
- Exercise strip vertical padding is 2px, local navigation padding 4px, and gaps 4px.
- Label-fitting boxes use 6px inline padding at every width. Desktop controls no
  longer stretch across a fixed 128px rail; the longest label sizes the column.
- Restrict the generated-paper sticky exception to the visible Practice panel.
  Previously, a generated paper retained inside a hidden panel disabled the lesson's
  sticky breadcrumb and exercise navigation after switching back to a lesson.
- Mathematics, paper identities, print rules and text sizing are unchanged.

## Verification

Final source digest: `f679a4e2c18c30f484035083b8fb1fbb6e7482cb448c02c456f0f4d5a7498fd6`.
45 automated checks passed. Two builds produced 70 identical output files.

Actual Browser geometry checked Class 9 and Class 10 at 320, 430, 768, 820, 999,
1000, 1024, 1280, 1440, 1920 and 2560px: 22 route/viewport combinations. All had
36px exercise buttons and 32px section controls, without page overflow, clipped
labels or overlapping sticky rows. Exercise 1.1 measured 83.03px wide, Concepts
71.70px, and desktop rails 114.01px. Representative mobile, tablet and laptop
screenshots were visually inspected.

On narrow screens the breadcrumb ends at 45px, exercise strip at 85.67px, local
section row at 126.67px and sticky question label at 163px. The prior released
stack ended at 191px: 28px more room for content. Class 10's direct compact link
focused the requested solution with its top at 179.30px, below the question label.
Class 9 Home/End keyboard navigation still selected Exercise 1.1 and Practice.
The bounded warning/error console log was empty.

At 430 and 1440px, generated-paper navigation used static breadcrumb/exercise
controls and a sticky Back to paper settings bar. Returning to Exercise 1.2
restored both sticky navigation layers. That transition was verified after the
selector fix; the subsequent height-only change was covered by the final matrix.

Local evidence (outside public output):
`C:/Users/imran/.codex/visualizations/2026/09/19/01a0b813-35c5-7932-b1c0-7d287e96cc81/`
contains `all-width-nav-9.json`, `all-width-nav-10.json`, and representative
`all-width-nav-{9,10}-{320,768,1024,1920}.jpg` captures.

These are browser viewport checks, not physical-device or assistive-technology
certification. No new mathematical audit or print-layout change is claimed.

## Publication

Pending deployment verification. Immediate rollback is source
`d9327149fe298a128a7f4208979cd53d6e2089d3`, digest
`651cd426e205ce39478cf2a50ed44ebefc29c10a168500076f95088d1540fcbc`.
