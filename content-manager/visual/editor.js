/* CHYK Visual Editor — shell application. */
(function () {
'use strict';

/* ── state ─────────────────────────────────────────────────── */
var pages = [];
var page = null;                 // current page file name
var frame = el('frame');
var selected = null;             // payload from inject agent
var layersTree = [];
var history = [];                // [{desc, time, section, undo(), redo()}]
var historyIndex = -1;           // points at last applied entry
var collectionsCache = {};       // collection id -> {items, fields, label, original}
var drafts = {};                 // page -> { html: {id: {value, old, desc}}, collections: {cid: items} }
var collectionPages = {};        // collection id -> page that edited it
var advanced = false;
var frameLoadTimer = null;

function el(id) { return document.getElementById(id); }
function api(method, url, body) {
  return fetch(url, { method: method, headers: { 'Content-Type': 'application/json', 'X-CHYK-Visual-Editor': '1' }, body: body ? JSON.stringify(body) : undefined })
    .then(function (r) { return r.json().then(function (j) {
      if (!r.ok) {
        if (r.status === 403) setTimeout(function () { location.reload(); }, 700);
        throw new Error(j.error || ('HTTP ' + r.status));
      }
      return j;
    }); });
}
function toast(msg, isError) {
  var t = el('toast');
  t.textContent = msg;
  t.className = isError ? 'error' : '';
  t.hidden = false;
  clearTimeout(toast.t);
  toast.t = setTimeout(function () { t.hidden = true; }, isError ? 5200 : 2600);
}
function esc(v) { return String(v == null ? '' : v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }
function now() { return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }); }

/* ── drafts (survive accidental refresh) ───────────────────── */
function draftFor(p) { drafts[p] = drafts[p] || { html: {}, collections: {} }; return drafts[p]; }
function persistDrafts() { try { sessionStorage.setItem('ve-drafts', JSON.stringify(drafts)); } catch (_) { } }
function loadDrafts() { try { drafts = JSON.parse(sessionStorage.getItem('ve-drafts') || '{}') || {}; } catch (_) { drafts = {}; } }

function dirtyPages() {
  return Object.keys(drafts).filter(function (p) {
    var d = drafts[p];
    return Object.keys(d.html).length || Object.keys(d.collections).length;
  });
}
function updateDirtyUI() {
  var list = dirtyPages();
  var here = list.indexOf(page) > -1;
  el('btn-save').disabled = !here;
  el('btn-save-all').disabled = !list.length;
  var s = el('status-dirty');
  s.textContent = list.length ? ('Unsaved changes on: ' + list.join(', ')) : 'No unsaved changes';
  s.className = list.length ? 'dirty' : '';
  el('btn-undo').disabled = historyIndex < 0;
  el('btn-redo').disabled = historyIndex >= history.length - 1;
  renderHistory();
  persistDrafts();
}

/* ── iframe protocol ───────────────────────────────────────── */
function sendFrame(msg) { try { frame.contentWindow.postMessage(Object.assign({ veShell: true }, msg), '*'); } catch (_) { } }
window.addEventListener('message', function (e) {
  var msg = e.data || {};
  if (!msg.ve || e.source !== frame.contentWindow || msg.page !== page) return;
  if (msg.type === 'ready') {
    clearTimeout(frameLoadTimer);
    el('frame-loading').style.display = 'none';
    layersTree = msg.payload.layers || [];
    renderLayers();
    // re-apply unsaved draft ops for this page
    var d = draftFor(page);
    Object.keys(d.html).forEach(function (id) { sendFrame({ type: 'apply', op: opFromDraft(id, d.html[id].value) }); });
    if (Object.keys(d.html).length) toast('Restored ' + Object.keys(d.html).length + ' unsaved edit(s) from this session');
  }
  if (msg.type === 'selected') { selected = msg.payload; renderProps(); highlightLayer(); }
  if (msg.type === 'layers') { layersTree = msg.payload; renderLayers(); }
  if (msg.type === 'edit') recordHtmlEdit(msg.payload);
  if (msg.type === 'inline-input') { var box = document.querySelector('#props-body textarea[data-live]'); if (box) box.value = msg.payload.value; }
  if (msg.type === 'shortcut') handleShortcut(msg.payload.key, msg.payload.shift);
  if (msg.type === 'focal-picked') applyFocal(msg.payload);
});

function opFromDraft(id, value) {
  if (/^text-/.test(id)) return { op: 'text', id: id, value: value };
  if (/^image-/.test(id)) return { op: 'image-src', id: id, value: value };
  if (/^imgalt-/.test(id)) return { op: 'image-alt', id: id.replace('imgalt-', 'image-'), value: value };
  if (/^imgstyle-/.test(id)) return { op: 'image-style', id: id.replace('imgstyle-', 'image-'), value: value };
  if (/^secstyle-/.test(id)) return { op: 'section-style', id: id.replace('secstyle-', 'sec-'), value: value };
  if (/^seclabel-/.test(id)) return { op: 'section-label', id: id.replace('seclabel-', 'sec-'), value: value };
  return null;
}

/* ── history ───────────────────────────────────────────────── */
function pushHistory(entry) {
  history = history.slice(0, historyIndex + 1);
  history.push(entry);
  historyIndex = history.length - 1;
  updateDirtyUI();
}
function undo() { if (historyIndex < 0) return; history[historyIndex].undo(); historyIndex--; updateDirtyUI(); }
function redo() { if (historyIndex >= history.length - 1) return; historyIndex++; history[historyIndex].redo(); updateDirtyUI(); }
function renderHistory() {
  var box = el('history');
  el('history-count').textContent = history.length ? (historyIndex + 1) + '/' + history.length : '';
  box.innerHTML = history.length ? '' : '<p class="dim small">No changes yet this session.</p>';
  history.forEach(function (h, i) {
    var div = document.createElement('div');
    div.className = 'hist-entry' + (i > historyIndex ? ' future' : '');
    div.innerHTML = '<span class="t">' + h.time + '</span><span>' + esc(h.desc) + '</span>';
    var b = document.createElement('button');
    b.className = 'mini';
    b.textContent = 'Go';
    b.title = 'Restore the page to this point';
    b.onclick = function () { while (historyIndex > i) undo(); while (historyIndex < i) redo(); };
    div.appendChild(b);
    box.appendChild(div);
  });
  box.scrollTop = box.scrollHeight;
}

/* set an HTML-level field (text / image src / attrs) with undo support */
function setHtmlField(id, value, desc, section) {
  var d = draftFor(page);
  var prev = d.html[id] ? d.html[id].value : undefined;
  var existedBefore = id in d.html;
  var old = existedBefore ? prev : (arguments.length > 4 ? arguments[4] : undefined);
  function apply(v, remove) {
    if (remove) delete d.html[id]; else d.html[id] = { value: v, desc: desc };
    sendFrame({ type: 'apply', op: opFromDraft(id, remove ? old : v) });
    updateDirtyUI();
  }
  var oldValue = arguments[4]; // original value before any session edits
  pushHistory({
    desc: desc, time: now(), section: section || '',
    redo: function () { apply(value, false); },
    undo: function () {
      if (existedBefore) { d.html[id] = { value: prev, desc: desc }; sendFrame({ type: 'apply', op: opFromDraft(id, prev) }); }
      else { delete d.html[id]; sendFrame({ type: 'apply', op: opFromDraft(id, oldValue) }); }
      updateDirtyUI();
    }
  });
  apply(value, false);
}

function recordHtmlEdit(p) {
  // inline text edit committed inside the iframe
  setHtmlField(p.id, p.value, 'Edited ' + (p.label || 'text') + ' — "' + p.value.slice(0, 30) + (p.value.length > 30 ? '…"' : '"'), p.section, p.old);
}

/* ── collections ───────────────────────────────────────────── */
function getCollection(cid) {
  if (collectionsCache[cid]) return Promise.resolve(collectionsCache[cid]);
  return api('GET', '/api/collection/' + encodeURIComponent(cid)).then(function (data) {
    var d = draftFor(page);
    var items = d.collections[cid] ? d.collections[cid] : data.items;
    collectionsCache[cid] = { label: data.label, fields: data.fields, items: JSON.parse(JSON.stringify(items)), original: data.items };
    return collectionsCache[cid];
  });
}
function stageCollection(cid, items, desc) {
  var cache = collectionsCache[cid];
  var before = JSON.parse(JSON.stringify(cache.items));
  var after = JSON.parse(JSON.stringify(items));
  var pageAt = page;
  collectionPages[cid] = pageAt;
  var savedSnapshot = JSON.stringify(cache.original || []);
  function apply(state) {
    cache.items = JSON.parse(JSON.stringify(state));
    var d = draftFor(pageAt).collections;
    // Drop the draft entry when we're back to the saved file state, so the
    // page is no longer flagged dirty after undoing all collection edits.
    if (JSON.stringify(cache.items) === savedSnapshot) delete d[cid];
    else d[cid] = cache.items;
    updateDirtyUI();
    reloadFrameSoon();
  }
  pushHistory({
    desc: desc, time: now(),
    redo: function () { apply(after); },
    undo: function () { apply(before); }
  });
  apply(after);
}
var reloadTimer = null;
function reloadFrameSoon() {
  // collection edits re-render via real page JS; easiest faithful preview is a reload with drafts injected
  clearTimeout(reloadTimer);
  reloadTimer = setTimeout(function () { loadPage(page, true); }, 450);
}

/* ── page loading ──────────────────────────────────────────── */
function loadPage(file, keepSelection) {
  page = file;
  el('page-select').value = file;
  el('frame-loading').style.display = 'flex';
  selected = null;
  renderProps();
  var draft = draftFor(file);
  // Publish this page's staged (unsaved) collection edits to localStorage so
  // the iframe's early /visual-editor/staged.js applies them over CHYK_DATA
  // BEFORE the page renderers run. Cleared when there are none.
  try {
    if (Object.keys(draft.collections).length) localStorage.setItem('ve-staged', JSON.stringify(draft.collections));
    else localStorage.removeItem('ve-staged');
  } catch (_) { }
  frame.src = '/' + file + '?ve=1&t=' + Date.now();
  clearTimeout(frameLoadTimer);
  frameLoadTimer = setTimeout(function () {
    el('frame-loading').style.display = 'none';
    toast('The page preview took too long to initialize. Reload the editor if controls are missing.', true);
  }, 12000);
}

/* ── layers ────────────────────────────────────────────────── */
var collapsed = {};
function renderLayers(filter) {
  var box = el('layers');
  box.innerHTML = '';
  var q = (filter || el('layer-search').value || '').toLowerCase();
  function row(node, depth) {
    if (q && node.children.every(function (c) { return !matches(c); }) && !matches(node)) return null;
    var div = document.createElement('div');
    var hasKids = node.children && node.children.length;
    var line = document.createElement('div');
    line.className = 'layer' + (selected && idOf(selected) === node.id ? ' selected' : '') + (node.hidden ? ' hidden-section' : '');
    line.setAttribute('role', 'treeitem');
    line.tabIndex = -1;
    line.innerHTML = '<span class="twisty">' + (hasKids ? (collapsed[node.id] ? '▸' : '▾') : '') + '</span>' +
      '<span class="kind">' + node.kind.slice(0, 4) + '</span><span>' + esc(node.label) + '</span>';
    line.querySelector('.twisty').onclick = function (e) { e.stopPropagation(); collapsed[node.id] = !collapsed[node.id]; renderLayers(); };
    line.onclick = function () { sendFrame({ type: 'select-id', id: node.id }); };
    div.appendChild(line);
    if (hasKids && !collapsed[node.id]) {
      var kids = document.createElement('div');
      kids.className = 'layer-children';
      node.children.forEach(function (c) { var r = row(c, depth + 1); if (r) kids.appendChild(r); });
      div.appendChild(kids);
    }
    return div;
  }
  function matches(node) {
    if (!q) return true;
    return node.label.toLowerCase().indexOf(q) > -1 || (node.children || []).some(matches);
  }
  layersTree.forEach(function (n) { var r = row(n, 0); if (r) box.appendChild(r); });
  if (!box.children.length) box.innerHTML = '<p class="dim small">No layers match.</p>';
}
function idOf(sel) {
  if (!sel) return null;
  if (sel.kind === 'item') return sel.collection + ':' + (sel.itemId !== null && sel.itemId !== undefined ? sel.itemId : sel.index);
  return sel.id;
}
function highlightLayer() { renderLayers(); }

/* ── properties panel ──────────────────────────────────────── */
function renderProps() {
  var body = el('props-body');
  var title = el('props-title');
  if (!selected) {
    title.textContent = 'Properties';
    body.innerHTML = '<p class="dim">Nothing selected.<br><br>Click any text, image, card or section in the page preview.</p>';
    return;
  }
  title.textContent = selected.label || 'Properties';
  if (selected.kind === 'text') return renderTextProps(body);
  if (selected.kind === 'image') return renderImageProps(body);
  if (selected.kind === 'item') return renderItemProps(body);
  if (selected.kind === 'section') return renderSectionProps(body);
  body.innerHTML = '<p class="dim">This element has no editable properties.</p>';
}

function renderTextProps(body) {
  body.innerHTML =
    '<span class="prop-kind">Text — ' + esc(selected.section) + '</span>' +
    '<label>Content</label>' +
    '<textarea data-live rows="4">' + esc(selected.value) + '</textarea>' +
    '<div class="btn-row"><button id="p-apply" class="primary">Apply</button>' +
    '<button id="p-inline">Edit in page</button></div>' +
    '<p class="field-note">Tip: double-click text in the preview to edit it in place. Formatting and special characters are preserved.</p>';
  body.querySelector('#p-apply').onclick = function () {
    var v = body.querySelector('textarea').value.trim();
    if (v === selected.value) return;
    setHtmlField(selected.id, v, 'Edited ' + selected.label + ' — "' + v.slice(0, 30) + '"', selected.section, selected.value);
    selected.value = v;
  };
  body.querySelector('#p-inline').onclick = function () { sendFrame({ type: 'inline-edit' }); };
}

function parseStyle(styleAttr) {
  var map = {};
  String(styleAttr || '').split(';').forEach(function (pair) {
    var i = pair.indexOf(':');
    if (i > 0) map[pair.slice(0, i).trim()] = pair.slice(i + 1).trim();
  });
  return map;
}
function buildStyle(map) {
  return Object.keys(map).filter(function (k) { return map[k]; }).map(function (k) { return k + ': ' + map[k]; }).join('; ');
}

function renderImageProps(body) {
  var style = parseStyle(selected.styleAttr);
  var pos = /^(\d+)%\s+(\d+)%$/.exec(style['object-position'] || '') || [null, 50, 50];
  body.innerHTML =
    '<span class="prop-kind">Image — ' + esc(selected.section) + '</span>' +
    '<img class="thumb" src="' + esc(selected.src) + '" alt="">' +
    '<p class="field-note">' + esc(selected.src) + (selected.natural.w ? ' · ' + selected.natural.w + '×' + selected.natural.h : '') + '</p>' +
    '<div class="btn-row"><button id="p-upload" class="primary">Replace…</button><button id="p-focal">Set focal point</button><button id="p-reset">Reset</button></div>' +
    '<input type="file" id="p-file" accept="image/*" hidden>' +
    '<label>Alt text (describes the image)</label><input id="p-alt" value="' + esc(selected.alt) + '">' +
    '<label>Fit inside frame</label><select id="p-fit"><option value="">Default (fill frame)</option><option value="cover">Fill frame (crop)</option><option value="contain">Show full image</option></select>' +
    '<label>Horizontal position</label><div class="slider-row"><input type="range" id="p-x" min="0" max="100" value="' + pos[1] + '"><output>' + pos[1] + '%</output></div>' +
    '<label>Vertical position</label><div class="slider-row"><input type="range" id="p-y" min="0" max="100" value="' + pos[2] + '"><output>' + pos[2] + '%</output></div>' +
    '<label>Zoom</label><div class="slider-row"><input type="range" id="p-z" min="100" max="150" value="' + (parseFloat((style.transform || '').replace(/[^\d.]/g, '')) * 100 || 100) + '"><output>100%</output></div>' +
    '<p class="field-note">Position and zoom apply to all screen sizes. Mobile uses the same focal point.</p>';
  body.querySelector('#p-fit').value = style['object-fit'] || '';

  body.querySelector('#p-upload').onclick = function () { body.querySelector('#p-file').click(); };
  body.querySelector('#p-file').onchange = function () {
    var f = this.files[0];
    if (!f) return;
    uploadFile(f, folderForPage()).then(function (res) {
      setHtmlField(selected.id, res.path, 'Replaced image with ' + res.path.split('/').pop(), selected.section, selected.src);
      selected.src = res.path;
      renderProps();
      toast('Image uploaded' + (res.optimized ? ' and optimized to WebP' : ''));
    }).catch(function (e) { toast(e.message, true); });
  };
  body.querySelector('#p-alt').onchange = function () {
    setHtmlField(selected.id.replace('image-', 'imgalt-'), this.value, 'Changed image alt text', selected.section, selected.alt);
    selected.alt = this.value;
  };
  function styleChange(desc) {
    var map = parseStyle(selected.styleAttr);
    map['object-fit'] = body.querySelector('#p-fit').value;
    var x = body.querySelector('#p-x').value, y = body.querySelector('#p-y').value;
    map['object-position'] = (x === '50' && y === '50' && !map['object-fit']) ? '' : x + '% ' + y + '%';
    var z = Number(body.querySelector('#p-z').value);
    map['transform'] = z > 100 ? 'scale(' + (z / 100) + ')' : '';
    var styleValue = buildStyle(map);
    setHtmlField(selected.id.replace('image-', 'imgstyle-'), styleValue, desc, selected.section, selected.styleAttr);
    selected.styleAttr = styleValue;
  }
  body.querySelector('#p-fit').onchange = function () { styleChange('Changed image fit'); };
  ['#p-x', '#p-y', '#p-z'].forEach(function (s) {
    var input = body.querySelector(s);
    input.oninput = function () { this.nextElementSibling.value = this.value + '%'; };
    input.onchange = function () { styleChange(s === '#p-z' ? 'Zoomed image' : 'Moved image position'); };
  });
  body.querySelector('#p-focal').onclick = function () {
    toast('Click a spot on the image in the preview (Esc cancels)');
    sendFrame({ type: 'focal-mode', id: selected.id });
  };
  body.querySelector('#p-reset').onclick = function () {
    setHtmlField(selected.id.replace('image-', 'imgstyle-'), '', 'Reset image position/fit', selected.section, selected.styleAttr);
    selected.styleAttr = '';
    renderProps();
  };
}
function applyFocal(p) {
  if (!selected || selected.id !== p.id) return;
  var map = parseStyle(selected.styleAttr);
  map['object-position'] = p.x + '% ' + p.y + '%';
  if (!map['object-fit']) map['object-fit'] = 'cover';
  var v = buildStyle(map);
  setHtmlField(p.id.replace('image-', 'imgstyle-'), v, 'Set image focal point (' + p.x + '%, ' + p.y + '%)', selected.section, selected.styleAttr);
  selected.styleAttr = v;
  renderProps();
}
function folderForPage() { return (page || 'general').replace('.html', '').replace(/[^a-z0-9-]/gi, '-'); }
function uploadFile(file, folder) {
  return new Promise(function (resolve, reject) {
    var reader = new FileReader();
    reader.onload = function () {
      api('POST', '/api/upload', { name: file.name, folder: folder, data: reader.result }).then(resolve, reject);
    };
    reader.onerror = function () { reject(new Error('Could not read the file.')); };
    reader.readAsDataURL(file);
  });
}

function renderItemProps(body) {
  body.innerHTML = '<p class="dim">Loading ' + esc(selected.label) + '…</p>';
  var cid = selected.collection;
  getCollection(cid).then(function (col) {
    var index = selected.itemId != null ? col.items.findIndex(function (it) { return String(it.id) === String(selected.itemId); }) : selected.index;
    if (index < 0 || !col.items[index]) { body.innerHTML = '<p class="dim">Could not match this card to its data entry. Use the Content Manager for this one.</p>'; return; }
    var item = col.items[index];
    var html = '<span class="prop-kind">' + esc(col.label) + ' — entry ' + (index + 1) + ' of ' + col.items.length + '</span>';
    col.fields.forEach(function (f) {
      var v = item[f.key];
      if (f.type === 'blocks' || f.type === 'list') {
        html += '<label>' + esc(f.label) + '</label><p class="field-note">Edit "' + esc(f.label) + '" in the Content Manager (structured field).</p>';
        return;
      }
      if (typeof v === 'boolean' || f.key === 'featured' || f.key === 'published') {
        html += '<label class="row" style="text-transform:none;letter-spacing:0"><input type="checkbox" data-key="' + f.key + '"' + (v ? ' checked' : '') + '> ' + esc(f.label) + '</label>';
        return;
      }
      if (f.type === 'image') {
        html += '<label>' + esc(f.label) + '</label>' +
          (v ? '<img class="thumb" src="/' + esc(v) + '">' : '') +
          '<div class="btn-row"><button class="mini" data-imgkey="' + f.key + '">Upload new…</button></div>' +
          '<input data-key="' + f.key + '" value="' + esc(v || '') + '">';
        return;
      }
      if (f.type === 'textarea') { html += '<label>' + esc(f.label) + '</label><textarea data-key="' + f.key + '" rows="3">' + esc(v || '') + '</textarea>'; return; }
      html += '<label>' + esc(f.label) + '</label><input data-key="' + f.key + '" value="' + esc(v == null ? '' : v) + '">';
    });
    html += '<div class="btn-row">' +
      '<button id="i-save" class="primary">Apply changes</button>' +
      '<button id="i-up" title="Move earlier">Move up</button><button id="i-down" title="Move later">Move down</button>' +
      '<button id="i-dup">Duplicate</button><button id="i-del" class="danger">Delete</button></div>' +
      '<p class="field-note">Changes are staged — press Save Page to write them into the website data files.</p>';
    body.innerHTML = html;

    body.querySelectorAll('[data-imgkey]').forEach(function (btn) {
      btn.onclick = function () {
        var key = btn.getAttribute('data-imgkey');
        var fileInput = document.createElement('input');
        fileInput.type = 'file'; fileInput.accept = 'image/*';
        fileInput.onchange = function () {
          if (!fileInput.files[0]) return;
          uploadFile(fileInput.files[0], cid).then(function (res) {
            body.querySelector('[data-key="' + key + '"]').value = res.path;
            toast('Uploaded' + (res.optimized ? ' + optimized to WebP' : '') + ' — press Apply changes');
          }).catch(function (e) { toast(e.message, true); });
        };
        fileInput.click();
      };
    });

    function collectForm() {
      var next = JSON.parse(JSON.stringify(item));
      body.querySelectorAll('[data-key]').forEach(function (input) {
        var key = input.getAttribute('data-key');
        if (input.type === 'checkbox') next[key] = input.checked;
        else {
          var v = input.value;
          if (typeof item[key] === 'number' && v !== '' && !isNaN(Number(v))) next[key] = Number(v);
          else next[key] = v;
        }
      });
      return next;
    }
    body.querySelector('#i-save').onclick = function () {
      var next = collectForm();
      var items = JSON.parse(JSON.stringify(col.items));
      items[index] = next;
      stageCollection(cid, items, 'Edited ' + col.label.toLowerCase() + ' "' + (next.title || next.name || next.id || index + 1) + '"');
    };
    body.querySelector('#i-up').onclick = function () { move(-1); };
    body.querySelector('#i-down').onclick = function () { move(1); };
    function move(dir) {
      var to = index + dir;
      if (to < 0 || to >= col.items.length) return;
      var items = JSON.parse(JSON.stringify(col.items));
      var moved = items.splice(index, 1)[0];
      items.splice(to, 0, moved);
      stageCollection(cid, items, 'Reordered ' + col.label.toLowerCase() + ' (position ' + (index + 1) + ' → ' + (to + 1) + ')');
    }
    body.querySelector('#i-dup').onclick = function () {
      var items = JSON.parse(JSON.stringify(col.items));
      var copy = JSON.parse(JSON.stringify(item));
      if (copy.id) copy.id = String(copy.id) + '-copy-' + Date.now().toString(36);
      items.splice(index + 1, 0, copy);
      stageCollection(cid, items, 'Duplicated ' + col.label.toLowerCase());
    };
    body.querySelector('#i-del').onclick = function () {
      confirmModal('Delete this ' + col.label.toLowerCase() + '?', 'This removes "' + esc(item.title || item.name || item.id || 'entry') + '" from the website data when you save. You can undo before saving.', function () {
        var items = JSON.parse(JSON.stringify(col.items));
        items.splice(index, 1);
        stageCollection(cid, items, 'Deleted ' + col.label.toLowerCase());
        selected = null; renderProps();
      });
    };
  }).catch(function (e) { body.innerHTML = '<p class="dim">' + esc(e.message) + '</p>'; });
}

function renderSectionProps(body) {
  var locked = !advanced;
  body.innerHTML =
    '<span class="prop-kind">Section</span>' +
    '<p class="field-note">' + esc(selected.label) + '</p>' +
    (locked
      ? '<p class="field-note">Structural sections are locked. Enable "Advanced developer mode" (below right) to rename or hide sections.</p>'
      : '<label>Editor label</label><input id="s-label" value="' + esc(selected.editorLabel) + '">' +
        '<label class="row" style="text-transform:none;letter-spacing:0"><input type="checkbox" id="s-hide"' + (selected.hidden ? ' checked' : '') + '> Hide this section on the website</label>' +
        '<p class="field-note">Hiding writes style="display:none" into the page. The section stays in the file and can be shown again later.</p>');
  if (locked) return;
  body.querySelector('#s-label').onchange = function () {
    setHtmlField(selected.id.replace('sec-', 'seclabel-'), this.value, 'Renamed section label to "' + this.value + '"', selected.label, selected.editorLabel);
    selected.editorLabel = this.value;
  };
  body.querySelector('#s-hide').onchange = function () {
    var hide = this.checked;
    confirmModal(hide ? 'Hide this section?' : 'Show this section?', 'This affects every screen size on the live website.', function () {
      setHtmlField(selected.id.replace('sec-', 'secstyle-'), hide ? 'display:none' : '', (hide ? 'Hid' : 'Showed') + ' section "' + selected.label + '"', selected.label, selected.hidden ? 'display:none' : '');
      selected.hidden = hide;
      sendFrame({ type: 'request-layers' });
    }, function () { body.querySelector('#s-hide').checked = !hide; });
  };
}

/* ── save ──────────────────────────────────────────────────── */
function savePage(targetPage) {
  var p = targetPage || page;
  var d = draftFor(p);
  var htmlIds = Object.keys(d.html);
  var cids = Object.keys(d.collections);
  if (!htmlIds.length && !cids.length) return Promise.resolve({ page: p, changed: 0 });
  var summary = [];
  var chain = Promise.resolve();
  if (htmlIds.length) {
    chain = chain.then(function () {
      return api('PUT', '/api/page-ops', { file: p, ops: htmlIds.map(function (id) { return { id: id, value: d.html[id].value }; }) })
        .then(function (r) { summary.push(htmlIds.length + ' page edit(s)'); });
    });
  }
  cids.forEach(function (cid) {
    chain = chain.then(function () {
      return api('PUT', '/api/collection/' + encodeURIComponent(cid), { items: d.collections[cid] })
        .then(function (r) {
          summary.push(collectionsCache[cid] ? collectionsCache[cid].label : cid);
          if (r.validation && r.validation.warnings && r.validation.warnings.length) toast('Saved with warnings: ' + r.validation.warnings[0], true);
        });
    });
  });
  return chain.then(function () {
    d.html = {}; d.collections = {};
    cids.forEach(function (cid) { delete collectionsCache[cid]; });
    updateDirtyUI();
    return { page: p, changed: htmlIds.length + cids.length, summary: summary };
  });
}
function saveCurrent() {
  if (el('btn-save').disabled) return;
  savePage().then(function (r) {
    history = [];
    historyIndex = -1;
    updateDirtyUI();
    toast('Saved ' + r.page + ' — ' + r.summary.join(', ') + '. Backup created.');
    loadPage(page, true);
  }).catch(function (e) { toast('Save failed: ' + e.message + ' (nothing was partially saved for that step)', true); });
}
function saveAll() {
  var list = dirtyPages();
  var chain = Promise.resolve();
  list.forEach(function (p) { chain = chain.then(function () { return savePage(p); }); });
  chain.then(function () {
    history = [];
    historyIndex = -1;
    updateDirtyUI();
    toast('Saved all pages: ' + list.join(', '));
    loadPage(page, true);
  })
    .catch(function (e) { toast('Save All stopped: ' + e.message, true); });
}

/* ── modal helpers ─────────────────────────────────────────── */
function confirmModal(title, text, onYes, onNo) {
  showModal(title, '<p>' + text + '</p>', [
    { label: 'Cancel', action: function () { closeModal(); if (onNo) onNo(); } },
    { label: 'Confirm', primary: true, action: function () { closeModal(); onYes(); } }
  ]);
}
function showModal(title, bodyHtml, actions) {
  el('modal-title').textContent = title;
  el('modal-body').innerHTML = bodyHtml;
  var box = el('modal-actions');
  box.innerHTML = '';
  (actions || [{ label: 'Close', action: closeModal }]).forEach(function (a) {
    var b = document.createElement('button');
    if (a.primary) b.className = 'primary';
    b.textContent = a.label;
    b.onclick = a.action;
    box.appendChild(b);
  });
  el('modal').hidden = false;
}
function closeModal() { el('modal').hidden = true; }

function showBackups() {
  api('GET', '/api/backups').then(function (data) {
    var html = data.items.length ? '' : '<p class="dim">No saved versions yet.</p>';
    data.items.forEach(function (b) {
      var when = b.name.replace(/T/, ' ').replace(/-(\d\d)-(\d\d)-\d+Z?$/, ':$1:$2').replace(/-/g, function (m, i) { return i > 9 ? m : m; });
      html += '<p style="margin:10px 0 2px;color:var(--gold)">' + esc(b.name) + '</p>';
      b.files.forEach(function (f) {
        html += '<div class="backup-file"><span>' + esc(f) + '</span><button class="mini" data-b="' + esc(b.name) + '" data-f="' + esc(f) + '">Restore</button></div>';
      });
    });
    showModal('Saved versions (automatic backups)', html);
    el('modal-body').querySelectorAll('button[data-b]').forEach(function (btn) {
      btn.onclick = function () {
        var bn = btn.getAttribute('data-b'), fn = btn.getAttribute('data-f');
        confirmModal('Restore ' + fn + '?', 'The current version of this file is backed up first, then replaced with the copy from ' + bn + '.', function () {
          api('POST', '/api/restore', { backup: bn, file: fn }).then(function () {
            toast('Restored ' + fn);
            collectionsCache = {};
            loadPage(page, true);
          }).catch(function (e) { toast(e.message, true); });
        });
      };
    });
  });
}

function runTool(tool, title) {
  showModal(title, '<p class="dim">Running…</p>');
  api('POST', '/api/run-tool', { tool: tool }).then(function (r) {
    showModal(title + (r.ok ? ' — OK' : ' — problems found'), '<pre>' + esc(r.output || '(no output)') + '</pre>');
  }).catch(function (e) { showModal(title, '<pre>' + esc(e.message) + '</pre>'); });
}

/* ── shortcuts & top bar ───────────────────────────────────── */
function handleShortcut(key, shift) {
  if (key === 'z' && !shift) undo();
  else if (key === 'y' || (key === 'z' && shift)) redo();
  else if (key === 's') saveCurrent();
  else if (key === 'p') window.open('/' + page, '_blank');
}
document.addEventListener('keydown', function (e) {
  if ((e.ctrlKey || e.metaKey) && /^[zysp]$/i.test(e.key)) { e.preventDefault(); handleShortcut(e.key.toLowerCase(), e.shiftKey); }
  if (e.key === 'Escape') { if (!el('modal').hidden) closeModal(); else sendFrame({ type: 'deselect' }); }
  if (e.key === 'Delete' && selected && selected.kind === 'item' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
    var btn = document.querySelector('#props-body #i-del');
    if (btn) btn.click();
  }
});

el('btn-undo').onclick = undo;
el('btn-redo').onclick = redo;
el('btn-save').onclick = saveCurrent;
el('btn-save-all').onclick = saveAll;
el('btn-preview').onclick = function () { window.open('/' + page, '_blank'); };
el('btn-check').onclick = function () { runTool('check', 'Website health check'); };
el('btn-dist').onclick = function () {
  var dirty = dirtyPages();
  if (dirty.length) {
    confirmModal('Save changes first?', 'You have unsaved changes on: ' + dirty.join(', ') + '. They must be saved before packaging.', function () {
      saveAll();
      setTimeout(function () { runTool('dist', 'Build hosting package'); }, 800);
    });
  } else runTool('dist', 'Build hosting package');
};
el('btn-exit').onclick = function () {
  var dirty = dirtyPages();
  if (dirty.length) confirmModal('Exit with unsaved changes?', 'Unsaved edits on: ' + dirty.join(', ') + ' will be kept in this browser tab until it closes.', function () { window.close(); location.href = '/content-manager/'; });
  else { window.close(); location.href = '/content-manager/'; }
};
el('btn-refresh-layers').onclick = function () { sendFrame({ type: 'request-layers' }); };
el('btn-backups').onclick = showBackups;
el('layer-search').oninput = function () { renderLayers(); };
el('advanced-toggle').onchange = function () { advanced = this.checked; renderProps(); };
el('page-select').onchange = function () { switchPage(this.value); };
document.querySelectorAll('#device-group button').forEach(function (b) {
  b.onclick = function () {
    document.querySelectorAll('#device-group button').forEach(function (x) { x.classList.remove('active'); });
    b.classList.add('active');
    frame.className = b.getAttribute('data-device') === 'desktop' ? '' : b.getAttribute('data-device');
    toast('Pages decide desktop/mobile layout when they load — switching width reloads the page.');
    loadPage(page, true);
  };
});

function switchPage(next) {
  if (next === page) return;
  history = [];
  historyIndex = -1;
  updateDirtyUI();
  loadPage(next);
}

/* ── boot ──────────────────────────────────────────────────── */
loadDrafts();
api('GET', '/api/bootstrap').then(function (boot) {
  pages = boot.pages.filter(function (p) { return p !== 'article.html'; });
  var sel = el('page-select');
  pages.forEach(function (p) {
    var o = document.createElement('option');
    o.value = p;
    o.textContent = p.replace('.html', '') + (p === 'index.html' ? ' (home)' : '');
    sel.appendChild(o);
  });
  loadPage(pages.indexOf('index.html') > -1 ? 'index.html' : pages[0]);
  updateDirtyUI();
}).catch(function (e) { toast('Could not reach the local server: ' + e.message, true); });

window.addEventListener('beforeunload', function (e) {
  if (dirtyPages().length) { e.preventDefault(); e.returnValue = ''; }
});
})();
