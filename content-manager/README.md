# CHYK Content Manager

A private local dashboard for updating the CHYK website without manually editing code.

## Open it

Double-click **`OPEN CHYK CONTENT MANAGER.cmd`** in the main website folder.

The dashboard opens at:

`http://127.0.0.1:4173/content-manager/`

It only runs on this computer. It is not a public admin page and is not uploaded with the website unless someone deliberately uploads the `content-manager` folder.

## What you can update

### Collections

Use this for repeatable content:

- Activities
- Events
- Talks
- Article cards and complete article bodies
- Instagram posts and reels
- YouTube videos
- Art gallery
- Chinmaya Udghosh issues
- Book reviews and short reads
- Wings, leaders and alumni
- Statistics and testimonials

You can add, duplicate, delete, reorder and search items. Fields are generated from the website's real data structure.

### Page Copy & Images

Use this for fixed content written directly into a page:

- Page headings
- Paragraphs
- Button labels
- Small text boxes
- Fixed images and logos

Choose the page, search for the text, edit it, and save.

Choose **Homepage** in the website-page dropdown, then choose a homepage section such as Hero, Journey, Path, People or Footer. The manager shows only that section's text and images. Homepage statistics and testimonials remain available as structured Collections so repeating cards can be managed safely.

### Uploading media

Select **Upload** beside an image field. The manager:

1. Cleans the filename.
2. Saves the actual file under `assets/uploads/<section>/`.
3. Inserts the correct relative path.

New JPG, PNG and WebP uploads are automatically resized and converted to efficient WebP files. New video uploads are resized, compressed to browser-compatible H.264 MP4 and prepared for fast streaming. SVG, GIF and PDF files are preserved as supplied.

Images are not stored inside JSON or JavaScript as base64. Base64 is used only temporarily while transferring the file from the browser to the local server.

### Mobile leader images

Leader entries include separate mobile image controls:

- **Mobile Image Fit / Position** controls mobile cards.
- **Mobile Modal Image Fit / Position** controls the enlarged profile view.
- Use **Show full image** for portrait cutouts or transparent PNGs. Use **Fill area (crop)** for regular photographs.

## Safe update workflow

1. Open the manager.
2. Choose a collection or page.
3. Make the changes.
4. Click **Preview Page** to inspect the current website page.
5. Click **Save Changes**.
6. Hard-refresh the preview with `Ctrl+F5`.
7. Check desktop and mobile widths.
8. Upload/deploy the website folder when ready.

Saving changes only updates local files. It does not automatically change the live website.

## Backups

Before every save, the manager copies the previous version into:

`content-manager/backups/<date-and-time>/`

Do not delete this folder until the update is confirmed.

## Important rules

- Keep every item `id` unique.
- Do not rename an existing id unless you also update links that use it.
- Prefer landscape images around 1600 x 900 for cards.
- Preview before deployment.
- The Content Manager should not be uploaded to public hosting. Exclude `content-manager/` and the launcher `.cmd` file when publishing.

## Technical notes

- Uses only built-in Node.js modules.
- No database, cloud account or paid service is required.
- The website remains normal HTML/CSS/JavaScript and can be hosted anywhere.
- Desktop and mobile use the same content source.
