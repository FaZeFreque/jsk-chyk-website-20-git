'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { execFile } = require('child_process');
const { promisify } = require('util');
const { URL } = require('url');

const execFileAsync = promisify(execFile);
let FFMPEG = null;
try { FFMPEG = require('ffmpeg-static'); } catch (_) { /* uploads still work without optimization */ }
const visual = require('./visual-lib');

const ROOT = path.resolve(__dirname, '..');
const PUBLIC = path.join(__dirname, 'public');
const VISUAL = path.join(__dirname, 'visual');
const BACKUPS = path.join(__dirname, 'backups');
const PORT = Number(process.env.CHYK_CONTENT_PORT || 4173);

// Visual Editor entry password (local-only gate, not internet security).
const VE_PASSWORD = process.env.CHYK_VE_PASSWORD || 'jaigurudev';
const VE_TOKEN = require('crypto').randomBytes(16).toString('hex');
function veAuthed(req) {
  const cookie = (req.headers.cookie || '').split(';').map(s => s.trim()).find(s => s.startsWith('ve_auth='));
  return !!cookie && cookie.slice('ve_auth='.length) === VE_TOKEN;
}

const collections = {
  activities: { label: 'Activities', file: 'data/activities.js', path: ['activities'], preview: 'activities.html' },
  events: { label: 'Events', file: 'data/events.js', path: ['events'], preview: 'events.html' },
  talks: { label: 'Talks & Discourses', file: 'data/talks.js', path: ['talks'], preview: 'talks-and-articles.html' },
  articles: { label: 'Article Cards', file: 'data/articles.js', path: ['articles'], preview: 'magazine.html' },
  udghoshArticles: { label: 'Chinmaya Udghosh Articles (10 slots)', file: 'data/articles.js', path: ['udghoshArticles'], preview: 'magazine.html#chinmaya-udghosh' },
  articleContent: { label: 'Full Article Bodies', file: 'data/article-content.js', path: ['articleContent'], adapter: 'articleContent', preview: 'magazine.html' },
  instagram: { label: 'Instagram Posts & Reels', file: 'data/social.js', path: ['social', 'instagram'], preview: 'social.html' },
  youtube: { label: 'YouTube Videos', file: 'data/social.js', path: ['social', 'youtube'], preview: 'social.html' },
  art: { label: 'Art Gallery', file: 'data/art.js', path: ['art'], preview: 'art.html' },
  udghosh: { label: 'Chinmaya Udghosh', file: 'data/magazine.js', path: ['magazine', 'udghosh'], preview: 'magazine.html#udghosh' },
  udghoshPosters: { label: 'Chinmaya Udghosh Posters', file: 'data/magazine.js', path: ['magazine', 'posters'], preview: 'magazine.html#chinmaya-udghosh' },
  bookReviews: { label: 'Book Reviews', file: 'data/magazine.js', path: ['magazine', 'bookReviews'], preview: 'magazine.html' },
  shortReads: { label: 'Short Reads', file: 'data/magazine.js', path: ['magazine', 'shortReads'], preview: 'magazine.html' },
  centres: { label: 'CHYK Centres', file: 'data/centres.js', path: ['centres'], preview: 'wings.html' },
  leaders: { label: 'Leaders', file: 'data/leadersData.js', path: ['leaders'], preview: 'leaders.html' },
  alumni: { label: 'Alumni', file: 'data/alumniData.js', path: ['alumni'], preview: 'alumni.html' },
  homepageGoals: { label: 'Homepage - CHYK Goals', file: 'data/homepage.js', path: ['homepage', 'goals'], preview: 'index.html' },
  homepageMilestones: { label: 'Homepage - Milestones', file: 'data/homepage.js', path: ['homepage', 'milestones'], preview: 'index.html' },
  homepageAscentPrompts: { label: 'Homepage - Gurudev Search Prompts', file: 'data/homepage.js', path: ['homepage', 'ascentPrompts'], preview: 'index.html' },
  stats: { label: 'Website Statistics', file: 'data/stats.js', path: ['stats'], preview: 'index.html' },
  testimonials: { label: 'About - Testimonials', file: 'data/testimonials.js', path: ['testimonials'], preview: 'about.html' }
};

