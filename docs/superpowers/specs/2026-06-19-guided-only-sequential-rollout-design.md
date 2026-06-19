# Guided-only sequential rollout design

## Objective

Make one-question-at-a-time entry the only user experience while retaining all five change-request types. Remove expert/full-form choices and adapt each request type deliberately rather than exposing every technical field at once.

## Rollout sequence

The journeys will be delivered and reviewed in this order:

1. Order Catalog — already implemented; remove its expert escape.
2. Order Sentence — first new guided-only journey.
3. IV Set.
4. Care Plan.
5. SN Anaesthesia.

Each phase reuses the existing journey navigation, summary, local-draft, validation, review, and export infrastructure. Its questions and branch logic remain specific to that request type.

## Transitional behaviour

The “How much guidance would you like?” panel and all “show full form” controls are removed once the Order Sentence journey is ready. Order Catalog and Order Sentence then use guided-only entry. The remaining types stay available and retain their current functional form temporarily until their guided journeys are delivered; they must not become inaccessible or lose data merely to create visual consistency.

This is a deliberate transitional exception. The final state has no conventional full form for any request type.

## Order Sentence phase

The Order Sentence journey begins with requesting site and designated medicines-team liaison, consistent with Order Catalog governance. It then collects one answer at a time, progressively revealing only relevant questions for Add, Modify, or Remove.

The journey will distinguish the requested prescribing sentence from Order Catalog work. It will collect the clinical intent, authoritative reference, current and requested sentence where applicable, dose/strength, route, frequency, PRN indication, duration, age/weight or other filters, defaults, and safety restrictions only when relevant. Users may state that a technical detail needs medicines-team discussion where exact build syntax is uncertain.

The liaison must confirm clinical correctness against the authoritative reference and confirm that no patient-identifiable information is included. These confirmations record requester assurance and do not replace medicines-team review or approval.

The final review presents a human-readable assembled sentence and clearly labels unresolved technical details. Existing HTML and Excel-safe CSV outputs remain available.

## Data compatibility

Existing request objects and schema keys remain the source of truth. Guided answers map to existing fields where possible. New fields are added only when current/requested values or confirmations cannot be represented safely.

Older local drafts continue to load. Values from fields no longer shown remain preserved in storage and exports rather than being silently deleted.

## Accessibility and interaction

Each screen contains one primary question, Back and Continue controls, visible progress, a growing summary, keyboard-accessible structured choices, and clear required/optional wording. There is no expert-mode escape. Focus moves to the new question after navigation, and narrow screens avoid horizontal scrolling.

## Verification

Each phase requires test-first coverage of question sequence, conditional branches, validation, draft recovery, output data, and the absence of expert controls. Browser checks cover the complete paths, back/edit behaviour, mobile layout, keyboard operation, and console errors before merge.

## Safety and governance

The application remains a discussion-request builder, not an approval or implementation mechanism. It stores drafts locally, does not verify liaison identity, and must not contain patient-identifiable information, credentials, or sensitive clinical-system material.
