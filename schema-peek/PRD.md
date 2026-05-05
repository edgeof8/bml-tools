# PRD: schema-peek

**Inspect all hidden JSON-LD / Schema.org metadata on any page in a readable overlay.**

## Overview

`schema-peek` extracts every `<script type="application/ld+json">` block from the page and displays the parsed data in a clean, dark-mode inspector panel. Useful for SEO auditors, researchers, and developers who want to see the structured data embedded in articles, recipes, products, and events — data that is invisible in normal browsing but drives search engine rich results.

## Behavior

1. Queries all `script[type="application/ld+json"]` elements
2. Parses each block as JSON; surfaces parse errors for malformed blocks
3. Opens a fixed overlay showing each block with its `@type` label, formatted JSON, and an individual Copy button
4. A "Copy All" button copies all blocks joined by `---` separators
5. Closes on Escape or backdrop click
6. If no blocks found: error toast and exit

## Output (Copy All format)

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Example Article",
  "author": { "@type": "Person", "name": "Jane Smith" }
}
```

## Technical Constraints

- Zero external dependencies
- No page mutation beyond injecting the overlay div
- Works on SPAs (runs at click time, not page load)
- Target size: < 2 KB minified
