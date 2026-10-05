// Small progressive enhancements. Content is ALWAYS visible without JS —
// nothing here ever hides an element (no opacity:0 pre-hide), so the page
// renders fine in screenshots, print, and with JS disabled.
(function () {
  // Highlight the nav link for the section currently in view.
  const links = document.querySelectorAll('.nav-links a[href^="#"]');
  const map = new Map();
  links.forEach((a) => {
    const t = document.querySelector(a.getAttribute('href'));
    if (t) map.set(t, a);
  });
  if ('IntersectionObserver' in window && map.size) {
    const nav = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        const a = map.get(e.target);
        if (!a) return;
        a.style.color = e.isIntersecting ? 'var(--accent)' : '';
      });
    }, { threshold: 0.35 });
    map.forEach((_a, t) => nav.observe(t));
  }

  // Append-only flavour line in the terminal panel (adds text, never hides it).
  const term = document.querySelector('.term-body');
  if (term) {
    window.setTimeout(() => {
      const line = document.createElement('p');
      line.className = 'tline c-dim';
      line.textContent = '[ok] session established — 127.0.0.1';
      term.appendChild(line);
    }, 1100);
  }
})();
