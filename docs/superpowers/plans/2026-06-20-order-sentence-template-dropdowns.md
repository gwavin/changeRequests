# Order Sentence Template Dropdowns Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every guided Order Sentence field backed by an Excel-template dropdown use the exact shared option list.

**Architecture:** Journey steps declare `templateSelect` plus an `optionKey`; `app.js` passes the exported schema options once; `journey-ui.js` renders the generic select. Patient filters become separate template-aligned steps, and `os-preview.js` composes their display text without clinical inference.

**Tech Stack:** Static JavaScript/CSS, Node.js built-in tests.

---

### Task 1: Shared template dropdown controls

**Files:** `tests/journey.test.js`, `tests/ui-contract.test.js`, `assets/js/journey.js`, `assets/js/journey-ui.js`, `assets/js/app.js`

- [ ] Add failing tests requiring `templateSelect` and the correct option keys for dose unit, route, form, frequency, PRN reason, criteria and units.
- [ ] Run focused tests and confirm failure against current text controls.
- [ ] Pass `MnCmsSchemas.options` to the journey UI and implement a generic select with a `Choose…` prompt.
- [ ] Convert mapped journey steps while preserving optional Skip behaviour.
- [ ] Re-run focused tests and confirm success.

### Task 2: Structured patient-filter sequence

**Files:** `tests/journey.test.js`, `assets/js/journey.js`, `assets/js/journey-ui.js`

- [ ] Add failing tests requiring criterion, minimum, maximum and unit steps for age, PMA and weight when filters are enabled.
- [ ] Confirm tests fail because only narrative criterion fields currently exist.
- [ ] Add conditional numeric inputs and template-backed unit dropdowns; keep each boundary optional.
- [ ] Re-run focused tests and confirm success.

### Task 3: Preview composition

**Files:** `tests/os-preview.test.js`, `assets/js/os-preview.js`

- [ ] Add failing tests for composed age, PMA and weight filters from structured values.
- [ ] Confirm failure against current single-field rendering.
- [ ] Compose display-only filter text from criterion, relevant boundaries and unit; omit blanks and skipped values.
- [ ] Re-run preview tests and confirm success.

### Task 4: Verification and commit

**Files:** all changed files.

- [ ] Run `npm test`, JavaScript syntax checks and `git diff --check`.
- [ ] Review the diff for exact option reuse, no duplicated clinical lists, and no sensitive data.
- [ ] Perform browser verification if the in-app browser connection is available; otherwise report the limitation explicitly.
- [ ] Commit the implementation on `codex/order-sentence-template-dropdowns` without merging or pushing unless Gavin asks.
