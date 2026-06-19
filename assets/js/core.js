(function (root) {
  "use strict";

  var typeCodes = {
    orderCatalog: "OC",
    orderSentence: "OS",
    ivSet: "IV Set",
    carePlan: "CP",
    snAnaesthesia: "SN Anaesthesia"
  };

  var sites = [
    { code: "NMH", name: "National Maternity Hospital" },
    { code: "ROH", name: "Rotunda Hospital" },
    { code: "CUMH", name: "Cork University Maternity Hospital" },
    { code: "TCH", name: "The Coombe Hospital" },
    { code: "UMHL", name: "University Maternity Hospital Limerick" },
    { code: "UHK", name: "University Hospital Kerry" },
    { code: "NATIONAL", name: "National / All Sites" }
  ];

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

  function siteForCode(code) {
    var normalised = clean(code).toUpperCase();
    return sites.find(function (site) { return site.code === normalised; }) || null;
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

  function validateOrderCatalog(data, errors) {
    var item = (data.items && data.items[0]) || {};
    var action = clean(item.request);
    if (["Add", "Modify", "Remove"].indexOf(action) < 0) errors.push({ field: "request", message: "Choose whether to add, modify, or remove an Order Catalog item." });
    if (!clean(item.genericName)) errors.push({ field: "genericName", message: "Identify the medication or Order Catalog item." });
    if (!clean(item.reasonForRequest)) errors.push({ field: "reasonForRequest", message: "Explain why the Order Catalog change is needed." });
    if (!clean(item.referenceChecked)) errors.push({ field: "referenceChecked", message: "Identify the authoritative reference used to confirm that the request is clinically correct." });
    if (item.clinicalCorrectnessConfirmed !== true && item.clinicalCorrectnessConfirmed !== "Yes") errors.push({ field: "clinicalCorrectnessConfirmed", message: "The medicines-team liaison must confirm the clinical correctness of the request." });
    if (action === "Add") {
      var strengths = Array.isArray(item.strengths) ? item.strengths : [item.strength];
      if (!strengths.some(clean)) errors.push({ field: "strengths", message: "Add at least one strength or presentation." });
    }
    if (action === "Modify") {
      if (!clean(item.currentProductDescription)) errors.push({ field: "currentProductDescription", message: "Describe what the existing Order Catalog item shows today." });
      if (!clean(item.requestedProductDescription)) errors.push({ field: "requestedProductDescription", message: "Describe what the Order Catalog item should show instead." });
    }
    if (action === "Remove" && item.removalConfirmed !== true && item.removalConfirmed !== "Yes") errors.push({ field: "removalConfirmed", message: "Confirm that this request is to remove the identified Order Catalog item." });
  }

  function validate(data) {
    var errors = [];
    [
      ["typeId", "Choose a request type."],
      ["shortSubject", "Add a short subject for the filename."],
      ["requestTitle", "Describe the change in a short title."],
      ["requesterName", "Add the requester name."],
      ["overallReason", "Explain the problem or reason for discussion."]
    ].forEach(function (rule) {
      if (!clean(data[rule[0]])) errors.push({ field: rule[0], message: rule[1] });
    });
    var selectedSite = siteForCode(data.siteCode);
    if (!selectedSite) {
      errors.push({ field: "siteCode", message: "Choose a requesting site from the approved list." });
    } else if (clean(data.requestingSite) !== selectedSite.name) {
      errors.push({ field: "siteCode", message: "Re-select the requesting site so its full name can be confirmed." });
    }
    if (!data.privacyConfirmed) errors.push({ field: "privacyConfirmed", message: "Confirm that no patient-identifiable information is included." });
    if (!Array.isArray(data.items) || !data.items.some(itemHasIntent)) {
      errors.push({ field: "items", message: "Add at least one requested change. It is acceptable to say that technical details require discussion." });
    }
    if (data.typeId === "ivSet" && (!Array.isArray(data.items) || data.items.some(function (item) { return !clean(item.nicuInfusion); }))) {
      errors.push({ field: "nicuInfusion", message: "Answer whether each IV Set is for NICU." });
    }
    if (data.typeId === "orderCatalog") validateOrderCatalog(data, errors);
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
    sites: sites.map(function (site) { return { code: site.code, name: site.name }; }),
    siteForCode: siteForCode,
    fileBase: fileBase,
    validate: validate,
    readiness: readiness
  };
})(typeof window !== "undefined" ? window : globalThis);
