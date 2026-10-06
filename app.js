// Small progressive enhancements. Content is ALWAYS visible without JS — the
// reveal animation is gated behind html.js (set by the inline head script), so
// with JS disabled nothing is ever hidden, and every counter already holds its
// final number in the HTML.
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Highlight the nav link for the section currently in view.
  var links = document.querySelectorAll('.nav-links a[href^="#"]');
  var map = new Map();
  links.forEach(function (a) {
    var t = document.querySelector(a.getAttribute('href'));
    if (t) map.set(t, a);
  });
  if ('IntersectionObserver' in window && map.size) {
    var nav = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          var a = map.get(e.target);
          if (!a) return;
          a.classList.toggle('is-active', e.isIntersecting);
        });
      },
      { rootMargin: '-25% 0px -60% 0px' }
    );
    map.forEach(function (_a, t) { nav.observe(t); });
  }

  // Scroll progress hairline at the very top of the page.
  var bar = document.querySelector('.progress i');
  if (bar) {
    var ticking = false;
    var draw = function () {
      ticking = false;
      var doc = document.documentElement;
      var max = doc.scrollHeight - window.innerHeight;
      var p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      bar.style.width = (p * 100).toFixed(2) + '%';
    };
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; window.requestAnimationFrame(draw); }
    }, { passive: true });
    window.addEventListener('resize', draw, { passive: true });
    draw();
  }

  // Reveal on scroll + count-up for the metric numbers. The hidden state (.pre)
  // is added here, not in the CSS, so a failed script can never hide content.
  var reveal = document.querySelectorAll('.reveal');
  var nums = document.querySelectorAll('.m-num[data-to]');
  var settle = function (el) { el.classList.remove('pre'); el.classList.add('in'); };
  var countUp = function (el) {
    var to = parseFloat(el.getAttribute('data-to')) || 0;
    if (reduce) { el.textContent = String(to); return; }
    var start = performance.now();
    var dur = 800;
    var step = function (now) {
      var p = Math.min(1, (now - start) / dur);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = String(Math.round(to * eased));
      if (p < 1) window.requestAnimationFrame(step);
      else el.textContent = String(to);
    };
    window.requestAnimationFrame(step);
  };

  // Reveal is driven by a scroll check rather than IntersectionObserver: an
  // instant jump (anchor click, fast wheel) can skip an element's intersection
  // entirely, which would leave it invisible forever. "top above the fold" is
  // true both when it enters and when it has already been passed.
  if (reveal.length) {
    var pending = Array.prototype.slice.call(reveal);
    pending.forEach(function (el) { el.classList.add('pre'); });
    var check = function () {
      var h = window.innerHeight;
      pending = pending.filter(function (el) {
        if (el.getBoundingClientRect().top < h) { settle(el); return false; }
        return true;
      });
      if (!pending.length) {
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('resize', onScroll);
      }
    };
    var ticking2 = false;
    var onScroll = function () {
      if (ticking2) return;
      ticking2 = true;
      window.requestAnimationFrame(function () { ticking2 = false; check(); });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    check();
    // last resort: nothing may stay hidden if scroll events never arrive
    window.setTimeout(function () { pending.forEach(settle); pending = []; }, 8000);
  }

  if ('IntersectionObserver' in window) {
    var ioNum = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          countUp(e.target);
          ioNum.unobserve(e.target);
        });
      },
      { threshold: 0.4 }
    );
    nums.forEach(function (el) { ioNum.observe(el); });
  } else {
    nums.forEach(function (el) { el.textContent = el.getAttribute('data-to'); });
  }

  // Append-only flavour line in the terminal panel (adds text, never hides it).
  var term = document.querySelector('.term-body');
  if (term) {
    window.setTimeout(function () {
      var line = document.createElement('p');
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
  var boot = document.getElementById('boot');
  if (boot && document.documentElement.classList.contains('booting')) {
    var bar2 = boot.querySelector('.boot-bar');
    var pctEl = boot.querySelector('.boot-pct');
    var msgEl = boot.querySelector('.boot-msg');
    var STAGES = [
      [0, 'LOADING MODULES'],
      [34, 'MOUNTING TOOLKIT'],
      [68, 'CALIBRATING TARGET'],
      [94, 'READY']
    ];
    var BLOCKS = 20;
    var DURATION = 1300;
    for (var i = 0; i < BLOCKS; i++) bar2.appendChild(document.createElement('i'));
    var cells = Array.prototype.slice.call(bar2.children);

    var dismissed = false;
    var raf = 0;
    var end = function () {
      boot.remove();
      document.documentElement.classList.remove('booting', 'boot-out');
    };
    var finish = function () {
      if (dismissed) return;
      dismissed = true;
      window.cancelAnimationFrame(raf);
      window.clearTimeout(hardStop);
      pctEl.textContent = '100';
      msgEl.textContent = 'READY';
      cells.forEach(function (c) { c.classList.add('on'); });
      document.documentElement.classList.add('boot-out');
      window.setTimeout(end, 320);
    };
    var hardStop = window.setTimeout(finish, 2600);

    var started = performance.now();
    var tick = function (now) {
      var p = Math.min(1, (now - started) / DURATION);
      var value = Math.floor(p * 100);
      pctEl.textContent = String(value).padStart(3, '0');
      var filled = Math.round(p * BLOCKS);
      cells.forEach(function (c, i) { c.classList.toggle('on', i < filled); });
      var stage = STAGES.filter(function (s) { return value >= s[0]; }).pop();
      if (stage && msgEl.textContent !== stage[1]) msgEl.textContent = stage[1];
      if (p < 1) raf = window.requestAnimationFrame(tick);
      else finish();
    };
    raf = window.requestAnimationFrame(tick);

    ['keydown', 'click', 'touchstart', 'wheel'].forEach(function (ev) {
      window.addEventListener(ev, finish, { passive: true, once: true });
    });
  }
})();