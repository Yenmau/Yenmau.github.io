// Small progressive enhancements. Content is ALWAYS visible without JS — every
// effect here is gated behind html.js (set by the inline head script) or behind a
// class this file adds, and each one carries a hard-stop timeout, so a failed
// script can never leave a line or a card hidden.
(function () {
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

  // Reveal on scroll. The hidden state (.pre)
  // is added here, not in the CSS, so a failed script can never hide content.
  var reveal = document.querySelectorAll('.reveal');

  // Cascade the card reveals so a grid settles in a wave instead of all at once.
  ['.cards', '.tools', '.about-grid', '.skills-grid'].forEach(function (sel) {
    var g = document.querySelector(sel);
    if (!g) return;
    g.querySelectorAll('.reveal').forEach(function (el, i) {
      el.style.transitionDelay = (i * 70) + 'ms';
    });
  });

  // Stagger the toolkit tiles so the pulse travels down the columns like a scan.
  document.querySelectorAll('.tile').forEach(function (t, i) {
    t.style.animationDelay = ((i % 7) * 0.24).toFixed(2) + 's';
  });
  var settle = function (el) { el.classList.remove('pre'); el.classList.add('in'); };
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

  // Pointer spotlight: a block lights up where the cursor is (.spot::before reads
  // --mx/--my). Purely cosmetic, and only wired up for a real hovering pointer, so
  // touch devices and no-JS loads simply never get a spotlight - nothing is hidden.
  if (window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.querySelectorAll('.spot').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        el.style.setProperty('--mx', (((e.clientX - r.left) / r.width) * 100).toFixed(2) + '%');
        el.style.setProperty('--my', (((e.clientY - r.top) / r.height) * 100).toFixed(2) + '%');
      }, { passive: true });
    });
  }

  // Terminal lines type in one after another. The hidden state lives behind a class
  // this file adds (never CSS alone), and the clean-up timeout is registered BEFORE
  // the loop, so even a throw mid-sequence can only ever leave the lines visible.
  var term = document.querySelector('.term-body');
  if (term) {
    var lines = Array.prototype.slice.call(term.querySelectorAll('.trow, .tline'));
    var CLEAR = 320 + 110 * lines.length + 900;
    window.setTimeout(function () {
      lines.forEach(function (el) {
        el.style.transitionDelay = '';
        el.classList.add('typed');
      });
      term.classList.remove('typing');
    }, CLEAR);
    term.classList.add('typing');
    lines.forEach(function (el, i) {
      el.style.transitionDelay = (i * 110) + 'ms';
      window.setTimeout(function () { el.classList.add('typed'); }, 320 + i * 110);
    });

    // Append-only flavour line (adds text, never hides it).
    window.setTimeout(function () {
      var line = document.createElement('p');
      line.className = 'tline c-dim typed';
      line.textContent = '[ok] session established — 127.0.0.1';
      term.appendChild(line);
    }, CLEAR - 300);
  }

  // Footer motion switch. Default follows the OS: reduced motion keeps the page calm
  // (fades and micro-pulses only). "full" adds the large-area layer - drifting grid,
  // light beam, ticker - which this machine would otherwise never show, because
  // Windows animations are off (MinAnimate=0) and the browser reports `reduce`.
  var mBtn = document.getElementById('motion-toggle');
  var root = document.documentElement;
  var applyMotion = function (full) {
    root.classList.toggle('motion-full', full);
    if (!mBtn) return;
    mBtn.textContent = 'motion: ' + (full ? 'full' : 'auto');
    mBtn.setAttribute('aria-pressed', full ? 'true' : 'false');
  };
  var saved = null;
  try { saved = window.localStorage.getItem('vt-motion'); } catch (e) {}
  if (saved === 'full') applyMotion(true);
  if (mBtn) {
    mBtn.addEventListener('click', function () {
      var full = !root.classList.contains('motion-full');
      applyMotion(full);
      try { window.localStorage.setItem('vt-motion', full ? 'full' : 'auto'); } catch (e) {}
    });
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

  // Favicon blink: two SVG frames swapped on a timer, so the tick in the shield
  // reads as a live cursor. Browsers animate neither SMIL nor CSS inside a
  // favicon, hence the swap. The check runs on every tick rather than once, so
  // the footer's motion switch turns it on too (this machine reports
  // prefers-reduced-motion, which is exactly why that switch exists). The static
  // frame is what the markup links to, so a failure here leaves the plain mark.
  var icon = document.querySelector('link[rel="icon"]');
  if (icon) {
    var FRAMES = [icon.getAttribute('href'), 'assets/favicon-blink.svg'];
    var f = 0;
    var wantsMotion = function () {
      var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      return !reduce || document.documentElement.classList.contains('motion-full');
    };
    window.setInterval(function () {
      if (!wantsMotion()) { f = 0; icon.setAttribute('href', FRAMES[0]); return; }
      f = 1 - f;
      icon.setAttribute('href', FRAMES[f]);
    }, 640);
  }

  // Live GitHub figures — one unauthenticated call to api.github.com (CORS is
  // open, and there is no key to leak). The strip ships hidden and only appears
  // once real numbers are in hand, so a rate-limited, offline or no-JS visitor
  // sees no strip rather than a placeholder. The footer date rides along on the
  // same payload: it is the last push to the repo that serves this page.
  var gh = document.getElementById('gh-live');
  var setText = function (id, v) { var el = document.getElementById(id); if (el) el.textContent = v; };
  var ago = function (iso) {
    var s = (Date.now() - new Date(iso).getTime()) / 1000;
    if (isNaN(s) || s < 0) return '';
    if (s < 3600) return Math.max(1, Math.round(s / 60)) + ' m ago';
    if (s < 86400) return Math.round(s / 3600) + ' h ago';
    if (s < 2592000) return Math.round(s / 86400) + ' d ago';
    return new Date(iso).toISOString().slice(0, 10);
  };
  if (gh && window.fetch && window.AbortController) {
    var user = gh.getAttribute('data-user');
    var ctl = new AbortController();
    var stop = window.setTimeout(function () { ctl.abort(); }, 7000);
    window.fetch('https://api.github.com/users/' + user + '/repos?per_page=100&sort=pushed', { signal: ctl.signal })
      .then(function (r) { if (!r.ok) throw new Error('github ' + r.status); return r.json(); })
      .then(function (repos) {
        window.clearTimeout(stop);
        if (!Array.isArray(repos) || !repos.length) return;
        var byPush = repos.slice().sort(function (a, b) { return new Date(b.pushed_at) - new Date(a.pushed_at); });
        var byLang = {};
        repos.forEach(function (r) { if (r.language) byLang[r.language] = (byLang[r.language] || 0) + 1; });
        var top = Object.keys(byLang).sort(function (a, b) { return byLang[b] - byLang[a]; }).slice(0, 2);
        var link = document.getElementById('gh-repo');
        if (link) { link.textContent = byPush[0].name; link.href = byPush[0].html_url; }
        setText('gh-when', ago(byPush[0].pushed_at));
        setText('gh-lang', top.map(function (l) { return l + ' (' + byLang[l] + ')'; }).join(' \u00b7 '));
        setText('gh-repos', String(repos.length));
        setText('gh-fetched', new Date().toISOString().slice(0, 10));
        gh.hidden = false;
        var self = repos.filter(function (r) { return r.name.toLowerCase() === (user + '.github.io').toLowerCase(); })[0];
        if (self && self.pushed_at) setText('last-updated', self.pushed_at.slice(0, 10));
      })
      .catch(function () { window.clearTimeout(stop); });

    // Commit subject for the same repo: a second call, so a failure here only
    // ever costs the footer its suffix. It writes into its own span — the date
    // and the sha come from different responses, and reusing one node would let
    // whichever lands last wipe the other.
    window.fetch('https://api.github.com/repos/' + user + '/' + user + '.github.io/commits?per_page=1', { signal: ctl.signal })
      .then(function (r) { if (!r.ok) throw new Error('github ' + r.status); return r.json(); })
      .then(function (c) {
        if (!Array.isArray(c) || !c.length) return;
        var el = document.getElementById('last-commit');
        if (!el) return;
        var subject = (c[0].commit.message || '').split('\n')[0];
        el.textContent = ' \u00b7 ' + c[0].sha.slice(0, 7);
        el.title = 'last commit \u2014 ' + subject;
      })
      .catch(function () {});
  }
})();