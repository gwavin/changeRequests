# Order Catalog Guided Journey Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and publish a complete one-question-at-a-time Order Catalog journey for Add, Modify, and Remove requests, with a growing summary and lossless expert-form escape hatch.

**Architecture:** Add a pure `journey.js` domain module that owns branch definitions, step selection, derived titles, completeness, and draft recovery. Add a DOM-focused `journey-ui.js` renderer/controller that binds those definitions to the existing request state and delegates expert rendering and exports to `app.js`. Extend the existing data schema, validation, and exporters only where branch-specific current/requested and removal fields require it.

**Tech Stack:** Static HTML, CSS, browser JavaScript IIFEs, localStorage draft adapter, Node.js built-in test runner, GitHub Pages.

---

### Task 1: Pure journey model and branch definitions

**Files:**
- Create: `assets/js/journey.js`
- Create: `tests/journey.test.js`
- Modify: `index.html`

- [ ] **Step 1: Write failing branch-sequence tests**

Create `tests/journey.test.js`, load `journey.js` through `global.window`, and assert:

```js
test("Order Catalog branches expose only relevant questions", () => {
  assert.deepEqual(keys(journey.stepsFor("orderCatalog", { request: "Add" })), [
    "request", "genericName", "reasonForRequest", "referenceState", "referenceChecked",
    "brandName", "strengths", "orderableSynonyms", "hasSafetyRestrictions",
    "safetyRestrictionNotes", "validationNotes", "siteCode", "requesterName",
    "requesterContact", "privacyConfirmed", "review"
  ]);
  assert.ok(keys(journey.stepsFor("orderCatalog", { request: "Modify" })).includes("currentProductDescription"));
  assert.ok(keys(journey.stepsFor("orderCatalog", { request: "Remove" })).includes("removalConfirmed"));
  assert.ok(!keys(journey.stepsFor("orderCatalog", { request: "Remove" })).includes("strengths"));
});
```

Add tests for `nextIncompleteStep`, optional conditional steps, and normalized action values.

- [ ] **Step 2: Run tests and confirm failure**

Run: `node --test tests/journey.test.js`
Expected: FAIL because `assets/js/journey.js` does not exist.

- [ ] **Step 3: Implement the pure journey API**

Create an IIFE exporting `window.MnCmsJourney` with:

```js
{
  definitions,
  stepsFor(typeId, data),
  stepByKey(typeId, data, key),
  nextIncompleteStep(typeId, data),
  answerComplete(step, data),
  derivedMetadata(typeId, data),
  orderCatalogRows(data)
}
```

Use declarative step objects with `key`, `title`, `description`, `type`, `required`, `options`, `placeholder`, `skipValue`, and optional `when(data)`. Keep branch conditions in this module. `derivedMetadata` must produce an editable default short subject and request title without overwriting explicit user edits.

- [ ] **Step 4: Load the module before app code**

Add `<script src="assets/js/journey.js"></script>` before `app.js` in `index.html`.

- [ ] **Step 5: Run focused and full tests**

Run: `node --test tests/journey.test.js && npm test`
Expected: all tests PASS.

- [ ] **Step 6: Commit the model**

```powershell
git add -- assets/js/journey.js tests/journey.test.js index.html
git commit -m "Add Order Catalog journey model"
```

### Task 2: Branch-specific data, validation, and formal rows

**Files:**
- Modify: `assets/js/schemas.js`
- Modify: `assets/js/core.js`
- Modify: `assets/js/exporters.js`
- Modify: `tests/core.test.js`
- Modify: `tests/exporters.test.js`

- [ ] **Step 1: Write failing branch validation tests**

Add tests proving:

```js
assertNoField(addRequest, "strengths");
assertField({ ...addRequest, items: [{ request: "Add", genericName: "Labetalol" }] }, "strengths");
assertField({ ...modifyRequest, items: [{ request: "Modify", requestSummary: "Change it" }] }, "currentProductDescription");
assertField({ ...removeRequest, items: [{ request: "Remove", genericName: "Labetalol" }] }, "removalConfirmed");
```

Require an explicit `referenceState` for every branch; require details only when the selected reference state needs them. Keep privacy, site, requester, reason, and intent validation.

- [ ] **Step 2: Run tests and confirm failure**

