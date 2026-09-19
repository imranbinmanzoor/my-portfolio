# Muhammad Imran — portfolio and mathematics library

The approved pilot uses a reproducible static build with no package dependencies.

```powershell
npm run build
npm run check
npm run preview
```

Open http://127.0.0.1:4173/ after starting Preview. It serves `dist/`, not the repository root.
Root HTML/assets are a preserved historical snapshot; edit `src/` and `content/`.
The Pages release workflow builds, checks, and publishes only `dist/`.

Read [project state](docs/PROJECT_STATE.md), [source and route map](docs/SOURCE_MAP.md),
[design system](docs/DESIGN_SYSTEM.md), [mathematics rules](docs/MATH_AUTHORING.md),
[testing](docs/TESTING.md), and [deployment](docs/DEPLOYMENT.md).

The owner approved the pilot and requested its publication before full rollout.
Later production releases still require explicit approval.
Class 9 original authoring sources are missing; preserved SVGs must not be mistaken for LaTeX sources.
Class 10 structured content and both question banks were extracted without content edits.
