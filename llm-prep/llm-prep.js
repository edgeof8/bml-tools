(function () {
  'use strict';

  var CDN_READABILITY = 'https://cdn.jsdelivr.net/npm/@mozilla/readability@0.4.1/Readability.js';
  var CDN_TURNDOWN    = 'https://cdn.jsdelivr.net/npm/turndown@7.1.1/dist/turndown.js';

  var PROMPT = 'Here is an article titled "{title}". Please summarize the core arguments in 5 bullet points.\n\nArticle:\n\n{content}';

  function showToast(msg, color, duration) {
    var existing = document.getElementById('edge-llmprep-toast');
    if (existing) existing.remove();
    var t = document.createElement('div');
    t.id = 'edge-llmprep-toast';
    t.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:' + (color || '#6366f1') + ';color:#fff;padding:12px 24px;border-radius:8px;z-index:2147483647;font-family:system-ui;font-size:14px;box-shadow:0 10px 25px rgba(0,0,0,0.2);opacity:0;transition:0.3s;';
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(function () { t.style.opacity = '1'; }, 10);
    setTimeout(function () { t.style.opacity = '0'; setTimeout(function () { t.remove(); }, 300); }, duration || 2500);
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

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = src;
      s.onload = resolve;
      s.onerror = function () { reject(new Error('Failed to load ' + src)); };
      document.head.appendChild(s);
    });
  }

  var docClone = document.cloneNode(true);
  var pageTitle = document.title.trim();

  showToast('llm-prep: Extracting content…', '#1565C0');

  Promise.all([loadScript(CDN_READABILITY), loadScript(CDN_TURNDOWN)])
    .then(function () {
      var content = '';

      try {
        var article = new Readability(docClone).parse();
        if (article && article.content) {
          var td = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced', bulletListMarker: '-' });
          content = td.turndown(article.content);
          if (article.title) pageTitle = article.title;
        }
      } catch (e) {}

      if (!content) {
        var el = document.querySelector('article, main, [role="main"]') || document.body;
        content = el.innerText.replace(/\s{3,}/g, '\n\n').trim();
      }

      // Minify: collapse excess whitespace and blank lines
      var minified = content.replace(/\n{3,}/g, '\n\n').replace(/[ \t]{2,}/g, ' ').trim();

      var prompt = PROMPT
        .replace('{title}', pageTitle)
        .replace('{content}', minified);

      return copyToClipboard(prompt).then(function () {
        var words = minified.split(/\s+/).length;
        showToast('✓ llm-prep: ~' + words.toLocaleString() + ' words — paste into any AI', '#238636', 3000);
      });
    })
    .catch(function (err) {
      showToast('llm-prep: Failed — see console', '#c62828');
      console.error('llm-prep:', err);
    });
})();
