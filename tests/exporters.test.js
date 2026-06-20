const test = require("node:test");
const assert = require("node:assert/strict");

global.window = {};
require("../assets/js/core.js");
require("../assets/js/os-preview.js");
require("../assets/js/exporters.js");

const exporters = global.window.MnCmsExporters;

function requestData() {
  return {
    typeId: "orderCatalog",
    typeLabel: "Order Catalog",
    shortSubject: "Labetalol",
    requestTitle: "Add labetalol, with review",
    requestingSite: "National Maternity Hospital",
    siteCode: "NMH",
    requesterName: "Example User",
    requesterContact: "example@example.invalid",
    urgency: "Routine / no fixed date",
    overallReason: "Needed for \"standard\" prescribing.\nDiscuss locally.",
    requestDate: "2026-06-18",
    items: [
      { requestSummary: "Add the item.", genericName: "Labetalol" },
      { requestSummary: "Add a synonym.", genericName: "Labetalol hydrochloride" }
    ]
  };
}

test("CSV is a sectioned two-column report", () => {
  const csv = exporters.csv(requestData(), [{ key: "genericName", label: "Generic Name" }]);
  assert.match(csv, /^\uFEFF"CHANGE REQUEST DETAILS",""\r\n"Field","Value"/);
  assert.match(csv, /"Requesting site code","NMH"/);
  assert.match(csv, /"Requesting site","National Maternity Hospital"/);
  assert.match(csv, /\r\n\r\n"CHANGE ITEM 1",""\r\n"Field","Value"/);
  assert.match(csv, /"CHANGE ITEM 2",""/);
});

test("CSV uses Excel-safe UTF-8 and never exposes internal skipped values", () => {
  const data = requestData();
  data.items[0].brandName = "__SKIPPED__";
  const csv = exporters.csv(data, [{ key: "brandName", label: "Brand Name" }]);
  assert.equal(csv.charCodeAt(0), 0xFEFF);
  assert.match(csv, /"Discussion status","For discussion - not approved"/);
  assert.doesNotMatch(csv, /SKIPPED/);
  assert.doesNotMatch(exporters.html(data, [{ key: "brandName", label: "Brand Name" }]), /SKIPPED/);
  assert.doesNotMatch(exporters.json(data), /SKIPPED/);
});

test("CSV safely quotes commas, quotes and line breaks", () => {
  const csv = exporters.csv(requestData(), [{ key: "genericName", label: "Generic Name" }]);
  assert.match(csv, /"Request title","Add labetalol, with review"/);
  assert.match(csv, /"Overall clinical reason","Needed for ""standard"" prescribing\. Discuss locally\."/);
});

test("Order Sentence HTML includes the same OEF and CDL request mockups", () => {
  const data = requestData();
  data.typeId = "orderSentence";
  data.typeLabel = "Order Sentence";
  data.items = [{ request: "Add", requestSummary: "Add sentence", orderableSynonym: "Aspirin", dose: "75", doseUnit: "mg", routeOfAdministration: "oral", drugForm: "tablet", frequency: "ONCE a day" }];
  const html = exporters.html(data, [{ key: "dose", label: "Dose" }]);
  assert.match(html, /OEF - while ordering/);
  assert.match(html, /CDL - after ordering/);
  assert.match(html, /Aspirin/);
});
