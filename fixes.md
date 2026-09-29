# QML UI Fixes

This document contains the UI/UX changes identified during a review of the
current QML heart-disease prediction application.

Reference screenshots are stored in the project root under:

```text
issues/
├── issue1.jpg
├── issue2.jpg
├── issue3.jpg
├── issue4.jpg
├── issue5.jpg
├── issue6.jpg
└── issue7.jpg
```

> If `issue7` was saved with a different extension, use the actual filename
> present in the `issues/` folder.

---

## Global Instructions

These changes are **frontend/UI and presentation fixes only**.

### IMPORTANT — DO NOT BREAK THE PROJECT

- Do NOT modify the ML/QML model architecture or training code.
- Do NOT modify model weights, preprocessing, feature engineering, or datasets.
- Do NOT change prediction/inference logic.
- Do NOT change existing API contracts unless a UI fix absolutely requires it.
- Do NOT fabricate model results, patient data, metrics, or clinical information.
- Reuse existing backend/API/data sources wherever possible.
- Do NOT rerun expensive model training simply to populate the UI.
- Preserve all currently working functionality.
- Avoid introducing unnecessary dependencies.
- Keep the existing dark, technical, clinical/quantum visual language.
- Make the smallest clean changes necessary while improving the presentation.
- After implementing the fixes, run the frontend and check for compilation,
  runtime, and navigation errors.
- Verify every issue listed below before considering the task complete.

The screenshots are **references for the requested changes**, not instructions
to copy their exact appearance.

---

# Issue 1 — Research Modalities Cards

**Reference:** `issues/issue1.jpg`

### User feedback

> "Waha pe unwanted cheez hata de and add karna hai waiting for data /
> still research / building"

### Current issue

The Research Modalities section contains several empty/unpopulated fields
inside the modality cards, including items such as:

- Quantum Kernel Mechanism
- Parameterized Channels
- Benchmark Delta
- Cost

These empty fields create visual clutter and make the cards look incomplete.

### Requested change

Remove the unnecessary empty/placeholder information from the modality cards
and replace it with concise status information communicating the current state
of each modality.

Possible status wording includes:

- `Waiting for Data`
- `Still in Research`
- `In Development`
- `Building`

### Requirements

- Inspect the existing application data/configuration and determine the most
  appropriate status for each modality where possible.
- Do not blindly assign the same status to every modality if their actual
  states differ.
- Do not fabricate experimental results or metrics.
- Keep the existing card layout, typography, colors, borders, and overall
  visual language.
- Ensure the cards remain visually balanced after removing the unused fields.

---

# Issue 2 — Scientific Integrity / Final ML + Hybrid Result

**Reference:** `issues/issue2.jpg`

### User feedback

> "Waha pe add karna hai final will be ML + hybrid result"

### Current issue

The "Scientific Integrity" section currently contains explanatory cards such
as:

- Exploring Privacy-Preserving Representations
- Quantum Shapley Attributions
- Comparing Against Classical Baselines
- Auditable Research Protocols

However, the section does not clearly present the final result produced by
the ML + Hybrid approach.

### Requested change

Add a clearly visible UI element in this section showing the **final ML +
Hybrid result**.

The result should fit naturally into the existing section and be visually
clear enough for a user to identify the final hybrid outcome.

### Requirements

- Inspect the repository and existing result/evaluation data first.
- Use the actual existing ML + Hybrid result if it is already available.
- Do NOT invent or hard-code a performance value.
- Do NOT change the underlying ML/QML calculation.
- This is a presentation/UI change only.
- Keep the existing dark scientific design and visual hierarchy.
- If the result is not currently exposed by the application, create the UI
  structure needed to display it without fabricating a value.

---

# Issue 3 — Comprehensive Model Comparison

**Reference:** `issues/issue3.jpg`

### User feedback

> "Here we want a more elaborative comparison of all models. We have used
> 6 or 7 models. We want all of them to be here."

### Current issue

The Research Benchmarks section currently focuses mainly on:

