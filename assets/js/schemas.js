(function () {
  "use strict";

  var options = {
    action: ["Add", "Modify", "Remove"],
    modifyAction: ["Modify From", "Modify To"],
    yesNo: ["Yes", "No"],
    yesNoBlank: ["", "Y", "N", "Yes", "No"],
    facilities: ["all", "local"],
    orderSentenceType: ["administration", "prescription", "Both"],
    criteria: ["Between", "Greater than/equal to", "Less than"],
    ageUnit: ["day", "week", "month", "year"],
    pmaUnit: ["day", "week"],
    weightUnit: ["kg", "g"],
    solution: ["PowerChart", "SurgiNet", "saanaesthesia"],
    form: ["ampoule", "bag", "capsule", "capsule (enteric coated)", "capsule (modified release)", "cream", "device", "dressing", "drops", "emulsion", "enema", "film", "foam", "gas", "gel", "granules", "granules (modified release)", "gum", "implant", "infusion", "inhaler", "injection", "liquid", "lotion", "lozenge", "nebulser liquid", "oil", "ointment", "paste", "patch", "pessary", "powder", "ring", "sachet", "shampoo", "soap", "sponge", "spray", "stick", "suppository", "swab", "syringe", "syrup", "tablet", "tablet (chewable)", "tablet (effervescent)", "tablet (enteric coated)", "tablet (film coated)", "tablet (modified release)", "tablet (soluble)", "tampon", "tape", "test", "vial", "wafer"],
    route: ["body cavity", "both ears", "both eyes", "buccal", "caudal", "chewed", "each affected ear", "each affected eye", "each affected nostril", "endotracheal", "epidural", "fetal intramuscular", "fetal and umbilical vein access", "gargle", "gastrostomy", "inhalation", "intraAMNIOTIC", "intraARTERIAL", "intraARTICULAR", "intraBILIARY", "intraCARDIAC", "intraCERVICAL", "intraCRANIAL", "intraDERMAL", "intraLESIONAL", "intraLYMPHATIC", "intraLUMINAL", "intraMUSCULAR", "intraOCULAR", "intraPERITONEAL", "intraPLACENTAL", "intraPLEURAL", "intraSPINAL", "intraSYNOVIAL", "intraTHECAL", "intraTHORACIC", "intraTRACHEAL", "intraUTERINE", "intraVENOUS", "intraVENTRICULAR", "intraVESICAL", "intraVITREAL", "irrigation", "jejunostomy", "left ear", "left eye", "nasal", "nasoGASTRIC", "nasoJEJUNAL", "nebulised", "not applicable", "oral", "orogastric", "percutaneous", "perineal", "rectal", "retrobulbar", "right ear", "right eye", "soak", "subCUTANEOUS", "subDERMAL", "subLINGUAL", "topical", "transDERMAL", "transMUCOSAL", "transURETHRAL", "urethral", "vaginal"],
    frequency: ["alternate days", "as required", "EIGHT times a day", "every EIGHT hours", "every EIGHTEEN hours", "every FIFTEEN minutes", "every FIVE hours", "every FIVE minutes", "every FORTY EIGHT hours", "every FOUR hours", "every NINETY SIX hours", "every ONE hour", "every SEVENTY TWO hours", "every SIX hours", "every SIXTEEN hours", "every TEN minutes", "every THIRTY minutes", "every THIRTY SIX hours", "every THREE hours", "every TWELVE hours", "every TWENTY FOUR hours", "every TWENTY minutes", "every TWO hours", "FIVE times a day", "FOUR times a day", "on Friday", "on Monday", "on Saturday", "on Sunday", "on Thursday", "on Tuesday", "on Wednesday", "ONCE a day", "ONCE a day (afternoon)", "ONCE a day (breakfast)", "ONCE a day (evening meal)", "ONCE a day (evening)", "ONCE a day (lunch/dinner)", "ONCE a day (Mon, Wed, Fri)", "ONCE a day (morning)", "ONCE a day (night)", "ONCE a day (weekdays)", "ONCE a day (weekend)", "once a FORTNIGHT", "once a MONTH", "once a WEEK on the same day each week", "once a YEAR", "once every SIX MONTHS", "once every THREE MONTHS", "ONCE every WEEKDAY (Mon,Tue,Wed,Thu,Fri)", "once ONLY", "SIX times a day", "THREE times a day", "THREE times a day (insulin)", "TWICE a day"],
    units: ["ampoule", "application", "bag", "bead", "blister", "bottle", "box", "capsule", "carton", "cartridge", "cm", "day", "dose", "dressing", "drop", "Each", "g", "g/kg", "g/kg/hr", "g/m2", "gm/hr", "gum", "hour", "implant", "inhalation", "kit", "L", "L/min", "lozenge", "m", "mg", "mg/hour", "mg/kg", "mg/kg/day", "mg/kg/hour", "mg/kg/minute", "mg/m2", "mg/minute", "mg/mL", "microgram", "microgram/hour", "microgram/kg", "microgram/kg/day", "microgram/kg/hour", "microgram/kg/minute", "microgram/m2", "microgram/minute", "microgram/mL", "micromole", "million-units", "milliunit", "milliunit/hour", "milliunit/kg", "milliunit/kg/hour", "milliunit/kg/minute", "milliunit/minute", "minute", "mL", "mL/hour", "mL/kg", "mL/kg/day", "mL/kg/hour", "mL/kg/minute", "mL/minute", "mmol", "mmol/hour", "mmol/kg", "mmol/kg/hour", "mmol/kg/minute", "mmol/minute", "month", "nanogram", "nanogram/hour", "nanogram/kg", "nanogram/kg/hour", "nanogram/kg/minute", "nanogram/m2", "nanogram/minute", "nanogram/mL", "nanogram/mL/hour", "nebule", "pack", "patch", "portion", "puff", "sachet", "spray", "stick", "suppository", "syringe", "tablet", "unit", "unit/hour", "unit/kg", "unit/kg/hour", "unit/kg/minute", "unit/m2", "unit/minute", "unit/mL", "vial", "week", "year", "umol/L"],
    prnReason: ["OTHER: See Order Comments", "agitation", "allergy symptoms", "anaphylaxis", "anxiety", "arthritis", "chest pain", "cold symptoms", "congestion", "constipation", "control stomach acid", "cough", "diarrhoea", "dizziness", "dry eyes", "dry nasal passages", "dry skin", "dyspepsia", "fever", "flatulence", "flu symptoms", "gout pain", "headache", "haemorrhoids", "hyperglycaemia", "hypoglycaemia", "indigestion", "insomnia", "irritable bowel symptoms", "itching", "leg cramp", "menstrual pain", "migraine headache", "motion sickness", "mouth sore pain", "muscle pain", "nasal congestion", "nausea", "pain", "psychosis", "sedation", "shortness of breath or wheezing", "sinus symptoms", "smoking cessation", "sore throat", "spasm", "symptoms of alcohol withdrawal", "urinary discomfort", "wheezing"],
    anaesRoute: ["anatomical plane", "endotrachael", "enteral", "epidural", "inhalation", "intraAMNIOTIC", "intraARTERIAL", "intraARTICULAR", "intraCARDIAC", "intraCERVICAL", "intraMUSCULAR", "intraPERITONEAL", "intraPLACENTAL", "intraPLEURAL", "intraTHECAL", "intraUTERINE", "intraVENOUS", "intraVENTRICULAR", "intraVESICAL", "nebulised", "oral", "perineal", "perineural", "rectal", "subCUTANEOUS", "subDERMAL", "subLINGUAL", "topical", "transDERMAL", "transMUCOSAL", "transTRACHEAL", "transURETHRAL", "urethral", "vaginal", "wound catheter"],
    anaesForm: ["injection", "infusion"],
    anaesCategory: ["Analgesics", "Anticholinergics Agents", "Antiemetics", "Antimicrobials", "Benzodiazepines", "Induction Agents", "Local Anaesthetics", "Muscle Relaxants", "Opioids", "Other", "Reversal", "Uterotonics", "Vasoactives"],
    legalStatus: ["CD", "Non CD"],
    totalDisplayOptions: ["Amount", "Volume"],
    bolusDisplayOptions: ["Weight Based Dose", "Volume", "Amount", "Amount / Volume"],
    bolusDefaultCursorLocation: ["Weight Based Dose", "Amount", "Volume"],
    infusionDisplayOptions: ["Dosing Infusion Rate", "Pump Infusion Rate", "Volume Infused", "Weight Based Dose", "Amount Infused", "Amount / Volume Infused"],
    infusionDefaultCursorLocation: ["Dosing Infusion Rate", "Pump Infusion Rate", "Volume Infused", "Weight Based Dose", "Amount Infused"],
    doseAmountUnits: ["g", "mg", "microgram", "nanogram", "mEq", "unit", "milliunit"],
    concentrationUnits: ["g/mL", "mg/mL", "microgram/mL", "nanogram/mL", "mEq/mL", "units/mL", "munit/mL"],
    dosingInfusionRateUnits: ["g/hour", "mg/hour", "microgram/hour", "nanogram/hour", "mEq/hour", "units/hour", "munit/hour", "g/minute", "mg/minute", "microgram/minute", "nanogram/minute", "mEq/minute", "units/minute", "munit/minute"],
    weightBasedDoseUnits: ["g/kg/hour", "mg/kg/hour", "microgram/kg/hour", "nanogram/kg/hour", "mEq/kg/hour", "units/kg/hour", "munit/kg/hour", "g/kg/minute", "mg/kg/minute", "microgram/kg/minute", "nanogram/kg/minute", "mEq/kg/minute", "units/kg/minute", "munit/kg/minute"],
    pumpInfusionRateUnits: ["mL/hour", "mL/minute", "L/hour"],
    weightBasedBolusUnits: ["g/kg", "mg/kg", "microgram/kg", "nanogram/kg", "mEq/kg", "units/kg", "munit/kg"]
  };

  function heading(label) {
    return { type: "heading", label: label };
  }

  function field(key, label, type, opts) {
    var result = { key: key, label: label, type: type || "text" };
    opts = opts || {};
    Object.keys(opts).forEach(function (name) { result[name] = opts[name]; });
    return result;
  }

  var governanceFields = [
    heading("Governance and request context"),
    field("reasonForRequest", "Reason for Request", "textarea", { placeholder: "Why is this addition, modification, or removal being requested?" }),
    field("referenceChecked", "Reference checked", "textarea", { placeholder: "BNF, BNFC, SPC/HPRA, Medicines.ie, Injectable Medicines Guide, local guideline, formulary decision, or N/A with reason." }),
    field("facilities", "Facilities / scope", "select", { options: options.facilities, helper: "Template wording is all vs local. Add detail in local notes if needed." }),
    field("localNotes", "Local notes", "textarea", { placeholder: "Screenshots, local wording, dependency, related care plan, or other implementation notes." }),
    field("validationNotes", "Validation notes", "textarea", { placeholder: "How will the site verify this is clinically appropriate, technically correct, and safe?" })
  ];

  var orderCatalogFields = [
    heading("Order Catalog template columns"),
    field("request", "Request", "select", { options: options.action }),
    field("reasonForRequest", "Reason for Request", "textarea", { placeholder: "Specify why a new or changed orderable is needed." }),
    field("referenceState", "Reference status", "select", { options: ["SPC / HPRA", "BNF", "BNFC", "Medicines.ie", "Local guideline or formulary decision", "Other", "Not yet checked", "Not sure"] }),
    field("referenceChecked", "Reference", "textarea", { placeholder: "SPC/HPRA, BNF, BNFC, Medicines.ie, local guideline, or N/A with reason." }),
    field("genericName", "Generic Name", "text", { placeholder: "Example: Emtricitabine + Tenofovir alafenamide" }),
    field("brandName", "Brand Name", "text", { placeholder: "Example: Descovy" }),
    field("strength", "Strength", "textarea", { placeholder: "Example: 200 mg + 10 mg; 200 mg + 25 mg" }),
    field("currentProductDescription", "Current Order Catalog wording", "textarea"),
    field("requestedProductDescription", "Requested Order Catalog wording", "textarea"),
    field("replacementImpactState", "Replacement or workflow impact", "select", { options: ["Yes", "No", "Not sure"] }),
    field("replacementImpactDetails", "Replacement / impact details", "textarea"),
    field("hasSafetyRestrictions", "Safety or restriction notes required", "select", { options: ["Yes", "No", "Not sure"] }),
    field("removalConfirmed", "Removal explicitly confirmed", "select", { options: ["Yes", "No"] }),
    heading("Extra build clarity"),
    field("orderableSynonyms", "Additional synonyms/search words", "textarea", { placeholder: "Other names, abbreviations, old names, or local terms users might search for." }),
    field("safetyRestrictionNotes", "Safety, formulary, or restriction notes", "textarea", { placeholder: "High-alert, restricted, approval required, or local governance notes." }),
    field("validationNotes", "Validation notes", "textarea", { placeholder: "How should the requester confirm the item appears and behaves correctly?" })
  ];

  var orderSentenceFields = [
    heading("Order Sentence template columns"),
    field("request", "Request: Add / Modify / Remove", "select", { options: ["Add", "Modify From", "Modify To", "Remove"] }),
    field("reasonForRequest", "Reason for Request", "textarea"),
    field("referenceChecked", "Reference checked", "textarea"),
    field("orderableSynonym", "Orderable Synonym", "text"),
    field("facilities", "Facilities: all vs local", "select", { options: options.facilities }),
    field("sentenceType", "Sentence type: administration = IP / prescription = OP", "select", { options: options.orderSentenceType }),
    heading("Age Filters"),
    field("ageRangeCriteria", "Age Range Criteria", "select", { options: options.criteria }),
    field("ageMin", "Age Min", "text", { inputType: "number", helper: "Enter the lower age boundary as a number, then choose its unit." }),
    field("ageMax", "Age Max", "text", { inputType: "number", helper: "Enter the upper age boundary as a number, then choose its unit." }),
    field("ageUnit", "Age Unit", "select", { options: options.ageUnit }),
    heading("PMA Filters"),
    field("pmaCriteria", "PMA Criteria", "select", { options: options.criteria }),
    field("pmaMin", "PMA Min", "text", { inputType: "number", helper: "Enter the lower postmenstrual-age boundary as a number." }),
    field("pmaMax", "PMA Max", "text", { inputType: "number", helper: "Enter the upper postmenstrual-age boundary as a number." }),
    field("pmaUnit", "PMA Unit", "select", { options: options.pmaUnit }),
    heading("Weight Filters"),
    field("weightCriteria", "Weight Criteria", "select", { options: options.criteria }),
    field("weightMin", "Weight Min", "text", { inputType: "number", helper: "Enter the lower weight boundary as a number, then choose kg or g." }),
    field("weightMax", "Weight Max", "text", { inputType: "number", helper: "Enter the upper weight boundary as a number, then choose kg or g." }),
    field("weightUnit", "Weight Unit", "select", { options: options.weightUnit }),
    heading("Order Sentence Details"),
    field("dose", "Dose", "text"),
    field("doseUnit", "Dose Unit", "select", { options: options.units }),
    field("routeOfAdministration", "Route of Administration", "select", { options: options.route }),
    field("drugForm", "Drug Form", "select", { options: options.form }),
    field("frequency", "Frequency", "select", { options: options.frequency }),
    field("prn", "PRN: Y / N / blank", "select", { options: options.yesNoBlank }),
    field("prnReason", "PRN Reason", "select", { options: options.prnReason }),
    field("specialInstructions", "Special Instructions (max 255 characters)", "textarea"),
    field("giveFirstDoseNow", "Give First Dose Now: Y / N / blank", "select", { options: options.yesNoBlank }),
    field("duration", "Duration", "text"),
    field("orderComments", "Order Comments", "textarea"),
    field("validationNotes", "Validation notes", "textarea")
  ];

  var ivSetFields = [
    heading("IV Set top-level template columns"),
    field("nicuInfusion", "Is this infusion for NICU?", "select", { options: options.yesNo, helper: "Required. This affects naming, review and the intended clinical context." }),
    field("request", "Request: Add / Remove / Modify", "select", { options: options.action }),
    field("description", "Description", "text", { placeholder: "Example: Labetalol Adult IV Infusion; NICU Naloxone IV Infusion" }),
    field("reasonForRequest", "Reason for Request", "textarea"),
    field("referenceChecked", "Reference", "textarea"),
    field("orderType", "Order Type", "text", { placeholder: "Continuous (Do Not Change)" }),
    field("highAlertStatus", "High Alert Status", "select", { options: options.yesNo }),
    field("titratableInfusion", "Titratable Infusion", "select", { options: options.yesNo }),
    field("facilities", "Facilities: All / Local", "select", { options: ["All", "Local"] }),
    field("includeInCarePlan", "IV set to be included in a Care Plan", "select", { options: options.yesNo }),
    field("carePlanName", "(If yes) Care Plan Name", "text"),
    heading("Diluent (=Base Solution)"),
    field("readyDiluted", "Is the product ready-diluted?", "select", { options: options.yesNo, helper: "Choose Yes when the IV Set comprises the supplied diluent/product only and no separate additive is prepared." }),
    field("diluentOrderableSynonym", "Orderable Synonym", "text"),
    field("bagVolume", "Bag Volume +/- Volume Unit (i.e. Total volume of bag/syringe)", "text"),
    field("routeOfAdministration", "Route of Administration", "select", { options: options.route }),
    field("drugForm", "Drug Form", "select", { options: options.form }),
    field("rate", "Rate +/- Rate Unit", "text"),
    field("infuseOver", "Infuse Over +/- Units", "text"),
    field("orderCommentsInfusionInstructions", "Order Comments / Infusion Instructions", "textarea"),
    field("duration", "Duration", "text"),
    field("replaceEvery", "Replace Every +/- units", "text"),
    field("specialInstructions", "Special Instructions (max 255 characters)", "textarea"),
    heading("Additive (=Medication to be infused)"),
    field("additiveOrderableSynonym", "Orderable Synonym", "text"),
    field("additiveDose", "Additive Dose +/- Dose Unit", "text"),
    field("normalisedRate", "Normalised Rate +/- Unit", "text"),
    heading("Modify From / To capture"),
    field("diluentFrom", "Diluent From", "textarea", { compare: true }),
    field("diluentTo", "Diluent To", "textarea", { compare: true }),
    field("additiveFrom", "Additive From", "textarea", { compare: true }),
    field("additiveTo", "Additive To", "textarea", { compare: true }),
    field("validationNotes", "Validation notes", "textarea")
  ];

  var snAnaesthesiaFields = [
    heading("SN Anaesthesia template columns"),
    field("request", "Request: Add / Remove / Modify", "select", { options: ["Add", "Remove", "Modify From", "Modify To"] }),
    field("reasonForRequest", "Reason for Request", "textarea"),
    field("referenceChecked", "Reference", "textarea"),
    heading("Medication Details"),
    field("orderableSynonym", "Orderable synonym", "text"),
    field("anaesthesiaIdentifier", "Anaesthesia Identifier", "text"),
    field("category", "Category", "select", { options: options.anaesCategory }),
    field("legalStatus", "Legal Status", "select", { options: options.legalStatus }),
    field("strength", "Strength", "text"),
    field("volume", "Volume", "text"),
    field("concentration", "Concentration", "select", { options: options.concentrationUnits }),
    field("route", "Route", "select", { options: options.anaesRoute }),
    field("form", "Form", "select", { options: options.anaesForm }),
    field("totalDisplayOptions", "Total Display Options", "select", { options: options.totalDisplayOptions }),
    heading("Bolus Preferences"),
    field("bolusDisplayOption", "Bolus Display Option", "select", { options: options.bolusDisplayOptions }),
    field("bolusDefaultCursorLocation", "Bolus Default Cursor Location", "select", { options: options.bolusDefaultCursorLocation }),
    field("bolusWeightBasedDoseUnits", "Weight Based Dose (units)", "select", { options: options.weightBasedBolusUnits }),
    field("doseAmountUnits", "Dose Amount (units)", "select", { options: options.doseAmountUnits }),
    heading("Infusion Preferences"),
    field("infusionDisplayOption", "Infusion Display Option", "select", { options: options.infusionDisplayOptions }),
    field("infusionDefaultCursorLocation", "Infusion Default Cursor Location", "select", { options: options.infusionDefaultCursorLocation }),
    field("dosingInfusionRateUnits", "Dosing Infusion Rate (units)", "select", { options: options.dosingInfusionRateUnits }),
    field("infusionWeightBasedDoseUnits", "Weight Based Dose (units)", "select", { options: options.weightBasedDoseUnits }),
    field("pumpInfusionRateUnits", "Pump Infusion Rate (units)", "select", { options: options.pumpInfusionRateUnits }),
    field("amountInfusedUnits", "Amount Infused (units)", "select", { options: options.doseAmountUnits }),
    heading("Extra build clarity"),
    field("perioperativeNotes", "Perioperative notes", "textarea"),
    field("validationNotes", "Validation notes", "textarea")
  ];

  var carePlanFields = [
    heading("Care Plan request columns"),
    field("request", "Request", "select", { options: options.action }),
    field("reasonForRequest", "Reason for Request", "textarea"),
    field("referenceChecked", "Reference checked", "textarea"),
    field("carePlanName", "Care Plan / pathway name", "text"),
    field("phaseOrSection", "Phase or section", "text"),
    field("includedOrders", "Orders to add, modify, remove, preselect, or leave optional", "textarea"),
    field("selectionBehaviour", "Selection behaviour", "textarea"),
    field("facilities", "Facilities / scope", "select", { options: options.facilities }),
    field("validationNotes", "Validation notes", "textarea")
  ];

  var typeSpecificFields = {
    orderCatalog: orderCatalogFields,
    orderSentence: orderSentenceFields,
    ivSet: ivSetFields,
    carePlan: carePlanFields,
    snAnaesthesia: snAnaesthesiaFields
  };

  window.MnCmsSchemas = {
    options: options,
    responsibilityStatement: "All changes should be built strictly in accordance with the approved change request. The requesting site, local Informatics Pharmacist and relevant multidisciplinary/site team remain responsible for verifying that implemented changes are clinically appropriate, technically correct and safe for local use before approval and promotion.",
    requestTypes: [
      { id: "orderCatalog", label: "Order Catalog", description: "Use when users need to find a new or changed orderable item in search.", guidance: ["This now mirrors the Order Catalog template columns: Request, Reason, Reference, Generic Name, Brand Name, and Strength.", "Generic name, brand name, and strength are required because they let the build team create the exact product and synonyms users need.", "Use the extra synonym field for old names, abbreviations, and local search words."] },
      { id: "orderSentence", label: "Order Sentence", description: "Use for dose, route, frequency, duration, PRN, filter, or default-order wording changes.", guidance: ["Describe the outcome or problem in ordinary language first.", "If you know the exact build, open the optional technical fields and add it.", "If you are unsure, leave technical fields as Not specified / discuss; the team can clarify them with you."] },
      { id: "ivSet", label: "IV Set", description: "Use for IV infusion sets, diluent/concentration defaults, rates, administration instructions, and related safety checks.", guidance: ["This mirrors the IV Set design columns for Diluent (=Base Solution) and Additive (=Medication to be infused).", "Complete diluent orderable synonym, bag volume, route, form, rate, infuse over, infusion instructions, duration, replace every, and special instructions where relevant.", "Complete additive synonym, dose, and normalised rate so the exact infusion product can be built."] },
      { id: "carePlan", label: "Care Plan", description: "Use for care plans, power plans, phases, grouped orders, preselection, and pathway build changes.", guidance: ["No Excel template was supplied for Care Plan, so these fields remain inferred from the requested workflow.", "List each order and the desired selection behaviour.", "Include validation expectations because care plan changes often affect several orders at once."] },
      { id: "snAnaesthesia", label: "SN Anaesthesia", description: "Use for anaesthesia-specific medication, supply, perioperative, or theatre workflow requests.", guidance: ["This mirrors the SN Anaesthesia template columns and dropdowns.", "Complete medication details first: product name, identifier, category, legal status, strength, volume, concentration, route, and form.", "Complete bolus and infusion preferences only where they apply."] }
    ],
    fieldsForType: function (typeId) {
      return typeSpecificFields[typeId] || [];
    },
    typeById: function (typeId) {
      return this.requestTypes.filter(function (type) { return type.id === typeId; })[0] || null;
    }
  };
})();
