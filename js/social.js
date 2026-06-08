(function () {
  'use strict';

  /* ── Instagram feed placeholder grid ── */
  function renderSocialFeed() {
    const grid = document.getElementById('social-feed-grid');
    if (!grid) return;

    const placeholders = Array.from({ length: 9 }, (_, i) => ({
      id: i,
      caption: ['Camp reflections 🙏', 'Morning aarati at the ashram ✨', 'Himalayan yatra chronicles 🏔️', 'Vedanta in everyday life', 'Youth empowerment in action 💪', 'Udghosh cultural night 🎭', 'Study class highlights 📚', 'CHYK family forever ❤️', 'Find Yourself. #CHYK'][i],
      likes: [234, 567, 891, 342, 678, 445, 213, 789, 523][i],
      bg: ['#1a1a2e', '#16213e', '#0f3460', '#1a1a2e', '#16213e', '#0f3460', '#1a1a2e', '#16213e', '#0f3460'][i]
    }));

    grid.innerHTML = placeholders.map(p => `
      <div class="social-feed-item" style="background:${p.bg}; border:1px solid rgba(255,255,255,0.06); border-radius:12px; overflow:hidden; aspect-ratio:1; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:1rem; text-align:center; cursor:pointer; position:relative;">
        <div style="font-size:0.65rem; color:rgba(255,255,255,0.15); position:absolute; top:0.75rem; left:0.75rem;">@chyk_official</div>
        <p style="font-size:0.78rem; color:rgba(255,255,255,0.5); line-height:1.5; margin-bottom:0.75rem;">${p.caption}</p>
        <div style="font-size:0.65rem; color:var(--gold); opacity:0.6;">❤️ ${p.likes}</div>
        <div class="social-feed-hover" style="position:absolute; inset:0; background:rgba(201,162,74,0.08); opacity:0; transition:opacity 0.25s; display:flex; align-items:center; justify-content:center; border-radius:12px;">
          <span style="font-size:1.25rem;">↗</span>
        </div>
      </div>
    `).join('');

    grid.querySelectorAll('.social-feed-item').forEach(item => {
      item.addEventListener('mouseenter', () => {
        item.querySelector('.social-feed-hover').style.opacity = '1';
      });
      item.addEventListener('mouseleave', () => {
        item.querySelector('.social-feed-hover').style.opacity = '0';
      });
    });

    if (typeof gsap !== 'undefined') {
      gsap.from(grid.querySelectorAll('.social-feed-item'), {
        scrollTrigger: { trigger: grid, start: 'top 80%' },
        opacity: 0, scale: 0.9, duration: 0.4, stagger: 0.05, ease: 'power2.out'
      });
    }
  }

  /* ── YouTube placeholder grid ── */
  function renderYTGrid() {
    const grid = document.getElementById('yt-grid');
    if (!grid) return;

    const videos = [
      { title: 'Vedanta for Youth — Swami Chinmayananda', duration: '42:15', year: '2023' },
      { title: 'CHYK CTC Documentary — Sivananda Ashram', duration: '18:34', year: '2023' },
      { title: 'Udghosh 2023 — Cultural Night Highlights', duration: '24:07', year: '2023' },
      { title: 'Himalayan Yatra 2022 — Full Journey', duration: '31:22', year: '2022' },
      { title: 'Who Am I? — A Talk by Swami Mitrananda', duration: '55:41', year: '2023' },
      { title: 'CHYK National Convention 2023 Recap', duration: '12:08', year: '2023' }
    ];

    grid.innerHTML = videos.map(v => `
      <div class="yt-video-card">
        <div class="yt-thumb" style="aspect-ratio:16/9; background:#111; border-radius:12px; display:flex; align-items:center; justify-content:center; cursor:pointer; position:relative; overflow:hidden; border:1px solid rgba(255,255,255,0.06);">
          <div style="font-size:2.5rem; opacity:0.15;">▶</div>
          <div class="yt-duration-badge" style="position:absolute; bottom:0.6rem; right:0.6rem; background:rgba(0,0,0,0.8); font-size:0.65rem; padding:0.2rem 0.5rem; border-radius:4px; color:rgba(255,255,255,0.7);">${v.duration}</div>
        </div>
        <div class="yt-video-meta" style="margin-top:0.75rem;">
          <h4 style="font-size:0.85rem; font-family:var(--font-display); font-weight:700; line-height:1.4; color:rgba(255,255,255,0.8);">${v.title}</h4>
          <p style="font-size:0.7rem; color:rgba(255,255,255,0.25); margin-top:0.3rem;">CHYK India · ${v.year}</p>
        </div>
      </div>
    `).join('');

    if (typeof gsap !== 'undefined') {
      gsap.from(grid.querySelectorAll('.yt-video-card'), {
        scrollTrigger: { trigger: grid, start: 'top 80%' },
        opacity: 0, y: 20, duration: 0.4, stagger: 0.07, ease: 'power2.out'
      });
    }
  }

  /* ── Platform cards hover ── */
  function initPlatformCards() {
    document.querySelectorAll('.social-platform-card').forEach(card => {
      card.addEventListener('mouseenter', function () {
        if (typeof gsap !== 'undefined') {
          gsap.to(this.querySelector('.social-platform-icon'), { scale: 1.1, duration: 0.3, ease: 'back.out(1.7)' });
        }
      });
      card.addEventListener('mouseleave', function () {
        if (typeof gsap !== 'undefined') {
          gsap.to(this.querySelector('.social-platform-icon'), { scale: 1, duration: 0.3 });
        }
      });
    });
  }

  /* ── Init ── */
  document.addEventListener('DOMContentLoaded', function () {
    renderSocialFeed();
    renderYTGrid();
    initPlatformCards();
  });

})();
