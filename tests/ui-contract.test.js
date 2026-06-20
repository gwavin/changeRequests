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
  assert.match(app, /\["orderCatalog", "orderSentence", "ivSet"\]/);
});

test("journey root is assigned before it is styled", () => {
  const journeyUi = read("assets/js/journey-ui.js");
  const assignment = journeyUi.indexOf("var rootEl = options.root");
  const styling = journeyUi.indexOf('rootEl.classList.toggle("os-journey"');
  assert.ok(assignment >= 0 && styling > assignment, "rootEl must exist before classList is used");
});

test("Order Sentence route reuses schema options in a select", () => {
  const app = read("assets/js/app.js");
  const journeyUi = read("assets/js/journey-ui.js");
  assert.match(app, /templateOptions:\s*window\.MnCmsSchemas\.options/);
  assert.match(journeyUi, /entry\.type === "templateSelect"/);
  assert.match(journeyUi, /options\.templateOptions\[entry\.optionKey\]/);
});

test("Order Sentence places the question above side-by-side OEF and CDL previews", () => {
  const journeyUi = read("assets/js/journey-ui.js");
  const css = read("assets/css/styles.css");
  assert.match(journeyUi, /os-preview-region/);
  assert.match(css, /\.journey-shell\.os-journey\s*\{[^}]*grid-template-columns:\s*1fr/s);
  assert.match(css, /\.journey-shell\.os-journey \.journey-main\s*\{[^}]*grid-column:\s*1\s*\/\s*-1/s);
  assert.match(css, /\.journey-shell\.os-journey \.journey-summary\s*\{[^}]*grid-column:\s*1\s*\/\s*-1/s);
  assert.match(css, /\.os-preview-pair\s*\{[^}]*grid-template-columns:\s*1fr\s+1fr/s);
});

test("IV Set journey mounts paired PowerChart previews below the question", () => {
  const journeyUi = read("assets/js/journey-ui.js");
  const css = read("assets/css/styles.css");
  assert.match(journeyUi, /iv-preview-region/);
  assert.match(journeyUi, /MnCmsIvPreview\.renderPair/);
  assert.match(css, /\.iv-journey-pair\s*\{[^}]*grid-template-columns:\s*1fr\s+1fr/s);
});
