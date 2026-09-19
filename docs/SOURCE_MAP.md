# Sources, baseline, and route migration

| Input | Purpose | Output |
|---|---|---|
| `src/pages/` | Portfolio, case studies, tutoring, library, redirects | Matching HTML paths in `dist/` |
| `src/components/` | Shared pilot header and book return navigation | Included by templates |
| `src/assets/` | Site behavior, original site CSS, shared tokens and pilot styling | `dist/assets/` |
| `src/books/class-9/` | Preserved SVG reading shell, extracted CSS/runtime | Class 9 HTML plus external assets |
| `src/books/class-10/` | Book shell and compatibility renderer | Class 10 HTML plus external assets |
| `src/scripts/practice-engine.js` | Shared paper model, selection, codes and rendering | Included in book runtime |
| `src/scripts/practice-ui.js` | Shared Practice controls, recall and printing | Included in book runtime |
| `content/books/` | Book metadata, authored Class 10 content, both banks | Embedded data blocks with preserved IDs |
| `content/library.json` | Class availability and edition metadata | Library cards and homepage counts |
| `public/` | Explicit static-asset allowlist, CNAME, robots | Copied to output |
| `scripts/` | Recovery, build, validation and local preview | Never copied to output |
| `tests/baseline.json` | Immutable baseline data/file/SVG hashes | Never copied to output |

The build uses Node built-ins only. `@@SOURCE(...)@@` includes source fragments;
JSON tokens safely embed data; the Class 9 bank is deterministically compressed.
CSS and runtime are emitted as external assets in their original execution order.
Build info identifies input bytes, not a date or misleading release label.

Root HTML/assets remain the tracked production snapshot during this pilot. Do not
edit them or serve the repository root to judge the pilot. Preview serves `dist/` only.

## Existing and added routes

Preserved: `/`, `/tutoring/`, `/projects/{omnifood,modern-page,pig-game,portfolio}/`,
`/solutions/`, `/solutions/class-9/`, `/solutions/class-10/`.
Preserved redirects: the four `/projects/*.html` stubs,
`/solutions/class-9-unit-1.html`, `/solutions/class-9/real-numbers/`.
Added: `/projects/`, `/solutions/class-11/`, `/solutions/class-12/`,
`/math-9/`, `/math-9.html`. The latter two redirect to Class 9, retaining fragments.
Directory normalization serves `/math-9` as `/math-9/` in the local preview.

Class 9 fragments remain `#unit-1`, `#ex11`, `#review`, `#unittest`, `#generator`.
Class 10 fragments remain `#/unit-1/ex11` through `ex14`, `review`, `generator`,
including content anchors and paper queries. Legacy `#unit-1` now resolves to the unit.

Deferred: independently generated exercise HTML URLs, a comprehensive map for older
About/Stack/Contact and historical Projects paths, and shared rendering adoption by
Class 9. Do not infer old redirect destinations without inspecting their historical content.

## Baseline recovery

The extraction script reads immutable Git objects at `7a2d894`. It refuses to overwrite
existing `src/`. Homepage recovery was compared with `7dcf3a5`: removing the injected
book and repairing two overwritten wrapper tags reproduces the historical portfolio
exactly after newline normalization. Legitimate portfolio content was not discarded.
Run extraction only into a fresh recovery checkout; ordinary builds need no Git history.

Class 9 source gap remains real. Class 10 extraction recovers the currently published
representation, not a missing upstream authoring workflow. Shared Practice code still
uses the existing BOOK/runtime contract; moving class-specific topic labels into
metadata is part of the later multi-book rollout, not a claim of complete consolidation.
