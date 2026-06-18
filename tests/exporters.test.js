const test = require("node:test");
const assert = require("node:assert/strict");

global.window = {};
require("../assets/js/core.js");
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
  assert.match(csv, /^"CHANGE REQUEST DETAILS",""\r\n"Field","Value"/);
  assert.match(csv, /"Requesting site code","NMH"/);
  assert.match(csv, /"Requesting site","National Maternity Hospital"/);
  assert.match(csv, /\r\n\r\n"CHANGE ITEM 1",""\r\n"Field","Value"/);
  assert.match(csv, /"CHANGE ITEM 2",""/);
});

test("CSV safely quotes commas, quotes and line breaks", () => {
  const csv = exporters.csv(requestData(), [{ key: "genericName", label: "Generic Name" }]);
  assert.match(csv, /"Request title","Add labetalol, with review"/);
  assert.match(csv, /"Overall clinical reason","Needed for ""standard"" prescribing\. Discuss locally\."/);
});