function send(res, status, body, type = 'application/json; charset=utf-8') {
  res.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'no-store' });
  res.end(type.startsWith('application/json') ? JSON.stringify(body) : body);
}

function safeRelative(relative) {
  const full = path.resolve(ROOT, String(relative || '').replace(/^[/\\]+/, ''));
  if (full !== ROOT && !full.startsWith(ROOT + path.sep)) throw new Error('Path is outside the website folder.');
  return full;
}

function readJsonBody(req, limit = 200 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', chunk => {
      raw += chunk;
      if (Buffer.byteLength(raw) > limit) reject(new Error('Request is too large.'));
    });
    req.on('end', () => {
      try { resolve(raw ? JSON.parse(raw) : {}); } catch (_) { reject(new Error('Invalid JSON request.')); }
    });
    req.on('error', reject);
  });
}

function timestamp() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

function backupFile(relative) {
  const source = safeRelative(relative);
  if (!fs.existsSync(source)) return;
  const destination = path.join(BACKUPS, timestamp(), relative);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(source, destination);
}

async function optimizeUpload(input, extension, outputBase) {
  const imageTypes = new Set(['.png', '.jpg', '.jpeg', '.webp']);
  const videoTypes = new Set(['.mp4', '.mov', '.m4v', '.webm']);
  if (!FFMPEG || (!imageTypes.has(extension) && !videoTypes.has(extension))) {
    return { target: `${outputBase}${extension}`, optimized: false };
  }

  if (imageTypes.has(extension)) {
    const target = `${outputBase}.webp`;
    await execFileAsync(FFMPEG, [
      '-y', '-i', input,
      '-vf', "scale='min(1920,iw)':'min(1920,ih)':force_original_aspect_ratio=decrease",
      '-frames:v', '1', '-c:v', 'libwebp', '-quality', '78', '-compression_level', '5',
      target
    ], { windowsHide: true, maxBuffer: 4 * 1024 * 1024 });
    return { target, optimized: true };
  }

  const target = `${outputBase}.mp4`;
  await execFileAsync(FFMPEG, [
    '-y', '-i', input,
    '-vf', "scale='min(1280,iw)':'min(1280,ih)':force_original_aspect_ratio=decrease",
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '27', '-pix_fmt', 'yuv420p',
    '-c:a', 'aac', '-b:a', '96k', '-movflags', '+faststart',
    target
  ], { windowsHide: true, maxBuffer: 4 * 1024 * 1024 });
  return { target, optimized: true };
}

function loadDataFile(relative) {
  const sandbox = { window: {} };
  sandbox.window.window = sandbox.window;
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(safeRelative(relative), 'utf8'), sandbox, { filename: relative, timeout: 1000 });
  return JSON.parse(JSON.stringify(sandbox.window.CHYK_DATA || {}));
}

function getAt(value, parts) {
  return parts.reduce((current, key) => current && current[key], value);
}

function setAt(value, parts, next) {
  let current = value;
  parts.slice(0, -1).forEach(key => { current[key] = current[key] || {}; current = current[key]; });
  current[parts[parts.length - 1]] = next;
}

function serializeData(data, label) {
  return `/* Managed locally by CHYK Content Manager: ${label} */\nwindow.CHYK_DATA = window.CHYK_DATA || {};\n${Object.entries(data).map(([key, value]) => `window.CHYK_DATA.${key} = ${JSON.stringify(value, null, 2)};`).join('\n')}\n`;
}

function inferFields(items) {
  const fields = [];
  const seen = new Set();
  items.forEach(item => Object.keys(item || {}).forEach(key => {
    if (seen.has(key)) return;
    seen.add(key);
    const sample = items.find(entry => entry && entry[key] !== undefined)?.[key];
    let type = typeof sample;
    if (Array.isArray(sample)) type = key === 'blocks' ? 'blocks' : 'list';
    if (key.toLowerCase().includes('image')) type = 'image';
    if (/imageFit$/i.test(key)) type = 'imageFit';
    if (/imagePosition$/i.test(key)) type = 'imagePosition';
    if (key === 'link' || key.toLowerCase().endsWith('link')) type = 'url';
    if (typeof sample === 'string' && (sample.length > 120 || /desc|bio|quote|caption|content/i.test(key))) type = 'textarea';
    fields.push({ key, label: key.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase()), type });
  }));
  return fields;
}

