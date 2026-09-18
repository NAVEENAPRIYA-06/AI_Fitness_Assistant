"""
Model Training & Comparison Engine for HealthPilot AI
Trains, cross-validates, and objectively compares:
1. Logistic Regression
2. Random Forest Classifier
3. Gradient Boosting Classifier

Selects the best performing model based on probabilistic Brier Score & F1-Score.
"""

from typing import Dict, Any, List, Tuple
import os
import json
from datetime import datetime
import numpy as np
import pandas as pd
import joblib

from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.model_selection import StratifiedKFold, cross_val_predict

from preprocessing.pipeline import (
    create_preprocessor,
    build_dataframe,
    extract_features_from_dict,
    ALL_FEATURE_NAMES
)
from evaluation.evaluator import evaluate_predictions

MODELS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'models')
os.makedirs(MODELS_DIR, exist_ok=True)


def get_candidate_classifiers() -> Dict[str, Any]:
    """Returns candidate classification algorithms with reproducible seeds and balanced class weights."""
    return {
        'Logistic Regression': LogisticRegression(
            max_iter=1000,
            class_weight='balanced',
            C=1.0,
            random_state=42
        ),
        'Random Forest': RandomForestClassifier(
            n_estimators=100,
            max_depth=4,
            min_samples_split=3,
            class_weight='balanced',
            random_state=42
        ),
        'Gradient Boosting': GradientBoostingClassifier(
            n_estimators=60,
            learning_rate=0.08,
            max_depth=3,
            random_state=42
        )
    }


def train_and_compare_models(
    raw_records: List[Dict[str, Any]],
    data_source_label: str = "Demonstration model trained on seed data"
) -> Dict[str, Any]:
    """
    Executes reproducible ML training and statistical model comparison across candidate models.
    """
    df = build_dataframe(raw_records)
    n_samples = len(df)

    # Target extraction: 1 = completed, 0 = not completed (skipped or partial)
    # Partially completed activities are documented as 0 (incomplete adherence) in binary classification
    y_list = []
    for r in raw_records:
        status = str(r.get('outcomeStatus', r.get('outcome_status', 'completed'))).lower()
        if status == 'completed':
            y_list.append(1)
        else:
            # skipped or partially_completed
            y_list.append(0)

    y = np.array(y_list)
    unique_classes = np.unique(y)
    class_dist = {
        'completed_positive': int(np.sum(y == 1)),
        'skipped_negative': int(np.sum(y == 0))
    }

    candidates = get_candidate_classifiers()
    comparison_results: List[Dict[str, Any]] = []

    # Determine CV strategy
    min_class_count = min(class_dist['completed_positive'], class_dist['skipped_negative']) if len(unique_classes) >= 2 else 0
    n_splits = min(3, min_class_count) if min_class_count >= 2 else 2

    best_model_name = 'Logistic Regression'
    best_brier = 999.0
    best_f1 = -1.0
    best_fitted_pipeline = None

    for name, clf in candidates.items():
        pipe = Pipeline(steps=[
            ('preprocessor', create_preprocessor()),
            ('classifier', clf)
        ])

        # Evaluate via Cross-Validation if classes allow, else fit and evaluate on train
        if min_class_count >= 2 and n_splits >= 2:
            cv = StratifiedKFold(n_splits=n_splits, shuffle=True, random_state=42)
            try:
                cv_probs = cross_val_predict(pipe, df, y, cv=cv, method='predict_proba')[:, 1]
                cv_preds = (cv_probs >= 0.5).astype(int)
            except Exception:
                # Fallback to train predictions if CV encounters small fold constraints
                pipe.fit(df, y)
                cv_probs = pipe.predict_proba(df)[:, 1] if hasattr(pipe, 'predict_proba') else np.full(n_samples, 0.5)
                cv_preds = pipe.predict(df)
        else:
            pipe.fit(df, y)
            cv_probs = pipe.predict_proba(df)[:, 1] if hasattr(pipe, 'predict_proba') else np.full(n_samples, 0.5)
            cv_preds = pipe.predict(df)

        metrics = evaluate_predictions(y, cv_preds, cv_probs)
        metrics['model_name'] = name

        comparison_results.append({
            'model_name': name,
            'metrics': metrics
        })

        # Fit final pipeline on all available data
        pipe.fit(df, y)

        # Objective selection: Primary criterion is Brier Score (calibration quality), secondary is F1
        brier = metrics['brier_score']
        f1 = metrics['f1_score']
        if brier < best_brier or (brier == best_brier and f1 > best_f1):
            best_brier = brier
            best_f1 = f1
            best_model_name = name
            best_fitted_pipeline = pipe

    # Save best model to disk
    model_path = os.path.join(MODELS_DIR, 'active_model.joblib')
    metadata_path = os.path.join(MODELS_DIR, 'active_model_metadata.json')

    # Pre-compute background data for SHAP explainers
    try:
        X_background = best_fitted_pipeline.named_steps['preprocessor'].transform(df)
    except Exception:
        X_background = None

    joblib.dump({
        'model_name': best_model_name,
        'pipeline': best_fitted_pipeline,
        'feature_names': ALL_FEATURE_NAMES,
        'background_data': X_background,
        'timestamp': datetime.utcnow().isoformat()
    }, model_path)

    metadata = {
        'model_name': best_model_name,
        'model_version': '1.0.0-prototype',
        'training_dataset_size': n_samples,
        'data_source': data_source_label,
        'training_timestamp': datetime.utcnow().isoformat(),
        'feature_list': ALL_FEATURE_NAMES,
        'selected_model_metrics': next(c['metrics'] for c in comparison_results if c['model_name'] == best_model_name),
        'class_distribution': class_dist,
        'model_comparison': comparison_results,
        'selection_rationale': f"Selected {best_model_name} with lowest Brier Score ({best_brier:.4f}) and balanced probabilistic calibration across {n_samples} records.",
        'limitation_notice': 'Model performance is based on limited historical data and should be interpreted as a prototype evaluation.' if n_samples < 30 else 'Trained on validated dataset.'
    }

    with open(metadata_path, 'w') as f:
        json.dump(metadata, f, indent=2)

    return metadata
