# Structured Sites, Field Guidance, and Readable CSV Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Constrain requesting-site entry to seven approved choices, provide accessible guidance for every form field, and export a sectioned human-readable CSV.

**Architecture:** Put the canonical site mapping and validation helpers in `core.js`, leaving `app.js` responsible for binding those values to the DOM and normalising loaded drafts. Add one reusable guidance-control builder for static and generated fields. Replace the wide tabular CSV serializer with labelled two-column sections while retaining the existing quoting helper.

**Tech Stack:** Static HTML, CSS, browser JavaScript (IIFE modules), Node.js built-in test runner.

---

### Task 1: Canonical site mapping and validation

**Files:**
- Modify: `assets/js/core.js`
- Test: `tests/core.test.js`

- [ ] **Step 1: Write failing site tests**

Add tests asserting `core.siteForCode("TCH")` returns `{ code: "TCH", name: "The Coombe Hospital" }`, `core.siteForCode("national")` resolves `NATIONAL`, and validation rejects `siteCode: "EX"` with a `siteCode` error while accepting all seven mapped codes.

- [ ] **Step 2: Run the focused tests and confirm failure**

Run: `node --test tests/core.test.js`
Expected: FAIL because `siteForCode` is not exported and invalid codes are not rejected.

- [ ] **Step 3: Add the mapping and resolver**

Define an immutable-in-practice array inside the core IIFE:

```js
var sites = [
  { code: "NMH", name: "National Maternity Hospital" },
  { code: "ROH", name: "Rotunda Hospital" },
  { code: "CUMH", name: "Cork University Maternity Hospital" },
  { code: "TCH", name: "The Coombe Hospital" },
  { code: "UMHL", name: "University Maternity Hospital Limerick" },
  { code: "UHK", name: "University Hospital Kerry" },
  { code: "NATIONAL", name: "National / All Sites" }
];

function siteForCode(code) {
  var normalised = clean(code).toUpperCase();
  return sites.find(function (site) { return site.code === normalised; }) || null;
}
```

Export `sites` and `siteForCode`. Replace the two independent site-presence rules with a required mapped-code rule and a consistency rule ensuring `requestingSite` equals the selected mapping name.

- [ ] **Step 4: Run the focused tests**

Run: `node --test tests/core.test.js`
Expected: all core tests PASS.

- [ ] **Step 5: Commit the site model**

```powershell
git add -- assets/js/core.js tests/core.test.js
git commit -m "Add approved requesting sites"
```

### Task 2: Structured site selector and legacy draft normalisation

**Files:**
- Modify: `index.html`
- Modify: `assets/js/app.js`
- Modify: `assets/css/styles.css`

- [ ] **Step 1: Replace free-text site controls**

Replace `requestingSite` and `siteCode` inputs with one required `select#siteCode` containing a blank prompt populated by `app.js`, plus a read-only output:

```html
<label class="site-field">
  <span>Requesting site <b class="required">Required</b></span>
  <select id="siteCode" name="siteCode" required>
    <option value="">Choose a site</option>
  </select>
  <output id="requestingSiteName" for="siteCode">No site selected</output>
  <input id="requestingSite" name="requestingSite" type="hidden">
</label>
```

- [ ] **Step 2: Bind selection to code and full name**

Populate options from `MnCmsCore.sites` as `CODE — Name`. On change, set the hidden `requestingSite`, update the output, and refresh filename/readiness. Add a `normaliseSite()` helper used after draft loading: recognised legacy codes populate the canonical name; unrecognised values clear the selector but retain no silently valid site.

- [ ] **Step 3: Style the populated site detail**

Add a `.site-field output` treatment that remains readable on desktop and mobile, uses existing colours, and does not resemble an editable field.

- [ ] **Step 4: Verify behaviour manually**

Serve the root, select every code, and confirm the full name and filename update. Load a recognised legacy draft and confirm normalisation; load an unrecognised code and confirm readiness requires a new choice.

- [ ] **Step 5: Commit the selector**

```powershell
git add -- index.html assets/js/app.js assets/css/styles.css
git commit -m "Use structured requesting site selection"
```

### Task 3: Accessible guidance for every field

**Files:**
- Modify: `index.html`
- Modify: `assets/js/app.js`
- Modify: `assets/js/schemas.js`
- Modify: `assets/css/styles.css`

- [ ] **Step 1: Define metadata guidance**

Add a `metadataGuidance` object in `app.js` keyed by control ID. Each entry must say what to enter and why, for example:

```js
var metadataGuidance = {
  shortSubject: "Enter only the medicine, order or feature name. This becomes the first part of the filename; do not add CR, site or date.",
  requestTitle: "Summarise the requested change in one sentence so reviewers can identify its purpose.",
  siteCode: "Choose the hospital responsible for requesting and validating this change, or National / All Sites for a shared request.",
  requesterName: "Enter the person whom reviewers can contact to clarify this request.",
  requesterContact: "Enter a work email address or telephone extension; do not enter patient contact details.",
  urgency: "Choose the planning priority. This does not bypass clinical or technical review.",
  overallReason: "Explain the current problem, risk or workflow need in plain language.",
  privacyConfirmed: "Confirm that the request contains no patient-identifiable information."
};
```

