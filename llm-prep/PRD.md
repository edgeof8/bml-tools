# PRD: llm-prep

**Extract any article's main content and wrap it in a ready-to-paste AI prompt.**

## Overview

`llm-prep` uses Readability.js + Turndown to extract the main content from any article, minifies it (removes excess whitespace), wraps it in a customizable prompt template, and copies the result to clipboard — ready to paste directly into Claude, ChatGPT, or any LLM interface.

## Behavior

1. Clones the document and loads Readability.js + Turndown.js from CDN
2. Extracts article body and converts to clean Markdown
3. Falls back to `article`/`main`/`body` `innerText` if Readability can't parse
4. Collapses excess whitespace (no triple blank lines, no trailing spaces)
5. Wraps in prompt template: `"Here is an article titled '{title}'. Please summarize the core arguments in 5 bullet points. Article: {content}"`
6. Copies assembled prompt to clipboard
7. Shows toast with word count: "✓ llm-prep: ~1,240 words — paste into any AI"

## Output Format

```
Here is an article titled "The Future of Renewable Energy". Please summarize the core arguments in 5 bullet points.

Article:

# The Future of Renewable Energy

Solar and wind capacity has grown by...
```

## Technical Constraints

- Uses same CDN stack as md-memo (Readability 0.4.1, Turndown 7.1.1)
- Falls back gracefully if CDN is blocked by site CSP
- Target size: < 1.5 KB minified (before CDN load)
