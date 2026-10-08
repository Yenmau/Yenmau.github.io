// Small progressive enhancements. Content is ALWAYS visible without JS — every
// effect here is gated behind html.js (set by the inline head script) or behind a
// class this file adds, and each one carries a hard-stop timeout, so a failed
// script can never leave a line or a card hidden.
(function () {
  // Nav highlight. Driven by a scroll-position check rather than an
  // IntersectionObserver: an instant jump (anchor click, scrollTo) can move a
  // section from far below the viewport to far above it inside a single frame, so
  // no intersection is ever observed and the link would stay dead. Measuring which
  // section crosses the bar's own bottom edge is jump-proof — the same reason the
  // reveal code below uses a position check. The sliding marker is placed here too.
  var navTargets = [];
  document.querySelectorAll('.nav-links a[href^="#"]').forEach(function (a) {
    var t = document.querySelector(a.getAttribute('href'));
    if (t) navTargets.push([t, a]);
  });

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

  // ---- life pass ----------------------------------------------------------
  // Everything below is additive: each block only reveals markup that shipped
  // hidden, or rewrites a value with the value already in the HTML.

  // The sliding marker under the active nav link. Placed from the links' own
  // offsetLeft/width, so it needs no hard-coded positions; the scroll pass below
  // calls it, and a resize re-places it because offsetLeft is layout-dependent.
  var navWrap = document.querySelector('.nav-links');
  var navInd = navWrap && navWrap.querySelector('.nav-ind');
  var placeInd = function (a) {
    if (!navInd || !navWrap || !a) return;
    navWrap.classList.add('has-active');
    navInd.style.width = a.offsetWidth + 'px';
    navInd.style.transform = 'translateX(' + a.offsetLeft + 'px)';
  };
  if (navWrap && navInd) {
    window.addEventListener('resize', function () {
      var act = navWrap.querySelector('.navlink.is-active');
      if (act) placeInd(act);
    }, { passive: true });
  }

  // Cursor aurora + the portrait's viewfinder cross. One pointermove listener on
  // a rAF tick writes four custom properties; the CSS does the drawing. Wired
  // only for a real hovering pointer, so touch devices never pay for it.
  var finePointer = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (finePointer) {
    var rootEl = document.documentElement;
    var crossEl = document.querySelector('.hud-cross');
    var paneEl = document.querySelector('.idcard-img');
    rootEl.classList.add('ptr');
    var lastMove = null;
    var moveRaf = 0;
    var paintMove = function (e) {
      rootEl.style.setProperty('--cx', e.clientX.toFixed(0) + 'px');
      rootEl.style.setProperty('--cy', e.clientY.toFixed(0) + 'px');
      if (crossEl && paneEl) {
        var r = paneEl.getBoundingClientRect();
        crossEl.style.setProperty('--hx', (((e.clientX - r.left) / r.width) * 100).toFixed(2) + '%');
        crossEl.style.setProperty('--hy', (((e.clientY - r.top) / r.height) * 100).toFixed(2) + '%');
      }
    };
    window.addEventListener('pointermove', function (e) {
      lastMove = e;
      if (moveRaf) return;
      moveRaf = window.requestAnimationFrame(function () {
        moveRaf = 0;
        if (lastMove) paintMove(lastMove);
      });
    }, { passive: true });
  }

  // Live clock: the pill's time is Jakarta time (UTC+7) computed from UTC, not
  // the visitor's local zone, so the label never lies. The portrait bar counts
  // the seconds this page has been open — a still frame that is nonetheless running.
  var clockEl = document.getElementById('clock');
  var recEl = document.getElementById('rec-clock');
  if (clockEl || recEl) {
    var openedAt = Date.now();
    var pad2 = function (n) { return (n < 10 ? '0' : '') + n; };
    var tickClock = function () {
      var now = new Date();
      if (clockEl) {
        var jkt = new Date(now.getTime() + (now.getTimezoneOffset() + 420) * 60000);
        clockEl.textContent = pad2(jkt.getHours()) + ':' + pad2(jkt.getMinutes()) + ':' + pad2(jkt.getSeconds());
      }
      if (recEl) {
        var s = Math.max(0, Math.floor((Date.now() - openedAt) / 1000));
        recEl.textContent = pad2(Math.floor(s / 60)) + ':' + pad2(s % 60);
      }
    };
    tickClock();
    window.setInterval(tickClock, 1000);
  }

  // Metric count-up. The markup already holds the final figure, so this can only
  // ever print the same number back; a failure leaves the real value untouched.
  // No timer fallback on purpose: the strip starts below the fold, so a timeout
  // would burn the count-up while nobody is looking.
  var metricBox = document.querySelector('.metrics');
  if (metricBox) {
    var metricCells = Array.prototype.slice.call(metricBox.querySelectorAll('.metric-v'));
    var counted = false;
    var reduceNow = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var countUp = function () {
      if (counted) return;
      counted = true;
      if (reduceNow && !document.documentElement.classList.contains('motion-full')) return;
      metricCells.forEach(function (el) {
        var to = parseFloat(el.getAttribute('data-count'));
        if (isNaN(to)) return;
        var dec = parseInt(el.getAttribute('data-decimals') || '0', 10);
        var from = window.performance.now();
        var step = function (now) {
          var p = Math.min(1, (now - from) / 900);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = (to * eased).toFixed(dec);
          if (p < 1) window.requestAnimationFrame(step);
          else el.textContent = to.toFixed(dec);
        };
        window.requestAnimationFrame(step);
      });
    };
    var armMetrics = function () {
      if (metricBox.getBoundingClientRect().top < window.innerHeight * 0.94) {
        countUp();
        window.removeEventListener('scroll', armMetrics);
        window.removeEventListener('resize', armMetrics);
      }
    };
    window.addEventListener('scroll', armMetrics, { passive: true });
    window.addEventListener('resize', armMetrics, { passive: true });
    armMetrics();
  }

  // Interactive prompt. The form ships hidden; it is revealed only here, so a
  // no-JS visitor keeps the static terminal exactly as it was. Every command
  // either scrolls, prints a line, or opens an address — none can trap a visitor.
  var promptForm = document.getElementById('term-form');
  var promptIn = document.getElementById('term-cmd');
  var promptOut = document.getElementById('term-out');
  if (promptForm && promptIn && promptOut) {
    var JUMP = ['projects', 'toolkit', 'skills', 'about'];
    var print = function (text, cls) {
      var line = document.createElement('p');
      line.className = 'tline m-0 ' + (cls || 'term-out');
      line.textContent = text;
      promptOut.appendChild(line);
      while (promptOut.children.length > 4) promptOut.removeChild(promptOut.firstChild);
    };
    var runCmd = function (cmd) {
      var target = null;
      if (JUMP.indexOf(cmd) !== -1) target = document.getElementById(cmd);
      if (target) { target.scrollIntoView({ behavior: 'smooth', block: 'start' }); print('[ok] ' + cmd); return; }
      if (cmd === 'help' || cmd === '?') { print('projects  toolkit  skills  about  contact  github  whoami  clear'); return; }
      if (cmd === 'contact') { print('[ok] opening mail client'); window.location.href = 'mailto:vinotiono@gmail.com'; return; }
      if (cmd === 'github') { print('[ok] github.com/Yenmau'); window.open('https://github.com/Yenmau', '_blank', 'noopener'); return; }
      if (cmd === 'whoami') { print('penetration testing \u00b7 cyber security'); return; }
      if (cmd === 'clear') { promptOut.textContent = ''; return; }
      print('command not found: ' + cmd + ' \u2014 try help');
    };
    promptForm.hidden = false;
    promptForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var cmd = promptIn.value.trim().toLowerCase().replace(/\s+/g, ' ');
      promptIn.value = '';
      if (!cmd) return;
      print('$ ' + cmd, 'term-echo');
      runCmd(cmd);
    });
  }
  // Pinned nav. Sticky comes from CSS, so this only keeps the two things the CSS
  // cannot know: the height an anchor jump has to clear (--nav-h), and whether the
  // bar is currently over the page (.scrolled) or against the top. The same tick
  // flags a sideways-scrolling mobile nav so the edge fade only appears when there
  // really is more to the right.
  var navBar = document.querySelector('header.nav');
  if (navBar) {
    var navLinks = navBar.querySelector('.nav-links');
    // Which section is under the bar: walk the candidates and keep the one whose
    // box crosses the bar's bottom edge + 24px. Past the last section (over the
    // footer) the previous state is held, so the marker never snaps back to nothing.
    var activePair = null;
    var markNav = function () {
      var cut = navBar.getBoundingClientRect().bottom + 24;
      var best = null;
      navTargets.forEach(function (p) {
        var r = p[0].getBoundingClientRect();
        if (r.top <= cut && r.bottom > cut) best = p;
      });
      if (!best) best = activePair;
      if (!best) return;
      if (best !== activePair) {
        navTargets.forEach(function (p) {
          var on = p === best;
          p[1].classList.toggle('is-active', on);
          var num = p[0].querySelector('.sec-num');
          if (num) num.classList.toggle('lit', on);
        });
        activePair = best;
      }
      placeInd(best[1]);
    };
    var syncNav = function () {
      document.documentElement.style.setProperty('--nav-h', (navBar.offsetHeight + 12) + 'px');
      navBar.classList.toggle('scrolled', window.scrollY > 8);
      if (navLinks) {
        navLinks.classList.toggle('nav-links--scroll', navLinks.scrollWidth > navLinks.clientWidth + 1);
      }
      markNav();
    };
    // Called straight from the handlers, with no requestAnimationFrame latch: a
    // rAF callback does not run in a background tab, and a once-set "already
    // scheduled" flag would then freeze the bar's state until the tab came back.
    // The work is a handful of rect reads, and Chrome already aligns scroll events
    // to the frame — the browser coalesces them for us.
    window.addEventListener('scroll', syncNav, { passive: true });
    window.addEventListener('resize', syncNav, { passive: true });
    syncNav();
  }
})();
