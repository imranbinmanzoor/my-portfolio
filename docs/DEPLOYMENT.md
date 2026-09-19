# Deployment and rollback

## Verified production baseline

Domain: `imranbinmanzoor.com`. Repository: `imranbinmanzoor/my-portfolio`.
The completed audit verified all 36 tracked baseline files against production
(homepage after line-ending normalization). Baseline commit:
`7a2d89409c81312b0439727e18dd93724357968e`.
[Successful Pages run](https://github.com/imranbinmanzoor/my-portfolio/actions/runs/34738119789).
Exact current Pages publishing settings have not been verified through the settings API.

## Current local phase

`codex/portfolio-math-pilot` is local only. Build emits an allowlisted `dist/`.
The tracked root still holds the old production snapshot. Do not push this source
branch to a publishing branch: root publishing would include source/docs and still
serve the old homepage. Preview is not production.

The recommended release approach is a Pages workflow that uploads **only `dist/`**.
This is a proposed publishing-source change, not configured or approved. Retain CNAME,
domain and URLs. The actual publishing mechanism must be confirmed before a final,
reviewable workflow and rollback command can be called verified.

## Release gate

1. Obtain visual approval, then finish the approved rollout and full-site QA.
2. Read actual Pages settings and branch/environment protections. Prepare the exact
   workflow/diff without enabling or publishing it. No new hosting is required.
3. Run final Build and Check; inspect browser and A4 evidence. Review staged files for
   unintended sources, private documents, caches or credentials.
4. Record the release source commit, artifact digest, production baseline and the
   current publishing configuration. Show the user a concrete release/rollback summary.
5. Ask once for publication approval (including any publishing-source change).
6. After approval, publish through the verified mechanism, wait for Pages success,
   inspect live homepage/library/lesson/Practice and legacy redirects, and compare
   deployed build identity. Report the release and rollback commits.

## Rollback

No rollback action is needed while the pilot remains local. Production is unchanged.
For an eventual artifact-based release, rebuild and redeploy the last known-good source
commit/artifact through that workflow. If returning to the original root-based baseline,
use a reviewed revert/recovery commit and restore the recorded Pages publishing source
with approval; never force-push or reset shared history. Do not blindly deploy the
original baseline through the new build: the old commit has no build script.

The exact production rollback command remains pending verification of Pages settings.
This uncertainty must stay explicit rather than presenting an invented procedure.

## Official reference checked 2026-09-19

[GitHub Pages custom workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
supports uploading a dedicated site artifact and publishing it through Pages. It requires
the repository's publishing source to be configured accordingly. No configuration was changed.
