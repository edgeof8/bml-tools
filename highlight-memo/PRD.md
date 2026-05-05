# PRD: highlight-memo

**Collect multiple highlights while reading and export them all at once as a Markdown list.**

## Overview

`highlight-memo` is a session-based highlighter for deep reading. Instead of copying quotes one by one, users highlight text and click the bookmarklet to add it to a local queue. When finished reading, a final click (with no text selected) exports the entire collection as a clean Markdown list with YAML frontmatter.

## Behavior

1. **Capture Mode**: If text is selected:
    - Add trimmed selection to `localStorage` (scoped to current URL).
    - Show toast: "✓ Highlight [N] captured — click again to export all".
2. **Export Mode**: If no text is selected:
    - Retrieve all highlights from `localStorage` for the current URL.
    - If queue is empty: Show hint toast ("Select text to start capturing").
    - If queue has items:
        - Format as Markdown: YAML frontmatter (Title, URL, Date, Count) + Bulleted list of highlights.
        - Copy to clipboard.
        - Clear the queue for this URL.
        - Show success toast.

## Technical Constraints

- Session-based: Uses `localStorage` to survive page refreshes, but clears once exported.
- Zero external dependencies.
- Target size: < 1.5 KB minified.
- Key format: `edge_highlight_memo_[URL]`.

## Output Format

Standard Markdown list with YAML frontmatter. Highlights have internal newlines collapsed into spaces for clean bullet points.