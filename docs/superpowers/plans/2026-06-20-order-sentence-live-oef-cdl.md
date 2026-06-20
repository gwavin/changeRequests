# Order Sentence Live OEF and CDL Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add progressively populated, read-only OEF and CDL request mockups to the guided Order Sentence journey and downloaded HTML review.

**Architecture:** Introduce a pure `os-preview.js` renderer responsible for safe OEF/CDL HTML and field-to-question metadata. The generic journey UI mounts that renderer for Order Sentence, refreshes it after every answer, and enables click-to-question navigation only at final review. The exporter reuses the same renderer.

**Tech Stack:** Static HTML, CSS, vanilla JavaScript, Node test runner.

---

### Task 1: Pure Order Sentence preview renderer

**Files:**
- Create: `assets/js/os-preview.js`
- Create: `tests/os-preview.test.js`
- Modify: `index.html`

- [ ] Write failing tests for OEF fields, OEF selection sentence, CDL line, escaping, `Not specified`, skipped values, PRN/filter content, and Remove suppression.
- [ ] Run the focused test and verify RED because the renderer does not exist.
- [ ] Implement pure `render(data, options)` and `model(data)` functions with field-to-question mappings.
- [ ] Run focused tests and verify GREEN.

### Task 2: Complete build questions and live journey integration

**Files:**
- Modify: `assets/js/journey.js`
- Modify: `assets/js/journey-ui.js`
- Modify: `assets/js/schemas.js`
- Modify: `assets/css/styles.css`
- Modify: `tests/journey.test.js`

- [ ] Add failing sequence tests for give-first-dose, duration unit, order instructions, order comments, and conditional age/PMA/weight filters.
- [ ] Extend structured Order Sentence questions and schema fields.
- [ ] Add a side-by-side preview region below the growing summary for Order Sentence; stack it on mobile.
- [ ] Refresh previews after each answer and keep them read-only during entry.
- [ ] At review, bind preview buttons to `goTo(fieldKey)` and preserve keyboard focus.

### Task 3: Download reuse and end-to-end verification

**Files:**
- Modify: `assets/js/exporters.js`
- Modify: `tests/exporters.test.js`
- Modify: `README.md`
- Modify: `docs/CHANGELOG.md`

- [ ] Add a failing exporter test requiring the OEF/CDL mockup in Order Sentence HTML downloads.
- [ ] Reuse `MnCmsOsPreview.render` from `builtPreview` and add matching download CSS.
- [ ] Document live preview behaviour and reference source.
- [ ] Run the complete suite, syntax checks, `git diff --check`, and sensitive-content scan.
- [ ] Complete Add browser flow, verify progressive updates and click-to-question review navigation, inspect mobile layout and console logs.
- [ ] Commit the scoped implementation on `codex/order-sentence-live-previews`.
