# Order Catalog guided journey design

## Purpose

Replace the Order Catalog’s conventional all-at-once form with a calm, one-question-at-a-time journey. Novice users should understand what is being asked without needing to understand MN-CMS build terminology. Expert users must be able to move directly to the full technical form without losing entered answers.

This is the first implementation of a reusable guided-journey pattern. Once verified, the same interaction model will be adapted deliberately to Order Sentence, IV Set, Care Plan, and SN Anaesthesia rather than forcing every request type through an identical sequence.

## Approved interaction model

The default layout is **Focus + growing summary**:

- One active question occupies the primary panel.
- A persistent summary panel shows the formal request assembling after each answer.
- A progress indicator states the current step and remaining journey.
- Back and Continue controls preserve answers.
- Optional questions have an explicit **Skip for now** action.
- Completed summary answers have an Edit action that returns to the relevant question.
- A visible **I know the technical details — show the full form** action switches to the existing expert form.
- Switching between guided and expert views never discards data.
- On small screens, the summary becomes a collapsible section beneath the active question so the question remains visually dominant.

## Entry and branch selection

After choosing Order Catalog, the first question is:

**What do you need to do?**

- Add a medication
- Modify an existing medication
- Remove a medication

The selected action changes later wording and fields. The journey does not show irrelevant branch questions.

## Shared question sequence

All branches ask, one at a time:

1. Action: add, modify, or remove.
2. Medication identity in plain language.
3. Reason: what is wrong or needed today.
4. Reference checked: SPC/HPRA, BNF, BNFC, Medicines.ie, local guideline, other, not yet checked, or not sure. A details field appears only when useful.
5. Findability: brand name and additional synonyms, both skippable.
6. Safety or restriction information: Yes, No, or Not sure. Details appear only for Yes.
7. Validation expectation: how the requester will confirm the resulting catalogue entry is correct; skippable with explicit discussion wording.
8. Requesting site from the approved site list.
9. Requester name and optional work contact, asked separately.
10. Privacy confirmation.
11. Final review of the assembled request.

Short subject and request title are derived from action and medication identity. They are shown and editable at review rather than asked as additional early questions. The filename continues to use the derived subject, `OC`, site code, and current date.

## Add branch

The Add path collects the exact Order Catalog template columns:

- Request: automatically `Add`.
- Reason for Request.
- Reference.
- Generic Name.
- Brand Name, optional.
- Strength.

Generic name and strength are required for a discussion-ready Add request. Strength is repeatable: after entering one strength, the user can add another presentation/strength. Each strength becomes a separate formal Order Catalog row while shared generic name, brand, reason, and reference remain synchronized.

## Modify branch

The Modify path visibly separates **Current** and **Requested** values. It asks:

- Which existing medication/orderable is affected?
- What is currently displayed or searchable?
- What should it display or match instead?
- Why is the modification needed?
- What reference supports the requested value?

Generic name, brand, and strength are captured in structured current/requested groups where known. Users can choose **Not sure — describe the outcome** and supply ordinary-language intent without inventing technical values.

The exported formal request uses `Modify` and preserves both current and requested values. It must never silently overwrite the current value with the requested value.

## Remove branch

The Remove path asks:

- Which medication/orderable should be removed?
- Why should it be removed?
- Is there a replacement or workflow impact? Yes, No, or Not sure; details appear when applicable.
- What reference or governance decision supports removal?

Final review includes a deliberate confirmation: **I understand this request is to remove the identified Order Catalog item.** This is request clarification only and does not approve or execute removal.

## Progressive summary and final review

The summary translates answers into the formal headings used by the supplied workbook. Empty optional values read **Not provided** or **To discuss**, never an inferred clinical value.

The final review includes:

- Request status: For discussion — not approved.
- Derived filename.
- Site and requester.
- Plain-language reason and requested outcome.
- A table preview of the Order Catalog row or rows.
- Branch-specific current/requested or removal-impact details.
- Safety, validation, privacy, and governance wording.
- Edit controls for every answer.
- Add another Order Catalog item.
- Download HTML and readable CSV.
- Continue to another CR type after completing/exporting the request.

The next-options panel points users to Order Sentence, IV Set, Care Plan, and SN Anaesthesia with plain-language descriptions. It does not imply that exporting submitted or approved the request.

## Data model and compatibility

The existing request object and exporter interfaces remain the source of truth. A journey definition maps questions to existing metadata and item keys. New branch-specific keys are added only where the existing schema cannot safely distinguish current and requested values or removal impact.

Existing local drafts continue to load. When an older Order Catalog draft has enough data, the journey derives the furthest safe completed step. Missing answers remain unanswered. Expert-mode data is reflected in the guided summary.

The Order Catalog journey is implemented as a reusable engine plus an Order Catalog configuration so later CR journeys can reuse navigation, persistence, progress, summary, validation, and review without sharing inappropriate clinical questions.

## Validation and error handling

- Continue is disabled until the current required question has a valid answer.
- Validation appears beside the current question in plain language and receives keyboard focus when continuation fails.
- Add requires generic name, at least one strength, reason, approved site, requester name, privacy confirmation, and an explicit reference state.
- Modify requires identification, current/requested distinction or a clear ordinary-language outcome, reason, site, requester, privacy confirmation, and an explicit reference state.
- Remove requires identification, reason, removal confirmation, site, requester, privacy confirmation, and an explicit reference state.
- Optional answers can be skipped explicitly and remain visibly marked for discussion.
- Browser drafts save after each successful step locally; no network submission is introduced.
- Damaged or incompatible drafts fall back to the first incomplete safe step and display a non-destructive warning.

## Accessibility

- The active question is a labelled region with a visible heading.
- Step changes update an `aria-live` announcement and move focus to the question heading.
- Back, Continue, Skip, Edit, and expert-mode actions are keyboard operable.
- Progress is expressed in text as well as visually.
- Summary disclosure works by keyboard and touch.
- Choice controls use native radios, checkboxes, selects, inputs, and textareas.
- Motion is minimal and respects reduced-motion preferences.

## Testing and verification

Automated tests cover branching, required-step validation, derived titles, repeatable strengths, current/requested preservation, removal confirmation, draft step recovery, and compatibility with HTML/CSV exporters.

Browser verification covers the complete Add, Modify, and Remove journeys; back/edit navigation; expert switching; local drafts; final review; adding another item; next-CR navigation; mobile layout; keyboard use; focus management; and the absence of console errors.

The supplied Order Catalog workbook is the authoritative source for Add columns and wording. The medication OEF screenshots will be used for the final built-output visual once they are reattached or otherwise available; their absence does not change the data collection sequence.

## Scope boundaries

- This phase implements the reusable engine and complete Order Catalog journey.
- It does not submit changes, write to SharePoint, approve requests, update the changelog, or alter the clinical system.
- It does not guess medication data or validate clinical correctness against external references.
- It does not yet implement the remaining CR-specific journeys; those follow one by one after this pattern is verified.
