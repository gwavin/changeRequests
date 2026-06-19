(function (root) {
  "use strict";

  var SKIPPED = "__SKIPPED__";
  var actionOptions = ["Add", "Modify", "Remove"];
  var referenceOptions = ["SPC / HPRA", "BNF", "BNFC", "Medicines.ie", "Local guideline or formulary decision", "Other", "Not yet checked", "Not sure"];
  var yesNoUnsure = ["Yes", "No", "Not sure"];

  function clean(value) { return String(value == null ? "" : value).trim(); }
  function firstItem(data) { return (data.items && data.items[0]) || data.item || {}; }
  function read(data, key) {
    if (key === "privacyConfirmed") return !!data.privacyConfirmed;
    if (["siteCode", "requesterName", "requesterContact", "shortSubject", "requestTitle"].indexOf(key) >= 0) return data[key];
    return firstItem(data)[key];
  }
  function step(key, title, type, opts) {
    var result = { key: key, title: title, type: type || "text", required: true };
    Object.keys(opts || {}).forEach(function (name) { result[name] = opts[name]; });
    return result;
  }
  function action(data) { return clean(firstItem(data).request || data.request); }
  function isAdd(data) { return action(data) === "Add"; }
  function isModify(data) { return action(data) === "Modify"; }
  function isRemove(data) { return action(data) === "Remove"; }
  function referenceNeedsDetail(data) {
    return ["Not yet checked", "Not sure", ""].indexOf(clean(firstItem(data).referenceState)) < 0;
  }

  var orderCatalogSteps = [
    step("request", "What do you need to do?", "choice", { options: actionOptions, description: "Choose the outcome you need. Later questions will adapt to your answer." }),
    step("genericName", "Which medication or Order Catalog item is affected?", "text", { placeholder: "Example: Labetalol", description: "Use the generic name where you know it. Ordinary language is fine if the exact catalogue wording is uncertain." }),
    step("currentProductDescription", "What does the existing item show today?", "textarea", { when: isModify, placeholder: "Describe the current name, brand, strength or search result.", description: "Copy the current wording if available; otherwise describe what users see." }),
    step("requestedProductDescription", "What should it show instead?", "textarea", { when: isModify, placeholder: "Describe the requested replacement wording or outcome.", description: "Keep current and requested values clearly separate." }),
    step("reasonForRequest", "Why is this change needed?", "textarea", { placeholder: "Explain the problem or need in ordinary language.", description: "Describe what is wrong today and why the team should discuss this change." }),
    step("referenceState", "What reference or decision supports this request?", "choice", { options: referenceOptions, description: "Choose the source used to verify the medication details, or say honestly that it has not yet been checked." }),
    step("referenceChecked", "Which reference did you check?", "textarea", { when: referenceNeedsDetail, placeholder: "Example: SPC on HPRA, section 2; local formulary decision dated…", description: "Give enough detail for a reviewer to find the source." }),
    step("brandName", "Is there a brand name to include?", "text", { required: false, skipValue: SKIPPED, placeholder: "Example: Trandate", description: "Optional. Skip if the request is generic-only or the brand is unknown." }),
    step("strengths", "Which strength or presentation is needed?", "strengths", { when: isAdd, description: "Add each distinct strength or presentation. Each will become a separate formal Order Catalog row." }),
    step("orderableSynonyms", "Should users find it under any other names?", "textarea", { required: false, skipValue: SKIPPED, placeholder: "Brand, abbreviation, former name or local search term", description: "Optional. Add search words that genuinely help users find the item." }),
    step("hasSafetyRestrictions", "Are there safety, formulary or restriction notes?", "choice", { options: yesNoUnsure, description: "Choose Yes only when reviewers need specific restrictions or alerts." }),
    step("safetyRestrictionNotes", "What safety or restriction wording is needed?", "textarea", { when: function (data) { return clean(firstItem(data).hasSafetyRestrictions) === "Yes"; }, placeholder: "Describe the alert, restriction or approval requirement." }),
    step("replacementImpactState", "Is there a replacement item or workflow impact?", "choice", { when: isRemove, options: yesNoUnsure, description: "This helps reviewers understand what happens when the item is no longer available." }),
    step("replacementImpactDetails", "Describe the replacement or impact", "textarea", { when: function (data) { return isRemove(data) && clean(firstItem(data).replacementImpactState) !== "No"; }, required: false, skipValue: SKIPPED, placeholder: "Replacement item, affected workflow, or what still needs discussion" }),
    step("validationNotes", "How will your site check that the result is correct?", "textarea", { required: false, skipValue: "To discuss with the implementing team", placeholder: "Example: Search for each strength and verify the displayed generic and brand names.", description: "Optional, but a short practical check makes the request safer." }),
    step("siteCode", "Which site is requesting this change?", "site", { description: "Choose the hospital responsible for requesting and validating the change." }),
    step("requesterName", "Who can reviewers contact about this request?", "text", { placeholder: "Your name" }),
    step("requesterContact", "What is the best work contact?", "text", { required: false, skipValue: SKIPPED, placeholder: "Work email or telephone extension", description: "Optional. Do not enter patient contact details." }),
    step("privacyConfirmed", "Does this request contain no patient-identifiable information?", "confirm", { description: "Required. Change requests must never contain patient-identifiable information." }),
    step("removalConfirmed", "Confirm the requested removal", "confirm", { when: isRemove, confirmText: "I understand this request is to remove the identified Order Catalog item.", description: "This clarifies the request only; it does not approve or execute removal." }),
    step("review", "Review your assembled request", "review", { description: "Check every answer, edit anything that is unclear, then prepare the discussion files." })
  ];

  function stepsFor(typeId, data) {
    if (typeId !== "orderCatalog") return [];
    return orderCatalogSteps.filter(function (entry) { return !entry.when || entry.when(data || {}); });
  }
  function answerComplete(entry, data) {
    if (entry.key === "review") return true;
    var value = read(data || {}, entry.key);
    if (entry.type === "strengths") return Array.isArray(value) && value.some(function (item) { return clean(item); });
    if (entry.type === "confirm") return value === true || value === "Yes";
    return clean(value) !== "";
  }
  function nextIncompleteStep(typeId, data) {
    var steps = stepsFor(typeId, data);
    return steps.find(function (entry) { return !answerComplete(entry, data); }) || steps[steps.length - 1] || null;
  }
  function derivedMetadata(typeId, data) {
    if (typeId !== "orderCatalog") return {};
    var item = firstItem(data || {});
    var name = clean(item.genericName || item.currentProductDescription || "Order Catalog item");
    var verb = clean(item.request || "Change");
    return {
      shortSubject: clean(data.shortSubject) || name,
      requestTitle: clean(data.requestTitle) || (verb + " " + name + (verb === "Add" ? " to" : " in") + " Order Catalog")
    };
  }
  function orderCatalogRows(data) {
    var item = firstItem(data || {});
    var strengths = Array.isArray(item.strengths) ? item.strengths.filter(function (value) { return clean(value); }) : [];
    if (!strengths.length) strengths = [clean(item.strength)];
    return strengths.map(function (strength) {
      return {
        request: clean(item.request), reasonForRequest: clean(item.reasonForRequest),
        reference: clean(item.referenceChecked || item.referenceState), genericName: clean(item.genericName),
        brandName: clean(item.brandName) === SKIPPED ? "" : clean(item.brandName), strength: strength,
        currentValue: clean(item.currentProductDescription), requestedValue: clean(item.requestedProductDescription)
      };
    });
  }

  root.MnCmsJourney = {
    SKIPPED: SKIPPED,
    definitions: { orderCatalog: orderCatalogSteps },
    stepsFor: stepsFor,
    stepByKey: function (typeId, data, key) { return stepsFor(typeId, data).find(function (entry) { return entry.key === key; }) || null; },
    nextIncompleteStep: nextIncompleteStep,
    answerComplete: answerComplete,
    derivedMetadata: derivedMetadata,
    orderCatalogRows: orderCatalogRows
  };
})(typeof window !== "undefined" ? window : globalThis);
