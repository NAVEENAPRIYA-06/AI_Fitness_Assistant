"""
Explainable AI (XAI) Engine for HealthPilot Adherence Prediction
Provides genuine SHAP (SHapley Additive exPlanations) values for trained Scikit-Learn models:
- LinearExplainer for Logistic Regression (with empirical background dataset)
- TreeExplainer for Random Forest and Gradient Boosting models
- Explicit system fallback if SHAP cannot be calculated, clearly labeled as non-SHAP fallback.
"""

from typing import Dict, Any, List, Optional, Tuple
import os
import sys
import numpy as np
import pandas as pd
import shap
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier

from preprocessing.pipeline import (
    build_dataframe,
    extract_features_from_dict,
    ALL_FEATURE_NAMES,
    NUMERICAL_FEATURES,
    CATEGORICAL_FEATURES
)


def _generate_careful_human_explanation(feature: str, raw_value: Any, shap_val: float) -> str:
    """
    Generates user-facing natural language explanation using disciplined, non-causal language:
    - 'increased the predicted likelihood'
    - 'reduced the predicted likelihood'
    - 'contributed to the prediction'
    Strictly avoids: 'caused', 'guarantees', 'will definitely', 'medically optimal'.
    """
    is_pos = shap_val > 0
    verb = "increased the predicted likelihood" if is_pos else "reduced the predicted likelihood"

    if feature == 'available_minutes':
        if is_pos:
            return f"Your available {raw_value} minutes increased the predicted likelihood of completing this session."
        else:
            return f"Your constrained available time ({raw_value} minutes) reduced the predicted likelihood of completing this session."

    if feature == 'recommended_duration_minutes':
        if is_pos:
            return f"The proposed session duration ({raw_value} minutes) fits your schedule profile and increased predicted adherence."
        else:
            return f"The proposed session duration ({raw_value} minutes) placed additional demand on your schedule, reducing the predicted likelihood."

    if feature == 'time_margin_minutes':
        margin = int(raw_value)
        if margin >= 10:
            return f"Your {margin}-minute schedule buffer increased the predicted likelihood by reducing execution stress."
        elif margin < 0:
            return f"A schedule deficit ({abs(margin)} min shortfall) reduced the predicted likelihood of session completion."
        else:
            return f"A tight schedule margin ({margin} minutes) contributed to lower predicted adherence."

    if feature == 'fatigue_level':
        if is_pos:
            return f"Your low reported fatigue ({raw_value}/10) increased the predicted likelihood of completing the activity."
        else:
            return f"Your elevated fatigue ({raw_value}/10) reduced the predicted likelihood of completing a demanding session."

    if feature == 'energy_level':
        if is_pos:
            return f"Your subjective energy level ({raw_value}/10) increased the predicted likelihood of follow-through."
        else:
            return f"Your lower energy rating ({raw_value}/10) reduced the predicted likelihood of completion."

    if feature == 'sleep_hours':
        if is_pos:
            return f"Your {raw_value} hours of sleep supported physical readiness and increased the predicted likelihood."
        else:
            return f"Your restricted sleep duration ({raw_value} hours) reduced the predicted likelihood of completing this session."

    if feature == 'environment':
        val_str = str(raw_value).lower()
        if val_str == 'home' and is_pos:
            return "Executing this activity at home increased the predicted likelihood by eliminating commute friction."
        elif val_str == 'gym' and not is_pos:
            return "The gym environment reduced the predicted likelihood due to transit overhead and logistical requirements."
        elif val_str == 'outdoor' and is_pos:
            return "The outdoor environment aligned with your current behavioral readiness and increased predicted completion."
        else:
            return f"The {raw_value} environment {verb} of adherence based on your past locations."

    if feature == 'intensity':
        val_str = str(raw_value).lower()
        if is_pos:
            return f"The {val_str} intensity level matched your current readiness and increased the predicted likelihood."
        else:
            return f"The demanding {val_str} intensity reduced the predicted likelihood given today's fatigue and sleep profile."

    if feature == 'historical_completion_rate':
        if is_pos:
            return f"Your strong historical completion rate ({raw_value}%) contributed positively to the predicted adherence."
        else:
            return f"Your previous lower completion rate ({raw_value}%) reduced the predicted likelihood for this activity domain."

    if feature == 'behavioral_momentum':
        if is_pos:
            return f"Your active habit consistency score ({raw_value}/100) increased the predicted completion likelihood."
        else:
            return f"Rebuilding habit momentum ({raw_value}/100) contributed to conservative predicted adherence."

    if feature == 'stress_level':
        if is_pos:
            return f"Manageable subjective stress ({raw_value}/10) contributed favorably to the adherence prediction."
        else:
            return f"Elevated stress ({raw_value}/10) reduced the predicted likelihood of completing the planned session."

    if feature == 'soreness_level':
        if is_pos:
            return f"Minimal muscle soreness ({raw_value}/10) supported session readiness and increased predicted completion."
        else:
            return f"Active muscle soreness ({raw_value}/10) reduced the predicted likelihood of completing this candidate workout."

    # Generic fallback phrase with strictly disciplined language
    friendly_name = feature.replace('_', ' ').title()
    return f"{friendly_name} ({raw_value}) {verb} of following this recommendation."


