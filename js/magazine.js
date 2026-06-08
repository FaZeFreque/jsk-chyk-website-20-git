(function () {
  'use strict';

  /* ── Latest issue feature ── */
  function renderLatestIssue() {
    const wrap = document.getElementById('latest-issue-feature');
    const data = window.CHYK_DATA && window.CHYK_DATA.magazine;
    if (!wrap || !data || !data.udghosh || !data.udghosh.length) return;

    const latest = data.udghosh[0];
    wrap.innerHTML = `
      <div class="magazine-latest-card gsap-reveal">
        <div class="magazine-latest-cover">
          <img src="${latest.cover || 'assets/placeholder.jpg'}" alt="${latest.title}">
          <div class="magazine-cover-badge">Latest Issue</div>
        </div>
        <div class="magazine-latest-body">
          <p class="magazine-issue-label">Issue ${latest.issue} · ${latest.year}</p>
          <h2 class="magazine-latest-title">${latest.title}</h2>
          <p class="magazine-latest-theme">Theme: <span class="text-gold">"${latest.theme}"</span></p>
          <div class="gold-line"></div>
          <p class="magazine-latest-desc">${latest.description}</p>
          ${latest.highlights ? `
          <div class="magazine-highlights">
            <p style="font-size:0.7rem; font-weight:700; letter-spacing:2px; text-transform:uppercase; color:rgba(255,255,255,0.3); margin-bottom:0.75rem;">In This Issue</p>
            ${latest.highlights.map(h => `<p style="font-size:0.83rem; color:rgba(255,255,255,0.4); padding:0.35rem 0; border-bottom:1px solid rgba(255,255,255,0.05);">✦ ${h}</p>`).join('')}
          </div>` : ''}
          <div class="flex gap-sm mt-md" style="flex-wrap:wrap;">
            ${latest.link ? `<a href="${latest.link}" class="btn btn-primary magnetic-btn" target="_blank" rel="noopener">Read Online →</a>` : ''}
            ${latest.downloadLink ? `<a href="${latest.downloadLink}" class="btn btn-outline" download>Download PDF</a>` : '<a href="contact.html" class="btn btn-outline">Get a Copy</a>'}
          </div>
        </div>
      </div>
    `;
  }

  /* ── Issues archive grid ── */
  function renderIssues() {
    const grid = document.getElementById('magazine-issues-grid');
    const data = window.CHYK_DATA && window.CHYK_DATA.magazine;
    if (!grid || !data || !data.udghosh) return;

    const all = data.udghosh;

    grid.innerHTML = all.map((issue, i) => `
      <div class="magazine-issue-card${i === 0 ? ' is-latest' : ''}">
        <div class="magazine-issue-cover">
          <img src="${issue.cover || 'assets/placeholder.jpg'}" alt="${issue.title}" loading="${i < 3 ? 'eager' : 'lazy'}">
          ${i === 0 ? '<span class="featured-badge">Latest</span>' : ''}
        </div>
        <div class="magazine-issue-meta">
          <p class="magazine-issue-label">Issue ${issue.issue}</p>
          <h3 class="magazine-issue-title">${issue.title}</h3>
          <p class="magazine-issue-theme text-gold">"${issue.theme}"</p>
          <p class="magazine-issue-year">${issue.year}</p>
          <div class="flex gap-xs mt-sm">
            ${issue.link ? `<a href="${issue.link}" class="btn btn-outline" style="font-size:0.76rem; padding:0.5rem 1rem;" target="_blank" rel="noopener">Read →</a>` : ''}
          </div>
        </div>
      </div>
    `).join('');

    if (typeof gsap !== 'undefined') {
      gsap.from(grid.querySelectorAll('.magazine-issue-card'), {
        scrollTrigger: { trigger: grid, start: 'top 80%' },
        opacity: 0, y: 24, duration: 0.45, stagger: 0.08, ease: 'power2.out'
      });
    }
  }

  /* ── Book reviews ── */
  function renderBookReviews() {
    const grid = document.getElementById('book-reviews-grid');
    const data = window.CHYK_DATA && window.CHYK_DATA.magazine;
    if (!grid || !data || !data.bookReviews) return;

    grid.innerHTML = data.bookReviews.map(b => `
      <div class="book-review-card">
        <div class="book-cover">
          <img src="${b.cover || 'assets/placeholder.jpg'}" alt="${b.book}" loading="lazy">
        </div>
        <div class="book-body">
          <p class="book-meta">${b.genre || 'Spiritual'}</p>
          <h3 class="book-title">${b.book}</h3>
          <p class="book-author">by ${b.author}</p>
          <div style="margin:0.75rem 0; display:flex; gap:0.2rem;">
            ${Array.from({ length: 5 }, (_, i) => `<span style="color:${i < (b.rating || 4) ? 'var(--gold)' : 'rgba(255,255,255,0.1)'}; font-size:0.9rem;">★</span>`).join('')}
          </div>
          <p class="book-desc">${b.review}</p>
          <p class="book-reviewer">Reviewed by <span class="text-gold">${b.reviewer}</span></p>
        </div>
      </div>
    `).join('');
  }

  /* ── Short reads ── */
  function renderShortReads() {
    const list = document.getElementById('short-reads-list');
    const data = window.CHYK_DATA && window.CHYK_DATA.magazine;
    if (!list || !data || !data.shortReads) return;

    list.innerHTML = data.shortReads.map(s => `
      <div class="short-read-row">
        <div class="short-read-body">
          <p class="short-read-cat">${s.category}</p>
          <h3 class="short-read-title">${s.title}</h3>
          <p class="short-read-excerpt">${s.excerpt}</p>
        </div>
        <div class="short-read-meta">
          <p class="short-read-author">${s.author}</p>
          <p class="short-read-time">${s.readTime}</p>
        </div>
      </div>
    `).join('');
  }

  /* ── Init ── */
  document.addEventListener('DOMContentLoaded', function () {
    renderLatestIssue();
    renderIssues();
    renderBookReviews();
    renderShortReads();
  });

})();
