(function () {
  "use strict";

  function valueOrBlank(value) {
    return value == null ? "" : String(value);
  }

  function escapeMarkdown(value) {
    return valueOrBlank(value).replace(/\r\n/g, "\n");
  }

  function escapeHtml(value) {
    return valueOrBlank(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function escapeDelimited(value) {
    return '"' + valueOrBlank(value).replace(/"/g, '""').replace(/\r?\n/g, " ") + '"';
  }

  function escapeRtf(value) {
    return valueOrBlank(value)
      .replace(/\\/g, "\\\\")
      .replace(/{/g, "\\{")
      .replace(/}/g, "\\}")
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .replace(/\n/g, "\\line ");
  }

  function slug(value) {
    var base = valueOrBlank(value).trim() || "mn-cms-change-request";
    return base.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 70) || "mn-cms-change-request";
  }

  function today() {
    return new Date().toISOString().slice(0, 10);
  }

  function fileBase(data) {
    return window.MnCmsCore ? window.MnCmsCore.fileBase(data) : today() + "-" + slug(data.requestTitle);
  }

  function metadataLines(data) {
    return [
      ["Discussion status", "For discussion — not approved"],
      ["Suggested filename", fileBase(data)],
      ["Short subject", data.shortSubject],
      ["Request title", data.requestTitle],
      ["CR type", data.typeLabel],
      ["Requesting site/team", data.requestingSite],
      ["Site code", data.siteCode],
      ["Requester", data.requesterName],
      ["Requester contact", data.requesterContact],
      ["Urgency", data.urgency],
      ["Overall clinical reason", data.overallReason]
    ];
  }

  function itemLines(item, index, fields) {
    var lines = ["### Item " + (index + 1), "", "**Requested outcome:** " + valueOrBlank(item.requestSummary)];
    fields.forEach(function (field) {
      if (!field.key) {
        return;
      }
      var value = valueOrBlank(item[field.key]).trim();
      if (value) {
        lines.push("- **" + field.label + ":** " + escapeMarkdown(value));
      }
    });
    return lines;
  }

  function markdown(data, fields) {
    var lines = ["# " + (data.requestTitle || "MN-CMS Change Request"), ""];
    metadataLines(data).forEach(function (pair) {
      lines.push("- **" + pair[0] + ":** " + escapeMarkdown(pair[1]));
    });
    lines.push("", "## Requested Items", "");
    data.items.forEach(function (item, index) {
      lines = lines.concat(itemLines(item, index, fields), "");
    });
    lines.push("## Governance / Responsibility", "", data.responsibilityStatement);
    return lines.join("\n");
  }

  function oneNote(data, fields) {
    var lines = [
      "MN-CMS Change Request: " + (data.requestTitle || "Untitled request"),
      "Type: " + data.typeLabel,
      "Site/team: " + valueOrBlank(data.requestingSite),
      "Requester: " + valueOrBlank(data.requesterName),
      "",
      "Reason:",
      valueOrBlank(data.overallReason),
      "",
      "Items:"
    ];
    data.items.forEach(function (item, index) {
      var name = item.orderableSynonym || item.description || item.genericName || item.carePlanName || item.anaesthesiaIdentifier || "Item";
      lines.push((index + 1) + ". " + valueOrBlank(item.action || "Action") + " - " + name);
      fields.forEach(function (field) {
        if (!field.key) {
          return;
        }
        if (["request", "reasonForRequest", "referenceChecked", "facilities", "currentValue", "requestedValue", "validationNotes"].indexOf(field.key) >= 0 && item[field.key]) {
          lines.push("   " + field.label + ": " + valueOrBlank(item[field.key]).replace(/\r?\n/g, " "));
        }
      });
    });
    lines.push("", data.responsibilityStatement);
    return lines.join("\n");
  }

  function txt(data, fields) {
    return markdown(data, fields).replace(/\*\*/g, "").replace(/^#/gm, "");
  }

  function json(data) {
    return JSON.stringify(data, null, 2);
  }

  function tableRows(data, fields) {
    return data.items.map(function (item, index) {
      var row = {
        requestTitle: data.requestTitle,
        crType: data.typeLabel,
        itemNumber: index + 1,
        requestingSite: data.requestingSite,
        requesterName: data.requesterName,
        requesterContact: data.requesterContact,
        targetDate: data.targetDate
      };
      fields.forEach(function (field) {
        if (!field.key) {
          return;
        }
        row[field.key] = valueOrBlank(item[field.key]);
      });
      return row;
    });
  }

  function delimited(data, fields, separator) {
    var rows = tableRows(data, fields);
    var headers = rows.length ? Object.keys(rows[0]) : [];
    return [headers.join(separator)].concat(rows.map(function (row) {
      return headers.map(function (header) { return escapeDelimited(row[header]); }).join(separator);
    })).join("\r\n");
  }

  function hasValue(value) {
    return valueOrBlank(value).trim() !== "";
  }

  function joinNonEmpty(parts, separator) {
    return parts.filter(hasValue).join(separator || " ");
  }

  function htmlValue(value) {
    var text = valueOrBlank(value).trim();
    return text ? escapeHtml(text).replace(/\n/g, "<br>") : "<span class=\"empty\">Not provided</span>";
  }

  function htmlDefinition(label, value) {
    return "<div class=\"def\"><dt>" + escapeHtml(label) + "</dt><dd>" + htmlValue(value) + "</dd></div>";
  }

  function ehrLine(label, value) {
    return "<div class=\"ehr-line\"><span>" + escapeHtml(label) + "</span><strong>" + htmlValue(value) + "</strong></div>";
  }

  function ivSetBuiltPreview(item) {
    var description = item.description || joinNonEmpty([
      item.additiveOrderableSynonym,
      item.additiveDose ? "[ " + item.additiveDose + " ]" : "",
      item.diluentOrderableSynonym,
      item.bagVolume
    ], " ");
    return [
      "<section class=\"ehr-preview\">",
      "<div class=\"ehr-title\"><span>Built output preview</span><strong>IV Set display, matched to Excel layout</strong></div>",
      "<table class=\"iv-built\"><tbody>",
      "<tr><th class=\"blue\" colspan=\"3\">Request: (Add / Remove)</th><td class=\"built-name\" colspan=\"7\">" + htmlValue(description) + "</td></tr>",
      "<tr><th class=\"blue left\" rowspan=\"2\" colspan=\"3\">Description<br><small>(as it appears in order search / Care Plan)</small></th><th class=\"blue\">Route</th><td>" + htmlValue(item.routeOfAdministration) + "</td><th class=\"blue\">Drug Form</th><td>" + htmlValue(item.drugForm) + "</td><th class=\"blue\" colspan=\"3\">Special Instructions</th></tr>",
      "<tr><th class=\"blue\">Duration</th><td>" + htmlValue(item.duration) + "</td><th class=\"blue\">Replace Every</th><td>" + htmlValue(item.replaceEvery) + "</td><td colspan=\"3\">" + htmlValue(item.specialInstructions) + "</td></tr>",
      "<tr><th class=\"blue left\" colspan=\"3\">Reason for Request</th><td colspan=\"7\">" + htmlValue(item.reasonForRequest) + "</td></tr>",
      "<tr><th class=\"blue left\" colspan=\"3\">Reference</th><td colspan=\"7\">" + htmlValue(item.referenceChecked) + "</td></tr>",
      "<tr><th class=\"blue left\" colspan=\"3\">Order Type</th><td colspan=\"7\">" + htmlValue(item.orderType || "Continuous (Do Not Change)") + "</td></tr>",
      "<tr><th class=\"blue left\" colspan=\"3\">High Alert Status</th><td colspan=\"2\">" + htmlValue(item.highAlertStatus) + "</td><th class=\"blue\" colspan=\"2\">Total Bag Volume</th><td colspan=\"3\">" + htmlValue(item.bagVolume) + "</td></tr>",
      "<tr><th class=\"blue left\" colspan=\"3\">Titratable Infusion</th><td colspan=\"2\">" + htmlValue(item.titratableInfusion) + "</td><th class=\"blue\" colspan=\"2\">Infusion Instructions</th><td colspan=\"3\">" + htmlValue(item.orderCommentsInfusionInstructions) + "</td></tr>",
      "<tr><th class=\"blue left\" colspan=\"3\">Facilities: (All / Local)</th><td colspan=\"7\">" + htmlValue(item.facilities) + "</td></tr>",
      "<tr><th class=\"blue left\" colspan=\"3\">IV set to be included in a Care Plan</th><td colspan=\"2\">" + htmlValue(item.includeInCarePlan) + "</td><th class=\"blue\" colspan=\"2\">(If yes) Care Plan Name</th><td colspan=\"3\">" + htmlValue(item.carePlanName) + "</td></tr>",
      "</tbody></table>",
      "<table class=\"iv-template\"><thead><tr><th class=\"section\" colspan=\"10\">Diluent (=Base Solution)</th></tr><tr><th>Orderable Synonym</th><th>Bag Volume +/- Volume Unit<br><small>(i.e. Total volume of bag/syringe)</small></th><th>Route of Administration</th><th>Drug Form</th><th>Rate<br>+/- Rate Unit</th><th>Infuse Over<br>+/- Units</th><th>Order Comments / Infusion Instructions</th><th>Duration</th><th>Replace Every +/- units</th><th>Special Instructions (max 255 characters)</th></tr></thead><tbody><tr><td>" + htmlValue(item.diluentOrderableSynonym) + "</td><td>" + htmlValue(item.bagVolume) + "</td><td>" + htmlValue(item.routeOfAdministration) + "</td><td>" + htmlValue(item.drugForm) + "</td><td>" + htmlValue(item.rate) + "</td><td>" + htmlValue(item.infuseOver) + "</td><td>" + htmlValue(item.orderCommentsInfusionInstructions) + "</td><td>" + htmlValue(item.duration) + "</td><td>" + htmlValue(item.replaceEvery) + "</td><td>" + htmlValue(item.specialInstructions) + "</td></tr></tbody></table>",
      "<table class=\"iv-template\"><thead><tr><th class=\"section\" colspan=\"3\">Additive (=Medication to be infused)</th></tr><tr><th>Orderable Synonym</th><th>Additive Dose +/- Dose Unit</th><th>Normalised Rate +/- Unit</th></tr></thead><tbody><tr><td>" + htmlValue(item.additiveOrderableSynonym) + "</td><td>" + htmlValue(item.additiveDose) + "</td><td>" + htmlValue(item.normalisedRate) + "</td></tr></tbody></table>",
      "</section>"
    ].join("");
  }

  function snAnaesthesiaBuiltPreview(item) {
    var concentration = joinNonEmpty([item.strength, item.volume ? "/ " + item.volume : ""], " ");
    return [
      "<section class=\"ehr-preview\">",
      "<div class=\"ehr-title\"><span>Built output preview</span><strong>SN Anaesthesia Product</strong></div>",
      "<div class=\"ehr-order-name\">" + htmlValue(item.anaesthesiaIdentifier || item.orderableSynonym) + "</div>",
      "<div class=\"ehr-grid\">",
      ehrLine("Category", item.category),
      ehrLine("Legal status", item.legalStatus),
      ehrLine("Route", item.route),
      ehrLine("Form", item.form),
      ehrLine("Concentration: Product", concentration),
      ehrLine("Concentration: Final", item.concentration),
      "</div>",
      "<div class=\"ehr-subtitle\">Bolus</div>",
      "<div class=\"ehr-grid\">",
      ehrLine("Display option", item.bolusDisplayOption),
      ehrLine("Cursor starts in", item.bolusDefaultCursorLocation),
      ehrLine("Dose amount units", item.doseAmountUnits),
      ehrLine("Weight based dose units", item.bolusWeightBasedDoseUnits),
      "</div>",
      "<div class=\"ehr-subtitle\">Infusion</div>",
      "<div class=\"ehr-grid\">",
      ehrLine("Display option", item.infusionDisplayOption),
      ehrLine("Cursor starts in", item.infusionDefaultCursorLocation),
      ehrLine("Dosing infusion rate", item.dosingInfusionRateUnits),
      ehrLine("Weight based dose", item.infusionWeightBasedDoseUnits),
      ehrLine("Pump infusion rate", item.pumpInfusionRateUnits),
      ehrLine("Amount infused", item.amountInfusedUnits),
      "</div>",
      "<div class=\"ehr-note\"><b>Perioperative notes</b><br>" + htmlValue(item.perioperativeNotes) + "</div>",
      "</section>"
    ].join("");
  }

  function builtPreview(data, item) {
    if (data.typeId === "ivSet") {
      return ivSetBuiltPreview(item);
    }
    if (data.typeId === "snAnaesthesia") {
      return snAnaesthesiaBuiltPreview(item);
    }
    return "";
  }

  function itemHtml(data, fields, item, index) {
    var sections = [];
    var current = { title: "Request fields", rows: [] };
    fields.forEach(function (field) {
      if (field.type === "heading") {
        if (current.rows.length) {
          sections.push(current);
        }
        current = { title: field.label, rows: [] };
        return;
      }
      if (!field.key) {
        return;
      }
      var value = valueOrBlank(item[field.key]).trim();
      if (value) {
        current.rows.push(htmlDefinition(field.label, value));
      }
    });
    if (current.rows.length) {
      sections.push(current);
    }
    return "<article class=\"item\"><header><p>Item " + (index + 1) + "</p><h2>" + escapeHtml(item.requestSummary || item.request || item.action || "Requested change") + "</h2></header>" + builtPreview(data, item) + sections.map(function (section) {
      return "<section class=\"detail-section\"><h3>" + escapeHtml(section.title) + "</h3><dl>" + section.rows.join("") + "</dl></section>";
    }).join("") + "</article>";
  }

  function html(data, fields) {
    var itemHtmls = data.items.map(function (item, index) {
      return itemHtml(data, fields, item, index);
    }).join("");
    var style = "body{margin:0;background:#eef2f4;color:#17212b;font-family:Segoe UI,Arial,sans-serif;line-height:1.5}main{max-width:1120px;margin:0 auto;padding:32px 20px 56px}.hero{background:#123d5a;color:white;padding:30px;border-radius:10px;margin-bottom:20px}.hero h1{margin:0 0 8px;font-size:30px;line-height:1.15}.hero p{margin:0;color:#d7e7ef}.meta{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:10px;margin-top:18px}.meta div,.panel,.item{background:white;border:1px solid #d8e0e5;border-radius:8px;box-shadow:0 8px 22px rgba(23,33,43,.08)}.meta div{padding:12px;color:#17212b}.meta span,.ehr-title span,.item header p{display:block;color:#5c6b76;font-size:12px;font-weight:700;text-transform:uppercase}.meta strong{display:block;margin-top:3px}.panel{padding:18px;margin:16px 0}.panel h2,.detail-section h3{margin:0 0 10px;color:#123d5a}.item{margin:18px 0;overflow:hidden}.item header{padding:16px 18px;background:#f8fafb;border-bottom:1px solid #d8e0e5}.item header h2{margin:0;color:#123d5a}.ehr-preview{margin:16px;border:1px solid #9fb4c4;border-radius:8px;background:#fff;overflow:auto}.ehr-title{display:flex;justify-content:space-between;gap:12px;padding:10px 12px;background:#1f4e79;color:white}.ehr-title span{color:#dcecf8}.ehr-order-name{padding:14px 12px;font-size:18px;font-weight:800;color:#123d5a}.ehr-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:1px;background:#d4e0e8;border-top:1px solid #d4e0e8}.ehr-line{background:white;padding:10px}.ehr-line span{display:block;color:#60717d;font-size:12px}.ehr-line strong{display:block;color:#17212b}.ehr-subtitle{padding:9px 12px;background:#24527c;color:white;font-weight:800}.ehr-table,.iv-built,.iv-template{width:100%;border-collapse:collapse;background:white}.ehr-table th,.iv-built th.blue,.iv-template th{background:#2f6da8;color:white;text-align:left;padding:8px;font-size:13px}.iv-built th.left{width:26%}.iv-built td,.iv-template td,.ehr-table td{border:1px solid #9aa9b5;padding:8px;vertical-align:top;min-height:30px}.iv-built .built-name{font-weight:800;color:#123d5a}.iv-template{margin-top:14px}.iv-template th.section{background:#1f4e79;font-size:15px}.iv-template small,.iv-built small{font-weight:500;color:#e9f2f8}.ehr-note{margin:10px 12px 12px;padding:10px;background:white;border:1px solid #cbd8e1;border-radius:6px}.detail-section{padding:0 18px 16px}.detail-section dl{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:10px;margin:0}.def{padding:10px;border:1px solid #d8e0e5;border-radius:6px;background:#fbfcfd}.def dt{font-weight:800;color:#304555}.def dd{margin:4px 0 0}.empty{color:#8a98a3;font-style:italic}.governance{border-left:5px solid #176b5f}@media print{body{background:white}main{padding:0}.hero,.item,.panel{box-shadow:none}.ehr-preview{overflow:visible}}";
    return "<!doctype html><html><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"><title>" + escapeHtml(data.requestTitle || "MN-CMS Change Request") + "</title><link rel=\"icon\" href=\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='8' fill='%23176b5f'/%3E%3Cpath d='M18 33h28M32 19v28' stroke='white' stroke-width='7' stroke-linecap='round'/%3E%3C/svg%3E\"><style>" + style + "</style></head><body><main><section class=\"hero\"><h1>" + escapeHtml(data.requestTitle || "MN-CMS Change Request") + "</h1><p>" + escapeHtml(data.typeLabel) + " request review document</p><div class=\"meta\">" + metadataLines(data).map(function (pair) { return "<div><span>" + escapeHtml(pair[0]) + "</span><strong>" + htmlValue(pair[1]) + "</strong></div>"; }).join("") + "</div></section><section class=\"panel\"><h2>Clinical reason</h2><p>" + htmlValue(data.overallReason) + "</p></section>" + itemHtmls + "<section class=\"panel governance\"><h2>Governance / Responsibility</h2><p>" + escapeHtml(data.responsibilityStatement) + "</p></section></main></body></html>";
  }

  function rtf(data, fields) {
    var parts = ["{\\rtf1\\ansi\\deff0", "{\\fonttbl{\\f0 Arial;}}", "\\fs24 "];
    parts.push("\\b " + escapeRtf(data.requestTitle || "MN-CMS Change Request") + "\\b0\\line\\line ");
    metadataLines(data).forEach(function (pair) {
      parts.push("\\b " + escapeRtf(pair[0]) + ":\\b0 " + escapeRtf(pair[1]) + "\\line ");
    });
    parts.push("\\line \\b Requested Items\\b0\\line ");
    data.items.forEach(function (item, index) {
      parts.push("\\line \\b Item " + (index + 1) + "\\b0\\line ");
      fields.forEach(function (field) {
        if (!field.key) {
          return;
        }
        var value = valueOrBlank(item[field.key]).trim();
        if (value) {
          parts.push("\\b " + escapeRtf(field.label) + ":\\b0 " + escapeRtf(value) + "\\line ");
        }
      });
    });
    parts.push("\\line \\b Governance / Responsibility\\b0\\line " + escapeRtf(data.responsibilityStatement) + "}");
    return parts.join("");
  }

  window.MnCmsExporters = {
    markdown: markdown,
    oneNote: oneNote,
    txt: txt,
    json: json,
    tsv: function (data, fields) { return delimited(data, fields, "\t"); },
    csv: function (data, fields) { return delimited(data, fields, ","); },
    html: html,
    rtf: rtf,
    fileBase: fileBase
  };
})();
