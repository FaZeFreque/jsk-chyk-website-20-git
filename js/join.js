(function () {
  'use strict';

  let currentStep = 1;
  const totalSteps = 3;

  /* ── Step navigation ── */
  function goToStep(step) {
    document.querySelectorAll('.form-step').forEach(s => s.classList.remove('active'));
    const target = document.querySelector(`.form-step[data-step="${step}"]`);
    if (target) {
      target.classList.add('active');

      if (typeof gsap !== 'undefined') {
        gsap.fromTo(target, { opacity: 0, x: step > currentStep ? 32 : -32 }, { opacity: 1, x: 0, duration: 0.4, ease: 'power2.out' });
      }
    }

    document.querySelectorAll('.step-item').forEach(item => {
      const n = parseInt(item.dataset.step);
      item.classList.toggle('active', n === step);
      item.classList.toggle('completed', n < step);
    });

    currentStep = step;
    window.scrollTo({ top: document.getElementById('form-section').offsetTop - 100, behavior: 'smooth' });
  }

  /* ── Validation ── */
  function validateStep(step) {
    const stepEl = document.querySelector(`.form-step[data-step="${step}"]`);
    if (!stepEl) return true;
    let valid = true;

    stepEl.querySelectorAll('[required]').forEach(field => {
      const group = field.closest('.form-group');
      if (!field.value.trim() || (field.type === 'checkbox' && !field.checked)) {
        if (group) group.classList.add('error');
        valid = false;
      } else {
        if (group) group.classList.remove('error');
      }

      if (field.type === 'email' && field.value.trim()) {
        const valid_email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value);
        if (!valid_email) {
          if (group) group.classList.add('error');
          valid = false;
        }
      }
    });

    return valid;
  }

  /* ── Testimonials ── */
  function renderTestimonials() {
    const grid = document.getElementById('testimonials-grid');
    const data = window.CHYK_DATA && window.CHYK_DATA.testimonials;
    if (!grid || !data) return;

    grid.innerHTML = data.slice(0, 3).map(t => `
      <div class="testimonial-card">
        <p class="testimonial-quote">"${t.quote}"</p>
        <div class="testimonial-author">
          <div class="testimonial-avatar">${t.initials}</div>
          <div>
            <p class="testimonial-name">${t.name}</p>
            <p class="testimonial-role">${t.role}</p>
          </div>
        </div>
      </div>
    `).join('');
  }

  /* ── Interest chips keyboard a11y ── */
  function initInterestChips() {
    document.querySelectorAll('.interest-chip input[type="checkbox"]').forEach(cb => {
      cb.addEventListener('change', function () {
        this.closest('.interest-chip').classList.toggle('checked', this.checked);
      });
    });
  }

  /* ── Accordion ── */
  function initAccordion() {
    document.querySelectorAll('.accordion-trigger').forEach(trigger => {
      trigger.addEventListener('click', function () {
        const item = this.closest('.accordion-item');
        const body = item.querySelector('.accordion-body');
        const isOpen = item.classList.contains('open');

        document.querySelectorAll('.accordion-item.open').forEach(open => {
          open.classList.remove('open');
          open.querySelector('.accordion-body').style.maxHeight = '0';
        });

        if (!isOpen) {
          item.classList.add('open');
          body.style.maxHeight = body.scrollHeight + 'px';
        }
      });
    });
  }

  /* ── Form submit ── */
  function initForm() {
    const form = document.getElementById('join-form');
    if (!form) return;

    document.getElementById('step1-next') && document.getElementById('step1-next').addEventListener('click', function () {
      if (validateStep(1)) goToStep(2);
    });

    document.getElementById('step2-back') && document.getElementById('step2-back').addEventListener('click', () => goToStep(1));
    document.getElementById('step2-next') && document.getElementById('step2-next').addEventListener('click', function () {
      if (validateStep(2)) goToStep(3);
    });

    document.getElementById('step3-back') && document.getElementById('step3-back').addEventListener('click', () => goToStep(2));

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validateStep(3)) return;

      const submitBtn = document.getElementById('step3-submit');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting…';
      }

      /* Simulate async submit */
      setTimeout(function () {
        goToStep(4);
        if (submitBtn) submitBtn.disabled = false;
      }, 1200);
    });

    /* Clear errors on input */
    form.querySelectorAll('.form-input, .form-select, .form-textarea').forEach(el => {
      el.addEventListener('input', function () {
        this.closest('.form-group') && this.closest('.form-group').classList.remove('error');
      });
    });
  }

  /* ── Init ── */
  document.addEventListener('DOMContentLoaded', function () {
    renderTestimonials();
    initInterestChips();
    initAccordion();
    initForm();
  });

})();
