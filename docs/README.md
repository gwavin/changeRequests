# MN-CMS Change Request Builder

This is a small static web app for preparing MN-CMS change requests. It does not send email, create Planner tasks, write to SharePoint lists, or silently save to shared folders. It keeps draft data in the user's own browser profile and lets the user download HTML and CSV outputs for the current workflow.

## Opening From a Shared Folder

Copy the full `mn-cms-cr-single-entry` folder to a shared location and open `index.html` in a browser. Keep the `assets`, `docs`, and `examples` folders beside `index.html`.

The app has no external dependencies, CDN calls, package install, or build step. It is intended to work from `file://`, a normal shared folder, or a simple static web location.

## Creating a Request

1. Open `index.html`.
2. Choose **Guide me** or **Show all fields**. You can switch at any time.
3. Choose the request type: Order Catalog, Order Sentence, IV Set, Care Plan, or SN Anaesthesia.
4. Complete the essential request and requester details.
5. Describe the outcome needed in ordinary language for each requested change.
6. Add optional technical detail where known; leave fields as **Not specified / discuss** where uncertain.
7. Confirm that no patient-identifiable information is included.
8. Review readiness and the generated filename before exporting.

The request is created for discussion and is not approved or added to the changelog by this tool. The formal number should be added later by the MN-CMS team.

Files are named automatically using `<short subject> <request type> CR - <site code> <DDMMYYYY>`, for example `Labetalol OS CR - NMH 18062026.html`.

The Order Catalog, Order Sentence, IV Set, and SN Anaesthesia item fields mirror the design columns and dropdown values from the 2026-06-05 Excel templates. The Care Plan section is still inferred because no Care Plan Excel template was supplied.

## Exporting Outputs

Available outputs:

- Download HTML review
- Download CSV

The HTML output is the preferred human-readable review format. For IV Set and SN Anaesthesia requests, it includes an EHR-style built-output preview based on the layout logic in the supplied Excel templates.

## Recommended Static Workflow

1. Complete the form.
2. Download the HTML review document and optional CSV.
3. Attach the HTML document to the Agenda item for team discussion.
4. Move accepted work through the existing Agenda/Planner process to the changelog.
5. Use the approved request for build, checking, testing, and clinical sign-off.

Suggested folder arrangement:

```text
Change Requests/
  2026/
    2026-06/
      Drafts/
      Submitted/
      Completed/
```

## Browser Limitation

Static pages cannot silently write to a shared folder because browsers block that for security. Downloads or Save As are used instead. Where supported, the app uses the browser File System Access API as a progressive enhancement; otherwise it falls back to normal downloads.

## Could This Be Hosted on GitHub?

Yes. This folder can be hosted with GitHub Pages because it is plain HTML, CSS, and JavaScript.

For a public GitHub Pages site:

1. Commit the `mn-cms-cr-single-entry` folder.
2. In GitHub, go to repository Settings > Pages.
3. Choose the branch and folder source that contains this app.
4. Link users to the published `index.html`.

Governance caution: a public GitHub Pages site is normally internet-accessible. Do not host sensitive operational details, real patient/person-identifiable data, internal credentials, or private governance material there. For internal use, prefer SharePoint static hosting or a private/internal web location if your organisation supports it.

## Responsibility Statement

All changes should be built strictly in accordance with the approved change request. The requesting site, local Informatics Pharmacist and relevant multidisciplinary/site team remain responsible for verifying that implemented changes are clinically appropriate, technically correct and safe for local use before approval and promotion.
