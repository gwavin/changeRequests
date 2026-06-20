# Guided Route, Strength and Preview Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Permit deliberate omission of Order Catalog strength, constrain Order Sentence route to template values, and place the active question above side-by-side OEF/CDL previews.

**Architecture:** Keep journey rules in `journey.js`, reuse the route array exported by `schemas.js` through the existing UI controller options, and adapt `journey-ui.js` rendering without adding a second entry path. Use CSS grid only for the Order Sentence arrangement so other journeys remain unchanged.

**Tech Stack:** Static HTML, CSS, browser JavaScript, Node.js built-in test runner.

---

### Task 1: Optional Order Catalog strength

**Files:**
- Modify: `tests/journey.test.js`
- Modify: `assets/js/journey.js`
- Modify: `assets/js/journey-ui.js`

- [ ] Add a failing test asserting the `strengths` step is optional with `skipValue === journey.SKIPPED`, and an Add request with that value yields one row whose strength is `Not supplied`.
- [ ] Run `node --test tests/journey.test.js` and confirm the new assertion fails for missing optional/skip behaviour.
- [ ] Set the strength step to `required: false, skipValue: SKIPPED`; normalize a skipped or empty strength collection to the human-readable `Not supplied` row while preserving supplied multi-strength rows.
- [ ] Change guided summary display of the skipped strength sentinel from `To discuss` to `Not supplied` only for the strength field.
- [ ] Re-run `node --test tests/journey.test.js` and confirm it passes.

### Task 2: Template-constrained route dropdown

**Files:**
- Modify: `tests/journey.test.js`
- Modify: `tests/ui-contract.test.js`
- Modify: `assets/js/journey.js`
- Modify: `assets/js/journey-ui.js`
- Modify: `assets/js/app.js`

- [ ] Add failing tests asserting the route step uses type `route`, and that the UI receives `MnCmsSchemas.options.route` and renders a `select` without a free-text route control.
- [ ] Run the focused tests and confirm they fail for the current text control.
- [ ] Pass `routeOptions` into the journey UI, render an unselected `select` for `route`, and retain the existing optional Skip action.
- [ ] Re-run the focused tests and confirm they pass.

### Task 3: Full-width question and OEF/CDL row

**Files:**
- Modify: `tests/ui-contract.test.js`
- Modify: `assets/js/journey-ui.js`
- Modify: `assets/css/styles.css`

- [ ] Add failing contract tests for an Order Sentence layout class, a full-width main region, a full-width preview region, hidden legacy summary details, and a two-column `.os-preview-pair` that stacks responsively.
- [ ] Run `node --test tests/ui-contract.test.js` and confirm the new assertions fail.
- [ ] Add the Order Sentence-specific classes/markup and CSS grid rules. Keep question, answer and navigation in the top region; render only the OEF/CDL preview beneath it; preserve source order OEF then CDL for narrow screens.
- [ ] Re-run the contract tests and confirm they pass.

### Task 4: Verification and reviewable commit

**Files:**
- Verify all changed files.

- [ ] Run `npm test` and require zero failures.
- [ ] Run `git diff --check` and JavaScript syntax checks for modified scripts.
- [ ] Serve the repository locally and manually verify Order Catalog Skip, Order Sentence route selection, desktop layout, narrow layout, progressive previews, and no console errors.
- [ ] Review `git diff` for scope, safety wording, and accidental data.
- [ ] Commit the coherent implementation on `codex/guided-route-strength-layout` without merging or pushing unless Gavin asks.
