(function () {
  'use strict';

  let allTalks = [];
  let allArticles = [];
  let talksTypeFilter = 'all';
  let talksSpeakerFilter = 'all';
  let articlesCatFilter = 'all';
  let articlesSearchQuery = '';

  function speakerLabel(type) {
    if (type === 'gurudev') return 'Pujya Gurudev';
    if (type === 'acharya') return 'Acharya';
    if (type === 'guest') return 'Guest Speaker';
    return 'CHYK Member';
  }

  /* ── Render Talks ── */
  function renderTalks() {
    const grid = document.getElementById('talks-grid');
    const noResults = document.getElementById('talks-no-results');
    if (!grid) return;

    const list = allTalks.filter(t => {
      const typeMatch = talksTypeFilter === 'all' || t.type === talksTypeFilter;
      const speakerMatch = talksSpeakerFilter === 'all' || t.speakerType === talksSpeakerFilter;
      return typeMatch && speakerMatch;
    });

    if (!list.length) {
      grid.innerHTML = '';
      noResults.style.display = 'block';
      return;
    }
    noResults.style.display = 'none';

    grid.innerHTML = list.map(t => `
      <div class="talk-card" data-id="${t.id}" style="cursor:pointer;">
        <div class="talk-card-img">
          <img src="${t.image || 'assets/placeholder.jpg'}" alt="${t.title}" loading="lazy">
          <span class="talk-type-badge">${t.type === 'video' ? 'Video' : 'Audio'}</span>
          ${t.featured ? '<span class="featured-badge" style="top:auto;bottom:0.75rem;">Featured</span>' : ''}
        </div>
        <div class="talk-card-body">
          <div class="talk-speaker-chip ${t.speakerType}">${speakerLabel(t.speakerType)}</div>
          <h3 class="talk-card-title">${t.title}</h3>
          <p class="talk-card-speaker">${t.speaker}</p>
          <p class="talk-card-topic">${t.topic}</p>
          <p class="talk-card-desc">${t.shortDesc || ''}</p>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:0.75rem;">
            <span style="font-size:0.7rem; color:rgba(255,255,255,0.25); letter-spacing:1px;">${t.duration || t.readTime || ''}</span>
            <button class="btn btn-ghost talk-detail-btn" style="font-size:0.75rem; padding:0.4rem 0.9rem;" data-id="${t.id}">Open →</button>
          </div>
        </div>
      </div>
    `).join('');

    if (typeof gsap !== 'undefined') {
      gsap.from(grid.querySelectorAll('.talk-card'), {
        opacity: 0, y: 22, duration: 0.4, stagger: 0.06, ease: 'power2.out'
      });
    }

    grid.querySelectorAll('.talk-detail-btn').forEach(btn => {
      btn.addEventListener('click', e => { e.stopPropagation(); openTalkModal(btn.dataset.id); });
    });
    grid.querySelectorAll('.talk-card').forEach(card => {
      card.addEventListener('click', () => openTalkModal(card.dataset.id));
    });
  }

  /* ── Render Articles ── */
  function renderArticles() {
    const grid = document.getElementById('articles-grid');
    const noResults = document.getElementById('articles-no-results');
    if (!grid) return;

    const list = allArticles.filter(a => {
      const catMatch = articlesCatFilter === 'all' || a.category.toLowerCase().replace(/\s+/g, '-') === articlesCatFilter;
      const searchMatch = !articlesSearchQuery || a.title.toLowerCase().includes(articlesSearchQuery) || a.author.toLowerCase().includes(articlesSearchQuery) || a.shortDesc.toLowerCase().includes(articlesSearchQuery);
      return catMatch && searchMatch;
    });

    if (!list.length) {
      grid.innerHTML = '';
      noResults.style.display = 'block';
      return;
    }
    noResults.style.display = 'none';

    grid.innerHTML = list.map(a => `
      <a class="article-card${a.featured ? ' featured' : ''}" href="article.html?id=${encodeURIComponent(a.id)}">
        <div class="article-card-img">
          <img src="${a.image || 'assets/placeholder.jpg'}" alt="${a.title}" loading="lazy">
        </div>
        <div class="article-card-body">
          <p class="article-card-cat">${a.category}</p>
          <h3 class="article-card-title">${a.title}</h3>
          <p class="article-card-desc">${a.shortDesc}</p>
          <div class="article-card-tags">
            ${(a.tags || []).map(tag => `<span class="tag">${tag}</span>`).join('')}
          </div>
          <div class="article-card-meta">
            <span>${a.author}</span>
            <span>${a.readTime} read</span>
            <span>${a.source || a.category}</span>
          </div>
        </div>
      </a>
    `).join('');

    if (typeof gsap !== 'undefined') {
      gsap.from(grid.querySelectorAll('.article-card'), {
        opacity: 0, y: 22, duration: 0.4, stagger: 0.07, ease: 'power2.out'
      });
    }
  }

  /* ── Talk Modal ── */
  function openTalkModal(id) {
    const t = allTalks.find(x => x.id === id);
    if (!t) return;

    document.getElementById('modal-talk-img').src = t.image || 'assets/placeholder.jpg';
    document.getElementById('modal-talk-speaker-type').textContent = speakerLabel(t.speakerType);
    document.getElementById('modal-talk-title').textContent = t.title;
    document.getElementById('modal-talk-desc').textContent = t.shortDesc || '';
    document.getElementById('modal-talk-speaker').textContent = t.speaker;
    document.getElementById('modal-talk-topic').textContent = t.topic;
    document.getElementById('modal-talk-duration').textContent = t.duration || t.readTime || '';

    const linkEl = document.getElementById('modal-talk-link');
    if (t.link) {
      linkEl.href = t.link;
      linkEl.textContent = t.type === 'video' ? 'Watch on YouTube →' : 'Listen / Read →';
    } else {
      linkEl.href = '#';
      linkEl.textContent = 'Coming Soon';
    }

    window.CHYK && window.CHYK.openModal('talk-modal');
  }

  /* ── Init ── */
  document.addEventListener('DOMContentLoaded', function () {
    allTalks = (window.CHYK_DATA && window.CHYK_DATA.talks) || [];
    allArticles = (window.CHYK_DATA && window.CHYK_DATA.articles) || [];

    renderTalks();
    renderArticles();

    /* Talks filters */
    document.querySelectorAll('#talks-type-filter .filter-tab').forEach(tab => {
      tab.addEventListener('click', function () {
        document.querySelectorAll('#talks-type-filter .filter-tab').forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        talksTypeFilter = this.dataset.filter;
        renderTalks();
      });
    });

    const speakerFilter = document.getElementById('talks-speaker-filter');
    if (speakerFilter) {
      speakerFilter.addEventListener('change', function () {
        talksSpeakerFilter = this.value;
        renderTalks();
      });
    }

    /* Articles filters */
    document.querySelectorAll('#articles-cat-filter .filter-tab').forEach(tab => {
      tab.addEventListener('click', function () {
        document.querySelectorAll('#articles-cat-filter .filter-tab').forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        articlesCatFilter = this.dataset.filter;
        renderArticles();
      });
    });

    const articleSearch = document.getElementById('articles-search');
    if (articleSearch) {
      articleSearch.addEventListener('input', function () {
        articlesSearchQuery = this.value.toLowerCase().trim();
        renderArticles();
      });
    }
  });

})();
