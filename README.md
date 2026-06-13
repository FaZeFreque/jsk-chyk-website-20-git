# CHYK Website

Static website for CHYK — Chinmaya Yuva Kendra. No build framework: plain HTML + CSS + JS, with all editable content in `data/*.js`.

## Daily use (non-technical)

Double-click **`OPEN CHYK CONTENT MANAGER.cmd`** and pick from the menu:

1. **Open Content Manager** — edit articles, events, talks, images, etc. in a friendly dashboard (auto-backups on every save).
2. **Open Visual Editor** — click the real website to edit text, images and cards (Canva-style).
3. **Preview the website** — see the site exactly as visitors will.
4. **Check content for errors** — finds broken data files and missing images.
5. **Build hosting package** — creates a clean `dist/` folder ready to upload.
6. **Open the content guide** — the how-to document (`CONTENT-GUIDE.md`).

The Visual Editor also has its own launcher, **`OPEN CHYK VISUAL EDITOR.cmd`**.
Full guide: `content-manager/VISUAL-EDITOR.md`.

## Publishing to the web host

Run **`MAKE HOSTING PACKAGE.cmd`** (or option 4 above). Upload the **contents of the `dist/` folder** to the host. Nothing else is needed on the server — it is a plain static site.

## Folder map

| Folder / file | What it is | Goes to host? |
|---|---|---|
| `*.html` | The website pages | Yes |
| `css/`, `js/`, `data/` | Styles, page logic, **editable content** | Yes |
| `assets/` | All images/videos used by pages | Yes |
| `assets/site/home/tunnel/` | Homepage tunnel animation frames | Yes |
| `assets/site/` | Organized branding and homepage media | Yes |
| `content-manager/` | Local editing dashboard + automatic backups | No |
| `tools/` | Check + packaging scripts | No |
| `_SOURCE FILES (not for hosting)/` | Original photos, videos, documents | No |
| `node_modules/`, `package.json` | Only used by the content manager (image/video optimisation) | No |
| `dist/` | Generated hosting package (recreated each time) | This IS what you upload |

## Developer notes

- Requires Node.js (any recent version) for the content manager and tools; the website itself runs without it.
- `npm run manager` / `npm run check` / `npm run dist` mirror the menu options.
- If `node_modules` is ever deleted, run `npm install` once to restore the content manager's image/video optimiser.
- Local dev server alternative: `npx serve -p 3000 .` (`serve.json` disables clean-URLs so `article.html?id=…` works).
- Content data format and recipes: see `CONTENT-GUIDE.md`.
- Always save files as **UTF-8** — other encodings corrupt the Sanskrit text and symbols (this has happened before).

