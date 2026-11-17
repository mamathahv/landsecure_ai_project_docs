import os
import json
import numpy as np
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix, roc_auc_score

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(BASE, "data", "activity_dataset.csv")
MODELS = os.path.join(BASE, "models")
REPORTS = os.path.join(BASE, "reports")
os.makedirs(MODELS, exist_ok=True)
os.makedirs(REPORTS, exist_ok=True)

FEATURES = [
    "failed_login_count",
    "requests_per_minute",
    "access_outside_normal_hours",
    "permission_mismatch",
    "records_modified_short_period",
    "repeated_requests_same_source",
    "hash_mismatch",
    "auth_result",
]

def main():
    df = pd.read_csv(DATA)
    X = df[FEATURES].values
    y = df["label"].values

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.25, random_state=42, stratify=y
    )

    scaler = StandardScaler()
    X_train_s = scaler.fit_transform(X_train)
    X_test_s = scaler.transform(X_test)

    # Random Forest
    rf = RandomForestClassifier(n_estimators=200, random_state=42, class_weight="balanced")
    rf.fit(X_train, y_train)
    rf_pred = rf.predict(X_test)
    rf_proba = rf.predict_proba(X_test)[:, 1]

    # KNN
    knn = KNeighborsClassifier(n_neighbors=7)
    knn.fit(X_train_s, y_train)
    knn_pred = knn.predict(X_test_s)
    knn_proba = knn.predict_proba(X_test_s)[:, 1]

    def metrics(name, y_true, y_pred, y_proba):
        return {
            "model": name,
            "accuracy": round(float(accuracy_score(y_true, y_pred)), 4),
            "precision": round(float(precision_score(y_true, y_pred)), 4),
            "recall": round(float(recall_score(y_true, y_pred)), 4),
            "f1": round(float(f1_score(y_true, y_pred)), 4),
            "roc_auc": round(float(roc_auc_score(y_true, y_proba)), 4),
            "confusion_matrix": confusion_matrix(y_true, y_pred).tolist(),
        }

    rf_m = metrics("RandomForest", y_test, rf_pred, rf_proba)
    knn_m = metrics("KNN", y_test, knn_pred, knn_proba)

    report = {"features": FEATURES, "random_forest": rf_m, "knn": knn_m}
    with open(os.path.join(REPORTS, "evaluation_report.json"), "w") as f:
        json.dump(report, f, indent=2)
    print(json.dumps(report, indent=2))

    # Save artifacts: use Random Forest as primary (no scaling needed), but save scaler for KNN
    joblib.dump(rf, os.path.join(MODELS, "random_forest.joblib"))
    joblib.dump(knn, os.path.join(MODELS, "knn.joblib"))
    joblib.dump(scaler, os.path.join(MODELS, "scaler.joblib"))
    with open(os.path.join(MODELS, "features.json"), "w") as f:
        json.dump(FEATURES, f)
    print("Artifacts saved to", MODELS)

if __name__ == "__main__":
    main()
