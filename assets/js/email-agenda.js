(function () {
  "use strict";

  var RECIPIENT = "MN-CMSMedsChangelog@HealthIreland.onmicrosoft.com";
  var BEGIN_DATA = "---BEGIN MN-CMS CR DATA---";
  var END_DATA = "---END MN-CMS CR DATA---";
  var SYSTEM_WARNING = "The text below is used automatically to process this change request.\nPlease do not edit, delete or reformat it.";

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

  function utf8ToBase64(text) {
    var bytes = new TextEncoder().encode(text);
    var binary = "";
    bytes.forEach(function (byte) {
      binary += String.fromCharCode(byte);
    });
    return btoa(binary);
  }

  function buildBody(data, fields) {
    var readable = window.MnCmsExporters.txt(data, fields);
    var json = JSON.stringify(buildMachinePayload(data));
    return [
      readable,
      "",
      "------------------------------------------------------------",
      "MN-CMS SYSTEM DATA",
      "",
      SYSTEM_WARNING,
      "",
      BEGIN_DATA,
      utf8ToBase64(json),
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
    systemWarning: SYSTEM_WARNING,
    safeSubject: safeSubject,
    buildMachinePayload: buildMachinePayload,
    utf8ToBase64: utf8ToBase64,
    buildBody: buildBody,
    mailto: mailto
  };
})();
