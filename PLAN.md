# Edge Toolkit — Development Plan

Last updated: 2026-05-05

---

## Current State

11 tools. 10 are git submodules under `github.com/edgeof8/`. `quote` lives directly in this repo as the newest addition.

| Tool | Source JS | PRD.md | Build-discoverable |
|---|---|---|---|
| bttn | bttn.js (5 KB) | ❌ missing | ❌ not built |
| cite | cite.js (14 KB) | ✅ | ✅ |
| md-memo | md-memo.js (4 KB) | ✅ | ✅ |
| multi-peek | multi-peek.js (4 KB) | ✅ | ✅ |
| peek | peek.js (340 B) | ✅ | ✅ |
| quote | quote.js (4 KB) | ✅ | ✅ |
| reader | reader.js (7 KB) | ✅ | ✅ |
| stats | stats.js (15 KB) | ✅ | ✅ |
| toc | toc.js (5 KB) | ✅ | ✅ |
| x-memo | x-memo.js (9 KB) | ✅ | ✅ |
| yt-memo | yt-memo.js (12 KB) | ✅ | ✅ |

---

## Phase 1 — Fix Infrastructure (Immediate)

### 1.1 Add PRD.md to `bttn`

`bttn` is the flagship tool and the only one the build system silently skips. The fix must happen in its submodule repo (`github.com/edgeof8/bttn`), not here.

- Write a `PRD.md` in the `bttn/` submodule matching the format used by all other tools
- Commit in the `bttn` repo, then update the submodule pointer here

### 1.2 Audit and sync submodule pointers

Several submodules show `toc` as having new commits ahead of the pointer recorded in this repo. Run a full audit:

```bash
git submodule status
git submodule update --remote --merge
```

Decide per-tool whether to advance the pointer or pin it.

### 1.3 Add a `package.json` at root

Currently `build.js` depends on `terser` with no root `package.json`. First-time setup requires knowing to run `npm install terser` manually.

- Add `package.json` with `terser` as a dev dependency and a `"build": "node build.js"` script
- Add `node_modules/` to `.gitignore` if not already present

### 1.4 Verify `quote` submodule or promote to submodule

`quote/` currently lives directly in this repo (not a submodule). Decide:
- **Option A (recommended):** Create `github.com/edgeof8/quote`, move code there, add as submodule — consistent with all other tools, gets its own GitHub Pages deploy
- **Option B:** Keep it local if standalone deploy isn't needed yet

---

## Phase 2 — Tool Quality Pass

Each tool should be reviewed against these standards before being considered stable:

- [ ] Source JS is under its PRD's stated size target when minified
- [ ] Works on the 5 most common domains for its use case
- [ ] Error handling: shows a clear toast on failure, never throws uncaught exceptions
- [ ] No `console.log` or debug artifacts in source (Terser drops them on build, but keep source clean)
- [ ] Landing `index.html` has a working drag button (href wired via JS, not `href="#"`)

### Priority order (by user impact)

1. **yt-memo** — highest complexity, YouTube changes DOM frequently; likely the most broken
2. **x-memo** — heavy virtualization on X makes extraction fragile
3. **bttn** — flagship tool, needs PRD.md (blocks build), worth a full test pass
4. **stats** — largest source file (15 KB); review for dead code / optimization opportunities
5. **cite** — 14 KB source for what is conceptually a small tool; may have bloat

---

## Phase 3 — New Tools

Candidates ranked by fit with the existing audience (researchers, writers, PKM users):

### 3.1 `reddit-memo` — Export Reddit threads to Markdown

Mirror of `x-memo` for Reddit. Exports post + top-level comments as Markdown with YAML frontmatter. Reddit's DOM is far more stable than X's, so this is tractable.

```markdown
---
title: "Thread title"
subreddit: r/MachineLearning
author: u/username
source: "https://reddit.com/r/..."
clipped: 2026-05-05
---

**u/username** · 42 points

> The main argument here is...

**u/replier** · 18 points

> I disagree because...
```

### 3.2 `gh-memo` — Export GitHub issues / PRs / discussions to Markdown

