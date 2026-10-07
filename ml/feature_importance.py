import pandas as pd
import joblib
import matplotlib.pyplot as plt

# Load trained model and preprocessor
model = joblib.load("../models/traffic_model.pkl")
preprocessor = joblib.load("../models/preprocessor.pkl")

# Get transformed feature names
feature_names = preprocessor.get_feature_names_out()

# Get feature importance
importances = model.feature_importances_

importance_df = pd.DataFrame({
    "feature": feature_names,
    "importance": importances
})

# Sort
importance_df = importance_df.sort_values(
    by="importance",
    ascending=False
)

print("\n===== TOP 15 IMPORTANT FEATURES =====")
print(importance_df.head(15).to_string(index=False))

# Plot
top_features = importance_df.head(10)

plt.figure(figsize=(10, 6))

plt.barh(
    top_features["feature"][::-1],
    top_features["importance"][::-1]
)

plt.xlabel("Importance")
plt.ylabel("Feature")
plt.title("TrafficSense AI - Feature Importance")

plt.tight_layout()

plt.savefig(
    "../models/feature_importance.png",
    dpi=150
)

print("\nFeature importance chart saved.")