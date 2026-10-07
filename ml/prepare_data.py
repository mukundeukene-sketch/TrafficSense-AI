import pandas as pd
from ucimlrepo import fetch_ucirepo

# ==========================================
# 1. Load dataset
# ==========================================

print("Loading dataset...")

dataset = fetch_ucirepo(id=492)

df = pd.concat(
    [dataset.data.features, dataset.data.targets],
    axis=1
)

print(f"Original shape: {df.shape}")


# ==========================================
# 2. Convert date_time
# ==========================================

df["date_time"] = pd.to_datetime(df["date_time"])


# ==========================================
# 3. Feature Engineering from date_time
# ==========================================

df["hour"] = df["date_time"].dt.hour
df["day_of_week"] = df["date_time"].dt.dayofweek
df["month"] = df["date_time"].dt.month
df["year"] = df["date_time"].dt.year
df["day_of_month"] = df["date_time"].dt.day

df["is_weekend"] = (
    df["day_of_week"] >= 5
).astype(int)


# ==========================================
# 4. Convert temperature Kelvin → Celsius
# ==========================================

df["temperature_c"] = df["temp"] - 273.15


# ==========================================
# 5. Handle holiday
# ==========================================

df["holiday"] = df["holiday"].fillna("None")


# ==========================================
# 6. Select useful features
# ==========================================

df = df[
    [
        "holiday",
        "temperature_c",
        "rain_1h",
        "snow_1h",
        "clouds_all",
        "weather_main",
        "hour",
        "day_of_week",
        "month",
        "year",
        "day_of_month",
        "is_weekend",
        "traffic_volume"
    ]
]


# ==========================================
# 7. Remove missing values if any
# ==========================================

df = df.dropna()


# ==========================================
# 8. Save processed dataset
# ==========================================

output_path = "../data/processed_traffic.csv"

df.to_csv(output_path, index=False)


# ==========================================
# 9. Display information
# ==========================================

print("\n===== PROCESSED DATA =====")
print(df.head())

print("\n===== COLUMNS =====")
print(df.columns.tolist())

print("\n===== SHAPE =====")
print(df.shape)

print("\n===== MISSING VALUES =====")
print(df.isnull().sum())

print(f"\nProcessed dataset saved to: {output_path}")