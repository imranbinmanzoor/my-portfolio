# Muhammad Imran — Personal Site

A complete multi-page personal site. Three disciplines — **AI research contribution**, **frontend development**, **tutoring** — each with its own section and sub-pages. Hand-written, no frameworks, one shared stylesheet and one shared script.

---

## File structure

```
site/
├── index.html                      ← main landing page
├── assets/
│   ├── styles.css                  ← shared across every page
│   └── scripts.js                  ← shared behaviour
├── IMAGES/                         ← photographs, project screenshots, favicons
├── ICONS/                          ← branded and monochrome tool icons (inherited)
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

It's static. Any host works — Netlify, Vercel, GitHub Pages, plain shared hosting, a friend's Raspberry Pi.

1. Upload the whole `site/` folder to the host.
2. Point the domain at `index.html`.
3. Done.

For GitHub Pages: put these files in the root of the `main` branch (or a `gh-pages` branch) and enable Pages in repo settings.

---

## Editing content

### Changing role priority or copy
Everything on the landing page is in `index.html`. The three pillar sections (`#research`, `#work`, `#tutoring`) are marked with `data-pillar` attributes that drive their accent colour; changing the section order or swapping a pillar is just moving HTML.

### Adding a new project
1. Copy `projects/portfolio.html` to `projects/your-project.html`.
2. Replace the hero, meta-grid values, screenshot image, and prose body.
3. Update the prev/next links at the bottom of each project page so the chain stays intact.
4. In `index.html`, add or swap a card inside the `.work-grid` pointing to the new page.

### Adding a new solution chapter
1. Copy `solutions/class-9-unit-1.html` to `solutions/class-X-unit-N.html`.
2. Replace the chapter header, the section contents, and the sidebar TOC links.
3. In `solutions/index.html`, find the matching unit card and change `is-soon` or `is-planned` to `is-live`, and wrap it in `<a href="...">`.
4. Optionally update the featured card in the main `index.html#tutoring` section.

### Formspree — the contact form
The form posts to `https://formspree.io/f/xzzangvz`. Submissions land in the account that owns that endpoint. To change: edit the `action` attribute of `#contact-form` on `index.html`.

### Theme colours
All palette values live at the top of `assets/styles.css` under the `:root` block (light) and `[data-theme="dark"]` block. Change one value and every page updates.

---

## The three accents

| Pillar    | Accent | Hex (light) |
|-----------|--------|-------------|
| Research  | deep ink-navy | `#2c4768` |
| Frontend  | forest sage | `#2d5a4a` |
| Tutoring  | amber gold | `#8a5f1e` |

Applied via `data-pillar="research|frontend|tutoring"` on a `<section>` or `<body>`, which sets `--pillar`, `--pillar-soft`, and `--pillar-tint` custom properties for everything nested below.

---

## Content status (what's real vs placeholder)

**Real / accurate:**
- Contact details, social handles, location
- Education, certificates, dates
- Project names and descriptions (Omnifood, Modern Page, Pig Game, Portfolio) — these exist in the original zip
- Mindrift CI-STEM, SciCode, Photomath descriptions — drawn from context
- Class 9 Unit 1 Real Numbers — all example problems and worked solutions are mathematically correct

**Placeholder / hypothetical (for your later editing):**
- Exact unit counts per class (17, 13, 14, 10)
- The specific list of "coming soon" chapter titles
- Some phrasing in the tutoring service descriptions (especially formats, pricing terms)
- Video placeholders — actual video embeds can replace them later

---

## Built with

- Fraunces (serif display) and Geist (sans + mono), via Google Fonts
- KaTeX for math rendering on the solutions pages
- No JS framework. Everything is vanilla.
- Mobile menu is a top-level `position: fixed` overlay with its own stacking context — no z-index fragility inside the sticky nav.

---

Ship it.
