# Muhammad Imran — Personal Site

A complete multi-page personal site. Three disciplines — **AI research contribution**, **frontend development**, **tutoring** — each with its own section and sub-pages. Hand-written, no frameworks, one shared stylesheet and one shared script.

---

## What's new in this update

- **Hero portrait.** Your photo now sits on the right side of the hero, with a soft research-color glow anchoring it on the paper background. Hidden on mobile (the full-body photo is too tall for phone hero space; mobile users get a text-only hero, which is faster and cleaner).
- **Proof strip.** A clean typographic row directly under the hero — four columns covering *at work / background / builds with / teaches*. No card-grid clutter; just labelled lines that scan quickly.
- **Mobile menu accessibility.** `aria-hidden`, `inert`, and focus handoff to the close button when the menu opens.
- **Contact form: message-type selector.** Quick way for visitors to flag whether they're writing about research, frontend, tutoring, or something else.
- **Project pages: proof chip rows.** Each project page now has a small row of chips below the meta-grid (e.g. "Single-state object · Accessible buttons · Vanilla JS render loop · Keyboard-friendly logic") to signal what's notable.

---

## File structure

```
imran-site/
├── index.html                      ← main landing page
├── assets/
│   ├── styles.css                  ← shared across every page
│   └── scripts.js                  ← shared behaviour
├── IMAGES/                         ← photographs, project screenshots, favicons
│   ├── portrait.webp               ← hero portrait (new)
│   ├── my-pic.webp                 ← about-section thumbnail
│   └── ...                         ← project screenshots
├── projects/
│   ├── omnifood.html
│   ├── modern-page.html
│   ├── pig-game.html
│   └── portfolio.html              ← self-referential "this site" page
├── solutions/
│   ├── index.html                  ← library hub (all classes & units)
│   └── class-9-unit-1.html         ← flagship — complete Real Numbers chapter
├── tutoring/
│   └── index.html                  ← mathematics · coding · arabic
└── README.md                       ← this file
```

Every page in the site links to `assets/styles.css` and `assets/scripts.js`. A style change propagates everywhere.

---

## Deploying

It's static. Any host works — Netlify, Vercel, GitHub Pages, plain shared hosting.

1. Upload the whole `imran-site/` folder to the host.
2. Point the domain at `index.html`.
3. Done.

For GitHub Pages: put these files in the root of the `main` branch (or `gh-pages` branch) and enable Pages in repo settings.

---

## Editing content

### Replacing the hero portrait
The hero portrait is at `IMAGES/portrait.webp`. To replace it: prepare a transparent-background PNG/WebP (use a tool like remove.bg or Photoshop), then save it as `portrait.webp` to this folder. Recommended dimensions: roughly 1:3 to 1:3.5 aspect ratio (portrait orientation, full body), at least 800px tall for retina display.

### Adding a new project
1. Copy `projects/portfolio.html` to `projects/your-project.html`.
2. Replace the hero, meta-grid values, screenshot image, the project-proof-row chips, and prose body.
3. Update the prev/next links at the bottom so the chain stays intact.
4. In `index.html`, add or swap a card inside the `.work-grid` pointing to the new page.

### Adding a new solution chapter
1. Copy `solutions/class-9-unit-1.html` to `solutions/class-X-unit-N.html`.
2. Replace the chapter header, section contents, and sidebar TOC links.
3. In `solutions/index.html`, find the matching unit card and change `is-soon` or `is-planned` to `is-live`, and wrap it in `<a href="...">`.

### Formspree — the contact form
The form posts to `https://formspree.io/f/xzzangvz`. To change: edit the `action` attribute of `#contact-form` on `index.html`.

### Theme colours
All palette values live at the top of `assets/styles.css` under the `:root` block (light) and `[data-theme="dark"]` block.

---

## The three accents

| Pillar    | Accent | Hex (light) |
|-----------|--------|-------------|
| Research  | deep ink-navy | `#2c4768` |
| Frontend  | forest sage | `#2d5a4a` |
| Tutoring  | amber gold | `#8a5f1e` |

Applied via `data-pillar="research|frontend|tutoring"` on a `<section>` or `<body>`, which sets `--pillar`, `--pillar-soft`, and `--pillar-tint` custom properties.

---

## Built with

- Fraunces (serif display) and Geist (sans + mono), via Google Fonts
- Pre-rendered mathematics SVGs embedded directly in the Class 9 and Class 10 solution books
- No JS framework. Everything is vanilla.
- Mobile menu is a top-level `position: fixed` overlay with its own stacking context.

## URL structure

This repo uses directory `index.html` files for clean GitHub Pages URLs. For example, `projects/omnifood/index.html` is served as `/projects/omnifood/`. Legacy `.html` files remain only as redirect stubs so existing bookmarks do not break.

Mathematics content is organized as two self-contained book pages: `/solutions/class-9/` and `/solutions/class-10/`. Each book keeps its own internal unit/section router using URL fragments such as `#unit-1`; legacy Class 9 Unit 1 URLs are retained only as redirects.
