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

  assert.match(html, /Draft request visualisation—not an approved build/);
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

test("renders editable clinical-style Details and Continuous Details tabs", () => {
  const html = window.MnCmsIvPreview.render({ readyDiluted: "No" }, { editable: true, activeTab: "continuous" });
  assert.match(html, /data-preview-tab="details"/);
  assert.match(html, /data-preview-tab="continuous"/);
  assert.match(html, /data-preview-field="diluentOrderableSynonym"/);
  assert.match(html, /data-preview-field="weight"/);
  assert.match(html, /data-preview-field="startDateTime"/);
  assert.match(html, /aria-selected="true"[^>]*>Continuous Details/);
  assert.match(window.MnCmsIvPreview.render({ readyDiluted: "Yes" }), /Ready-Diluted/);
});

test("renders paired read-only Details and Continuous Details views", () => {
  const html = window.MnCmsIvPreview.renderPair({ readyDiluted: "No", diluentOrderableSynonym: "Sodium Chloride 0.9%" });
  assert.match(html, /iv-journey-pair/);
  assert.match(html, /Details mock-up/);
  assert.match(html, /Continuous Details mock-up/);
  assert.doesNotMatch(html, /data-preview-field=/);
});
