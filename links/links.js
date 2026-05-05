(function () {
  'use strict';

  var pageTitle = document.title.trim() || window.location.href;
  var pageHost  = window.location.hostname;

  // Collect all anchors, filter to external unique ones with readable text
  var seen = new Set();
  var items = [];

  Array.from(document.querySelectorAll('a[href]')).forEach(function (a) {
    var href = a.href;
    if (!href || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:')) return;

    // External only (different host)
    try {
      var u = new URL(href);
      if (u.hostname === pageHost || u.hostname === '') return;
      var canonical = u.origin + u.pathname + (u.search || '');
      if (seen.has(canonical)) return;
      seen.add(canonical);
    } catch (e) { return; }

    var text = (a.textContent || a.getAttribute('aria-label') || a.getAttribute('title') || '').trim()
      .replace(/\s+/g, ' ')
      .replace(/[\[\]]/g, '');

    if (!text || text.length < 2) return;

    items.push({ text: text, url: href });
  });

  if (!items.length) {
    showEdgeToast('No external links found on this page.', '#f85149');
    return;
  }

  var today = new Date().toISOString().slice(0, 10);
  var yaml = '---\nsource: "' + window.location.href + '"\nclipped: ' + today + '\n---\n\n';
  var header = '## Links from: ' + pageTitle + '\n\n';
  var list = items.map(function (i) { return '- [' + i.text + '](' + i.url + ')'; }).join('\n');
  var markdown = yaml + header + list + '\n';

  function done() {
    showEdgeToast('✓ Copied ' + items.length + ' link' + (items.length !== 1 ? 's' : '') + ' — Markdown in clipboard');
  }

  navigator.clipboard.writeText(markdown).then(done).catch(function () {
    var ta = document.createElement('textarea');
    ta.value = markdown;
    ta.style.cssText = 'position:fixed;opacity:0;top:0;left:0';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    try { document.execCommand('copy'); done(); } catch (e) {
      showEdgeToast('Could not copy — check browser permissions.', '#f85149');
    }
    ta.remove();
  });

  function showEdgeToast(msg, bg) {
    bg = bg || '#6366f1';
    var t = document.createElement('div');
    t.textContent = msg;
    t.style.cssText = [
      'position:fixed', 'bottom:1.5rem', 'left:50%',
      'transform:translateX(-50%)', 'z-index:2147483647',
      'background:' + bg, 'color:#fff',
      'padding:0.65rem 1.25rem', 'border-radius:8px',
      'font:600 0.95rem/1 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',
      'box-shadow:0 4px 20px rgba(0,0,0,0.4)',
      'opacity:0', 'transition:opacity 0.3s',
      'white-space:nowrap', 'pointer-events:none'
    ].join(';');
    document.body.appendChild(t);
    requestAnimationFrame(function () { t.style.opacity = '1'; });
    setTimeout(function () {
      t.style.opacity = '0';
      setTimeout(function () { t.remove(); }, 350);
    }, 2500);
  }
})();