Run: `node --test tests/core.test.js`
Expected: FAIL because branch-specific validation is absent.

- [ ] **Step 3: Extend the Order Catalog schema**

Add keys:

```js
referenceState
strengths
currentProductDescription
requestedProductDescription
replacementImpactState
replacementImpactDetails
hasSafetyRestrictions
removalConfirmed
```

Keep legacy `strength` synchronized with the first `strengths` entry for old exports/drafts. Add structured options for reference state and Yes/No/Not sure choices.

- [ ] **Step 4: Implement branch validation in core**

Add `validateOrderCatalog(data, errors)` and call it only for `typeId === "orderCatalog"`. Error messages must describe the missing answer in ordinary language and identify the journey key so the UI can return to that question.

- [ ] **Step 5: Write and implement formal-row/export tests**

Assert `MnCmsJourney.orderCatalogRows(addData)` produces one row per strength and copies shared Request, Reason, Reference, Generic Name, and Brand Name. Assert Modify CSV contains distinct Current and Requested fields, and Remove CSV contains replacement/impact and explicit confirmation wording.

Update CSV/HTML export rendering to use labelled branch-specific fields without changing other CR output.

- [ ] **Step 6: Run all tests and commit**

Run: `npm test`
Expected: all tests PASS.

```powershell
git add -- assets/js/schemas.js assets/js/core.js assets/js/exporters.js tests/core.test.js tests/exporters.test.js
git commit -m "Validate Order Catalog journey branches"
```

### Task 3: Guided journey shell and one-question renderer

**Files:**
- Create: `assets/js/journey-ui.js`
- Modify: `index.html`
- Modify: `assets/css/styles.css`
- Modify: `assets/js/app.js`

- [ ] **Step 1: Add semantic journey containers**

Place a hidden guided shell inside `#requestForm`:

```html
<section id="journeyShell" class="journey-shell hidden" aria-labelledby="journeyQuestionHeading">
  <div class="journey-main">
    <div class="journey-progress"><span id="journeyStepText"></span><div role="progressbar" id="journeyProgress"></div></div>
    <div id="journeyAnnouncement" class="sr-only" aria-live="polite"></div>
    <section id="journeyQuestion" class="journey-question"></section>
    <p id="journeyError" class="journey-error" tabindex="-1"></p>
    <div class="journey-actions"></div>
  </div>
  <aside id="journeySummary" class="journey-summary" aria-label="Your request so far"></aside>
</section>
```

Load `journey-ui.js` after `journey.js` and before `app.js`.

- [ ] **Step 2: Implement the UI controller contract**

Export:

```js
window.MnCmsJourneyUi.create({
  root,
  getData,
  setAnswer,
  onChange,
  onShowExpert,
  onComplete,
  siteOptions
});
```

The returned controller provides `start()`, `refresh()`, `goTo(key)`, and `destroy()`. Render native radio/select/text/textarea/checkbox/repeatable-strength controls from step definitions. Disable Continue until required answers are complete; Skip writes the explicit `skipValue`. Back preserves state.

- [ ] **Step 3: Render the growing summary**

Show action, medication, reason, reference, brand/synonyms, strengths or current/requested details, safety, site, and requester as they become known. Each completed row has an Edit button calling `goTo(key)`. Unknown optional data displays `To discuss`, never an inferred value.

- [ ] **Step 4: Integrate guided/expert mode in app.js**

For Order Catalog, make guided journey the default and reinterpret the existing `Guide me` / `Show all fields` controls as lossless view switches. Use the existing `state.items[0]` plus metadata as the shared source of truth. After every successful step, persist the draft locally and refresh readiness/export preview.

- [ ] **Step 5: Implement accessibility and responsive styling**

Use the approved two-column layout at desktop widths. Below 760px, place a `<details>`-style summary beneath the question. Add visible focus, text progress, reduced-motion handling, `.sr-only`, and non-clipped validation styles.

- [ ] **Step 6: Verify syntax and commit**

Run:

```powershell
node --check assets/js/journey-ui.js
node --check assets/js/app.js
git diff --check
```

Expected: all commands PASS.

```powershell
git add -- assets/js/journey-ui.js assets/js/app.js assets/css/styles.css index.html
git commit -m "Build one-question Order Catalog journey"
```

