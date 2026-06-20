const test = require("node:test");
const assert = require("node:assert/strict");

global.window = {};
require("../assets/js/os-preview.js");
const preview = global.window.MnCmsOsPreview;

function data(item = {}) { return { typeId: "orderSentence", items: [{ request: "Add", orderableSynonym: "Aspirin", ...item }] }; }

test("renders progressively populated OEF and CDL mockups", () => {
  const html = preview.render(data({ dose: "75", doseUnit: "mg", routeOfAdministration: "oral", drugForm: "tablet", frequency: "ONCE a day", prn: "N" }));
  assert.match(html, /OEF - while ordering/);
  assert.match(html, /CDL - after ordering/);
  assert.match(html, /Aspirin/);
  assert.match(html, /75 mg/);
  assert.match(html, /oral/);
  assert.match(html, /ONCE a day/);
  assert.match(html, /Request mockup - not a live clinical-system screen/);
});

test("uses neutral values, escapes input and removes skipped sentinels", () => {
  const html = preview.render(data({ dose: "<script>", duration: "__SKIPPED__" }));
  assert.match(html, /&lt;script&gt;/);
  assert.match(html, /Not specified/);
  assert.doesNotMatch(html, /__SKIPPED__|<script>/);
});

test("includes filters and PRN indication in display sentences", () => {
  const model = preview.model(data({ prn: "Y", prnReason: "pain", ageRangeCriteria: "Greater Than or Equal To 12 year" }));
  assert.match(model.selectionLine, /PRN for pain/);
  assert.match(model.selectionLine, /Greater Than or Equal To 12 year/);
});

test("composes structured patient filters for display", () => {
  const model = preview.model(data({
    ageRangeCriteria: "Between", ageMin: "2", ageMax: "12", ageUnit: "year",
    pmaCriteria: "Less than", pmaMax: "31", pmaUnit: "week",
    weightCriteria: "Greater than/equal to", weightMin: "50", weightUnit: "kg"
  }));
  assert.match(model.selectionLine, /Between 2 and 12 year/);
  assert.match(model.selectionLine, /Less than 31 week/);
  assert.match(model.selectionLine, /Greater than\/equal to 50 kg/);
});

test("remove requests identify the existing sentence without proposing a new build", () => {
  const html = preview.render(data({ request: "Remove", currentValue: "Aspirin 75 mg oral once daily" }));
  assert.match(html, /Proposed removal/);
  assert.match(html, /Aspirin 75 mg oral once daily/);
  assert.doesNotMatch(html, /CDL - after ordering/);
});

test("modify requests distinguish current and requested previews", () => {
  const html = preview.render(data({ request: "Modify", currentValue: "Aspirin 75 mg oral once daily", dose: "150", doseUnit: "mg" }));
  assert.match(html, /Current Order Sentence/);
  assert.match(html, /Aspirin 75 mg oral once daily/);
  assert.match(html, /Requested OEF and CDL/);
  assert.match(html, /150 mg/);
});

test("review mode exposes field-to-question navigation buttons", () => {
  const html = preview.render(data({ dose: "75", doseUnit: "mg" }), { interactive: true });
  assert.match(html, /data-edit-step="dose"/);
  assert.match(html, /data-edit-step="doseUnit"/);
});
