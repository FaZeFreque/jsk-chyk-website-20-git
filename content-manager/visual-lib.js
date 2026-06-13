'use strict';
/* Visual Editor server helpers.
   - annotateHtml(): serve-time-only transform that tags text nodes, images
     and sections with stable ids matching the /api/page extraction order.
     The files on disk are never annotated; dist/ stays clean.
   - applyPageOps(): extended page writer (text, img src/alt/style,
     section style/label) using the same tokenization, so ids always agree. */

const fs = require('fs');
const path = require('path');

const TOKEN_RE = /<!--[^]*?-->|<[^>]+>|[^<]+/g;
const IMG_RE = /<img\b[^>]*\bsrc=(['"])(.*?)\1[^>]*>/gi;
const SECTION_RE = /<(header|section|footer)\b[^>]*>/gi;

function escapeText(value) {
  return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function escapeAttr(value) {
  return String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

/* Annotate a page for editing inside the Visual Editor iframe. */
function annotateHtml(html) {
  let out = '';
  let last = 0;
  let skip = false;
  let inTitle = false;
  let textIndex = 0;
  let token;
  TOKEN_RE.lastIndex = 0;
  while ((token = TOKEN_RE.exec(html))) {
    const value = token[0];
    if (value.startsWith('<')) {
      if (/^<(script|style)\b/i.test(value)) skip = true;
      if (/^<\/(script|style)>/i.test(value)) skip = false;
      if (/^<title\b/i.test(value)) inTitle = true;
      if (/^<\/title>/i.test(value)) inTitle = false;
      continue;
    }
    if (skip || value.startsWith('<!--')) continue;
    const trimmed = value.trim();
    if (!trimmed || /^[\s\W]*$/.test(trimmed)) continue;
    const id = textIndex++;
    if (inTitle) continue; // count it (id alignment) but never mark inside <title>
    const offset = token.index + value.indexOf(trimmed);
    out += html.slice(last, offset) + `<!--ve-t:${id}-->`;
    last = offset;
  }
  out += html.slice(last);

  // Tag every <img> with its extraction index
  let imageIndex = 0;
  out = out.replace(IMG_RE, tag => tag.replace(/^<img\b/i, m => `${m} data-ve-img="${imageIndex++}"`));

  // Tag sections (same order as the section ops below)
  let sectionIndex = 0;
  out = out.replace(SECTION_RE, tag =>
    tag.replace(/^<(header|section|footer)\b/i, m => `${m} data-ve-sec="${sectionIndex++}"`));

  // Staged-data overlay must load before any page script (first in <head>).
  // The real homepage intro/reveal and all animations run exactly as on the
  // live site — edit mode does not skip or alter them.
  const early = '<script src="/visual-editor/staged.js"></script>';
  out = out.replace(/<head([^>]*)>/i, m => m + early);
  // Editor agent + overlay styles (overlays are pointer-events:none)
  const inject = '\n<link rel="stylesheet" href="/visual-editor/inject.css">\n<script src="/visual-editor/inject.js" defer></script>\n';
  return out.includes('</body>') ? out.replace('</body>', inject + '</body>') : out + inject;
}

/* Replace or insert an attribute inside a single open tag string. */
function setAttrInTag(tag, name, value) {
  const re = new RegExp(`(\\s${name}=)(['"])(.*?)\\2`, 'i');
  if (value === null) return tag.replace(re, ''); // remove attribute
  if (re.test(tag)) return tag.replace(re, (m, pre, q) => `${pre}${q}${escapeAttr(value)}${q}`);
  const insert = ` ${name}="${escapeAttr(value)}"`;
  return tag.replace(/^<([a-zA-Z0-9-]+)/, (m) => m + insert);
}

/* Apply edit operations to an HTML page on disk.
   ops: [{ id, value }] where id is one of
     text-N      -> text node content (escaped)
     image-N     -> img src
     imgalt-N    -> img alt attribute
     imgstyle-N  -> img style attribute ('' removes)
     secstyle-N  -> section style attribute ('' removes)
     seclabel-N  -> section data-editor-label
   Returns { changed } or throws on any invalid op (nothing written). */
function applyPageOps(relative, ops, rootDir, backup) {
  const file = path.join(rootDir, relative);
  const html = fs.readFileSync(file, 'utf8');
  const wanted = new Map(ops.map(op => [String(op.id), op.value]));
  const splices = [];
  const used = new Set();

  // text nodes
  let skip = false;
  let textIndex = 0;
  let token;
  TOKEN_RE.lastIndex = 0;
  while ((token = TOKEN_RE.exec(html))) {
    const value = token[0];
    if (value.startsWith('<')) {
      if (/^<(script|style)\b/i.test(value)) skip = true;
      if (/^<\/(script|style)>/i.test(value)) skip = false;
      continue;
    }
    if (skip || value.startsWith('<!--')) continue;
    const trimmed = value.trim();
    if (!trimmed || /^[\s\W]*$/.test(trimmed)) continue;
    const id = `text-${textIndex++}`;
    if (!wanted.has(id)) continue;
    const start = token.index + value.indexOf(trimmed);
    splices.push({ start, end: start + trimmed.length, value: escapeText(wanted.get(id)) });
    used.add(id);
  }

  // images: src / alt / style
  let imageIndex = 0;
  let image;
  IMG_RE.lastIndex = 0;
  while ((image = IMG_RE.exec(html))) {
    const n = imageIndex++;
    const srcId = `image-${n}`;
    if (wanted.has(srcId)) {
      const offset = image[0].indexOf(image[2]);
      splices.push({ start: image.index + offset, end: image.index + offset + image[2].length, value: escapeAttr(wanted.get(srcId)) });
      used.add(srcId);
    }
    let tag = null;
    for (const [attr, opId] of [['alt', `imgalt-${n}`], ['style', `imgstyle-${n}`]]) {
      if (!wanted.has(opId)) continue;
      tag = tag || image[0];
      const raw = wanted.get(opId);
      tag = setAttrInTag(tag, attr, raw === '' && attr === 'style' ? null : raw);
      used.add(opId);
    }
    if (tag !== null) splices.push({ start: image.index, end: image.index + image[0].length, value: tag, wholeTag: true });
  }

  // sections: style / editor label
  let sectionIndex = 0;
  let section;
  SECTION_RE.lastIndex = 0;
  while ((section = SECTION_RE.exec(html))) {
    const n = sectionIndex++;
    let tag = null;
    for (const [attr, opId] of [['style', `secstyle-${n}`], ['data-editor-label', `seclabel-${n}`]]) {
      if (!wanted.has(opId)) continue;
      tag = tag || section[0];
      const raw = wanted.get(opId);
      tag = setAttrInTag(tag, attr, raw === '' ? null : raw);
      used.add(opId);
    }
    if (tag !== null) splices.push({ start: section.index, end: section.index + section[0].length, value: tag, wholeTag: true });
  }

  const unknown = [...wanted.keys()].filter(id => !used.has(id));
  if (unknown.length) throw new Error('Some edits no longer match the page (it changed on disk). Reload the editor. Unmatched: ' + unknown.slice(0, 5).join(', '));

  // whole-tag splices must not overlap inner src splices for the same tag —
  // when both exist, the whole-tag splice already used the ORIGINAL tag text,
  // so drop inner splices contained inside any whole-tag range after re-applying src into the tag value.
  const wholeTags = splices.filter(s => s.wholeTag);
  const finalSplices = splices.filter(s => {
    if (s.wholeTag) return true;
    const host = wholeTags.find(w => s.start >= w.start && s.end <= w.end);
    if (!host) return true;
    // merge: apply the inner change into the host tag value
    const innerStart = s.start - host.start;
    const innerEnd = s.end - host.start;
    // host.value may differ in length before innerStart only if attrs were
    // inserted at the front; recompute via original substring search
    const original = html.slice(host.start, host.end);
    const target = original.slice(innerStart, innerEnd);
    host.value = host.value.replace(target, s.value);
    return false;
  });

  let next = html;
  finalSplices.sort((a, b) => b.start - a.start).forEach(s => { next = next.slice(0, s.start) + s.value + next.slice(s.end); });
  if (next === html) return { changed: 0 };
  backup(relative);
  fs.writeFileSync(file, next, 'utf8');
  return { changed: finalSplices.length };
}

module.exports = { annotateHtml, applyPageOps };