- [ ] **Step 2: Add a reusable information control**

Create `addFieldHelp(label, text, id)` that inserts a keyboard-focusable `<button type="button" class="field-help" aria-describedby="...">i<span role="tooltip">...</span></button>`. Tooltip text appears on `.field-help:hover`, `.field-help:focus-visible`, and `.field-help[aria-expanded="true"]`; clicking toggles it for touch devices. Keep existing persistent `<small>` safety guidance.

- [ ] **Step 3: Attach guidance to static and generated fields**

Call the helper for every metadata label and the item-intent field. In generated technical fields, use `field.helper` when present; add a general fallback such as `"Enter the requested " + field.label.toLowerCase() + ". Leave it unspecified if it requires team discussion."` only when no more specific schema helper exists. Add helpers in `schemas.js` for fields whose meaning is not apparent from the label.

- [ ] **Step 4: Use structured input types where safe**

Keep requester contact as text because either a work email or telephone extension is valid. Extend schema field metadata so unambiguous dates use `date`, plain numeric quantities use `number`, and existing enumerations remain selects. In `app.js`, set `control.type = field.inputType || "text"` for generated inputs. Do not convert narrative, dose, strength, rate, volume, or medication-expression fields whose valid syntax may legitimately combine numbers, units, ranges, and qualifiers.

- [ ] **Step 5: Verify accessibility and responsive behaviour**

Using the in-app browser, tab through every information control, confirm tooltip association and visible focus, test click toggling, and inspect a mobile viewport for clipping or overlap.

- [ ] **Step 6: Commit field guidance**

```powershell
git add -- index.html assets/js/app.js assets/js/schemas.js assets/css/styles.css
git commit -m "Add accessible field guidance"
```

### Task 4: Sectioned human-readable CSV

**Files:**
- Modify: `assets/js/exporters.js`
- Create: `tests/exporters.test.js`

- [ ] **Step 1: Write failing CSV tests**

Set up `global.window`, load `core.js` and `exporters.js`, then assert that `csv(data, fields)` contains:

```text
"CHANGE REQUEST DETAILS",""
"Field","Value"
"Requesting site code","NMH"
"Requesting site","National Maternity Hospital"

"CHANGE ITEM 1",""
"Field","Value"
```

Add a second item and assert `CHANGE ITEM 2` exists. Include a comma, quote, and newline in values and assert RFC-style double-quote escaping with embedded newlines flattened to spaces.

- [ ] **Step 2: Run the exporter test and confirm failure**

Run: `node --test tests/exporters.test.js`
Expected: FAIL because current CSV is a single wide header/data layout.

- [ ] **Step 3: Implement section-row helpers**

Add:

```js
function csvRow(label, value) {
  return [escapeDelimited(label), escapeDelimited(value)].join(",");
}

function csv(data, fields) {
  var rows = [csvRow("CHANGE REQUEST DETAILS", ""), csvRow("Field", "Value")];
  metadataLines(data).forEach(function (pair) { rows.push(csvRow(pair[0], pair[1])); });
  data.items.forEach(function (item, index) {
    rows.push("", csvRow("CHANGE ITEM " + (index + 1), ""), csvRow("Field", "Value"));
    rows.push(csvRow("Requested outcome", item.requestSummary));
    fields.forEach(function (field) {
      if (field.key && hasValue(item[field.key])) rows.push(csvRow(field.label, item[field.key]));
    });
  });
  return rows.join("\r\n");
}
```

Export this function as the existing CSV entry point and leave HTML generation unchanged.

- [ ] **Step 4: Run all tests**

Run: `npm test`
Expected: all tests PASS, including the new exporter suite.

- [ ] **Step 5: Commit readable CSV output**

```powershell
git add -- assets/js/exporters.js tests/exporters.test.js
git commit -m "Make CSV exports human readable"
```

### Task 5: Documentation and end-to-end verification

**Files:**
- Modify: `README.md`
- Modify: `docs/CHANGELOG.md`

- [ ] **Step 1: Document the behaviour**

Update the README output description to explain that CSV is a sectioned two-column review file. Add changelog bullets for approved site selection, accessible field guidance, structured controls, and sectioned CSV.

- [ ] **Step 2: Run automated checks**

Run:

```powershell
npm test
node --check assets/js/core.js
node --check assets/js/app.js
node --check assets/js/exporters.js
node --check assets/js/schemas.js
git diff --check
```

Expected: every command exits successfully and all tests pass.

- [ ] **Step 3: Complete browser verification**

At desktop and mobile widths, select `NMH` and `NATIONAL`, confirm full names and filenames, inspect hover/focus/click guidance, create two change items, save/load a draft, and download CSV and HTML. Open the CSV and confirm labelled sections; confirm HTML remains unchanged and no browser-console errors occur.

- [ ] **Step 4: Review safety and sensitive content**

Search changed files for credentials, tokens, patient identifiers, or real operational data. Confirm examples are generic and that no clinical defaults were introduced.

- [ ] **Step 5: Commit documentation**

```powershell
git add -- README.md docs/CHANGELOG.md
git commit -m "Document structured change request outputs"
```
