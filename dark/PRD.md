# PRD: dark

**Toggle dark mode on any website with one click.**

## Overview

`dark` inverts the page colours using a CSS filter, making any bright site comfortable to read in low-light environments. Clicking again restores the original appearance. Images, videos, and canvases are counter-inverted so they remain visually correct.

## Behavior

1. First click: applies `filter: invert(1) hue-rotate(180deg)` to `<html>`; injects a `<style>` that counter-inverts `img, video, canvas, iframe, svg, picture`
2. Second click (toggle off): removes both the filter and the injected style
3. Toggle state is stored in a `data-` attribute on `<html>` — survives DOM mutations, safe to check on re-click

## Technical Constraints

- Zero external dependencies
- No toast needed (visual change is immediately obvious)
- Toggle must survive SPA route changes that don't do a full page reload (data attribute persists)
- Target size: < 200 B minified
