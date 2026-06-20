# Order Sentence template dropdowns design

## Goal

Constrain every guided Order Sentence question that corresponds to a dropdown in `Order Sentence CR (Template) v0.2 20260605 (1).xlsx` to the workbook's approved values.

## Source of truth

`assets/js/schemas.js` already transcribes the workbook `Validation` sheet into shared option arrays. The guided journey will receive these arrays from `MnCmsSchemas.options`; it will not duplicate or invent clinical options.

## Guided controls

The following existing questions will use structured controls:

- Request: Add, Modify, or Remove.
- Facilities: Local, All, or Not sure, preserving the journey's uncertainty path.
- Sentence type: administration, prescription, or Both.
- Dose unit: `options.units`.
- Route of administration: `options.route`.
- Drug form: `options.form`.
- Frequency: `options.frequency`.
- PRN: Y, N, or blank/Not sure as already represented by the journey.
- PRN reason: `options.prnReason`, shown only when PRN is Y.
- Give First Dose Now: Y, N, or blank/Not sure as already represented by the journey.
- Age, PMA, and weight criteria: `options.criteria`.
- Age unit: `options.ageUnit`.
- PMA unit: `options.pmaUnit`.
- Weight unit: `options.weightUnit`.

Numeric boundaries remain structured numeric inputs. Medication/orderable names, dose values, special instructions, duration, order comments, reason, reference, and other narrative fields remain text entry.

## Filter sequence

When patient filters are required, each filter is collected as separate template-aligned questions: criterion, minimum, maximum, and unit. Minimum and maximum stay optional because criteria such as Less than or Greater than/equal to need only one boundary. Each entire filter can be skipped when it does not apply.

## Interaction

Each dropdown starts with an unselected `Choose…` prompt. Optional template fields retain a clear Skip action, which records the existing internal skipped state and is rendered human-readably in review/export. There is no free-text alternative for values controlled by the template.

The OEF and CDL previews continue to update after every answer. They display selected values verbatim and do not infer missing clinical information.

## Testing

Automated tests will verify that all mapped journey steps use shared schema-backed dropdown types, filter subquestions appear only when relevant, numeric boundaries accept numeric entry, and no internal skipped sentinel appears in output. Browser verification will cover keyboard selection, conditional PRN/filter questions, progressive previews, narrow layout, and console errors.

## Rollback

The implementation will be isolated to Order Sentence guided definitions, generic dropdown rendering, schema option wiring, focused preview composition, and tests. It can be reverted without migrating saved drafts.
