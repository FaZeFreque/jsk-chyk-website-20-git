/* Visual Editor staged-data overlay (edit mode only).
   Injected FIRST in <head> by the server when ?ve=1, so its DOMContentLoaded
   listener registers before any page renderer — staged (unsaved) collection
   edits replace CHYK_DATA before the grids render. */
(function () {
  'use strict';
  var staged;
  try { staged = JSON.parse(localStorage.getItem('ve-staged') || 'null'); } catch (_) { staged = null; }
  if (!staged || typeof staged !== 'object') return;
  var map = {
    activities: ['activities'], events: ['events'], talks: ['talks'], articles: ['articles'],
    udghoshArticles: ['udghoshArticles'], instagram: ['social', 'instagram'], youtube: ['social', 'youtube'],
    art: ['art'], udghosh: ['magazine', 'udghosh'], udghoshPosters: ['magazine', 'posters'],
    bookReviews: ['magazine', 'bookReviews'], shortReads: ['magazine', 'shortReads'],
    centres: ['centres'], leaders: ['leaders'], alumni: ['alumni'], testimonials: ['testimonials'],
    stats: ['stats'], homepageGoals: ['homepage', 'goals'], homepageMilestones: ['homepage', 'milestones']
  };
  document.addEventListener('DOMContentLoaded', function () {
    if (!window.CHYK_DATA) return;
    Object.keys(staged).forEach(function (cid) {
      var path = map[cid];
      if (!path) return;
      var target = window.CHYK_DATA;
      for (var i = 0; i < path.length - 1; i++) { target[path[i]] = target[path[i]] || {}; target = target[path[i]]; }
      target[path[path.length - 1]] = staged[cid];
    });
  });
})();
