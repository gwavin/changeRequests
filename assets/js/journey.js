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
    step("strengths", "Which strength or presentation is needed?", "strengths", { when: isAdd, required: false, skipValue: SKIPPED, description: "Include strength where known, especially for multi-ingredient preparations, or skip to record Not supplied. Prescribing strengths are normally handled in Order Sentences, so a separate Order Sentence request will probably also be needed." }),
    step("hasSafetyRestrictions", "Are there safety, formulary or restriction notes?", "choice", { options: yesNoUnsure, description: "Choose Yes only when reviewers need specific restrictions or alerts." }),
    step("safetyRestrictionNotes", "What safety or restriction wording is needed?", "textarea", { when: function (data) { return clean(firstItem(data).hasSafetyRestrictions) === "Yes"; }, placeholder: "Describe the alert, restriction or approval requirement." }),
    step("replacementImpactState", "Is there a replacement item or workflow impact?", "choice", { when: isRemove, options: yesNoUnsure, description: "This helps reviewers understand what happens when the item is no longer available." }),
    step("replacementImpactDetails", "Describe the replacement or impact", "textarea", { when: function (data) { return isRemove(data) && clean(firstItem(data).replacementImpactState) !== "No"; }, required: false, skipValue: SKIPPED, placeholder: "Replacement item, affected workflow, or what still needs discussion" }),
    step("clinicalCorrectnessConfirmed", "Confirm the clinical correctness of this request", "confirm", { confirmText: "I confirm that I have checked the clinical correctness of the requested medication details against the authoritative reference stated above.", description: "Required requester assurance. This does not replace medicines-team review, technical validation, or approval." }),
    step("privacyConfirmed", "Does this request contain no patient-identifiable information?", "confirm", { description: "Required. Change requests must never contain patient-identifiable information." }),
    step("removalConfirmed", "Confirm the requested removal", "confirm", { when: isRemove, confirmText: "I understand this request is to remove the identified Order Catalog item.", description: "This clarifies the request only; it does not approve or execute removal." }),
    step("review", "Review your assembled request", "review", { description: "Check every answer, edit anything that is unclear, then prepare the discussion files." })
  ];

  var orderSentenceSteps = [
    step("siteCode", "Which site is requesting this change?", "site", { description: "Choose the site represented by its designated medicines-team liaison." }),
    step("requesterName", "Who is the medicines-team liaison submitting this request?", "text", { placeholder: "Liaison name", description: "Only the designated medicines-team liaison for the selected site may submit a change request." }),
    step("request", "What do you need to do to this Order Sentence?", "choice", { options: actionOptions, description: "Choose Add, Modify, or Remove. Later questions adapt to this answer." }),
    step("orderableSynonym", "Which medication or orderable is this sentence for?", "text", { placeholder: "Example: Labetalol", description: "Use the generic medication or orderable name." }),
    step("currentValue", "What does the current Order Sentence say?", "textarea", { when: isModify, placeholder: "Copy or describe the current sentence." }),
    step("requestedValue", "What should the Order Sentence say instead?", "textarea", { when: isModify, placeholder: "Describe the requested replacement sentence." }),
    step("reasonForRequest", "Why is this Order Sentence change needed?", "textarea", { placeholder: "Explain the clinical need or current problem." }),
    step("referenceChecked", "What authoritative reference did you use to confirm this request is clinically correct?", "textarea", { placeholder: "Example: HPRA SPC section; BNF monograph; dated local guideline" }),
    step("sentenceType", "Where will this sentence be used?", "choice", { options: ["Administration (inpatient)", "Prescription (outpatient)", "Both", "Not sure"], description: "Choose the intended prescribing context." }),
    step("facilities", "Should it apply locally or across all sites?", "choice", { options: ["Local", "All", "Not sure"] }),
    step("dose", "What dose or strength should the sentence contain?", "text", { required: false, skipValue: SKIPPED, placeholder: "Example: 100" }),
    step("doseUnit", "What is the dose unit?", "text", { required: false, skipValue: SKIPPED, placeholder: "Example: mg or micrograms/kg" }),
    step("routeOfAdministration", "Which route should be used?", "route", { required: false, skipValue: SKIPPED }),
    step("drugForm", "Which drug form is needed?", "text", { required: false, skipValue: SKIPPED, placeholder: "Example: tablet or solution for injection" }),
    step("frequency", "What frequency is needed?", "text", { required: false, skipValue: SKIPPED, placeholder: "Example: twice daily" }),
    step("prn", "Is this a PRN (when required) sentence?", "choice", { options: ["Y", "N", "Not sure"] }),
    step("prnReason", "What is the PRN indication?", "text", { when: function (data) { return clean(firstItem(data).prn) === "Y"; }, placeholder: "Example: for nausea" }),
    step("giveFirstDoseNow", "Should the first dose be given now?", "choice", { options: ["Y", "N", "Not sure"] }),
    step("duration", "Is a duration needed?", "text", { required: false, skipValue: SKIPPED, placeholder: "Example: 5 days" }),
    step("durationUnit", "What is the duration unit?", "text", { required: false, skipValue: SKIPPED, placeholder: "Example: days or doses" }),
    step("specialInstructions", "Are special instructions needed?", "textarea", { required: false, skipValue: SKIPPED, placeholder: "Add essential administration or prescribing instructions." }),
    step("orderComments", "Should any Order Comments appear with this sentence?", "textarea", { required: false, skipValue: SKIPPED, placeholder: "Enter comments that should remain visible with the order." }),
    step("hasPatientFilters", "Are there age, postmenstrual-age, or weight restrictions?", "choice", { options: ["Yes", "No", "Not sure"] }),
    step("ageRangeCriteria", "Describe any age restriction", "textarea", { when: function (data) { return clean(firstItem(data).hasPatientFilters) === "Yes"; }, required: false, skipValue: SKIPPED, placeholder: "Example: Greater Than or Equal To 12 year" }),
    step("pmaCriteria", "Describe any postmenstrual-age restriction", "textarea", { when: function (data) { return clean(firstItem(data).hasPatientFilters) === "Yes"; }, required: false, skipValue: SKIPPED }),
    step("weightCriteria", "Describe any weight restriction", "textarea", { when: function (data) { return clean(firstItem(data).hasPatientFilters) === "Yes"; }, required: false, skipValue: SKIPPED }),
    step("clinicalCorrectnessConfirmed", "Confirm the clinical correctness of this request", "confirm", { confirmText: "I confirm that I have checked the clinical correctness of this Order Sentence request against the authoritative reference stated above." }),
    step("privacyConfirmed", "Does this request contain no patient-identifiable information?", "confirm", { description: "Required. Change requests must never contain patient-identifiable information." }),
    step("removalConfirmed", "Confirm the requested removal", "confirm", { when: isRemove, confirmText: "I understand this request is to remove the identified Order Sentence." }),
    step("review", "Review your assembled Order Sentence request", "review")
  ];

  function stepsFor(typeId, data) {
    var definitions = { orderCatalog: orderCatalogSteps, orderSentence: orderSentenceSteps };
    return (definitions[typeId] || []).filter(function (entry) { return !entry.when || entry.when(data || {}); });
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
    var item = firstItem(data || {});
    if (typeId === "orderSentence") {
      var orderable = clean(item.orderableSynonym || "Order Sentence");
      return { shortSubject: clean(data.shortSubject) || orderable, requestTitle: clean(data.requestTitle) || (clean(item.request || "Change") + " " + orderable + " Order Sentence") };
    }
    if (typeId !== "orderCatalog") return {};
    var name = clean(item.genericName || item.currentProductDescription || "Order Catalog item");
    var verb = clean(item.request || "Change");
    return {
      shortSubject: clean(data.shortSubject) || name,
      requestTitle: clean(data.requestTitle) || (verb + " " + name + (verb === "Add" ? " to" : " in") + " Order Catalog")
    };
  }
  function synchronizedAutomaticText(currentValue, previousAutomaticValue, requestedValue) {
    var current = clean(currentValue);
    var previous = clean(previousAutomaticValue);
    return !current || current === previous ? requestedValue : currentValue;
  }
  function orderCatalogRows(data) {
    var item = firstItem(data || {});
    var strengths = Array.isArray(item.strengths) ? item.strengths.filter(function (value) { return clean(value); }) : [];
    if (item.strengths === SKIPPED) strengths = ["Not supplied"];
    if (!strengths.length) strengths = [clean(item.strength)];
    if (!strengths[0]) strengths = ["Not supplied"];
    return strengths.map(function (strength) {
      return {
        request: clean(item.request), reasonForRequest: clean(item.reasonForRequest),
        reference: clean(item.referenceChecked || item.referenceState), genericName: clean(item.genericName),
        brandName: clean(item.brandName) === SKIPPED ? "" : clean(item.brandName), strength: strength,
        currentValue: clean(item.currentProductDescription), requestedValue: clean(item.requestedProductDescription)
      };
    });
  }
  function orderSentenceRows(data) {
    var item = firstItem(data || {});
    return [{
      request: clean(item.request), medication: clean(item.orderableSynonym),
      dose: [clean(item.dose), clean(item.doseUnit)].filter(Boolean).join(" "),
      route: clean(item.routeOfAdministration), frequency: clean(item.frequency),
      prn: clean(item.prn) === "Y" ? ("Yes" + (clean(item.prnReason) ? " - " + clean(item.prnReason) : "")) : clean(item.prn),
      duration: clean(item.duration), reference: clean(item.referenceChecked)
    }];
  }
  function reviewColumns(typeId) {
    if (typeId === "orderSentence") return [["request", "Request"], ["medication", "Medication / orderable"], ["dose", "Dose"], ["route", "Route"], ["frequency", "Frequency"], ["prn", "PRN"], ["duration", "Duration"], ["reference", "Authoritative reference"]];
    return [["request", "Request"], ["reasonForRequest", "Reason"], ["reference", "Authoritative reference"], ["genericName", "Generic name"], ["brandName", "Brand (if relevant)"], ["strength", "Strength"]];
  }

  root.MnCmsJourney = {
    SKIPPED: SKIPPED,
    definitions: { orderCatalog: orderCatalogSteps, orderSentence: orderSentenceSteps },
    stepsFor: stepsFor,
    stepByKey: function (typeId, data, key) { return stepsFor(typeId, data).find(function (entry) { return entry.key === key; }) || null; },
    nextIncompleteStep: nextIncompleteStep,
    answerComplete: answerComplete,
    derivedMetadata: derivedMetadata,
    synchronizedAutomaticText: synchronizedAutomaticText,
    synchronizedOverallReason: synchronizedAutomaticText,
    orderCatalogRows: orderCatalogRows
    ,orderSentenceRows: orderSentenceRows
    ,reviewRows: function (typeId, data) { return typeId === "orderSentence" ? orderSentenceRows(data) : orderCatalogRows(data); }
    ,reviewColumns: reviewColumns
  };
})(typeof window !== "undefined" ? window : globalThis);
