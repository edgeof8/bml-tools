# PRD: table-memo

**Convert the most data-rich HTML table on the page to a clean Markdown table.**

## Overview

`table-memo` detects all `<table>` elements on any page, picks the one with the most cells (the main data table), and converts it to a properly-formatted Markdown table copied directly to the clipboard. Ideal for researchers extracting data trapped in HTML.

## Behavior

1. Scans the page for all `<table>` elements
2. Selects the table with the highest total cell count
3. Converts it to Markdown: pipes, header separator row
4. Copies to clipboard
5. Shows toast: "✓ Copied 12×5 table as Markdown"
6. If no tables found: error toast

## Output Format

```markdown
| Name | Value | Unit | Source | Year |
| --- | --- | --- | --- | --- |
| Carbon dioxide | 412 | ppm | NOAA | 2023 |
| Methane | 1922 | ppb | NOAA | 2023 |
```

## Technical Constraints

- Zero external dependencies
- Works on any page including Wikipedia data tables, financial tables, comparison grids
- Pipe characters inside cells are escaped as `\|`
- Nested tables: uses `table.rows` (direct children only) to avoid double-counting
- Target size: < 1 KB minified
