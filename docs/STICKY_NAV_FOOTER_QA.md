# Mobile reading navigation and footer consistency

Reviewed 2026-09-19. Follows the project-case release 3c2a48bffdb773902b3c2d2e3f6207e17ff3b6.

## Changes

- Restore the sticky horizontal exercise strip below 1000px in both books.
- Inherit its measured height instead of overriding it with zero. Place local section
  links and question labels below it; include that height in anchor offsets.
- Keep the desktop exercise rail, narrowed from 140px to 128px with a 16px column gap. Its height is excluded from the vertical stack.
- Both books use 8px horizontal control padding. Exercise 1.1 measures about 87px wide on phones, while retaining its 44px height; section links retain 36px heights.
- Round Class 9 measured heights up, as Class 10 does, to avoid fractional overlap.
- Keep the three section links on one row at 320px. Both strips use the same vertical padding.
- Add Class 9 Left/Right/Home/End navigation and one keyboard tab stop for the selected tab.
- Retain the Class 10 generated-paper exception: only Back to paper settings stays sticky.
- Give all footers their own rounded panel with a 16px background gap. Remove the desktop
  workspace background override that visually attached the book footer to the content.
- Replace accumulated end-of-lesson padding/margins with one 32px container inset.
- Remove redundant homepage library/tutoring heading badges. Preserve meaningful
  navigation, interaction, field and technology icons.

## Actual Browser checks

Both books were scrolled within Question 1 at 320, 430, 768, 999, 1000 and 1440px.
At widths below 1000px the pinned geometry, relative to the scrolling frame, was:

| Layer | Top | Bottom |
| --- | ---: | ---: |
| Breadcrumb | 0 | 45 |
| Exercises | 45 | 101.67 |
| Concepts / Examples / Exercise | 102 | 154.67 |
| Question label | 155 | 191 |

The desktop frame adds its 16px screen inset. At 1000px and above, the rail remains
beside the content, the section row starts at 45px and the question label at 98px.
No horizontal page overflow was measured in these states.

Class 10 Exercise anchor navigation was exercised. The direct compact link
`#/unit-1/ex11/ex11-q1-i-compact` opened its disclosure, focused the target and placed
it at approximately 207px, below the question label's 191px bottom on a 430px viewport.
Class 9 Left/Right selected adjacent exercises. Home/End selected the first/last exercise tab and kept the selected tab in view.
Class 10 Home returned from Practice to Exercise 1.1. A generated Class 10 paper was
scrolled at 430 and 1440px: breadcrumb and exercises were static, and only the return
bar stayed pinned. Returning to settings restored the reading-navigation behavior.

Footer checks cover 14 route/view states at 320, 430, 768 and 1440px: homepage, project
index, four project cases, library, four book overviews, tutoring, and both Unit 1 lessons.
All 56 states had a 16px content/footer gap, contrasting page/panel backgrounds and no
horizontal overflow. Shared footer height was approximately 106.93px at 768/1440px and
222.13px at 320/430px. Desktop book footer boundaries and homepage editorial headers
were also inspected visually.

Evidence is outside public output in the task visualization directory:
`sticky-class-{9,10}-{width}.jpg`, `footer-separation-{width}.json`,
`footer-separated-*.jpg` and `home-editorial-headers-430.jpg`.

## Limits

These checks use the actual in-app browser with viewport overrides, not physical phones.
Screen-reader speech and every question/paper combination were not exhaustively tested.
No mathematical content, bank identity, saved-paper format or print layout was changed.
Class 9 retains its existing generator; the single return-bar workspace is Class 10.
Initial footer measurements accidentally selected Class 10's fixed back-to-top control
as the preceding element; final measurements explicitly use the visible book content.
One scroll-settling probe timed out during Class 9 panel switching; the selected state,
visible Practice controls and subsequent Home navigation were verified directly.

Build and publication verification is recorded in PROJECT_STATE.md and DEPLOYMENT.md.
