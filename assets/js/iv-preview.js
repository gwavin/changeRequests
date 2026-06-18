(function (root) {
  "use strict";

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function value(value) {
    var text = String(value || "").trim();
    return text ? escapeHtml(text) : "<span class=\"iv-empty\">Not specified</span>";
  }

  function render(item) {
    item = item || {};
    var description = item.description || item.requestSummary || [item.additiveOrderableSynonym, item.additiveDose, item.diluentOrderableSynonym, item.bagVolume].filter(Boolean).join(" + ");
    return [
      "<section class=\"iv-draft-preview\" aria-label=\"Draft IV Set visualisation\">",
      "<div class=\"iv-preview-title\"><div><span>Draft visualisation—not approved build</span><strong>How this IV Set might appear</strong></div><small>Based on the supplied Excel template</small></div>",
      "<div class=\"iv-preview-scroll\">",
      "<table class=\"iv-summary-table\"><tbody>",
      "<tr><th>Description</th><td colspan=\"5\" class=\"iv-description\">" + value(description) + "</td></tr>",
      "<tr><th>Route</th><td>" + value(item.routeOfAdministration) + "</td><th>Drug form</th><td>" + value(item.drugForm) + "</td><th>Special instructions</th><td>" + value(item.specialInstructions) + "</td></tr>",
      "<tr><th>Duration</th><td>" + value(item.duration) + "</td><th>Replace every</th><td>" + value(item.replaceEvery) + "</td><th>Facilities</th><td>" + value(item.facilities) + "</td></tr>",
      "</tbody></table>",
      "<table class=\"iv-detail-table\"><thead><tr><th colspan=\"7\" class=\"iv-section-heading\">Diluent (= Base Solution)</th></tr><tr><th>Orderable synonym</th><th>Bag volume</th><th>Route</th><th>Form</th><th>Rate</th><th>Infuse over</th><th>Instructions</th></tr></thead><tbody><tr><td>" + value(item.diluentOrderableSynonym) + "</td><td>" + value(item.bagVolume) + "</td><td>" + value(item.routeOfAdministration) + "</td><td>" + value(item.drugForm) + "</td><td>" + value(item.rate) + "</td><td>" + value(item.infuseOver) + "</td><td>" + value(item.orderCommentsInfusionInstructions) + "</td></tr></tbody></table>",
      "<table class=\"iv-detail-table\"><thead><tr><th colspan=\"3\" class=\"iv-section-heading\">Additive (= Medication to be infused)</th></tr><tr><th>Orderable synonym</th><th>Additive dose</th><th>Normalised rate</th></tr></thead><tbody><tr><td>" + value(item.additiveOrderableSynonym) + "</td><td>" + value(item.additiveDose) + "</td><td>" + value(item.normalisedRate) + "</td></tr></tbody></table>",
      "</div></section>"
    ].join("");
  }

  root.MnCmsIvPreview = { render: render };
})(typeof window !== "undefined" ? window : globalThis);