def get_default_background(preprocessor) -> np.ndarray:
    """Generates a representative background dataset for SHAP explainers from seed outcomes."""
    try:
        from train_seed import SEED_OUTCOMES
        df_seed = build_dataframe(SEED_OUTCOMES)
        return preprocessor.transform(df_seed)
    except Exception:
        synthetic_records = [
            {'available_minutes': 30, 'recommended_duration_minutes': 25, 'energy_level': 6, 'fatigue_level': 5, 'sleep_hours': 7.0, 'environment': 'home', 'activity_type': 'functional_strength', 'intensity': 'moderate'},
            {'available_minutes': 20, 'recommended_duration_minutes': 20, 'energy_level': 5, 'fatigue_level': 6, 'sleep_hours': 6.5, 'environment': 'home', 'activity_type': 'mobility_and_stretching', 'intensity': 'low'},
            {'available_minutes': 45, 'recommended_duration_minutes': 45, 'energy_level': 7, 'fatigue_level': 4, 'sleep_hours': 7.5, 'environment': 'gym', 'activity_type': 'aerobic_cardio', 'intensity': 'high'}
        ]
        return preprocessor.transform(build_dataframe(synthetic_records))


_CACHED_EXPLAINER: Optional[Any] = None
_CACHED_MODEL_TIMESTAMP: Optional[str] = None


def get_cached_explainer(clf, background_data, model_timestamp: str):
    global _CACHED_EXPLAINER, _CACHED_MODEL_TIMESTAMP
    if _CACHED_EXPLAINER is not None and _CACHED_MODEL_TIMESTAMP == model_timestamp:
        return _CACHED_EXPLAINER

    clf_name = type(clf).__name__
    if isinstance(clf, LogisticRegression) or clf_name == 'LogisticRegression':
        masker = shap.maskers.Independent(data=background_data)
        explainer = shap.LinearExplainer(clf, masker=masker)
    elif isinstance(clf, (RandomForestClassifier, GradientBoostingClassifier)) or 'Forest' in clf_name or 'Boosting' in clf_name:
        explainer = shap.TreeExplainer(clf, data=background_data)
    else:
        masker = shap.maskers.Independent(data=background_data)
        explainer = shap.Explainer(clf.predict_proba, masker)

    _CACHED_EXPLAINER = explainer
    _CACHED_MODEL_TIMESTAMP = model_timestamp
    return explainer


