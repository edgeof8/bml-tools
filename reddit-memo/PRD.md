# PRD: reddit-memo

**Export any Reddit thread to clean Markdown with YAML frontmatter.**

## Overview

`reddit-memo` captures the post title, body, author, score, subreddit, and visible comment tree from any Reddit thread page — and formats it as structured Markdown with YAML frontmatter, ready for Obsidian, Notion, or AI context.

## Target Users

- Researchers saving Reddit discussions for reference
- Writers capturing community perspectives or quotes
- Anyone building a second brain who uses Reddit as a source
- Developers feeding Reddit thread context into AI tools

## Supported Variants

| Variant | Detection |
|---|---|
| New Reddit (SFW & NSFW) | `shreddit-post`, `[data-testid="post-container"]` |
| Old Reddit (`old.reddit.com`) | `.thing.link`, `.thing.comment` |
| Generic fallback | `[data-testid="comment"]` |

## Behavior

1. Validates that `location.hostname.includes('reddit.com')` — error toast on any other site
2. Detects new vs old Reddit by DOM signature
3. Extracts from post: title, author, subreddit, score, body text (if text post)
4. Extracts from comment tree: author, score, depth (for indentation), body text
5. Skips deleted/removed comments (no author text)
6. Builds YAML frontmatter + Markdown document
7. Copies to clipboard
8. Toast: "✓ Copied 42 comments — Markdown in clipboard"

## Output Format

```markdown
---
title: "Why is the sky blue? A physics explanation"
subreddit: r/explainlikeimfive
author: u/OP_username
score: 4821
source: "https://reddit.com/r/explainlikeimfive/comments/..."
clipped: 2026-05-05
---

# Why is the sky blue? A physics explanation

**u/OP_username**  ·  4821 points

The phenomenon is called Rayleigh scattering...

---

## Comments

**u/TopCommenter** · 2341 pts

Great question! The short answer is...

  **u/Replier** · 891 pts

  To add to that — the wavelength dependence...
```

## Technical Constraints

- Only runs on `reddit.com` (guard check + error toast otherwise)
- Zero external dependencies
- Self-contained toast
- Depth-based indentation for nested comments (2 spaces per level)
- Handles both `shreddit-comment` (new Reddit) and `.thing.comment` (old Reddit)
- Deleted/removed comments skipped (no usable author)
- Target size: < 3 KB minified
