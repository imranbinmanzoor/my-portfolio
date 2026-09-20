# SEO and indexing foundation

Work date: 2026-09-20. Repository baseline and rollback source:
`6128616b94f7d1366d818e1fe6b74d8c2d144407`.
Baseline live digest: `4d8cb3dc3f0cd9af18052825b6148f74791f9c525da58756f9487a33b072ea8a`.
Baseline Pages run: https://github.com/imranbinmanzoor/my-portfolio/actions/runs/35452139009 (success).

## Implementation

The supplied package matched the Class 10 authoring schema and most integration anchors,
but not the current design. Its regular-expression HTML stripping could remove inequalities
and surrounding text. It also omitted givens, compact working, source notes, history and
rule explanations. It linked to absent exercises/reviews for partially published units,
relied on client-side math rendering, and did not include the new module in build identity.
Those issues are corrected in the maintained generator; the patch script was not applied.

`content/books/class-10/content-data.json` remains the single mathematical authoring source.
No content or bank data changed. `scripts/seo-pages.mjs` builds these six canonical pages:

- https://imranbinmanzoor.com/solutions/class-10/complex-numbers/
- https://imranbinmanzoor.com/solutions/class-10/complex-numbers/exercise-1-1/
- https://imranbinmanzoor.com/solutions/class-10/complex-numbers/exercise-1-2/
- https://imranbinmanzoor.com/solutions/class-10/complex-numbers/exercise-1-3/
- https://imranbinmanzoor.com/solutions/class-10/complex-numbers/exercise-1-4/
- https://imranbinmanzoor.com/solutions/class-10/complex-numbers/review/

The unit directory links only to published work. Exercises contain their definitions,
reasoning, worked examples, full solutions, answers, optional compact work and authored
notes. All 130 parts remain present. Content is in the initial HTML. Build-time KaTeX
produces visual HTML plus accessible MathML; compact alternate derivations use native
MathML to avoid excessive repeated layout markup. The longest new page stays below
Googlebot's documented 2 MB uncompressed HTML fetch limit. Rendering fails the build on
unsupported TeX. The MIT-licensed renderer is pinned to the existing book's 0.16.47 and
vendored outside the public output. Building remains offline with no npm install.

The shared site navigation, colors and typography are reused. Each new page has a title,
description, self-canonical, one H1, visible linked breadcrumbs, BreadcrumbList, accurate
LearningResource/author metadata, and a return link to its matching interactive view.
No MathSolver markup, fabricated publication date, board approval or ranking guarantee.
The existing experimental-edition limitation remains visible.

Class 10's initial response now contains the existing book overview and a crawlable
unit link, instead of an empty main element. Its template and fragment application remain.
Classes 11/12 retain their status pages and follow links with noindex,follow, and leave
the sitemap. Both book overviews and the library have breadcrumb JSON-LD; the homepage
has minimal factual Person/WebSite markup. The source digest includes build modules.

## Verification

Baseline: npm run build and npm run check passed 45 checks, live digest matched main.
Candidate: npm run build and npm run check passed 59 checks, including tests/seo.mjs.
Checks cover all local assets; absolute/relative internal links and static fragments;
unique titles/descriptions/canonicals; initial visible H1 (inert templates and hidden
interactive views excluded); exact sitemap/indexability agreement; only the two planned
books noindex; no orphan indexable pages; robots; parsed JSON-LD/breadcrumb requirements;
all 130 authored parts and all displayed mathematical fields; inequalities and unsafe
markup; partial-unit generation; and a 2 MB ceiling on new pages. Existing content hash,
SVG, question bank and 100-seed Practice regression checks remain active.

Cloud Browser blocks loopback and file previews. No local Browser success is claimed.
The available browser surface has no viewport resizing capability; desktop and mobile
verification must be distinguished in the release evidence. Production browser inspection
and HTTP byte verification will be recorded after the checked Pages deployment.

## Search Console

Not configured or inspected yet in this release work. Continue after live verification:
Domain property if practical; ownership verification; sitemap submission; URL Inspection
for home, /solutions/, /solutions/class-10/, unit and Exercise 1.1; indexing requests and
Page indexing report. Account/DNS intervention must use the secure browser flow. Do not
claim Google indexed a page from HTTP success or a sitemap submission alone.

## Official references checked

- https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics
- https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
- https://developers.google.com/search/docs/crawling-indexing/block-indexing
- https://developers.google.com/search/docs/appearance/structured-data/breadcrumb
- https://developers.google.com/search/docs/crawling-indexing/googlebot
- https://support.google.com/webmasters/answer/9008080
- https://support.google.com/webmasters/answer/9012289
- https://katex.org/docs/api

These support static discoverable URLs, canonical sitemap entries, crawlable noindex status
pages, breadcrumb markup, the fetch-size limit, and the Search Console verification process.
