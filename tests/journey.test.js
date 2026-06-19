const test = require("node:test");
const assert = require("node:assert/strict");

global.window = {};
require("../assets/js/journey.js");
const journey = global.window.MnCmsJourney;
const keys = (steps) => steps.map((step) => step.key);
const data = (request, item = {}) => ({ items: [{ request, ...item }] });

test("Order Catalog branches expose only relevant questions", () => {
  const add = keys(journey.stepsFor("orderCatalog", data("Add")));
  const modify = keys(journey.stepsFor("orderCatalog", data("Modify")));
  const remove = keys(journey.stepsFor("orderCatalog", data("Remove")));
  assert.ok(add.includes("strengths"));
  assert.ok(!add.includes("currentProductDescription"));
  assert.ok(modify.includes("currentProductDescription"));
  assert.ok(modify.includes("requestedProductDescription"));
  assert.ok(!modify.includes("strengths"));
  assert.ok(remove.includes("removalConfirmed"));
  assert.ok(remove.includes("replacementImpactState"));
  assert.ok(!remove.includes("strengths"));
});

test("conditional detail questions appear only when relevant", () => {
  assert.ok(!keys(journey.stepsFor("orderCatalog", data("Add", { referenceState: "Not sure" }))).includes("referenceChecked"));
  assert.ok(keys(journey.stepsFor("orderCatalog", data("Add", { referenceState: "BNF" }))).includes("referenceChecked"));
  assert.ok(!keys(journey.stepsFor("orderCatalog", data("Add", { hasSafetyRestrictions: "No" }))).includes("safetyRestrictionNotes"));
  assert.ok(keys(journey.stepsFor("orderCatalog", data("Add", { hasSafetyRestrictions: "Yes" }))).includes("safetyRestrictionNotes"));
});

test("next incomplete step follows answered data", () => {
  assert.equal(journey.nextIncompleteStep("orderCatalog", data("", {})).key, "request");
  assert.equal(journey.nextIncompleteStep("orderCatalog", data("Add", {})).key, "genericName");
  assert.equal(journey.nextIncompleteStep("orderCatalog", data("Add", { genericName: "Labetalol" })).key, "reasonForRequest");
});

test("derives metadata without replacing explicit edits", () => {
  assert.deepEqual(journey.derivedMetadata("orderCatalog", data("Add", { genericName: "Labetalol" })), {
    shortSubject: "Labetalol", requestTitle: "Add Labetalol to Order Catalog"
  });
  assert.equal(journey.derivedMetadata("orderCatalog", { shortSubject: "Custom", requestTitle: "Custom title", items: [{ request: "Add", genericName: "Labetalol" }] }).requestTitle, "Custom title");
});

test("creates one formal row per requested strength", () => {
  const rows = journey.orderCatalogRows(data("Add", { genericName: "Labetalol", brandName: "Trandate", strengths: ["100 mg", "200 mg"], reasonForRequest: "Needed", referenceState: "BNF" }));
  assert.equal(rows.length, 2);
  assert.deepEqual(rows.map((row) => row.strength), ["100 mg", "200 mg"]);
  assert.ok(rows.every((row) => row.genericName === "Labetalol" && row.request === "Add"));
});
