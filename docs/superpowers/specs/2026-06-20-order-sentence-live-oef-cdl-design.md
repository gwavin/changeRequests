# Order Sentence live OEF and CDL preview design

## Purpose

Extend the guided-only Order Sentence journey with live request mockups based on `OS_DetailsForBuild.docx`. Users should see how each constrained answer is likely to appear while ordering in the Order Entry Format (OEF) and after ordering in the Clinical Display Line (CDL).

The mockups support discussion and specification. They are not clinical-system screens and do not approve or implement build.

## Reference material

The supplied document contains four embedded clinical-system images:

- OEF Details for Aspirin, including Dose, Dose Unit, Route of Administration, Drug Form, PRN, PRN Reason, Give First Dose Now, Frequency, Duration, Duration Unit, Order Instructions, and date/time controls.
- OEF Order Comments tab.
- The OEF selection line: `Aspirin DOSE: 75 mg - ROUTE: oral - tablet - ONCE a day [Greater Than or Equal To 12 year]`.
- The CDL medication row showing medication, dose, route, form, frequency, and start/date information after ordering.

The implementation recreates these structures in accessible HTML and CSS. It does not embed the screenshots as the active preview.

## Journey and governance

Requesting site and designated medicines-team liaison remain the first two required questions. Add, Modify, and Remove remain separate branches. Clinical reason, authoritative reference, liaison clinical-correctness confirmation, and patient-information confirmation remain required.

The build questions populate one answer at a time:

- medication or orderable;
- dose and dose unit;
- route of administration;
- drug form;
- frequency;
- PRN status and indication when applicable;
- give first dose now;
- duration and duration unit;
- order instructions;
- order comments; and
- age, postmenstrual-age, and weight filters when applicable.

Structured choices are preferred where the existing schema provides an approved option list. Optional technical fields can be explicitly skipped and display as `Not specified` rather than receiving a guessed clinical value.

## Live layout

The right-hand preview area contains two cards side by side on desktop and stacked on narrow screens:

1. **OEF - while ordering** recreates the supplied Details and Order Comments tabs. It shows the supplied field arrangement and highlights values progressively as answers are entered.
2. **CDL - after ordering** shows both the selectable OEF sentence and the ordered clinical display row.

Both cards carry a persistent label: **Request mockup - not a live clinical-system screen**.

The live preview is read-only throughout guided entry. It updates after every answer and never provides a second data-entry route.

## Final review interaction

At final review, populated preview fields and sentence segments become keyboard-accessible buttons. Activating one returns the user to the guided question that owns that value. The mockup itself remains read-only.

Unanswered optional fields remain visible only where needed to explain the mock structure and use the neutral text `Not specified`. Internal sentinel values such as `__SKIPPED__` never appear.

## Branch behaviour

For Add, the preview shows the proposed OEF and CDL.

For Modify, final review shows clearly labelled current and requested previews. Current free-text wording is preserved, while the requested structured preview is built from guided answers.

For Remove, final review identifies the existing sentence, suppresses a misleading proposed new build, and requires explicit removal confirmation.

## Data and rendering

Preview generation is a pure function of the existing request data. It produces escaped HTML and exposes a field-to-question mapping for final-review navigation. The same renderer is reused in the downloaded HTML review so the meeting artifact matches the on-screen request.

Existing drafts remain compatible. Missing new fields are treated as unanswered. Existing export encoding and skipped-value sanitisation remain unchanged.

## Accessibility and responsive behaviour

- OEF and CDL cards have semantic headings and explanatory text.
- Tab labels are descriptive; the mock tabs do not masquerade as active clinical controls.
- Clickable final-review fields use real buttons with visible focus treatment.
- Colour is not the only indication of entered versus unspecified values.
- The two cards stack without horizontal page scrolling on narrow screens.
- The detailed OEF grid may scroll within its own labelled region when necessary.

## Verification

Automated tests cover OEF and CDL composition, escaping, skipped values, conditional PRN/filter content, Modify and Remove behaviour, and field-to-question navigation metadata. Browser verification covers progressive updates, Details and Order Comments views, final review navigation, desktop and mobile layout, keyboard focus, downloads, and console errors.

## Safety and privacy

Only fake medication examples are used in tests. No patient data, staff contact details, credentials, or live clinical-system data is introduced. Dates shown in examples are neutral mock values or omitted; the request builder does not create real medication orders.
