# SEO on the existing website

Updated 2026-09-20. The owner explicitly rejected a separate continuous-reading
format and duplicated content created only for SEO. This supersedes the initial SEO
foundation published at c8dc702bcd8a9ad7c776aa7d8d5cb00e699b1eed.

## One book interface

The five existing Class 10 exercise/review views now have canonical paths under
/solutions/class-10/complex-numbers/: exercise-1-1 through exercise-1-4 and review.
They use the same book shell, CSS, controls, renderer and runtime as the original
interactive book. There is no separate reading stylesheet, reading format or
Continuous reading entry point. The former unit directory redirects to Exercise 1.1
and is excluded from the sitemap. The book overview remains at /solutions/class-10/.

Initial HTML contains the selected exercise's real concepts, examples and solutions.
Native solution disclosures and exercise links work before JavaScript. The shared
runtime adds search, tab keyboard behavior, MCQ feedback and Practice. Its routes
preserve old unit/exercise/part/compact fragments and saved-paper parameters; normal
exercise selection now updates the canonical path. Reload and browser Back work.

content/books/class-10/content-data.json is unchanged. render.js is shared by the
build and runtime, avoiding two authored presentations. All 130 question/example
parts and authored mathematical fields are checked. Review solutions now also show
existing authored steps and answers that the old renderer omitted. This is a display
correction, not new mathematical authoring or mathematical certification.

Build-time KaTeX provides visible mathematics and MathML. Closed working initially
uses native MathML, with full content present; the runtime uses the existing typesetter
when opened. Compressed inline book data reduces repeated transport size without
changing hashes or saved-paper identity. The data loader uses DecompressionStream;
if enhancement is unavailable, canonical exercises remain readable and disclose a
load-status message. All five exercise pages are below 2 MB uncompressed HTML.
Class 9 remains about 2.59 MB and needs a separate, content-preserving reduction.

## Site-wide metadata

Titles, descriptions and factual Person/WebSite metadata cover the actual AI evaluation,
frontend, code, mathematics and learning work. Exercise pages have LearningResource
and BreadcrumbList data. Titles describe individual pages instead of repeating every
keyword everywhere. No fabricated dates, qualifications, ratings or MathSolver claims.

Every indexable page has canonical and page-specific social metadata and a 1200x630
share image. Planned Classes 11/12 and the custom 404 use noindex,follow and are excluded
from the sitemap. Redirects are excluded too. A custom 404 offers existing destinations.

## Verification and limits

64 automated checks passed on the release candidate, including content/bank hashes,
Class 9 SVG preservation, 100-seed Practice tests, initial HTML content and mathematics,
partial-unit generation, internal links/fragments, metadata, JSON-LD, sitemap agreement,
page-size limits and canonical/legacy/saved-paper route compatibility.

Actual Chromium browser checks covered both books at 320, 430, 768, 1024 and 1440px;
no document overflow, full-width mobile navigation and unchanged compact control sizes.
Canonical navigation, keyboard tab selection, search-result navigation, Back, reload,
legacy compact bookmarks, review feedback and Practice generation were exercised.
With JavaScript disabled, Exercise 1.2 retained its 37 native solution disclosures,
967 MathML elements and keyboard-accessible exercise links; a solution was opened.

The browser cannot export PDFs on this host (Printing is not available), so no fresh
A4 print certification is claimed. Contact submission was not sent. Search Console
was not configured or inspected; deployment is not evidence of indexing or ranking.
See SEO_UX_REVIEW.md for the external audit assessment and remaining work.

## Primary references checked

- https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics
- https://developers.google.com/search/docs/fundamentals/creating-helpful-content
- https://developers.google.com/search/docs/appearance/title-link
- https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls
- https://developers.google.com/search/docs/appearance/structured-data/breadcrumb
- https://developers.google.com/search/docs/crawling-indexing/googlebot
- https://developers.google.com/search/blog/2026/03/crawler-blog-post
- https://katex.org/docs/api

The approach follows discoverable URLs, useful existing content and accurate metadata;
it does not require a second reading product or guarantee search placement.
