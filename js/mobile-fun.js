/* ==========================================================
   CHYK — MOBILE FUN LAYER (≤1024px only, desktop untouched)
   1. Gold scroll-progress bar
   2. Gold spark burst on taps (transform/opacity only — cheap)
   3. Gentle press-down feel on cards & buttons
   ========================================================== */
(function () {
  'use strict';
  if (window.innerWidth > 1024) return;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── 1. Scroll progress bar ── */
  var bar = document.createElement('div');
  bar.className = 'm-progress';
  document.body.appendChild(bar);

  var ticking = false;
  function updateBar() {
    var doc = document.documentElement;
    var max = doc.scrollHeight - window.innerHeight;
    var y = window.scrollY || doc.scrollTop || 0;
    bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(y / max, 1) : 0) + ')';
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(updateBar);
  }, { passive: true });
  updateBar();

  /* ── 2. Gold spark burst on taps ── */
  if (!reduceMotion && 'animate' in Element.prototype) {
    var lastBurst = 0;
    document.addEventListener('pointerdown', function (e) {
      var now = Date.now();
      if (now - lastBurst < 180) return;
      var target = e.target.closest(
        'a, button, .btn, .deck-card, .m-path-card, .m-journey-card, ' +
        '.gallery-item, .filter-tab, .event-card, .activity-card, ' +
        '.hub-card, .wing-card, .magazine-issue-card, .m-chip'
      );
      if (!target) return;
      lastBurst = now;
      burst(e.clientX, e.clientY);
    }, { passive: true });
  }

  function burst(x, y) {
    var count = 7;
    for (var i = 0; i < count; i++) {
      var p = document.createElement('i');
      p.className = 'm-spark';
      var size = 3 + Math.random() * 3.5;
      p.style.left = x + 'px';
      p.style.top = y + 'px';
      p.style.width = size + 'px';
      p.style.height = size + 'px';
      document.body.appendChild(p);

      var angle = (Math.PI * 2 * i) / count + Math.random() * 0.8;
      var dist = 26 + Math.random() * 34;
      var dx = Math.cos(angle) * dist;
      var dy = Math.sin(angle) * dist - 8; /* slight upward drift */

      p.animate([
        { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
        { transform: 'translate(calc(-50% + ' + dx + 'px), calc(-50% + ' + dy + 'px)) scale(0)', opacity: 0 }
      ], {
        duration: 480 + Math.random() * 240,
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)'
      }).onfinish = (function (el) { return function () { el.remove(); }; })(p);
    }
  }
})();
