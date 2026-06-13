/* Visual Editor registry: maps data-driven (repeatable) content on each page
   to its Content Manager collection. `container` is the element the page
   renderer fills; `item` is one card inside it. Items map to the collection
   array BY INDEX unless `idAttr`/`idFromHref` provides a stable id. */
window.VE_REGISTRY = {
  'activities.html': [
    { container: '#activities-grid', item: '.activity-card', collection: 'activities', label: 'Activity' }
  ],
  'events.html': [
    { container: '#events-grid', item: '.event-card', collection: 'events', label: 'Event' },
    { container: '#events-list', item: '.event-list-row', collection: 'events', label: 'Event' }
  ],
  'talks-and-articles.html': [
    { container: '#talks-grid', item: '.talk-card', collection: 'talks', label: 'Talk' },
    { container: '#articles-grid', item: '.article-card', collection: 'articles', label: 'Article', idFromHref: true }
  ],
  'magazine.html': [
    { container: '#publication-article-grid', item: '.publication-article-card', collection: 'articles', label: 'Article', idFromHref: true },
    { container: '#udghosh-article-grid', item: '.publication-article-card', collection: 'udghoshArticles', label: 'Udghosh Article', idFromHref: true },
    { container: '#udghosh-issue-grid', item: '.udghosh-issue-card', collection: 'udghosh', label: 'Udghosh Issue' },
    { container: '#udghosh-poster-grid', item: '.udghosh-poster-card', collection: 'udghoshPosters', label: 'Poster' }
  ],
  'social.html': [
    { container: '#social-feed-grid', item: '.social-embed-card', collection: 'instagram', label: 'Instagram Post' },
    { container: '#yt-grid', item: '.yt-card', collection: 'youtube', label: 'YouTube Video' }
  ],
  'art.html': [
    { container: '#art-gallery', item: '.gallery-item', collection: 'art', label: 'Artwork' }
  ],
  'leaders.html': [
    { container: '#leaders-grid', item: '.profile-card', collection: 'leaders', label: 'Leader' }
  ],
  'alumni.html': [
    { container: '#alumni-grid', item: '.profile-card', collection: 'alumni', label: 'Alumni' }
  ],
  'wings.html': [
    { container: '#wings-grid', item: '.wing-card', collection: 'centres', label: 'Centre' }
  ],
  'about.html': [
    { container: '#testimonials-grid', item: '.testimonial-card', collection: 'testimonials', label: 'Testimonial' }
  ],
  'content-hub.html': [
    { container: '#featured-talks-grid', item: '.talk-card', collection: 'talks', label: 'Talk (featured)' },
    { container: '#featured-articles-grid', item: '.article-card', collection: 'articles', label: 'Article (featured)', idFromHref: true }
  ]
};
