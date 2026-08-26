# Deploying the clean-URL version

The site is still plain static HTML and works with GitHub Pages. No framework or server rewrite configuration is required.

## Main clean URLs

- `/`
- `/tutoring/`
- `/projects/omnifood/`
- `/projects/modern-page/`
- `/projects/pig-game/`
- `/projects/portfolio/`
- `/solutions/`
- `/solutions/class-9/`
- `/solutions/class-10/`

Each clean URL is backed by a directory `index.html`, which GitHub Pages serves naturally.

## Legacy URLs

The old project `.html` pages, `/solutions/class-9-unit-1.html`, and `/solutions/class-9/real-numbers/` remain as small redirect files. This avoids breaking existing bookmarks or external links; the two old Class 9 Unit 1 URLs now forward into `/solutions/class-9/#unit-1`.

## Publish

Replace the current repository contents with this folder, keeping the existing repository and GitHub Pages settings, then commit and push:

```bash
git add -A
git commit -m "Use clean URLs and add Class 9/10 math books"
git push
```

The `CNAME` file is unchanged, so the custom domain remains `imranbinmanzoor.com`.

After GitHub Pages finishes its normal deployment, test the clean URLs above. Also test one old `.html` URL to confirm it forwards to the new location.


## Mathematics books

- `/solutions/class-9/` serves the supplied Class 9 Mathematics book directly.
- `/solutions/class-10/` serves the supplied Class 10 Mathematics book directly.
- Do not split or minify these two HTML files unless you intentionally rebuild the book runtime; they contain embedded fonts, mathematics SVGs, search data, question banks, and client-side unit routing.
- The legacy Class 9 Unit 1 URLs redirect to `/solutions/class-9/#unit-1`.
