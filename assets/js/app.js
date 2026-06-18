(function () {
  "use strict";

  var state = {
    typeId: "",
    items: [],
    mode: "guided"
  };

  var metadataIds = ["shortSubject", "requestTitle", "requestingSite", "siteCode", "requesterName", "requesterContact", "urgency", "overallReason"];
  var elements = {};
  var metadataGuidance = {
    shortSubject: "Enter only the medicine, order or feature name. This becomes the first part of the filename; do not add CR, site or date.",
    requestTitle: "Summarise the requested change in one sentence so reviewers can identify its purpose.",
    siteCode: "Choose the hospital responsible for requesting and validating this change, or National / All Sites for a shared request.",
    requesterName: "Enter the person whom reviewers can contact to clarify this request.",
    requesterContact: "Enter a work email address or telephone extension. Do not enter patient contact details.",
    urgency: "Choose the planning priority. This does not bypass clinical or technical review.",
    overallReason: "Explain the current problem, risk or workflow need in plain language.",
    privacyConfirmed: "Confirm that the request contains no patient-identifiable information.",
    requestSummary: "Describe the result you need in ordinary language. It is acceptable to say that the technical solution needs discussion."
  };

  function byId(id) {
    return document.getElementById(id);
  }

  function initElements() {
    ["typeGrid", "typeChoice", "stickyType", "currentTypeText", "requestForm", "requestTypeHeading", "typeExplanation", "typeGuidance", "itemsContainer", "itemTemplate", "outputPreview", "exportStatus", "draftStatus", "readinessPanel", "filenamePreview"].forEach(function (id) {
      elements[id] = byId(id);
    });
  }

  function addFieldHelp(label, text, id) {
    if (!label || !text || label.querySelector(".field-help")) return;
    var labelText = label.querySelector(":scope > span");
    if (!labelText) return;
    var help = document.createElement("button");
    var tooltipId = "field-help-" + id;
    help.type = "button";
    help.className = "field-help";
    help.setAttribute("aria-label", "Help for " + labelText.textContent.replace(/Required/g, "").trim());
    help.setAttribute("aria-describedby", tooltipId);
    help.setAttribute("aria-expanded", "false");
    help.textContent = "i";
    var tooltip = document.createElement("span");
    tooltip.id = tooltipId;
    tooltip.className = "field-tooltip";
    tooltip.setAttribute("role", "tooltip");
    tooltip.textContent = text;
    help.appendChild(tooltip);
    help.addEventListener("click", function () {
      help.setAttribute("aria-expanded", help.getAttribute("aria-expanded") === "true" ? "false" : "true");
    });
    labelText.appendChild(help);
  }

  function initFieldGuidance() {
    Object.keys(metadataGuidance).forEach(function (id) {
      if (id === "requestSummary") return;
      var control = byId(id);
      var label = control && (control.matches && control.matches("label") ? control : control.closest("label"));
      addFieldHelp(label, metadataGuidance[id], id);
    });
  }

  function initSites() {
    var select = byId("siteCode");
    window.MnCmsCore.sites.forEach(function (site) {
      var option = document.createElement("option");
      option.value = site.code;
      option.textContent = site.code + " — " + site.name;
      select.appendChild(option);
    });
  }

  function normaliseSite() {
    var selected = window.MnCmsCore.siteForCode(byId("siteCode").value);
    byId("siteCode").value = selected ? selected.code : "";
    byId("requestingSite").value = selected ? selected.name : "";
    byId("requestingSiteName").textContent = selected ? selected.name : "No site selected";
  }

  function getFields() {
    return window.MnCmsSchemas.fieldsForType(state.typeId);
  }

  function hasItemData() {
    return state.items.some(function (item) {
      return Object.keys(item).some(function (key) { return String(item[key] || "").trim(); });
    });
  }

  function renderTypeChoices() {
    elements.typeGrid.innerHTML = "";
    window.MnCmsSchemas.requestTypes.forEach(function (type) {
      var button = document.createElement("button");
      button.type = "button";
      button.className = "type-card";
      button.dataset.typeId = type.id;
      button.innerHTML = "<strong>" + type.label + "</strong><span>" + type.description + "</span>";
      button.addEventListener("click", function () { selectType(type.id); });
      elements.typeGrid.appendChild(button);
    });
  }

  function selectType(typeId) {
    if (state.typeId && state.typeId !== typeId && hasItemData()) {
      var confirmed = window.confirm("Changing request type will reset the design items already entered. Continue?");
      if (!confirmed) {
        return;
      }
      state.items = [];
    }
    state.typeId = typeId;
    if (!state.items.length) {
      addItem(false);
    }
    render();
  }

  function metadataFromForm() {
    var data = {};
    metadataIds.forEach(function (id) {
      data[id] = byId(id).value;
    });
    return data;
  }

  function applyMetadata(data) {
    metadataIds.forEach(function (id) {
      byId(id).value = data && data[id] ? data[id] : "";
    });
    normaliseSite();
  }

  function buildRequestData() {
    var type = window.MnCmsSchemas.typeById(state.typeId) || { label: "" };
    var data = metadataFromForm();
    data.typeId = state.typeId;
    data.typeLabel = type.label;
    data.items = state.items;
    data.privacyConfirmed = byId("privacyConfirmed").checked;
    data.requestDate = new Date().toISOString().slice(0, 10);
    data.generatedAt = new Date().toISOString();
    data.responsibilityStatement = window.MnCmsSchemas.responsibilityStatement;
    return data;
  }

  function addItem(shouldRender) {
    var item = {};
    getFields().forEach(function (field) {
      if (!field.key) {
        return;
      }
      item[field.key] = "";
    });
    item.requestSummary = "";
    state.items.push(item);
    if (shouldRender !== false) {
      renderItems();
      refreshPreview();
    }
  }

  function duplicateItem(index) {
    state.items.splice(index + 1, 0, JSON.parse(JSON.stringify(state.items[index])));
    renderItems();
    refreshPreview();
  }

  function removeItem(index) {
    if (state.items.length === 1) {
      state.items = [];
      addItem(false);
    } else {
      state.items.splice(index, 1);
    }
    renderItems();
    refreshPreview();
  }

  function render() {
    var type = window.MnCmsSchemas.typeById(state.typeId);
    elements.typeChoice.classList.toggle("hidden", !!type);
    elements.stickyType.classList.toggle("hidden", !type);
    elements.requestForm.classList.toggle("hidden", !type);
    if (type) {
      elements.currentTypeText.textContent = "Current request type: " + type.label;
      elements.requestTypeHeading.textContent = type.label + " request";
      elements.typeExplanation.textContent = type.description;
      renderGuidance(type);
      renderItems();
      refreshPreview();
    }
  }

  function renderGuidance(type) {
    var items = (type.guidance || []).map(function (text) {
      return "<li>" + text + "</li>";
    }).join("");
    elements.typeGuidance.innerHTML = "<h3>What we need from you</h3><ul>" + items + "</ul>";
  }

  function renderItems() {
    elements.itemsContainer.innerHTML = "";
    var fields = getFields();
    state.items.forEach(function (item, index) {
      var node = elements.itemTemplate.content.firstElementChild.cloneNode(true);
      node.querySelector("h3").textContent = "Item " + (index + 1);
      node.querySelector(".duplicate-item").addEventListener("click", function () { duplicateItem(index); });
      node.querySelector(".remove-item").addEventListener("click", function () { removeItem(index); });
      var fieldContainer = node.querySelector(".item-fields");
      var summary = node.querySelector(".request-summary");
      addFieldHelp(node.querySelector(".item-intent"), metadataGuidance.requestSummary, "item-" + index + "-request-summary");
      var technicalDetails = node.querySelector(".technical-details");
      var livePreview;
      var activePreviewTab = "details";
      function renderLivePreview() {
        if (livePreview) livePreview.innerHTML = window.MnCmsIvPreview.render(item, { editable: true, activeTab: activePreviewTab });
      }
      if (state.typeId === "ivSet") {
        livePreview = document.createElement("div");
        livePreview.className = "iv-live-preview";
        technicalDetails.parentNode.insertBefore(livePreview, technicalDetails);
        livePreview.addEventListener("click", function (event) {
          var tab = event.target.closest("[data-preview-tab]");
          if (!tab) return;
          activePreviewTab = tab.dataset.previewTab;
          renderLivePreview();
        });
        livePreview.addEventListener("input", function (event) {
          var field = event.target.dataset.previewField;
          if (!field) return;
          item[field] = event.target.value;
          var sourceControl = node.querySelector('[data-field-key="' + field + '"]');
          if (sourceControl) sourceControl.value = event.target.value;
          var titleValue = livePreview.querySelector("[data-derived-title]");
          if (titleValue) titleValue.textContent = window.MnCmsIvPreview.derivedTitle(item) || "Not specified";
          var totalValue = livePreview.querySelector("[data-derived-total-volume]");
          if (totalValue && field === "bagVolume") totalValue.textContent = item.bagVolume || "Not specified";
          refreshPreview();
        });
        livePreview.addEventListener("change", function (event) {
          if (!event.target.dataset.previewField) return;
          renderLivePreview();
        });
        renderLivePreview();
      }
      summary.value = item.requestSummary || "";
      summary.addEventListener("input", function () {
        item.requestSummary = summary.value;
        renderLivePreview();
        refreshPreview();
      });
      technicalDetails.open = state.mode === "expert";

      fields.forEach(function (field) {
        if (field.type === "heading") {
          var heading = document.createElement("div");
          heading.className = "field-heading";
          heading.textContent = field.label;
          fieldContainer.appendChild(heading);
          return;
        }
        var label = document.createElement("label");
        if (field.type === "textarea" || field.compare) {
          label.className = field.compare ? "compare-field" : "full";
        }
        var control;
        if (field.type === "select") {
          control = document.createElement("select");
          var unknown = document.createElement("option");
          unknown.value = "";
          unknown.textContent = "Not specified / discuss";
          control.appendChild(unknown);
          field.options.forEach(function (option) {
            var opt = document.createElement("option");
            opt.value = option;
            opt.textContent = option;
            control.appendChild(opt);
          });
        } else if (field.type === "textarea") {
          control = document.createElement("textarea");
          control.rows = 3;
        } else {
          control = document.createElement("input");
          control.type = field.inputType || "text";
        }
        control.dataset.fieldKey = field.key;
        control.value = item[field.key] || "";
        control.placeholder = field.placeholder || "";
        control.addEventListener("input", function () {
          item[field.key] = control.value;
          renderLivePreview();
          refreshPreview();
        });
        control.addEventListener("change", function () {
          item[field.key] = control.value;
          renderLivePreview();
          refreshPreview();
        });
        label.innerHTML = "<span>" + field.label + "</span>";
        addFieldHelp(label, field.helper || ("Enter the requested " + field.label.toLowerCase() + ". Leave it unspecified if it requires team discussion."), "item-" + index + "-" + field.key);
        label.appendChild(control);
        if (field.helper) {
          var small = document.createElement("small");
          small.textContent = field.helper;
          label.appendChild(small);
        }
        fieldContainer.appendChild(label);
      });

      elements.itemsContainer.appendChild(node);
    });
  }

  function refreshPreview() {
    if (!state.typeId) {
      return;
    }
    elements.outputPreview.value = window.MnCmsExporters.markdown(buildRequestData(), getFields());
    renderReadiness();
  }

  function renderReadiness() {
    var data = buildRequestData();
    var result = window.MnCmsCore.readiness(data, getFields());
    var ready = result.blocking === 0;
    elements.readinessPanel.className = "readiness " + (ready ? "ready" : "needs-work");
    elements.readinessPanel.innerHTML = ready
      ? "<strong>Ready for team discussion</strong><p>Essential information is present. Optional technical detail completed: " + result.optionalCompleted + " of " + result.optionalTotal + " fields.</p>"
      : "<strong>" + result.blocking + " essential item" + (result.blocking === 1 ? "" : "s") + " still needed</strong><ul>" + result.errors.map(function (error) { return "<li>" + error.message + "</li>"; }).join("") + "</ul>";
    elements.filenamePreview.textContent = data.shortSubject && data.siteCode ? window.MnCmsCore.fileBase(data) + ".html / .csv" : "Complete the short subject and site code above";
    ["downloadCsvButton", "downloadHtmlButton"].forEach(function (id) { byId(id).disabled = !ready; });
  }

  function setMode(mode) {
    state.mode = mode;
    var guided = mode === "guided";
    byId("guidedModeButton").classList.toggle("active", guided);
    byId("expertModeButton").classList.toggle("active", !guided);
    byId("guidedModeButton").setAttribute("aria-pressed", String(guided));
    byId("expertModeButton").setAttribute("aria-pressed", String(!guided));
    document.querySelectorAll(".technical-details").forEach(function (detail) { detail.open = !guided; });
  }

  function copyText(text, successMessage) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        setStatus(elements.exportStatus, successMessage);
      }).catch(function () {
        fallbackCopy(text, successMessage);
      });
    } else {
      fallbackCopy(text, successMessage);
    }
  }

  function fallbackCopy(text, successMessage) {
    elements.outputPreview.value = text;
    elements.outputPreview.focus();
    elements.outputPreview.select();
    document.execCommand("copy");
    setStatus(elements.exportStatus, successMessage);
  }

  function setStatus(element, message) {
    element.textContent = message;
    window.setTimeout(function () {
      if (element.textContent === message) {
        element.textContent = "";
      }
    }, 4500);
  }

  function downloadFile(content, extension, mime) {
    var data = buildRequestData();
    var validation = window.MnCmsCore.validate(data);
    if (validation.errors.length) {
      setStatus(elements.exportStatus, "Complete the essential discussion details before exporting.");
      elements.readinessPanel.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    var filename = window.MnCmsExporters.fileBase(data) + "." + extension;
    if (window.showSaveFilePicker) {
      saveWithPicker(content, filename, mime).catch(function () {
        downloadWithAnchor(content, filename, mime);
      });
    } else {
      downloadWithAnchor(content, filename, mime);
    }
    setStatus(elements.exportStatus, "Prepared " + filename);
  }

  function saveWithPicker(content, filename, mime) {
    return window.showSaveFilePicker({
      suggestedName: filename
    }).then(function (handle) {
      return handle.createWritable();
    }).then(function (writable) {
      return writable.write(new Blob([content], { type: mime })).then(function () {
        return writable.close();
      });
    });
  }

  function downloadWithAnchor(content, filename, mime) {
    var blob = new Blob([content], { type: mime });
    var url = URL.createObjectURL(blob);
    var link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  function bindActions() {
    byId("guidedModeButton").addEventListener("click", function () { setMode("guided"); });
    byId("expertModeButton").addEventListener("click", function () { setMode("expert"); });
    byId("changeTypeButton").addEventListener("click", function () {
      elements.typeChoice.classList.remove("hidden");
      elements.typeChoice.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    byId("addItemButton").addEventListener("click", function () { addItem(); });
    metadataIds.forEach(function (id) {
      if (id === "siteCode") return;
      byId(id).addEventListener("input", refreshPreview);
      byId(id).addEventListener("change", refreshPreview);
    });
    byId("siteCode").addEventListener("change", function () {
      normaliseSite();
      refreshPreview();
    });
    byId("privacyConfirmed").addEventListener("change", refreshPreview);
    byId("downloadCsvButton").addEventListener("click", function () {
      downloadFile(window.MnCmsExporters.csv(buildRequestData(), getFields()), "csv", "text/csv");
    });
    byId("downloadHtmlButton").addEventListener("click", function () {
      downloadFile(window.MnCmsExporters.html(buildRequestData(), getFields()), "html", "text/html");
    });
    byId("saveDraftButton").addEventListener("click", function () {
      window.MnCmsStorage.saveDraft(buildRequestData());
      setStatus(elements.draftStatus, "Draft saved in this browser.");
    });
    byId("loadDraftButton").addEventListener("click", function () {
      loadDraft();
    });
    byId("clearDraftButton").addEventListener("click", function () {
      window.MnCmsStorage.clearDraft();
      setStatus(elements.draftStatus, "Local draft cleared.");
    });
  }

  function loadDraft() {
    var draft;
    try {
      draft = window.MnCmsStorage.loadDraft();
    } catch (error) {
      setStatus(elements.draftStatus, "Could not load draft. It may be damaged.");
      return;
    }
    if (!draft) {
      setStatus(elements.draftStatus, "No local draft found in this browser.");
      return;
    }
    state.typeId = draft.typeId;
    state.items = draft.items && draft.items.length ? draft.items : [];
    if (!state.items.length) {
      addItem(false);
    }
    applyMetadata(draft);
    byId("privacyConfirmed").checked = !!draft.privacyConfirmed;
    render();
    setStatus(elements.draftStatus, "Draft loaded.");
  }

  function init() {
    initElements();
    initSites();
    initFieldGuidance();
    renderTypeChoices();
    bindActions();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
