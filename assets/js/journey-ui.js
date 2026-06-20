(function (root) {
  "use strict";

  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function clean(value) { return String(value == null ? "" : value).trim(); }
  function item(data) { return (data.items && data.items[0]) || {}; }
  function value(data, key) {
    if (key === "privacyConfirmed") return !!data.privacyConfirmed;
    if (["siteCode", "requesterName", "requesterContact"].indexOf(key) >= 0) return data[key];
    return item(data)[key];
  }
  function display(valueToShow) {
    if (valueToShow === true) return "Confirmed";
    if (valueToShow === root.MnCmsJourney.SKIPPED) return "To discuss";
    if (Array.isArray(valueToShow)) return valueToShow.filter(clean).join(", ") || "Not answered";
    return clean(valueToShow) || "Not answered";
  }

  function create(options) {
    var currentKey = "siteCode";
    var typeId = options.typeId;
    var typeLabel = options.typeLabel;
    var rootEl = options.root;
    rootEl.classList.toggle("os-journey", typeId === "orderSentence");
    var questionEl = rootEl.querySelector("#journeyQuestion");
    var summaryEl = rootEl.querySelector("#journeySummary");
    var actionsEl = rootEl.querySelector("#journeyActions");
    var stepTextEl = rootEl.querySelector("#journeyStepText");
    var progressEl = rootEl.querySelector("#journeyProgress");
    var announcementEl = rootEl.querySelector("#journeyAnnouncement");
    var errorEl = rootEl.querySelector("#journeyError");

    function steps() { return root.MnCmsJourney.stepsFor(typeId, options.getData()); }
    function currentStep() {
      var available = steps();
      return available.find(function (entry) { return entry.key === currentKey; }) || available[0];
    }
    function set(key, answer) {
      options.setAnswer(key, answer);
      options.onChange();
      renderSummary();
      updateContinue();
    }
    function fieldMarkup(entry, data) {
      var current = value(data, entry.key);
      if (entry.type === "choice") {
        return "<div class=\"journey-choices\">" + entry.options.map(function (choice) {
          return "<label class=\"journey-choice\"><input type=\"radio\" name=\"journey-answer\" value=\"" + escapeHtml(choice) + "\"" + (current === choice ? " checked" : "") + "><span>" + escapeHtml(choice) + "</span></label>";
        }).join("") + "</div>";
      }
      if (entry.type === "textarea") return "<textarea id=\"journeyAnswer\" rows=\"5\" placeholder=\"" + escapeHtml(entry.placeholder || "") + "\">" + escapeHtml(current === root.MnCmsJourney.SKIPPED ? "" : current || "") + "</textarea>";
      if (entry.type === "site") return "<select id=\"journeyAnswer\"><option value=\"\">Choose a site</option>" + options.siteOptions.map(function (site) { return "<option value=\"" + site.code + "\"" + (current === site.code ? " selected" : "") + ">" + site.code + " — " + escapeHtml(site.name) + "</option>"; }).join("") + "</select>";
      if (entry.type === "templateSelect") return "<select id=\"journeyAnswer\"><option value=\"\">Choose an option</option>" + (options.templateOptions[entry.optionKey] || []).filter(Boolean).map(function (option) { return "<option value=\"" + escapeHtml(option) + "\"" + (current === option ? " selected" : "") + ">" + escapeHtml(option) + "</option>"; }).join("") + "</select>";
      if (entry.type === "confirm") return "<label class=\"journey-confirm\"><input id=\"journeyAnswer\" type=\"checkbox\"" + (current === true ? " checked" : "") + "><span>" + escapeHtml(entry.confirmText || "Yes — this request contains no patient-identifiable information") + "</span></label>";
      if (entry.type === "strengths") {
        var values = Array.isArray(current) && current.length ? current : [""];
        return "<div id=\"journeyStrengths\" class=\"journey-strengths\">" + values.map(function (strength, index) { return "<div><label>Strength or presentation " + (index + 1) + "<input data-strength-index=\"" + index + "\" value=\"" + escapeHtml(strength) + "\" placeholder=\"Example: 100 mg tablet\"></label>" + (values.length > 1 ? "<button type=\"button\" class=\"secondary small\" data-remove-strength=\"" + index + "\">Remove</button>" : "") + "</div>"; }).join("") + "<button type=\"button\" class=\"secondary\" id=\"addStrengthButton\">Add another strength</button></div>";
      }
      return "<input id=\"journeyAnswer\" type=\"" + (entry.type === "number" ? "number" : "text") + "\" value=\"" + escapeHtml(current === root.MnCmsJourney.SKIPPED ? "" : current || "") + "\" placeholder=\"" + escapeHtml(entry.placeholder || "") + "\">";
    }
    function bindAnswer(entry) {
      if (entry.type === "choice") {
        questionEl.querySelectorAll('input[name="journey-answer"]').forEach(function (control) { control.addEventListener("change", function () { set(entry.key, control.value); }); });
      } else if (entry.type === "strengths") {
        function strengthValues() { return Array.from(questionEl.querySelectorAll("[data-strength-index]")).map(function (control) { return control.value; }); }
        questionEl.querySelectorAll("[data-strength-index]").forEach(function (control) { control.addEventListener("input", function () { set(entry.key, strengthValues()); }); });
        var add = questionEl.querySelector("#addStrengthButton");
        add.addEventListener("click", function () { var values = strengthValues(); values.push(""); set(entry.key, values); render(); });
        questionEl.querySelectorAll("[data-remove-strength]").forEach(function (button) { button.addEventListener("click", function () { var values = strengthValues(); values.splice(Number(button.dataset.removeStrength), 1); set(entry.key, values); render(); }); });
      } else {
        var control = questionEl.querySelector("#journeyAnswer");
        var eventName = entry.type === "confirm" || entry.type === "site" || entry.type === "templateSelect" ? "change" : "input";
        control.addEventListener(eventName, function () { set(entry.key, entry.type === "confirm" ? control.checked : control.value); });
      }
    }
    function updateContinue() {
      var entry = currentStep();
      var next = actionsEl.querySelector("[data-next]");
      if (next) next.disabled = !root.MnCmsJourney.answerComplete(entry, options.getData());
    }
    function goRelative(direction) {
      var available = steps();
      var index = available.findIndex(function (entry) { return entry.key === currentKey; });
      var nextIndex = Math.max(0, Math.min(available.length - 1, index + direction));
      currentKey = available[nextIndex].key;
      render();
    }
    function renderSummary() {
      var data = options.getData();
      var currentItem = item(data);
      var rows = [
        ["Request", currentItem.request, "request"], ["Medication", currentItem.genericName || currentItem.orderableSynonym, typeId === "orderSentence" ? "orderableSynonym" : "genericName"],
        ["Reason", currentItem.reasonForRequest, "reasonForRequest"], ["Authoritative reference", currentItem.referenceChecked, "referenceChecked"]
      ];
      if (typeId === "orderCatalog" && currentItem.request === "Add") rows.push(["Strengths", currentItem.strengths, "strengths"]);
      if (currentItem.request === "Modify") { rows.push(["Current", currentItem.currentProductDescription, "currentProductDescription"]); rows.push(["Requested", currentItem.requestedProductDescription, "requestedProductDescription"]); }
      if (currentItem.request === "Remove") rows.push(["Replacement / impact", currentItem.replacementImpactDetails || currentItem.replacementImpactState, "replacementImpactState"]);
      if (typeId === "orderSentence") {
        rows.push(["Dose", [currentItem.dose, currentItem.doseUnit].filter(clean).join(" "), "dose"]);
        rows.push(["Route", currentItem.routeOfAdministration, "routeOfAdministration"]);
        rows.push(["Frequency", currentItem.frequency, "frequency"]);
      }
      rows.unshift(["Medicines-team liaison", data.requesterName, "requesterName"]); rows.unshift(["Site", data.requestingSite || data.siteCode, "siteCode"]);
      rows.push(["Clinical correctness", currentItem.clinicalCorrectnessConfirmed, "clinicalCorrectnessConfirmed"]);
      var livePreview = typeId === "orderSentence" && root.MnCmsOsPreview ? root.MnCmsOsPreview.render(data, { interactive: currentStep().type === "review" }) : "";
      summaryEl.classList.toggle("os-preview-region", typeId === "orderSentence");
      summaryEl.innerHTML = typeId === "orderSentence" ? livePreview : "<div class=\"journey-summary-heading\"><p class=\"section-label\">Your request so far</p><h3>" + escapeHtml(typeLabel) + "</h3></div><dl>" + rows.map(function (row) { var shown = row[2] === "strengths" && row[1] === root.MnCmsJourney.SKIPPED ? "Not supplied" : display(row[1]); return "<div><dt>" + escapeHtml(row[0]) + "</dt><dd>" + escapeHtml(shown) + "</dd>" + (shown !== "Not answered" && root.MnCmsJourney.stepByKey(typeId, data, row[2]) ? "<button type=\"button\" class=\"summary-edit\" data-edit-step=\"" + row[2] + "\">Edit</button>" : "") + "</div>"; }).join("") + "</dl>";
      summaryEl.querySelectorAll("[data-edit-step]").forEach(function (button) { button.addEventListener("click", function () { currentKey = button.dataset.editStep; render(); }); });
    }
    function renderReview(data) {
      var meta = root.MnCmsJourney.derivedMetadata(typeId, data);
      var rows = root.MnCmsJourney.reviewRows(typeId, data);
      var columns = root.MnCmsJourney.reviewColumns(typeId);
      var currentItem = item(data);
      var strengthGuidance = currentItem.request === "Add" && display(currentItem.strengths) !== "Not answered" ? "<p class=\"journey-warning\"><strong>Order Sentence likely required:</strong> Prescribing strengths are normally handled in Order Sentences, particularly for multi-ingredient preparations. Please submit a separate Order Sentence request where applicable.</p>" : "";
      var finalPreview = "";
      var branchDetails = currentItem.request === "Modify" ? "<div class=\"review-branch-details\"><div><span>Current</span><strong>" + escapeHtml(display(currentItem.currentProductDescription || currentItem.currentValue)) + "</strong></div><div><span>Requested</span><strong>" + escapeHtml(display(currentItem.requestedProductDescription || currentItem.requestedValue)) + "</strong></div></div>" : (currentItem.request === "Remove" ? "<div class=\"review-branch-details\"><div><span>Removal request</span><strong>Explicitly confirmed</strong></div></div>" : "");
      questionEl.innerHTML = "<div class=\"journey-review\"><h2 id=\"journeyQuestionHeading\">Review your assembled request</h2><p class=\"journey-status\">For discussion - not approved</p><div class=\"review-derived\"><label>Short subject<input data-review-meta=\"shortSubject\" value=\"" + escapeHtml(meta.shortSubject) + "\"></label><label>Request title<input data-review-meta=\"requestTitle\" value=\"" + escapeHtml(meta.requestTitle) + "\"></label></div>" + branchDetails + "<div class=\"review-table-wrap\"><table><thead><tr>" + columns.map(function (column) { return "<th>" + escapeHtml(column[1]) + "</th>"; }).join("") + "</tr></thead><tbody>" + rows.map(function (row) { return "<tr>" + columns.map(function (column) { return "<td>" + escapeHtml(row[column[0]]) + "</td>"; }).join("") + "</tr>"; }).join("") + "</tbody></table></div>" + finalPreview + strengthGuidance + "<div class=\"review-actions\"><button type=\"button\" data-download=\"html\">Download HTML review</button><button type=\"button\" data-download=\"csv\">Download CSV</button></div><div class=\"next-cr\"><h3>What would you like to do next?</h3><p>Your request remains a discussion draft. You can start another type if needed.</p><div>" + options.nextTypes.map(function (type) { return "<button type=\"button\" class=\"secondary\" data-next-type=\"" + type.id + "\">" + escapeHtml(type.label) + "</button>"; }).join("") + "</div></div></div>";
      questionEl.querySelectorAll("[data-review-meta]").forEach(function (control) { control.addEventListener("input", function () { set(control.dataset.reviewMeta, control.value); }); });
      questionEl.querySelector('[data-download="html"]').addEventListener("click", options.onDownloadHtml);
      questionEl.querySelector('[data-download="csv"]').addEventListener("click", options.onDownloadCsv);
      questionEl.querySelectorAll("[data-next-type]").forEach(function (button) { button.addEventListener("click", function () { options.onNextType(button.dataset.nextType); }); });
      questionEl.querySelectorAll("[data-edit-step]").forEach(function (button) { button.addEventListener("click", function () { currentKey = button.dataset.editStep; render(); }); });
    }
    function render() {
      var data = options.getData();
      var available = steps();
      var entry = currentStep();
      var index = available.findIndex(function (candidate) { return candidate.key === entry.key; });
      currentKey = entry.key;
      stepTextEl.textContent = "Question " + (index + 1) + " of " + available.length;
      progressEl.setAttribute("aria-valuemin", "1"); progressEl.setAttribute("aria-valuemax", String(available.length)); progressEl.setAttribute("aria-valuenow", String(index + 1));
      progressEl.innerHTML = "<span style=\"width:" + Math.round(((index + 1) / available.length) * 100) + "%\"></span>";
      errorEl.textContent = "";
      if (entry.type === "review") renderReview(data);
      else {
        questionEl.innerHTML = "<p class=\"section-label\">" + escapeHtml(typeLabel) + "</p><h2 id=\"journeyQuestionHeading\" tabindex=\"-1\">" + escapeHtml(entry.title) + "</h2><p class=\"journey-description\">" + escapeHtml(entry.description || "") + "</p><div class=\"journey-control\">" + fieldMarkup(entry, data) + "</div>";
        bindAnswer(entry);
      }
      actionsEl.innerHTML = "<button type=\"button\" class=\"secondary\" data-back" + (index === 0 ? " disabled" : "") + ">Back</button><div>" + (entry.skipValue ? "<button type=\"button\" class=\"secondary\" data-skip>Skip for now</button>" : "") + (entry.type !== "review" ? "<button type=\"button\" data-next>Continue</button>" : "") + "</div>";
      actionsEl.querySelector("[data-back]").addEventListener("click", function () { goRelative(-1); });
      var skip = actionsEl.querySelector("[data-skip]"); if (skip) skip.addEventListener("click", function () { set(entry.key, entry.skipValue); goRelative(1); });
      var next = actionsEl.querySelector("[data-next]"); if (next) next.addEventListener("click", function () { if (!root.MnCmsJourney.answerComplete(entry, options.getData())) { errorEl.textContent = "Please answer this question before continuing."; errorEl.focus(); return; } goRelative(1); });
      updateContinue(); renderSummary();
      announcementEl.textContent = stepTextEl.textContent + ": " + entry.title;
      var heading = questionEl.querySelector("#journeyQuestionHeading"); if (heading) heading.focus();
    }
    return { start: function () { var incomplete = root.MnCmsJourney.nextIncompleteStep(typeId, options.getData()); currentKey = incomplete ? incomplete.key : "siteCode"; render(); }, refresh: render, goTo: function (key) { currentKey = key; render(); }, destroy: function () { rootEl.innerHTML = ""; } };
  }
  root.MnCmsJourneyUi = { create: create };
})(window);
