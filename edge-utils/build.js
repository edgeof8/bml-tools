// build.js
const fs = require('fs');
const path = require('path');
const { minify } = require('terser');
const { execSync } = require('child_process');

async function build() {
  console.log('🏗️  Edge Toolkit: Master Builder Starting...');

  // 1. Discover active tools (folders with a PRD.md and a main JS file)
  const allDirs = fs.readdirSync(__dirname, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory() && !dirent.name.startsWith('.') && dirent.name !== 'node_modules')
    .map(dirent => dirent.name);

  const tools = [];

  for (const dir of allDirs) {
    const prdPath = path.join(__dirname, dir, 'PRD.md');
    if (!fs.existsSync(prdPath)) continue;

    // Assume the main JS file follows the pattern: folder/folder.js
    const jsFile = path.join(dir, `${dir}.js`);
    const jsPath = path.join(__dirname, jsFile);
    
    if (fs.existsSync(jsPath)) {
      const prdContent = fs.readFileSync(prdPath, 'utf8');
      
      // Extract Name: looking for "# PRD: Name" or "**PRD: Name**"
      const nameMatch = prdContent.match(/(?:PRD|Document):\s*\**([\w-]+)\**/i);
      const toolName = nameMatch ? nameMatch[1] : dir;

      // Extract Description: find the first bold line that provides a summary
      const lines = prdContent.split('\n');
      let toolDesc = `Markdown utility for ${toolName}`;
      for (const line of lines) {
        const m = line.match(/^\*\*([^*]+)\*\*/);
        if (m && !line.toLowerCase().includes('prd:')) {
          toolDesc = m[1].trim();
          break;
        }
      }

      tools.push({ id: dir, file: jsFile, folder: dir, name: toolName, desc: toolDesc });
      console.log(`🔎 Found active tool: ${toolName}`);
    }
  }

  let landingLinksHtml = '';
  let bookmarkFolderHtml = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks</H1>
<DL><p>
    <DT><H3>Edge Toolkit</H3>
    <DL><p>\n`;

  for (const tool of tools) {
    const toolDir = path.join(__dirname, tool.folder);
    const packageJsonPath = path.join(toolDir, 'package.json');

    if (fs.existsSync(packageJsonPath)) {
      console.log(`📦 Installing dependencies for ${tool.name}...`);
      try {
        execSync('npm install', { cwd: toolDir, stdio: 'inherit' });
      } catch (error) {
        console.error(`❌ Failed to install dependencies for ${tool.name}:`, error.message);
      }
    }
    
    const rawCode = fs.readFileSync(path.join(__dirname, tool.file), 'utf8');
    
    // 1. Minify the code
    const minified = await minify(rawCode, {
      compress: { drop_console: true, passes: 2 },
      mangle: true
    });

    // 2. Wrap in bookmarklet protocol & URI encode specifically for bookmarks
    const safeCode = encodeURIComponent(minified.code)
      .replace(/'/g, '%27')
      .replace(/"/g, '%22');
    
    const bookmarkletUrl = `javascript:(function(){${safeCode}})();`;

    // 3. Update the tool's own index.html if it exists
    const subIndexPath = path.join(toolDir, 'index.html');
    if (fs.existsSync(subIndexPath)) {
      let subIndexHtml = fs.readFileSync(subIndexPath, 'utf8');
      // Replace any existing javascript:... bookmarklet links
      const updatedHtml = subIndexHtml.replace(/href="javascript:[^"]*"/g, `href="${bookmarkletUrl}"`);
      if (subIndexHtml !== updatedHtml) {
        fs.writeFileSync(subIndexPath, updatedHtml);
        console.log(`   📝 Updated ${tool.folder}/index.html`);
      }
    }

    // 4. Add to the Landing Page HTML chunk
    landingLinksHtml += `
      <div class="tool-card">
        <h3>${tool.name}</h3>
        <p>${tool.desc}</p>
        <a class="bookmarklet" href="${bookmarkletUrl}">${tool.name}</a>
      </div>\n`;
    
    // 5. Add to the Bookmark Import File HTML chunk
    bookmarkFolderHtml += `        <DT><A HREF="${bookmarkletUrl}">${tool.name}</A>\n`;
    
    console.log(`✅ Built: ${tool.name} (${(bookmarkletUrl.length / 1024).toFixed(2)} kb)`);
  }
  
  bookmarkFolderHtml += `    </DL><p>\n</DL><p>`;
  
  // 6. Write the Bookmark Import File
  fs.writeFileSync(path.join(__dirname, 'edge-bookmarks.html'), bookmarkFolderHtml);
  console.log('📁 Created edge-bookmarks.html (Ready for browser import)');
  
  // 7. Generate the Landing Page
  const templatePath = path.join(__dirname, 'template.html');
  let template;
  if (fs.existsSync(templatePath)) {
    template = fs.readFileSync(templatePath, 'utf8');
  } else {
    // Fallback: use root index.html as a template if template.html is missing
    template = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
  }

  const finalHtml = template.replace('<!-- INJECT_TOOLS_HERE -->', landingLinksHtml);
  fs.writeFileSync(path.join(__dirname, 'index.html'), finalHtml);
  console.log('🌐 Created index.html (Landing page updated)');
  
  console.log('🚀 Build complete!');
}

build();