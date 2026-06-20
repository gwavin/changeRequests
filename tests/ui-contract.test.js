const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

test("completed journeys expose no expert or full-form choice", () => {
  const markup = read("index.html");
  const journeyUi = read("assets/js/journey-ui.js");
  assert.doesNotMatch(markup, /Show all fields|Guidance mode|expertModeButton/);
  assert.doesNotMatch(journeyUi, /data-expert|show the full form|onShowExpert/);
});

test("application routes Order Catalog and Order Sentence through guided entry", () => {
  const app = read("assets/js/app.js");
  assert.match(app, /\["orderCatalog", "orderSentence"\]/);
});

test("journey root is assigned before it is styled", () => {
  const journeyUi = read("assets/js/journey-ui.js");
  const assignment = journeyUi.indexOf("var rootEl = options.root");
  const styling = journeyUi.indexOf('rootEl.classList.toggle("os-journey"');
  assert.ok(assignment >= 0 && styling > assignment, "rootEl must exist before classList is used");
});
