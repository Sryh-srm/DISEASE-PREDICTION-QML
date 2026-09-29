#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Data preprocessing pipeline for the heart disease dataset.
Handles missing values, scaling, supervised feature selection,
and rescaling to [0, pi] for quantum angle encoding.
All artifacts are saved as a single pickle file.
"""

import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler, MinMaxScaler
from sklearn.feature_selection import SelectKBest, f_classif
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
import pickle
import os

FEATURES = [
    "age", "sex", "cp", "trestbps", "chol", "fbs", "restecg",
    "thalach", "exang", "oldpeak", "slope", "ca", "thal"
]
TARGET = "target"

# Cleveland encodes disease presence as 0 (absent) or 1-4 (increasing severity).
# We binarize: any value > 0 means disease present.
def binarize_target(y: pd.Series) -> pd.Series:
    """Convert raw Cleveland target (0-4) to binary (0 = no disease, 1 = disease)."""
    return (y > 0).astype(int)

def build_preprocessor(n_components: int = 4):
    """
    Build a preprocessing pipeline that:
    1. Imputes missing values with median (for numeric)
    2. Scales numeric features
    3. Selects the n_components most class-predictive features
       (ANOVA F-test) - supervised, so the kept features are the
       ones that actually discriminate disease vs. no-disease.
    4. Rescales the selected features to [0, pi] for quantum angle
       encoding.

    ponytail: missingness-indicator columns (ca/thal/slope) were
    attempted but caused index-mapping breakage across train.py/app.py
    (SelectKBest output indices vs the 13-element FEATURES list).
    Median imputation on a 13-feature clinical set is the proven,
    working configuration; re-introducing indicators requires
    carrying column names through the whole stack (see AUDIT.md).
    """
    return Pipeline([
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler()),
        ("selector", SelectKBest(score_func=f_classif, k=n_components)),
        ("angle", MinMaxScaler(feature_range=(0.0, np.pi)))
    ])

def fit_preprocessor(X: pd.DataFrame, n_components: int = 4, y=None):
    """
    Fit the pipeline on the feature matrix X.
    y is required for the supervised ANOVA feature selection step.
    Returns the fitted pipeline.
    """
    X = X[FEATURES].copy()
    pipe = build_preprocessor(n_components)
    pipe.fit(X, y)
    return pipe

def transform_preprocessor(X: pd.DataFrame, pipe):
    """
    Apply the fitted pipeline to new data (same feature set).
    Returns the selected, angle-scaled array (n_samples, n_components).
    """
    X = X[FEATURES].copy()
    return pipe.transform(X)

def selected_feature_indices(pipe):
    """Indices (into FEATURES) of the features kept by the selector."""
    return np.where(pipe.named_steps["selector"].get_support())[0]

def save_preprocessor(pipe, path: str):
    """Save the fitted pipeline to disk."""
    with open(path, "wb") as f:
        pickle.dump(pipe, f)

def load_preprocessor(path: str):
    """Load a saved pipeline."""
    with open(path, "rb") as f:
        return pickle.load(f)

# Example usage (if run directly):
if __name__ == "__main__":
    # Quick test: create dummy data (y is required for feature selection)
    dummy = pd.DataFrame(np.random.randn(50, 13), columns=FEATURES)
    dummy_y = (dummy["thalach"] + 0.5 * dummy["cp"] > 0).astype(int)
    pipe = fit_preprocessor(dummy, y=dummy_y)
    transformed = transform_preprocessor(dummy, pipe)
    print("Transformed shape:", transformed.shape)
    print("Selected features:", [FEATURES[i] for i in selected_feature_indices(pipe)])
