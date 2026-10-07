import pandas as pd
import joblib
import os


# ============================================================
# PATH CONFIGURATION
# ============================================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

MODEL_PATH = os.path.join(
    BASE_DIR,
    "..",
    "models",
    "traffic_model.pkl"
)

PREPROCESSOR_PATH = os.path.join(
    BASE_DIR,
    "..",
    "models",
    "preprocessor.pkl"
)

THRESHOLD_PATH = os.path.join(
    BASE_DIR,
    "..",
    "models",
    "risk_thresholds.pkl"
)


# ============================================================
# LOAD MODEL, PREPROCESSOR & RISK THRESHOLDS
# ============================================================

model = joblib.load(MODEL_PATH)

preprocessor = joblib.load(
    PREPROCESSOR_PATH
)

thresholds = joblib.load(
    THRESHOLD_PATH
)

LOW_THRESHOLD = thresholds["low_threshold"]

HIGH_THRESHOLD = thresholds["high_threshold"]


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
# TRAFFIC PREDICTION FUNCTION
# ============================================================

def predict_traffic(
    holiday,
    temperature_c,
    rain_1h,
    snow_1h,
    clouds_all,
    weather_main,
    hour,
    day_of_week,
    month,
    year,
    day_of_month,
    is_weekend
):

    # --------------------------------------------------------
    # Create input DataFrame
    # --------------------------------------------------------

    input_data = pd.DataFrame([
        {
            "holiday": holiday,
            "temperature_c": temperature_c,
            "rain_1h": rain_1h,
            "snow_1h": snow_1h,
            "clouds_all": clouds_all,
            "weather_main": weather_main,
            "hour": hour,
            "day_of_week": day_of_week,
            "month": month,
            "year": year,
            "day_of_month": day_of_month,
            "is_weekend": is_weekend
        }
    ])


    # --------------------------------------------------------
    # Preprocess input
    # --------------------------------------------------------

    input_processed = preprocessor.transform(
        input_data
    )


    # --------------------------------------------------------
    # Predict traffic volume
    # --------------------------------------------------------

    prediction = model.predict(
        input_processed
    )[0]


    # --------------------------------------------------------
    # Clean prediction
    # --------------------------------------------------------

    prediction = max(
        0,
        round(prediction)
    )


    # --------------------------------------------------------
    # Determine risk level
    # --------------------------------------------------------

    risk = get_risk_level(
        prediction
    )


    # --------------------------------------------------------
    # Return result
    # --------------------------------------------------------

    return {
        "predicted_traffic_volume": prediction,
        "risk_level": risk
    }


# ============================================================
# DIRECT TEST
# ============================================================

if __name__ == "__main__":

    result = predict_traffic(

        holiday="None",

        temperature_c=20,

        rain_1h=0,

        snow_1h=0,

        clouds_all=40,

        weather_main="Clear",

        hour=18,

        day_of_week=4,

        month=10,

        year=2016,

        day_of_month=7,

        is_weekend=0
    )


    print(
        "\n===== TRAFFICSENSE AI PREDICTION ====="
    )

    print(
        f"Predicted Traffic: "
        f"{result['predicted_traffic_volume']} "
        f"vehicles/hour"
    )

    print(
        f"Risk Level: "
        f"{result['risk_level']}"
    )

    print(
        f"\nRisk Thresholds:"
    )

    print(
        f"LOW    : <= {LOW_THRESHOLD}"
    )

    print(
        f"MEDIUM : <= {HIGH_THRESHOLD}"
    )

    print(
        f"HIGH   : > {HIGH_THRESHOLD}"
    )