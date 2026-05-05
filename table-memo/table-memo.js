(function () {
  'use strict';

  function showToast(msg, color) {
    const t = document.createElement('div');
    t.style.cssText = `position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:${color || '#6366f1'};color:#fff;padding:12px 24px;border-radius:8px;z-index:2147483647;font-family:system-ui;font-size:14px;box-shadow:0 10px 25px rgba(0,0,0,0.2);opacity:0;transition:0.3s;`;
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.style.opacity = '1', 10);
    setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 300); }, 2500);
  }

  async function copyToClipboard(text) {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
    } else {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
  }

  function cellText(cell) {
    return cell.textContent.replace(/\s+/g, ' ').replace(/\|/g, '\\|').trim();
  }

  function tableToMarkdown(table) {
    const rows = Array.from(table.querySelectorAll('tr')).filter(r => r.closest('table') === table || r.closest('table').closest('table') === table);

    // Flatten: only rows that belong directly to this table (skip nested tables)
    const directRows = Array.from(table.rows);
    if (!directRows.length) return '';

    const firstRow = directRows[0];
    const hasHeader = firstRow.querySelector('th') !== null ||
      (firstRow.closest('thead') !== null);

    const lines = [];
    directRows.forEach((row, i) => {
      const cells = Array.from(row.querySelectorAll('th, td')).map(cellText);
      if (!cells.length) return;
      lines.push('| ' + cells.join(' | ') + ' |');
      if (i === 0) {
        lines.push('| ' + cells.map(() => '---').join(' | ') + ' |');
      }
    });

    return lines.join('\n');
  }

  const tables = Array.from(document.querySelectorAll('table'));
  if (!tables.length) {
    showToast('table-memo: No tables found on this page', '#c62828');
    return;
  }

  // Pick the table with the most cells
  const best = tables.reduce((a, b) =>
    b.querySelectorAll('td, th').length > a.querySelectorAll('td, th').length ? b : a
  );

  const markdown = tableToMarkdown(best);
  if (!markdown) {
    showToast('table-memo: Could not parse table', '#c62828');
    return;
  }

  copyToClipboard(markdown).then(() => {
    const rows = best.rows.length;
    const cols = best.rows[0] ? best.rows[0].cells.length : 0;
    showToast(`✓ Copied ${rows}×${cols} table as Markdown`);
  }).catch(() => showToast('table-memo: Clipboard write failed', '#c62828'));
})();
