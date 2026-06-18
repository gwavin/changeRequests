# changeRequests

Static MN-CMS change request builder for shared-folder or static-site use.

Open `index.html` directly in a browser to create a request. The tool keeps drafts in the local browser profile and downloads:

- HTML review document
- CSV tabular data

The form supports two views of the same request:

- **Guide me** starts with plain-language intent and keeps technical template fields optional and collapsed.
- **Show all fields** opens the full build detail for experienced requesters.

Exports are enabled when the request contains enough information for team discussion. Technical fields may remain **Not specified / discuss**. Suggested filenames follow `<subject> <type> CR - <site code> <DDMMYYYY>`.

The HTML review is the preferred human-readable output. For IV Set and SN Anaesthesia requests, it includes a built-output preview based on the supplied Excel templates.

This repo should not contain real patient data, credentials, tokens, or sensitive operational material.