function normalizeCollection(config, raw) {
  if (config.adapter === 'articleContent') {
    return Object.entries(raw || {}).map(([id, blocks]) => ({ id, blocks }));
  }
  return Array.isArray(raw) ? raw : [];
}

function denormalizeCollection(config, items) {
  if (config.adapter === 'articleContent') {
    return Object.fromEntries(items.map(item => [item.id, item.blocks || []]));
  }
  return items;
}

function validateItems(items) {
  const errors = [];
  const warnings = [];
  const ids = new Set();
  items.forEach((item, index) => {
    if ('id' in item) {
      if (!String(item.id || '').trim()) errors.push(`Item ${index + 1} needs an id.`);
      else if (ids.has(item.id)) errors.push(`Duplicate id: ${item.id}`);
      ids.add(item.id);
    }
    Object.entries(item).forEach(([key, value]) => {
      if (/image/i.test(key) && typeof value === 'string' && value && !/^https?:/i.test(value) && !fs.existsSync(safeRelative(value))) {
        warnings.push(`${item.title || item.name || item.id || `Item ${index + 1}`}: missing image ${value}`);
      }
    });
  });
  return { errors, warnings };
}

function htmlPages() {
  return fs.readdirSync(ROOT).filter(file => file.endsWith('.html')).sort();
}

function humanizeSection(value, fallback) {
  const cleaned = String(value || '').replace(/^(m-|home-)/, '').replace(/[-_]+/g, ' ').trim();
  if (!cleaned) return fallback;
  return cleaned.replace(/\b\w/g, letter => letter.toUpperCase());
}

