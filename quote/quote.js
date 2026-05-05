(function () {
  'use strict';

  // ── Grab selection ──────────────────────────────────────────────────────────
  const sel = window.getSelection();
  const selectedText = sel ? sel.toString().trim() : '';

  if (!selectedText) {
    showEdgeToast('Select some text first, then click quote.', '#f85149');
    return;
  }

  // ── Page metadata ───────────────────────────────────────────────────────────
  const pageUrl   = window.location.href;
  const pageTitle = document.title.trim() || pageUrl;
  const today     = new Date().toISOString().slice(0, 10);

  function meta(name) {
    const el = document.querySelector(
      `meta[name="${name}"], meta[property="${name}"], meta[property="og:${name}"]`
    );
    return el ? el.getAttribute('content') || '' : '';
  }

  const author = meta('author') || meta('article:author') || '';
  const siteName = meta('og:site_name') || new URL(pageUrl).hostname.replace(/^www\./, '');

  // ── Format blockquote ───────────────────────────────────────────────────────
  const lines = selectedText
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .map(l => `> ${l}`)
    .join('\n');

  const attribution = author
    ? `> — ${author}, [${pageTitle}](${pageUrl})`
    : `> — [${pageTitle}](${pageUrl})`;

  const yaml = [
    '---',
    `source: "${pageUrl}"`,
    `site: "${siteName}"`,
    author ? `author: "${author}"` : null,
    `clipped: ${today}`,
    '---',
  ].filter(Boolean).join('\n');

  const markdown = `${yaml}\n\n${lines}\n>\n${attribution}\n`;

  // ── Copy to clipboard ───────────────────────────────────────────────────────
  function done() {
    const words = selectedText.split(/\s+/).length;
    showEdgeToast(`✓ Quoted ${words} word${words !== 1 ? 's' : ''} — copied to clipboard`);
  }

  navigator.clipboard.writeText(markdown).then(done).catch(() => {
    const ta = document.createElement('textarea');
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

  // ── Toast (inline copy of edge-utils so tool is self-contained) ────────────
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
    requestAnimationFrame(() => { t.style.opacity = '1'; });
    setTimeout(() => {
      t.style.opacity = '0';
      setTimeout(() => t.remove(), 350);
    }, 2500);
  }
})();
