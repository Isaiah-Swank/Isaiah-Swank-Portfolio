// Theme preference & toggle
(function () {
  const KEY = 'prefers-theme';
  const root = document.documentElement;
  const saved = localStorage.getItem(KEY);
  if (saved === 'light' || saved === 'dark') {
    root.dataset.theme = saved;
  } else {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    root.dataset.theme = mq.matches ? 'dark' : 'light';
  }
  const btn = document.getElementById('themeToggle');
  if (btn) {
    btn.addEventListener('click', () => {
      const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
      root.dataset.theme = next;
      localStorage.setItem(KEY, next);
    });
  }
})();

// Active-nav link highlighting as sections enter the viewport
(function () {
  const links = Array.from(document.querySelectorAll('nav a[href^="#"]'));
  if (!links.length) return;

  const map = new Map(
    links
      .map(a => [a, document.querySelector(a.getAttribute('href'))])
      .filter(([_, section]) => section)
      .map(([a, section]) => [section, a])
  );

  const setActive = (el) => {
    links.forEach(a => {
      const isActive = a === el;
      a.classList.toggle('is-active', isActive);
      if (isActive) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const link = map.get(entry.target);
      if (!link) return;
      if (entry.isIntersecting) setActive(link);
    });
  }, {
    rootMargin: '-50% 0px -40% 0px',
    threshold: [0, 1]
  });

  map.forEach((_, section) => observer.observe(section));
})();

// Ensure correct active link on initial load or hash nav
document.addEventListener('DOMContentLoaded', () => {
  const links = Array.from(document.querySelectorAll('nav a[href^="#"]'));
  if (!links.length) return;
  const targetHash = (location.hash && document.querySelector(location.hash)) ? location.hash : '#about';
  const initial = document.querySelector(`nav a[href="${targetHash}"]`);
  if (!initial) return;
  links.forEach(a => {
    const isActive = a === initial;
    a.classList.toggle('is-active', isActive);
    if (isActive) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
});

// Keep scroll anchor offset in sync with header height
(function(){
  const root = document.documentElement;
  const header = document.querySelector('header');
  if(!header) return;
  const setHeaderOffset = () => {
    const px = (header.offsetHeight + 16) + 'px'; // small cushion
    root.style.setProperty('--header-h', px);
  };
  window.addEventListener('load', setHeaderOffset);
  window.addEventListener('resize', setHeaderOffset);
})();

// Scroll progress bar
(function(){
  const bar = document.querySelector('.scroll-progress');
  if (!bar) return;
  const onScroll = () => {
    const doc = document.documentElement;
    const scrollTop = doc.scrollTop || document.body.scrollTop;
    const max = (doc.scrollHeight - doc.clientHeight) || 1;
    const pct = Math.min(100, Math.max(0, (scrollTop / max) * 100));
    bar.style.setProperty('--scroll', pct + '%');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();
})();

// Back-to-top button
(function(){
  const btn = document.getElementById('backToTop');
  if (!btn) return;
  const showAt = 600;
  const onScroll = () => {
    const y = window.scrollY || document.documentElement.scrollTop;
    btn.classList.toggle('is-visible', y > showAt);
  };
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

// Project filters
(function(){
  const container = document.querySelector('.filters');
  const cards = Array.from(document.querySelectorAll('#projects .project'));
  if (!container || !cards.length) return;

  const FILTERS = {
    all: () => true,
    web: tags => /javascript|firebase|html5canvas|css|uiux|soa/.test(tags),
    python: tags => /python|pygame|bfs/.test(tags),
    unity: tags => /unity|csharp|physics/.test(tags),
    uiux: tags => /uiux/.test(tags),
    algorithms: tags => /bfs/.test(tags),
    games: tags => /gamedesign|gameui|animation|pygame|unity/.test(tags)
  };

  const chips = Array.from(container.querySelectorAll('.chip'));
  const applyFilter = (name) => {
    const fn = FILTERS[name] || FILTERS.all;
    cards.forEach(card => {
      const tags = (card.getAttribute('data-tags') || '').toLowerCase();
      card.style.display = fn(tags) ? '' : 'none';
    });
    chips.forEach(c => c.classList.toggle('is-active', c.dataset.filter === name));
  };

  container.addEventListener('click', (e) => {
    const btn = e.target.closest('.chip');
    if (!btn) return;
    applyFilter(btn.dataset.filter);
  });

  // default
  applyFilter('all');
})();

// Lite YouTube embeds
(function(){
  const LITES = Array.from(document.querySelectorAll('.yt-lite'));
  if (!LITES.length) return;

  LITES.forEach(el => {
    const id = el.getAttribute('data-id');
    if (!id) return;
    // Set thumbnail
    el.style.backgroundImage = `url(https://i.ytimg.com/vi/${id}/hqdefault.jpg)`;
    // On click, swap in the real iframe
    el.addEventListener('click', () => {
      const iframe = document.createElement('iframe');
      iframe.width = '560';
      iframe.height = '315';
      iframe.title = el.getAttribute('aria-label') || 'YouTube video';
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      iframe.allowFullscreen = true;
      iframe.src = `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`;
      iframe.loading = 'lazy';
      iframe.style.width = '100%';
      iframe.style.height = '100%';
      iframe.style.border = '0';
      el.replaceWith(iframe);
    }, { once: true });
  });
})();
