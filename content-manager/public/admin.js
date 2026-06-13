'use strict';

const state = { bootstrap: null, view: 'collections', collection: null, page: null, dirty: false, uploadTarget: null };
const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];

async function request(url, options = {}) {
  const response = await fetch(url, { headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }, ...options });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || `Request failed (${response.status})`);
  return body;
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, character => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' })[character]);
}

function mediaUrl(value) {
  return /^(https?:|data:|\/)/i.test(String(value || '')) ? value : `/${value}`;
}

function allowDiscard() {
  return !state.dirty || confirm('You have unsaved changes. Discard them and continue?');
}

function toast(message, error = false) {
  const element = $('#toast');
  element.textContent = message;
  element.className = `toast show${error ? ' error' : ''}`;
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => { element.className = 'toast'; }, 2600);
}

function setDirty(dirty = true) {
  state.dirty = dirty;
  $('#save-button').disabled = !dirty || state.view === 'backups';
  $('#save-state').textContent = dirty ? 'Unsaved changes' : 'Saved';
}

function displayName(item, index) {
  return item.title || item.name || item.label || item.id || `Item ${index + 1}`;
}

function itemSubtitle(item) {
  return item.categoryLabel || item.category || item.role || item.typeLabel || item.type || item.year || item.id || '';
}

function itemImage(item) {
  return item.image || item.photo || item.thumbnail || '';
}

