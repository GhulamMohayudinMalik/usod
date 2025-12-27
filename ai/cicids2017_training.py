# %% [markdown]
# # USOD Technical Paper - CICIDS2017 Model Training
# 
# This notebook trains machine learning models on the CICIDS2017 dataset for the USOD technical paper.
# 
# **Models Trained:**
# 1. Random Forest (Multiclass) - Primary classifier
# 2. Isolation Forest - Anomaly detection
# 
# **Output:**
# - Confusion matrices
# - ROC curves
# - Feature importance plots
# - Performance metrics for the paper

# %% [markdown]
# ## 1. Setup and Imports

# %%
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path
import warnings
warnings.filterwarnings('ignore')

# Sklearn imports
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.ensemble import RandomForestClassifier, IsolationForest
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import (
    classification_report, confusion_matrix, accuracy_score,
    precision_score, recall_score, f1_score, roc_curve, auc,
    precision_recall_curve, average_precision_score
)
from sklearn.utils import shuffle
import joblib

# Set style for paper-quality figures
plt.style.use('seaborn-v0_8-whitegrid')
plt.rcParams['figure.figsize'] = (10, 8)
plt.rcParams['font.size'] = 12
plt.rcParams['axes.labelsize'] = 14
plt.rcParams['axes.titlesize'] = 16

print("✅ Libraries imported successfully")

# %% [markdown]
# ## 2. Load CICIDS2017 Dataset

# %%
# Dataset path
DATA_DIR = Path("../ai/data/raw")
OUTPUT_DIR = Path("paper_results")
OUTPUT_DIR.mkdir(exist_ok=True)

# List all CSV files
csv_files = list(DATA_DIR.glob("*.csv"))
print(f"Found {len(csv_files)} CSV files:")
for f in csv_files:
    size_mb = f.stat().st_size / (1024 * 1024)
    print(f"  - {f.name}: {size_mb:.1f} MB")

# %%
# Load all files and combine
dfs = []
for csv_file in csv_files:
    print(f"Loading {csv_file.name}...")
    try:
        df = pd.read_csv(csv_file, encoding='utf-8', low_memory=False)
        # Clean column names (remove leading/trailing spaces)
        df.columns = df.columns.str.strip()
        dfs.append(df)
        print(f"  → {len(df)} rows, {len(df.columns)} columns")
    except Exception as e:
        print(f"  ❌ Error: {e}")

# Combine all dataframes
data = pd.concat(dfs, ignore_index=True)
print(f"\n📊 Total dataset: {len(data):,} rows, {len(data.columns)} columns")

# %% [markdown]
# ## 3. Data Exploration

# %%
# Check label distribution
print("Label Distribution:")
print(data['Label'].value_counts())

# %%
# Visualize attack distribution
plt.figure(figsize=(12, 6))
label_counts = data['Label'].value_counts()
colors = ['#2ecc71' if 'BENIGN' in label else '#e74c3c' for label in label_counts.index]
bars = plt.barh(label_counts.index, label_counts.values, color=colors)
plt.xlabel('Number of Samples')
plt.title('CICIDS2017 Dataset - Attack Type Distribution')
plt.tight_layout()
plt.savefig(OUTPUT_DIR / 'attack_distribution.png', dpi=300, bbox_inches='tight')
plt.show()
print(f"✅ Saved: {OUTPUT_DIR / 'attack_distribution.png'}")

# %% [markdown]
# ## 4. Data Preprocessing

# %%
# Remove rows with missing values
print(f"Before cleaning: {len(data)} rows")
data = data.replace([np.inf, -np.inf], np.nan)
data = data.dropna()
print(f"After cleaning: {len(data)} rows")

# %%
# Separate features and labels
X = data.drop(columns=['Label'])
y = data['Label']

# Keep only numeric columns
numeric_cols = X.select_dtypes(include=[np.number]).columns
X = X[numeric_cols]
print(f"Using {len(numeric_cols)} numeric features")

# %%
# Encode labels
label_encoder = LabelEncoder()
y_encoded = label_encoder.fit_transform(y)
class_names = label_encoder.classes_
print(f"Classes: {class_names}")

# %%
# For binary classification (BENIGN vs ATTACK)
y_binary = np.where(y == 'BENIGN', 0, 1)
print(f"Binary: {np.sum(y_binary == 0)} BENIGN, {np.sum(y_binary == 1)} ATTACK")

# %%
# Sample for faster training (use stratified sampling)
SAMPLE_SIZE = 200000  # Adjust based on memory
if len(X) > SAMPLE_SIZE:
    print(f"Sampling {SAMPLE_SIZE:,} rows for training...")
    X_sampled, _, y_sampled, _, y_binary_sampled, _ = train_test_split(
        X, y_encoded, y_binary, 
        train_size=SAMPLE_SIZE, 
        stratify=y_encoded, 
        random_state=42
    )
