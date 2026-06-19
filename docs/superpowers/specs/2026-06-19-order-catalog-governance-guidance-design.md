# Order Catalog governance and guidance amendment

## Purpose

Make the Order Catalog journey reflect the medicines team's submission and clinical-review process while keeping entry simple for authorised site liaisons.

## Journey sequence

The first questions identify the requesting site and the medicines-team liaison. The interface states that only the designated medicines-team liaison for that site may submit a change request. The liaison supplies their name; no work email address, telephone number, or other contact field is requested.

The remaining branch-specific questions follow after this governance context. Existing site codes and populated hospital names remain unchanged.

## Clinical evidence and confirmation

The existing reference dropdown and conditional reference-detail question become one required free-text question:

> What authoritative reference did you use to confirm this request is clinically correct?

The form explains that the answer should identify a source precisely enough for the medicines team to review it. “Not checked” and “not sure” are not offered as valid completed answers.

The prospective testing-method question is removed. Near final review, the liaison must explicitly confirm that they have checked the clinical correctness of the requested medication details against the stated authoritative reference. This records requester assurance; it does not replace medicines-team review, technical validation, or approval.

## Medication wording

Generic prescribing is the stated preference. Brand information remains optional and should be supplied only when clinically or operationally relevant.

Strength remains requested for Add changes, particularly to disambiguate multi-ingredient preparations. Guidance explains that prescribing strengths are normally configured in Order Sentences, so a separate Order Sentence change request will probably also be required. The review summary preserves this warning where strength information is supplied.

The synonym/“other names” question is removed from the guided journey because the team does not currently want requesters proposing alternative search names. Existing draft data is retained in storage and expert output rather than destructively deleted.

## Data compatibility

The combined reference answer uses the existing `referenceChecked` field. Older drafts containing a detailed reference continue to satisfy the question. A legacy `referenceState` value alone does not count as a sufficiently specific authoritative reference.

The clinical-correctness confirmation adds a boolean item field. The removed work-contact, validation-method, and synonym questions are no longer collected by the guided journey. Existing values remain available in older drafts and exports to avoid silent data loss.

## Validation and testing

Discussion readiness requires:

- an approved requesting site;
- the medicines-team liaison’s name;
- a specific authoritative reference;
- explicit clinical-correctness confirmation;
- the existing privacy confirmation; and
- all applicable Add, Modify, or Remove branch requirements.

Automated tests cover sequence, removed questions, reference compatibility, clinical confirmation, and all three action branches. Browser checks cover the revised opening, wording, review state, expert-mode preservation, and narrow-screen layout.

## Safety and governance

The application does not identify or verify the designated liaison against a staff directory. Its wording records the submitter’s assertion and makes the governance rule explicit. No staff contact directory, patient data, credentials, or sensitive operational information is introduced.
