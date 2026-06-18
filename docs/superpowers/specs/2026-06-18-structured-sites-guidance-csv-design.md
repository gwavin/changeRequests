# Structured sites, field guidance, and readable CSV design

## Purpose

Make the change-request builder safer and easier for inexperienced users without slowing down experts. Replace site free text with an approved list, explain every field at the point of use, prefer structured answers where the valid choices are known, and make CSV exports readable by people.

## Site selection

The form will have one required site selector. Each option stores a stable short code and its corresponding display name:

| Code | Display name |
| --- | --- |
| NMH | National Maternity Hospital |
| ROH | Rotunda Hospital |
| CUMH | Cork University Maternity Hospital |
| TCH | The Coombe Hospital |
| UMHL | University Maternity Hospital Limerick |
| UHK | University Hospital Kerry |
| NATIONAL | National / All Sites |

Selecting a code will populate the full site name automatically and show it beside or beneath the selector. Users cannot type an unrecognised site. The code continues to supply the site portion of exported filenames, while both code and full name appear in exported content. Existing locally saved drafts containing recognised codes will resolve to the approved name; unrecognised legacy values will be shown safely and require a valid selection before the request is discussion-ready.

## Field guidance

Every metadata and change-item field will have a concise description available through an information control. The control must work on pointer hover and keyboard focus and expose the guidance to assistive technology. It will explain what belongs in the field, why it is requested, and include a brief example where that adds clarity.

Essential safety or workflow messages will remain persistently visible rather than being hidden exclusively in a tooltip. Existing helper text will be reused as the source of truth where possible so visible and hover/focus guidance cannot contradict one another.

## Structured data entry

Known answer sets will use structured controls: selects for enumerations and yes/no questions, dates for dates, email inputs for email addresses, numeric inputs for quantities, and constrained unit choices where schemas already define them. A blank prompt will remain the default unless a clinically safe default already exists. Narrative fields such as reason, requested outcome, instructions, and validation notes will remain free text because constraining them could encourage inaccurate requests.

This change will not invent new clinical defaults or silently convert ambiguous values.

## Human-readable CSV

CSV output will become a sectioned vertical report. It will begin with a `CHANGE REQUEST DETAILS` section containing `Field,Value` rows. Each requested change will then have its own `CHANGE ITEM N` section, also containing `Field,Value` rows. Blank rows will separate sections.

The export will preserve standard CSV quoting and remain compatible with spreadsheet applications. Repeated items and optional expert fields will be labelled rather than flattened into one very wide row. Both site code and full site name will be included. HTML export behaviour will remain unchanged.

## Validation and compatibility

- Site selection is required and must match the approved mapping.
- Filename generation continues to use the selected short code.
- Existing browser drafts are not discarded; recognised legacy site codes are normalised when loaded.
- Exported values remain escaped or quoted using the existing safety mechanisms.
- No network service, patient information, or clinical-system integration is introduced.

## Testing

Automated tests will cover site-code resolution, invalid-site validation, filename behaviour, and the sectioned CSV layout including quoting and repeated change items. Browser verification will cover mouse and keyboard access to field guidance, site selection and populated name, draft compatibility, download behaviour, and responsive presentation.

## Scope boundaries

This work does not add ward/team selection, alter the approval workflow, introduce an Excel `.xlsx` dependency, or change the existing clinical-style IV Set preview beyond receiving the structured site metadata used elsewhere in the request.