else:
    X_sampled, y_sampled, y_binary_sampled = X.values, y_encoded, y_binary

print(f"Training set size: {len(X_sampled):,}")

# %%
# Scale features
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X_sampled)

# Train/test split
X_train, X_test, y_train, y_test = train_test_split(
    X_scaled, y_sampled, test_size=0.2, random_state=42, stratify=y_sampled
)

# Binary split
X_train_bin, X_test_bin, y_train_bin, y_test_bin = train_test_split(
    X_scaled, y_binary_sampled, test_size=0.2, random_state=42, stratify=y_binary_sampled
)

print(f"Train: {len(X_train)}, Test: {len(X_test)}")

# %% [markdown]
# ## 5. Train Random Forest (Multiclass)

# %%
print("Training Random Forest (Multiclass)...")
rf_multi = RandomForestClassifier(
    n_estimators=100,
    max_depth=20,
    min_samples_split=5,
    min_samples_leaf=2,
    n_jobs=-1,
    random_state=42,
    verbose=1
)
rf_multi.fit(X_train, y_train)
print("✅ Random Forest (Multiclass) trained!")

# %%
# Predictions
y_pred_multi = rf_multi.predict(X_test)

# Metrics
accuracy_multi = accuracy_score(y_test, y_pred_multi)
precision_multi = precision_score(y_test, y_pred_multi, average='weighted')
recall_multi = recall_score(y_test, y_pred_multi, average='weighted')
f1_multi = f1_score(y_test, y_pred_multi, average='weighted')

print("\n" + "="*50)
print("RANDOM FOREST (MULTICLASS) RESULTS")
print("="*50)
print(f"Accuracy:  {accuracy_multi:.4f} ({accuracy_multi*100:.2f}%)")
print(f"Precision: {precision_multi:.4f}")
print(f"Recall:    {recall_multi:.4f}")
print(f"F1-Score:  {f1_multi:.4f}")

# %%
# Classification Report
print("\nClassification Report:")
print(classification_report(y_test, y_pred_multi, target_names=class_names))

# %% [markdown]
# ## 6. Confusion Matrix (Multiclass)

# %%
# Confusion Matrix
cm = confusion_matrix(y_test, y_pred_multi)

plt.figure(figsize=(14, 12))
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues',
            xticklabels=class_names, yticklabels=class_names)
plt.xlabel('Predicted')
plt.ylabel('Actual')
plt.title(f'Random Forest Confusion Matrix (Accuracy: {accuracy_multi*100:.2f}%)')
plt.tight_layout()
plt.savefig(OUTPUT_DIR / 'random_forest_confusion_matrix.png', dpi=300, bbox_inches='tight')
plt.show()
print(f"✅ Saved: {OUTPUT_DIR / 'random_forest_confusion_matrix.png'}")

# %% [markdown]
# ## 7. Feature Importance

# %%
# Feature importance
feature_importance = pd.DataFrame({
    'feature': numeric_cols,
    'importance': rf_multi.feature_importances_
}).sort_values('importance', ascending=False)

# Top 15 features
top_features = feature_importance.head(15)

plt.figure(figsize=(10, 8))
colors = plt.cm.RdYlGn(np.linspace(0.2, 0.8, len(top_features)))[::-1]
plt.barh(top_features['feature'], top_features['importance'], color=colors)
plt.xlabel('Gini Importance')
plt.title('Top 15 Most Important Features (Random Forest)')
plt.gca().invert_yaxis()
plt.tight_layout()
plt.savefig(OUTPUT_DIR / 'feature_importance.png', dpi=300, bbox_inches='tight')
plt.show()
print(f"✅ Saved: {OUTPUT_DIR / 'feature_importance.png'}")

# Print for paper
print("\n📊 Top 10 Features for Paper:")
for i, row in top_features.head(10).iterrows():
    print(f"  {row['feature']}: {row['importance']:.4f}")

# %% [markdown]
# ## 8. Train Random Forest (Binary)

# %%
print("\nTraining Random Forest (Binary: BENIGN vs ATTACK)...")
rf_binary = RandomForestClassifier(
    n_estimators=100,
    max_depth=20,
    min_samples_split=5,
    min_samples_leaf=2,
    n_jobs=-1,
    random_state=42
)
rf_binary.fit(X_train_bin, y_train_bin)
print("✅ Random Forest (Binary) trained!")

# Predictions
y_pred_bin = rf_binary.predict(X_test_bin)
y_proba_bin = rf_binary.predict_proba(X_test_bin)[:, 1]

