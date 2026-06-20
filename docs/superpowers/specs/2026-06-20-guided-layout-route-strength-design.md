# Guided strength, route and preview layout design

## Goal

Refine the guided Order Catalog and Order Sentence journeys so users can deliberately omit an Order Catalog strength, can only choose an approved Order Sentence route, and can understand the relationship between their current answer, the Order Entry Format (OEF), and the PowerChart Clinical Display Line (CDL).

## Order Catalog strength

The Add journey retains the existing strength/presentation question but makes it optional. A visible **Skip** action records a deliberate omission. The guided review and human-readable exports display **Not supplied** rather than dropping the field or exposing an internal sentinel. Existing supplied strengths and the one-row-per-strength export behaviour remain unchanged.

## Order Sentence route

The route question uses a constrained dropdown. Its values are the non-blank entries in the **Route** column of the `Validation` sheet in `docs/Order Sentence CR (Template) v0.2 20260605 (1).xlsx`, preserving the template spelling and capitalisation. The existing route list in `assets/js/schemas.js` matches that source and should be shared rather than duplicated. No free-text fallback is provided in the guided journey.

## Order Sentence layout

On desktop, the active question and answer control span the full content width at the top. Beneath them, a two-column preview row places the read-only OEF on the left and the read-only CDL on the right. The progress indicator remains associated with the question area. Navigation actions remain immediately below the question so the previews do not interrupt sequential entry.

The OEF and CDL update after every answer. They remain read-only until completion, consistent with the existing approved behaviour. The current-answer summary remains visible within the top question area; the old dark summary sidebar is not used for the Order Sentence journey.

At narrow widths the layout stacks in this order: current question/answer, OEF, CDL. Each preview may scroll internally where its clinical-style table cannot fit without losing legibility.

Order Catalog retains its existing question-and-summary layout apart from the optional strength behaviour.

## Accessibility and safety

The route dropdown has an explicit label and begins with an unselected prompt. Keyboard order follows question, answer, navigation, OEF, then CDL. Read-only previews are clearly labelled as mock representations and do not become a second editing route. No medication values are calculated or inferred.

## Testing

Automated tests will establish that:

- an Add Order Catalog request can deliberately skip strength and renders `Not supplied` in review/export;
- a supplied strength continues to produce the existing formal rows;
- the Order Sentence route step is a select using exactly the template-backed route options;
- the Order Sentence DOM/CSS places the question across the top and OEF/CDL in left/right preview regions;
- responsive CSS stacks question, OEF and CDL in the agreed order;
- the guided single-question journey remains active.

Browser verification will cover desktop and narrow layouts, route selection, progressive OEF/CDL updates, keyboard focus order, and console errors.

## Rollback

The change is isolated to guided journey definitions/rendering, preview composition/layout styles, and focused tests. It can be reverted as one implementation commit without changing stored request data.
