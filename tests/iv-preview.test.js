const test = require("node:test");
const assert = require("node:assert/strict");

global.window = {};
require("../assets/js/iv-preview.js");

test("renders an Excel-style IV set draft with entered values", () => {
  const html = window.MnCmsIvPreview.render({
    description: "Labetalol Adult IV Infusion",
    routeOfAdministration: "intraVENOUS",
    drugForm: "infusion",
    diluentOrderableSynonym: "Sodium Chloride 0.9%",
    bagVolume: "250 mL",
    additiveOrderableSynonym: "Labetalol",
    additiveDose: "200 mg",
    normalisedRate: "mg/hour"
  });

  assert.match(html, /Draft visualisation—not approved build/);
  assert.match(html, /Labetalol Adult IV Infusion/);
  assert.match(html, /Sodium Chloride 0\.9%/);
  assert.match(html, /200 mg/);
});

test("renders uncertainty explicitly and escapes user-entered markup", () => {
  const html = window.MnCmsIvPreview.render({ description: "<script>alert(1)</script>" });

  assert.doesNotMatch(html, /<script>/);
  assert.match(html, /&lt;script&gt;/);
  assert.match(html, /Not specified/);
});
