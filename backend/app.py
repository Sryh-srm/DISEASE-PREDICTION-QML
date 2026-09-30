#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
FastAPI backend serving the hybrid quantum-classical disease predictor.

The /predict endpoint returns probabilities from the stacked Hybrid
Quantum Committee: a logistic meta-learner combining
  - Quantum Kernel SVM (fidelity kernel on the re-uploading feature map)
  - Bagged VQC ensemble
  - Single VQC (data re-uploading, trainable encoding)
  - Tuned classical RBF-SVM
  - Tuned classical Logistic Regression
The committee's decision threshold is tuned on out-of-fold predictions
(Youden's J: sensitivity + specificity - 1) by train.py, and the risk
bands scale with it.

Batch scoring is available at /predict/csv: upload a CSV with the 13
clinical columns (header row required; a target column is ignored) and
receive one prediction per row.

Usage: uvicorn backend.app:app --reload
"""

import os
import logging
import pickle
import json
from contextlib import asynccontextmanager
from typing import List, Optional

from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import pandas as pd
import numpy as np

from .preprocess import load_preprocessor, transform_preprocessor, FEATURES
from .quantum_model import QuantumModel, QuantumEnsemble, QuantumKernelClassifier

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

ARTIFACT_DIR = os.path.join(os.path.dirname(__file__), "artifacts")
PREPROCESSOR_PATH = os.path.join(ARTIFACT_DIR, "preprocessor.pkl")
MODEL_PATH = os.path.join(ARTIFACT_DIR, "vqc_model.pkl")
ENSEMBLE_PATH = os.path.join(ARTIFACT_DIR, "ensemble_model.pkl")
QKERNEL_PATH = os.path.join(ARTIFACT_DIR, "qkernel_model.pkl")
COMMITTEE_PATH = os.path.join(ARTIFACT_DIR, "committee.pkl")
CLASSICAL_MEMBERS_PATH = os.path.join(ARTIFACT_DIR, "classical_members.pkl")
FEATURE_IMPORTANCE_PATH = os.path.join(ARTIFACT_DIR, "feature_importance.json")

# Global variables
preprocessor = None
model = None            # standalone VQC (fallback if committee is unavailable)
committee = None        # dict with member models + meta-learner params
committee_threshold = 0.5
feature_importance = None


class LogisticRegressionStub:
    """Minimal stand-in for sklearn's LogisticRegression.predict_proba,
    reconstructed from the coefficients stored by train.py."""

    def predict_proba(self, X):
        X = np.asarray(X, dtype=float)
        z = X @ self.coef_[0] + self.intercept_[0]
        p1 = 1.0 / (1.0 + np.exp(-z))
        return np.column_stack([1.0 - p1, p1])


def _build_meta_learner(bundle):
    """Reconstruct the stacked meta-learner from its stored parameters."""
    meta = LogisticRegressionStub()
    meta.coef_ = np.array([bundle["meta_coef"]], dtype=float)
    meta.intercept_ = np.array([bundle["meta_intercept"]], dtype=float)
    return meta


def _committee_proba(X):
    """Stacked committee probability for class 1."""
    members = committee["models"]
    cols = [members[n].predict_proba(X)[:, 1] for n in committee["members"]]
    return committee["meta"].predict_proba(np.column_stack(cols))[:, 1]


def _predict_proba_any(X):
    """Committee probabilities, or the standalone VQC as fallback."""
    if committee is not None:
        return _committee_proba(X)
    return model.predict_proba(X)[:, 1]


def _model_name():
    return "hybrid-quantum-committee (stacked)" if committee is not None else "vqc"


def _risk_bands(threshold):
    """Risk bands scale with the tuned decision threshold.

    'Moderate' is centered on the tuned operating point: Low below
    0.6*threshold, High above 1.4*threshold (for the default 0.5 this
    reproduces the classic 0.30 / 0.70 bands)."""
    moderate_low = round(0.6 * threshold, 3)
    high = round(min(1.4 * threshold, 0.95), 3)
    return moderate_low, high


def _risk_level(prob, threshold):
    moderate_low, high = _risk_bands(threshold)
    if prob < moderate_low:
        return "Low"
    elif prob < high:
        return "Moderate"
    return "High"


def _recommendation(prob, threshold):
    moderate_low, high = _risk_bands(threshold)
    if prob < moderate_low:
        return "Lifestyle changes recommended; regular checkups."
    elif prob < high:
        return "Consult physician for further evaluation."
    return "Immediate specialist referral recommended."


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load artifacts on startup."""
    global preprocessor, model, committee, committee_threshold, feature_importance
    logger.info("Loading preprocessor and models...")
    try:
        preprocessor = load_preprocessor(PREPROCESSOR_PATH)
        model = QuantumModel.load_model(MODEL_PATH)
        logger.info("Standalone VQC loaded.")

        # Stacked hybrid committee (headline model)
        if (os.path.exists(COMMITTEE_PATH) and os.path.exists(ENSEMBLE_PATH)
                and os.path.exists(QKERNEL_PATH)
                and os.path.exists(CLASSICAL_MEMBERS_PATH)):
            with open(COMMITTEE_PATH, "rb") as f:
                bundle = pickle.load(f)
            members = {
                "qkernel": QuantumKernelClassifier.load_model(QKERNEL_PATH),
                "ensemble": QuantumEnsemble.load_model(ENSEMBLE_PATH),
                "vqc": model,
            }
            with open(CLASSICAL_MEMBERS_PATH, "rb") as f:
                members.update(pickle.load(f))
            committee = {
                "members": bundle["members"],
                "models": members,
                "meta": _build_meta_learner(bundle),
            }
            committee_threshold = round(float(bundle.get("threshold", 0.5)), 3)
            logger.info(
                "Hybrid committee loaded (members: %s; tuned threshold %.3f).",
                ", ".join(bundle["members"]),
                committee_threshold,
            )
        else:
            logger.warning(
                "Committee artifacts missing; falling back to the standalone VQC."
            )

        # Load feature importance if available
        if os.path.exists(FEATURE_IMPORTANCE_PATH):
            with open(FEATURE_IMPORTANCE_PATH, "r") as f:
                feature_importance = json.load(f)
            logger.info("Feature importance loaded.")
        else:
            logger.warning("Feature importance file not found.")
    except FileNotFoundError as e:
        logger.error(f"Missing artifact: {e}. Please run train.py first.")
        preprocessor = model = committee = None
    yield
    logger.info("Shutting down.")


app = FastAPI(lifespan=lifespan)

# Add CORS middleware for frontend

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://disease-prediction-bjs2dn63v-quantedge-sryh-srm.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class PatientData(BaseModel):
    age: float = Field(..., ge=0, le=120)
    sex: int = Field(..., ge=0, le=1)
    cp: int = Field(..., ge=1, le=4)
    trestbps: float = Field(..., ge=80, le=250)
    chol: float = Field(..., ge=100, le=600)
    fbs: int = Field(..., ge=0, le=1)
    restecg: int = Field(..., ge=0, le=2)
    thalach: float = Field(..., ge=60, le=220)
    exang: int = Field(..., ge=0, le=1)
    oldpeak: float = Field(..., ge=0, le=10)
    slope: Optional[int] = Field(default=None, ge=1, le=3)
    ca: Optional[int] = Field(default=None, ge=0, le=3)
    thal: Optional[int] = Field(default=None, ge=3, le=7)


class PredictionResponse(BaseModel):
    probability: float
    risk: str
    recommendation: str
    threshold: float
    model: str


class BatchPredictionResponse(BaseModel):
    n_rows: int
    threshold: float
    model: str
    predictions: List[dict]


def _score_frame(df: pd.DataFrame) -> np.ndarray:
    """Preprocess a raw 13-column frame and return committee probabilities."""
    X_transformed = transform_preprocessor(df, preprocessor)
    return _predict_proba_any(X_transformed)


@app.post("/predict", response_model=PredictionResponse)
async def predict(data: PatientData):
    if preprocessor is None or (committee is None and model is None):
        raise HTTPException(status_code=503, detail="Server not ready. Run train.py first.")

    # Convert to DataFrame
    df = pd.DataFrame([data.dict()])
    # Transform
    try:
        prob = float(_score_frame(df)[0])
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Preprocessing error: {e}")

    risk = _risk_level(prob, committee_threshold)
    rec = _recommendation(prob, committee_threshold)

    return PredictionResponse(
        probability=prob,
        risk=risk,
        recommendation=rec,
        threshold=committee_threshold,
        model=_model_name(),
    )


@app.post("/predict/csv", response_model=BatchPredictionResponse)
async def predict_csv(file: UploadFile = File(...)):
    """Batch scoring: upload a CSV with a header row containing at least
    the 13 clinical feature columns. Extra columns (e.g. a known target)
    are ignored. Returns one prediction per row."""
    if preprocessor is None or (committee is None and model is None):
        raise HTTPException(status_code=503, detail="Server not ready. Run train.py first.")

    # UploadFile.read() works in all deployment modes (multipart when
    # python-multipart is installed, in-memory otherwise).
    raw = await file.read()
    try:
        text = raw.decode("utf-8", errors="replace")
        df = pd.read_csv(pd.io.common.StringIO(text))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not parse CSV: {e}")

    missing = [c for c in FEATURES if c not in df.columns]
    if missing:
        raise HTTPException(
            status_code=400,
            detail=f"CSV is missing required columns: {missing}. "
                   f"Required header: {FEATURES}",
        )
    if len(df) == 0:
        raise HTTPException(status_code=400, detail="CSV contains no data rows.")

    try:
        probas = _score_frame(df[FEATURES])
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Batch scoring failed: {e}")

    predictions = [
        {
            "row": i,
            "probability": round(float(p), 4),
            "risk": _risk_level(float(p), committee_threshold),
            "recommendation": _recommendation(float(p), committee_threshold),
        }
        for i, p in enumerate(probas)
    ]
    return BatchPredictionResponse(
        n_rows=len(predictions),
        threshold=committee_threshold,
        model=_model_name(),
        predictions=predictions,
    )


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "artifacts_loaded": preprocessor is not None,
        "model": _model_name(),
        "threshold": committee_threshold,
    }


@app.get("/feature_importance")
async def get_feature_importance():
    """Return the feature importance data for UI explainability."""
    if feature_importance is None:
        raise HTTPException(status_code=404, detail="Feature importance not available")
    return feature_importance
