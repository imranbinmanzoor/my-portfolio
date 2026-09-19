# Project operating instructions

This is Muhammad Imran's multidisciplinary portfolio and mathematics library.
Read `docs/PROJECT_STATE.md` before work, then the relevant design, mathematics,
testing, and deployment documents. The root remains a personal portfolio.
For personal copy, read `docs/PROFILE_AND_VOICE.md`. The owner is from Layyah,
Pakistan; older references to Multan are incorrect. Do not invent biography from
unavailable memory or infer employment from a public profile's organization field.

## Authority and safety

- Lead routine engineering autonomously: investigate, implement reversible changes,
  build, browser-test, document, and make coherent local commits.
- Preserve all pre-existing work. Inspect Git status first; stage explicit paths.
- Ask before production publication, history rewriting, substantial user-work deletion,
  DNS/domain changes, paid services, irreversible architecture migrations, or a major
  product/visual decision with materially different reasonable directions.
- The representative pilot needs visual approval before a site-wide redesign.
- Never push a production branch without release approval. Never force-push.
- No private PDFs, credentials, caches, student data, or unrelated files in public output.
- Keep work project-local. The supplied brief is user-owned; do not silently overwrite it.

## Source and workflow

- `src/`, `content/`, and `public/` are the local build inputs. `dist/` is generated.
  Root HTML/assets are the preserved production snapshot during the pilot.
- Run `npm run build`, then `npm run check`; `npm run preview` serves only `dist/`.
- Do not edit generated output as the only implementation of a change.
- Preserve all working routes, content IDs, question banks, and saved-paper compatibility.
- Prefer a static architecture, existing tools, and no-cost services. Do not create four
  independent copies of the book application.
- Missing authoring sources must remain explicitly documented. Recoverable HTML is not
  the missing original generator. Historical editions are recovery candidates, not accepted content.

## Quality

- Mathematical correctness is separate from rendering and frontend correctness.
  Follow `docs/MATH_AUTHORING.md`; never shorten reasoning to make a solution compact.
- Follow `docs/DESIGN_SYSTEM.md` and preserve the established Practice behavior.
- Browser claims require actual browser interaction. Check desktop, tablet, narrow and
  wider mobile; inspect screenshots. Print changes require A4 PDF inspection.
- Report only checks run on the current build, with limitations and evidence.
- Maintain `docs/PROJECT_STATE.md` at coherent milestones, including rollback identity.
