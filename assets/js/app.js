(function () {
  "use strict";

  var state = {
    typeId: "",
    items: []
  };

  var metadataIds = ["requestTitle", "requestingSite", "requesterName", "requesterContact", "targetDate", "overallReason"];
  var elements = {};

  function byId(id) {
    return document.getElementById(id);
  }

  function initElements() {
    ["typeGrid", "typeChoice", "stickyType", "currentTypeText", "requestForm", "requestTypeHeading", "typeExplanation", "typeGuidance", "itemsContainer", "itemTemplate", "outputPreview", "exportStatus", "draftStatus"].forEach(function (id) {
      elements[id] = byId(id);
    });
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
  }

  function buildRequestData() {
    var type = window.MnCmsSchemas.typeById(state.typeId) || { label: "" };
    var data = metadataFromForm();
    data.typeId = state.typeId;
    data.typeLabel = type.label;
    data.items = state.items;
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
      item[field.key] = field.type === "select" ? field.options[0] : "";
      if (field.key === "action") {
        item[field.key] = "Modify";
      }
    });
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
          control.type = "text";
        }
        control.value = item[field.key] || "";
        control.placeholder = field.placeholder || "";
        control.addEventListener("input", function () {
          item[field.key] = control.value;
          refreshPreview();
        });
        control.addEventListener("change", function () {
          item[field.key] = control.value;
          refreshPreview();
        });
        label.innerHTML = "<span>" + field.label + "</span>";
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
    byId("changeTypeButton").addEventListener("click", function () {
      elements.typeChoice.classList.remove("hidden");
      elements.typeChoice.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    byId("addItemButton").addEventListener("click", function () { addItem(); });
    metadataIds.forEach(function (id) {
      byId(id).addEventListener("input", refreshPreview);
    });
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
    render();
    setStatus(elements.draftStatus, "Draft loaded.");
  }

  function init() {
    initElements();
    renderTypeChoices();
    bindActions();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
