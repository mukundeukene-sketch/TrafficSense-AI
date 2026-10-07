import pandas as pd
import numpy as np
import joblib
import os

# ============================================================
# PATH
# ============================================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

DATA_PATH = os.path.join(
    BASE_DIR,
    "..",
    "data",
    "processed_traffic.csv"
)

THRESHOLD_PATH = os.path.join(
    BASE_DIR,
    "..",
    "models",
    "risk_thresholds.pkl"
)

# ============================================================
# LOAD DATA
# ============================================================

df = pd.read_csv(DATA_PATH)

# Same chronological split used during model training
split_index = int(len(df) * 0.8)

train_data = df.iloc[:split_index]

train_target = train_data["traffic_volume"]

# ============================================================
# CALCULATE THRESHOLDS FROM TRAINING DATA ONLY
# ============================================================

LOW_THRESHOLD = int(
    np.percentile(train_target, 33)
)

HIGH_THRESHOLD = int(
    np.percentile(train_target, 66)
)

# ============================================================
# SAVE THRESHOLDS
# ============================================================

thresholds = {
    "low_threshold": LOW_THRESHOLD,
    "high_threshold": HIGH_THRESHOLD
}

joblib.dump(
    thresholds,
    THRESHOLD_PATH
)

# ============================================================
# RISK ENGINE
# ============================================================

def get_risk_level(predicted_volume):

    if predicted_volume <= LOW_THRESHOLD:
        return "LOW"

    elif predicted_volume <= HIGH_THRESHOLD:
        return "MEDIUM"

    else:
        return "HIGH"


# ============================================================
# DISPLAY
# ============================================================

if __name__ == "__main__":

    print("\n===== TRAFFICSENSE AI RISK ENGINE =====")

    print(
        f"Low threshold  : {LOW_THRESHOLD}"
    )

    print(
        f"High threshold : {HIGH_THRESHOLD}"
    )

    print("\nRisk Tests:")

    test_values = [
        1000,
        3500,
        6000
    ]

    for value in test_values:

        print(
            f"{value} -> "
            f"{get_risk_level(value)}"
        )

    print(
        f"\nThresholds saved to:\n"
        f"{THRESHOLD_PATH}"
    )