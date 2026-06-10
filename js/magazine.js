(function () {
  'use strict';

  let currentFilter = 'all';

  function renderPublications() {
    const grid = document.getElementById('publication-article-grid');
    const noResults = document.getElementById('publication-no-results');
    const articles = (window.CHYK_DATA && window.CHYK_DATA.articles) || [];
    if (!grid) return;
    const list = currentFilter === 'all' ? articles : articles.filter(article => article.category === currentFilter);
    noResults.style.display = list.length ? 'none' : 'block';
    grid.innerHTML = list.map((article, index) => `
      <a class="publication-article-card" href="article.html?id=${encodeURIComponent(article.id)}">
        <div class="publication-article-image"><img src="${article.image}" alt="${article.title}" loading="lazy"><span>${String(index + 1).padStart(2, '0')}</span></div>
        <div class="publication-article-body">
          <p class="publication-article-source">${article.category}${article.source && article.source !== article.category ? ` · ${article.source}` : ''}</p>
          <h3>${article.title}</h3>
          <p class="publication-article-desc">${article.shortDesc}</p>
          <div class="publication-article-meta"><span>${article.author}</span><span>${article.readTime} read</span></div>
          <div class="article-card-tags">${article.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}</div>
        </div>
        <span class="publication-read-link">Read full article</span>
      </a>`).join('');

    if (typeof gsap !== 'undefined' && list.length) {
      gsap.from(grid.querySelectorAll('.publication-article-card'), { opacity: 0, y: 24, duration: 0.45, stagger: 0.06, ease: 'power2.out' });
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    const hash = decodeURIComponent(window.location.hash.slice(1));
    const hashMap = { crossroads: 'Crossroads', 'chinmaya-mission': 'Chinmaya Mission', publications: 'Publications' };
    if (hashMap[hash]) currentFilter = hashMap[hash];

    document.querySelectorAll('#publication-source-nav .filter-tab').forEach(button => {
      button.classList.toggle('active', button.dataset.filter === currentFilter);
      button.addEventListener('click', function () {
        document.querySelectorAll('#publication-source-nav .filter-tab').forEach(item => item.classList.remove('active'));
        this.classList.add('active');
        currentFilter = this.dataset.filter;
        renderPublications();
      });
    });
    renderPublications();
  });
})();
