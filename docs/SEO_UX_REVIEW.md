# SEO and interface review — 2026-09-20

The owner supplied the Claude Design audit at
https://claude.ai/artifact/Cmg2FPY8NYyJnHpx6pw6Ro. Its seven rendered artboards were
read in the browser. The report is third-party advice, not implementation authority.
Findings below distinguish reproduced issues from suggestions or unverified claims.

| Finding | Assessment and action |
| --- | --- |
| Separate SEO reading experience distorts flow | Owner rejected it. Replaced it with prerendered existing book views and one shared runtime. |
| Mobile navigation clipped inside a second gutter | Reproduced. Both exercise and Concepts/Examples/Exercise strips now scroll across the full book panel width, with padding inside the scroller. |
| Mobile header blends into content; breadcrumbs vary | Added restrained border, glass and depth. All page families use the same measured header offset; stacked book controls move together. |
| Skip-link contrast | Reproduced inherited text color. Explicit surface-on-ink colors now work in both themes. |
| Missing social image | Added an inspected 1200x630 PNG and per-page Open Graph/Twitter metadata. |
| No custom recovery page | Added shared-frame 404, actual 404 status in local preview, and clear destination links. |
| Class 9 HTML about 2.59 MB | Confirmed. Still exceeds Google's current 2 MB HTML fetch limit; not silently rewritten. Original authoring sources remain missing. |
| Social link targets only about 20px | Not reproduced: current sidebar anchor boxes are 48px high. Text-glyph bounds are not target bounds. |
| Reduce all font sizes to five | Not adopted indiscriminately: KaTeX mathematical metrics must not be flattened. Shared UI/intro type scales remain the reference. |
| More tokens and less position-based book color | Reasonable maintenance work; not claimed complete in this release. |
| Add qualifications, pricing, availability or WhatsApp | Requires genuine owner facts and channel preferences. Nothing invented from the audit. |
| Fast loading / perfect CLS | Audit numbers were not rerun as a controlled performance study and are not presented as current verified scores. |

## Professional content and hierarchy

The personal homepage remains the root. A larger AI & digital work path shows genuine
project previews with working Cards/List controls and corresponding inspectable CSS.
The learning path groups the mathematics library and tutoring. The compact work map
remains, after these paths on phones. There is no simulated AI performance demo.

The toolkit now represents scientific computation, AI evaluation, mathematical authoring
and web engineering with consistent line icons. Python/Git/LaTeX/HTML/CSS/JavaScript were
confirmed; NumPy/SciPy/SymPy/Matplotlib/Jupyter are owner-authorized inferences from the
work, not independently verified credentials. PROFILE_AND_VOICE.md records that boundary.

Search topic coverage comes from real content: homepage research/contributions for AI,
project index and case studies for frontend/code, the library and actual exercises for
mathematics/solutions, and tutoring for personal learning. Research currently has less
substantive public material than the books; deeper factual case studies would help when
source material is available. Do not invent projects or insert duplicate keyword pages.

## Remaining priorities

1. Reduce Class 9 transfer/DOM size while preserving every rendered expression, content ID
   and Practice identity. Recover authoring sources where possible; review math separately.
2. Inspect Search Console coverage and canonical selection after authorized account setup.
3. Obtain fresh A4 print evidence in a browser that supports PDF export. This host's browser
   reports Printing is not available; screen and data checks do not replace print review.
4. Continue shared-token cleanup and test physical devices/other browser engines. Current
   responsive evidence is Chromium emulation, not cross-browser certification.

No external messages, form submissions, paid tools, DNS changes or new frameworks were used.
See SEO_INDEXING.md, HOME_PATHWAYS_QA.md and PROJECT_STATE.md for implementation and release evidence.
