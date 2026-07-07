const test = require("node:test");
const assert = require("node:assert/strict");

global.window = {};
require("../assets/js/core.js");
require("../assets/js/journey.js");
require("../assets/js/exporters.js");

const core = global.window.MnCmsCore;
const journey = global.window.MnCmsJourney;
const exporters = global.window.MnCmsExporters;

test("resolves approved requesting sites by code", () => {
  assert.deepEqual(core.siteForCode("TCH"), { code: "TCH", name: "The Coombe Hospital" });
  assert.deepEqual(core.siteForCode("national"), { code: "NATIONAL", name: "National / All Sites" });
  assert.equal(core.siteForCode("EX"), null);
});

test("validates requesting site against the approved mapping", () => {
  const base = {
    typeId: "orderCatalog", shortSubject: "Labetalol", requestTitle: "Add labetalol",
    requestingSite: "National Maternity Hospital", siteCode: "NMH", requesterName: "Example User",
    overallReason: "Needed for prescribing.", privacyConfirmed: true,
    items: [{ requestSummary: "Add labetalol." }]
  };
  assert.ok(!core.validate(base).errors.some((error) => error.field === "siteCode"));
  assert.ok(core.validate({ ...base, requestingSite: "Example Hospital", siteCode: "EX" }).errors.some((error) => error.field === "siteCode"));
  core.sites.forEach((site) => {
    assert.ok(!core.validate({ ...base, requestingSite: site.name, siteCode: site.code }).errors.some((error) => error.field === "siteCode"));
  });
});

test("builds the requested filename from subject, request type, site and date", () => {
  assert.equal(core.fileBase({
    shortSubject: "Labetalol",
    typeId: "orderSentence",
    siteCode: "NMH",
    requestDate: "2026-06-18"
  }), "Labetalol OS CR - NMH 18062026");
});

test("sanitises unsafe filename characters and redundant CR wording", () => {
  assert.equal(core.fileBase({
    shortSubject: "Labetalol: OS CR?",
    typeId: "orderSentence",
    siteCode: "NMH/CHO",
    requestDate: "2026-06-18"
  }), "Labetalol OS CR - NMH-CHO 18062026");
});

test("essential validation allows technical uncertainty but requires intent and governance", () => {
  const result = core.validate({
    typeId: "carePlan",
    shortSubject: "Labetalol",
    requestTitle: "Add an order sentence for labetalol",
    requestingSite: "National Maternity Hospital",
    siteCode: "NMH",
    requesterName: "Example User",
    overallReason: "Staff currently construct this order manually.",
    privacyConfirmed: true,
    items: [{ action: "Add", requestSummary: "Not sure of technical build; please discuss." }]
  });
  assert.deepEqual(result.errors, []);
});

test("essential validation identifies missing discussion-ready information", () => {
  const result = core.validate({ typeId: "ivSet", items: [{}] });
  assert.ok(result.errors.some((error) => error.field === "shortSubject"));
  assert.ok(result.errors.some((error) => error.field === "privacyConfirmed"));
  assert.ok(result.errors.some((error) => error.field === "items"));
});

test("IV Set validation requires an explicit NICU answer", () => {
  const data = {
    typeId: "ivSet", shortSubject: "Labetalol", requestTitle: "Add IV Set",
    requestingSite: "National Maternity Hospital", siteCode: "NMH", requesterName: "Example User",
    overallReason: "Needed for a standard infusion.", privacyConfirmed: true,
    items: [{ requestSummary: "Add a labetalol IV Set." }]
  };
  assert.ok(core.validate(data).errors.some((error) => error.field === "nicuInfusion"));
  data.items[0].nicuInfusion = "No";
  assert.ok(!core.validate(data).errors.some((error) => error.field === "nicuInfusion"));
});

test("readiness distinguishes required information from optional expert detail", () => {
  const result = core.readiness({
    typeId: "carePlan",
    shortSubject: "Labetalol",
    requestTitle: "Add labetalol",
    requestingSite: "National Maternity Hospital",
    siteCode: "NMH",
    requesterName: "Example User",
    overallReason: "Needed for prescribing.",
    privacyConfirmed: true,
    items: [{ action: "Add", requestSummary: "Add labetalol to the catalogue." }]
  }, [{ key: "genericName" }, { key: "strength" }]);
  assert.equal(result.blocking, 0);
  assert.equal(result.optionalCompleted, 0);
  assert.equal(result.optionalTotal, 2);
});

