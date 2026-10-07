from ucimlrepo import fetch_ucirepo

# Fetch Metro Interstate Traffic Volume dataset
dataset = fetch_ucirepo(id=492)

# Separate features and target
X = dataset.data.features
y = dataset.data.targets

print("\n===== FEATURES =====")
print(X.head())

print("\n===== TARGET =====")
print(y.head())

print("\n===== FEATURE COLUMNS =====")
print(X.columns.tolist())

print("\n===== DATASET SHAPE =====")
print(X.shape)

print("\n===== TARGET COLUMNS =====")
print(y.columns.tolist())

print("\n===== MISSING VALUES =====")
print(X.isnull().sum())

print("\n===== UNIQUE VALUES =====")
for column in X.columns:
    print(f"\n{column}:")
    print(X[column].unique()[:10])

print("\n===== TARGET STATISTICS =====")
print(y["traffic_volume"].describe())