# Design QA — editable IV Set preview

- Source visual truth: `codex-clipboard-058c7541-c9f1-4108-a6cb-e504112873b7.png` (Continuous Details) and `codex-clipboard-185855f4-5554-4e78-841f-be2ea24e04a8.png` (Details), supplied by Gavin.
- Implementation evidence: `implementation-continuous-final.png` and `implementation-details-final.png`, captured temporarily during QA and compared side by side with the source images.
- Viewport: 1200 × 900.
- State tested: IV Set request with NICU = Yes, ready-diluted = Yes, an additive name and dose, with both Details and Continuous Details tabs inspected.
- Full-view comparison: the complete reference windows were compared with the complete rendered editor within the change-request page.
- Focused comparison: both tab panels were also captured individually; no additional crop was needed because each relevant panel fit in the viewport.

## Findings

- Typography: dense Arial-style clinical-system typography and hierarchy match the source closely.
- Spacing and layout: the two-column Details form, compact tab strip, Continuous Details grid, weight/result strip, and instructions area follow the source structure.
- Colours: pale-blue headers, beige value cells, and yellow calculated/requested cells reproduce the visual grouping in the source.
- Image assets: no source image assets were required. Legacy toolbar icons were intentionally not copied because they would be non-functional and could misleadingly imply this is the live clinical system.
- Copy: source field labels and tab names are retained where relevant. A prominent draft warning, NICU question, ready-diluted explanation, and inline help are deliberate safety additions.
- Interaction: fields in both clinical-style panels are directly editable and remain synchronized with the underlying change-request data. Derived title and Continuous Details values update from those entries.
- Second-pass fixes: added the weight/result strip, duration units, stop/start date-time fields, replacement interval fields, and responsive layout refinements after the first comparison.
- Remaining differences are intentional P3 deviations: non-functional Offset Details/Diagnoses tabs and toolbar controls are omitted; production-only timestamps are not fabricated; surrounding change-request guidance remains visible.

final result: passed
