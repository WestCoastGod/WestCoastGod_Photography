import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error, r2_score
import joblib
import os
import sys
from datetime import datetime

# Add Optuna
import optuna
from sklearn.model_selection import cross_val_score


def time_string_to_number(time_string):
    """
    Convert a time string in the format 'HH:MM' to a number of minutes since midnight.
    Returns -1 if missing or invalid.
    """
    try:
        if pd.isna(time_string) or time_string in ["", None]:
            return -1
        time_only = datetime.strptime(time_string, "%H:%M").time()
        return time_only.hour * 60 + time_only.minute
    except Exception:
        return -1


script_dir = os.path.dirname(os.path.abspath(sys.argv[0]))
data = pd.read_csv(r"C:\Users\cxoox\Desktop\star_analysis\merged_nsb_weather.csv")
data = data.drop(columns=["Date"])

# Convert time strings to numbers, using -1 for missing
for col in [
    "Sun Rise",
    "Sun Transit",
    "Sun Set",
    "Moon Rise",
    "Moon Transit",
    "Moon Set",
]:
    data[col] = data[col].apply(time_string_to_number)

# Drop rows with missing target only
data = data.dropna(subset=["Max Night Sky Brightness (MPSAS)"])

# Convert all columns except already-handled time columns to numeric
for col in data.columns:
    if col not in [
        "Max Night Sky Brightness (MPSAS)",
        "Sun Rise",
        "Sun Transit",
        "Sun Set",
        "Moon Rise",
        "Moon Transit",
        "Moon Set",
    ]:
        data[col] = pd.to_numeric(data[col], errors="coerce")

# Fill missing values in features with column means
data = data.fillna(data.mean(numeric_only=True))

y = data["Max Night Sky Brightness (MPSAS)"].values.ravel()
X = data.drop(columns=["Max Night Sky Brightness (MPSAS)"])

# Split data
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Standardize features
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)


# Optuna hyperparameter optimization
def objective(trial):
    params = {
        "n_estimators": trial.suggest_int("n_estimators", 200, 2000, step=200),
        "max_depth": trial.suggest_int("max_depth", 5, 30),
        "min_samples_split": trial.suggest_int("min_samples_split", 2, 10),
        "min_samples_leaf": trial.suggest_int("min_samples_leaf", 1, 8),
        "max_features": trial.suggest_categorical("max_features", ["sqrt", "log2"]),
        "random_state": 42,
        "n_jobs": -1,
    }
    model = RandomForestRegressor(**params)
    scores = cross_val_score(
        model, X_train_scaled, y_train, cv=5, scoring="neg_mean_squared_error"
    )
    return scores.mean()


study = optuna.create_study(direction="maximize")
study.optimize(objective, n_trials=40, show_progress_bar=True)

print("Best trial:")
print(study.best_trial)

# Train best model on full training set
best_params = study.best_trial.params
best_params["random_state"] = 42
best_params["n_jobs"] = -1
best_model = RandomForestRegressor(**best_params)
best_model.fit(X_train_scaled, y_train)

# Evaluate on test set
y_pred = best_model.predict(X_test_scaled)
print("Test set Mean Squared Error (MSE):", mean_squared_error(y_test, y_pred))
print("Test set R-squared (R2):", r2_score(y_test, y_pred))

# Feature importances
importances = best_model.feature_importances_
feature_names = X.columns
feat_imp = pd.Series(importances, index=feature_names).sort_values(ascending=False)
print("\nTop 10 Feature Importances:")
print(feat_imp.head(10))

# Save model and scaler
print("Saving best model and scaler...")
joblib.dump(best_model, f"{script_dir}/stargazing_model.pkl")
joblib.dump(scaler, f"{script_dir}/stargazing_scaler.pkl")

# Plot correlation heatmap
corr = data.corr()
plt.figure(figsize=(20, 16))
sns.heatmap(
    corr,  # the correlation matrix
    xticklabels=corr.columns,  # use column names on x‑axis
    yticklabels=corr.columns,  # use column names on y‑axis
    annot=True,  # write numeric value in each cell
    fmt=".2f",  # format annotations to 2 decimal places
    cmap="coolwarm",  # diverging color palette
    linewidths=0.5,  # lines between cells
)
plt.xticks(rotation=45, ha="right")
# plt.savefig(f"{script_dir}/correlation_heatmap.png", dpi=300, bbox_inches="tight")
plt.title("Correlation Heatmap")
plt.tight_layout()
plt.show()

# Plot feature importances
feature_importances = model.feature_importances_
indices = np.argsort(feature_importances)[::-1]
features = X.columns[indices]
importances = feature_importances[indices]

plt.figure(figsize=(10, 6))
plt.title("Feature Importances")
plt.bar(range(len(importances)), importances, align="center")
plt.xticks(range(len(importances)), features, rotation=90)
plt.xlim([-1, len(importances)])
plt.tight_layout()
# plt.savefig(f"{script_dir}/feature_importances.png", dpi=300, bbox_inches="tight")
plt.show()