function slug(value) {
  return String(value || 'new-item').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function fieldInput(field, value, itemIndex) {
  const key = field.key;
  const type = /imageFit$/i.test(key)
    ? 'imageFit'
    : /imagePosition$/i.test(key)
      ? 'imagePosition'
      : field.type;
  const id = `field-${itemIndex}-${key}`;
  const common = `data-index="${itemIndex}" data-key="${escapeHtml(key)}" id="${id}"`;
  if (type === 'boolean') return `<div class="field field-check"><input type="checkbox" ${common} ${value ? 'checked' : ''}><label for="${id}">${escapeHtml(field.label)}</label></div>`;
  if (type === 'blocks') {
    const blocks = Array.isArray(value) ? value : [];
    return `<div class="field wide"><label>${escapeHtml(field.label)}</label><div class="blocks" data-blocks-index="${itemIndex}">${blocks.map((block, blockIndex) => blockRow(block, itemIndex, blockIndex)).join('')}</div><button class="button add-block" type="button" data-index="${itemIndex}">Add Paragraph</button></div>`;
  }
  if (type === 'image') {
    return `<div class="field wide"><label for="${id}">${escapeHtml(field.label)}</label><div class="image-control"><input ${common} value="${escapeHtml(value)}"><button class="button upload-button" type="button" data-index="${itemIndex}" data-key="${escapeHtml(key)}">Upload</button></div>${value ? `<img class="image-preview" src="${escapeHtml(mediaUrl(value))}" alt="">` : ''}</div>`;
  }
  if (type === 'imageFit') {
    return `<div class="field"><label for="${id}">${escapeHtml(field.label)}</label><select ${common}><option value="cover" ${value === 'cover' ? 'selected' : ''}>Fill area (crop)</option><option value="contain" ${value === 'contain' ? 'selected' : ''}>Show full image</option></select></div>`;
  }
  if (type === 'imagePosition') {
    const positions = [['center top','Top'],['center 25%','Upper centre'],['center center','Centre'],['center 75%','Lower centre'],['center bottom','Bottom'],['left center','Left'],['right center','Right']];
    return `<div class="field"><label for="${id}">${escapeHtml(field.label)}</label><select ${common}>${positions.map(([position, label]) => `<option value="${position}" ${value === position ? 'selected' : ''}>${label}</option>`).join('')}</select></div>`;
  }
  if (type === 'textarea') return `<div class="field wide"><label for="${id}">${escapeHtml(field.label)}</label><textarea ${common}>${escapeHtml(value)}</textarea></div>`;
  if (type === 'list') return `<div class="field"><label for="${id}">${escapeHtml(field.label)} <small>(comma separated)</small></label><input ${common} data-kind="list" value="${escapeHtml((value || []).join(', '))}"></div>`;
  if (type === 'number') return `<div class="field"><label for="${id}">${escapeHtml(field.label)}</label><input type="number" ${common} value="${escapeHtml(value)}"></div>`;
  if (type === 'url') return `<div class="field"><label for="${id}">${escapeHtml(field.label)}</label><input type="url" ${common} value="${escapeHtml(value)}"></div>`;
  return `<div class="field"><label for="${id}">${escapeHtml(field.label)}</label><input ${common} value="${escapeHtml(value)}"></div>`;
}

function blockRow(block, itemIndex, blockIndex) {
  return `<div class="block-row" data-block-index="${blockIndex}"><select data-block-type><option value="paragraph" ${block.type === 'paragraph' ? 'selected' : ''}>Paragraph</option><option value="heading" ${block.type === 'heading' ? 'selected' : ''}>Heading</option></select><textarea data-block-text>${escapeHtml(block.text)}</textarea><button class="button danger remove-block" type="button">Remove</button></div>`;
}

function itemCard(item, index) {
  const image = itemImage(item);
  return `<article class="item-card" data-index="${index}" draggable="true"><button class="item-head" type="button"><span class="drag" title="Drag to reorder">&#8942;&#8942;</span>${image ? `<img class="item-thumb" src="${escapeHtml(mediaUrl(image))}" alt="">` : '<span class="item-thumb"></span>'}<span class="item-summary"><strong>${escapeHtml(displayName(item, index))}</strong><span>${escapeHtml(itemSubtitle(item))}</span></span><span class="chevron">&#9662;</span></button><div class="item-body"><div class="field-grid">${state.collection.fields.map(field => fieldInput(field, item[field.key], index)).join('')}</div><div class="item-actions"><button class="button move-up" type="button">Move Up</button><button class="button move-down" type="button">Move Down</button><button class="button duplicate-item" type="button">Duplicate</button><button class="button danger delete-item" type="button">Delete</button></div></div></article>`;
}

function renderItems() {
  $('#item-list').innerHTML = state.collection.items.map(itemCard).join('');
  bindItemEvents();
  filterItems();
}

function updateItemFromInput(input) {
  const item = state.collection.items[Number(input.dataset.index)];
  const key = input.dataset.key;
  if (!item || !key) return;
  let value = input.type === 'checkbox' ? input.checked : input.value;
  if (input.dataset.kind === 'list') value = value.split(',').map(entry => entry.trim()).filter(Boolean);
  if (input.type === 'number') value = value === '' ? '' : Number(value);
  item[key] = value;
  setDirty();
}

function syncBlocks(itemIndex, container) {
  state.collection.items[itemIndex].blocks = [...container.querySelectorAll('.block-row')].map(row => ({ type: row.querySelector('[data-block-type]').value, text: row.querySelector('[data-block-text]').value }));
  setDirty();
}

function moveItem(from, to) {
  if (to < 0 || to >= state.collection.items.length) return;
  const [item] = state.collection.items.splice(from, 1);
  state.collection.items.splice(to, 0, item);
  setDirty(); renderItems();
}

function bindItemEvents() {
  $$('.item-head').forEach(button => button.addEventListener('click', () => button.closest('.item-card').classList.toggle('open')));
  $$('#item-list input,#item-list textarea,#item-list select').forEach(input => {
    if (input.hasAttribute('data-block-type') || input.hasAttribute('data-block-text')) return;
    input.addEventListener('input', () => updateItemFromInput(input));
    input.addEventListener('change', () => updateItemFromInput(input));
  });
  $$('.move-up').forEach(button => button.addEventListener('click', () => { const index = Number(button.closest('.item-card').dataset.index); moveItem(index, index - 1); }));
  $$('.move-down').forEach(button => button.addEventListener('click', () => { const index = Number(button.closest('.item-card').dataset.index); moveItem(index, index + 1); }));
  $$('.duplicate-item').forEach(button => button.addEventListener('click', () => {
    const index = Number(button.closest('.item-card').dataset.index);
    const copy = JSON.parse(JSON.stringify(state.collection.items[index]));
    if (copy.id) copy.id = `${slug(copy.id)}-copy`;
    if (copy.title) copy.title += ' (Copy)';
    state.collection.items.splice(index + 1, 0, copy); setDirty(); renderItems();
  }));
  $$('.delete-item').forEach(button => button.addEventListener('click', () => {
    const index = Number(button.closest('.item-card').dataset.index);
    if (!confirm(`Delete “${displayName(state.collection.items[index], index)}”?`)) return;
    state.collection.items.splice(index, 1); setDirty(); renderItems();
  }));
  $$('.upload-button').forEach(button => button.addEventListener('click', () => {
    state.uploadTarget = { mode:'collection', index:Number(button.dataset.index), key:button.dataset.key };
    $('#upload-input').click();
  }));
  $$('.add-block').forEach(button => button.addEventListener('click', () => {
    const index = Number(button.dataset.index); state.collection.items[index].blocks = state.collection.items[index].blocks || []; state.collection.items[index].blocks.push({ type:'paragraph', text:'' }); setDirty(); renderItems();
  }));
  $$('.remove-block').forEach(button => button.addEventListener('click', () => {
    const container = button.closest('.blocks'); button.closest('.block-row').remove(); syncBlocks(Number(container.dataset.blocksIndex), container);
  }));
  $$('[data-block-type],[data-block-text]').forEach(input => input.addEventListener('input', () => { const container = input.closest('.blocks'); syncBlocks(Number(container.dataset.blocksIndex), container); }));
  let dragged = null;
  $$('.item-card').forEach(card => {
    card.addEventListener('dragstart', () => { dragged = Number(card.dataset.index); });
    card.addEventListener('dragover', event => event.preventDefault());
    card.addEventListener('drop', event => { event.preventDefault(); const target = Number(card.dataset.index); if (dragged !== null && dragged !== target) moveItem(dragged, target); });
  });
}

function filterItems() {
  const query = $('#item-search').value.toLowerCase().trim();
  $$('.item-card').forEach(card => card.classList.toggle('hidden-by-search', query && !card.textContent.toLowerCase().includes(query)));
}

async function loadCollection(id) {
  $('#item-list').innerHTML = '<div class="notice">Loading content...</div>';
  state.collection = await request(`/api/collection/${encodeURIComponent(id)}`);
  $('#preview-link').href = `/${state.collection.preview}`;
  renderValidation(state.collection.validation);
  renderItems(); setDirty(false);
}

function renderValidation(validation) {
  const box = $('#validation-box');
  const messages = [...(validation?.errors || []), ...(validation?.warnings || [])];
  box.hidden = !messages.length;
  box.innerHTML = messages.length ? `<strong>Please review</strong>${messages.map(message => `<span>${escapeHtml(message)}</span>`).join('')}` : '';
}

function newItem() {
  const item = {};
  state.collection.fields.forEach(field => { item[field.key] = field.type === 'boolean' ? false : field.type === 'list' || field.type === 'blocks' ? [] : field.type === 'number' ? 0 : ''; });
  if ('id' in item) item.id = `new-item-${Date.now()}`;
  state.collection.items.unshift(item); setDirty(); renderItems();
  $('.item-card')?.classList.add('open');
}

async function saveCollection() {
  const result = await request(`/api/collection/${encodeURIComponent(state.collection.id)}`, { method:'PUT', body:JSON.stringify({ items:state.collection.items }) });
  renderValidation(result.validation); setDirty(false); toast('Content saved. Backup created.');
}

async function loadPage(file) {
  $('#page-fields').innerHTML = '<div class="notice">Loading page fields...</div>';
  state.page = await request(`/api/page?file=${encodeURIComponent(file)}`);
  $('#page-preview-link').href = `/${file}`;
  if (state.view === 'pages') $('#view-title').textContent = file === 'index.html' ? 'Homepage Content' : 'Page Copy & Images';
  const sections = [...new Set(state.page.fields.map(field => field.section || 'Page Content'))];
  $('#page-section-select').innerHTML = `<option value="all">All sections</option>${sections.map(section => `<option value="${escapeHtml(section)}">${escapeHtml(section)}</option>`).join('')}`;
  renderPageFields(); setDirty(false);
}

function pageLabel(file) {
  if (file === 'index.html') return 'Homepage';
  return file.replace('.html', '').replace(/-/g, ' ').replace(/\b\w/g, letter => letter.toUpperCase());
}

function pageField(field) {
  const section = escapeHtml(field.section || 'Page Content');
  if (field.type === 'image') return `<div class="page-field" data-id="${field.id}" data-section="${section}"><span class="page-field-type">Image<small>${section}</small></span><div><input data-page-value value="${escapeHtml(field.value)}"><img class="image-preview" src="${escapeHtml(mediaUrl(field.value))}" alt=""></div><button class="button page-upload" type="button" data-id="${field.id}">Upload</button></div>`;
  return `<div class="page-field" data-id="${field.id}" data-section="${section}"><span class="page-field-type">Text<small>${section}</small></span><textarea data-page-value>${escapeHtml(field.value)}</textarea><span></span></div>`;
}

function renderPageFields() {
  $('#page-fields').innerHTML = state.page.fields.map(pageField).join('');
  $$('[data-page-value]').forEach(input => input.addEventListener('input', () => { const field = state.page.fields.find(item => item.id === input.closest('.page-field').dataset.id); field.value = input.value; setDirty(); }));
  $$('.page-upload').forEach(button => button.addEventListener('click', () => { state.uploadTarget = { mode:'page', id:button.dataset.id }; $('#upload-input').click(); }));
  filterPageFields();
}

function filterPageFields() {
  const query = $('#page-search').value.toLowerCase().trim();
  const section = $('#page-section-select').value;
  $$('.page-field').forEach(field => {
    const wrongSection = section && section !== 'all' && field.dataset.section !== section;
    const missesSearch = query && !field.textContent.toLowerCase().includes(query);
    field.classList.toggle('hidden-by-search', wrongSection || missesSearch);
  });
}

async function savePage() {
  await request('/api/page', { method:'PUT', body:JSON.stringify({ file:state.page.file, fields:state.page.fields }) });
  setDirty(false); toast('Page saved. Backup created.');
}

async function uploadFile(file) {
  const reader = new FileReader();
  const data = await new Promise((resolve, reject) => { reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(file); });
  const folder = state.view === 'collections' ? state.collection.id : state.page.file.replace('.html', '');
  const result = await request('/api/upload', { method:'POST', body:JSON.stringify({ name:file.name, folder, data }) });
  if (state.uploadTarget.mode === 'collection') {
    state.collection.items[state.uploadTarget.index][state.uploadTarget.key] = result.path; renderItems();
  } else {
    const field = state.page.fields.find(item => item.id === state.uploadTarget.id); field.value = result.path; renderPageFields();
  }
  setDirty(); toast(result.optimized ? 'File optimized and uploaded. Save to apply it.' : 'File uploaded locally. Save to apply it.');
}

async function loadBackups() {
  const data = await request('/api/backups');
  $('#backup-list').innerHTML = data.items.length ? data.items.map(item => `<section class="backup-item"><strong>${escapeHtml(item.name)}</strong>${item.files.map(file => `<div class="backup-file"><span>${escapeHtml(file)}</span><button class="button restore-file" type="button" data-backup="${escapeHtml(item.name)}" data-file="${escapeHtml(file)}">Restore</button></div>`).join('')}</section>`).join('') : '<div class="notice">No backups yet. Your first save will create one.</div>';
  $$('.restore-file').forEach(button => button.addEventListener('click', async () => {
    if (!confirm(`Restore ${button.dataset.file} from ${button.dataset.backup}? The current version will also be backed up first.`)) return;
    try { await request('/api/restore', { method:'POST', body:JSON.stringify({ backup:button.dataset.backup, file:button.dataset.file }) }); toast('Backup restored.'); await loadBackups(); }
    catch (error) { toast(error.message, true); }
  }));
}

function switchView(view) {
  if (view !== state.view && !allowDiscard()) return;
  if (view !== state.view) setDirty(false);
  state.view = view;
  $$('.nav-button').forEach(button => button.classList.toggle('active', button.dataset.view === view));
  $$('.view').forEach(element => element.classList.toggle('active', element.id === `${view}-view`));
  $('#view-title').textContent = view === 'collections' ? 'Collections' : view === 'pages' ? 'Page Copy & Images' : 'Backups';
  $('#save-button').hidden = view === 'backups';
  $('#save-button').disabled = !state.dirty;
  if (view === 'backups') loadBackups().catch(error => toast(error.message, true));
}

async function init() {
  state.bootstrap = await request('/api/bootstrap');
  $('#collection-select').innerHTML = state.bootstrap.collections.map(item => `<option value="${item.id}">${escapeHtml(item.label)}</option>`).join('');
  const pages = [...state.bootstrap.pages].sort((a, b) => a === 'index.html' ? -1 : b === 'index.html' ? 1 : a.localeCompare(b));
  $('#page-select').innerHTML = pages.map(file => `<option value="${file}">${escapeHtml(pageLabel(file))}</option>`).join('');
  $$('.nav-button[data-view]').forEach(button => button.addEventListener('click', () => switchView(button.dataset.view)));
  $('#collection-select').addEventListener('change', event => { if (!allowDiscard()) { event.target.value = state.collection.id; return; } loadCollection(event.target.value).catch(error => toast(error.message, true)); });
  $('#page-select').addEventListener('change', event => { if (!allowDiscard()) { event.target.value = state.page.file; return; } loadPage(event.target.value).catch(error => toast(error.message, true)); });
  $('#item-search').addEventListener('input', filterItems); $('#page-search').addEventListener('input', filterPageFields); $('#page-section-select').addEventListener('change', filterPageFields);
  $('#add-item').addEventListener('click', newItem);
  $('#save-button').addEventListener('click', async () => { try { $('#save-state').textContent = 'Saving...'; state.view === 'collections' ? await saveCollection() : await savePage(); } catch (error) { $('#save-state').textContent = 'Save failed'; toast(error.message, true); } });
  $('#upload-input').addEventListener('change', async event => { const file = event.target.files[0]; event.target.value = ''; if (!file) return; try { await uploadFile(file); } catch (error) { toast(error.message, true); } });
  window.addEventListener('beforeunload', event => { if (!state.dirty) return; event.preventDefault(); event.returnValue = ''; });
  await loadCollection(state.bootstrap.collections[0].id);
  await loadPage('index.html');
}

init().catch(error => toast(error.message, true));
