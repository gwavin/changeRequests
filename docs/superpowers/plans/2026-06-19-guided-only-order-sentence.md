# Guided-Only Order Sentence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a complete one-question-at-a-time Order Sentence journey and remove expert-mode choices from completed guided journeys.

**Architecture:** Generalise the existing journey model and renderer to use the active request type, then add an Order Sentence definition using existing schema keys. Order Catalog and Order Sentence use guided-only entry; other request types retain their current form during the sequential transition.

**Tech Stack:** Static HTML, CSS, vanilla JavaScript, Node test runner.

---

### Task 1: Define Order Sentence journey behaviour

**Files:**
- Modify: `tests/journey.test.js`
- Modify: `tests/core.test.js`
- Modify: `assets/js/journey.js`
- Modify: `assets/js/core.js`

- [ ] Add failing tests for site/liaison-first sequence, Add/Modify/Remove branches, conditional PRN and filter details, required reference and clinical confirmation, and derived metadata.
- [ ] Run focused tests and confirm they fail for missing Order Sentence definitions.
- [ ] Implement the smallest Order Sentence definition and validation needed to pass.
- [ ] Run focused and complete tests.

### Task 2: Generalise the guided renderer

**Files:**
- Modify: `assets/js/journey-ui.js`
- Modify: `assets/js/app.js`
- Modify: `index.html`

- [ ] Pass the active type ID, label, review columns, and row builder into the renderer instead of hard-coding Order Catalog.
- [ ] Make Order Catalog and Order Sentence start guided-only and remove expert escape controls from their journey screens.
- [ ] Remove the global guidance-mode panel and its event bindings.
- [ ] Keep IV Set, Care Plan, and SN Anaesthesia functional through the existing form during transition.

### Task 3: Complete Order Sentence review and verification

**Files:**
- Modify: `assets/js/journey.js`
- Modify: `assets/js/journey-ui.js`
- Modify: `assets/js/schemas.js`
- Modify: `README.md`
- Modify: `docs/CHANGELOG.md`

- [ ] Render an assembled Order Sentence review showing medication, dose, unit, route, frequency, PRN, duration, filters, reference, and unresolved details.
- [ ] Preserve local drafts and existing HTML/CSV exporters.
- [ ] Document the guided-only transition and Order Sentence behaviour.
- [ ] Run `npm test`, syntax checks, `git diff --check`, sensitive-content scan, and desktop/mobile browser smoke checks.
- [ ] Commit the scoped implementation on `codex/guided-only-order-sentence`.
