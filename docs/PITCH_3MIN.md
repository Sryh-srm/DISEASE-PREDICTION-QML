# 3-Min Pitch — Hybrid Quantum-Classical Disease Predictor
**Goal: win even if judge doesn't know quantum. Honest tie > fake win.**

---

### 0:00-0:25 — HOOK (Problem)
> "Every year heart disease kills 18 million, but diagnosis is still 13 vitals on a chart and a doctor's gut. Classical AI already does 85% — but how do you know it's not cheating by peeking at the test? We built a predictor that ties the best classical *for free* with quantum, and you can verify it live in 2 minutes."

**Slide:** Patient → 13 vitals → Risk gauge

### 0:25-0:50 — SOLUTION (What we built)
> "One app: QML frontend for patients, FastAPI backend on localhost:8000, stacked hybrid committee inside. You enter 13 values, get probability + Low/Moderate/High + why — top 6 features with bars — and Batch CSV scoring. Run: `python frontend/run_ui.py` — one command starts API + UI."

**Slide:** Screenshot of UI + `Batch Score CSV -> heart_combined.csv 918 rows`

### 0:50-1:20 — HOW IT WORKS (Quantum for non-quantum judge)
> "Classical looks at one pattern at a time. Quantum with 4 qubits looks at 16 patterns at once — like 4 coins flipping together. We use 4 qubits on purpose: `2^4=16` amplitudes = trains in 5 min on a laptop, predicts in 20 ms. `2^13=8192` would be 512x more expensive for data classical already solves — so we stayed cheap. Three real quantum models inside — Quantum Kernel SVM, Bagged VQC, VQC — plus tuned SVM/LR, stacked by a meta-learner trained only on out-of-fold predictions — no test peeking."

**Slide:** 4 circles = 4 qubits → 16 states vs 13 qubits expensive; diagram: Impute→Scale→ANOVA top-4→[0,π]→ Quantum + Classical → Stack

### 1:20-1:55 — RESULTS (Honest Tie)
> "On Cleveland 303 patients, official 80/20 split 242 train / 61 test, random_state=42, hybrid gets 85.25% — 52 of 61. Best classical tuned SVM also 85.25% — it's a tie. On our expanded 918 real patients from 4 UCI sources, 734/184, cheapest 4-qubit also ties at 79.89% — 147 of 184. With all 13 features classical ceiling is 84.78% vs stacked 84.24% — still within 1 patient. That's `n=61 ±5%, n=184 ±3.2%` — one patient is noise. We report tie, not fake 87%."

**Slide:** Table Cleveland 85.25% = SVM 85.25% TIE | Combined 79.89% = KNN 79.89% TIE @4q | Note: 86.88% @test-thr 0.67 and 85.87% @test-thr 0.39 are leakage — not headline

### 1:55-2:25 — VERIFIED, NOT FAKED (Your moat)
> "Anyone can claim 90%. We prove no leakage — same protocol as research: preprocessor fit train-only, GridSearchCV 5-fold train-only, threshold tuned on OOF train folds only, ONE test evaluation. Run live: `./venv/Scripts/python.exe scripts/verify_accuracy.py` → PASS 52/61 + 8/8 clinical flips. `verify_combined.py` → same for 918. `verify_no_leakage.py 1 3` → P1+P3 PASS, canaries ~chance. Most teams leak by tuning threshold on test — we flag that as ceiling, not result."

**Slide:** Terminal recording 10 sec of verify_accuracy PASS; mention AUDIT.md

### 2:25-2:55 — COST & WHY QUANTUM IF TIE (Kill the objection before they ask)
> "Why quantum if tie? Three reasons: 1) Pure quantum ensemble alone already 83.61% = RF 83.61% — quantum matches classical for free. 2) It's quantum-ready — same pipeline scales when data gets 100s of complex features where classical kernels fail; heart's 13 vitals are just too easy. 3) It's cheap — we didn't go 13 qubits for +5% that ET already gets. Live demo now — fill a healthy 45-year-old → 13% Low, flip exang 0→1 → jumps to 27% — model reacts clinically, not randomly."

**Demo:** frontend/run_ui.py live or `curl -X POST http://localhost:8000/predict/csv -F file=@data/heart.csv`

### 2:55-3:00 — CLOSE
> "Headline: ties best classical leakage-free on 303 + 918, 4-qubit cheap, verified in 2 min, runs on a laptop. Not strictly beats — matches-or-exceeds and ready for what's next. Code is on GitHub — clone, `pip install -r requirements-lock.txt`, `python frontend/run_ui.py`."

---

## Backup Q&A (30 sec each)

**Q: Why not 87-88%?**
n=61 → 52/61 to 53/61 is 85.25% to 86.88% — one patient. Mean over random splits is ~80% ±2.5%. Leakage-free 87% via OOF expansion is inside noise and needs 25 min deeper committee — still tie, dilutes quantum signal.

**Q: Why not use Breast 98%?**
Breast 569x30 is trivial — SVM 98.25% vs hybrid 97.37% @30 features is also a tie, but hybrid loses 1 patient and it's not heart. Absolute 98% is easier data, not quantum win. We keep heart headline + breast as appendix `docs/breast_benchmark.log`.

**Q: Need bigger dataset to win?**
303→918 3x bigger stayed tie at 79.89% @4q. More rows only shrinks CI from ±5% to ±3.2% — proves tie, doesn't create win. Need complex features, not more rows of 13 vitals. See FAQ in README.

**Q: Can I reproduce?**
`git clone https://github.com/kumarharshzzz04/qml-disease-prediction` → `py -3.11 -m venv venv; venv\Scripts\activate; pip install -r requirements-lock.txt` → `python frontend/run_ui.py` and `python scripts/verify_accuracy.py`

---

**Timer cue:** Practice at 135 wpm = ~405 words = 3:00. Cut HOOK to 20 sec if demo runs long.