- Classical baseline — Random Forest
- Hybrid Quantum — Quantum + Classical Committee

This does not represent all of the models evaluated during the project.

### Requested change

Expand the model evaluation section into a comprehensive comparison of
**ALL models that were actually evaluated in the project**.

The UI should make it easy to compare the models side-by-side.

A suitable structure could be a table containing columns such as:

| Model | Type | Accuracy | Precision | Recall | F1 Score |
|---|---|---:|---:|---:|---:|

The exact columns should be based on the metrics that actually exist in the
project.

### Requirements

1. Inspect the repository and existing experiment/evaluation results.
2. Identify every model that was actually trained/evaluated.
3. Include all relevant models in the comparison.
4. Clearly distinguish:
   - Classical models
   - Quantum models
   - Hybrid models
5. Display all relevant metrics that are actually available.
6. Make the comparison easy to scan.
7. Preserve the existing visual language.
8. Keep the Hybrid Quantum result prominently represented.

### IMPORTANT

- Do NOT invent model names.
- Do NOT invent performance values.
- Do NOT rerun expensive training just to populate the UI.
- Use existing evaluation results/artifacts/API data.
- If a metric is genuinely unavailable, display `N/A` or `Not available`.
- Do not modify the underlying model/evaluation implementation merely to make
  the UI look complete.

Prefer a data-driven implementation rather than hard-coded UI values so the
comparison remains consistent with the project's actual evaluation results.

---

# Issue 4 — Remove Unwanted Mathematical Formula

**Reference:** `issues/issue4.jpg`

### User feedback

> "Unwanted formula hata do"

### Current issue

The Medical Data Acquisition section contains a "MATHEMATICAL FORMULATION"
block showing the raw LaTeX expression:

```text
\mathbf{x}_{raw} \in \mathbb{R}^{n \times 13}
```

This formula is unnecessary for the current presentation.

### Requested change

Remove the entire Mathematical Formulation block, including:

- The "MATHEMATICAL FORMULATION" heading
- The formula itself
- Any unnecessary container/spacing associated with it

### Requirements

- Rebalance the surrounding layout after removing the block.
- Avoid leaving a large awkward empty area.
- Preserve the remaining content.
- Do not replace it with another formula.
- Do not modify the underlying data acquisition or preprocessing logic.

---

# Issue 5 — Redundant Theory-to-Experiment Transition

**Reference:** `issues/issue5.jpg`

### User feedback

> "Remove it if it's truly repetitive."

### Current section

The screen contains a large transition/CTA message:

> THE THEORY ENDS HERE.  
> LET'S RUN THE EXPERIMENT.

with an:

> OPEN THE PLATFORM

button.

### Requested change

Determine whether this transition screen is genuinely useful or merely
repetitive.

### Requirements

Before removing it:

1. Inspect the application's navigation flow.
2. Check the surrounding sections.
3. Determine whether this screen provides unique information or a useful
   transition into the interactive clinical workbench.

### If it is genuinely repetitive

Remove the section cleanly.

Ensure that:

- Navigation to the interactive platform still works.
- No dead/broken button remains.
- No broken route remains.
- No awkward blank section is left behind.

### If it serves a meaningful purpose

Keep it rather than removing it unnecessarily.

Only make changes if required for consistency or usability.

**Do not remove this section solely because it looks like a transition page.**

---

# Issue 6 — Demo Case / Patient Profile Presentation

**Reference:** `issues/issue6.jpg`

### User feedback

> "Jo demo case likha hai usko data karna hai, jaise demo case high risk
> patient ko 2 kar de, niche h3"

### Current issue

The Clinical Quantum Inference Workbench currently displays demo cases as
large blocks of descriptive text.

The current presentation is difficult to scan and consumes substantial
vertical space.

### Requested change

Restructure the demo-case presentation so the cases are represented as
concise, structured patient/demo data instead of large paragraphs.

The requested presentation should include:

- Two High-Risk Patient demo cases.
- Clear, structured patient information.
- Appropriate heading/subheading hierarchy, including the requested H3
  presentation where appropriate.
