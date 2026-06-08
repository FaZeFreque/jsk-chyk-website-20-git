(function () {
  'use strict';

  /* ── Testimonials ── */
  function renderTestimonials() {
    const grid = document.getElementById('testimonials-grid');
    const data = window.CHYK_DATA && window.CHYK_DATA.testimonials;
    if (!grid || !data) return;

    grid.innerHTML = data.map(t => `
      <div class="testimonial-card">
        <p class="testimonial-quote">"${t.quote}"</p>
        <div class="testimonial-author">
          <div class="testimonial-avatar">${t.initials}</div>
          <div>
            <p class="testimonial-name">${t.name}</p>
            <p class="testimonial-role">${t.role}${t.year ? ' · ' + t.year : ''}</p>
          </div>
        </div>
      </div>
    `).join('');
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

  /* ── Org-tree stagger reveal ── */
  function animateOrgTree() {
    const tree = document.querySelector('.org-tree');
    if (!tree || typeof gsap === 'undefined') return;

    gsap.from('.org-node', {
      scrollTrigger: { trigger: tree, start: 'top 75%' },
      opacity: 0,
      y: 24,
      duration: 0.5,
      stagger: 0.08,
      ease: 'power2.out'
    });
  }

  /* ── Age cards hover tilt ── */
  function initAgeCardTilt() {
    document.querySelectorAll('.age-card').forEach(card => {
      card.addEventListener('mousemove', function (e) {
        const rect = card.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const rx = (e.clientY - cy) / (rect.height / 2) * -6;
        const ry = (e.clientX - cx) / (rect.width / 2) * 6;
        card.style.transform = `perspective(600px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(4px)`;
      });
      card.addEventListener('mouseleave', function () {
        card.style.transform = '';
      });
    });
  }

  /* ── Init ── */
  document.addEventListener('DOMContentLoaded', function () {
    renderTestimonials();
    initAccordion();
    animateOrgTree();
    initAgeCardTilt();
  });

})();
