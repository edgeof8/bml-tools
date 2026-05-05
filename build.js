// build.js
const fs = require('fs');
const path = require('path');
const { minify } = require('terser');
const { execSync } = require('child_process');

const BASE_URL = 'https://edgeof8.github.io';
const SIZE_WARN_KB = 8;   // warn if minified bookmarklet exceeds this
const WATCH_MODE = process.argv.includes('--watch');

async function build() {
  console.log('🏗️  Edge Toolkit: Master Builder Starting...');

  // Load per-tool display config (icon, desc, meta tags)
  const toolsConfigPath = path.join(__dirname, 'tools.json');
  const toolsConfig = fs.existsSync(toolsConfigPath)
    ? JSON.parse(fs.readFileSync(toolsConfigPath, 'utf8'))
    : [];
  const configById = Object.fromEntries(toolsConfig.map(t => [t.id, t]));

  // Discover active tools: folders with a PRD.md and a matching <folder>.js file
  const allDirs = fs.readdirSync(__dirname, { withFileTypes: true })
    .filter(d => d.isDirectory() && !d.name.startsWith('.') && d.name !== 'node_modules')
    .map(d => d.name);

  const tools = [];

  for (const dir of allDirs) {
    const prdPath = path.join(__dirname, dir, 'PRD.md');
    if (!fs.existsSync(prdPath)) continue;

    const jsPath = path.join(__dirname, dir, `${dir}.js`);
    if (!fs.existsSync(jsPath)) continue;

    const cfg = configById[dir] || {};
    const prdContent = fs.readFileSync(prdPath, 'utf8');

    // Fall back to PRD.md parsing if no tools.json entry
    let name = cfg.name || dir;
    let desc = cfg.desc;
    if (!desc) {
      const lines = prdContent.split('\n');
      for (const line of lines) {
        const m = line.match(/^\*\*([^*]+)\*\*/);
        if (m && !line.toLowerCase().includes('prd:')) { desc = m[1].trim(); break; }
      }
      desc = desc || `Markdown utility for ${name}`;
    }

    tools.push({
      id: dir,
      jsPath,
      name,
      desc,
      icon: cfg.icon || '🔧',
      meta: cfg.meta || [],
      pageUrl: `${BASE_URL}/${dir}/`
    });

    console.log(`🔎 Found: ${name}`);
  }

  let loadersJs = '';
  let toolCardsHtml = '';
  let bookmarkFolderHtml = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks</H1>
<DL><p>
    <DT><H3>Edge Toolkit</H3>
    <DL><p>\n`;

  for (const tool of tools) {
    const toolDir = path.dirname(tool.jsPath);
    const packageJsonPath = path.join(toolDir, 'package.json');

    if (fs.existsSync(packageJsonPath)) {
      console.log(`📦 Installing dependencies for ${tool.name}...`);
      try {
        execSync('npm install', { cwd: toolDir, stdio: 'inherit' });
      } catch (err) {
        console.error(`❌ npm install failed for ${tool.name}:`, err.message);
      }
    }

    const rawCode = fs.readFileSync(tool.jsPath, 'utf8');

    const minified = await minify(rawCode, {
      compress: { drop_console: true, passes: 2 },
      mangle: true
    });

    const safeCode = encodeURIComponent(minified.code)
      .replace(/'/g, '%27')
      .replace(/"/g, '%22');

    const bookmarkletUrl = `javascript:(function(){${safeCode}})();`;

    // Size budget check
    const sizeKb = bookmarkletUrl.length / 1024;
    if (sizeKb > SIZE_WARN_KB) {
      console.warn(`⚠️  ${tool.name} is ${sizeKb.toFixed(1)} KB — consider splitting via remote loader`);
    }

    // Loader URL for remote delivery (stays tiny, always fetches latest)
    const loaderUrl = `javascript:(function(){var s=document.createElement('script');s.src='${BASE_URL}/${tool.id}/${tool.id}.js?v='+Date.now();document.body.appendChild(s);})()`;

    // Update the tool's own index.html bookmarklet hrefs
    const subIndexPath = path.join(toolDir, 'index.html');
    if (fs.existsSync(subIndexPath)) {
      let html = fs.readFileSync(subIndexPath, 'utf8');
      const updated = html.replace(/href="javascript:[^"]*"/g, `href="${bookmarkletUrl}"`);
      if (html !== updated) {
        fs.writeFileSync(subIndexPath, updated);
        console.log(`   📝 Updated ${tool.id}/index.html`);
      }
    }

    const metaHtml = tool.meta.length
      ? `<div class="meta">${tool.meta.map(t => `<span>${t}</span>`).join(' • ')}</div>`
      : '';

    toolCardsHtml += `
      <div class="tool-card">
        <div class="icon">${tool.icon}</div>
        <h3>${tool.name}</h3>
        <p class="desc">${tool.desc}</p>
        ${metaHtml}
        <div class="actions">
          <a href="${tool.pageUrl}" class="tool-link">Visit page</a>
          <a data-tool="${tool.id}" class="bookmarklet" onclick="handleBookmarkletClick(event, this)">⬇ Drag to bar</a>
        </div>
      </div>\n`;

    loadersJs += `      '${tool.id}': "${loaderUrl}",\n`;

    bookmarkFolderHtml += `        <DT><A HREF="${bookmarkletUrl}">${tool.name}</A>\n`;

    console.log(`✅ Built: ${tool.name} (${sizeKb.toFixed(2)} KB)`);
  }

  bookmarkFolderHtml += `    </DL><p>\n</DL><p>`;
  fs.writeFileSync(path.join(__dirname, 'edge-bookmarks.html'), bookmarkFolderHtml);
  console.log('📁 Created edge-bookmarks.html');

  // Generate landing page from template
  const templatePath = path.join(__dirname, 'template.html');
  let template = fs.existsSync(templatePath)
    ? fs.readFileSync(templatePath, 'utf8')
    : fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

  const finalHtml = template
    .replace('<!-- INJECT_TOOLS_HERE -->', toolCardsHtml)
    .replace('<!-- INJECT_LOADERS_HERE -->', loadersJs.trimEnd());

  fs.writeFileSync(path.join(__dirname, 'index.html'), finalHtml);
  console.log('🌐 Created index.html');

  console.log('🚀 Build complete!');
}

// ── Watch mode ──────────────────────────────────────────────────────────────
if (WATCH_MODE) {
  console.log('👀 Watch mode active — watching tool JS files for changes...\n');

  let debounceTimer = null;
  const rebuild = () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      console.log('\n🔄 Change detected — rebuilding...\n');
      build().catch(err => console.error('❌ Build error:', err.message));
    }, 300);
  };

  // Initial build
  build().then(() => {
    // Watch each tool folder for .js changes
    const toolDirs = fs.readdirSync(__dirname, { withFileTypes: true })
      .filter(d => d.isDirectory() && !d.name.startsWith('.') && d.name !== 'node_modules')
      .map(d => d.name);

    for (const dir of toolDirs) {
      const jsPath = path.join(__dirname, dir, `${dir}.js`);
      if (fs.existsSync(jsPath)) {
        fs.watch(jsPath, rebuild);
      }
    }

    // Also watch tools.json and template.html
    for (const f of ['tools.json', 'template.html']) {
      const fp = path.join(__dirname, f);
      if (fs.existsSync(fp)) fs.watch(fp, rebuild);
    }

    console.log('\n👀 Watching. Press Ctrl+C to stop.');
  }).catch(err => {
    console.error('❌ Initial build failed:', err.message);
    process.exit(1);
  });
} else {
  build().catch(err => {
    console.error('❌ Build failed:', err.message);
    process.exit(1);
  });
}
