# Edge Toolkit

**14 beautiful, zero-install bookmarklets for researchers, writers, AI power users, and anyone who hates friction on the web.**

All tools are **100% client-side**, **privacy-first**, and require **no extensions, no accounts, and no data leaving your browser**.

---

## 🚀 Quick Start

1. Go to [https://edgeof8.github.io/](https://edgeof8.github.io/) (or open `index.html` locally)
2. Drag any tool button to your bookmarks bar
3. Or download the **full bundle** → `edge-bookmarks.html` and import it into your browser

**One click. Instant results. Beautiful output.**

---

## The Tools

| Tool       | What it does                                                                 | Best for                  |
|------------|------------------------------------------------------------------------------|---------------------------|
| **bttn**   | Copy any AI conversation (Claude, ChatGPT, Grok, Google AI Studio) to clean Markdown | AI workflows, note-taking |
| **cite**   | One-click academic citations (APA 7, MLA 9, Chicago, BibTeX, Plain) from any page | Students, researchers     |
| **md-memo**| Save any article or blog post as clean Markdown + YAML frontmatter          | PKM (Obsidian/Notion)     |
| **multi-peek** | Choose from multiple archives (archive.is, Wayback, archive.ph, etc.) to bypass paywalls | Researchers, journalists  |
| **peek**   | Instant redirect to `archive.is/latest/` for paywalled or deleted content    | Quick archive access      |
| **quote**  | Capture selected text as a Markdown blockquote with YAML citation metadata   | Researchers, annotators   |
| **reader** | Distraction-free reading mode — strips ads, sidebars, popups for clean view  | Long-form reading         |
| **stats**  | Instant page statistics: word count, reading time, headings, links, images   | Writers, editors          |
| **toc**    | Generate a beautiful standalone Table of Contents page from any long article | Documentation, research   |
| **x-memo** | Export any X/Twitter thread to clean Markdown with YAML frontmatter          | Social research, threads  |
| **yt-memo**| YouTube video → Markdown with metadata, chapters, description + full transcript | Video notes, learning     |

---

## Philosophy

Every tool in the Edge Toolkit follows the same principles:

- **Dead simple** — one click, instant result
- **Privacy-first** — everything runs in your browser
- **Beautiful output** — clean Markdown, professional citations, elegant overlays
- **Zero dependencies** (or optional CDN only when absolutely necessary)
- **Robust** — works even when sites change their DOM
- **Delightful feedback** — toast notifications + tab title flashes

---

## Installation

### Recommended: Full Bundle
1. Download `edge-bookmarks.html`
2. Open it in your browser
3. Drag the entire "Edge Toolkit" folder into your bookmarks bar (or import via browser settings)

### Individual Tools
Visit any tool page (e.g. `https://edgeof8.github.io/bttn/`) and drag the big button to your bookmarks bar.

All tools use **remote loaders** — the bookmarklet itself stays tiny and always fetches the latest version from GitHub Pages.

---

## Development

The project uses a simple build system:

```bash
node build.js
```

This:
- Discovers all tools (folders with `PRD.md`)
- Minifies the main JS file
- Updates each tool's `index.html` with the fresh bookmarklet
- Generates `edge-bookmarks.html` (Netscape bookmark file)
- Rebuilds the main landing page (`index.html`)

Each tool lives in its own folder with:
- `PRD.md` — product requirements
- `index.html` — beautiful landing page + bookmarklet
- `*.js` — the actual bookmarklet logic

---

## Contributing

We love contributions! Please open an issue or PR if you:

- Find a bug on a specific site
- Want to add support for a new platform
- Have ideas for new tools

All code is MIT licensed.

---

## License

MIT © edgeof8

---

**Made for the open web. Built to last.**

[GitHub](https://github.com/edgeof8) • [Issues](https://github.com/edgeof8/edge-utils/issues)