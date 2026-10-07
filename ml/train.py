import pandas as pd
import joblib

from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score


# ==========================================
# 1. Load processed dataset
# ==========================================

DATA_PATH = "../data/processed_traffic.csv"

df = pd.read_csv(DATA_PATH)

print("Dataset loaded.")
print("Shape:", df.shape)


# ==========================================
# 2. Sort chronologically
# ==========================================

# Recreate a chronological order using
# year, month, day and hour.

df = df.sort_values(
    by=["year", "month", "day_of_month", "hour"]
).reset_index(drop=True)


# ==========================================
# 3. Features and target
# ==========================================

X = df.drop(columns=["traffic_volume"])

y = df["traffic_volume"]


# ==========================================
# 4. Chronological Train/Test Split
# ==========================================

split_index = int(len(df) * 0.80)

X_train = X.iloc[:split_index]
X_test = X.iloc[split_index:]

y_train = y.iloc[:split_index]
y_test = y.iloc[split_index:]

print("\nTraining samples:", len(X_train))
print("Testing samples:", len(X_test))


# ==========================================
# 5. Categorical and numerical columns
# ==========================================

categorical_features = [
    "holiday",
    "weather_main"
]

numerical_features = [
    "temperature_c",
    "rain_1h",
    "snow_1h",
    "clouds_all",
    "hour",
    "day_of_week",
    "month",
    "year",
    "day_of_month",
    "is_weekend"
]


# ==========================================
# 6. Preprocessing
# ==========================================

preprocessor = ColumnTransformer(
    transformers=[
        (
            "categorical",
            OneHotEncoder(
                handle_unknown="ignore"
            ),
            categorical_features
        ),

        (
            "numerical",
            "passthrough",
            numerical_features
        )
    ]
)


# ==========================================
# 7. ML Model
# ==========================================

model = RandomForestRegressor(
    n_estimators=200,
    max_depth=20,
    min_samples_split=5,
    random_state=42,
    n_jobs=-1
)


# ==========================================
# 8. Transform training data
# ==========================================

print("\nPreprocessing data...")

X_train_processed = preprocessor.fit_transform(X_train)
X_test_processed = preprocessor.transform(X_test)


# ==========================================
# 9. Train model
# ==========================================

print("Training Random Forest...")

model.fit(
    X_train_processed,
    y_train
)

print("Training completed!")


# ==========================================
# 10. Predictions
# ==========================================

y_pred = model.predict(X_test_processed)


# ==========================================
# 11. Evaluation
# ==========================================

mae = mean_absolute_error(
    y_test,
    y_pred
)

rmse = mean_squared_error(
    y_test,
    y_pred
) ** 0.5

r2 = r2_score(
    y_test,
    y_pred
)


print("\n===== MODEL PERFORMANCE =====")

print(f"MAE  : {mae:.2f}")
print(f"RMSE : {rmse:.2f}")
print(f"R²   : {r2:.4f}")


# ==========================================
# 12. Save model + preprocessor
# ==========================================

joblib.dump(
    model,
    "../models/traffic_model.pkl"
)

joblib.dump(
    preprocessor,
    "../models/preprocessor.pkl"
)

print("\nModel saved:")
print("../models/traffic_model.pkl")

print("Preprocessor saved:")
print("../models/preprocessor.pkl")