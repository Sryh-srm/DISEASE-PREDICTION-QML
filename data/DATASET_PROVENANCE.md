# Combined Heart Disease Dataset — Provenance
**Generated:** 2026-09-29T07:24:09.687668+00:00
**Output:** `data/heart_combined.csv` (918 rows after dedup)
**Source untouched:** `data/heart.csv`

| Source | File | Rows |
|---|---|---|
| cleveland | processed.cleveland.data | 303 |
| hungarian | processed.hungarian.data | 294 |
| switzerland | processed.switzerland.data | 123 |
| va | processed.va.data | 200 |

Total before dedup: 920, duplicates removed: 2, after: 918

## Missing per column (after dedup)
| Column | cleveland | hungarian | switzerland | va | Combined |
|---|---|---|---|---|---|
| age | 0 | 0 | 0 | 0 | 0 |
| sex | 0 | 0 | 0 | 0 | 0 |
| cp | 0 | 0 | 0 | 0 | 0 |
| trestbps | 0 | 1 | 2 | 56 | 59 |
| chol | 0 | 23 | 0 | 7 | 29 |
| fbs | 0 | 8 | 75 | 7 | 90 |
| restecg | 0 | 1 | 1 | 0 | 2 |
| thalach | 0 | 1 | 1 | 53 | 55 |
| exang | 0 | 1 | 1 | 53 | 55 |
| oldpeak | 0 | 0 | 6 | 56 | 62 |
| slope | 0 | 190 | 17 | 102 | 307 |
| ca | 4 | 291 | 118 | 198 | 609 |
| thal | 2 | 266 | 52 | 166 | 484 |
| target | 0 | 0 | 0 | 0 | 0 |

Target: 0=410 1=508
Expected 920 before dedup (303+294+123+200); actual 920->918
- Column order from backend/preprocess.py; run python data/build_combined.py to regenerate.