test("Order Catalog validation follows Add, Modify and Remove branches", () => {
  const base = { typeId: "orderCatalog", shortSubject: "Labetalol", requestTitle: "Change labetalol", requestingSite: "National Maternity Hospital", siteCode: "NMH", requesterName: "Example User", overallReason: "Needed", privacyConfirmed: true };
  const validateItem = (item) => core.validate({ ...base, items: [{ requestSummary: "Change labetalol", reasonForRequest: "Needed", referenceChecked: "BNF monograph: Labetalol", clinicalCorrectnessConfirmed: true, genericName: "Labetalol", ...item }] }).errors;
  assert.ok(validateItem({ request: "Add" }).some((error) => error.field === "strengths"));
  assert.ok(!validateItem({ request: "Add", strengths: ["100 mg"] }).some((error) => error.field === "strengths"));
  assert.ok(validateItem({ request: "Modify" }).some((error) => error.field === "currentProductDescription"));
  assert.ok(!validateItem({ request: "Modify", currentProductDescription: "Old", requestedProductDescription: "New" }).some((error) => error.field === "currentProductDescription"));
  assert.ok(validateItem({ request: "Remove" }).some((error) => error.field === "removalConfirmed"));
  assert.ok(!validateItem({ request: "Remove", removalConfirmed: true }).some((error) => error.field === "removalConfirmed"));
});

test("Order Catalog requires a specific reference and liaison clinical confirmation", () => {
  const base = { typeId: "orderCatalog", shortSubject: "Labetalol", requestTitle: "Add labetalol", requestingSite: "National Maternity Hospital", siteCode: "NMH", requesterName: "Example Liaison", overallReason: "Needed", privacyConfirmed: true };
  const errors = (item) => core.validate({ ...base, items: [{ request: "Add", requestSummary: "Add labetalol", reasonForRequest: "Needed", genericName: "Labetalol", strengths: ["100 mg"], ...item }] }).errors;
  assert.ok(errors({ referenceState: "BNF" }).some((error) => error.field === "referenceChecked"));
  assert.ok(errors({ referenceChecked: "BNF monograph: Labetalol" }).some((error) => error.field === "clinicalCorrectnessConfirmed"));
  assert.ok(!errors({ referenceChecked: "BNF monograph: Labetalol", clinicalCorrectnessConfirmed: true }).some((error) => ["referenceChecked", "clinicalCorrectnessConfirmed"].includes(error.field)));
});

test("Order Catalog modify requests can include an optional current item image", () => {
  const data = {
    typeId: "orderCatalog",
    typeLabel: "Order Catalog",
    shortSubject: "Labetalol",
    requestTitle: "Modify labetalol",
    requestingSite: "National Maternity Hospital",
    siteCode: "NMH",
    requesterName: "Example Liaison",
    urgency: "Routine / no fixed date",
    overallReason: "Needed",
    privacyConfirmed: true,
    responsibilityStatement: "Review required.",
    items: [{
      request: "Modify",
      requestSummary: "Modify labetalol",
      reasonForRequest: "Needed",
      referenceChecked: "BNF monograph: Labetalol",
      clinicalCorrectnessConfirmed: true,
      genericName: "Labetalol",
      currentProductDescription: "Old wording",
      requestedProductDescription: "New wording",
      currentItemImage: { name: "current-item.png", type: "image/png", size: 68, dataUrl: "data:image/png;base64,abc123" }
    }]
  };
  assert.equal(core.validate(data).errors.length, 0);
  assert.ok(journey.reviewRows("orderCatalog", data)[0].currentItemImage.includes("current-item.png"));
  assert.match(exporters.csv(data, global.window.MnCmsSchemas ? global.window.MnCmsSchemas.fieldsForType("orderCatalog") : [{ key: "currentItemImage", label: "Current item screenshot / image" }]), /current-item\.png/);
  assert.match(exporters.html(data, [{ key: "currentItemImage", label: "Current item screenshot / image", type: "image" }]), /<img src="data:image\/png;base64,abc123"/);
});

test("Order Sentence requires clinical intent, reference and liaison confirmation", () => {
  const base = { typeId: "orderSentence", shortSubject: "Labetalol", requestTitle: "Add labetalol sentence", requestingSite: "National Maternity Hospital", siteCode: "NMH", requesterName: "Example Liaison", overallReason: "Needed", privacyConfirmed: true };
  const errors = (item) => core.validate({ ...base, items: [{ requestSummary: "Add sentence", ...item }] }).errors;
  assert.ok(errors({ request: "Add" }).some((error) => error.field === "orderableSynonym"));
  const complete = { request: "Add", orderableSynonym: "Labetalol", reasonForRequest: "Needed", referenceChecked: "BNF: Labetalol", clinicalCorrectnessConfirmed: true };
  assert.ok(!errors(complete).some((error) => ["orderableSynonym", "referenceChecked", "clinicalCorrectnessConfirmed"].includes(error.field)));
  assert.ok(errors({ ...complete, clinicalCorrectnessConfirmed: false }).some((error) => error.field === "clinicalCorrectnessConfirmed"));
});
