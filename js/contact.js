(function () {
  'use strict';

  /* ── Contact type radio highlight ── */
  function initContactTypeSelector() {
    document.querySelectorAll('.contact-type-option input[type="radio"]').forEach(radio => {
      radio.addEventListener('change', function () {
        document.querySelectorAll('.contact-type-option').forEach(opt => opt.classList.remove('selected'));
        this.closest('.contact-type-option').classList.add('selected');
      });
    });
  }

  /* ── Form validation and submit ── */
  function initContactForm() {
    const form = document.getElementById('contact-form');
    const submitBtn = document.getElementById('contact-submit');
    const submitText = document.getElementById('contact-submit-text');
    const successMsg = document.getElementById('contact-success');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      let valid = true;
      form.querySelectorAll('[required]').forEach(field => {
        const group = field.closest('.form-group');
        const isEmpty = field.type === 'checkbox' ? !field.checked : !field.value.trim();
        const isInvalidEmail = field.type === 'email' && field.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value);

        if (isEmpty || isInvalidEmail) {
          if (group) group.classList.add('error');
          valid = false;
        } else {
          if (group) group.classList.remove('error');
        }
      });

      /* Check radio group */
      const radios = form.querySelectorAll('input[name="enquiryType"]');
      const anyChecked = Array.from(radios).some(r => r.checked);
      if (!anyChecked) {
        valid = false;
        const radioGroup = form.querySelector('.contact-type-grid');
        if (radioGroup) {
          radioGroup.style.outline = '1px solid rgba(255,80,80,0.4)';
          radioGroup.style.borderRadius = '12px';
        }
      } else {
        const radioGroup = form.querySelector('.contact-type-grid');
        if (radioGroup) radioGroup.style.outline = '';
      }

      if (!valid) return;

      if (submitBtn) submitBtn.disabled = true;
      if (submitText) submitText.textContent = 'Sending…';

      /* Simulate async */
      setTimeout(function () {
        form.style.display = 'none';
        if (successMsg) successMsg.style.display = 'block';
        if (typeof gsap !== 'undefined') {
          gsap.from(successMsg, { opacity: 0, y: 16, duration: 0.4, ease: 'power2.out' });
        }
      }, 1200);
    });

    /* Clear errors on input */
    form.querySelectorAll('.form-input, .form-select, .form-textarea').forEach(el => {
      el.addEventListener('input', function () {
        this.closest('.form-group') && this.closest('.form-group').classList.remove('error');
      });
    });
  }

  /* ── Centres list ── */
  function initCentres() {
    const grid = document.getElementById('centres-grid');
    const searchInput = document.getElementById('centre-search');
    const stateFilter = document.getElementById('centre-state-filter');
    if (!grid) return;

    const centres = [
      { name: 'CHYK Mumbai Central', city: 'Mumbai', state: 'Maharashtra', address: 'Sandeepany Sadhanalaya, Powai', email: 'mumbai@chyk.in' },
      { name: 'CHYK Delhi NCR', city: 'New Delhi', state: 'Delhi', address: 'Chinmaya Mission Delhi, Lodhi Estate', email: 'delhi@chyk.in' },
      { name: 'CHYK Bengaluru', city: 'Bengaluru', state: 'Karnataka', address: 'Chinmaya Mission Bengaluru, Malleshwaram', email: 'bengaluru@chyk.in' },
      { name: 'CHYK Chennai', city: 'Chennai', state: 'Tamil Nadu', address: 'Chinmaya Tapesvaram, Adyar', email: 'chennai@chyk.in' },
      { name: 'CHYK Pune', city: 'Pune', state: 'Maharashtra', address: 'Chinmaya Niketan, Kothrud', email: 'pune@chyk.in' },
      { name: 'CHYK Ahmedabad', city: 'Ahmedabad', state: 'Gujarat', address: 'Chinmaya Mission Ahmedabad, SG Road', email: 'ahmedabad@chyk.in' },
      { name: 'CHYK Jaipur', city: 'Jaipur', state: 'Rajasthan', address: 'Chinmaya Mission Jaipur, C-Scheme', email: 'jaipur@chyk.in' },
      { name: 'CHYK USA – East Coast', city: 'New York', state: 'International', address: 'Chinmaya Mission West, NY', email: 'usa@chyk.in' }
    ];

    let searchQ = '';
    let stateQ = 'all';

    function renderCentres() {
      const filtered = centres.filter(c => {
        const searchMatch = !searchQ || c.name.toLowerCase().includes(searchQ) || c.city.toLowerCase().includes(searchQ);
        const stateMatch = stateQ === 'all' || c.state === stateQ;
        return searchMatch && stateMatch;
      });

      grid.innerHTML = filtered.length ? filtered.map(c => `
        <div class="centre-card">
          <div class="centre-card-header">
            <h4 class="centre-name">${c.name}</h4>
            <span class="centre-state-chip">${c.state}</span>
          </div>
          <p class="centre-city">📍 ${c.city}</p>
          <p class="centre-address">${c.address}</p>
          <a href="mailto:${c.email}" class="contact-link" style="font-size:0.78rem; margin-top:0.5rem; display:inline-block;">${c.email}</a>
        </div>
      `).join('') : '<p class="text-dim" style="padding:1.5rem; grid-column:1/-1;">No centres matched your search.</p>';
    }

    if (searchInput) {
      searchInput.addEventListener('input', function () {
        searchQ = this.value.toLowerCase().trim();
        renderCentres();
      });
    }

    if (stateFilter) {
      stateFilter.addEventListener('change', function () {
        stateQ = this.value;
        renderCentres();
      });
    }

    renderCentres();
  }

  /* ── Init ── */
  document.addEventListener('DOMContentLoaded', function () {
    initContactTypeSelector();
    initContactForm();
    initCentres();
  });

})();
