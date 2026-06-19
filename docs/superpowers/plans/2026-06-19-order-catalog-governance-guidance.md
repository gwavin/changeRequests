# Order Catalog Governance Guidance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Revise the Order Catalog journey so only a named site medicines-team liaison submits it, with one authoritative-reference question and explicit clinical-correctness assurance.

**Architecture:** Keep the existing journey engine and shared request object. Change only the Order Catalog step configuration, validation, expert labels, and review wording; retain legacy draft fields without collecting them in the guided journey.

**Tech Stack:** Static HTML, CSS, vanilla JavaScript, Node test runner.

---

### Task 1: Lock the revised journey contract with tests

**Files:**
- Modify: `tests/journey.test.js`
- Modify: `tests/core.test.js`

- [ ] **Step 1: Add failing sequence tests**

Assert that `siteCode` and `requesterName` are the first two steps; `referenceChecked` is a single required step; and `referenceState`, `requesterContact`, `orderableSynonyms`, and `validationNotes` are absent.

- [ ] **Step 2: Add failing validation tests**

Assert that Order Catalog readiness requires a detailed `referenceChecked` answer and `clinicalCorrectnessConfirmed: true`, while a legacy `referenceState` alone is insufficient.

- [ ] **Step 3: Run focused tests and verify RED**

Run: `node --test tests/journey.test.js tests/core.test.js`
Expected: FAIL because the old sequence and validation are still active.

### Task 2: Implement the revised journey and validation

**Files:**
- Modify: `assets/js/journey.js`
- Modify: `assets/js/core.js`
- Modify: `assets/js/app.js`

- [ ] **Step 1: Reorder and simplify Order Catalog steps**

Move site and liaison name first. Replace the two reference steps with required `referenceChecked`; remove guided work contact, synonyms, and validation-method steps; add `clinicalCorrectnessConfirmed` immediately before privacy confirmation.

- [ ] **Step 2: Add medication guidance**

Make generic prescribing preference explicit in generic/brand wording. Explain that strengths, especially for multi-ingredient products, are useful here but will probably need a separate Order Sentence request.

- [ ] **Step 3: Update validation and state binding**

Require detailed reference and clinical confirmation for Order Catalog. Bind the new confirmation as an item boolean and retain legacy draft fields unchanged.

- [ ] **Step 4: Run focused tests and verify GREEN**

Run: `node --test tests/journey.test.js tests/core.test.js`
Expected: all focused tests pass.

### Task 3: Align expert form, review, and documentation

**Files:**
- Modify: `assets/js/schemas.js`
- Modify: `assets/js/journey-ui.js`
- Modify: `index.html`
- Modify: `README.md`
- Modify: `docs/CHANGELOG.md`

- [ ] **Step 1: Update expert labels and review**

Label requester as the medicines-team liaison, remove the visible work-contact input, show the combined reference and clinical assurance in review, and retain hidden legacy contact data only for draft compatibility.

- [ ] **Step 2: Update documentation**

Document liaison-only submission, generic-first prescribing, separate Order Sentence expectation, and requester clinical assurance.

- [ ] **Step 3: Run complete automated verification**

Run: `npm test`, JavaScript syntax checks, `git diff --check`, and the repository safety scan.
Expected: all tests and checks pass, with no sensitive-data matches.

- [ ] **Step 4: Browser smoke test**

At desktop and mobile widths, confirm site and liaison appear first, removed questions do not appear, Add/Modify/Remove reach review, expert switching retains answers, and the console has no errors.

- [ ] **Step 5: Commit the implementation**

Commit only the scoped source, tests, and documentation on `codex/order-catalog-governance-guidance`.
