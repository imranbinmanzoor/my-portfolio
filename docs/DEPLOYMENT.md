# Deployment and rollback

## Current production release

Published and verified 2026-10-22: https://imranbinmanzoor.com/

- Source commit: 4fac881 (homepage briefs; every menu item a real page; new /work/, /about/,
  /contact/). `npm run check` passed 82 of 82; 30 HTML routes. All 163 served files matched
  the checked build; source paths returned 404. Immediate rollback: baa3c33.

## Earlier the same day

- Source commit: 6a3f573 (homepage rebuilt in direction A). `npm run check` passed 79 of 79.
- All 160 served files matched the checked build byte for byte; /src/, /docs/, /tests/ and
  /scripts/ returned 404. Live browser at 1440/1280/768/375px: no horizontal overflow,
  discipline cards one height, section titles on the panel edge, owner-confirmed facts present,
  no Mindrift codenames, photo identity loaded.
- Immediate rollback: 2fa7bae (token foundation, previous live release). Run "Build, check and
  publish Pages" with that source_ref. Earlier: 8f9cbd9.
- Limits: Actions run not inspected directly (no gh CLI); A4 print not re-inspected; the
  portfolio case-study screenshots still show the September design.

## Previous release (same day)

- Source commit: 5a81008 (design-token foundation, direction A), build source digest
  prefix 377a3df2145f; `npm run check` passed 82 of 82 on that build.
- All 161 served files matched the checked build byte for byte; /src/, /docs/, /tests/ and
  /scripts/ returned 404. Live browser measurements matched local: hero map and copy bottoms
  0px apart, evidence panels aligned, every inner page title 32px at x=312.7 (1440px).
- Immediate rollback: 8f9cbd9 (Netlify redirect on the 2026-09-23 audit release). Run
  "Build, check and publish Pages" with source_ref 8f9cbd9fc9a5d0d42ccac3cf220602f689183012.
- Limits: the GitHub Actions run itself was not inspected (no gh CLI on this machine); the
  live files were verified directly instead. A4 print output was not re-inspected.

Earlier rollback points: c8dc702bcd8a9ad7c776aa7d8d5cb00e699b1eed (Pages run 35483735643)
and the fully byte-verified 6128616b94f7d1366d818e1fe6b74d8c2d144407.

## Authority and verified configuration

On 2026-09-19 the owner explicitly requested publication of the broader redesign and
gave standing approval to publish future updates so they can be reviewed live. Publish
completed, checked website updates without another approval question; verify deployment
and retain a known rollback commit. This supersedes the earlier pilot-only approval.
Other safety boundaries in AGENTS.md still apply. Never force-push.

Repository: `imranbinmanzoor/my-portfolio`. Domain: `imranbinmanzoor.com`.
Before release, both authenticated API and signed-in Browser confirmed:

- Pages source: `build_type: legacy`, branch `main`, path `/`.
- Custom domain: `imranbinmanzoor.com`; HTTPS enforced; certificate approved for the
  apex and `www` names. Browser reports successful DNS validation.
- `github-pages` environment permits the `main` branch only, with no reviewer/wait rules.
- `main` is unprotected; the repository has no rulesets. Preserve the environment policy.
- Production/recovery commit: `7a2d89409c81312b0439727e18dd93724357968e`.
  Its tree is `f109301aa29443bb964cab46b0dba209f1fdc4e7`.
  [Previous successful deployment](https://github.com/imranbinmanzoor/my-portfolio/actions/runs/34738119789).

The release changed Pages to `build_type: workflow`. It did not change DNS, the custom
domain, HTTPS, repository visibility, or deployment protection. Root files are historical
output; publishing the repository root would serve the old homepage and expose source/docs.
Only the allowlisted `dist/` is uploaded by the new workflow.

## Build and publication

`.github/workflows/pages.yml` uses pinned official actions, Node 24.20.0, and separate
build/deploy permissions. Build and Check precede artifact upload and deployment. No
package install, server, paid service, or new domain is required. `.gitattributes` enforces
LF text checkout so Windows and Linux build inputs match. Build also normalizes gzip's
informational OS byte. Final Windows output and all 62 served Linux-built files match
byte for byte; `.nojekyll` is metadata, intentionally not served by Pages.

1. Inspect Git status and preserve user work. Develop on a `codex/` branch.
2. Run `npm run build` and `npm run check`; review required browser/print evidence.
3. Stage explicit paths, inspect the staged diff, and commit. Do not stage the user brief,
   `dist/`, `.local/`, credentials, caches, or test evidence.
4. Push the reviewed source branch. Read Pages settings and record the current live digest.
5. For the initial pilot only, set Pages Source to **GitHub Actions** (API equivalent:
   `PUT /repos/imranbinmanzoor/my-portfolio/pages` with `{"build_type":"workflow"}`).
   Verify CNAME and HTTPS remain unchanged before advancing `main`.
6. Fetch/recheck `origin/main`; inspect unexpected changes. Once authorized, publish with
   a normal fast-forward `git push origin HEAD:main`. No force flag.
7. Wait for **Build, check and publish Pages** to succeed. Inspect failure logs if needed.
   A successful Git push alone is not a completed release.
8. Compare live `/build-info.json` to the local digest. Use Browser on the actual HTTPS site
   to inspect homepage, library, lesson, Practice, Class 9 and legacy routes. Check fonts,
   runtime/network failures, and representative responsive states.
9. Record the release commit, workflow run, live digest, and verification in project state.

Every push to `main` runs this workflow. Keep ongoing work on its source branch until the
next completed, checked release. A documentation-only follow-up can remain on that branch; it does
not need an immediate production redeployment.

## Rollback without rewriting history

For an earlier release with this build system, open Actions → **Build, check and publish
Pages** → Run workflow. Choose branch `main` and enter the earlier verified source commit
in `source_ref`. This checks out that content while retaining the current workflow and the
environment's `main` deployment policy. Wait for success and compare the live build digest.
This option is implemented but has not yet been exercised as a production rollback.

The original pre-pilot commit has no build script. Do **not** pass it as `source_ref`.
To recover that exact original site after approval, create a new commit on top of remote
main using the recorded original tree:

```powershell
git fetch origin
$recoveryTree = git rev-parse '7a2d89409c81312b0439727e18dd93724357968e^{tree}'
$recoveryParent = git rev-parse origin/main
$recoveryCommit = git commit-tree $recoveryTree -p $recoveryParent -m 'Restore pre-pilot production snapshot'
git diff --stat $recoveryParent $recoveryCommit
git push origin "${recoveryCommit}:refs/heads/main"
```

This preserves all intervening commits and does not alter the working directory. Review
the recovery tree before the push. Then restore Pages to **Deploy from a branch**, `main`,
`/ (root)` (API: `{"build_type":"legacy","source":{"branch":"main","path":"/"}}`).
Keep the custom domain and HTTPS settings. Wait for Pages success and inspect the site.
The baseline tree and API configuration are verified; a production rollback has not been
run. Recovery restores the original site's known defects as well as its content. Prefer
an earlier checked pilot release once available.

## References

[Official Pages workflow documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
and [Pages API](https://docs.github.com/en/rest/pages/pages?apiVersion=2022-11-28)
were checked on 2026-09-19. Exact settings above came from this repository.
