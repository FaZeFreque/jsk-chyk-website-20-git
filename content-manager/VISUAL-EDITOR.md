# CHYK Visual Editor (Developer Mode)

A Canva/Webflow-style visual layer on top of the existing local Content Manager.
It edits the **real** website files — nothing is rebuilt or replaced.

## Launch

Double-click **`OPEN CHYK VISUAL EDITOR.cmd`** (or option 2 in
`OPEN CHYK CONTENT MANAGER.cmd`). It opens `http://127.0.0.1:4173/visual-editor/`.

**Password:** the editor opens a lock screen first. The password is **`jaigurudev`**.
This keeps anyone on the same computer/network from wandering in; it is a local
gate, not internet security. (To change it, set the `CHYK_VE_PASSWORD` environment
variable before starting, or edit `VE_PASSWORD` in `content-manager/server.js`.)
The unlock lasts until the browser is fully closed. Saving, packaging and the
edit preview all require this unlock — an un-unlocked browser cannot reach them.

Local-only. No internet, no database, no cloud.

## Using it

- **Top bar** — page picker · Desktop/Tablet/Mobile widths · Undo/Redo ·
  Preview (open page without editor) · Save Page · Save All · Check · Package · Exit.
- **Left** — Search, Layers tree (sections → collections → cards/elements), History.
- **Centre** — the live website. Hover shows a label; click selects; double-click text edits in place.
- **Right** — properties for the selection (text, image, card fields, or section).

### What you can edit
- **Text** (titles, paragraphs, buttons, labels, quotes): click → type inline, or edit in the panel.
  Static page text is written back into the HTML; nothing arbitrary is invented.
- **Images**: replace (auto-optimised to WebP under `assets/uploads/<page>/`), alt text,
  fit (cover/contain), horizontal/vertical position, zoom, and **focal point** (click the image).
- **Repeatable cards** (activities, events, talks, articles, social, art, leaders, alumni,
  centres, testimonials, milestones): edit fields, reorder, duplicate, delete, toggle
  featured/published. These write to the real `data/*.js` files via the Content Manager API.
- **Sections**: rename editor label / hide / show — only when **Advanced developer mode**
  (bottom-right) is on. Structural CSS and GSAP animations stay locked.

### Saving & safety
- Every save **backs up** affected files first (`content-manager/backups/<timestamp>/`).
- **History** panel lists each change with timestamp; "Saved versions…" restores any backup.
- Unsaved edits survive an accidental refresh (kept in the browser tab's session storage).
- Page text and `data/*.js` edits are validated; a failing collection save aborts (no partial write).

### Keyboard
Ctrl+Z undo · Ctrl+Y / Ctrl+Shift+Z redo · Ctrl+S save page · Ctrl+P preview ·
Delete removes the selected card · Esc deselects / closes.

## Publishing
Use the **Package** button (or `MAKE HOSTING PACKAGE.cmd`). It saves pending changes,
runs validation, then builds `dist/`. The editor, content-manager, backups, tools,
source files and all `.cmd` launchers are **excluded** from `dist/`.

## How it works (for developers)
- Pages are served normally. With `?ve=1` the server returns an **annotated** copy
  (text-node markers, `data-ve-img`, `data-ve-sec`) — files on disk are never annotated.
- `content-manager/visual/inject.js` runs only inside the editor iframe: selection,
  inline editing, focal picking, layer tree, postMessage to the shell.
- `content-manager/visual/registry.js` maps each page's card grids to a Content Manager collection.
- `staged.js` applies unsaved collection edits over `CHYK_DATA` before renderers run, so the
  preview matches what a save would produce.
- Server endpoints added: `PUT /api/page-ops` (text/image/section ops, all-or-nothing) and
  `POST /api/run-tool` (check / dist). Existing collection, upload, backup and restore
  endpoints are reused unchanged.