function pageSectionMarkers(html) {
  const markers = [{ start: 0, label: 'Page Setup' }];
  const sectionRe = /<(header|section|footer)\b([^>]*)>/gi;
  let match;
  let count = 0;
  while ((match = sectionRe.exec(html))) {
    count += 1;
    const attrs = match[2] || '';
    const editorLabel = attrs.match(/data-editor-label=(['"])(.*?)\1/i)?.[2];
    const ariaLabel = attrs.match(/aria-label=(['"])(.*?)\1/i)?.[2];
    const id = attrs.match(/\bid=(['"])(.*?)\1/i)?.[2];
    const className = attrs.match(/\bclass=(['"])(.*?)\1/i)?.[2]?.split(/\s+/).find(name => !/^(section|active|visible)$/i.test(name));
    const fallback = match[1].toLowerCase() === 'header' ? 'Header & Navigation' : match[1].toLowerCase() === 'footer' ? 'Footer' : `Section ${count}`;
    markers.push({ start: match.index, label: humanizeSection(editorLabel || ariaLabel || id || className, fallback) });
  }
  return markers;
}

function sectionAt(markers, position) {
  let label = markers[0].label;
  for (const marker of markers) {
    if (marker.start > position) break;
    label = marker.label;
  }
  return label;
}

function extractPageFields(relative) {
  const html = fs.readFileSync(safeRelative(relative), 'utf8');
  const fields = [];
  const sections = pageSectionMarkers(html);
  let skip = false;
  let textIndex = 0;
  const tokenRe = /<!--[^]*?-->|<[^>]+>|[^<]+/g;
  let token;
  while ((token = tokenRe.exec(html))) {
    const value = token[0];
    if (/^<(script|style)\b/i.test(value)) skip = true;
    if (/^<\/(script|style)>/i.test(value)) { skip = false; continue; }
    if (skip || value.startsWith('<')) continue;
    const trimmed = value.trim();
    if (!trimmed || /^[\s\W]*$/.test(trimmed)) continue;
    const start = token.index + value.indexOf(trimmed);
    fields.push({ id: `text-${textIndex++}`, type: 'text', value: trimmed, section: sectionAt(sections, start), start, end: start + trimmed.length });
  }
  let imageIndex = 0;
  const imageRe = /<img\b[^>]*\bsrc=(['"])(.*?)\1[^>]*>/gi;
  let image;
  while ((image = imageRe.exec(html))) {
    const sourceOffset = image[0].indexOf(image[2]);
    const start = image.index + sourceOffset;
    fields.push({ id: `image-${imageIndex++}`, type: 'image', value: image[2], section: sectionAt(sections, start), start, end: start + image[2].length });
  }
  return { html, fields: fields.sort((a, b) => a.start - b.start).map(({ start, end, ...field }) => field) };
}

function updatePageFields(relative, updates) {
  const extracted = extractPageFields(relative);
  const current = extracted.fields;
  const requested = new Map(updates.map(item => [item.id, String(item.value ?? '')]));
  const html = extracted.html;
  const positions = [];
  let skip = false;
  let textIndex = 0;
  const tokenRe = /<!--[^]*?-->|<[^>]+>|[^<]+/g;
  let token;
  while ((token = tokenRe.exec(html))) {
    const value = token[0];
    if (/^<(script|style)\b/i.test(value)) skip = true;
    if (/^<\/(script|style)>/i.test(value)) { skip = false; continue; }
    if (skip || value.startsWith('<')) continue;
    const trimmed = value.trim();
    if (!trimmed || /^[\s\W]*$/.test(trimmed)) continue;
    const id = `text-${textIndex++}`;
    if (requested.has(id)) positions.push({ start: token.index + value.indexOf(trimmed), end: token.index + value.indexOf(trimmed) + trimmed.length, value: requested.get(id) });
  }
  let imageIndex = 0;
  const imageRe = /<img\b[^>]*\bsrc=(['"])(.*?)\1[^>]*>/gi;
  let image;
  while ((image = imageRe.exec(html))) {
    const id = `image-${imageIndex++}`;
    if (requested.has(id)) {
      const offset = image[0].indexOf(image[2]);
      positions.push({ start: image.index + offset, end: image.index + offset + image[2].length, value: requested.get(id) });
    }
  }
  let next = html;
  positions.sort((a, b) => b.start - a.start).forEach(change => { next = next.slice(0, change.start) + change.value + next.slice(change.end); });
  backupFile(relative);
  fs.writeFileSync(safeRelative(relative), next, 'utf8');
}

const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.mp4': 'video/mp4', '.ttf': 'font/ttf' };

function serveFile(res, file) {
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) return send(res, 404, { error: 'File not found.' });
  send(res, 200, fs.readFileSync(file), mime[path.extname(file).toLowerCase()] || 'application/octet-stream');
}

async function api(req, res, url) {
  if (req.method === 'POST' && url.pathname === '/api/visual-login') {
    const body = await readJsonBody(req);
    if (String(body.password || '') === VE_PASSWORD) {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'Set-Cookie': `ve_auth=${VE_TOKEN}; Path=/; SameSite=Strict; HttpOnly` });
      return res.end(JSON.stringify({ ok: true }));
    }
    return send(res, 401, { error: 'Incorrect password.' });
  }
  if (req.headers['x-chyk-visual-editor'] === '1' && !veAuthed(req)) {
    return send(res, 403, { error: 'Visual Editor session expired. Reload and enter the password again.' });
  }
  if (req.method === 'GET' && url.pathname === '/api/bootstrap') {
    return send(res, 200, { collections: Object.entries(collections).map(([id, item]) => ({ id, ...item })), pages: htmlPages() });
  }
  if (req.method === 'GET' && url.pathname.startsWith('/api/collection/')) {
    const id = decodeURIComponent(url.pathname.split('/').pop());
    const config = collections[id];
    if (!config) return send(res, 404, { error: 'Unknown collection.' });
    const all = loadDataFile(config.file);
    const items = normalizeCollection(config, getAt(all, config.path));
    return send(res, 200, { id, label: config.label, preview: config.preview, items, fields: inferFields(items), validation: validateItems(items) });
  }
  if (req.method === 'PUT' && url.pathname.startsWith('/api/collection/')) {
    const id = decodeURIComponent(url.pathname.split('/').pop());
    const config = collections[id];
    if (!config) return send(res, 404, { error: 'Unknown collection.' });
    const body = await readJsonBody(req);
    if (!Array.isArray(body.items)) return send(res, 400, { error: 'Items must be an array.' });
    const validation = validateItems(body.items);
    if (validation.errors.length) return send(res, 400, { error: validation.errors.join(' '), validation });
    const data = loadDataFile(config.file);
    setAt(data, config.path, denormalizeCollection(config, body.items));
    backupFile(config.file);
    fs.writeFileSync(safeRelative(config.file), serializeData(data, config.label), 'utf8');
    return send(res, 200, { ok: true, validation });
  }
  if (req.method === 'GET' && url.pathname === '/api/page') {
    const file = url.searchParams.get('file');
    if (!htmlPages().includes(file)) return send(res, 400, { error: 'Unknown page.' });
    const result = extractPageFields(file);
    return send(res, 200, { file, preview: file, fields: result.fields });
  }
  if (req.method === 'PUT' && url.pathname === '/api/page') {
    const body = await readJsonBody(req);
    if (!htmlPages().includes(body.file) || !Array.isArray(body.fields)) return send(res, 400, { error: 'Invalid page update.' });
    updatePageFields(body.file, body.fields);
    return send(res, 200, { ok: true });
  }
  if (req.method === 'POST' && url.pathname === '/api/upload') {
    const body = await readJsonBody(req);
    const extension = path.extname(body.name || '').toLowerCase();
    if (!['.png', '.jpg', '.jpeg', '.webp', '.svg', '.gif', '.pdf', '.mp4', '.mov', '.m4v', '.webm'].includes(extension)) return send(res, 400, { error: 'Unsupported file type.' });
    const folder = String(body.folder || 'general').toLowerCase().replace(/[^a-z0-9-]/g, '-') || 'general';
    const base = path.basename(body.name, extension).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'upload';
    const outputBase = `assets/uploads/${folder}/${Date.now()}-${base}`;
    const match = String(body.data || '').match(/^data:[^;]+;base64,(.+)$/);
    if (!match) return send(res, 400, { error: 'Invalid upload data.' });
    const tempRelative = `${outputBase}.upload${extension}`;
    const tempTarget = safeRelative(tempRelative);
    fs.mkdirSync(path.dirname(tempTarget), { recursive: true });
    fs.writeFileSync(tempTarget, Buffer.from(match[1], 'base64'));

    let result;
    try {
      result = await optimizeUpload(tempTarget, extension, safeRelative(outputBase));
      if (!result.optimized) fs.renameSync(tempTarget, result.target);
      else fs.unlinkSync(tempTarget);
    } catch (error) {
      const fallback = safeRelative(`${outputBase}${extension}`);
      fs.renameSync(tempTarget, fallback);
      result = { target: fallback, optimized: false };
    }

    const relative = path.relative(ROOT, result.target).replace(/\\/g, '/');
    return send(res, 200, { ok: true, path: relative, optimized: result.optimized });
  }
  if (req.method === 'PUT' && url.pathname === '/api/page-ops') {
    if (!veAuthed(req)) return send(res, 403, { error: 'Visual Editor is locked. Reload and enter the password.' });
    // Visual Editor save: extended page operations (text, image src/alt/style,
    // section style/label). All-or-nothing: invalid ops abort before writing.
    const body = await readJsonBody(req);
    if (!htmlPages().includes(body.file) || !Array.isArray(body.ops)) return send(res, 400, { error: 'Invalid page update.' });
    const result = visual.applyPageOps(body.file, body.ops, ROOT, backupFile);
    return send(res, 200, { ok: true, changed: result.changed });
  }
  if (req.method === 'POST' && url.pathname === '/api/run-tool') {
    if (!veAuthed(req)) return send(res, 403, { error: 'Visual Editor is locked. Reload and enter the password.' });
    const body = await readJsonBody(req);
    const tools = { check: 'tools/check-content.js', dist: 'tools/make-dist.js' };
    if (!tools[body.tool]) return send(res, 400, { error: 'Unknown tool.' });
    try {
      const { stdout } = await execFileAsync(process.execPath, [safeRelative(tools[body.tool])], { cwd: ROOT, windowsHide: true, maxBuffer: 8 * 1024 * 1024 });
      return send(res, 200, { ok: true, output: stdout });
    } catch (error) {
      return send(res, 200, { ok: false, output: String(error.stdout || '') + String(error.stderr || error.message) });
    }
  }
  if (req.method === 'GET' && url.pathname === '/api/backups') {
    const items = fs.existsSync(BACKUPS) ? fs.readdirSync(BACKUPS).sort().reverse().slice(0, 25).map(name => {
      const folder = path.join(BACKUPS, name);
      const files = [];
      function walk(current) {
        fs.readdirSync(current, { withFileTypes: true }).forEach(entry => {
          const full = path.join(current, entry.name);
          if (entry.isDirectory()) walk(full);
          else files.push(path.relative(folder, full).replace(/\\/g, '/'));
        });
      }
      walk(folder);
      return { name, files };
    }) : [];
    return send(res, 200, { items });
  }
  if (req.method === 'POST' && url.pathname === '/api/restore') {
    const body = await readJsonBody(req);
    if (!/^[0-9TZ-]+$/.test(body.backup || '')) return send(res, 400, { error: 'Invalid backup.' });
    const target = safeRelative(body.file);
    const source = path.resolve(BACKUPS, body.backup, body.file);
    const backupRoot = path.resolve(BACKUPS, body.backup);
    if (!source.startsWith(backupRoot + path.sep) || !fs.existsSync(source)) return send(res, 404, { error: 'Backup file not found.' });
    backupFile(body.file);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(source, target);
    return send(res, 200, { ok: true });
  }
  return send(res, 404, { error: 'Unknown API route.' });
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    if (url.pathname.startsWith('/api/')) return await api(req, res, url);
    if (url.pathname === '/' || url.pathname === '/content-manager' || url.pathname === '/content-manager/') return serveFile(res, path.join(PUBLIC, 'index.html'));
    if (url.pathname.startsWith('/content-manager/')) return serveFile(res, path.join(PUBLIC, url.pathname.replace('/content-manager/', '')));
    // Visual Editor entry — password gated. Unauthenticated visitors get the login page.
    if (url.pathname === '/visual-editor' || url.pathname === '/visual-editor/') {
      if (url.searchParams.get('fresh') === '1') {
        res.writeHead(302, {
          'Location': '/visual-editor/',
          'Cache-Control': 'no-store',
          'Set-Cookie': 've_auth=; Path=/; Max-Age=0; SameSite=Strict; HttpOnly'
        });
        return res.end();
      }
      return serveFile(res, path.join(VISUAL, veAuthed(req) ? 'index.html' : 'login.html'));
    }
    if (url.pathname.startsWith('/visual-editor/')) {
      const file = url.pathname.replace('/visual-editor/', '');
      if (!veAuthed(req) && file !== 'login.html' && file !== 'login.css') return serveFile(res, path.join(VISUAL, 'login.html'));
      return serveFile(res, path.join(VISUAL, file));
    }
    const relative = decodeURIComponent(url.pathname).replace(/^\//, '') || 'index.html';
    // Editing mode: annotate real pages on the fly (files on disk untouched).
    // Requires the Visual Editor cookie, so annotations never reach a casual visitor.
    if (url.searchParams.get('ve') === '1' && veAuthed(req) && relative.endsWith('.html') && htmlPages().includes(relative)) {
      return send(res, 200, visual.annotateHtml(fs.readFileSync(safeRelative(relative), 'utf8')), 'text/html; charset=utf-8');
    }
    return serveFile(res, safeRelative(relative));
  } catch (error) {
    console.error(error);
    return send(res, 500, { error: error.message || 'Unexpected server error.' });
  }
});

fs.mkdirSync(BACKUPS, { recursive: true });
server.listen(PORT, '127.0.0.1', () => {
  console.log(`CHYK Content Manager: http://127.0.0.1:${PORT}/content-manager/`);
});
