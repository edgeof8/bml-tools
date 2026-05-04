// Shared toast utility for BML Tools
function showEdgeToast(msg, bg = '#6366f1') {
  const t = document.createElement('div');
  t.style.cssText = `position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:${bg};color:#fff;padding:12px 24px;border-radius:8px;z-index:2147483647;font-family:system-ui;font-size:14px;box-shadow:0 10px 25px rgba(0,0,0,0.2);opacity:0;transition:0.3s;`;
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.style.opacity = '1', 10);
  setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 300); }, 2500);
}