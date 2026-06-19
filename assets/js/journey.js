(function (root) {
  "use strict";

  var SKIPPED = "__SKIPPED__";
  var actionOptions = ["Add", "Modify", "Remove"];
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
  var orderCatalogSteps = [
    step("siteCode", "Which site is requesting this change?", "site", { description: "Choose the site represented by its designated medicines-team liaison." }),
    step("requesterName", "Who is the medicines-team liaison submitting this request?", "text", { placeholder: "Liaison name", description: "Only the designated medicines-team liaison for the selected site may submit a change request." }),
    step("request", "What do you need to do?", "choice", { options: actionOptions, description: "Choose the outcome you need. Later questions will adapt to your answer." }),
    step("genericName", "Which medication or Order Catalog item is affected?", "text", { placeholder: "Example: Labetalol", description: "Use the generic name. Generic prescribing is preferred; brand information can be supplied later when it is clinically or operationally relevant." }),
    step("currentProductDescription", "What does the existing item show today?", "textarea", { when: isModify, placeholder: "Describe the current name, brand, strength or search result.", description: "Copy the current wording if available; otherwise describe what users see." }),
    step("requestedProductDescription", "What should it show instead?", "textarea", { when: isModify, placeholder: "Describe the requested replacement wording or outcome.", description: "Keep current and requested values clearly separate." }),
    step("reasonForRequest", "Why is this change needed?", "textarea", { placeholder: "Explain the problem or need in ordinary language.", description: "Describe what is wrong today and why the team should discuss this change." }),
    step("referenceChecked", "What authoritative reference did you use to confirm this request is clinically correct?", "textarea", { placeholder: "Example: HPRA SPC, section 2; BNF monograph; dated local formulary decision", description: "Identify the source precisely enough for the medicines team to review it." }),
    step("brandName", "Is there a clinically relevant brand name to include?", "text", { required: false, skipValue: SKIPPED, placeholder: "Example: Trandate", description: "Optional. Generic prescribing is preferred; include a brand only when it is clinically or operationally relevant." }),
    step("strengths", "Which strength or presentation is needed?", "strengths", { when: isAdd, description: "Include strength, especially for multi-ingredient preparations. Prescribing strengths are normally handled in Order Sentences, so a separate Order Sentence request will probably also be needed." }),
    step("hasSafetyRestrictions", "Are there safety, formulary or restriction notes?", "choice", { options: yesNoUnsure, description: "Choose Yes only when reviewers need specific restrictions or alerts." }),
    step("safetyRestrictionNotes", "What safety or restriction wording is needed?", "textarea", { when: function (data) { return clean(firstItem(data).hasSafetyRestrictions) === "Yes"; }, placeholder: "Describe the alert, restriction or approval requirement." }),
    step("replacementImpactState", "Is there a replacement item or workflow impact?", "choice", { when: isRemove, options: yesNoUnsure, description: "This helps reviewers understand what happens when the item is no longer available." }),
    step("replacementImpactDetails", "Describe the replacement or impact", "textarea", { when: function (data) { return isRemove(data) && clean(firstItem(data).replacementImpactState) !== "No"; }, required: false, skipValue: SKIPPED, placeholder: "Replacement item, affected workflow, or what still needs discussion" }),
    step("clinicalCorrectnessConfirmed", "Confirm the clinical correctness of this request", "confirm", { confirmText: "I confirm that I have checked the clinical correctness of the requested medication details against the authoritative reference stated above.", description: "Required requester assurance. This does not replace medicines-team review, technical validation, or approval." }),
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
