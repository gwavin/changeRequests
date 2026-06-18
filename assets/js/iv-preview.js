(function (root) {
  "use strict";

  function escapeHtml(value) {
    return String(value || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function text(value) {
    var clean = String(value || "").trim();
    return clean ? escapeHtml(clean) : "<span class=\"iv-empty\">Not specified</span>";
  }

  var fieldGuidance = {
    nicuInfusion: "Required: choose whether this infusion is intended for NICU use.",
    readyDiluted: "Choose Yes when the IV Set comprises the supplied diluent or product only, without a separately prepared additive.",
    diluentOrderableSynonym: "Enter the base solution exactly as users should find or recognise it.",
    additiveOrderableSynonym: "Enter the medication added to the base solution, if any.",
    bagVolume: "Enter the proposed total bag or syringe volume, including its unit.",
    rate: "Enter the proposed administration rate and rate unit.",
    infuseOver: "Enter the proposed infusion duration and time unit.",
    additiveDose: "Enter the additive amount and dose unit.",
    normalisedRate: "Enter the normalised dosing rate and unit, if applicable.",
    routeOfAdministration: "Choose the proposed route of administration.",
    drugForm: "Choose the proposed medication form.",
    duration: "Enter how long the order should remain active.",
    replaceEvery: "Enter the proposed replacement interval.",
    startDateTime: "Enter a representative proposed start date and time only when it helps explain the request.",
    weight: "Enter an example weight only when needed to demonstrate the requested display.",
    weightUnit: "Choose the unit used for the example weight.",
    specialInstructions: "Enter proposed special instructions that should appear with the infusion.",
    orderCommentsInfusionInstructions: "Enter the infusion wording users should see. Do not include patient information."
  };

  function guidance(field, label) {
    return fieldGuidance[field] || ("Enter the proposed " + String(label || field).toLowerCase() + ". Leave blank if it requires team discussion.");
  }

  function input(item, field, label, editable) {
    if (!editable) return text(item[field]);
    return "<input class=\"iv-inline-input\" data-preview-field=\"" + field + "\" aria-label=\"" + escapeHtml(label) + "\" title=\"" + escapeHtml(guidance(field, label)) + "\" value=\"" + escapeHtml(item[field] || "") + "\" placeholder=\"Not specified\">";
  }

  function select(item, field, label, values, editable) {
    if (!editable) return text(item[field]);
    var current = String(item[field] || "");
    return "<select class=\"iv-inline-select\" data-preview-field=\"" + field + "\" aria-label=\"" + escapeHtml(label) + "\" title=\"" + escapeHtml(guidance(field, label)) + "\"><option value=\"\">Not specified</option>" + values.map(function (option) {
      return "<option" + (option === current ? " selected" : "") + ">" + escapeHtml(option) + "</option>";
    }).join("") + "</select>";
  }

  function derivedTitle(item) {
    if (item.description) return item.description;
    var parts = [];
    if (item.nicuInfusion === "Yes") parts.push("NICU");
    if (item.additiveOrderableSynonym) parts.push(item.additiveOrderableSynonym);
    if (item.additiveDose) parts.push(item.additiveDose);
    if (item.normalisedRate) parts.push("[" + item.normalisedRate + "]");
    if (item.readyDiluted === "Yes") parts.push(parts.length ? "+ Ready-Diluted" : "Ready-Diluted");
    else if (item.diluentOrderableSynonym) parts.push("+ " + item.diluentOrderableSynonym);
    if (item.bagVolume) parts.push(item.bagVolume);
    return parts.join(" ");
  }

  function detailsPanel(item, editable) {
    return [
      "<div class=\"iv-system-panel\" data-preview-panel=\"details\">",
      "<div class=\"iv-system-form\"><div>",
      "<label>NICU infusion" + select(item, "nicuInfusion", "NICU infusion", ["Yes", "No"], editable) + "</label>",
      "<label>Ready-diluted" + select(item, "readyDiluted", "Ready-diluted", ["Yes", "No"], editable) + "</label>",
      "<label><b>*Drug Form:</b>" + select(item, "drugForm", "Drug form", ["infusion", "injection"], editable) + "</label>",
      "<label>Duration" + input(item, "duration", "Duration", editable) + "</label>",
      "<label>Duration Unit" + input(item, "durationUnit", "Duration unit", editable) + "</label>",
      "<label>Stop Date / Time" + input(item, "stopDateTime", "Stop date and time", editable) + "</label>",
      "<label>Replace Every" + input(item, "replaceEvery", "Replace every", editable) + "</label>",
      "<label>Replace Every Unit" + input(item, "replaceEveryUnit", "Replace every unit", editable) + "</label>",
      "</div><div>",
      "<label><b>*Route:</b>" + select(item, "routeOfAdministration", "Route", ["intraVENOUS", "subCUTANEOUS", "intraARTERIAL"], editable) + "</label>",
      "<label class=\"iv-tall-label\">Special Instructions" + (editable ? "<textarea class=\"iv-inline-textarea\" data-preview-field=\"specialInstructions\" aria-label=\"Special instructions\" title=\"" + escapeHtml(guidance("specialInstructions", "Special instructions")) + "\" placeholder=\"Not specified\">" + escapeHtml(item.specialInstructions || "") + "</textarea>" : text(item.specialInstructions)) + "</label>",
      "<label><b>*Start Date / Time:</b>" + input(item, "startDateTime", "Start date and time", editable) + "</label>",
      "</div></div></div>"
    ].join("");
  }

  function continuousPanel(item, editable) {
    var baseName = item.readyDiluted === "Yes" ? "Ready-Diluted" : item.diluentOrderableSynonym;
    return [
      "<div class=\"iv-system-panel\" data-preview-panel=\"continuous\">",
      "<div class=\"iv-continuous-scroll\"><table class=\"iv-continuous-table\"><thead><tr><th></th><th>Base Solution</th><th>Bag Volume</th><th>Rate</th><th>Infuse Over</th></tr></thead><tbody>",
      "<tr><td class=\"iv-row-marker\">Base</td><td>" + (item.readyDiluted === "Yes" ? "<strong>Ready-Diluted</strong>" : input(item, "diluentOrderableSynonym", "Base solution", editable)) + "</td><td>" + input(item, "bagVolume", "Bag volume", editable) + "</td><td>" + input(item, "rate", "Rate", editable) + "</td><td>" + input(item, "infuseOver", "Infuse over", editable) + "</td></tr>",
      "<tr><td class=\"iv-row-marker\">Additive</td><td>" + input(item, "additiveOrderableSynonym", "Additive", editable) + "</td><td>" + input(item, "additiveDose", "Additive dose", editable) + "</td><td>" + input(item, "normalisedRate", "Normalised rate", editable) + "</td><td>" + input(item, "delivers", "Delivers", editable) + "</td></tr>",
      "<tr><td></td><td colspan=\"2\"><b>Total Bag Volume</b></td><td colspan=\"2\" data-derived-total-volume>" + text(item.bagVolume) + "</td></tr>",
      "</tbody></table></div>",
      "<div class=\"iv-result-strip\"><label>Weight " + input(item, "weight", "Weight", editable) + "</label><label>Weight Unit " + select(item, "weightUnit", "Weight unit", ["kg", "g"], editable) + "</label><label>Weight Type " + input(item, "weightType", "Weight type", editable) + "</label><label>Result dt/tm " + input(item, "resultDateTime", "Result date and time", editable) + "</label></div>",
      "<label class=\"iv-instruction-label\">Infusion instructions" + (editable ? "<textarea class=\"iv-inline-textarea iv-instructions\" data-preview-field=\"orderCommentsInfusionInstructions\" aria-label=\"Infusion instructions\" title=\"" + escapeHtml(guidance("orderCommentsInfusionInstructions", "Infusion instructions")) + "\" placeholder=\"Describe the proposed infusion instructions\">" + escapeHtml(item.orderCommentsInfusionInstructions || "") + "</textarea>" : text(item.orderCommentsInfusionInstructions)) + "</label>",
      "<p class=\"iv-derived-note\">Base shown as: <strong data-derived-base>" + text(baseName) + "</strong></p></div>"
    ].join("");
  }

  function render(item, options) {
    item = item || {};
    options = options || {};
    var editable = !!options.editable;
    var active = options.activeTab === "continuous" ? "continuous" : "details";
    var title = derivedTitle(item);
    return [
      "<section class=\"iv-draft-preview iv-system-preview\" aria-label=\"Draft IV Set visualisation\" data-active-tab=\"" + active + "\">",
      "<div class=\"iv-preview-warning\">Draft request visualisation—not an approved build or clinical-system screen</div>",
      "<div class=\"iv-system-title\">Details for <span data-derived-title>" + text(title) + "</span></div>",
      "<div class=\"iv-system-tabs\" role=\"tablist\"><button type=\"button\" role=\"tab\" data-preview-tab=\"details\" aria-selected=\"" + (active === "details") + "\">Details</button><button type=\"button\" role=\"tab\" data-preview-tab=\"continuous\" aria-selected=\"" + (active === "continuous") + "\">Continuous Details</button></div>",
      detailsPanel(item, editable), continuousPanel(item, editable),
      "<details class=\"iv-base-help\"><summary>What does Diluent (= Base Solution) mean?</summary><p>The base solution is the fluid or supplied product carrying the medication. If the IV Set comprises the supplied product only, select <b>Ready-diluted: Yes</b>. If a separate medication is added to a diluent, select <b>No</b> and enter both the base solution and additive.</p></details>",
      "</section>"
    ].join("");
  }

  root.MnCmsIvPreview = { render: render, derivedTitle: derivedTitle };
})(typeof window !== "undefined" ? window : globalThis);
