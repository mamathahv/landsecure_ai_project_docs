import os
import json
import joblib
import numpy as np

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MODEL_DIR = os.path.join(BASE_DIR, "..", "ml", "models")
MODEL_DIR = os.path.abspath(MODEL_DIR)

_model = None
_scaler = None
_features = None
_knn = None


def _load():
    global _model, _scaler, _features, _knn
    if _model is not None:
        return
    _model = joblib.load(os.path.join(MODEL_DIR, "random_forest.joblib"))
    _knn = joblib.load(os.path.join(MODEL_DIR, "knn.joblib"))
    _scaler = joblib.load(os.path.join(MODEL_DIR, "scaler.joblib"))
    with open(os.path.join(MODEL_DIR, "features.json")) as f:
        _features = json.load(f)


def is_loaded() -> bool:
    try:
        _load()
        return True
    except Exception:
        return False


def predict(features: dict, model_name: str = "random_forest") -> dict:
    _load()
    vec = np.array([[features.get(f, 0) for f in _features]], dtype=float)
    if model_name == "knn":
        vec_s = _scaler.transform(vec)
        clf = _knn
        x = vec_s
    else:
        clf = _model
        x = vec
    pred = int(clf.predict(x)[0])
    proba = float(clf.predict_proba(x)[0][1])
    if pred == 0:
        severity = "LOW"
    elif proba >= 0.85:
        severity = "CRITICAL"
    elif proba >= 0.65:
        severity = "HIGH"
    elif proba >= 0.45:
        severity = "MEDIUM"
    else:
        severity = "LOW"

    # simple explanation based on feature contributions
    importances = getattr(_model, "feature_importances_", None)
    reasons = []
    if importances is not None:
        for f, imp in sorted(zip(_features, importances), key=lambda t: -t[1])[:3]:
            val = features.get(f, 0)
            reasons.append(f"{f}={val} (importance {imp:.2f})")
    explanation = "Suspicious" if pred == 1 else "Normal"
    if reasons:
        explanation += "; top factors: " + ", ".join(reasons)

    return {
        "predicted_class": "suspicious" if pred == 1 else "normal",
        "score": round(proba, 4),
        "severity": severity,
        "model": model_name,
        "explanation": explanation,
    }
