# Guided IV Set Journey Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a guided-only IV Set journey with conditional build questions and progressively populated PowerChart-style Details and Continuous Details mock-ups.

**Architecture:** Add an IV-specific step definition and review rows to `journey.js`; route IV Sets through the existing controller in `app.js`; let `journey-ui.js` mount two read-only views from the existing `iv-preview.js` renderer. Preserve the existing exporter and validation contracts.

**Tech Stack:** Static JavaScript/CSS, Node.js built-in tests.

---

### Task 1: IV Set guided definition

**Files:** `tests/journey.test.js`, `assets/js/journey.js`

- [ ] Write failing tests for site-first sequence, mandatory NICU, Add/Modify/Remove branches, and ready-diluted/additive conditionality.
- [ ] Confirm failure because IV Set has no journey definition.
- [ ] Add IV Set steps, review columns/rows, and branch conditions using shared template-select metadata.
- [ ] Re-run focused tests.

### Task 2: Route IV Sets through guided UI

**Files:** `tests/ui-contract.test.js`, `assets/js/app.js`, `assets/js/journey-ui.js`

- [ ] Write failing contract tests requiring `ivSet` in guided routing and an IV preview region.
- [ ] Confirm failure against current OC/OS-only routing.
- [ ] Route `ivSet`, apply an `iv-journey` class, and render Details plus Continuous Details below the question.
- [ ] Re-run focused tests.

### Task 3: Side-by-side read-only PowerChart mock-ups

**Files:** `tests/iv-preview.test.js`, `assets/js/iv-preview.js`, `assets/css/styles.css`

- [ ] Add failing tests requiring a paired read-only renderer with both labelled views.
- [ ] Confirm failure against the existing tabbed renderer.
- [ ] Add a paired renderer that reuses the existing Details and Continuous panels without editable controls; add responsive two-column layout.
- [ ] Re-run focused tests.

### Task 4: Verification and commit

**Files:** all changed files.

- [ ] Run `npm test`, JavaScript syntax checks, and `git diff --check`.
- [ ] Review for clinical calculations, sensitive data, unrelated changes, and skipped sentinels.
- [ ] Attempt browser verification; report any unavailable browser integration honestly.
- [ ] Commit on `codex/guided-iv-set-journey` without merging or pushing unless requested.
