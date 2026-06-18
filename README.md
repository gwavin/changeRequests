# changeRequests

Static MN-CMS change request builder for shared-folder or static-site use.

Open `index.html` directly in a browser to create a request. The tool keeps drafts in the local browser profile and downloads:

- HTML review document
- CSV tabular data

The HTML review is the preferred human-readable output. For IV Set and SN Anaesthesia requests, it includes a built-output preview based on the supplied Excel templates.

This repo should not contain real patient data, credentials, tokens, or sensitive operational material.

## GitHub Pages

Public URL: https://gwavin.github.io/changeRequests/

Configure **Settings → Pages → Build and deployment** as follows:

- Source: **Deploy from a branch**
- Branch: **main**
- Folder: **/(root)**
- Custom domain: leave blank unless a real, owned domain is deliberately configured

Do not commit patient data, credentials, tokens, screenshots from clinical systems, or sensitive operational material.
