(function () {
  'use strict';

  if (document.getElementById('edge-schema-overlay')) return;

  function showToast(msg, color) {
    const t = document.createElement('div');
    t.style.cssText = `position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:${color || '#6366f1'};color:#fff;padding:12px 24px;border-radius:8px;z-index:2147483647;font-family:system-ui;font-size:14px;box-shadow:0 10px 25px rgba(0,0,0,0.2);opacity:0;transition:0.3s;`;
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.style.opacity = '1', 10);
    setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 300); }, 2500);
  }

  async function copy(text) {
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

  const scriptEls = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
  if (!scriptEls.length) {
    showToast('schema-peek: No JSON-LD found on this page', '#c62828');
    return;
  }

  const schemas = scriptEls.map(s => {
    try { return JSON.parse(s.textContent); }
    catch (e) { return { _parseError: e.message, _raw: s.textContent.slice(0, 300) }; }
  });

  // Build overlay
  const overlay = document.createElement('div');
  overlay.id = 'edge-schema-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;z-index:2147483647;background:rgba(0,0,0,0.75);display:flex;align-items:center;justify-content:center;font-family:system-ui;padding:24px;box-sizing:border-box;';

  const panel = document.createElement('div');
  panel.style.cssText = 'background:#0d1117;border:1px solid #30363d;border-radius:12px;width:100%;max-width:780px;max-height:80vh;display:flex;flex-direction:column;box-shadow:0 20px 60px rgba(0,0,0,0.6);';

  // Header
  const header = document.createElement('div');
  header.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:14px 20px;border-bottom:1px solid #30363d;flex-shrink:0;gap:8px;';

  const title = document.createElement('span');
  title.style.cssText = 'font-weight:700;color:#e6edf3;font-size:0.95rem;white-space:nowrap;';
  title.textContent = `🔍 schema-peek — ${schemas.length} block${schemas.length > 1 ? 's' : ''} found`;

  const copyAllBtn = document.createElement('button');
  copyAllBtn.textContent = '📋 Copy All';
  copyAllBtn.style.cssText = 'background:#21262d;border:1px solid #30363d;color:#e6edf3;border-radius:6px;padding:5px 12px;font-size:0.82rem;cursor:pointer;white-space:nowrap;';
  copyAllBtn.onclick = () => {
    copy(schemas.map(s => JSON.stringify(s, null, 2)).join('\n\n---\n\n')).then(() => {
      copyAllBtn.textContent = '✓ Copied!';
      setTimeout(() => { copyAllBtn.textContent = '📋 Copy All'; }, 1500);
    });
  };

  const closeBtn = document.createElement('button');
  closeBtn.textContent = '×';
  closeBtn.style.cssText = 'background:none;border:none;color:#8b949e;font-size:1.5rem;cursor:pointer;padding:0 2px;line-height:1;flex-shrink:0;';
  closeBtn.onclick = close;

  header.appendChild(title);
  header.appendChild(copyAllBtn);
  header.appendChild(closeBtn);

  // Body
  const body = document.createElement('div');
  body.style.cssText = 'overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:12px;';

  schemas.forEach(schema => {
    const typeVal = Array.isArray(schema)
      ? `Array [${schema.length} item${schema.length !== 1 ? 's' : ''}]`
      : (schema['@type'] || 'Unknown');

    const block = document.createElement('div');
    block.style.cssText = 'background:#161b22;border:1px solid #30363d;border-radius:8px;overflow:hidden;';

    const blockHead = document.createElement('div');
    blockHead.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:8px 14px;background:#21262d;';

    const typeLabel = document.createElement('span');
    typeLabel.style.cssText = 'font-size:0.78rem;font-weight:600;color:#79c0ff;font-family:ui-monospace,monospace;';
    typeLabel.textContent = typeVal;

    const blockCopyBtn = document.createElement('button');
    blockCopyBtn.textContent = 'Copy';
    blockCopyBtn.style.cssText = 'background:#30363d;border:none;color:#e6edf3;border-radius:4px;padding:2px 9px;font-size:0.75rem;cursor:pointer;';
    blockCopyBtn.onclick = () => {
      copy(JSON.stringify(schema, null, 2)).then(() => {
        blockCopyBtn.textContent = '✓';
        setTimeout(() => { blockCopyBtn.textContent = 'Copy'; }, 1200);
      });
    };

    blockHead.appendChild(typeLabel);
    blockHead.appendChild(blockCopyBtn);

    const pre = document.createElement('pre');
    pre.style.cssText = 'padding:14px;margin:0;overflow-x:auto;font-family:ui-monospace,Consolas,monospace;font-size:0.78rem;color:#e6edf3;line-height:1.5;white-space:pre-wrap;word-break:break-all;max-height:320px;overflow-y:auto;';
    pre.textContent = JSON.stringify(schema, null, 2);

    block.appendChild(blockHead);
    block.appendChild(pre);
    body.appendChild(block);
  });

  panel.appendChild(header);
  panel.appendChild(body);
  overlay.appendChild(panel);
  document.body.appendChild(overlay);

  function close() {
    overlay.remove();
    document.removeEventListener('keydown', handleKey);
  }

  function handleKey(e) { if (e.key === 'Escape') close(); }
  document.addEventListener('keydown', handleKey);

  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
})();
