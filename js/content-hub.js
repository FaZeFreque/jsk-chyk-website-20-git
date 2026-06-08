(function () {
  'use strict';

  /* ── Featured Talks (3 items) ── */
  function renderFeaturedTalks() {
    const grid = document.getElementById('featured-talks-grid');
    const data = window.CHYK_DATA && window.CHYK_DATA.talks;
    if (!grid || !data) return;

    const featured = data.filter(t => t.featured).slice(0, 3);
    if (!featured.length) return;

    grid.innerHTML = featured.map(t => `
      <div class="talk-card">
        <div class="talk-card-img">
          <img src="${t.image || 'assets/placeholder.jpg'}" alt="${t.title}" loading="lazy">
          <span class="talk-type-badge">${t.type === 'video' ? '▶ Video' : '🎧 Audio'}</span>
        </div>
        <div class="talk-card-body">
          <p class="talk-card-speaker-type">${t.speakerType === 'gurudev' ? 'Pujya Gurudev' : t.speakerType === 'acharya' ? 'Acharya' : 'CHYK Member'}</p>
          <h3 class="talk-card-title">${t.title}</h3>
          <p class="talk-card-speaker">${t.speaker}</p>
          <p class="talk-card-topic" style="font-size:0.78rem; color:rgba(255,255,255,0.3); margin-top:0.3rem;">${t.topic}</p>
        </div>
      </div>
    `).join('');
  }

  /* ── Featured Articles (3 items) ── */
  function renderFeaturedArticles() {
    const grid = document.getElementById('featured-articles-grid');
    const data = window.CHYK_DATA && window.CHYK_DATA.articles;
    if (!grid || !data) return;

    const featured = data.filter(a => a.featured).slice(0, 3);
    if (!featured.length) return;

    grid.innerHTML = featured.map(a => `
      <div class="article-card">
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
      </div>
    `).join('');
  }

  /* ── Magazine preview (latest issue) ── */
  function renderMagazinePreview() {
    const wrap = document.getElementById('magazine-preview');
    const data = window.CHYK_DATA && window.CHYK_DATA.magazine;
    if (!wrap || !data || !data.udghosh || !data.udghosh.length) return;

    const latest = data.udghosh[0];
    wrap.innerHTML = `
      <div class="magazine-latest-card gsap-reveal">
        <div class="magazine-latest-cover">
          <img src="${latest.cover || 'assets/placeholder.jpg'}" alt="${latest.title}">
        </div>
        <div class="magazine-latest-body">
          <p class="magazine-issue-label">Issue ${latest.issue} · ${latest.year}</p>
          <h3 class="magazine-latest-title">${latest.title}</h3>
          <p class="magazine-latest-theme">Theme: <span class="text-gold">"${latest.theme}"</span></p>
          <p class="magazine-latest-desc">${latest.description}</p>
          <div class="flex gap-sm mt-sm">
            ${latest.link ? `<a href="${latest.link}" class="btn btn-primary magnetic-btn" target="_blank" rel="noopener">Read Online →</a>` : ''}
            <a href="magazine.html" class="btn btn-outline">All Issues</a>
          </div>
        </div>
      </div>
    `;
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
    renderMagazinePreview();
    renderArtPreview();
    initSearch();
  });

})();
