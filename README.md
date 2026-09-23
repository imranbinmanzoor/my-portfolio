# Muhammad Imran — portfolio and mathematics library

A static site with a reproducible build and no package dependencies (Node 22+).

```powershell
npm run build     # generate dist/ from src/, content/ and public/
npm run check     # data, route, SEO, accessibility-structure and regression checks
npm run preview   # serve dist/ at http://127.0.0.1:4173/
```

`node tests/browser.mjs http://127.0.0.1:4173` runs the interaction suite against a served
build (Playwright is installed separately; see [testing](docs/TESTING.md)).

Build and check never publish; publication follows the owner's approval rules in
[AGENTS.md](AGENTS.md) and [deployment](docs/DEPLOYMENT.md). Preview serves `dist/`, not the repository root. Root HTML/assets are a preserved historical
snapshot; edit `src/` and `content/`. The Pages workflow builds, checks and publishes only `dist/`.

Read [project state](docs/PROJECT_STATE.md), [source and route map](docs/SOURCE_MAP.md),
[design system](docs/DESIGN_SYSTEM.md), [mathematics rules](docs/MATH_AUTHORING.md),
[mathematics correction log](docs/MATH_CORRECTION_LOG.md), [testing](docs/TESTING.md) and
[deployment](docs/DEPLOYMENT.md).

Authored book data and the Class 9 reading source are locked (`tests/locked-sources.json`):
presentation changes go through shared styles or build-time transforms. Class 9 original
authoring sources are missing; preserved SVGs must not be mistaken for LaTeX sources.
Third-party code and fonts in `public/vendor/` keep their licenses (KaTeX: MIT; Inter: OFL 1.1).
