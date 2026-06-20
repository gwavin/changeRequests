(function (root) {
  "use strict";

  var SKIPPED = "__SKIPPED__";
  function clean(value) { return value === SKIPPED || value == null ? "" : String(value).trim(); }
  function escapeHtml(value) { return String(value == null ? "" : value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  function item(data) { return (data && data.items && data.items[0]) || {}; }
  function present(value) { return clean(value) || "Not specified"; }
  function join(parts, separator) { return parts.map(clean).filter(Boolean).join(separator || " "); }

  function model(data) {
    var current = item(data);
    var medication = clean(current.orderableSynonym) || "Medication not specified";
    var dose = join([current.dose, current.doseUnit]);
    var prn = clean(current.prn) === "Y" ? "PRN" + (clean(current.prnReason) ? " for " + clean(current.prnReason) : "") : "";
    var filter = clean(current.ageRangeCriteria);
    var details = [
      dose ? "DOSE: " + dose : "",
      clean(current.routeOfAdministration) ? "ROUTE: " + clean(current.routeOfAdministration) : "",
      clean(current.drugForm), clean(current.frequency), prn
    ].filter(Boolean).join(" - ");
    var selectionLine = medication + (details ? " " + details : "") + (filter ? " [" + filter + "]" : "");
    var cdlLine = join([medication, dose, current.routeOfAdministration, current.drugForm, current.frequency, prn], " - ");
    return { item: current, medication: medication, dose: dose, prn: prn, filter: filter, selectionLine: selectionLine, cdlLine: cdlLine };
  }

  function valueMarkup(value, key, interactive) {
    var text = present(value);
    var cls = clean(value) ? "os-preview-value" : "os-preview-value os-preview-empty";
    if (interactive && clean(value)) return "<button type=\"button\" class=\"" + cls + "\" data-edit-step=\"" + escapeHtml(key) + "\">" + escapeHtml(text) + "</button>";
    return "<span class=\"" + cls + "\">" + escapeHtml(text) + "</span>";
  }

  function field(label, value, key, interactive) {
    return "<div class=\"os-oef-field\"><span>" + escapeHtml(label) + "</span>" + valueMarkup(value, key, interactive) + "</div>";
  }

  function render(data, options) {
    var view = model(data);
    var current = view.item;
    var interactive = !!(options && options.interactive);
    if (clean(current.request) === "Remove") {
      return "<section class=\"os-live-preview os-removal-preview\"><p class=\"os-preview-kicker\">Request mockup - not a live clinical-system screen</p><h3>Proposed removal</h3><p>Existing Order Sentence</p><div class=\"os-display-line\">" + escapeHtml(present(current.currentValue)) + "</div></section>";
    }
    var selection = interactive ? "<button type=\"button\" class=\"os-display-line\" data-edit-step=\"orderableSynonym\">" + escapeHtml(view.selectionLine) + "</button>" : "<div class=\"os-display-line\">" + escapeHtml(view.selectionLine) + "</div>";
    var modifyContext = clean(current.request) === "Modify" ? "<div class=\"os-current-preview\"><strong>Current Order Sentence</strong><span>" + escapeHtml(present(current.currentValue)) + "</span></div><h3 class=\"os-requested-heading\">Requested OEF and CDL</h3>" : "";
    return [
      "<section class=\"os-live-preview\" aria-label=\"Order Sentence request mockups\">",
      "<p class=\"os-preview-kicker\">Request mockup - not a live clinical-system screen</p>",
      modifyContext,
      "<div class=\"os-preview-pair\">",
      "<section class=\"os-preview-card\"><h3>OEF - while ordering</h3><div class=\"os-system-window\"><div class=\"os-system-title\">Details for " + escapeHtml(view.medication) + "</div><div class=\"os-system-tabs\"><span class=\"active\">Details</span><span>Order Comments</span><span>Diagnoses</span></div><div class=\"os-oef-grid\">",
      field("Dose", current.dose, "dose", interactive), field("Dose Unit", current.doseUnit, "doseUnit", interactive),
      field("Route of Administration", current.routeOfAdministration, "routeOfAdministration", interactive), field("Drug Form", current.drugForm, "drugForm", interactive),
      field("PRN", current.prn, "prn", interactive), field("PRN Reason", current.prnReason, "prnReason", interactive),
      field("Give First Dose Now", current.giveFirstDoseNow, "giveFirstDoseNow", interactive), field("Frequency", current.frequency, "frequency", interactive),
      field("Duration", current.duration, "duration", interactive), field("Duration Unit", current.durationUnit, "durationUnit", interactive),
      field("Order Instructions", current.specialInstructions, "specialInstructions", interactive),
      "</div><div class=\"os-order-comments\"><strong>Order Comments</strong>" + valueMarkup(current.orderComments, "orderComments", interactive) + "</div></div></section>",
      "<section class=\"os-preview-card\"><h3>CDL - after ordering</h3><div class=\"os-preview-subheading\">OEF selection line</div>" + selection + "<div class=\"os-preview-subheading\">Clinical display line</div><div class=\"os-cdl-row\"><strong>" + escapeHtml(view.medication) + "</strong><span>" + escapeHtml(view.cdlLine) + "</span></div></section>",
      "</div></section>"
    ].join("");
  }

  root.MnCmsOsPreview = { model: model, render: render };
})(typeof window !== "undefined" ? window : globalThis);
