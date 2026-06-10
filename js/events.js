(function () {
  'use strict';

  let allEvents = [];
  let currentCatFilter = 'all';
  let currentCentreFilter = 'all';
  let isListView = false;

  const eventLabel = event => event.categoryLabel || event.category;
  const statusLabel = event => event.status === 'upcoming' ? 'Upcoming' : event.status === 'ongoing' ? 'Ongoing' : 'Milestone';

  function renderFeatured() {
    const wrap = document.getElementById('featured-event-wrap');
    const featured = allEvents.find(event => event.featured);
    if (!wrap || !featured) return;

    wrap.innerHTML = `
      <article class="featured-event-card gsap-reveal">
        <div class="featured-event-img">
          <img src="${featured.image}" alt="${featured.title}">
          <span class="featured-badge">${statusLabel(featured)}</span>
        </div>
        <div class="featured-event-body">
          <p class="featured-event-cat">${eventLabel(featured)}</p>
          <h2 class="featured-event-title">${featured.title}</h2>
          <div class="featured-event-meta"><span>${featured.date}</span><span>${featured.location}</span></div>
          <p class="featured-event-desc">${featured.longDesc}</p>
          <div class="featured-event-tags">${featured.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}</div>
          <button class="btn btn-primary magnetic-btn featured-detail-btn" data-id="${featured.id}">View Details</button>
        </div>
      </article>`;

    wrap.querySelector('.featured-detail-btn').addEventListener('click', function () {
      openEventModal(this.dataset.id, this);
    });
  }

  function renderGrid(list) {
    const grid = document.getElementById('events-grid');
    grid.innerHTML = list.map(event => `
      <article class="event-card" data-id="${event.id}">
        <div class="event-card-date"><span class="event-day">${event.day}</span><span class="event-month">${event.month}</span></div>
        <div class="event-card-img">
          <img src="${event.image}" alt="${event.title}" loading="lazy">
          <span class="event-status event-status-${event.status}">${statusLabel(event)}</span>
        </div>
        <div class="event-card-body">
          <p class="event-card-cat">${eventLabel(event)}</p>
          <h3 class="event-card-title">${event.title}</h3>
          <p class="event-card-date-text">${event.date}</p>
          <p class="event-card-loc">${event.location}</p>
          <p class="event-card-desc">${event.longDesc}</p>
          <button class="btn btn-outline event-detail-btn" data-id="${event.id}">Read More</button>
        </div>
      </article>`).join('');

    if (typeof gsap !== 'undefined') {
      gsap.from(grid.querySelectorAll('.event-card'), { opacity: 0, y: 24, duration: 0.4, stagger: 0.04, ease: 'power2.out' });
    }
    grid.querySelectorAll('.event-detail-btn').forEach(button => button.addEventListener('click', function () {
      openEventModal(this.dataset.id, this.closest('.event-card'));
    }));
  }

  function renderList(list) {
    const listEl = document.getElementById('events-list');
    listEl.innerHTML = list.map(event => `
      <article class="event-list-row">
        <div class="event-list-date"><span class="event-day">${event.day}</span><span class="event-month">${event.month}</span></div>
        <div class="event-list-body">
          <p class="event-card-cat">${eventLabel(event)} · ${statusLabel(event)}</p>
          <h3 class="event-list-title">${event.title}</h3>
          <p class="event-card-loc">${event.date} · ${event.location}</p>
        </div>
        <div class="event-list-cta"><button class="btn btn-outline event-detail-btn" data-id="${event.id}">Details</button></div>
      </article>`).join('');

    listEl.querySelectorAll('.event-detail-btn').forEach(button => button.addEventListener('click', function () {
      openEventModal(this.dataset.id, this.closest('.event-list-row'));
    }));
  }

  function getFiltered() {
    return allEvents.filter(event =>
      (currentCatFilter === 'all' || event.category === currentCatFilter) &&
      (currentCentreFilter === 'all' || event.centre === currentCentreFilter)
    );
  }

  function refresh() {
    const list = getFiltered();
    const grid = document.getElementById('events-grid');
    const listEl = document.getElementById('events-list');
    grid.style.display = isListView ? 'none' : 'grid';
    listEl.style.display = isListView ? 'flex' : 'none';
    document.getElementById('no-results').style.display = list.length ? 'none' : 'block';
    if (isListView) renderList(list); else renderGrid(list);
  }

  function populateLocations() {
    const select = document.getElementById('centre-filter');
    const locations = [...new Set(allEvents.map(event => event.centre))].sort();
    select.insertAdjacentHTML('beforeend', locations.map(location => `<option value="${location}">${location}</option>`).join(''));
  }

  function openEventModal(id, triggerElement) {
    const event = allEvents.find(item => item.id === id);
    if (!event) return;
    const image = document.getElementById('modal-event-img');
    image.src = event.image;
    image.alt = event.title;
    document.getElementById('modal-event-cat').textContent = `${eventLabel(event)} · ${statusLabel(event)}`;
    document.getElementById('modal-event-title').textContent = event.title;
    document.getElementById('modal-event-date').textContent = event.date;
    document.getElementById('modal-event-location').textContent = event.location;
    document.getElementById('modal-event-desc').textContent = event.longDesc;
    document.getElementById('modal-event-register').style.display = 'none';
    window.CHYK && window.CHYK.openModal('event-modal', triggerElement);
  }

  function initModalScroll() {
    const modalBody = document.querySelector('#event-modal .modal-body');
    modalBody.addEventListener('wheel', function (event) {
      if (this.scrollHeight <= this.clientHeight) return;
      event.preventDefault();
      event.stopPropagation();
      this.scrollTop += event.deltaY;
    }, { passive: false });
  }

  document.addEventListener('DOMContentLoaded', function () {
    allEvents = (window.CHYK_DATA && window.CHYK_DATA.events) || [];
    renderFeatured();
    populateLocations();
    initModalScroll();

    document.querySelectorAll('#event-filters .filter-tab').forEach(tab => tab.addEventListener('click', function () {
      document.querySelectorAll('#event-filters .filter-tab').forEach(item => item.classList.remove('active'));
      this.classList.add('active');
      currentCatFilter = this.dataset.filter;
      refresh();
    }));

    document.getElementById('centre-filter').addEventListener('change', function () {
      currentCentreFilter = this.value;
      refresh();
    });

    const viewGrid = document.getElementById('view-grid');
    const viewList = document.getElementById('view-list');
    viewGrid.addEventListener('click', function () {
      isListView = false; viewGrid.classList.add('active'); viewList.classList.remove('active'); refresh();
    });
    viewList.addEventListener('click', function () {
      isListView = true; viewList.classList.add('active'); viewGrid.classList.remove('active'); refresh();
    });
    refresh();
  });
})();
