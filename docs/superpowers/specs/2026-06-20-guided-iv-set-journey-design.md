# Guided IV Set journey and PowerChart mock-up design

## Goal

Replace the unrestricted IV Set entry experience with the same guided-only, one-question-at-a-time pattern used for Order Catalog and Order Sentence, while progressively rendering a read-only PowerChart-style Details and Continuous Details mock-up.

## Governance and branching

Every journey begins with requesting site and designated medicines-team liaison. It then collects Add, Modify, or Remove and adapts the remaining questions. NICU use requires an explicit Yes or No answer in every branch.

Add requests collect the proposed build. Modify requests clearly separate the current IV Set from requested changes. Remove requests identify the existing set, capture replacement/workflow impact, and require explicit removal confirmation.

All branches require a clinical reason, precise authoritative reference, medicines-team liaison confirmation of clinical correctness, and confirmation that no patient-identifiable information is included.

## Ready-diluted logic

Users are told that Diluent means the base solution or supplied product. If the IV Set comprises that product alone, `Ready-diluted` is Yes and no separately prepared additive is required. Otherwise it is No and the journey asks separately for the base solution and additive.

Unknown optional technical values can be deliberately skipped and appear as `Not supplied` or `To discuss` in human-facing review, never as an internal sentinel.

## Template-aligned questions

The guided Add/Modify build captures, where applicable:

- description and NICU status;
- route and drug form;
- ready-diluted state;
- base-solution orderable synonym and bag/syringe volume;
- rate and rate unit;
- infuse-over value and unit;
- infusion instructions;
- duration and duration unit;
- replacement interval and unit;
- special instructions;
- additive orderable synonym, additive dose and unit;
- normalised rate and unit;
- delivers and occurrence values.

Existing option arrays in `MnCmsSchemas.options` are the single source for template dropdowns. Numeric quantities use numeric controls; medicine/product expressions and narrative instructions remain text.

## Live mock-up layout

The active question, answer, progress, and navigation span the full width at the top. Beneath them, desktop layout places the read-only PowerChart-style Details mock-up on the left and Continuous Details on the right. On narrow screens they stack in that order.

Details shows route, form, duration, replacement interval, special instructions, NICU state, and ready-diluted state. Continuous Details shows base solution, bag volume, rate, infuse-over, additive, dose, normalised rate, delivers, occurrence, total volume, and infusion instructions. Both update after each answer. At final review, mock-up values may navigate back to their corresponding guided question; they do not become an alternative editing form.

## Exports and compatibility

HTML and CSV remain human-readable and include the assembled IV Set request. Existing saved drafts load best-effort: matching legacy fields populate the new journey, while missing structured subfields remain unanswered. No destructive migration is required.

## Testing and safety

Automated tests cover sequence, Add/Modify/Remove branching, NICU requirement, ready-diluted/additive conditionality, dropdown mappings, preview composition, skipped-value cleanup, exports, and layout contracts. Browser verification covers desktop and narrow layouts, keyboard operation, progressive updates, saved drafts, downloads, and console errors.

The mock-up is labelled as a request representation, not a live clinical-system screen. It performs no dose, concentration, rate, volume, or clinical-validity calculations.

## Rollback

The implementation is isolated to guided journey definitions/UI, IV preview rendering/layout, controller routing, focused tests, and documentation. It can be reverted without deleting stored drafts.
