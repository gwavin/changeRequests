const test = require("node:test");
const assert = require("node:assert/strict");

global.window = {};
require("../assets/js/core.js");
require("../assets/js/os-preview.js");
require("../assets/js/exporters.js");
require("../assets/js/email-agenda.js");

const emailAgenda = global.window.MnCmsEmailAgenda;

test("builds a fixed-recipient mailto using the existing text exporter", () => {
  const data = {
    requestTitle: "TEST - Add O'Brien & Sons",
    typeLabel: "Care Plan",
    items: [{ requestSummary: "Line one\nLine two & more" }]
  };
  const fields = [{ key: "requestSummary", label: "Requested outcome" }];
  const url = emailAgenda.mailto(data, fields);
  const parsed = new URL(url);

  assert.equal(emailAgenda.recipient, "MN-CMSMedsChangelog@HealthIreland.onmicrosoft.com");
  assert.equal(parsed.pathname, emailAgenda.recipient);
  assert.equal(parsed.searchParams.get("subject"), data.requestTitle);
  assert.equal(parsed.searchParams.get("body"), global.window.MnCmsExporters.txt(data, fields));
});

test("removes CR and LF characters from the subject to prevent header injection", () => {
  const url = emailAgenda.mailto({ requestTitle: "Safe title\r\nBcc: attacker@example.invalid", items: [] }, []);
  const parsed = new URL(url);
  assert.equal(parsed.searchParams.get("subject"), "Safe titleBcc: attacker@example.invalid");
  assert.doesNotMatch(decodeURIComponent(url.split("?subject=")[1].split("&body=")[0]), /[\r\n]/);
});
