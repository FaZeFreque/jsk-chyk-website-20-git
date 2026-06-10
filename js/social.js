(function () {
  'use strict';

  function instagramEmbedUrl(link) {
    const match = link.match(/instagram\.com\/(p|reel|reels)\/([^/?#]+)/i);
    if (!match) return link;
    const type = match[1].toLowerCase() === 'p' ? 'p' : 'reel';
    return `https://www.instagram.com/${type}/${match[2]}/embed/`;
  }

  function renderInstagram(items) {
    const grid = document.getElementById('social-feed-grid');
    if (!grid) return;

    grid.innerHTML = items.map(item => `
      <article class="social-embed-card">
        <div class="instagram-mini-player">
          <iframe src="${instagramEmbedUrl(item.link)}" title="${item.title}" loading="lazy" scrolling="no" allowtransparency="true" allowfullscreen></iframe>
          <button class="instagram-interaction-cover" type="button"><span>Play / View post</span></button>
          <button class="instagram-release" type="button" aria-label="Return to page scrolling">Done</button>
        </div>
        <div class="social-embed-copy">
          <span class="social-feed-type">Instagram ${item.type}</span>
          <h3>${item.title}</h3>
          <a href="${item.link}" target="_blank" rel="noopener">Open on Instagram</a>
        </div>
      </article>
    `).join('');

    grid.querySelectorAll('.instagram-mini-player').forEach(player => {
      const cover = player.querySelector('.instagram-interaction-cover');
      const release = player.querySelector('.instagram-release');
      cover.addEventListener('click', function () { player.classList.add('is-interactive'); });
      release.addEventListener('click', function () { player.classList.remove('is-interactive'); });
      player.addEventListener('mouseleave', function () { player.classList.remove('is-interactive'); });
    });
  }

  function youtubeCard(item) {
    return `
      <article class="yt-card yt-mini-player-card" data-video-id="${item.videoId}">
        <button class="youtube-thumbnail" type="button" aria-label="Play ${item.title}">
          <img src="https://i.ytimg.com/vi/${item.videoId}/hqdefault.jpg" alt="${item.title}" loading="lazy">
          <span class="youtube-thumbnail-play" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m9 7 8 5-8 5V7Z"/></svg></span>
          <span class="youtube-thumbnail-duration">${item.duration}</span>
        </button>
        <div class="yt-card-body">
          <span class="yt-card-source">CHYK India</span>
          <h3>${item.title}</h3>
          <p>${item.description}</p>
          <a href="${item.link}" target="_blank" rel="noopener">Open on YouTube</a>
        </div>
      </article>`;
  }

  function renderYoutube(items) {
    const grid = document.getElementById('yt-grid');
    if (!grid) return;
    grid.innerHTML = items.map(youtubeCard).join('');

    grid.querySelectorAll('.youtube-thumbnail').forEach((button, index) => {
      button.addEventListener('click', function () {
        const item = items[index];
        if (window.location.protocol === 'file:') {
          window.open(item.link, '_blank', 'noopener');
          return;
        }
        const player = document.createElement('div');
        player.className = 'youtube-mini-player';
        player.innerHTML = `<iframe src="https://www.youtube.com/embed/${item.videoId}?autoplay=1&rel=0" title="${item.title}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`;
        this.replaceWith(player);
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    const social = (window.CHYK_DATA && window.CHYK_DATA.social) || { instagram: [], youtube: [] };
    renderInstagram(social.instagram);
    renderYoutube(social.youtube);
  });
})();
