(function () {
  "use strict";

  var RECIPIENT = "MN-CMSMedsChangelog@HealthIreland.onmicrosoft.com";
  var BEGIN_DATA = "---BEGIN MN-CMS CR DATA---";
  var END_DATA = "---END MN-CMS CR DATA---";

  function safeSubject(value) {
    return String(value || "").replace(/[\r\n]/g, "");
  }

  function cleanPayloadValue(value) {
    if (value === "__SKIPPED__") return "";
    if (Array.isArray(value)) return value.map(cleanPayloadValue);
    if (value && typeof value === "object") {
      if (value.dataUrl) {
        return {
          name: value.name || "Attached image",
          type: value.type || "",
          size: typeof value.size === "number" ? value.size : null,
          attachmentIncluded: false
        };
      }
      return Object.keys(value).reduce(function (result, key) {
        result[key] = cleanPayloadValue(value[key]);
        return result;
      }, {});
    }
    return value;
  }

  function buildMachinePayload(data) {
    var payload = cleanPayloadValue(data);
    var versioned = Object.assign({ formatVersion: 1 }, payload);
    versioned.formatVersion = 1;
    return versioned;
  }

  function buildBody(data, fields) {
    var readable = window.MnCmsExporters.txt(data, fields);
    return [
      readable,
      "",
      BEGIN_DATA,
      JSON.stringify(buildMachinePayload(data), null, 2),
      END_DATA
    ].join("\n");
  }

  function mailto(data, fields) {
    var subject = safeSubject(data.requestTitle);
    var body = buildBody(data, fields);
    return "mailto:" + RECIPIENT + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
  }

  window.MnCmsEmailAgenda = {
    recipient: RECIPIENT,
    beginData: BEGIN_DATA,
    endData: END_DATA,
    safeSubject: safeSubject,
    buildMachinePayload: buildMachinePayload,
    buildBody: buildBody,
    mailto: mailto
  };
})();
