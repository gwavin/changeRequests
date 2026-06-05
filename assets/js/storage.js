(function () {
  "use strict";

  var key = "mnCmsChangeRequestDraft.v1";

  window.MnCmsStorage = {
    saveDraft: function (data) {
      localStorage.setItem(key, JSON.stringify(data));
    },
    loadDraft: function () {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    },
    clearDraft: function () {
      localStorage.removeItem(key);
    }
  };
})();
