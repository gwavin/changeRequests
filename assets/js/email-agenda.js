(function () {
  "use strict";

  var RECIPIENT = "MN-CMSMedsChangelog@HealthIreland.onmicrosoft.com";

  function safeSubject(value) {
    return String(value || "").replace(/[\r\n]/g, "");
  }

  function mailto(data, fields) {
    var subject = safeSubject(data.requestTitle);
    var body = window.MnCmsExporters.txt(data, fields);
    return "mailto:" + RECIPIENT + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
  }

  window.MnCmsEmailAgenda = {
    recipient: RECIPIENT,
    safeSubject: safeSubject,
    mailto: mailto
  };
})();