Extracts issue body + comment thread from any `github.com/*/issues/*` or `*/pull/*` URL. Useful for developers tracking decisions made in issues, and for feeding context into AI tools.

### 3.3 `links` — Extract all links from a page as a Markdown list

Produces a deduplicated, sorted list of all external links on a page — with link text and URL — copied as Markdown. Useful for link roundups, research bibliographies, and site audits.

```markdown
## Links from: Example Article

- [Paper: Attention Is All You Need](https://arxiv.org/abs/1706.03762)
- [Stanford NLP Group](https://nlp.stanford.edu)
...
```

### 3.4 `pdf-memo` — Extract text from browser-rendered PDFs

When a PDF is open in Chrome/Firefox's built-in viewer, extract the visible text layer as Markdown with YAML metadata. Simpler than it sounds — the text layer is in the DOM under `.page` elements in Chrome's viewer.

### 3.5 `dark` — Toggle dark mode on any site

Injects a CSS filter (`invert(1) hue-rotate(180deg)`) as a toggle on any page. Lighter alternative to reader mode for sites with good layout but bad contrast. Extremely small (< 200 B minified).

---

## Phase 4 — Distribution & Discoverability

### 4.1 GitHub Pages deploy

Each tool's `index.html` is already structured for GitHub Pages. The missing piece is confirming the Pages configuration in each submodule repo deploys from `main` branch root.

Validate all 11 tool pages are live at `https://edgeof8.github.io/{tool}/`.

### 4.2 Landing page at `edgeof8.github.io`

The root `index.html` (generated by `build.js` from `template.html`) is the landing page. It needs to be the default at `https://edgeof8.github.io/`. Confirm the `edgeof8.github.io` repo (or this repo's Pages config) serves it.

### 4.3 Build CI

Add a GitHub Actions workflow that runs `node build.js` on push to `main` and commits the updated `index.html` and `edge-bookmarks.html` back to the repo. This keeps the built artifacts always in sync without manual runs.

```yaml
# .github/workflows/build.yml
on:
  push:
    branches: [main]
  workflow_dispatch:
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          submodules: recursive
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: node build.js
      - uses: stefanzweifel/git-auto-commit-action@v5
        with:
          commit_message: "build: regenerate index.html and edge-bookmarks.html"
          file_pattern: "index.html edge-bookmarks.html"
```

---

## Phase 5 — Developer Experience

### 5.1 Watch mode for `build.js`

Add `--watch` flag that uses `fs.watch` to rebuild when any `*.js` file in a tool folder changes. Makes local development faster.

### 5.2 Per-tool test pages

Several tools already have `test.html` files. Standardize: every tool should have a `test.html` with at least three example pages/states that exercise the main output paths.

### 5.3 Size budget enforcement in build

The build currently logs size but doesn't enforce limits. Add a check that warns (or fails) when a minified bookmarklet exceeds a configurable limit (e.g., 10 KB). Some browsers have `javascript:` URL length limits around 64 KB, but user experience degrades well before that.

```js
const SIZE_WARN_KB = 8;
if (bookmarkletUrl.length / 1024 > SIZE_WARN_KB) {
  console.warn(`⚠️  ${tool.name} is ${(bookmarkletUrl.length/1024).toFixed(1)} KB — consider splitting`);
}
```

---

## Conventions (applied to all tools)

- **File naming:** `{toolname}/{toolname}.js` — the build discovers via this pattern
- **PRD.md required:** every tool must have one for build discovery
- **Toast:** use the inline toast pattern (self-contained) so each tool has zero runtime dependencies beyond what the browser provides
- **YAML frontmatter:** clipping tools (md-memo, x-memo, yt-memo, bttn, quote) all emit consistent YAML — keep `source`, `clipped` as required keys; `author`, `site`, `tags` as optional
- **No `console.log` in source** — Terser drops them but they're noise during dev; use the toast for user-facing feedback
- **Build owns `index.html`** — never hand-edit the root `index.html`; edit `template.html` or `tools.json` instead
