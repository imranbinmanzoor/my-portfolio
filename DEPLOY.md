# Deployment

Use [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for baseline, approval, publication and rollback requirements.

The pilot is local only. Do not replace repository contents, stage indiscriminately, or push the source branch to production.
`npm run build` creates the reviewable public artifact in `dist/`; it does not publish.
