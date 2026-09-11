"""
Model Evaluation Module for HealthPilot AI
Calculates classification, probability calibration, and research metrics.
Handles small-sample constraints and missing classes safely.
"""

from typing import Dict, Any, List, Optional
import numpy as np
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    confusion_matrix,
    brier_score_loss
)


def evaluate_predictions(
    y_true: np.ndarray,
    y_pred: np.ndarray,
    y_prob: np.ndarray
) -> Dict[str, Any]:
    """
    Computes standard classification and probabilistic calibration metrics.
    Guarantees robust fallback when sample sizes are small or classes are unrepresented.
    """
    n_samples = len(y_true)
    unique_classes = np.unique(y_true)
    class_distribution = {
        'positive_completed': int(np.sum(y_true == 1)),
        'negative_skipped': int(np.sum(y_true == 0))
    }

    if n_samples == 0:
        return {
            'sample_count': 0,
            'accuracy': 0.0,
            'precision': 0.0,
            'recall': 0.0,
            'f1_score': 0.0,
            'roc_auc': None,
            'brier_score': 0.0,
            'confusion_matrix': [[0, 0], [0, 0]],
            'class_distribution': class_distribution,
            'limitation_notice': 'No samples available for evaluation.'
        }

    # Accuracy
    acc = float(accuracy_score(y_true, y_pred))

    # Precision, Recall, F1 with zero_division=0 to prevent errors
    prec = float(precision_score(y_true, y_pred, zero_division=0))
    rec = float(recall_score(y_true, y_pred, zero_division=0))
    f1 = float(f1_score(y_true, y_pred, zero_division=0))

    # Confusion matrix [[TN, FP], [FN, TP]]
    if len(unique_classes) == 2:
        cm = confusion_matrix(y_true, y_pred, labels=[0, 1]).tolist()
    else:
        # Fallback when only 1 class is present in slice
        cm = [[0, 0], [0, 0]]
        if 0 in unique_classes:
            cm[0][0] = int(np.sum((y_true == 0) & (y_pred == 0)))
            cm[0][1] = int(np.sum((y_true == 0) & (y_pred == 1)))
        if 1 in unique_classes:
            cm[1][0] = int(np.sum((y_true == 1) & (y_pred == 0)))
            cm[1][1] = int(np.sum((y_true == 1) & (y_pred == 1)))

    # ROC-AUC is only statistically meaningful if both classes exist in y_true
    roc_auc: Optional[float] = None
    if len(unique_classes) >= 2:
        try:
            roc_auc = float(roc_auc_score(y_true, y_prob))
        except Exception:
            roc_auc = None

    # Brier Score (Mean Squared Error of probabilities)
    brier = float(brier_score_loss(y_true, y_prob))

    # Limitations & warnings based on dataset scale
    limitations: List[str] = []
    if n_samples < 20:
        limitations.append('Model performance is based on limited historical data and should be interpreted as a prototype evaluation.')
    if len(unique_classes) < 2:
        limitations.append('Single class represented in test slice; ROC-AUC is statistically undefined.')
    if class_distribution['positive_completed'] == 0 or class_distribution['negative_skipped'] == 0:
        limitations.append('Severe class imbalance observed in evaluation dataset.')

    return {
        'sample_count': n_samples,
        'accuracy': round(acc, 4),
        'precision': round(prec, 4),
        'recall': round(rec, 4),
        'f1_score': round(f1, 4),
        'roc_auc': round(roc_auc, 4) if roc_auc is not None else None,
        'brier_score': round(brier, 4),
        'confusion_matrix': cm,
        'class_distribution': class_distribution,
        'limitation_notice': ' | '.join(limitations) if limitations else 'Adequate evaluation dataset.'
    }
