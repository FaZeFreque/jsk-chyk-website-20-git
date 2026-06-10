(function () {
  'use strict';

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, character => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    })[character]);
  }

  function renderArticle() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const articles = (window.CHYK_DATA && window.CHYK_DATA.articles) || [];
    const content = (window.CHYK_DATA && window.CHYK_DATA.articleContent) || {};
    const article = articles.find(item => item.id === id);
    const body = article && content[article.id];

    if (!article || !body) {
      document.getElementById('article-reader').innerHTML = '<div class="article-reader-missing"><h1>Article not found.</h1><a href="magazine.html" class="btn btn-primary">Back to Publications</a></div>';
      return;
    }

    document.title = `${article.title} | CHYK`;
    document.getElementById('article-reader-source').textContent = `${article.category} / ${article.source}`;
    document.getElementById('article-reader-title').textContent = article.title;
    document.getElementById('article-reader-deck').textContent = article.shortDesc;
    document.getElementById('article-reader-author').textContent = article.author;
    document.getElementById('article-reader-time').textContent = `${article.readTime} read`;
    document.getElementById('article-reader-image').src = article.image;
    document.getElementById('article-reader-image').alt = article.title;
    document.getElementById('article-reader-body').innerHTML = body.map(block => {
      const text = escapeHtml(block.text);
      return block.type === 'heading' ? `<h2>${text}</h2>` : `<p>${text}</p>`;
    }).join('');
  }

  function initProgress() {
    const progress = document.getElementById('article-reader-progress');
    if (!progress) return;
    window.addEventListener('scroll', function () {
      const height = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = `${height > 0 ? Math.min(100, (window.scrollY / height) * 100) : 0}%`;
    }, { passive: true });
  }

  document.addEventListener('DOMContentLoaded', function () {
    renderArticle();
    initProgress();
    const backButton = document.getElementById('article-reader-desktop-back');
    if (backButton) {
      backButton.addEventListener('click', function () {
        if (document.referrer && new URL(document.referrer).origin === window.location.origin) {
          window.history.back();
        } else {
          window.location.href = 'magazine.html';
        }
      });
    }
  });
})();