def explain_prediction_with_shap(
    model_bundle: Dict[str, Any],
    raw_features: Dict[str, Any],
    metadata: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Computes genuine SHAP explanations for a single prediction.
    Falls back gracefully if SHAP cannot be calculated, explicitly labeling the fallback.
    """
    if not model_bundle or 'pipeline' not in model_bundle:
        return _create_system_fallback_explanation(raw_features, "Model pipeline uninitialized or missing.")

    pipeline = model_bundle['pipeline']
    preprocessor = pipeline.named_steps.get('preprocessor')
    clf = pipeline.named_steps.get('classifier')

    if not preprocessor or not clf:
        return _create_system_fallback_explanation(raw_features, "Pipeline missing preprocessor or classifier step.")

    # 1. Prepare single-row DataFrame
    extracted = extract_features_from_dict(raw_features)
    df_single = pd.DataFrame([extracted])

    # 2. Get transformed vector and feature names
    try:
        X_trans = preprocessor.transform(df_single)
        feature_names_out = list(preprocessor.get_feature_names_out())
    except Exception as e:
        return _create_system_fallback_explanation(raw_features, f"Feature preprocessing failed: {str(e)}")

    # 3. Model prediction probability
    try:
        if hasattr(pipeline, "predict_proba"):
            probs = pipeline.predict_proba(df_single)[0]
            prob_positive = float(probs[1]) if len(probs) > 1 else float(probs[0])
        else:
            prob_positive = float(pipeline.predict(df_single)[0])
        prob_positive = max(0.02, min(0.98, prob_positive))
    except Exception:
        prob_positive = 0.50

    predicted_percentage = int(round(prob_positive * 100))
    predicted_class_label = "likely_to_complete" if prob_positive >= 0.50 else "risk_of_skip_or_incomplete"

    # 4. Compute SHAP values
    background_data = model_bundle.get('background_data')
    if background_data is None or len(background_data) == 0:
        background_data = get_default_background(preprocessor)

    try:
        clf_name = type(clf).__name__
        base_value: Optional[float] = None
        shap_values_raw: Optional[np.ndarray] = None
        model_ts = str(model_bundle.get('timestamp', 'default'))

        explainer = get_cached_explainer(clf, background_data, model_ts)

        if isinstance(clf, LogisticRegression) or clf_name == 'LogisticRegression':
            sv = explainer(X_trans)
            shap_values_raw = sv.values[0]
            base_value = float(explainer.expected_value)
        elif isinstance(clf, (RandomForestClassifier, GradientBoostingClassifier)) or 'Forest' in clf_name or 'Boosting' in clf_name:
            sv = explainer.shap_values(X_trans)
            if isinstance(sv, list):
                shap_values_raw = sv[1][0] if len(sv) > 1 else sv[0][0]
                base_value = float(explainer.expected_value[1]) if hasattr(explainer.expected_value, '__iter__') else float(explainer.expected_value)
            elif len(np.shape(sv)) == 3:
                shap_values_raw = sv[0, :, 1]
                base_value = float(explainer.expected_value[1]) if hasattr(explainer.expected_value, '__iter__') else float(explainer.expected_value)
            else:
                shap_values_raw = sv[0]
                base_value = float(explainer.expected_value)
        else:
            sv = explainer(X_trans)
            shap_values_raw = sv.values[0, :, 1] if len(sv.values.shape) == 3 else sv.values[0]
            base_value = float(explainer.expected_value[1]) if hasattr(explainer.expected_value, '__iter__') else float(explainer.expected_value)

        if shap_values_raw is None:
            raise ValueError("SHAP explainer produced null values.")

        # 5. Aggregate transformed one-hot/scaled features back to domain features
        aggregated_shap: Dict[str, float] = {}
        for feat_name, shap_val in zip(feature_names_out, shap_values_raw):
            # Parse 'num__feature_name' or 'cat__feature_name_category'
            clean_name = feat_name
            if feat_name.startswith('num__'):
                clean_name = feat_name.replace('num__', '')
            elif feat_name.startswith('cat__'):
                part = feat_name.replace('cat__', '')
                # Find matching categorical feature name
                for cat in CATEGORICAL_FEATURES:
                    if part.startswith(cat):
                        clean_name = cat
                        break
            aggregated_shap[clean_name] = aggregated_shap.get(clean_name, 0.0) + float(shap_val)

        # 6. Build structured contributions array
        contributions: List[Dict[str, Any]] = []
        for feat, shap_val in aggregated_shap.items():
            raw_val = extracted.get(feat, raw_features.get(feat, 'N/A'))
            rounded_shap = round(float(shap_val), 4)
            if abs(rounded_shap) < 0.0001:
                continue

            direction = "positive" if rounded_shap > 0 else "negative"
            explanation_text = _generate_careful_human_explanation(feat, raw_val, rounded_shap)

            contributions.append({
                "feature": feat,
                "displayName": feat.replace('_', ' ').title(),
                "value": raw_val,
                "shapValue": rounded_shap,
                "direction": direction,
                "humanExplanation": explanation_text,
                "impactScore": rounded_shap
            })

        # Sort contributions by absolute impact descending
        contributions.sort(key=lambda c: abs(c["shapValue"]), reverse=True)

        top_positive = [c for c in contributions if c["shapValue"] > 0][:4]
        top_negative = [c for c in contributions if c["shapValue"] < 0][:4]

        # Top factors summary string for quick UI badges
        top_positive_summaries = [c["humanExplanation"] for c in top_positive]
        top_negative_summaries = [c["humanExplanation"] for c in top_negative]

        model_name = metadata.get("model_name", type(clf).__name__) if metadata else type(clf).__name__
        model_version = metadata.get("model_version", "1.0.0-prototype") if metadata else "1.0.0-prototype"

        return {
            "prediction": round(prob_positive, 4),
            "predictedAdherence": predicted_percentage,
            "predictedClass": predicted_class_label,
            "model": model_name,
            "modelVersion": model_version,
            "explanationMethod": "SHAP",
            "isGenuineShap": True,
            "explanationStatus": "genuine_shap",
            "baseValue": round(base_value, 4) if base_value is not None else None,
            "features": extracted,
            "contributions": contributions,
            "topPositiveFactors": top_positive,
            "topNegativeFactors": top_negative,
            "topPositiveSummaries": top_positive_summaries,
            "topNegativeSummaries": top_negative_summaries,
            "disclaimerNotice": "Predictive statistical associations based on historical behavioral patterns; does not represent causal or medical conclusions."
        }

    except Exception as e:
        # Return clearly labeled fallback
        return _create_system_fallback_explanation(
            raw_features,
            f"SHAP calculation could not complete ({str(e)}). Displaying baseline heuristic attribution.",
            model_bundle,
            metadata
        )


def _create_system_fallback_explanation(
    raw_features: Dict[str, Any],
    fallback_reason: str,
    model_bundle: Optional[Dict[str, Any]] = None,
    metadata: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Returns a clearly marked system fallback explanation.
    Never misrepresents heuristics as genuine SHAP values.
    """
    extracted = extract_features_from_dict(raw_features)
    time_margin = extracted['time_margin_minutes']
    energy = extracted['energy_level']
    fatigue = extracted['fatigue_level']
    avail = extracted['available_minutes']

    contributions: List[Dict[str, Any]] = []

    # Heuristic impact weights (strictly labeled as fallback heuristics)
    if time_margin >= 15:
        contributions.append({
            "feature": "time_margin_minutes",
            "displayName": "Schedule Buffer",
            "value": time_margin,
            "shapValue": 0.20,
            "direction": "positive",
            "humanExplanation": f"Your available {int(avail)} minutes increased the predicted likelihood of completing this session.",
            "impactScore": 0.20
        })
    elif time_margin < 0:
        contributions.append({
            "feature": "time_margin_minutes",
            "displayName": "Schedule Deficit",
            "value": time_margin,
            "shapValue": -0.28,
            "direction": "negative",
            "humanExplanation": f"A schedule deficit ({int(abs(time_margin))} min deficit) reduced the predicted likelihood of completion.",
            "impactScore": -0.28
        })

    if fatigue >= 7:
        contributions.append({
            "feature": "fatigue_level",
            "displayName": "Systemic Fatigue",
            "value": fatigue,
            "shapValue": -0.24,
            "direction": "negative",
            "humanExplanation": f"Your elevated fatigue ({int(fatigue)}/10) reduced the predicted likelihood of completing a demanding session.",
            "impactScore": -0.24
        })
    elif energy >= 7:
        contributions.append({
            "feature": "energy_level",
            "displayName": "Energy Readiness",
            "value": energy,
            "shapValue": 0.18,
            "direction": "positive",
            "humanExplanation": f"Your high subjective energy level ({int(energy)}/10) increased the predicted likelihood of follow-through.",
            "impactScore": 0.18
        })

    if extracted['environment'] == 'home':
        contributions.append({
            "feature": "environment",
            "displayName": "Home Environment",
            "value": "home",
            "shapValue": 0.14,
            "direction": "positive",
            "humanExplanation": "Executing this activity at home increased the predicted likelihood by eliminating commute friction.",
            "impactScore": 0.14
        })

    top_pos = [c for c in contributions if c["direction"] == "positive"]
    top_neg = [c for c in contributions if c["direction"] == "negative"]

    model_name = metadata.get("model_name", "Baseline Heuristic Model") if metadata else "Baseline Heuristic Model"
    model_version = metadata.get("model_version", "1.0.0-fallback") if metadata else "1.0.0-fallback"

    return {
        "prediction": 0.72,
        "predictedAdherence": 72,
        "predictedClass": "likely_to_complete",
        "model": model_name,
        "modelVersion": model_version,
        "explanationMethod": "Heuristic System Fallback (Non-SHAP)",
        "isGenuineShap": False,
        "explanationStatus": "model_system_fallback",
        "fallbackReason": fallback_reason,
        "baseValue": None,
        "features": extracted,
        "contributions": contributions,
        "topPositiveFactors": top_pos,
        "topNegativeFactors": top_neg,
        "topPositiveSummaries": [c["humanExplanation"] for c in top_pos],
        "topNegativeSummaries": [c["humanExplanation"] for c in top_neg],
        "disclaimerNotice": "NOTICE: This explanation uses heuristic domain fallback attributions, NOT genuine SHAP values. Used when SHAP calculation is unavailable."
    }