- Concise information that is easy to scan.

### Requirements

- Inspect the existing demo-case data/configuration first.
- Reuse the actual demo-case values already defined by the project.
- Do NOT invent clinical values.
- Do NOT change the prediction/inference logic.
- Do NOT alter the backend data model unless absolutely necessary for the
  presentation.
- Preserve the ability to select/load a demo case.
- Keep enough information visible for the user to understand what case they
  are selecting.

The goal is to improve the presentation of the existing demo data, not to
create fictional patient profiles.

---

# Issue 7 — Clinical Feature Input UI Polish

**Reference:** `issues/issue7.jpg`

### User feedback

> "Isko thora theek, button bhi"

### Current issue

The "Enter Clinical Features" section currently looks visually unpolished.

Problems include:

- Browser-default-looking input controls
- Inconsistent input/select sizing
- Tight spacing between labels and controls
- Weak visual hierarchy
- Action buttons that visually run together
- Overall presentation that does not match the rest of the application's
  polished dark clinical/quantum aesthetic

### Requested change

Improve the overall UI/UX of the Clinical Feature Input section.

### Form improvements

- Improve spacing and alignment between labels and controls.
- Make input fields visually consistent.
- Make dropdowns visually consistent.
- Give controls appropriate widths.
- Improve typography and hierarchy.
- Make the 13 required inputs easier to scan.
- Keep the existing dark/technical/clinical visual language.
- Ensure focus and interaction states are clear.

### Button improvements

The two actions should be clearly separated and visually distinct:

**Primary action:**
`RUN SIMULATION (DEMO)`

**Secondary action:**
`LOAD DEMO CASE`

Improve:

- Spacing
- Padding
- Typography
- Borders/background
- Hover state
- Focus state
- Clickability/visual affordance

The primary simulation action should have stronger visual emphasis than the
secondary demo-loading action.

### IMPORTANT

- Preserve all 13 clinical input fields.
- Preserve their existing values/options and encoding.
- Preserve feature order.
- Preserve simulation behavior.
- Preserve demo-case loading behavior.
- Do NOT change preprocessing.
- Do NOT change API behavior.
- Do NOT change prediction logic.
- Do NOT change the model implementation.

This should be a frontend/UI improvement only.

Do not over-redesign the page. It should remain visually consistent with the
rest of the application.

---

# Final Verification Checklist

After implementing all seven issues, perform a complete frontend verification.

## Functional checks

- [ ] Application starts successfully.
- [ ] No frontend compilation errors.
- [ ] No browser console/runtime errors introduced.
- [ ] Navigation still works.
- [ ] Demo cases can still be selected/loaded.
- [ ] All 13 clinical inputs are still available.
- [ ] Simulation button still triggers the existing simulation.
- [ ] Existing API communication remains functional.
- [ ] Prediction/inference behavior has not been changed.

## UI checks

- [ ] Research Modalities no longer contain unnecessary empty fields.
- [ ] Appropriate modality statuses are displayed.
- [ ] Final ML + Hybrid result is visible where requested.
- [ ] All actually evaluated models are represented in the comparison.
- [ ] Existing evaluation values are preserved and not fabricated.
- [ ] Mathematical formulation block is removed.
- [ ] Theory-to-experiment transition is removed only if genuinely redundant.
- [ ] Demo cases are presented in a more structured/compact way.
- [ ] Two High-Risk Patient demo cases are represented as requested.
- [ ] Clinical feature inputs have improved spacing and styling.
- [ ] RUN SIMULATION and LOAD DEMO CASE are visually distinct.
- [ ] Overall visual consistency with the existing dark clinical/quantum theme
      is maintained.

## Scope check

Before finishing, review the git diff and make sure the changes are limited
to the requested UI/presentation work.

Do NOT leave unrelated refactors, model changes, dataset changes, or
experimental modifications in the repository.

Finally, report:

1. Files changed
2. What was fixed for each of the seven issues
3. Any issue that could not be implemented
4. Any assumptions made
5. Any potential follow-up UI issue discovered during verification