# Metrics
accuracy_bin = accuracy_score(y_test_bin, y_pred_bin)
precision_bin = precision_score(y_test_bin, y_pred_bin)
recall_bin = recall_score(y_test_bin, y_pred_bin)
f1_bin = f1_score(y_test_bin, y_pred_bin)

print("\n" + "="*50)
print("RANDOM FOREST (BINARY) RESULTS")
print("="*50)
print(f"Accuracy:  {accuracy_bin:.4f} ({accuracy_bin*100:.2f}%)")
print(f"Precision: {precision_bin:.4f}")
print(f"Recall:    {recall_bin:.4f}")
print(f"F1-Score:  {f1_bin:.4f}")

# %% [markdown]
# ## 9. ROC Curve

# %%
# ROC Curve
fpr, tpr, thresholds = roc_curve(y_test_bin, y_proba_bin)
roc_auc = auc(fpr, tpr)

plt.figure(figsize=(10, 8))
plt.plot(fpr, tpr, color='#3498db', lw=2, label=f'Random Forest (AUC = {roc_auc:.4f})')
plt.plot([0, 1], [0, 1], color='#95a5a6', lw=2, linestyle='--', label='Random Classifier')
plt.fill_between(fpr, tpr, alpha=0.3, color='#3498db')
plt.xlim([0.0, 1.0])
plt.ylim([0.0, 1.05])
plt.xlabel('False Positive Rate')
plt.ylabel('True Positive Rate')
plt.title('Receiver Operating Characteristic (ROC) Curve')
plt.legend(loc='lower right')
plt.grid(True, alpha=0.3)
plt.tight_layout()
plt.savefig(OUTPUT_DIR / 'roc_curve.png', dpi=300, bbox_inches='tight')
plt.show()
print(f"✅ Saved: {OUTPUT_DIR / 'roc_curve.png'}")

# %% [markdown]
# ## 10. Train Isolation Forest (Anomaly Detection)

# %%
print("\nTraining Isolation Forest (Anomaly Detection)...")
# Train only on BENIGN samples
X_benign = X_scaled[y_binary_sampled == 0]
print(f"Training on {len(X_benign)} BENIGN samples")

iso_forest = IsolationForest(
    n_estimators=100,
    contamination=0.1,  # Expected proportion of anomalies
    max_samples='auto',
    random_state=42,
    n_jobs=-1
)
iso_forest.fit(X_benign)
print("✅ Isolation Forest trained!")

# %%
# Predict on test set
# Isolation Forest returns: 1 for inliers (benign), -1 for outliers (attack)
iso_predictions = iso_forest.predict(X_test_bin)
iso_pred_binary = np.where(iso_predictions == 1, 0, 1)  # Convert: 1->0 (benign), -1->1 (attack)

# Get anomaly scores
anomaly_scores = -iso_forest.score_samples(X_test_bin)  # Higher = more anomalous

# Metrics
accuracy_iso = accuracy_score(y_test_bin, iso_pred_binary)
precision_iso = precision_score(y_test_bin, iso_pred_binary)
recall_iso = recall_score(y_test_bin, iso_pred_binary)
f1_iso = f1_score(y_test_bin, iso_pred_binary)

print("\n" + "="*50)
print("ISOLATION FOREST RESULTS")
print("="*50)
print(f"Accuracy:  {accuracy_iso:.4f} ({accuracy_iso*100:.2f}%)")
print(f"Precision: {precision_iso:.4f}")
print(f"Recall:    {recall_iso:.4f}")
print(f"F1-Score:  {f1_iso:.4f}")

# %% [markdown]
# ## 11. Anomaly Score Distribution

# %%
# Anomaly score distribution
plt.figure(figsize=(12, 6))
plt.hist(anomaly_scores[y_test_bin == 0], bins=50, alpha=0.7, label='BENIGN', color='#2ecc71')
plt.hist(anomaly_scores[y_test_bin == 1], bins=50, alpha=0.7, label='ATTACK', color='#e74c3c')
plt.axvline(x=np.percentile(anomaly_scores, 90), color='#3498db', linestyle='--', 
            label=f'90th Percentile Threshold', lw=2)
plt.xlabel('Anomaly Score')
plt.ylabel('Frequency')
plt.title('Isolation Forest Anomaly Score Distribution')
plt.legend()
plt.tight_layout()
plt.savefig(OUTPUT_DIR / 'isolation_forest_anomaly_scores.png', dpi=300, bbox_inches='tight')
plt.show()
print(f"✅ Saved: {OUTPUT_DIR / 'isolation_forest_anomaly_scores.png'}")

# %% [markdown]
# ## 12. Binary Confusion Matrix

# %%
# Binary confusion matrix (for Isolation Forest)
cm_binary = confusion_matrix(y_test_bin, iso_pred_binary)

