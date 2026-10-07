from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import joblib
import sys
import os


# ============================================================
# ML PATH
# ============================================================

ML_PATH = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "ml")
)

sys.path.append(ML_PATH)

from predict import predict_traffic


# ============================================================
# FASTAPI APP
# ============================================================

app = FastAPI(
    title="TrafficSense AI",
    description="AI-powered traffic prediction and congestion risk API",
    version="1.0.0"
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# REQUEST MODEL
# ============================================================

class TrafficInput(BaseModel):
    holiday: str = "None"

    temperature_c: float
    rain_1h: float
    snow_1h: float
    clouds_all: float

    weather_main: str

    hour: int
    day_of_week: int
    month: int
    year: int
    day_of_month: int
    is_weekend: int


# ============================================================
# ROOT ENDPOINT
# ============================================================

@app.get("/")
def root():
    return {
        "message": "TrafficSense AI API is running",
        "status": "online"
    }


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "model": "TrafficSense AI",
        "service": "FastAPI"
    }


# ============================================================
# TRAFFIC PREDICTION
# ============================================================

@app.post("/predict")
def predict(data: TrafficInput):

    result = predict_traffic(
        holiday=data.holiday,
        temperature_c=data.temperature_c,
        rain_1h=data.rain_1h,
        snow_1h=data.snow_1h,
        clouds_all=data.clouds_all,
        weather_main=data.weather_main,
        hour=data.hour,
        day_of_week=data.day_of_week,
        month=data.month,
        year=data.year,
        day_of_month=data.day_of_month,
        is_weekend=data.is_weekend
    )

    return result


# ============================================================
# MODEL INSIGHTS
# ============================================================

@app.get("/insights")
def get_insights():

    model_path = os.path.join(
        ML_PATH,
        "..",
        "models",
        "traffic_model.pkl"
    )

    preprocessor_path = os.path.join(
        ML_PATH,
        "..",
        "models",
        "preprocessor.pkl"
    )

    model = joblib.load(model_path)
    preprocessor = joblib.load(preprocessor_path)

    feature_names = preprocessor.get_feature_names_out()
    importances = model.feature_importances_

    insights = []

    for name, importance in zip(feature_names, importances):

        clean_name = name.replace("numerical__", "")
        clean_name = clean_name.replace("categorical__", "")

        insights.append({
            "feature": clean_name,
            "importance": round(float(importance) * 100, 2)
        })

    insights.sort(
        key=lambda x: x["importance"],
        reverse=True
    )

    return {
        "model": "Random Forest",
        "top_features": insights[:8]
    }