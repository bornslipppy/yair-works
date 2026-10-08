/* Per-application portfolio variants.
 *
 * A variant is the normal site plus extra gallery items, served at its own path
 * (see the rewrites in vercel.json). The main site at / is never changed.
 *
 *   /anthropic   → index.html with AI Gateway inserted as the first item
 *
 * Once a visitor lands on a variant, links back to the Space page keep them on
 * that variant for the rest of the session.
 */
(function () {
  var VARIANTS = {
    anthropic: {
      insertAt: 0,
      items: [{
        image: 'assets/img-b44/custom_13_ai-gateway.png',
        title: 'AI Gateway [Wonderful] / 2026',
        desc: 'The control layer every enterprise AI request passes through. I designed guardrails that fail closed, spend limits, model access and failover routing, then built them with Claude Code as a working, tested prototype across eight surfaces.',
        problem: 'AI usage was outpacing AI control. Teams adopted tools independently, leaving no single place to see spend, enforce access, or stop sensitive data from reaching a model provider.',
        impact: 'TODO(yair): impact line.',
        link: '/work/ai-gateway/',
        linklabel: 'Case Study',
        link2: '/work/ai-gateway/prototype/',
        linklabel2: 'Prototype'
      }]
    }
  };

  var FIELDS = ['title', 'desc', 'problem', 'impact', 'link', 'linklabel', 'link2', 'linklabel2', 'note'];
  var KEY = 'yw-variant';

  function fromPath() {
    var m = location.pathname.match(/^\/([a-z0-9-]+)\/?$/);
    return m && VARIANTS[m[1]] ? m[1] : null;
  }

  function store(name) {
    try { name ? sessionStorage.setItem(KEY, name) : sessionStorage.removeItem(KEY); } catch (e) {}
  }
  function stored() {
    try { var v = sessionStorage.getItem(KEY); return VARIANTS[v] ? v : null; } catch (e) { return null; }
  }

  var onIndex = /^\/(index\.html)?$/.test(location.pathname);
  var active = fromPath();
  if (active) store(active);
  else if (onIndex) store(null);          // plain / always means the main site
  else active = stored();                 // about, writing, case studies inherit it

  // Shift existing gallery items up and splice the variant's items in.
  function applyGallery(v) {
    var cfg = VARIANTS[active];
    if (!cfg || !v || !Array.isArray(v.images) || v.__variant) return;
    cfg.items.forEach(function (item, k) {
      var at = cfg.insertAt + k;
      for (var i = v.image_count - 1; i >= at; i--) {
        FIELDS.forEach(function (f) {
          var from = f + '_' + i, to = f + '_' + (i + 1);
          if (from in v) v[to] = v[from]; else delete v[to];
          delete v[from];
        });
      }
      FIELDS.forEach(function (f) { if (item[f] != null) v[f + '_' + at] = item[f]; });
      v.images.splice(at, 0, item.image);
      v.image_count += 1;
    });
    v.__variant = active;
  }

  function relinkHome() {
    if (!active) return;
    var home = '/' + active;
    var links = document.querySelectorAll('a[href]');
    for (var i = 0; i < links.length; i++) {
      var a = links[i];
      if (a.hasAttribute('data-yw-home')) { a.setAttribute('href', home); continue; }
      var u;
      try { u = new URL(a.getAttribute('href'), location.href); } catch (e) { continue; }
      if (u.origin === location.origin && /^\/(index\.html)?$/.test(u.pathname)) a.setAttribute('href', home + u.hash);
    }
  }

  window.YW_VARIANT = { name: active, applyGallery: applyGallery };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', relinkHome);
  else relinkHome();
})();
