import numpy as np
import pandas as pd
import os

RNG = np.random.default_rng(42)

def make_normal(n):
    return pd.DataFrame({
        "failed_login_count": RNG.poisson(0.3, n).clip(0, 3),
        "requests_per_minute": RNG.normal(5, 2, n).clip(1, 12).round(2),
        "access_outside_normal_hours": RNG.choice([0, 1], n, p=[0.9, 0.1]),
        "permission_mismatch": RNG.choice([0, 1], n, p=[0.98, 0.02]),
        "records_modified_short_period": RNG.poisson(0.2, n).clip(0, 2),
        "repeated_requests_same_source": RNG.poisson(0.5, n).clip(0, 3),
        "hash_mismatch": RNG.choice([0, 1], n, p=[0.99, 0.01]),
        "auth_result": RNG.choice([0, 1], n, p=[0.05, 0.95]),
        "label": 0,
    })

def make_suspicious(n):
    return pd.DataFrame({
        "failed_login_count": RNG.poisson(6, n).clip(2, 20),
        "requests_per_minute": RNG.normal(40, 10, n).clip(20, 80).round(2),
        "access_outside_normal_hours": RNG.choice([0, 1], n, p=[0.2, 0.8]),
        "permission_mismatch": RNG.choice([0, 1], n, p=[0.3, 0.7]),
        "records_modified_short_period": RNG.poisson(5, n).clip(2, 15),
        "repeated_requests_same_source": RNG.poisson(8, n).clip(3, 25),
        "hash_mismatch": RNG.choice([0, 1], n, p=[0.6, 0.4]),
        "auth_result": RNG.choice([0, 1], n, p=[0.7, 0.3]),
        "label": 1,
    })

if __name__ == "__main__":
    n_normal = 1200
    n_susp = 400
    df = pd.concat([make_normal(n_normal), make_suspicious(n_susp)], ignore_index=True)
    df = df.sample(frac=1, random_state=42).reset_index(drop=True)
    out = os.path.join(os.path.dirname(__file__), "..", "data", "activity_dataset.csv")
    os.makedirs(os.path.dirname(out), exist_ok=True)
    df.to_csv(out, index=False)
    print("Saved", out, "shape", df.shape)
    print(df["label"].value_counts().to_dict())
