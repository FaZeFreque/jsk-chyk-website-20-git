(function () {
  'use strict';

  function speakerLabel(type) {
    if (type === 'gurudev') return 'Pujya Gurudev';
    if (type === 'acharya') return 'Acharya';
    if (type === 'guest') return 'Guest Speaker';
    return 'CHYK Member';
  }

  /* ── Featured Talks (3 items) ── */
  function renderFeaturedTalks() {
    const grid = document.getElementById('featured-talks-grid');
    const data = window.CHYK_DATA && window.CHYK_DATA.talks;
    if (!grid || !data) return;

    const featured = data.filter(t => t.featured).slice(0, 6);
    if (!featured.length) return;

    grid.innerHTML = featured.map(t => `
      <a class="talk-card" href="${t.link || 'talks-and-articles.html'}" target="_blank" rel="noopener">
        <div class="talk-card-img">
          <img src="${t.image || 'assets/placeholder.jpg'}" alt="${t.title}" loading="lazy">
          <span class="talk-type-badge">${t.type === 'video' ? 'Video' : 'Audio'}</span>
        </div>
        <div class="talk-card-body">
          <p class="talk-card-speaker-type">${speakerLabel(t.speakerType)}</p>
          <h3 class="talk-card-title">${t.title}</h3>
          <p class="talk-card-speaker">${t.speaker}</p>
          <p class="talk-card-desc">${t.shortDesc || ''}</p>
          <p class="talk-card-topic" style="font-size:0.78rem; color:rgba(255,255,255,0.3); margin-top:0.3rem;">${t.topic}</p>
        </div>
      </a>
    `).join('');
  }

  /* ── Featured Articles (3 items) ── */
  function renderFeaturedArticles() {
    const grid = document.getElementById('featured-articles-grid');
    const data = window.CHYK_DATA && window.CHYK_DATA.articles;
    if (!grid || !data) return;

    const featured = data.filter(a => a.featured).slice(0, 6);
    if (!featured.length) return;

    grid.innerHTML = featured.map(a => `
      <a class="article-card" href="article.html?id=${encodeURIComponent(a.id)}">
        <div class="article-card-img">
          <img src="${a.image || 'assets/placeholder.jpg'}" alt="${a.title}" loading="lazy">
        </div>
        <div class="article-card-body">
          <p class="article-card-cat">${a.category}</p>
          <h3 class="article-card-title">${a.title}</h3>
          <p class="article-card-desc">${a.shortDesc}</p>
          <div class="article-card-meta">
            <span>${a.author}</span>
            <span>${a.readTime} read</span>
          </div>
        </div>
      </a>
    `).join('');
  }

  function renderPublicationPreview() {
    const wrap = document.getElementById('publication-preview');
    const articles = (window.CHYK_DATA && window.CHYK_DATA.articles) || [];
    if (!wrap || !articles.length) return;
    const sources = ['Crossroads', 'Chinmaya Mission', 'Publications'];
    const udghoshIssues = (window.CHYK_DATA && window.CHYK_DATA.magazine && window.CHYK_DATA.magazine.udghosh) || [];
    wrap.innerHTML = sources.map(source => {
      const count = articles.filter(article => article.category === source).length;
      return `<a href="magazine.html#${source.toLowerCase().replace(/\s+/g, '-')}" class="publication-source-card">
        <span class="publication-source-count">${String(count).padStart(2, '0')}</span>
        <p>${source}</p>
        <h3>${source === 'Crossroads' ? 'Youth Essays' : source === 'Chinmaya Mission' ? 'Acharya Articles' : 'Selected Writings'}</h3>
        <span class="publication-source-link">Explore collection</span>
      </a>`;
    }).join('') + (udghoshIssues.length ? `<a href="magazine.html#chinmaya-udghosh" class="publication-source-card">
        <span class="publication-source-count">${String(udghoshIssues.length).padStart(2, '0')}</span>
        <p>Chinmaya Udghosh</p>
        <h3>The Annual Magazine</h3>
        <span class="publication-source-link">Browse issues</span>
      </a>` : '');
  }

  /* ── Art preview (6 items masonry) ── */
  function renderArtPreview() {
    const grid = document.getElementById('art-preview-grid');
    const data = window.CHYK_DATA && window.CHYK_DATA.art;
    if (!grid || !data) return;

    grid.innerHTML = data.slice(0, 6).map(a => `
      <div class="gallery-item">
        <img src="${a.image || 'assets/placeholder.jpg'}" alt="${a.title}" loading="lazy" style="cursor:pointer;"
          onclick="CHYK.openLightbox('${a.image || 'assets/placeholder.jpg'}', '${a.title} — ${a.artist}')">
      </div>
    `).join('');
  }

  /* ── Search ── */
  function initSearch() {
    const input = document.getElementById('hub-search');
    const clear = document.getElementById('hub-search-clear');
    if (!input) return;

    input.addEventListener('input', function () {
      const q = this.value.toLowerCase().trim();
      clear.style.opacity = q ? '1' : '0';

      if (!q) {
        renderFeaturedTalks();
        renderFeaturedArticles();
        return;
      }

      const talks = (window.CHYK_DATA && window.CHYK_DATA.talks) || [];
      const articles = (window.CHYK_DATA && window.CHYK_DATA.articles) || [];

      const talksGrid = document.getElementById('featured-talks-grid');
      if (talksGrid) {
        const tFiltered = talks.filter(t => t.title.toLowerCase().includes(q) || t.speaker.toLowerCase().includes(q) || t.topic.toLowerCase().includes(q));
        talksGrid.innerHTML = tFiltered.slice(0, 3).map(t => `
          <div class="talk-card">
            <div class="talk-card-img"><img src="${t.image || 'assets/placeholder.jpg'}" alt="${t.title}" loading="lazy"></div>
            <div class="talk-card-body">
              <h3 class="talk-card-title">${t.title}</h3>
              <p class="talk-card-speaker">${t.speaker}</p>
            </div>
          </div>
        `).join('') || '<p class="text-dim" style="padding:1rem;">No talks matched.</p>';
        if (typeof gsap !== 'undefined' && tFiltered.length) {
          gsap.from(talksGrid.querySelectorAll('.talk-card'), { opacity: 0, y: 16, duration: 0.35, stagger: 0.07, ease: 'power2.out' });
        }
      }

      const artGrid = document.getElementById('featured-articles-grid');
      if (artGrid) {
        const aFiltered = articles.filter(a => a.title.toLowerCase().includes(q) || a.category.toLowerCase().includes(q) || a.author.toLowerCase().includes(q));
        artGrid.innerHTML = aFiltered.slice(0, 3).map(a => `
          <div class="article-card">
            <div class="article-card-body" style="padding:1.25rem;">
              <p class="article-card-cat">${a.category}</p>
              <h3 class="article-card-title">${a.title}</h3>
              <p class="article-card-desc">${a.shortDesc}</p>
            </div>
          </div>
        `).join('') || '<p class="text-dim" style="padding:1rem;">No articles matched.</p>';
        if (typeof gsap !== 'undefined' && aFiltered.length) {
          gsap.from(artGrid.querySelectorAll('.article-card'), { opacity: 0, y: 16, duration: 0.35, stagger: 0.07, ease: 'power2.out' });
        }
      }
    });

    clear.addEventListener('click', function () {
      input.value = '';
      this.style.opacity = '0';
      renderFeaturedTalks();
      renderFeaturedArticles();
    });
  }

  /* ── Init ── */
  document.addEventListener('DOMContentLoaded', function () {
    renderFeaturedTalks();
    renderFeaturedArticles();
    renderPublicationPreview();
    renderArtPreview();
    initSearch();
  });

})();