### Task 4: Final review, repeatable strengths, and next options

**Files:**
- Modify: `assets/js/journey.js`
- Modify: `assets/js/journey-ui.js`
- Modify: `assets/js/app.js`
- Modify: `assets/css/styles.css`
- Modify: `tests/journey.test.js`

- [ ] **Step 1: Test derived metadata and repeatable rows**

Add tests asserting Add + `Labetalol` derives `shortSubject: "Labetalol"` and `requestTitle: "Add Labetalol to Order Catalog"`, unless custom values already exist. Assert strengths `100 mg` and `200 mg` yield two formal rows and remain synchronized after editing/removal.

- [ ] **Step 2: Implement the review screen**

Render discussion status, filename, site/requester, reason/outcome, formal Order Catalog row preview, branch details, safety/validation/privacy/governance, and Edit buttons. Short subject and request title are editable on review. Removal includes the required deliberate confirmation before completion.

- [ ] **Step 3: Implement completion actions**

Keep existing HTML/CSV downloads. Add `Add another Order Catalog item` and a next-options panel with plain-language buttons for Order Sentence, IV Set, Care Plan, and SN Anaesthesia. Changing CR type uses the existing confirmation if meaningful Order Catalog data would be reset.

- [ ] **Step 4: Recover old and damaged drafts safely**

When loading, normalize legacy `strength` into `strengths`, derive the furthest safe incomplete step, and show a non-destructive warning when incompatible fields are skipped. Do not delete the saved draft automatically.

- [ ] **Step 5: Run all tests and commit**

Run: `npm test`
Expected: all tests PASS.

```powershell
git add -- assets/js/journey.js assets/js/journey-ui.js assets/js/app.js assets/css/styles.css tests/journey.test.js
git commit -m "Complete Order Catalog guided review"
```

### Task 5: Browser verification and documentation

**Files:**
- Modify: `README.md`
- Modify: `docs/CHANGELOG.md`
- Create: `journey-qa.md`

- [ ] **Step 1: Document the new default flow**

Explain guided Order Catalog entry, Add/Modify/Remove branches, expert escape, local draft behavior, and unchanged discussion-only governance. Add changelog entries and note that other CR journeys remain the next implementation phases.

- [ ] **Step 2: Run final automated checks**

Run:

```powershell
npm test
node --check assets/js/journey.js
node --check assets/js/journey-ui.js
node --check assets/js/app.js
node --check assets/js/core.js
node --check assets/js/exporters.js
git diff --check
```

Expected: all checks PASS.

- [ ] **Step 3: Verify all three branches in the in-app browser**

Complete Add with two strengths, Modify with separate current/requested values, and Remove with deliberate confirmation. For each, verify step validation, Back, summary Edit, saved-draft reload, expert round-trip, final review, filename, HTML/CSV enabled state, and next-CR buttons.

- [ ] **Step 4: Verify accessibility and responsive behavior**

At desktop and mobile widths, test keyboard navigation, focus movement, live announcements, summary disclosure, no horizontal overflow, reduced-motion styling, and console errors. Record evidence and any intentional deviations in `journey-qa.md`, ending with exactly `final result: passed` only if no material issue remains.

- [ ] **Step 5: Scan safety-sensitive content**

Search changed files for patient identifiers, credentials, secrets, tokens, API keys, or real clinical data. Verify examples are generic and no network submission was added.

- [ ] **Step 6: Commit verification documentation**

```powershell
git add -- README.md docs/CHANGELOG.md journey-qa.md
git commit -m "Document Order Catalog guided journey"
```

### Task 6: Integrate and publish

**Files:**
- No additional file edits expected.

- [ ] **Step 1: Verify the feature branch is clean and complete**

Run: `git status --short --branch && npm test`
Expected: clean feature branch and all tests PASS.

- [ ] **Step 2: Fast-forward local main**

```powershell
git fetch origin main
git switch main
git pull --ff-only origin main
git merge --ff-only codex/order-catalog-guided-journey
```

- [ ] **Step 3: Re-run tests on merged main**

Run: `npm test`
Expected: all tests PASS.

- [ ] **Step 4: Push main without rewriting history**

Run: `git push origin main`
Expected: remote `main` advances to the verified journey commit.