plt.figure(figsize=(8, 6))
sns.heatmap(cm_binary, annot=True, fmt='d', cmap='RdYlGn_r',
            xticklabels=['BENIGN', 'ATTACK'], yticklabels=['BENIGN', 'ATTACK'])
plt.xlabel('Predicted')
plt.ylabel('Actual')
plt.title(f'Isolation Forest Confusion Matrix (Accuracy: {accuracy_iso*100:.2f}%)')
plt.tight_layout()
plt.savefig(OUTPUT_DIR / 'isolation_forest_confusion_matrix.png', dpi=300, bbox_inches='tight')
plt.show()
print(f"✅ Saved: {OUTPUT_DIR / 'isolation_forest_confusion_matrix.png'}")

# %% [markdown]
# ## 13. Save Models

# %%
# Save models
MODEL_DIR = OUTPUT_DIR / 'models'
MODEL_DIR.mkdir(exist_ok=True)

joblib.dump(rf_multi, MODEL_DIR / 'random_forest_multiclass.joblib')
joblib.dump(rf_binary, MODEL_DIR / 'random_forest_binary.joblib')
joblib.dump(iso_forest, MODEL_DIR / 'isolation_forest.joblib')
joblib.dump(scaler, MODEL_DIR / 'scaler.joblib')
joblib.dump(label_encoder, MODEL_DIR / 'label_encoder.joblib')
joblib.dump(list(numeric_cols), MODEL_DIR / 'feature_names.joblib')

print(f"✅ Models saved to: {MODEL_DIR}")

# %% [markdown]
# ## 14. Summary for Paper

# %%
print("\n" + "="*60)
print("SUMMARY FOR TECHNICAL PAPER")
print("="*60)

print(f"""
DATASET:
- Name: CICIDS2017
- Total samples: {len(data):,}
- Features: {len(numeric_cols)}
- Classes: {len(class_names)}
- Attack types: {', '.join(class_names[class_names != 'BENIGN'])}

RANDOM FOREST (MULTICLASS):
- Trees: 100
- Max Depth: 20
- Accuracy: {accuracy_multi*100:.2f}%
- Precision: {precision_multi*100:.2f}%
- Recall: {recall_multi*100:.2f}%
- F1-Score: {f1_multi*100:.2f}%

RANDOM FOREST (BINARY):
- Accuracy: {accuracy_bin*100:.2f}%
- Precision: {precision_bin*100:.2f}%
- Recall: {recall_bin*100:.2f}%
- F1-Score: {f1_bin*100:.2f}%
- AUC-ROC: {roc_auc:.4f}

ISOLATION FOREST:
- Trees: 100
- Contamination: 10%
- Accuracy: {accuracy_iso*100:.2f}%
- Precision: {precision_iso*100:.2f}%
- Recall: {recall_iso*100:.2f}%
- F1-Score: {f1_iso*100:.2f}%

SAVED FIGURES:
- attack_distribution.png
- random_forest_confusion_matrix.png
- feature_importance.png
- roc_curve.png
- isolation_forest_anomaly_scores.png
- isolation_forest_confusion_matrix.png
""")

# %%
# Create metrics table for paper
metrics_table = pd.DataFrame({
    'Model': ['Random Forest (Multiclass)', 'Random Forest (Binary)', 'Isolation Forest'],
    'Accuracy': [f'{accuracy_multi*100:.2f}%', f'{accuracy_bin*100:.2f}%', f'{accuracy_iso*100:.2f}%'],
    'Precision': [f'{precision_multi*100:.2f}%', f'{precision_bin*100:.2f}%', f'{precision_iso*100:.2f}%'],
    'Recall': [f'{recall_multi*100:.2f}%', f'{recall_bin*100:.2f}%', f'{recall_iso*100:.2f}%'],
    'F1-Score': [f'{f1_multi*100:.2f}%', f'{f1_bin*100:.2f}%', f'{f1_iso*100:.2f}%']
})

print("\n📊 METRICS TABLE FOR PAPER:")
print(metrics_table.to_string(index=False))

# Save as CSV
metrics_table.to_csv(OUTPUT_DIR / 'model_metrics.csv', index=False)
print(f"\n✅ Saved: {OUTPUT_DIR / 'model_metrics.csv'}")

# %% [markdown]
# ## 15. Cross-Validation (Optional - for stronger paper claims)

# %%
print("\nRunning 5-fold Cross-Validation...")
cv_scores = cross_val_score(rf_binary, X_scaled[:50000], y_binary_sampled[:50000], cv=5, n_jobs=-1)
print(f"CV Accuracy: {cv_scores.mean()*100:.2f}% (+/- {cv_scores.std()*2*100:.2f}%)")

print("\n✅ NOTEBOOK COMPLETE!")
print(f"All results saved to: {OUTPUT_DIR.absolute()}")
