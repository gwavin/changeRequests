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
  assert.ok(parsed.searchParams.get("body").startsWith(global.window.MnCmsExporters.txt(data, fields)));
});

test("removes CR and LF characters from the subject to prevent header injection", () => {
  const url = emailAgenda.mailto({ requestTitle: "Safe title\r\nBcc: attacker@example.invalid", items: [] }, []);
  const parsed = new URL(url);
  assert.equal(parsed.searchParams.get("subject"), "Safe titleBcc: attacker@example.invalid");
  assert.doesNotMatch(decodeURIComponent(url.split("?subject=")[1].split("&body=")[0]), /[\r\n]/);
});

test("appends one parseable versioned canonical payload after the readable request", () => {
  const data = {
    shortSubject: "Contiform",
    requestTitle: "TEST - Add Contiform vaginal pessary to Order Catalog",
    typeId: "orderCatalog",
    typeLabel: "Order Catalog",
    siteCode: "TEST",
    requestingSite: "TEST SITE",
    requesterName: "Test O'Brien",
    urgency: "Routine & planned",
    overallReason: "Synthetic request for testing structured CR transport.\nIncludes café guidance.",
    items: [
      { request: "Add", requestSummary: "Add the test product to the Order Catalog.", brandName: "__SKIPPED__" },
      { request: "Modify", requestSummary: "Keep quotes: \"requested\" & apostrophes: it's valid." }
    ]
  };
  const fields = [{ key: "requestSummary", label: "Requested outcome" }];
  const body = emailAgenda.buildBody(data, fields);
  const beginMatches = body.match(/---BEGIN MN-CMS CR DATA---/g) || [];
  const endMatches = body.match(/---END MN-CMS CR DATA---/g) || [];
  const jsonText = body.slice(body.indexOf(emailAgenda.beginData) + emailAgenda.beginData.length, body.indexOf(emailAgenda.endData)).trim();
  const payload = JSON.parse(jsonText);

  assert.equal(beginMatches.length, 1);
  assert.equal(endMatches.length, 1);
  assert.ok(body.startsWith(global.window.MnCmsExporters.txt(data, fields)));
  assert.equal(payload.formatVersion, 1);
  assert.equal(payload.requestTitle, data.requestTitle);
  assert.equal(payload.typeId, data.typeId);
  assert.equal(payload.typeLabel, data.typeLabel);
  assert.equal(payload.siteCode, data.siteCode);
  assert.equal(payload.requestingSite, data.requestingSite);
  assert.equal(payload.requesterName, data.requesterName);
  assert.equal(payload.overallReason, data.overallReason);
  assert.equal(payload.items.length, 2);
  assert.equal(payload.items[0].brandName, "");
  assert.equal(payload.items[1].requestSummary, data.items[1].requestSummary);
});

test("replaces image data URLs with safe attachment metadata", () => {
  const imageData = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAE";
  const data = {
    requestTitle: "Image metadata test",
    items: [{
      currentItemImage: {
        dataUrl: imageData,
        name: "current-item.png",
        type: "image/png",
        size: 123456
      }
    }]
  };
  const payload = emailAgenda.buildMachinePayload(data);
  const json = JSON.stringify(payload);

  assert.deepEqual(payload.items[0].currentItemImage, {
    name: "current-item.png",
    type: "image/png",
    size: 123456,
    attachmentIncluded: false
  });
  assert.doesNotMatch(json, /dataUrl|base64|iVBOR/);
});
