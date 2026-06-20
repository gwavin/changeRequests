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
  assert.ok(!keys(journey.stepsFor("orderCatalog", data("Add", { hasSafetyRestrictions: "No" }))).includes("safetyRestrictionNotes"));
  assert.ok(keys(journey.stepsFor("orderCatalog", data("Add", { hasSafetyRestrictions: "Yes" }))).includes("safetyRestrictionNotes"));
});

test("Order Catalog begins with governance and uses one clinical reference question", () => {
  const sequence = keys(journey.stepsFor("orderCatalog", data("Add")));
  assert.deepEqual(sequence.slice(0, 2), ["siteCode", "requesterName"]);
  assert.equal(sequence.filter((key) => key === "referenceChecked").length, 1);
  ["referenceState", "requesterContact", "orderableSynonyms", "validationNotes"].forEach((key) => assert.ok(!sequence.includes(key)));
  assert.ok(sequence.includes("clinicalCorrectnessConfirmed"));
});

test("next incomplete step follows answered data", () => {
  assert.equal(journey.nextIncompleteStep("orderCatalog", data("", {})).key, "siteCode");
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

test("Order Catalog strength can be deliberately omitted", () => {
  const strengthStep = journey.stepsFor("orderCatalog", data("Add")).find((step) => step.key === "strengths");
  assert.equal(strengthStep.required, false);
  assert.equal(strengthStep.skipValue, journey.SKIPPED);
  const rows = journey.orderCatalogRows(data("Add", { genericName: "Labetalol", strengths: journey.SKIPPED }));
  assert.equal(rows.length, 1);
  assert.equal(rows[0].strength, "Not supplied");
});

test("keeps the overall reason synchronized until the user edits it", () => {
  assert.equal(journey.synchronizedOverallReason("", "", "p"), "p");
  assert.equal(journey.synchronizedOverallReason("p", "p", "practice"), "practice");
  assert.equal(journey.synchronizedOverallReason("Custom clinical explanation", "practice", "practice update"), "Custom clinical explanation");
});

test("keeps the requested outcome synchronized until the user edits it", () => {
  assert.equal(journey.synchronizedAutomaticText("", "", "n"), "n");
  assert.equal(journey.synchronizedAutomaticText("n", "n", "needed for practice"), "needed for practice");
  assert.equal(journey.synchronizedAutomaticText("Custom outcome", "needed for practice", "updated reason"), "Custom outcome");
});

test("Order Sentence uses a site-first guided sequence", () => {
  const sequence = keys(journey.stepsFor("orderSentence", data("Add")));
  assert.deepEqual(sequence.slice(0, 3), ["siteCode", "requesterName", "request"]);
  assert.ok(sequence.includes("orderableSynonym"));
  assert.ok(sequence.includes("clinicalCorrectnessConfirmed"));
  assert.ok(!sequence.includes("currentValue"));
});

test("Order Sentence route uses the constrained template control", () => {
  const routeStep = journey.stepsFor("orderSentence", data("Add")).find((step) => step.key === "routeOfAdministration");
  assert.equal(routeStep.type, "templateSelect");
  assert.equal(routeStep.optionKey, "route");
});

test("Order Sentence template dropdowns declare their shared option sources", () => {
  const steps = journey.stepsFor("orderSentence", data("Add", { prn: "Y", hasPatientFilters: "Yes" }));
  const expected = {
    doseUnit: "units", routeOfAdministration: "route", drugForm: "form", frequency: "frequency",
    prnReason: "prnReason", ageRangeCriteria: "criteria", ageUnit: "ageUnit",
    pmaCriteria: "criteria", pmaUnit: "pmaUnit", weightCriteria: "criteria", weightUnit: "weightUnit"
  };
  Object.entries(expected).forEach(([key, optionKey]) => {
    const entry = steps.find((step) => step.key === key);
    assert.equal(entry.type, "templateSelect", key);
    assert.equal(entry.optionKey, optionKey, key);
  });
});

test("Order Sentence patient filters collect structured boundaries", () => {
  const sequence = keys(journey.stepsFor("orderSentence", data("Add", { hasPatientFilters: "Yes" })));
  ["ageMin", "ageMax", "ageUnit", "pmaMin", "pmaMax", "pmaUnit", "weightMin", "weightMax", "weightUnit"].forEach((key) => assert.ok(sequence.includes(key), key));
});

test("Order Sentence reveals branch and PRN details only when relevant", () => {
  const modify = keys(journey.stepsFor("orderSentence", data("Modify")));
  assert.ok(modify.includes("currentValue") && modify.includes("requestedValue"));
  assert.ok(keys(journey.stepsFor("orderSentence", data("Remove"))).includes("removalConfirmed"));
  assert.ok(!keys(journey.stepsFor("orderSentence", data("Add", { prn: "N" }))).includes("prnReason"));
  assert.ok(keys(journey.stepsFor("orderSentence", data("Add", { prn: "Y" }))).includes("prnReason"));
});

test("derives Order Sentence metadata", () => {
  assert.deepEqual(journey.derivedMetadata("orderSentence", data("Add", { orderableSynonym: "Labetalol", dose: "100", doseUnit: "mg" })), {
    shortSubject: "Labetalol", requestTitle: "Add Labetalol Order Sentence"
  });
});

test("Order Sentence includes supplied OEF build details and conditional filters", () => {
  const base = keys(journey.stepsFor("orderSentence", data("Add", { hasPatientFilters: "No" })));
  ["giveFirstDoseNow", "durationUnit", "specialInstructions", "orderComments", "hasPatientFilters"].forEach((key) => assert.ok(base.includes(key)));
  assert.ok(!base.includes("pmaCriteria") && !base.includes("weightCriteria"));
  const filtered = keys(journey.stepsFor("orderSentence", data("Add", { hasPatientFilters: "Yes" })));
  ["ageRangeCriteria", "pmaCriteria", "weightCriteria"].forEach((key) => assert.ok(filtered.includes(key)));
});
