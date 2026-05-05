# PRD: quote

**Capture any selected text as a Markdown blockquote with full citation metadata.**

## Overview

`quote` is a one-click bookmarklet for researchers, students, and writers. Select any text on any page, fire the bookmarklet, and get a clean Markdown blockquote with YAML frontmatter and an attribution line — ready to paste into Obsidian, Notion, or any Markdown editor.

## Target Users

- Researchers collecting quotes from articles and papers
- Students building annotated bibliographies
- Writers gathering source material
- Anyone doing web-based research who uses a PKM tool

## Behavior

1. User selects text on any webpage
2. User clicks the bookmarklet
3. The tool reads the selection plus page metadata (title, URL, author, site name, date)
4. Formats it as Markdown: YAML frontmatter + blockquote lines + attribution
5. Copies to clipboard
6. Shows toast: "✓ Quoted 42 words — copied to clipboard"

If no text is selected, shows an error toast: "Select some text first, then click quote."

## Output Format

```markdown
---
source: "https://example.com/article"
site: "example.com"
author: "Jane Smith"
clipped: 2026-05-05
---

> First line of the selected text.
> Second line continues here.
>
> — Jane Smith, [Article Title](https://example.com/article)
```

## Metadata Extraction

- **URL**: `window.location.href`
- **Title**: `document.title`
- **Author**: `<meta name="author">`, `<meta property="article:author">`, `<meta property="og:author">`
- **Site name**: `<meta property="og:site_name">` or hostname with `www.` stripped
- **Date**: ISO date of capture (`new Date().toISOString().slice(0, 10)`)

Author and site_name are omitted from YAML if not found.

## Technical Constraints

- Must work on any page (no DOM assumptions beyond standard meta tags)
- Zero external dependencies
- Self-contained toast notification (inline, no edge-utils.js dependency)
- Target size: < 1.5 KB minified
- Clipboard: navigator.clipboard with execCommand fallback
- No mutation of the page DOM beyond the transient toast
