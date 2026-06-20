# changeRequests

Static MN-CMS change request builder for shared-folder or static-site use.

Open `index.html` directly in a browser to create a request. The tool keeps drafts in the local browser profile and downloads:

- HTML review document
- CSV review report arranged as labelled two-column sections for request details and each change item

The builder is moving to guided-only entry so users answer one clear question at a time. Order Catalog and Order Sentence now use this journey. IV Set, Care Plan, and SN Anaesthesia retain their existing forms temporarily while their dedicated guided journeys are implemented sequentially.

Order Catalog requests open as a one-question-at-a-time journey. Choosing Add, Modify, or Remove reveals only the relevant questions, while a growing summary shows the request being assembled. Add requests support multiple strengths; Modify requests distinguish the current and requested state; Remove requests require an explicit removal confirmation.

Order Sentence requests use the same guided-only approach. They collect site governance, clinical intent and reference first, then reveal prescribing details such as dose, route, frequency, PRN indication, duration, population restrictions, and current/requested wording only where relevant.

As Order Sentence details are entered, read-only OEF and CDL request mockups update beside the journey. The OEF mirrors the supplied Details and Order Comments layout; the CDL shows the selectable sentence and expected ordered display line. At final review, selecting a populated mockup field returns to its owning guided question. These are discussion mockups, not live clinical-system screens.

Only the designated medicines-team liaison for a site should submit a request. Order Catalog requests require a specific authoritative reference and the liaison's confirmation that the medication details have been checked for clinical correctness. Generic prescribing is preferred; relevant brand details are accepted. Strength information is useful, especially for multi-ingredient products, but a separate Order Sentence request will probably be needed because prescribing strengths are normally handled there.

Exports are enabled when the request contains enough information for team discussion. Technical fields may remain **Not specified / discuss**. Suggested filenames follow `<subject> <type> CR - <site code> <DDMMYYYY>`.

The HTML review is the preferred human-readable output. IV Set requests include a live, Excel-style draft visualisation in the form and the downloaded HTML; SN Anaesthesia requests include a built-output preview.

This repo should not contain real patient data, credentials, tokens, or sensitive operational material.
