# changeRequests

Static MN-CMS change request builder for shared-folder or static-site use.

Open `index.html` directly in a browser to create a request. The tool keeps drafts in the local browser profile and downloads:

- HTML review document
- CSV review report arranged as labelled two-column sections for request details and each change item

The form supports two views of the same request:

- **Guide me** starts with plain-language intent and keeps technical template fields optional and collapsed.
- **Show all fields** opens the full build detail for experienced requesters.

Order Catalog requests now open as a one-question-at-a-time journey. Choosing Add, Modify, or Remove reveals only the relevant questions, while a growing summary shows the request being assembled. Users can switch to the full form without losing entered information. Add requests support multiple strengths; Modify requests distinguish the current and requested state; Remove requests require an explicit removal confirmation.

Only the designated medicines-team liaison for a site should submit a request. Order Catalog requests require a specific authoritative reference and the liaison's confirmation that the medication details have been checked for clinical correctness. Generic prescribing is preferred; relevant brand details are accepted. Strength information is useful, especially for multi-ingredient products, but a separate Order Sentence request will probably be needed because prescribing strengths are normally handled there.

Exports are enabled when the request contains enough information for team discussion. Technical fields may remain **Not specified / discuss**. Suggested filenames follow `<subject> <type> CR - <site code> <DDMMYYYY>`.

The HTML review is the preferred human-readable output. IV Set requests include a live, Excel-style draft visualisation in the form and the downloaded HTML; SN Anaesthesia requests include a built-output preview.

This repo should not contain real patient data, credentials, tokens, or sensitive operational material.
