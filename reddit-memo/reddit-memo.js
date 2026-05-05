(function () {
  'use strict';

  if (!location.hostname.includes('reddit.com')) {
    showToast('reddit-memo only works on reddit.com', '#f85149');
    return;
  }

  var today = new Date().toISOString().slice(0, 10);

  // ── Helpers ────────────────────────────────────────────────────────────────

  function clean(s) {
    return (s || '').trim().replace(/\s+/g, ' ');
  }

  function q(sel, root) {
    return (root || document).querySelector(sel);
  }

  function qq(sel, root) {
    return Array.from((root || document).querySelectorAll(sel));
  }

  function textOf(el) {
    return el ? clean(el.textContent) : '';
  }

  // ── Detect new vs old Reddit ───────────────────────────────────────────────

  var isNew = !!q('shreddit-post, [data-testid="post-container"], [slot="title"]');
  var isOld = !!q('.thing.link, .thing.comment, #siteTable');

  if (!isNew && !isOld) {
    showToast('Could not detect Reddit post structure.', '#f85149');
    return;
  }

  // ── Extract post metadata ──────────────────────────────────────────────────

  var title = '', author = '', subreddit = '', score = '', url = location.href;

  if (isNew) {
    var postEl = q('shreddit-post') || q('[data-testid="post-container"]');
    title     = clean(q('h1, [slot="title"]')?.textContent || document.title);
    author    = clean(postEl?.getAttribute('author') || textOf(q('[data-testid="post_author_link"]')));
    subreddit = clean(postEl?.getAttribute('subreddit-prefixed-name') || textOf(q('[data-testid="subreddit-name"]')));
    score     = clean(postEl?.getAttribute('score') || textOf(q('[id^="vote-arrows"] faceplate-number')));
  } else {
    title     = clean(q('.thing.link .title a, .top-matter .title a')?.textContent || document.title);
    author    = clean(q('.thing.link .author')?.textContent || '');
    subreddit = clean(q('.subreddit, .sitetable .subreddit')?.textContent || '');
    score     = clean(q('.thing.link .score.unvoted, .thing.link .score.likes')?.textContent || '');
  }

  if (!subreddit && location.pathname.match(/\/r\/([^/]+)/)) {
    subreddit = 'r/' + location.pathname.match(/\/r\/([^/]+)/)[1];
  }

  // ── Extract post body ──────────────────────────────────────────────────────

  var postBody = '';
  if (isNew) {
    var bodyEl = q('[slot="text-body"], shreddit-post [data-click-id="text"] .md, .post-content div[data-adclicklocation="text_body"]');
    postBody = bodyEl ? clean(bodyEl.innerText || bodyEl.textContent) : '';
  } else {
    var bodyEl2 = q('.thing.link .usertext-body .md');
    postBody = bodyEl2 ? clean(bodyEl2.innerText || bodyEl2.textContent) : '';
  }

  // ── Extract comments ───────────────────────────────────────────────────────

  var comments = [];

  if (isNew) {
    // New Reddit: shreddit-comment elements
    qq('shreddit-comment').forEach(function (c) {
      var depth   = parseInt(c.getAttribute('depth') || '0', 10);
      var cAuthor = c.getAttribute('author') || '';
      var cScore  = c.getAttribute('score') || '';
      var bodyEl3 = q('[slot="comment"] .md, [slot="comment"] p', c) || q('p', c);
      var text    = bodyEl3 ? clean(bodyEl3.innerText || bodyEl3.textContent) : '';
      if (text && cAuthor) comments.push({ depth: depth, author: cAuthor, score: cScore, text: text });
    });

    // Fallback to generic comment containers
    if (!comments.length) {
      qq('[data-testid="comment"]').forEach(function (c) {
        var cAuthor = textOf(q('[data-testid="comment_author_link"]', c));
        var text    = textOf(q('[data-testid="comment"] .RichTextJSON-root, .Comment .md', c));
        if (text && cAuthor) comments.push({ depth: 0, author: cAuthor, score: '', text: text });
      });
    }
  } else {
    // Old Reddit: .thing.comment
    qq('.thing.comment:not(.deleted)').forEach(function (c) {
      var depth   = parseInt((c.className.match(/depth-(\d+)/) || [, '0'])[1], 10);
      var cAuthor = textOf(q('.author', c));
      var cScore  = textOf(q('.score.unvoted, .score.likes', c));
      var bodyEl4 = q('.usertext-body .md', c);
      var text    = bodyEl4 ? clean(bodyEl4.innerText || bodyEl4.textContent) : '';
      if (text && cAuthor) comments.push({ depth: depth, author: cAuthor, score: cScore, text: text });
    });
  }

  // ── Build Markdown ─────────────────────────────────────────────────────────

  var yaml = [
    '---',
    'title: "' + title.replace(/"/g, '\\"') + '"',
    subreddit ? 'subreddit: ' + subreddit : null,
    author ? 'author: u/' + author : null,
    score ? 'score: ' + score : null,
    'source: "' + url + '"',
    'clipped: ' + today,
    '---',
  ].filter(Boolean).join('\n');

  var md = yaml + '\n\n# ' + title + '\n\n';

  if (author) md += '**u/' + author + '**' + (score ? '  ·  ' + score + ' points' : '') + '\n\n';
  if (postBody) md += postBody + '\n\n';

  if (comments.length) {
    md += '---\n\n## Comments\n\n';
    comments.forEach(function (c) {
      var indent = '  '.repeat(c.depth);
      var line   = indent + '**u/' + c.author + '**' + (c.score ? ' · ' + c.score + ' pts' : '');
      md += line + '\n\n';
      // Indent each line of the comment body
      c.text.split('\n').forEach(function (l) {
        md += indent + (l.trim() ? l : '') + '\n';
      });
      md += '\n';
    });
  }

  md = md.trim() + '\n';

  // ── Copy ──────────────────────────────────────────────────────────────────

  function done() {
    var n = comments.length;
    showToast('✓ Copied' + (n ? ' ' + n + ' comment' + (n !== 1 ? 's' : '') : '') + ' — Markdown in clipboard');
  }

  navigator.clipboard.writeText(md).then(done).catch(function () {
    var ta = document.createElement('textarea');
    ta.value = md;
    ta.style.cssText = 'position:fixed;opacity:0;top:0;left:0';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    try { document.execCommand('copy'); done(); } catch (e) {
      showToast('Could not copy — check browser permissions.', '#f85149');
    }
    ta.remove();
  });

  function showToast(msg, bg) {
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
