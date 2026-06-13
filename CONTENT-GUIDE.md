# CHYK Website — Content Update Guide

## Recommended: use the local Content Manager

For normal updates, do not edit the files below manually. Double-click:

**`OPEN CHYK CONTENT MANAGER.cmd`**

The local dashboard provides forms, image uploads, reordering, validation, page previews and automatic backups. See `content-manager/README.md` for the complete non-technical workflow.

The manual file instructions below remain useful for developers and emergency maintenance.

How to add or replace articles, talks, events, activities, images, Instagram/YouTube embeds, and publications **without touching any HTML, CSS, or page logic**.

## The one rule

All content lives in plain JavaScript files inside the **`data/`** folder. Each file fills `window.CHYK_DATA.<something>` with a list of items. The pages read these lists and build the cards, grids, readers, and embeds automatically.

To add content: open the right file in `data/`, copy an existing item (everything between `{ ... },`), paste it, and edit the fields. Keep the commas between items and save the file as plain text.

| To update…                          | Edit this file             | Shown on |
|-------------------------------------|----------------------------|----------|
| Written articles / blog (cards)      | `data/articles.js`         | Publications & Blog, Content Hub, Talks & Articles |
| Full article text (reader)          | `data/article-content.js`  | `article.html` reader |
| Chinmaya Udghosh issues             | `data/magazine.js`         | Publications & Blog → "Chinmaya Udghosh" tab |
| Talks (YouTube videos)              | `data/talks.js`            | Talks & Articles, Content Hub |
| Instagram posts/reels & YouTube embeds | `data/social.js`        | Social page |
| Events & milestones                 | `data/events.js`           | Events page |
| Activities                          | `data/activities.js`       | Activities page |
| Art gallery                         | `data/art.js`              | Art page, Content Hub |
| Wings / ecosystem                   | `data/wings.js`            | Wings page |
| Leaders / Alumni                    | `data/leadersData.js`, `data/alumniData.js` | Leaders, Alumni |
| Home-page stats & testimonials      | `data/stats.js`, `data/testimonials.js` | Home |

## Images

- Put new images in **`assets/`** (general) or **`assets/activities/`** (activity photos). Create similarly named subfolders for new groups, e.g. `assets/events/`, `assets/udghosh/`.
- Use lowercase names with hyphens and **no spaces**: `summer-camp-2026.jpg`.
- Reference them with a relative path from the site root: `image: 'assets/events/summer-camp-2026.jpg'`.
- Landscape ~1600×900 (16:9) works best for cards; keep files under ~400 KB.
- YouTube talk thumbnails need no upload — use `https://i.ytimg.com/vi/<VIDEO_ID>/hqdefault.jpg`.

## Recipes

### Add a written article (Publications & Blog)
1. In `data/articles.js`, copy an item and set:
   - `id` — unique, lowercase-with-hyphens (e.g. `'crossroads-my-new-piece'`)
   - `category` — exactly one of `'Crossroads'`, `'Chinmaya Mission'`, `'Publications'` (this controls which filter tab it appears under)
   - `source` — publication name (e.g. `'Kindle Life'`); `title`, `shortDesc`, `tags`, `readTime`, `author`, `image`
   - `featured: true` to surface it on the Content Hub
2. In `data/article-content.js`, add the full text under the **same id**:
   ```js
   'crossroads-my-new-piece': [
     { "type": "paragraph", "text": "First paragraph..." },
     { "type": "heading",   "text": "A Section Heading" },
     { "type": "paragraph", "text": "More text..." }
   ],
   ```
3. Done — the card, the filters, and the on-site reader (`article.html?id=...`) all pick it up.

### Add a Chinmaya Udghosh issue
In `data/magazine.js`, copy an item in the `udghosh` list. Set `title`, `year`, `theme`, `image` (cover), and put the real URLs in `readLink` / `downloadLink` (e.g. a PDF in `assets/udghosh/` or a hosted link). While a link is `'#'` the page shows "Digital edition coming soon" instead of buttons. Mark exactly one issue `featured: true` to make it the large highlight card.

### Add a talk (video)
In `data/talks.js`, copy an item. Set `link` to the YouTube URL, `image` to the `i.ytimg.com` thumbnail (see above), `speakerType` to one of `'gurudev'`, `'acharya'`, `'member'`, `'guest'` (drives the speaker filter), and `featured: true` to show it on the Content Hub.

### Add an Instagram post/reel or YouTube embed (Social page)
In `data/social.js`:
- **Instagram**: add to the `instagram` list — `type` (`'Reel'` or `'Post'`), `title`, `description`, and the public `link`.
- **YouTube**: add to the `youtube` list — `title`, `description`, `duration`, `videoId` (the part after `watch?v=`), and the full `link`.

### Add an event
In `data/events.js`, copy an item. Key fields: `status` (`'upcoming'`, `'ongoing'`, or `'past'`), `category` (`'conventions'`, `'yatras'`, `'camps'`, …) with a human `categoryLabel`, plus `date`, `dateDisplay`, `month`, `day`, `location`, `image`.

### Add an activity
In `data/activities.js`, copy an item. `category` must match an existing filter (`'study'`, `'workshops'`, `'national'`, …); give it `shortDesc` (card), `longDesc` (detail), and an image in `assets/activities/`.

### Add artwork
In `data/art.js`, copy an item. `type` drives the gallery filter (`'posters'`, `'digital'`, `'photography'`, …); include `title`, `artist`, `year`, `caption`, `image`.

## Checking your changes

1. Open the site locally (double-click `index.html`, or run a tiny server: `python -m http.server` in this folder and visit `http://localhost:8000`).
2. Visit the page you changed; hard-refresh with **Ctrl+F5**.
3. If a page comes up empty, you most likely broke the JavaScript syntax in a data file — check for a missing comma, quote, or bracket. With Node installed, `node --check data/articles.js` pinpoints the line.
4. Text containing an apostrophe inside single quotes must be escaped (`'Gurudev\'s vision'`) — or wrap the whole string in double quotes.

## Things to avoid

- Don't rename files or `id` values that are already linked elsewhere.
- Don't put content directly in HTML pages — always go through `data/`.
- Don't use spaces in new image filenames.
- Don't delete old items to "hide" them; remove `featured: true` or move them down the list instead (deleting is fine when content is truly retired).
