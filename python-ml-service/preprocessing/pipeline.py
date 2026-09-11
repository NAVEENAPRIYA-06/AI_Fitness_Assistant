"""
Preprocessing Pipeline for HealthPilot AI Adherence Prediction
Reproducible data transformation using Scikit-Learn ColumnTransformer and Pipeline.
Guarantees identical feature transformations for training, evaluation, and online inference.
"""

from typing import List, Dict, Any, Tuple
import pandas as pd
import numpy as np
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.impute import SimpleImputer

# Numerical features requiring imputation and standard scaling
NUMERICAL_FEATURES: List[str] = [
    'sleep_hours',
    'sleep_quality',
    'energy_level',
    'fatigue_level',
    'stress_level',
    'soreness_level',
    'available_minutes',
    'recommended_duration_minutes',
    'time_margin_minutes',
    'energy_fatigue_ratio',
    'historical_completion_rate',
    'historical_skip_rate',
    'historical_partial_rate',
    'behavioral_momentum',
    'goal_priority_numeric'
]

# Categorical features requiring imputation and one-hot encoding
CATEGORICAL_FEATURES: List[str] = [
    'environment',
    'activity_type',
    'intensity',
    'recommended_time',
    'day_of_week',
    'preferred_environment',
    'preferred_time'
]

ALL_FEATURE_NAMES = NUMERICAL_FEATURES + CATEGORICAL_FEATURES


def extract_features_from_dict(d: Dict[str, Any]) -> Dict[str, Any]:
    """
    Extracts strictly pre-intervention features from raw payload.
    Avoids target leakage (no actualDuration, no outcomeReason, no perceivedEffort).
    """
    avail = float(d.get('available_minutes', d.get('availableMinutes', 30)))
    rec_dur = float(d.get('recommended_duration_minutes', d.get('durationMinutes', d.get('candidateDurationMinutes', 30))))
    energy = float(d.get('energy_level', d.get('energyLevel', 5)))
    fatigue = float(d.get('fatigue_level', d.get('fatigueLevel', 5)))

    return {
        'sleep_hours': float(d.get('sleep_hours', d.get('sleepHours', 7.0))),
        'sleep_quality': float(d.get('sleep_quality', d.get('sleepQuality', 7.0))),
        'energy_level': energy,
        'fatigue_level': fatigue,
        'stress_level': float(d.get('stress_level', d.get('stressLevel', 4.0))),
        'soreness_level': float(d.get('soreness_level', d.get('sorenessLevel', 3.0))),
        'available_minutes': avail,
        'recommended_duration_minutes': rec_dur,
        'time_margin_minutes': avail - rec_dur,
        'energy_fatigue_ratio': round((energy + 1.0) / (fatigue + 1.0), 3),
        'historical_completion_rate': float(d.get('historical_completion_rate', d.get('completionRateOverall', 70.0))),
        'historical_skip_rate': float(d.get('historical_skip_rate', d.get('skipRateOverall', 20.0))),
        'historical_partial_rate': float(d.get('historical_partial_rate', d.get('partialRateOverall', 10.0))),
        'behavioral_momentum': float(d.get('behavioral_momentum', d.get('behavioralMomentum', 65.0))),
        'goal_priority_numeric': float(d.get('goal_priority_numeric', d.get('goalPriority', 1.0))),
        
        # Categorical
        'environment': str(d.get('environment', 'home')).lower(),
        'activity_type': str(d.get('activity_type', d.get('category', 'functional_strength'))).lower(),
        'intensity': str(d.get('intensity', 'moderate')).lower(),
        'recommended_time': str(d.get('recommended_time', d.get('preferredTime', 'morning'))).lower(),
        'day_of_week': str(d.get('day_of_week', 'Monday')).capitalize(),
        'preferred_environment': str(d.get('preferred_environment', 'home')).lower(),
        'preferred_time': str(d.get('preferred_time', 'morning')).lower()
    }


def create_preprocessor() -> ColumnTransformer:
    """
    Builds a Scikit-Learn ColumnTransformer for consistent numerical and categorical preprocessing.
    """
    numerical_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='median')),
        ('scaler', StandardScaler())
    ])

    categorical_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='constant', fill_value='missing')),
        ('onehot', OneHotEncoder(handle_unknown='ignore', sparse_output=False))
    ])

    preprocessor = ColumnTransformer(
        transformers=[
            ('num', numerical_transformer, NUMERICAL_FEATURES),
            ('cat', categorical_transformer, CATEGORICAL_FEATURES)
        ],
        remainder='drop'
    )
    return preprocessor


def build_dataframe(records: List[Dict[str, Any]]) -> pd.DataFrame:
    """Converts raw list of records into a structured pandas DataFrame."""
    cleaned = [extract_features_from_dict(r) for r in records]
    return pd.DataFrame(cleaned)
