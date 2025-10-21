"""
Fast ML Model Training for MVP
Simplified version with smaller parameter grids for quick training
"""

import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier, IsolationForest
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score, roc_curve
from sklearn.model_selection import GridSearchCV, cross_val_score
import matplotlib.pyplot as plt
import seaborn as sns
import joblib
import json
import logging
from pathlib import Path
import time
from datetime import datetime, timedelta

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class FastModelTrainer:
    """
    Fast ML model trainer for MVP
    """
    
    def __init__(self, data_path: str = "data/processed"):
        """Initialize fast model trainer"""
        self.data_path = Path(data_path)
        self.models = {}
        self.results = {}
        
        # Load processed data
        self.load_data()
        
    def load_data(self):
        """Load processed training data"""
        logger.info("Loading processed data...")
        
        # Load features
        self.X_train = pd.read_csv(self.data_path / "train_features.csv")
        self.X_val = pd.read_csv(self.data_path / "validation_features.csv")
        self.X_test = pd.read_csv(self.data_path / "test_features.csv")
        
        # Load labels
        self.y_train = pd.read_csv(self.data_path / "train_labels.csv")['label']
        self.y_val = pd.read_csv(self.data_path / "validation_labels.csv")['label']
        self.y_test = pd.read_csv(self.data_path / "test_labels.csv")['label']
        
        # Load metadata
        with open(self.data_path / "metadata.json", 'r') as f:
            self.metadata = json.load(f)
        
        self.selected_features = self.metadata['selected_features']
        self.label_mapping = self.metadata['label_mapping']
        
        logger.info(f"Data loaded: Train {self.X_train.shape}, Val {self.X_val.shape}, Test {self.X_test.shape}")
    
    def train_random_forest_fast(self):
        """Train Random Forest with minimal hyperparameter tuning"""
        logger.info("=" * 50)
        logger.info("TRAINING RANDOM FOREST (FAST)")
        logger.info("=" * 50)
        
        try:
            # Create binary classification
            y_train_binary = (self.y_train > 0).astype(int)
            y_val_binary = (self.y_val > 0).astype(int)
            y_test_binary = (self.y_test > 0).astype(int)
            
            logger.info(f"Binary classes - Train: {(y_train_binary == 0).sum()} normal, {(y_train_binary == 1).sum()} attack")
            
            # Minimal hyperparameter grid (only 4 combinations)
            logger.info("🔍 Quick hyperparameter tuning (4 combinations)...")
            param_grid = {
                'n_estimators': [100, 200],
                'max_depth': [10, None]
            }
            
            rf = RandomForestClassifier(random_state=42, n_jobs=-1)
            grid_search = GridSearchCV(
                rf, param_grid, cv=3, scoring='f1', n_jobs=-1, verbose=1
            )
            
            start_time = time.time()
            grid_search.fit(self.X_train, y_train_binary)
            tuning_time = time.time() - start_time
            
            logger.info(f"⏰ Tuning completed in {tuning_time:.1f} seconds")
            logger.info(f"📊 Best params: {grid_search.best_params_}")
            logger.info(f"📊 Best CV score: {grid_search.best_score_:.4f}")
            
            # Train final model
            self.rf_model = grid_search.best_estimator_
            
            # Evaluate
            y_val_pred = self.rf_model.predict(self.X_val)
            y_val_pred_proba = self.rf_model.predict_proba(self.X_val)[:, 1]
            
            val_accuracy = (y_val_pred == y_val_binary).mean()
            val_f1 = self.calculate_f1_score(y_val_binary, y_val_pred)
            val_auc = roc_auc_score(y_val_binary, y_val_pred_proba)
            
            y_test_pred = self.rf_model.predict(self.X_test)
            y_test_pred_proba = self.rf_model.predict_proba(self.X_test)[:, 1]
            
            test_accuracy = (y_test_pred == y_test_binary).mean()
            test_f1 = self.calculate_f1_score(y_test_binary, y_test_pred)
            test_auc = roc_auc_score(y_test_binary, y_test_pred_proba)
            
            logger.info(f"📈 Results:")
            logger.info(f"  Val - Accuracy: {val_accuracy:.4f}, F1: {val_f1:.4f}, AUC: {val_auc:.4f}")
            logger.info(f"  Test - Accuracy: {test_accuracy:.4f}, F1: {test_f1:.4f}, AUC: {test_auc:.4f}")
            
            # Store results
            self.results['random_forest'] = {
                'model': self.rf_model,
                'val_accuracy': val_accuracy,
                'val_f1': val_f1,
                'val_auc': val_auc,
                'test_accuracy': test_accuracy,
                'test_f1': test_f1,
                'test_auc': test_auc,
                'best_params': grid_search.best_params_
            }
            
            # Feature importance
            feature_importance = pd.DataFrame({
                'feature': self.selected_features,
                'importance': self.rf_model.feature_importances_
            }).sort_values('importance', ascending=False)
            
            logger.info("🔍 Top 5 Important Features:")
            for i, row in feature_importance.head(5).iterrows():
                logger.info(f"  {row['feature']}: {row['importance']:.4f}")
            
            # Quick plots
            self.plot_confusion_matrix(y_test_binary, y_test_pred, "Random Forest")
            self.plot_roc_curve(y_test_binary, y_test_pred_proba, "Random Forest")
            
            logger.info("✅ Random Forest training completed!")
            return True
            
        except Exception as e:
            logger.error(f"❌ Random Forest training failed: {e}")
            return False
    
    def train_isolation_forest_fast(self):
        """Train Isolation Forest with minimal hyperparameter tuning"""
        logger.info("=" * 50)
        logger.info("TRAINING ISOLATION FOREST (FAST)")
        logger.info("=" * 50)
        
        try:
            # Use only normal traffic for training
            normal_mask = self.y_train == 0
            X_normal = self.X_train[normal_mask]
            
            logger.info(f"Training on {len(X_normal)} normal samples")
            
            # Minimal hyperparameter grid (only 3 combinations)
            logger.info("🔍 Quick hyperparameter tuning (3 combinations)...")
            param_grid = {
                'n_estimators': [100, 200],
                'contamination': [0.1, 0.2]
            }
            
            iso_forest = IsolationForest(random_state=42, n_jobs=-1)
            grid_search = GridSearchCV(
                iso_forest, param_grid, cv=3, scoring='f1', n_jobs=-1, verbose=1
            )
            
            start_time = time.time()
            grid_search.fit(X_normal)
            tuning_time = time.time() - start_time
            
            logger.info(f"⏰ Tuning completed in {tuning_time:.1f} seconds")
            logger.info(f"📊 Best params: {grid_search.best_params_}")
            logger.info(f"📊 Best CV score: {grid_search.best_score_:.4f}")
            
            # Train final model
            self.iso_model = grid_search.best_estimator_
            
            # Evaluate
            val_scores = self.iso_model.decision_function(self.X_val)
            val_predictions = self.iso_model.predict(self.X_val)
            val_pred_binary = (val_predictions == -1).astype(int)
            val_true_binary = (self.y_val > 0).astype(int)
            
            val_accuracy = (val_pred_binary == val_true_binary).mean()
            val_f1 = self.calculate_f1_score(val_true_binary, val_pred_binary)
            
            test_scores = self.iso_model.decision_function(self.X_test)
            test_predictions = self.iso_model.predict(self.X_test)
            test_pred_binary = (test_predictions == -1).astype(int)
            test_true_binary = (self.y_test > 0).astype(int)
            
            test_accuracy = (test_pred_binary == test_true_binary).mean()
            test_f1 = self.calculate_f1_score(test_true_binary, test_pred_binary)
            
            logger.info(f"📈 Results:")
            logger.info(f"  Val - Accuracy: {val_accuracy:.4f}, F1: {val_f1:.4f}")
            logger.info(f"  Test - Accuracy: {test_accuracy:.4f}, F1: {test_f1:.4f}")
            
            # Store results
            self.results['isolation_forest'] = {
                'model': self.iso_model,
                'val_accuracy': val_accuracy,
                'val_f1': val_f1,
                'test_accuracy': test_accuracy,
                'test_f1': test_f1,
                'best_params': grid_search.best_params_
            }
            
            # Quick plots
            test_anomaly_scores = -test_scores
            self.plot_confusion_matrix(test_true_binary, test_pred_binary, "Isolation Forest")
            self.plot_anomaly_scores(test_anomaly_scores, test_true_binary, "Isolation Forest")
            
            logger.info("✅ Isolation Forest training completed!")
            return True
            
        except Exception as e:
            logger.error(f"❌ Isolation Forest training failed: {e}")
            return False
    
    def calculate_f1_score(self, y_true, y_pred):
        """Calculate F1 score"""
        from sklearn.metrics import f1_score
        return f1_score(y_true, y_pred, average='weighted')
    
    def plot_confusion_matrix(self, y_true, y_pred, model_name):
        """Plot confusion matrix"""
        plt.figure(figsize=(6, 4))
        cm = confusion_matrix(y_true, y_pred)
        sns.heatmap(cm, annot=True, fmt='d', cmap='Blues')
        plt.title(f'{model_name} - Confusion Matrix')
        plt.xlabel('Predicted')
        plt.ylabel('Actual')
        plt.tight_layout()
        plt.savefig(f'data/processed/{model_name.lower().replace(" ", "_")}_confusion_matrix.png', dpi=150)
        plt.close()
        logger.info(f"📊 Saved confusion matrix: {model_name}")
    
    def plot_roc_curve(self, y_true, y_pred_proba, model_name):
        """Plot ROC curve"""
        plt.figure(figsize=(6, 4))
        fpr, tpr, _ = roc_curve(y_true, y_pred_proba)
        auc = roc_auc_score(y_true, y_pred_proba)
        
        plt.plot(fpr, tpr, label=f'{model_name} (AUC = {auc:.3f})')
        plt.plot([0, 1], [0, 1], 'k--', label='Random')
        plt.xlabel('False Positive Rate')
        plt.ylabel('True Positive Rate')
        plt.title(f'{model_name} - ROC Curve')
        plt.legend()
        plt.grid(True)
        plt.tight_layout()
        plt.savefig(f'data/processed/{model_name.lower().replace(" ", "_")}_roc_curve.png', dpi=150)
        plt.close()
        logger.info(f"📊 Saved ROC curve: {model_name}")
    
    def plot_anomaly_scores(self, anomaly_scores, y_true, model_name):
        """Plot anomaly scores distribution"""
        plt.figure(figsize=(10, 4))
        
        plt.subplot(1, 2, 1)
        normal_scores = anomaly_scores[y_true == 0]
        attack_scores = anomaly_scores[y_true == 1]
        
        plt.hist(normal_scores, bins=30, alpha=0.7, label='Normal', color='blue')
        plt.hist(attack_scores, bins=30, alpha=0.7, label='Attack', color='red')
        plt.xlabel('Anomaly Score')
        plt.ylabel('Frequency')
        plt.title(f'{model_name} - Score Distribution')
        plt.legend()
        
        plt.subplot(1, 2, 2)
        plt.boxplot([normal_scores, attack_scores], labels=['Normal', 'Attack'])
        plt.ylabel('Anomaly Score')
        plt.title(f'{model_name} - Score Box Plot')
        
        plt.tight_layout()
        plt.savefig(f'data/processed/{model_name.lower().replace(" ", "_")}_anomaly_scores.png', dpi=150)
        plt.close()
        logger.info(f"📊 Saved anomaly scores: {model_name}")
    
    def save_models(self):
        """Save trained models and results"""
        logger.info("💾 Saving models and results...")
        
        # Save models
        if 'random_forest' in self.results:
            joblib.dump(self.rf_model, self.data_path / "random_forest_model.pkl")
            logger.info("✅ Random Forest model saved")
        
        if 'isolation_forest' in self.results:
            joblib.dump(self.iso_model, self.data_path / "isolation_forest_model.pkl")
            logger.info("✅ Isolation Forest model saved")
        
        # Save results
        results_file = self.data_path / "model_results.json"
        with open(results_file, 'w') as f:
            results_serializable = {}
            for model_name, results in self.results.items():
                results_serializable[model_name] = {}
                for key, value in results.items():
                    if key != 'model':
                        if isinstance(value, np.ndarray):
                            results_serializable[model_name][key] = value.tolist()
                        elif isinstance(value, (np.integer, np.floating)):
                            results_serializable[model_name][key] = float(value)
                        else:
                            results_serializable[model_name][key] = value
            
            json.dump(results_serializable, f, indent=2)
        
        logger.info("✅ Model results saved")
    
    def run_fast_training(self):
        """Run fast training pipeline"""
        logger.info("🚀 Starting FAST ML training pipeline...")
        start_time = time.time()
        
        # Train Random Forest
        logger.info("🎯 Training Random Forest...")
        rf_success = self.train_random_forest_fast()
        
        # Train Isolation Forest
        logger.info("🎯 Training Isolation Forest...")
        iso_success = self.train_isolation_forest_fast()
        
        # Save models
        if rf_success or iso_success:
            self.save_models()
        
        # Summary
        total_time = time.time() - start_time
        logger.info("=" * 50)
        logger.info("FAST TRAINING SUMMARY")
        logger.info("=" * 50)
        logger.info(f"⏰ Total time: {total_time:.1f} seconds")
        logger.info(f"🌲 Random Forest: {'✅ Success' if rf_success else '❌ Failed'}")
        logger.info(f"🔍 Isolation Forest: {'✅ Success' if iso_success else '❌ Failed'}")
        
        if rf_success:
            rf_results = self.results['random_forest']
            logger.info(f"📊 RF Test Accuracy: {rf_results['test_accuracy']:.4f}")
            logger.info(f"📊 RF Test F1: {rf_results['test_f1']:.4f}")
        
        if iso_success:
            iso_results = self.results['isolation_forest']
            logger.info(f"📊 IF Test Accuracy: {iso_results['test_accuracy']:.4f}")
            logger.info(f"📊 IF Test F1: {iso_results['test_f1']:.4f}")
        
        return rf_success and iso_success

def main():
    """Run fast model training"""
    trainer = FastModelTrainer()
    success = trainer.run_fast_training()
    
    if success:
        print("\n🎉 FAST training completed successfully!")
        print("📁 Models saved to data/processed/")
        print("📊 Results saved to data/processed/model_results.json")
        print("💡 This is MVP version - we can improve later!")
    else:
        print("\n❌ Training failed - check logs above")

if __name__ == "__main__":
    main()
