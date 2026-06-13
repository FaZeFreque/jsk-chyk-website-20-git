/* CHYK Visual Editor — in-page agent.
   Loaded ONLY when a page is served with ?ve=1 (never part of the real site).
   Maps annotated text nodes / images / sections plus registry collections,
   intercepts clicks for selection, performs inline edits, and talks to the
   editor shell via postMessage. */
(function () {
  'use strict';
  if (window.top === window) return; // only meaningful inside the editor iframe

  var PARENT = window.parent;
  var page = location.pathname.replace(/^\//, '') || 'index.html';
  var texts = {};      // id -> Text node
  var images = {};     // id -> <img>
  var sections = {};   // id -> element
  var collections = []; // {collection, container, items:[{el, id|index}]}
  var selected = null; // {kind, id, el}
  var editingNode = null;

  /* ── registry (loaded synchronously via script tag below) ── */
  function loadRegistry(cb) {
    var s = document.createElement('script');
    s.src = '/visual-editor/registry.js';
    s.onload = cb; s.onerror = cb;
    document.head.appendChild(s);
  }

  /* ── mapping ───────────────────────────────────────────── */
  function mapAnnotations() {
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_COMMENT, null);
    var c;
    while ((c = walker.nextNode())) {
      var m = /^ve-t:(\d+)$/.exec(c.data);
      if (!m) continue;
      var n = c.nextSibling;
      if (n && n.nodeType === 3) texts['text-' + m[1]] = n;
    }
    document.querySelectorAll('[data-ve-img]').forEach(function (img) { images['image-' + img.getAttribute('data-ve-img')] = img; });
    document.querySelectorAll('[data-ve-sec]').forEach(function (el) { sections['sec-' + el.getAttribute('data-ve-sec')] = el; });
  }

  function mapCollections() {
    var defs = (window.VE_REGISTRY || {})[page] || [];
    defs.forEach(function (def) {
      var container = document.querySelector(def.container);
      if (!container) return;
      var items = [];
      container.querySelectorAll(def.item).forEach(function (el, i) {
        var id = null;
        if (def.idFromHref) {
          var a = el.matches('a[href*="id="]') ? el : el.querySelector('a[href*="id="]');
          var href = (a || el).getAttribute && (a || el).getAttribute('href') || '';
          var mm = /[?&]id=([^&]+)/.exec(href);
          if (mm) id = decodeURIComponent(mm[1]);
        }
        el.setAttribute('data-ve-item', def.collection + ':' + (id !== null ? id : i));
        items.push({ el: el, id: id, index: i });
      });
      if (items.length) collections.push({ def: def, container: container, items: items });
    });
  }

  /* ── labels & layers tree ──────────────────────────────── */
  function labelFor(el) {
    if (!el || el === document.body) return 'Page';
    if (el.hasAttribute('data-ve-item')) {
      var c = findCollectionItem(el);
      if (c) return c.entry.def.label + ' ' + (c.item.index + 1);
    }
    if (el.hasAttribute('data-ve-sec')) {
      return el.getAttribute('data-editor-label') || el.getAttribute('aria-label') ||
        humanize(el.id || el.className.split(/\s+/)[0] || el.tagName);
    }
    if (el.tagName === 'IMG') return 'Image';
    if (/^H[1-6]$/.test(el.tagName)) return 'Heading';
    if (el.tagName === 'P') return 'Paragraph';
    if (el.tagName === 'A' || el.tagName === 'BUTTON') return 'Button / Link';
    return humanize(el.className.split(/\s+/)[0] || el.tagName);
  }
  function humanize(v) {
    v = String(v || '').replace(/^(m-|home-)/, '').replace(/[-_]+/g, ' ').trim();
    return v ? v.replace(/\b\w/g, function (ch) { return ch.toUpperCase(); }) : 'Element';
  }

  function sectionOf(el) {
    var n = el;
    while (n && n !== document.body) {
      if (n.hasAttribute && n.hasAttribute('data-ve-sec')) return n;
      n = n.parentElement;
    }
    return null;
  }

  function buildLayers() {
    var tree = [];
    document.querySelectorAll('[data-ve-sec]').forEach(function (sec) {
      var secId = 'sec-' + sec.getAttribute('data-ve-sec');
      var node = { kind: 'section', id: secId, label: labelFor(sec), hidden: sec.style.display === 'none', children: [] };
      // collection groups inside this section
      collections.forEach(function (entry) {
        if (!sec.contains(entry.container)) return;
        node.children.push({
          kind: 'collection', id: entry.def.collection, label: entry.def.label + 's (' + entry.items.length + ')',
          children: entry.items.map(function (item) {
            return { kind: 'item', id: entry.def.collection + ':' + (item.id !== null ? item.id : item.index), label: itemTitle(item.el) || entry.def.label + ' ' + (item.index + 1), children: [] };
          })
        });
      });
      // notable direct content: headings, images, text ids inside
      var seen = 0;
      sec.querySelectorAll('h1,h2,h3,h4,img,p,a.btn,button').forEach(function (el) {
        if (seen > 40) return;
        if (el.closest('[data-ve-item]')) return; // belongs to a collection card
        var ref = elementRef(el);
        if (!ref) return;
        seen++;
        node.children.push({ kind: ref.kind, id: ref.id, label: layerText(el), children: [] });
      });
      tree.push(node);
    });
    return tree;
  }
  function itemTitle(el) {
    var h = el.querySelector('h1,h2,h3,h4,figcaption,.deck-content p');
    return h ? h.textContent.trim().slice(0, 40) : '';
  }
  function layerText(el) {
    if (el.tagName === 'IMG') return 'Image — ' + (el.getAttribute('alt') || el.getAttribute('src') || '').split('/').pop().slice(0, 30);
    var t = el.textContent.trim().replace(/\s+/g, ' ');
    return (labelFor(el) + ': ' + t.slice(0, 36) + (t.length > 36 ? '…' : ''));
  }

  /* which editable handle does this element correspond to? */
  function elementRef(el) {
    if (el.tagName === 'IMG' && el.hasAttribute('data-ve-img')) return { kind: 'image', id: 'image-' + el.getAttribute('data-ve-img') };
    // a text element qualifies if it (or a child) holds annotated text nodes
    var ids = textIdsWithin(el);
    if (ids.length) return { kind: 'text', id: ids[0], ids: ids };
    return null;
  }
  function textIdsWithin(el) {
    var out = [];
    Object.keys(texts).forEach(function (id) {
      var n = texts[id];
      if (n && el.contains(n.parentElement)) out.push(id);
    });
    return out;
  }
  function findCollectionItem(el) {
    for (var i = 0; i < collections.length; i++) {
      for (var j = 0; j < collections[i].items.length; j++) {
        if (collections[i].items[j].el === el) return { entry: collections[i], item: collections[i].items[j] };
      }
    }
    return null;
  }

  /* ── selection visuals ─────────────────────────────────── */
  var hoverBox = div('ve-hover-box');
  var hoverTag = div('ve-hover-tag');
  var selectBox = div('ve-select-box');
  var selectTag = div('ve-select-tag');
  function div(cls) { var d = document.createElement('div'); d.className = cls; d.style.display = 'none'; document.documentElement.appendChild(d); return d; }
  function place(box, tag, el, label) {
    var r = el.getBoundingClientRect();
    var left = Math.max(0, r.left);
    var top = Math.max(0, r.top);
    var right = Math.min(innerWidth, r.right);
    var bottom = Math.min(innerHeight, r.bottom);
    if (!isFinite(r.left) || !isFinite(r.top) || right <= left || bottom <= top) {
      box.style.display = 'none';
      tag.style.display = 'none';
      return;
    }
    box.style.display = 'block';
    box.style.left = (left + scrollX) + 'px';
    box.style.top = (top + scrollY) + 'px';
    box.style.width = (right - left) + 'px';
    box.style.height = (bottom - top) + 'px';
    tag.style.display = 'block';
    tag.textContent = label;
    tag.style.left = (left + scrollX) + 'px';
    tag.style.top = Math.max(scrollY, top + scrollY - 22) + 'px';
  }
  function hideHover() { hoverBox.style.display = 'none'; hoverTag.style.display = 'none'; }
  function refreshSelectionBox() {
    if (selected && selected.kind !== 'section' && selected.el && document.contains(selected.el)) place(selectBox, selectTag, selected.el, selected.label);
    else { selectBox.style.display = 'none'; selectTag.style.display = 'none'; }
  }
  setInterval(refreshSelectionBox, 350);
  addEventListener('scroll', refreshSelectionBox, true);

  /* what should a raw click target resolve to? */
  function resolveTarget(el) {
    if (!el || el === document.body || el === document.documentElement) return null;
    var card = el.closest('[data-ve-item]');
    if (el.tagName === 'IMG' && el.hasAttribute('data-ve-img')) return { kind: 'image', id: 'image-' + el.getAttribute('data-ve-img'), el: el };
    if (card && el.tagName === 'IMG') return { kind: 'item-image', el: card, img: el };
    if (card) return { kind: 'item', el: card };
    // climb to the nearest element that directly owns an annotated text node
    var n = el;
    while (n && n !== document.body) {
      var owns = directTextId(n);
      if (owns) return { kind: 'text', id: owns, el: n };
      if (n.tagName === 'IMG' && n.hasAttribute('data-ve-img')) return { kind: 'image', id: 'image-' + n.getAttribute('data-ve-img'), el: n };
      n = n.parentElement;
    }
    var sec = sectionOf(el);
    if (sec) return { kind: 'section', id: 'sec-' + sec.getAttribute('data-ve-sec'), el: sec };
    return null;
  }
  function directTextId(el) {
    for (var i = 0; i < el.childNodes.length; i++) {
      var n = el.childNodes[i];
      if (n.nodeType !== 3) continue;
      for (var id in texts) if (texts[id] === n) return id;
    }
    return null;
  }
  /* Resolve a click/hover by scanning every element under the cursor, not just
     the topmost one. Transparent structural wrappers (e.g. the homepage
     .horizontal-track, z-index 30, that sits over the hero) would otherwise
     swallow clicks meant for the text/image painted beneath them. The website
     itself is untouched — this only changes how the editor picks a target. */
  function resolveAtPoint(x, y, fallback) {
    var stack = document.elementsFromPoint(x, y) || [];
    for (var i = 0; i < stack.length; i++) {
      var el = stack[i];
      if (!el || (el.className && String(el.className).indexOf('ve-') === 0)) continue; // skip editor overlays
      var t = resolveTarget(el);
      if (t && (t.kind === 'text' || t.kind === 'image' || t.kind === 'item' || t.kind === 'item-image')) return t;
    }
    // Geometric fallback: some real content (e.g. the homepage hero text) has
    // pointer-events:none and is skipped by hit-testing, so clicks fall through
    // to a structural wrapper. Find the smallest annotated box containing the
    // point, scoped to the section the click landed in (so off-canvas elements
    // outside any section — like the closed mobile menu — are never matched).
    var scopeEl = null;
    for (var s = 0; s < stack.length; s++) {
      if (stack[s] && stack[s].className && String(stack[s].className).indexOf('ve-') === 0) continue;
      scopeEl = sectionOf(stack[s]);
      if (scopeEl) break;
    }
    var geo = editableAtPoint(x, y, scopeEl);
    if (geo) return geo;
    // Sections and transparent layout tracks can cover an entire viewport (or
    // several horizontal-scroll viewports). Selecting one from the canvas
    // looks like a blocking rectangle and makes the editor feel unusable.
    // Sections remain available from the Layers panel; canvas clicks select
    // only actual editable content.
    var fallbackTarget = resolveTarget(fallback || stack[0]);
    return fallbackTarget && fallbackTarget.kind !== 'section' ? fallbackTarget : null;
  }
  function editableAtPoint(x, y, scope) {
    var best = null, bestArea = Infinity;
    function consider(el, make) {
      if (!el) return;
      if (scope && el.closest('[data-ve-sec]') !== scope) return; // stay inside the clicked section
      var r = el.getBoundingClientRect();
      if (r.width <= 0 || r.height <= 0 || x < r.left || x > r.right || y < r.top || y > r.bottom) return;
      var area = r.width * r.height;
      if (area < bestArea) { bestArea = area; best = make(); }
    }
    for (var id in texts) (function (id) { var n = texts[id]; var el = n && n.parentElement; consider(el, function () { return { kind: 'text', id: id, el: el }; }); })(id);
    for (var iid in images) (function (iid) { var img = images[iid]; consider(img, function () { return { kind: 'image', id: iid, el: img }; }); })(iid);
    return best;
  }

  /* ── selection actions ─────────────────────────────────── */
  function select(target) {
    stopInlineEdit(true);
    if (!target) { selected = null; refreshSelectionBox(); post({ type: 'selected', payload: null }); return; }
    var payload = describe(target);
    selected = { kind: target.kind, id: target.id, el: target.el, label: payload.label };
    refreshSelectionBox();
    post({ type: 'selected', payload: payload });
  }

  function describe(target) {
    var el = target.el;
    if (target.kind === 'text') {
      return { kind: 'text', id: target.id, label: labelFor(el), section: secLabel(el), value: texts[target.id].nodeValue.trim(), tag: el.tagName.toLowerCase() };
    }
    if (target.kind === 'image') {
      var img = el;
      return {
        kind: 'image', id: target.id, label: 'Image', section: secLabel(img),
        src: img.getAttribute('src') || '', alt: img.getAttribute('alt') || '',
        fit: img.style.objectFit || getComputedStyle(img).objectFit,
        position: img.style.objectPosition || getComputedStyle(img).objectPosition,
        styleAttr: img.getAttribute('style') || '',
        natural: { w: img.naturalWidth, h: img.naturalHeight }
      };
    }
    if (target.kind === 'item' || target.kind === 'item-image') {
      var found = findCollectionItem(el);
      if (!found) return { kind: 'unknown', label: 'Element' };
      return {
        kind: 'item', collection: found.entry.def.collection, label: found.entry.def.label + ' ' + (found.item.index + 1),
        section: secLabel(el), itemId: found.item.id, index: found.item.index,
        clickedImage: target.kind === 'item-image' ? (target.img.getAttribute('src') || '') : null
      };
    }
    if (target.kind === 'section') {
      return { kind: 'section', id: target.id, label: labelFor(el), hidden: el.style.display === 'none', editorLabel: el.getAttribute('data-editor-label') || '' };
    }
    return { kind: 'unknown', label: 'Element' };
  }
  function secLabel(el) { var s = sectionOf(el); return s ? labelFor(s) : 'Page'; }

  /* ── inline text editing ───────────────────────────────── */
  function startInlineEdit(target) {
    if (target.kind !== 'text') return;
    var el = target.el;
    editingNode = { el: el, id: target.id, original: texts[target.id].nodeValue };
    el.setAttribute('contenteditable', 'plaintext-only');
    el.classList.add('ve-editing');
    el.focus();
    var range = document.createRange();
    range.selectNodeContents(el);
    var sel = getSelection(); sel.removeAllRanges(); sel.addRange(range);
    el.addEventListener('input', onInlineInput);
    el.addEventListener('blur', onInlineBlur);
    el.addEventListener('keydown', onInlineKeys);
  }
  function onInlineInput() {
    if (!editingNode) return;
    post({ type: 'inline-input', payload: { id: editingNode.id, value: editingNode.el.textContent.trim() } });
  }
  function onInlineKeys(e) {
    if (e.key === 'Escape') { e.preventDefault(); cancelInlineEdit(); }
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); stopInlineEdit(true); }
    e.stopPropagation();
  }
  function onInlineBlur() { stopInlineEdit(true); }
  function cancelInlineEdit() {
    if (!editingNode) return;
    setText(editingNode.id, editingNode.original.trim());
    stopInlineEdit(false);
  }
  function stopInlineEdit(commit) {
    if (!editingNode) return;
    var en = editingNode; editingNode = null;
    en.el.removeEventListener('input', onInlineInput);
    en.el.removeEventListener('blur', onInlineBlur);
    en.el.removeEventListener('keydown', onInlineKeys);
    en.el.removeAttribute('contenteditable');
    en.el.classList.remove('ve-editing');
    if (commit) {
      var value = en.el.textContent.trim();
      if (value !== en.original.trim()) post({ type: 'edit', payload: { op: 'text', id: en.id, value: value, old: en.original.trim(), label: labelFor(en.el), section: secLabel(en.el) } });
    }
    refreshSelectionBox();
  }

  /* ── apply ops coming from the shell (also used for undo/redo) ── */
  function setText(id, value) {
    var node = texts[id];
    if (!node) return;
    // keep original surrounding whitespace
    var raw = node.nodeValue;
    var lead = raw.match(/^\s*/)[0];
    var trail = raw.match(/\s*$/)[0];
    node.nodeValue = lead + value + trail;
  }
  function applyOp(op) {
    if (!op || !op.op) return;
    if (op.op === 'text') setText(op.id, op.value);
    if (op.op === 'image-src') { var img = images[op.id]; if (img) { img.src = op.value; img.removeAttribute('srcset'); } }
    if (op.op === 'image-alt') { var i2 = images[op.id]; if (i2) i2.alt = op.value; }
    if (op.op === 'image-style') { var i3 = images[op.id]; if (i3) { if (op.value) i3.setAttribute('style', op.value); else i3.removeAttribute('style'); } }
    if (op.op === 'section-style') { var s = sections[op.id]; if (s) { if (op.value) s.setAttribute('style', op.value); else s.removeAttribute('style'); } }
    if (op.op === 'section-label') { var s2 = sections[op.id]; if (s2) { if (op.value) s2.setAttribute('data-editor-label', op.value); else s2.removeAttribute('data-editor-label'); } }
    refreshSelectionBox();
    if (selected && ((op.id === selected.id) || (selected.kind === 'image' && op.id === selected.id))) post({ type: 'selected', payload: describe(selected) });
  }

  /* ── event interception ────────────────────────────────── */
  document.addEventListener('click', function (e) {
    if (editingNode && editingNode.el.contains(e.target)) return; // typing
    e.preventDefault(); e.stopPropagation();
    var target = resolveAtPoint(e.clientX, e.clientY, e.target);
    if (!target) {
      select(null);
      return;
    }
    select(target);
  }, true);
  document.addEventListener('dblclick', function (e) {
    e.preventDefault(); e.stopPropagation();
    var target = resolveAtPoint(e.clientX, e.clientY, e.target);
    if (target && target.kind === 'text') { select(target); startInlineEdit(target); }
  }, true);
  document.addEventListener('mousemove', function (e) {
    if (editingNode) return;
    var target = resolveAtPoint(e.clientX, e.clientY, e.target);
    if (!target || (selected && target.el === selected.el)) { hideHover(); return; }
    place(hoverBox, hoverTag, target.el, (target.kind === 'item' || target.kind === 'item-image') ? labelFor(target.el) : labelFor(target.el));
  }, true);
  document.addEventListener('mouseleave', hideHover, true);
  document.addEventListener('keydown', function (e) {
    if (editingNode) return;
    // forward shortcuts to shell
    if ((e.ctrlKey || e.metaKey) && /^[zysp]$/i.test(e.key)) { e.preventDefault(); post({ type: 'shortcut', payload: { key: e.key.toLowerCase(), shift: e.shiftKey } }); }
    if (e.key === 'Escape') select(null);
  }, true);
  // block navigation & form submits entirely while editing
  document.addEventListener('submit', function (e) { e.preventDefault(); }, true);

  /* ── shell protocol ────────────────────────────────────── */
  function post(msg) { try { PARENT.postMessage(Object.assign({ ve: true, page: page }, msg), '*'); } catch (_) { } }
  addEventListener('message', function (e) {
    var msg = e.data || {};
    if (!msg.veShell) return;
    if (msg.type === 'apply') applyOp(msg.op);
    if (msg.type === 'select-id') {
      var el = null, kind = null;
      if (/^image-/.test(msg.id)) { el = images[msg.id]; kind = 'image'; }
      else if (/^text-/.test(msg.id)) { var n = texts[msg.id]; el = n && n.parentElement; kind = 'text'; }
      else if (/^sec-/.test(msg.id)) { el = sections[msg.id]; kind = 'section'; }
      else if (msg.id.indexOf(':') > -1) { el = document.querySelector('[data-ve-item="' + msg.id.replace(/"/g, '') + '"]'); kind = 'item'; }
      if (el) { el.scrollIntoView({ block: 'center', behavior: 'smooth' }); select({ kind: kind, id: msg.id, el: el }); }
    }
    if (msg.type === 'inline-edit' && selected && selected.kind === 'text') startInlineEdit(selected);
    if (msg.type === 'focal-mode') startFocalMode(msg.id);
    if (msg.type === 'request-layers') post({ type: 'layers', payload: buildLayers() });
    if (msg.type === 'deselect') select(null);
  });

  /* ── focal point picking ───────────────────────────────── */
  var focal = null;
  function startFocalMode(id) {
    var img = images[id];
    if (!img) return;
    focal = { id: id, img: img };
    img.classList.add('ve-focal');
    function pick(e) {
      e.preventDefault(); e.stopPropagation();
      var r = img.getBoundingClientRect();
      var x = Math.round(((e.clientX - r.left) / r.width) * 100);
      var y = Math.round(((e.clientY - r.top) / r.height) * 100);
      cleanup();
      post({ type: 'focal-picked', payload: { id: id, x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) } });
    }
    function cancel(e) { if (e.key === 'Escape') cleanup(); }
    function cleanup() {
      img.classList.remove('ve-focal');
      document.removeEventListener('click', pick, true);
      document.removeEventListener('keydown', cancel, true);
      focal = null;
    }
    document.removeEventListener('click', pick, true);
    document.addEventListener('click', pick, true);
    document.addEventListener('keydown', cancel, true);
  }

  /* ── boot ──────────────────────────────────────────────── */
  function boot() {
    mapAnnotations();
    loadRegistry(function () {
      // data-driven grids render on DOMContentLoaded; wait a tick (and retry once for slow renders)
      setTimeout(function () {
        mapCollections();
        post({ type: 'ready', payload: { page: page, layers: buildLayers(), textCount: Object.keys(texts).length, imageCount: Object.keys(images).length } });
      }, 350);
    });
    document.documentElement.classList.add('ve-active');
  }
  if (document.readyState === 'complete' || document.readyState === 'interactive') boot();
  else addEventListener('DOMContentLoaded', boot);
})();
