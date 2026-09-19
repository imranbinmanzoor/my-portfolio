# Deployment and rollback

Current published source: `7f73d9310503795d9cc1115ddd20a1cfc8be1f38`.
[Successful release workflow](https://github.com/imranbinmanzoor/my-portfolio/actions/runs/35451753344).
Live digest: `f679a4e2c18c30f484035083b8fb1fbb6e7482cb448c02c456f0f4d5a7498fd6`.
Published and verified 2026-09-19. Immediate checked rollback source:
`d9327149fe298a128a7f4208979cd53d6e2089d3`, digest
`651cd426e205ce39478cf2a50ed44ebefc29c10a168500076f95088d1540fcbc`.
All 69 publicly served files match the checked local output; four source/private paths tested return 404.

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
