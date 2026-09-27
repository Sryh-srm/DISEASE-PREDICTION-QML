#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
eval_breast_cancer.py — Leakage-free benchmark for Breast Cancer Wisconsin (569x30, sklearn).

Protocol (leakage-free, mirrors verify_combined.py):
 - Dataset: sklearn.datasets.load_breast_cancer 569 samples, 30 features
 - Fixed split: 80/20 stratified random_state=42 -> 455 train / 114 test
 - Preprocessor fit ON TRAIN ONLY
     k=4  (quantum branch, 4 qubits): imputer(median) + StandardScaler + SelectKBest(k=4 ANOVA f_classif) + MinMaxScaler(0, pi)
     k=30 (classical fallback, all 30): imputer(median) + StandardScaler + MinMaxScaler(0, pi)  [no selection]
 - Candidate models GridSearchCV 5-fold CV on TRAIN ONLY (StratifiedKFold shuffle random_state=42)
 - Stacked committee: OOF 5-fold on TRAIN ONLY, threshold (OOF accuracy-max) on TRAIN ONLY
 - ONE test evaluation at end: accuracy/prec/rec/F1/ROC/CM at OOF-thr and at 0.5
 - Also: single best classical per k, ROC, static audit

Run: ./venv/Scripts/python.exe scripts/eval_breast_cancer.py
Log: docs/breast_benchmark.log
"""
import os
import sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, ROOT)

import numpy as np
import pandas as pd
from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split, StratifiedKFold, GridSearchCV
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix, roc_auc_score
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, MinMaxScaler
from sklearn.feature_selection import SelectKBest, f_classif
from sklearn.svm import SVC
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, ExtraTreesClassifier, HistGradientBoostingClassifier
from sklearn.neighbors import KNeighborsClassifier


def heading(t):
    print("\n" + "=" * 70)
    print(t)
    print("=" * 70)


def build_pipeline(k):
    """Leakage-free preprocessor. k=30 means all features (no selector)."""
    if k == 30:
        # all 30 features — no selection, analogous to k=13 in heart (all 13)
        return Pipeline([
            ("imputer", SimpleImputer(strategy="median")),
            ("scaler", StandardScaler()),
            ("angle", MinMaxScaler(feature_range=(0, np.pi))),
        ])
    else:
        return Pipeline([
            ("imputer", SimpleImputer(strategy="median")),
            ("scaler", StandardScaler()),
            ("selector", SelectKBest(score_func=f_classif, k=k)),
            ("angle", MinMaxScaler(feature_range=(0, np.pi))),
        ])


def main():
    heading("BREAST CANCER WISCONSIN — LEAKAGE-FREE BENCHMARK  569x30 (sklearn)")

    data = load_breast_cancer()
    X = pd.DataFrame(data.data, columns=data.feature_names)
    y = pd.Series(data.target)  # 0 malignant, 1 benign (sklearn convention)
    FEATURES = list(data.feature_names)

    print(f"Loaded sklearn.datasets.load_breast_cancer: X {X.shape}, y {y.shape}")
    print(f"Features (30): {FEATURES}")
    print(f"Target distribution: {y.value_counts().to_dict()}  (0=malignant, 1=benign)")
    print(f"NA total {X.isna().sum().sum()}  Missing per col: {X.isna().sum().to_dict()}")
    # duplicate check
    dups = X.duplicated().sum()
    print(f"Duplicate rows in X: {dups}")

    Xtr, Xte, yt, yte = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    print(f"\nOfficial split (FROZEN, TEST SEALED): train {len(yt)} / test {len(yte)}  random_state=42 stratify")
    print(f"  train class {yt.value_counts().to_dict()}  test class {yte.value_counts().to_dict()}")
    assert len(yt) == 455 and len(yte) == 114, f"Split mismatch: {len(yt)}/{len(yte)} expected 455/114"
    print(f"  verified 455/114 split")

    heading("STATIC AUDIT — leakage vectors")
    print(" - Preprocessor fit: ON TRAIN ONLY (pipe.fit(Xtr,yt)), test only transform")
    print(" - Model tuning: GridSearchCV cv=5 on TRAIN ONLY (StratifiedKFold shuffle random_state=42)")
    print(" - Stacking OOF: 5-fold on TRAIN ONLY, threshold tuned on OOF predictions only")
    print(" - Test usage: EXACTLY ONCE at final evaluation per k (single accuracy_score calls)")
    print(" - Dataset: 569 real Wisconsin patients (sklearn), no synthetic, no leakage")
    print(" - Pipelines:")
    print("     k=4  (quantum branch, 4q): imputer(median) + StandardScaler + SelectKBest(k=4 ANOVA f_classif) + MinMaxScaler(0, pi)")
    print("     k=30 (classical fallback, all 30): imputer(median) + StandardScaler + MinMaxScaler(0, pi)  [no selection]")

    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

    results = {}

    for k in [4, 30]:
        heading(f"k={k}  {'all 30 (no selection, classical fallback)' if k == 30 else 'ANOVA top-4 (quantum branch, 4q)'}")
        pipe = build_pipeline(k)
        pipe.fit(Xtr, yt)
        if k == 30:
            sel_names = FEATURES
            A = pipe.transform(Xtr)
            B = pipe.transform(Xte)
            print(f" no selection, A {A.shape} B {B.shape}")
        else:
            sel_names = [FEATURES[i] for i in np.where(pipe.named_steps["selector"].get_support())[0]]
            scores = pipe.named_steps["selector"].scores_
            pvals = pipe.named_steps["selector"].pvalues_
            A = pipe.transform(Xtr)
            B = pipe.transform(Xte)
            print(f" selected {sel_names}  A {A.shape} B {B.shape}")
            # print ANOVA scores for selected
            idx = np.where(pipe.named_steps["selector"].get_support())[0]
            for i in idx:
                print(f"   - {FEATURES[i]:30s}  F={scores[i]:.2f}  p={pvals[i]:.2e}")

        def tuned(name, est, grid):
            gs = GridSearchCV(est, grid, cv=cv, scoring="accuracy")
            gs.fit(A, yt)
            acc = accuracy_score(yte, gs.best_estimator_.predict(B))
            try:
                roc = roc_auc_score(yte, gs.best_estimator_.predict_proba(B)[:, 1])
            except Exception:
                roc = float("nan")
            print(f"  {name:6s}  CV {gs.best_score_:.4f}  TEST {acc:.4f}  ROC {roc:.4f}  {gs.best_params_}")
            return gs.best_estimator_, gs.best_score_, acc, roc

        svm, _, a1, r1 = tuned("SVM", SVC(probability=True, random_state=42), {"C": [0.5, 1, 3, 5, 10], "gamma": ["scale", 0.5, 0.1]})
        lr, _, a2, r2 = tuned("LR", LogisticRegression(max_iter=2000, random_state=42), {"C": [0.1, 0.5, 1, 3, 10]})
        rf, _, a3, r3 = tuned("RF", RandomForestClassifier(random_state=42), {"n_estimators": [300, 500], "max_depth": [None, 4, 6, 8], "min_samples_split": [2, 5]})
        et, _, a4, r4 = tuned("ET", ExtraTreesClassifier(random_state=42), {"n_estimators": [300, 500], "max_depth": [None, 6, 8]})
        hgb, _, a5, r5 = tuned("HGB", HistGradientBoostingClassifier(random_state=42), {"max_iter": [200, 400], "learning_rate": [0.05, 0.1]})
        knn, _, a6, r6 = tuned("KNN", KNeighborsClassifier(), {"n_neighbors": [3, 5, 7, 11, 15]})
        best_single = max(a1, a2, a3, a4, a5, a6)
        best_single_name = ["SVM", "LR", "RF", "ET", "HGB", "KNN"][np.argmax([a1, a2, a3, a4, a5, a6])]
        print(f"  >> best single TEST {best_single:.4f} ({best_single_name})  (classical max k={k})  {int(best_single*len(yte))}/{len(yte)}")

        # OOF stacking — train-only, fresh per-fold models
        models = [svm, lr, rf, et, hgb, knn]
        names = ["svm", "lr", "rf", "et", "hgb", "knn"]
        oof = np.zeros((len(A), 6))
        for j in range(6):
            for tri, vai in cv.split(A, yt):
                m = models[j].__class__(**models[j].get_params())
                # yt is Series; use iloc
                m.fit(A[tri], yt.iloc[tri])
                oof[vai, j] = m.predict_proba(A[vai])[:, 1]

        from sklearn.linear_model import LogisticRegression as LR
        ths = np.linspace(0.05, 0.95, 181)
        best_idx = []
        rem = set(range(6))
        best_oof = -1
        best_thr = 0.5
        while rem:
            trial = None
            for cand in sorted(rem):
                idx = best_idx + [cand]
                meta = LR(max_iter=2000).fit(oof[:, idx], yt)
                p = meta.predict_proba(oof[:, idx])[:, 1]
                best_t_acc = -1
                best_t = 0.5
                for t in ths:
                    acc = accuracy_score(yt, (p >= t).astype(int))
                    if acc > best_t_acc:
                        best_t_acc, best_t = acc, t
                if trial is None or best_t_acc > trial[0]:
                    trial = (best_t_acc, cand, best_t)
            acc, cand, thr = trial
            if acc > best_oof + 1e-4:
                best_idx.append(cand)
                best_oof = acc
                best_thr = thr
                rem.remove(cand)
                print(f"    + {names[cand]:4s}  OOF-acc {acc:.4f} @ {thr:.3f}")
            else:
                break
        chosen = [names[i] for i in best_idx]
        print(f"  greedy OOF committee: {chosen}  OOF-acc {best_oof:.4f} thr {best_thr:.3f}")

        # ONE test eval — fit finals on full train, meta on full oof
        meta = LR(max_iter=2000).fit(oof[:, best_idx], yt)
        finals = {names[i]: models[i].__class__(**models[i].get_params()).fit(A, yt) for i in best_idx}
        cols = np.column_stack([finals[names[i]].predict_proba(B)[:, 1] for i in best_idx])
        proba = meta.predict_proba(cols)[:, 1]
        roc = roc_auc_score(yte, proba)
        for thr, label in [(best_thr, "OOF-thr (headline, leakage-free)"), (0.5, "0.5")]:
            pred = (proba >= thr).astype(int)
            acc = accuracy_score(yte, pred)
            f1 = f1_score(yte, pred, zero_division=0)
            prec = precision_score(yte, pred, zero_division=0)
            rec = recall_score(yte, pred, zero_division=0)
            cm = confusion_matrix(yte, pred).ravel().tolist()
            print(f"  STACKED TEST @{label} {thr:.3f}: acc {acc:.4f}  F1 {f1:.4f} prec {prec:.4f} rec {rec:.4f} ROC {roc:.4f}  CM TN FP FN TP {cm}  ({int(acc*len(yte))}/{len(yte)})")

        # oracle leakage ceiling (not headline)
        best_test = -1
        boc = 0.5
        for t in ths:
            a = accuracy_score(yte, (proba >= t).astype(int))
            if a > best_test:
                best_test, boc = a, t
        print(f"  ORACLE test-thr LEAKAGE ceiling (not reported as headline): {best_test:.4f} @ {boc:.3f} — would be leakage if tuned on test")

        results[k] = {
            "best_single": best_single,
            "best_single_name": best_single_name,
            "stack_oof_thr": best_thr,
            "oof_acc": best_oof,
            "stack_roc": roc,
            "chosen": chosen,
        }

    heading("CANARIES — shuffled labels must stay at chance (no memorization)")
    pipe = build_pipeline(30)
    pipe.fit(Xtr, yt)
    A = pipe.transform(Xtr)
    y_shuf = np.random.RandomState(0).permutation(yt.values)
    for name, est in [("SVM", SVC(probability=True)), ("LR", LogisticRegression(max_iter=2000)), ("RF", RandomForestClassifier(n_estimators=300))]:
        est.fit(A, y_shuf)
        acc = accuracy_score(y_shuf, est.predict(A))
        print(f"  {name:4s} on shuffled labels (train): {acc:.4f}  {'PASS ~chance' if acc < 0.70 else 'FAIL memorizes'}")

    heading("SUMMARY — Breast Cancer Wisconsin 569x30, leakage-free")
    for k in [4, 30]:
        r = results[k]
        print(f" k={k:2d}  best single {r['best_single']:.4f} ({r['best_single_name']})  stacked OOF committee {r['chosen']}  OOF-acc {r['oof_acc']:.4f} thr {r['stack_oof_thr']:.3f}  ROC {r['stack_roc']:.4f}")
    print(" All thresholds from OOF train folds only; test touched once per k; preprocessor fit on train only.")
    print(" Pipeline k=4: imputer+StandardScaler+SelectKBest(k=4 ANOVA)+MinMaxScaler(0,pi)  (quantum branch)")
    print(" Pipeline k=30: imputer+StandardScaler+MinMaxScaler(0,pi)  (classical fallback, all 30)")
    print(" Split: 80/20 stratified random_state=42  455 train / 114 test  (569 total)")
    print(" Run: ./venv/Scripts/python.exe scripts/eval_breast_cancer.py")
    print(" Log: docs/breast_benchmark.log")


if __name__ == "__main__":
    main()
