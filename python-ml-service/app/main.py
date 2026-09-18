"""
FastAPI Microservice for HealthPilot AI Adherence Prediction
Provides reproducible model training, evaluation, and probabilistic inference.
"""

from typing import Dict, Any, List, Optional
import os
import sys
import json
from datetime import datetime
import numpy as np
import pandas as pd
import joblib
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# Ensure local packages can be imported
SERVICE_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if SERVICE_ROOT not in sys.path:
    sys.path.insert(0, SERVICE_ROOT)

from preprocessing.pipeline import (
    create_preprocessor,
    build_dataframe,
    extract_features_from_dict,
    ALL_FEATURE_NAMES,
    NUMERICAL_FEATURES,
    CATEGORICAL_FEATURES
)
from training.trainer import train_and_compare_models, MODELS_DIR
from evaluation.evaluator import evaluate_predictions
from explainability.shap_explainer import explain_prediction_with_shap, _create_system_fallback_explanation

app = FastAPI(
    title="HealthPilot AI Adherence Prediction ML Service",
    description="Microservice providing binary adherence classification, model comparison, and calibration metrics.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class PredictRequest(BaseModel):
    features: Dict[str, Any] = Field(..., description="Context, candidate recommendation, and behavioral profile features")
    userId: Optional[str] = "usr-alex-01"
    recommendationId: Optional[str] = None


class TrainRequest(BaseModel):
    records: List[Dict[str, Any]] = Field(..., description="Historical outcome records with context snapshots and outcome status")
    dataSource: Optional[str] = "Demonstration model trained on seed data"


class EvaluateRequest(BaseModel):
    records: Optional[List[Dict[str, Any]]] = None


def load_active_model():
    """Loads active model pipeline and metadata from disk if available."""
    model_path = os.path.join(MODELS_DIR, 'active_model.joblib')
    metadata_path = os.path.join(MODELS_DIR, 'active_model_metadata.json')

    if not os.path.exists(model_path) or not os.path.exists(metadata_path):
        return None, None

    model_bundle = joblib.load(model_path)
    with open(metadata_path, 'r') as f:
        metadata = json.load(f)

    return model_bundle, metadata


@app.get("/health")
def health_check():
    model_bundle, metadata = load_active_model()
    return {
        "status": "healthy",
        "service": "HealthPilot-ML-Microservice",
        "has_active_model": model_bundle is not None,
        "active_model_name": metadata.get("model_name") if metadata else None,
        "timestamp": datetime.utcnow().isoformat()
    }


@app.get("/model/current")
def get_current_model():
    _, metadata = load_active_model()
    if not metadata:
        return {
            "status": "uninitialized",
            "message": "No machine learning model currently trained. Trigger /train with historical records.",
            "data_source": "Uninitialized"
        }
    return metadata


@app.post("/train")
def train_model_endpoint(req: TrainRequest):
    if not req.records or len(req.records) == 0:
        raise HTTPException(status_code=400, detail="Cannot train on empty records array.")

    try:
        metadata = train_and_compare_models(
            raw_records=req.records,
            data_source_label=req.dataSource or "Demonstration model trained on seed data"
        )
        return {
            "success": True,
            "message": f"Successfully trained and evaluated models. Selected {metadata['model_name']}.",
            "metadata": metadata
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Training failed: {str(e)}")


@app.post("/predict")
def predict_adherence(req: PredictRequest):
    model_bundle, metadata = load_active_model()

    if not model_bundle or 'pipeline' not in model_bundle:
        raise HTTPException(
            status_code=503,
            detail="ML Model not yet trained on service. Train via /train or rely on Express baseline fallback."
        )

    pipeline = model_bundle['pipeline']
    raw_dict = req.features

    # Build 1-row DataFrame through identical preprocessing pipeline
    df_single = build_dataframe([raw_dict])

    try:
        # Probabilistic inference
        if hasattr(pipeline, "predict_proba"):
            probs = pipeline.predict_proba(df_single)[0]
            # Probability of positive class (1 = completed)
            prob_positive = float(probs[1]) if len(probs) > 1 else float(probs[0])
        else:
            pred_raw = pipeline.predict(df_single)[0]
            prob_positive = 1.0 if pred_raw == 1 else 0.0

        prob_positive = max(0.05, min(0.95, prob_positive))
        predicted_percentage = int(round(prob_positive * 100))
        predicted_class = 1 if prob_positive >= 0.5 else 0

        # Real Explainable AI via SHAP
        shap_explanation = explain_prediction_with_shap(model_bundle, raw_dict, metadata)

        # Map SHAP contributions into the attributions array for compatibility and rich UI display
        attributions = []
        for item in shap_explanation.get("contributions", []):
            attributions.append({
                "feature": item.get("displayName", item.get("feature")),
                "rawFeature": item.get("feature"),
                "value": item.get("value"),
                "impactScore": item.get("shapValue", 0.0),
                "shapValue": item.get("shapValue", 0.0),
                "direction": "increases_adherence" if item.get("direction") == "positive" else "decreases_adherence",
                "explanation": item.get("humanExplanation", ""),
                "isGenuineShap": shap_explanation.get("isGenuineShap", True)
            })

        # Suitability score calculation
        suitability = 85
        if float(df_single.iloc[0].get('sleep_hours', 7.0)) < 6.0 and str(df_single.iloc[0].get('intensity', '')) == 'high':
            suitability -= 35
        if float(df_single.iloc[0].get('fatigue_level', 5.0)) >= 7 and str(df_single.iloc[0].get('intensity', '')) != 'low':
            suitability -= 25
        suitability = max(15, min(98, suitability))

        return {
            "predicted_class": predicted_class,
            "adherence_probability": round(prob_positive, 4),
            "predictedAdherence": predicted_percentage,
            "healthSuitabilityScore": suitability,
            "model_name": metadata.get("model_name", "Trained ML Model"),
            "model_version": metadata.get("model_version", "1.0.0-prototype"),
            "data_source": metadata.get("data_source", "Demonstration model trained on seed data"),
            "attributions": attributions,
            "shap_explanation": shap_explanation,
            "feature_snapshot": extract_features_from_dict(raw_dict),
            "prediction_timestamp": datetime.utcnow().isoformat(),
            "limitation_notice": metadata.get("limitation_notice", "Statistical adherence estimate based on trained feature associations; interpret within non-clinical context.")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")


@app.post("/explain")
def explain_endpoint(req: PredictRequest):
    """
    Computes genuine SHAP explainability payload for provided feature vector.
    """
    model_bundle, metadata = load_active_model()
    if not model_bundle or 'pipeline' not in model_bundle:
        return _create_system_fallback_explanation(req.features, "Active model bundle not yet trained; using fallback system.")
    return explain_prediction_with_shap(model_bundle, req.features, metadata)


@app.get("/explain")
def explain_get_endpoint():
    """
    Returns SHAP explainability for default/baseline feature vector.
    """
    model_bundle, metadata = load_active_model()
    default_features = {
        'available_minutes': 25,
        'recommended_duration_minutes': 20,
        'energy_level': 6,
        'fatigue_level': 5,
        'sleep_hours': 7.0,
        'environment': 'home',
        'activity_type': 'functional_strength',
        'intensity': 'moderate'
    }
    if not model_bundle or 'pipeline' not in model_bundle:
        return _create_system_fallback_explanation(default_features, "Active model bundle not yet trained; using fallback system.")
    return explain_prediction_with_shap(model_bundle, default_features, metadata)


@app.post("/evaluate")
def evaluate_endpoint(req: EvaluateRequest):
    model_bundle, metadata = load_active_model()
    if not metadata:
        raise HTTPException(status_code=503, detail="No active model trained to evaluate.")

    if req.records and len(req.records) > 0:
        # Evaluate on supplied external records
        pipeline = model_bundle['pipeline']
        df_eval = build_dataframe(req.records)
        y_true = np.array([1 if str(r.get('outcomeStatus', '')).lower() == 'completed' else 0 for r in req.records])
        y_prob = pipeline.predict_proba(df_eval)[:, 1] if hasattr(pipeline, 'predict_proba') else np.full(len(y_true), 0.5)
        y_pred = (y_prob >= 0.5).astype(int)
        metrics = evaluate_predictions(y_true, y_pred, y_prob)
        return {
            "dataset": "Supplied evaluation dataset",
            "metrics": metrics
        }

    # Return baseline training evaluation metrics
    return {
        "dataset": metadata.get("data_source", "Training cross-validation"),
        "model_name": metadata.get("model_name"),
        "model_version": metadata.get("model_version"),
        "metrics": metadata.get("selected_model_metrics"),
        "class_distribution": metadata.get("class_distribution"),
        "model_comparison": metadata.get("model_comparison"),
        "limitation_notice": metadata.get("limitation_notice")
    }
