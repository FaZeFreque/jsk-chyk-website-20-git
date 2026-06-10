(function () {
  'use strict';

  let allActivities = [];

  function renderActivities(list) {
    const grid = document.getElementById('activities-grid');
    const noResults = document.getElementById('no-results');
    const countEl = document.getElementById('activity-count');
    if (!grid) return;

    if (!list.length) {
      grid.innerHTML = '';
      noResults.style.display = 'block';
      if (countEl) countEl.textContent = '0 activities';
      return;
    }

    noResults.style.display = 'none';
    if (countEl) countEl.textContent = list.length + ' activit' + (list.length === 1 ? 'y' : 'ies');

    grid.innerHTML = list.map((activity, index) => `
      <article class="activity-card${activity.featured ? ' featured' : ''}" data-id="${activity.id}">
        <div class="activity-card-img">
          <img src="${activity.image || 'assets/placeholder.jpg'}" alt="${activity.title}" loading="lazy"${activity.imagePosition ? ` style="object-position:${activity.imagePosition}"` : ''}>
          ${activity.featured ? '<span class="featured-badge">Featured</span>' : ''}
        </div>
        <div class="activity-card-body">
          <div class="activity-card-number">${String(index + 1).padStart(2, '0')}</div>
          <p class="activity-card-cat">${activity.categoryLabel || activity.category}</p>
          <h3 class="activity-card-title">${activity.title}</h3>
          <p class="activity-card-desc">${activity.shortDesc}</p>
          <div class="activity-card-tags">
            ${(activity.tags || []).map(tag => `<span class="tag">${tag}</span>`).join('')}
          </div>
          <button class="btn btn-outline activity-learn-btn" data-id="${activity.id}">Read Full Story</button>
        </div>
      </article>
    `).join('');

    if (typeof gsap !== 'undefined') {
      gsap.from(grid.querySelectorAll('.activity-card'), {
        opacity: 0,
        y: 28,
        duration: 0.45,
        stagger: 0.06,
        ease: 'power2.out'
      });
    }

    grid.querySelectorAll('.activity-learn-btn').forEach(btn => {
      btn.addEventListener('click', function () {
        openActivityModal(this.dataset.id, this.closest('.activity-card'));
      });
    });

    if (window.matchMedia('(hover: hover)').matches && typeof gsap !== 'undefined') {
      grid.querySelectorAll('.activity-card').forEach(card => {
        card.addEventListener('mousemove', event => {
          const rect = card.getBoundingClientRect();
          const dx = (event.clientX - rect.left - rect.width / 2) / (rect.width / 2);
          const dy = (event.clientY - rect.top - rect.height / 2) / (rect.height / 2);
          gsap.to(card, { rotateX: -dy * 5, rotateY: dx * 5, transformPerspective: 900, duration: 0.35, ease: 'power2.out', overwrite: 'auto' });
        });
        card.addEventListener('mouseleave', () => {
          gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.55, ease: 'elastic.out(1, 0.5)', overwrite: 'auto' });
        });
      });
    }
  }

  function applyFilter(filter) {
    const filtered = filter === 'all'
      ? allActivities
      : allActivities.filter(activity => activity.category.toLowerCase() === filter);
    renderActivities(filtered);
  }

  function initFilters() {
    const tabs = document.querySelectorAll('#activity-filters .filter-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', function () {
        tabs.forEach(item => item.classList.remove('active'));
        this.classList.add('active');
        applyFilter(this.dataset.filter);
      });
    });
  }

  function initModalScroll() {
    const modalBody = document.querySelector('#activity-modal .modal-body');
    if (!modalBody) return;

    modalBody.addEventListener('wheel', function (event) {
      if (this.scrollHeight <= this.clientHeight) return;
      event.preventDefault();
      event.stopPropagation();
      this.scrollTop += event.deltaY;
    }, { passive: false });
  }

  function openActivityModal(id, triggerElement) {
    const activity = allActivities.find(item => item.id === id);
    if (!activity) return;

    document.getElementById('modal-activity-img').src = activity.image || 'assets/placeholder.jpg';
    document.getElementById('modal-activity-img').alt = activity.title;
    document.getElementById('modal-activity-img').style.objectPosition = activity.imagePosition || 'center';
    document.getElementById('modal-activity-cat').textContent = activity.categoryLabel || activity.category;
    document.getElementById('modal-activity-title').textContent = activity.title;
    document.getElementById('modal-activity-desc').textContent = activity.longDesc || activity.shortDesc;
    document.getElementById('modal-activity-who').textContent = activity.whoCanJoin || 'Open to all CHYK members.';

    window.CHYK && window.CHYK.openModal('activity-modal', triggerElement);
  }

  document.addEventListener('DOMContentLoaded', function () {
    allActivities = (window.CHYK_DATA && window.CHYK_DATA.activities) || [];
    initFilters();
    initModalScroll();
    renderActivities(allActivities);
  });
})();
