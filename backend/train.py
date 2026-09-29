#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Training script for the hybrid quantum-classical model with classical baseline comparison.

1. Downloads the Cleveland Heart Disease dataset (if not already present).
2. Preprocesses: impute, scale, ANOVA top-4 feature selection,
   rescale to [0, pi] for angle encoding.
3. Splits into train/test sets.
4. Trains the quantum models: VQC (4 qubits, 4 re-uploading layers),
   bagged VQC ensemble, and a quantum kernel SVM (CV-tuned C).
5. Trains classical baselines: Random Forest, SVM, Logistic Regression
   (5-fold cross-validated hyperparameter tuning).
6. Stacks a hybrid quantum-classical committee: a logistic meta-learner
   over out-of-fold predictions of the three quantum + two classical models.
7. Compares all models: accuracy, precision, recall, F1, confusion matrix.
8. Saves all artifacts (preprocessor pipeline, quantum models, committee)
   to backend/artifacts/ and feature importance for explainability
   (from Random Forest).
"""

import os
import sys
import urllib.request
import pickle
from pathlib import Path

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    classification_report
)
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import GridSearchCV, StratifiedKFold
import matplotlib.pyplot as plt

# Add backend to path for imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from preprocess import (
    fit_preprocessor, save_preprocessor, binarize_target,
    selected_feature_indices, FEATURES, TARGET
)
from quantum_model import QuantumModel, QuantumEnsemble, QuantumKernelClassifier

# Constants
DATA_URL = "https://archive.ics.uci.edu/ml/machine-learning-databases/heart-disease/processed.cleveland.data"
DATA_FILE = "data/heart.csv"
ARTIFACT_DIR = "backend/artifacts"
os.makedirs(ARTIFACT_DIR, exist_ok=True)
os.makedirs("plots", exist_ok=True)

# Column names for the Cleveland dataset (no headers in the raw file)
COLUMN_NAMES = FEATURES + [TARGET]

def download_data():
    """Download the dataset if not present, and save as CSV with headers."""
    Path("data").mkdir(exist_ok=True)
    if os.path.exists(DATA_FILE):
        print(f"Dataset already exists at {DATA_FILE}")
        return pd.read_csv(DATA_FILE)
    print("Downloading dataset...")
    try:
        urllib.request.urlretrieve(DATA_URL, DATA_FILE)
        print("Download complete.")
    except Exception as e:
        print(f"Error downloading: {e}")
        # Create dummy data for testing if download fails
        print("Using fallback dummy data for testing purposes.")
        dummy = pd.DataFrame(np.random.randn(100, 14), columns=COLUMN_NAMES)
        dummy[TARGET] = (dummy[TARGET] > 0).astype(int)
        dummy.to_csv(DATA_FILE, index=False)
        return dummy
    # Read the downloaded file (no header)
    df = pd.read_csv(DATA_FILE, header=None, names=COLUMN_NAMES, na_values='?')
    # Save with headers for future use
    df.to_csv(DATA_FILE, index=False)
    return df

def train_classical_baselines(X_train, X_test, y_train, y_test):
    """
    Train multiple classical models with 5-fold cross-validated
    hyperparameter tuning, and return their metrics.
    """
    models = {
        "Random Forest": (
            RandomForestClassifier(random_state=42),
            {"n_estimators": [100, 300], "max_depth": [None, 4, 6]},
        ),
        "SVM": (
            SVC(kernel="rbf", probability=True, random_state=42),
            {"C": [0.5, 1.0, 3.0], "gamma": ["scale", 0.5]},
        ),
        "Logistic Regression": (
            LogisticRegression(max_iter=2000, random_state=42),
            {"C": [0.1, 0.5, 1.0, 3.0]},
        ),
    }

    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    results = {}
    fitted_models = {}
    feature_importance = None

    for name, (estimator, param_grid) in models.items():
        print(f"  Training {name} (5-fold CV tuning)...")
        search = GridSearchCV(estimator, param_grid, cv=cv, scoring="accuracy")
        search.fit(X_train, y_train)
        model = search.best_estimator_
        fitted_models[name] = model
        print(f"    best params: {search.best_params_}")
        y_pred = model.predict(X_test)
        
        # Store metrics
        results[name] = {
            "accuracy": accuracy_score(y_test, y_pred),
            "precision": precision_score(y_test, y_pred, zero_division=0),
            "recall": recall_score(y_test, y_pred, zero_division=0),
            "f1": f1_score(y_test, y_pred, zero_division=0),
            "confusion_matrix": confusion_matrix(y_test, y_pred)
        }
        
        # Get feature importance if available (Random Forest)
        if name == "Random Forest" and hasattr(model, 'feature_importances_'):
            feature_importance = model.feature_importances_
        
        print(f"    {name} Accuracy: {results[name]['accuracy']:.4f}")
    
    return results, feature_importance, fitted_models

def plot_comparison(results, feature_importance):
    """
    Generate comparison bar chart and feature importance plot.
    """
    # 1. Model comparison
    fig, axes = plt.subplots(1, 2, figsize=(14, 6))

    # Metrics comparison
    models = list(results.keys())
    metrics = ['accuracy', 'precision', 'recall', 'f1']

    x = np.arange(len(models))
    width = 0.2
    colors = ['#4d6bfe', '#6c9f5f', '#d4a544', '#d4685a']

    for i, metric in enumerate(metrics):
        values = [results[m][metric] for m in models]
        axes[0].bar(x + i*width, values, width, label=metric.capitalize(), color=colors[i])

    axes[0].set_xlabel('Models')
    axes[0].set_ylabel('Score')
    axes[0].set_title('Classical vs Quantum Model Performance')
    axes[0].set_xticks(x + width * 1.5)
    axes[0].set_xticklabels(models)
    axes[0].legend()
    axes[0].set_ylim(0, 1)

    # 2. Feature importance of the features the models actually used
    nonzero = np.where(np.asarray(feature_importance) > 0)[0]
    indices = nonzero[np.argsort(feature_importance[nonzero])[::-1]][:6]
    top_features = [FEATURES[i] for i in indices]
    top_importance = [feature_importance[i] for i in indices]

    axes[1].barh(top_features, top_importance, color='#4d6bfe')
    axes[1].set_xlabel('Importance')
    axes[1].set_title('Top 6 Contributing Features')
    axes[1].invert_yaxis()

    plt.tight_layout()
    plt.savefig('plots/model_comparison.png', dpi=300, bbox_inches='tight')
    plt.show()
    print("Comparison plot saved to plots/model_comparison.png")

def generate_explainability_data(feature_importance_full):
    """
    Generate feature importance data for UI explainability.
    Saves as JSON for the frontend to display.

    With supervised feature selection the models operate directly on
    named clinical features (no anonymous PCA components), so the
    Random Forest importances of the selected features are shown as-is.
    """
    import json

    # Keep only features the models actually saw (nonzero importance).
    nonzero = np.where(np.asarray(feature_importance_full) > 0)[0]
    order = nonzero[np.argsort(feature_importance_full[nonzero])[::-1]]
    explain_data = {
        "features": [FEATURES[i] for i in order],
        "importance": [float(feature_importance_full[i]) for i in order],
    }

    # Save to artifacts
    with open(os.path.join(ARTIFACT_DIR, "feature_importance.json"), "w") as f:
        json.dump(explain_data, f)

    print("Feature importance saved for UI explainability.")
    print(
        "  Top contributing features: "
        + ", ".join(
            f"{feat} ({imp:.3f})"
            for feat, imp in zip(explain_data["features"], explain_data["importance"])
        )
    )
    return explain_data

def main():
    print("=" * 60)
    print("HYBRID QUANTUM-CLASSICAL DISEASE PREDICTOR")
    print("=" * 60)
    print("Training pipeline with classical baseline comparison")
    print()

    # 1. Load data
    print("Step 1: Loading dataset...")
    df = download_data()
    print(f"Dataset shape: {df.shape}")
    print(f"Missing values per column:\n{df.isnull().sum()}")
    print()

    # 2. Separate features and target (binarize: Cleveland 0-4 -> 0/1)
    X = df[FEATURES]
    y = binarize_target(df[TARGET])
    print(f"Target distribution after binarization: {dict(y.value_counts().sort_index())}")

    # 3. Split data
    print("Step 2: Splitting data into train/test (80/20)...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    print(f"Train size: {X_train.shape[0]}, Test size: {X_test.shape[0]}")
    print()

    # 4. Build preprocessor (fit on train)
    print("Step 3: Preprocessing (imputer, scaler, ANOVA top-4 selection, angle scaling)...")
    preprocessor = fit_preprocessor(X_train, n_components=4, y=y_train.values)
    X_train_transformed = preprocessor.transform(X_train)
    X_test_transformed = preprocessor.transform(X_test)
    sel_idx = selected_feature_indices(preprocessor)
    print(f"  Selected features: {[FEATURES[i] for i in sel_idx]}")
    print(f"Transformed train shape: {X_train_transformed.shape}")
    print()

    # 5. Train quantum models
    print("Step 4: Training Variational Quantum Classifier (4 qubits, 4 re-uploading layers)...")
    model = QuantumModel(n_qubits=4, layers=4)
    model.fit(X_train_transformed, y_train.values)
    print()

    print("Step 4b: Training bagged VQC ensemble (5 members)...")
    ensemble = QuantumEnsemble(
        n_qubits=4, layers=4, n_members=5, epochs=120
    )
    ensemble.fit(X_train_transformed, y_train.values)
    print()

    print("Step 4c: Training quantum kernel SVM (flagship pure-quantum model)...")
    qkernel = QuantumKernelClassifier(n_qubits=4, layers=4)
    qkernel.fit(X_train_transformed, y_train.values)
    # 5-fold CV tuning of the kernel-SVM regularization C on the
    # cached precomputed kernel matrix (no extra circuit runs).
    K_tr = qkernel._K_train
    cv_sk = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    best_C, best_cv_acc = qkernel.C, -1.0
    for C in [0.1, 0.5, 1.0, 3.0, 10.0]:
        accs = []
        for tri, vai in cv_sk.split(K_tr, y_train.values):
            trial = QuantumKernelClassifier(n_qubits=4, layers=4, C=C)
            trial._X_train = X_train_transformed[tri]
            trial.fit_from_kernel(K_tr[np.ix_(tri, tri)], y_train.values[tri], C)
            accs.append(
                accuracy_score(
                    y_train.values[vai],
                    (trial.predict_proba(X_train_transformed[vai])[:, 1] >= 0.5).astype(int),
                )
            )
        mean_acc = float(np.mean(accs))
        print(f"    C={C}: CV accuracy {mean_acc:.4f}")
        if mean_acc > best_cv_acc:
            best_C, best_cv_acc = C, mean_acc
    qkernel.fit_from_kernel(K_tr, y_train.values, best_C)
    print(f"  Quantum kernel SVM tuned: C={best_C} (CV acc {best_cv_acc:.4f})")
    print()

    # 6. Evaluate all quantum models on the test set
    def _metrics(y_true, y_pred):
        return {
            "accuracy": accuracy_score(y_true, y_pred),
            "precision": precision_score(y_true, y_pred, zero_division=0),
            "recall": recall_score(y_true, y_pred, zero_division=0),
            "f1": f1_score(y_true, y_pred, zero_division=0),
            "confusion_matrix": confusion_matrix(y_true, y_pred),
        }

    y_pred_vqc = model.predict(X_test_transformed)
    vqc_metrics = _metrics(y_test, y_pred_vqc)
    print(f"  VQC Accuracy: {vqc_metrics['accuracy']:.4f}")

    y_pred_ens = ensemble.predict(X_test_transformed)
    ens_metrics = _metrics(y_test, y_pred_ens)
    print(f"  VQC Ensemble (5 members) Accuracy: {ens_metrics['accuracy']:.4f}")

    y_pred_qk = qkernel.predict(X_test_transformed)
    qk_metrics = _metrics(y_test, y_pred_qk)
    print(f"  Quantum Kernel SVM Accuracy: {qk_metrics['accuracy']:.4f}")
    print()

    # Soft-vote committee of the three pure-quantum models. Averaging
    # calibrated probability sources is a standard variance-reduction
    # technique.
    def _quantum_committee(X):
        p = (qkernel.predict_proba(X)[:, 1]
             + ensemble.predict_proba(X)[:, 1]
             + model.predict_proba(X)[:, 1]) / 3.0
        return (p >= 0.5).astype(int)

    y_pred_committee = _quantum_committee(X_test_transformed)
    quantum_committee_metrics = _metrics(y_test, y_pred_committee)
    print(
        f"  Quantum Committee (kernel + ensemble + VQC) Accuracy: "
        f"{quantum_committee_metrics['accuracy']:.4f}"
    )
    print()

    # 7. Train classical baselines on the same selected-feature data
    print("Step 6: Training classical baselines on selected-feature data...")
    classical_results, rf_importance, fitted_classical = train_classical_baselines(
        X_train_transformed, X_test_transformed, y_train.values, y_test.values
    )
    # Expand the RF importances of the selected features to a full
    # 13-vector (zeros elsewhere) for plotting and explainability.
    feature_importance = np.zeros(len(FEATURES))
    if rf_importance is not None:
        feature_importance[sel_idx] = rf_importance
    print()

    # 8. Build the headline model: a STACKED hybrid quantum-classical
    # committee. A logistic-regression meta-learner combines the out-of-
    # fold probability predictions of the three quantum models and the
    # two tuned classical models. Stacking on out-of-fold predictions is
    # the textbook way to combine heterogeneous models without test
    # leakage, and the quantum models are first-class voting members.
    print("Step 7b: Stacking the hybrid quantum-classical committee...")
    from sklearn.linear_model import LogisticRegression

    member_names = ["qkernel", "ensemble", "vqc", "svm", "lr"]

    def _make_members():
        return {
            # The standalone committee members reuse the already-trained
            # artifacts (qkernel with its tuned C, the 7-member ensemble).
            "qkernel": qkernel,
            "ensemble": ensemble,
            "vqc": model,
            # (ensemble: 5 members, epochs=120 - same as the standalone
            # Step 4b model and the fold instances)
            # The classical members are fresh estimators with the tuned
            # hyperparameters found by GridSearchCV in Step 6.
            "svm": SVC(
                kernel="rbf",
                C=fitted_classical["SVM"].C,
                gamma=fitted_classical["SVM"].gamma,
                probability=True,
                random_state=42,
            ),
            "lr": LogisticRegression(
                max_iter=2000,
                C=fitted_classical["Logistic Regression"].C,
                random_state=42,
            ),
        }

    def _fit_member(m, Xa, ya):
        if isinstance(m, (QuantumModel, QuantumEnsemble, QuantumKernelClassifier)):
            m.fit(Xa, ya, verbose=False)
        else:
            m.fit(Xa, ya)
        return m

    def _make_fold_members():
        """Fresh member instances for out-of-fold training (never the
        top-level already-trained models - fitting those on a fold
        would overwrite them)."""
        members = _make_members()
        members["qkernel"] = QuantumKernelClassifier(
            n_qubits=4, layers=4, C=best_C
        )
        members["ensemble"] = QuantumEnsemble(
            n_qubits=4, layers=4, n_members=5, epochs=120
        )
        members["vqc"] = QuantumModel(
            n_qubits=4, layers=4, epochs=120
        )
        return members

    cv_stack = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    oof = np.zeros((X_train.shape[0], len(member_names)))
    for fi, (tri, vai) in enumerate(cv_stack.split(X_train, y_train.values)):
        print(f"    stack fold {fi + 1}/5...")
        # REFIT the whole preprocessor (imputer+scaler+SelectorKBest)
        # on the fold's train partition only, so feature selection
        # never sees validation-fold labels (leakage-free selector).
        fold_prep = fit_preprocessor(X_train.iloc[tri], n_components=4, y=y_train.values[tri])
        Xtr_fold = fold_prep.transform(X_train.iloc[tri])
        Xva_fold = fold_prep.transform(X_train.iloc[vai])
        fold_members = _make_fold_members()
        for j, name in enumerate(member_names):
            _fit_member(fold_members[name], Xtr_fold, y_train.values[tri])
            oof[vai, j] = fold_members[name].predict_proba(Xva_fold)[:, 1]

    meta_learner = LogisticRegression(max_iter=2000).fit(oof, y_train.values)
    print(f"    meta weights: {dict(zip(member_names, np.round(meta_learner.coef_[0], 3)))}")

    # Threshold tuning for sensitivity/specificity (delivery item 4):
    # the operating threshold is chosen on the same clean out-of-fold
    # predictions used for the meta-learner (no test leakage), by
    # maximizing Youden's J = sensitivity + specificity - 1.
    oof_proba = meta_learner.predict_proba(oof)[:, 1]
    thresholds = np.linspace(0.05, 0.95, 181)
    sens = np.array([(oof_proba >= t)[y_train.values == 1].mean() for t in thresholds])
    spec = np.array([(oof_proba < t)[y_train.values == 0].mean() for t in thresholds])
    j_scores = sens + spec - 1.0
    best_i = int(np.argmax(j_scores))
    best_threshold = float(thresholds[best_i])
    print(
        f"    tuned decision threshold: {best_threshold:.3f} "
        f"(CV sensitivity {sens[best_i]:.3f} / specificity {spec[best_i]:.3f})"
    )

    # Final members trained on the full training set (oof stays clean).
    # The quantum entries are the already-trained top-level models, so
    # only the two classical members are (re)fit here.
    final_members = _make_members()
    for name in ["svm", "lr"]:
        _fit_member(final_members[name], X_train_transformed, y_train.values)

    def _stacked_proba(X):
        cols = [final_members[n].predict_proba(X)[:, 1] for n in member_names]
        return meta_learner.predict_proba(np.column_stack(cols))[:, 1]

    y_pred_committee_full = (_stacked_proba(X_test_transformed) >= best_threshold).astype(int)
    committee_metrics = _metrics(y_test, y_pred_committee_full)

    all_results = {
        "Hybrid Committee (stacked)": committee_metrics,
        "Quantum Kernel SVM": qk_metrics,
        "VQC Ensemble": ens_metrics,
        "VQC": vqc_metrics,
        **classical_results,
    }
    
    print("Step 7: Summary of all model performances:")
    print("-" * 50)
    print(f"{'Model':<22} {'Accuracy':<10} {'Precision':<10} {'Recall':<10} {'F1':<10}")
    print("-" * 50)
    for name, metrics in all_results.items():
        print(f"{name:<22} {metrics['accuracy']:.4f}    {metrics['precision']:.4f}    {metrics['recall']:.4f}    {metrics['f1']:.4f}")
    print("-" * 50)
    print()

    # 9. Save artifacts
    print("Step 8: Saving artifacts...")
    save_preprocessor(preprocessor, os.path.join(ARTIFACT_DIR, "preprocessor.pkl"))
    model.save_model(os.path.join(ARTIFACT_DIR, "vqc_model.pkl"))
    ensemble.save_model(os.path.join(ARTIFACT_DIR, "ensemble_model.pkl"))
    qkernel.save_model(os.path.join(ARTIFACT_DIR, "qkernel_model.pkl"))

    # Committee bundle: the API loads the meta-learner plus the saved
    # member models (identical to the ones used for evaluation).
    committee_bundle = {
        "members": member_names,
        "meta_coef": meta_learner.coef_[0].tolist(),
        "meta_intercept": float(meta_learner.intercept_[0]),
        "threshold": best_threshold,
    }
    with open(os.path.join(ARTIFACT_DIR, "committee.pkl"), "wb") as f:
        pickle.dump(committee_bundle, f)

    # Classical committee members for the API.
    with open(os.path.join(ARTIFACT_DIR, "classical_members.pkl"), "wb") as f:
        pickle.dump(
            {n: final_members[n] for n in ["svm", "lr"]}, f
        )

    # Save VQC metrics separately (kept for backward compatibility)
    with open(os.path.join(ARTIFACT_DIR, "vqc_metrics.pkl"), "wb") as f:
        pickle.dump(vqc_metrics, f)
    
    print(f"Artifacts saved to {ARTIFACT_DIR}")
    print()

    # 10. Generate comparison plot and explainability data
    print("Step 9: Generating visualizations and explainability data...")
    plot_comparison(all_results, feature_importance)
    explain_data = generate_explainability_data(feature_importance)
    print()

    print("=" * 60)
    print("TRAINING COMPLETE!")
    print("=" * 60)
    print("\nNext steps:")
    print("1. Start the backend: uvicorn backend.app:app --reload")
    print("2. Run the QML frontend: qmlscene frontend/main.qml")
    print("3. Check plots/model_comparison.png for performance comparison")
    print()

if __name__ == "__main__":
    main()
