(function (root) {
  "use strict";

  var typeCodes = {
    orderCatalog: "OC",
    orderSentence: "OS",
    ivSet: "IV Set",
    carePlan: "CP",
    snAnaesthesia: "SN Anaesthesia"
  };

  function clean(value) {
    return String(value || "").trim();
  }

  function safePart(value) {
    return clean(value)
      .replace(/[\\/:*?"<>|]+/g, "-")
      .replace(/\s+-\s+-+/g, " - ")
      .replace(/\s+/g, " ")
      .replace(/^[-. ]+|[-. ]+$/g, "");
  }

  function dateForFilename(value) {
    var match = clean(value).match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!match) {
      var now = new Date();
      return String(now.getDate()).padStart(2, "0") + String(now.getMonth() + 1).padStart(2, "0") + now.getFullYear();
    }
    return match[3] + match[2] + match[1];
  }

  function fileBase(data) {
    var code = typeCodes[data.typeId] || "Change";
    var subject = safePart(data.shortSubject || data.requestTitle || "Untitled")
      .replace(/-\s*$/, "")
      .replace(new RegExp("\\s+" + code.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\s+CR$", "i"), "")
      .replace(/\s+CR$/i, "");
    subject = subject.replace(/-\s*$/, "").trim();
    return [subject, code, "CR -", safePart(data.siteCode || "SITE"), dateForFilename(data.requestDate || data.generatedAt)].join(" ");
  }

  function itemHasIntent(item) {
    return [item.requestSummary, item.request, item.action, item.description, item.genericName, item.orderableSynonym, item.carePlanName, item.anaesthesiaIdentifier]
      .some(function (value) { return clean(value); });
  }

  function validate(data) {
    var errors = [];
    [
      ["typeId", "Choose a request type."],
      ["shortSubject", "Add a short subject for the filename."],
      ["requestTitle", "Describe the change in a short title."],
      ["requestingSite", "Name the requesting site or team."],
      ["siteCode", "Add the site code used in filenames."],
      ["requesterName", "Add the requester name."],
      ["overallReason", "Explain the problem or reason for discussion."]
    ].forEach(function (rule) {
      if (!clean(data[rule[0]])) errors.push({ field: rule[0], message: rule[1] });
    });
    if (!data.privacyConfirmed) errors.push({ field: "privacyConfirmed", message: "Confirm that no patient-identifiable information is included." });
    if (!Array.isArray(data.items) || !data.items.some(itemHasIntent)) {
      errors.push({ field: "items", message: "Add at least one requested change. It is acceptable to say that technical details require discussion." });
    }
    if (data.typeId === "ivSet" && (!Array.isArray(data.items) || data.items.some(function (item) { return !clean(item.nicuInfusion); }))) {
      errors.push({ field: "nicuInfusion", message: "Answer whether each IV Set is for NICU." });
    }
    return { errors: errors };
  }

  function readiness(data, fields) {
    var errors = validate(data).errors;
    var optional = (fields || []).filter(function (field) { return field.key; });
    var completed = optional.reduce(function (count, field) {
      return count + ((data.items || []).some(function (item) { return clean(item[field.key]); }) ? 1 : 0);
    }, 0);
    return { blocking: errors.length, errors: errors, optionalCompleted: completed, optionalTotal: optional.length };
  }

  root.MnCmsCore = {
    fileBase: fileBase,
    validate: validate,
    readiness: readiness
  };
})(typeof window !== "undefined" ? window : globalThis);
