---
name: fixed-missing-exports-fix
description: Fixed missing MEDICAL_MODULES and EXPERIMENT_BENCHMARKS exports in platformData.js
metadata: 
  type: feedback
  relatedFiles: MedicalDataSection.jsx, ExperimentPreview.jsx
  error: "[MISSING_EXPORT] \"MEDICAL_MODULES\" is not exported by \"src/data/platformData.js\" and \"[MISSING_EXPORT] \"EXPERIMENT_BENCHMARKS\" is not exported by \"src/data/platformData.js\""
---

Fixed the missing export errors in src/data/platformData.js that were causing build failures in MedicalDataSection.jsx and ExperimentPreview.jsx.

The issue was that the components were importing MEDICAL_MODULES and EXPERIMENT_BENCHMARKS from ../data/platformData, but these exports were not defined in the file.

The fix involved adding two new export constants to the end of src/data/platformData.js:

1. MEDICAL_MODULES - An array of 5 medical research module objects with id, icon, dimension, name, description, and target properties
2. EXPERIMENT_BENCHMARKS - An object containing quantum advantage, clinical validation, and resource efficiency benchmark data

After adding these exports, the frontend now builds successfully:
- ✓ Built in 1.06s
- All assets properly compiled and compressed
- No more missing export errors

Related fixes:
- Previously fixed JSX adjacent elements error in InteractiveDemoModal.jsx by adding missing closing brace for backend status conditional