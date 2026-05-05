# PRD: links

**Extract all external links from any page as a Markdown list.**

## Overview

`links` collects every unique outbound hyperlink from the current page, deduplicates them, and copies a clean Markdown list to the clipboard — with YAML frontmatter noting the source and date. Ideal for building reference lists, link roundups, and research bibliographies.

## Target Users

- Researchers compiling references from a resource page or article
- Writers building link roundups or newsletters
- Developers auditing outbound links on a page
- Anyone who wants to save the "further reading" section of an article

## Behavior

1. Queries all `<a href>` elements on the page
2. Filters to external links only (different hostname from current page)
3. Deduplicates by normalising to `origin + pathname + search` (strips fragments and `utm_*` noise stays, users can clean if needed)
4. Skips `javascript:`, `mailto:`, and `tel:` links
5. Skips anchors with no readable text (< 2 characters)
6. Emits YAML frontmatter + `## Links from: {page title}` heading + Markdown list
7. Copies to clipboard
8. Toast: "✓ Copied 24 links — Markdown in clipboard"
9. If no external links found: error toast

## Output Format

```markdown
---
source: "https://example.com/article"
clipped: 2026-05-05
---

## Links from: Example Article Title

- [Attention Is All You Need](https://arxiv.org/abs/1706.03762)
- [Stanford NLP Group](https://nlp.stanford.edu)
- [The Annotated Transformer](https://nlp.seas.harvard.edu/2018/04/03/attention.html)
```

## Technical Constraints

- Zero external dependencies
- Self-contained toast
- Internal links (same hostname) excluded
- Deduplication on canonical URL (origin + pathname + search)
- Link text cleaned: whitespace collapsed, `[` and `]` stripped to avoid breaking Markdown
- Target size: < 1.5 KB minified
