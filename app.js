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
  // Boot splash (pixel/arcade loading screen). The .booting class comes from the
  // inline head script, so with JS disabled this never runs and nothing was ever
  // hidden. The bar is driven from JS so the counter and blocks stay in sync;
  // any key/click/scroll skips it, and a hard stop guarantees it can never trap
  // a visitor even if rAF stalls (background tab, throttling).
  const boot = document.getElementById('boot');
  if (boot && document.documentElement.classList.contains('booting')) {
    const bar = boot.querySelector('.boot-bar');
    const pctEl = boot.querySelector('.boot-pct');
    const msgEl = boot.querySelector('.boot-msg');
    const STAGES = [
      [0, 'LOADING MODULES'],
      [34, 'MOUNTING TOOLKIT'],
      [68, 'CALIBRATING TARGET'],
      [94, 'READY'],
    ];
    const BLOCKS = 20;
    const DURATION = 1300;
    for (let i = 0; i < BLOCKS; i++) bar.appendChild(document.createElement('i'));
    const cells = Array.prototype.slice.call(bar.children);

    let dismissed = false;
    let raf = 0;
    const end = () => {
      boot.remove();
      document.documentElement.classList.remove('booting', 'boot-out');
    };
    const finish = () => {
      if (dismissed) return;
      dismissed = true;
      window.cancelAnimationFrame(raf);
      window.clearTimeout(hardStop);
      pctEl.textContent = '100';
      msgEl.textContent = 'READY';
      cells.forEach((c) => c.classList.add('on'));
      document.documentElement.classList.add('boot-out');
      window.setTimeout(end, 320);
    };
    const hardStop = window.setTimeout(finish, 2600);

    const still = !!window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (still) {
      // Reduced motion: show the finished state, hold it briefly, clear it. No
      // counting, no stepping — the loading screen still appears, it just does
      // not move.
      cells.forEach((c) => c.classList.add('on'));
      pctEl.textContent = '100';
      msgEl.textContent = 'READY';
      window.setTimeout(finish, 650);
    } else {
      const started = performance.now();
      const tick = (now) => {
        const p = Math.min(1, (now - started) / DURATION);
        const value = Math.floor(p * 100);
        pctEl.textContent = String(value).padStart(3, '0');
        const filled = Math.round(p * BLOCKS);
        cells.forEach((c, i) => c.classList.toggle('on', i < filled));
        const stage = STAGES.filter((s) => value >= s[0]).pop();
        if (stage && msgEl.textContent !== stage[1]) msgEl.textContent = stage[1];
        if (p < 1) raf = window.requestAnimationFrame(tick);
        else finish();
      };
      raf = window.requestAnimationFrame(tick);
    }

    ['keydown', 'click', 'touchstart', 'wheel'].forEach((ev) =>
      window.addEventListener(ev, finish, { passive: true, once: true })
    );
  }
})();
