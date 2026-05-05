(function () {
  'use strict';

  // Key scoped to the page path so highlights from different articles don't mix
  var STORAGE_KEY = 'edge_highlight_memo_' + (location.origin + location.pathname);

  function showToast(msg, color, duration) {
    var existing = document.getElementById('edge-hm-toast');
    if (existing) existing.remove();
    var t = document.createElement('div');
    t.id = 'edge-hm-toast';
    t.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:' + (color || '#6366f1') + ';color:#fff;padding:12px 24px;border-radius:8px;z-index:2147483647;font-family:system-ui;font-size:14px;box-shadow:0 10px 25px rgba(0,0,0,0.2);opacity:0;transition:0.3s;';
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(function () { t.style.opacity = '1'; }, 10);
    setTimeout(function () { t.style.opacity = '0'; setTimeout(function () { t.remove(); }, 300); }, duration || 2500);
  }

  function getHighlights() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
    catch (e) { return []; }
  }

  function saveHighlights(arr) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
  }

  async function copyToClipboard(text) {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
    } else {
      var ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
  }

  var selection = (window.getSelection() || '').toString().trim();

  if (selection) {
    // Accumulate: add highlight to the queue for this page
    var highlights = getHighlights();
    highlights.push(selection);
    saveHighlights(highlights);
    showToast('✓ Highlight ' + highlights.length + ' captured — click again to export all', '#1565C0');
  } else {
    // Export: bundle all queued highlights and copy as Markdown
    var highlights = getHighlights();
    if (!highlights.length) {
      showToast('highlight-memo: Select text to start capturing highlights', '#f59e0b', 3500);
      return;
    }

    var today = new Date().toISOString().split('T')[0];
    var pageTitle = document.title.trim();
    var url = location.href;

    var frontmatter = [
      '---',
      'title: "' + pageTitle.replace(/"/g, '\\"') + '"',
      'source: "' + url + '"',
      'clipped: "' + today + '"',
      'highlights: ' + highlights.length,
      '---'
    ].join('\n');

    var list = highlights.map(function (h) {
      return '- ' + h.replace(/\n+/g, ' ').replace(/\s{2,}/g, ' ');
    }).join('\n');

    var markdown = frontmatter + '\n\n## Highlights from [' + pageTitle + '](' + url + ')\n\n' + list;

    copyToClipboard(markdown).then(function () {
      saveHighlights([]); // clear queue after export
      showToast('✓ Exported ' + highlights.length + ' highlight' + (highlights.length > 1 ? 's' : '') + ' — queue cleared');
    }).catch(function () {
      showToast('highlight-memo: Clipboard write failed', '#c62828');
    });
  }
})();
