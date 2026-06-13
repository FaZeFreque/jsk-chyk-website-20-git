(function () {
  'use strict';

  let currentFilter = 'all';

  function articleCard(article, index) {
    const tags = Array.isArray(article.tags) ? article.tags : [];
    return `
      <a class="publication-article-card" href="article.html?id=${encodeURIComponent(article.id)}">
        <div class="publication-article-image"><img src="${article.image}" alt="${article.title}" loading="lazy"><span>${String(index + 1).padStart(2, '0')}</span></div>
        <div class="publication-article-body">
          <p class="publication-article-source">${article.category}${article.source && article.source !== article.category ? ` / ${article.source}` : ''}</p>
          <h3>${article.title}</h3>
          <p class="publication-article-desc">${article.shortDesc || ''}</p>
          <div class="publication-article-meta"><span>${article.author || 'CHYK'}</span><span>${article.readTime || '5 min'} read</span></div>
          <div class="article-card-tags">${tags.map(tag => `<span class="tag">${tag}</span>`).join('')}</div>
        </div>
        <span class="publication-read-link">Read full article</span>
      </a>`;
  }

  function renderPublications() {
    const grid = document.getElementById('publication-article-grid');
    const noResults = document.getElementById('publication-no-results');
    const articles = (window.CHYK_DATA && window.CHYK_DATA.articles) || [];
    if (!grid) return;
    const list = currentFilter === 'all' ? articles : articles.filter(article => article.category === currentFilter);
    if (noResults) noResults.style.display = list.length ? 'none' : 'block';
    grid.innerHTML = list.map(articleCard).join('');
  }

  function renderUdghoshArticles() {
    const grid = document.getElementById('udghosh-article-grid');
    const empty = document.getElementById('udghosh-article-empty');
    const articles = ((window.CHYK_DATA && window.CHYK_DATA.udghoshArticles) || []).filter(article => article.published !== false);
    if (!grid) return;
    grid.innerHTML = articles.map(articleCard).join('');
    if (empty) empty.hidden = articles.length > 0;
  }

  function renderUdghoshIssues() {
    const grid = document.getElementById('udghosh-issue-grid');
    const issues = (window.CHYK_DATA && window.CHYK_DATA.magazine && window.CHYK_DATA.magazine.udghosh) || [];
    if (!grid) return;
    grid.innerHTML = issues.map(issue => {
      const hasRead = issue.readLink && issue.readLink !== '#';
      const hasDownload = issue.downloadLink && issue.downloadLink !== '#';
      const actions = hasRead || hasDownload
        ? `${hasRead ? `<a href="${issue.readLink}" target="_blank" rel="noopener" class="btn btn-primary">Read issue</a>` : ''}${hasDownload ? `<a href="${issue.downloadLink}" target="_blank" rel="noopener" class="btn btn-outline">Download</a>` : ''}`
        : '<span class="udghosh-issue-soon">Digital edition coming soon</span>';
      return `<article class="udghosh-issue-card${issue.featured ? ' is-featured' : ''}">
        <div class="udghosh-issue-cover"><img src="${issue.image}" alt="${issue.title} cover" loading="lazy"><span class="udghosh-issue-year">${issue.year}</span></div>
        <div class="udghosh-issue-body"><p class="udghosh-issue-kicker">${issue.issue} / Theme: ${issue.theme}</p><h3>${issue.title}</h3>${issue.description ? `<p class="udghosh-issue-desc">${issue.description}</p>` : ''}<div class="udghosh-issue-actions">${actions}</div></div>
      </article>`;
    }).join('');
  }

  function openPoster(poster) {
    const modal = document.getElementById('udghosh-poster-modal');
    const image = document.getElementById('udghosh-poster-modal-image');
    if (!modal || !image) return;
    image.src = poster.image;
    image.alt = poster.alt || poster.title;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.documentElement.classList.add('modal-open');
  }

  function renderPosters() {
    const feature = document.getElementById('udghosh-poster-feature');
    const grid = document.getElementById('udghosh-poster-grid');
    const posters = (window.CHYK_DATA && window.CHYK_DATA.magazine && window.CHYK_DATA.magazine.posters) || [];
    if (!posters.length) return;
    const featured = posters.find(poster => poster.featured) || posters[0];
    if (feature) feature.innerHTML = `<button type="button" class="udghosh-feature-poster" data-poster-id="${featured.id}"><picture>${featured.mobileImage ? `<source media="(max-width: 767px)" srcset="${featured.mobileImage}">` : ''}<img src="${featured.image}" alt="${featured.alt || featured.title}"></picture><span>Open artwork</span></button>`;
    if (grid) grid.innerHTML = posters.map(poster => `<button class="udghosh-poster-card" type="button" data-poster-id="${poster.id}"><img src="${poster.image}" alt="${poster.alt || poster.title}" loading="lazy"><span>${poster.title}</span></button>`).join('');
    document.querySelectorAll('[data-poster-id]').forEach(button => button.addEventListener('click', () => openPoster(posters.find(poster => poster.id === button.dataset.posterId))));
  }

  function initPosterModal() {
    const modal = document.getElementById('udghosh-poster-modal');
    if (!modal) return;
    const close = () => { modal.classList.remove('open'); modal.setAttribute('aria-hidden', 'true'); document.documentElement.classList.remove('modal-open'); };
    modal.querySelector('.udghosh-poster-close')?.addEventListener('click', close);
    modal.addEventListener('click', event => { if (event.target === modal) close(); });
    document.addEventListener('keydown', event => { if (event.key === 'Escape') close(); });
  }

  document.addEventListener('DOMContentLoaded', function () {
    const hash = decodeURIComponent(window.location.hash.slice(1));
    const hashMap = { 'youth-essays': 'Youth Essays', 'chinmaya-mission': 'Chinmaya Mission', publications: 'Publications' };
    if (hashMap[hash]) currentFilter = hashMap[hash];
    document.querySelectorAll('#publication-source-nav .filter-tab').forEach(button => {
      const active = button.dataset.filter === currentFilter;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
      button.addEventListener('click', function () {
        document.querySelectorAll('#publication-source-nav .filter-tab').forEach(item => { item.classList.remove('active'); item.setAttribute('aria-pressed', 'false'); });
        this.classList.add('active');
        this.setAttribute('aria-pressed', 'true');
        currentFilter = this.dataset.filter;
        renderPublications();
      });
    });
    renderPublications();
    renderUdghoshArticles();
    renderUdghoshIssues();
    renderPosters();
    initPosterModal();
  });
})();
