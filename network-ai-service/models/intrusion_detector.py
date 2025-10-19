"""
Intrusion Detection Model
Random Forest classifier for network intrusion detection
"""

import pandas as pd
import numpy as np
from typing import List, Dict, Any, Tuple, Optional
import logging
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
import joblib
import os
from datetime import datetime

logger = logging.getLogger(__name__)

class IntrusionDetector:
    """
    Random Forest-based intrusion detection system
    """
    
    def __init__(self, model_path: str = "models/intrusion_detector.pkl"):
        """
        Initialize intrusion detector
        
        Args:
            model_path: Path to save/load the trained model
        """
        self.model_path = model_path
        self.model = RandomForestClassifier(
            n_estimators=100,
            max_depth=20,
            min_samples_split=5,
            min_samples_leaf=2,
            random_state=42,
            n_jobs=-1
        )
        self.is_trained = False
        self.feature_columns = None
        self.class_names = None
        self.training_stats = {}
    
    def train(self, X: pd.DataFrame, y: pd.Series, 
              test_size: float = 0.2, validation_size: float = 0.2) -> Dict[str, Any]:
        """
        Train the intrusion detection model
        
        Args:
            X: Feature matrix
            y: Target labels
            test_size: Fraction of data for testing
            validation_size: Fraction of data for validation
            
        Returns:
            Training statistics and performance metrics
        """
        logger.info(f"Training intrusion detection model on {len(X)} samples")
        
        # Store feature columns
        self.feature_columns = list(X.columns)
        
        # Get class names
        self.class_names = sorted(y.unique())
        logger.info(f"Classes: {self.class_names}")
        
        # Split data: train, validation, test
        X_temp, X_test, y_temp, y_test = train_test_split(
            X, y, test_size=test_size, random_state=42, stratify=y
        )
        
        X_train, X_val, y_train, y_val = train_test_split(
            X_temp, y_temp, test_size=validation_size, random_state=42, stratify=y_temp
        )
        
        logger.info(f"Data split - Train: {len(X_train)}, Val: {len(X_val)}, Test: {len(X_test)}")
        
        # Hyperparameter tuning
        logger.info("Performing hyperparameter tuning...")
        param_grid = {
            'n_estimators': [50, 100, 200],
            'max_depth': [10, 20, 30, None],
            'min_samples_split': [2, 5, 10],
            'min_samples_leaf': [1, 2, 4]
        }
        
        grid_search = GridSearchCV(
            self.model, param_grid, cv=3, scoring='accuracy', n_jobs=-1, verbose=1
        )
        
        grid_search.fit(X_train, y_train)
        
        # Update model with best parameters
        self.model = grid_search.best_estimator_
        logger.info(f"Best parameters: {grid_search.best_params_}")
        logger.info(f"Best cross-validation score: {grid_search.best_score_:.4f}")
        
        # Train final model on full training set
        self.model.fit(X_train, y_train)
        
        # Evaluate on validation set
        y_val_pred = self.model.predict(X_val)
        val_accuracy = accuracy_score(y_val, y_val_pred)
        
        # Evaluate on test set
        y_test_pred = self.model.predict(X_test)
        test_accuracy = accuracy_score(y_test, y_test_pred)
        
        # Generate detailed reports
        val_report = classification_report(y_val, y_val_pred, output_dict=True)
        test_report = classification_report(y_test, y_test_pred, output_dict=True)
        
        # Store training statistics
        self.training_stats = {
            'train_samples': len(X_train),
            'val_samples': len(X_val),
            'test_samples': len(X_test),
            'val_accuracy': val_accuracy,
            'test_accuracy': test_accuracy,
            'val_classification_report': val_report,
            'test_classification_report': test_report,
            'best_params': grid_search.best_params_,
            'feature_importance': dict(zip(self.feature_columns, self.model.feature_importances_)),
            'training_date': datetime.now().isoformat()
        }
        
        logger.info(f"Validation Accuracy: {val_accuracy:.4f}")
        logger.info(f"Test Accuracy: {test_accuracy:.4f}")
        
        self.is_trained = True
        
        return self.training_stats
    
    def predict(self, X: pd.DataFrame) -> np.ndarray:
        """
        Predict intrusion labels for given features
        
        Args:
            X: Feature matrix
            
        Returns:
            Predicted labels
        """
        if not self.is_trained:
            raise ValueError("Model must be trained before making predictions")
        
        return self.model.predict(X)
    
    def predict_proba(self, X: pd.DataFrame) -> np.ndarray:
        """
        Predict intrusion probabilities for given features
        
        Args:
            X: Feature matrix
            
        Returns:
            Prediction probabilities
        """
        if not self.is_trained:
            raise ValueError("Model must be trained before making predictions")
        
        return self.model.predict_proba(X)
    
    def predict_single_flow(self, flow_features: Dict[str, Any]) -> Dict[str, Any]:
        """
        Predict intrusion for a single network flow
        
        Args:
            flow_features: Dictionary of flow features
            
        Returns:
            Prediction results
        """
        if not self.is_trained:
            raise ValueError("Model must be trained before making predictions")
        
        # Convert to DataFrame
        df = pd.DataFrame([flow_features])
        
        # Ensure all required features are present
        for col in self.feature_columns:
            if col not in df.columns:
                df[col] = 0  # Default value for missing features
        
        # Select only the features used in training
        X = df[self.feature_columns]
        
        # Make prediction
        prediction = self.model.predict(X)[0]
        probabilities = self.model.predict_proba(X)[0]
        
        # Get confidence (max probability)
        confidence = max(probabilities)
        
        # Map prediction to class name
        predicted_class = self.class_names[prediction] if self.class_names else str(prediction)
        
        return {
            'prediction': predicted_class,
            'confidence': confidence,
            'probabilities': dict(zip(self.class_names, probabilities)),
            'is_intrusion': predicted_class != 'Normal' if 'Normal' in self.class_names else prediction != 0
        }
    
    def get_feature_importance(self, top_n: int = 20) -> List[Tuple[str, float]]:
        """
        Get top N most important features
        
        Args:
            top_n: Number of top features to return
            
        Returns:
            List of (feature_name, importance) tuples
        """
        if not self.is_trained:
            raise ValueError("Model must be trained to get feature importance")
        
        importance_pairs = list(zip(self.feature_columns, self.model.feature_importances_))
        importance_pairs.sort(key=lambda x: x[1], reverse=True)
        
        return importance_pairs[:top_n]
    
    def save_model(self, filepath: Optional[str] = None):
        """
        Save the trained model
        
        Args:
            filepath: Path to save the model (optional)
        """
        if not self.is_trained:
            raise ValueError("Model must be trained before saving")
        
        save_path = filepath or self.model_path
        
        # Create directory if it doesn't exist
        os.makedirs(os.path.dirname(save_path), exist_ok=True)
        
        # Save model and metadata
        model_data = {
            'model': self.model,
            'feature_columns': self.feature_columns,
            'class_names': self.class_names,
            'is_trained': self.is_trained,
            'training_stats': self.training_stats
        }
        
        joblib.dump(model_data, save_path)
        logger.info(f"Model saved to {save_path}")
    
    def load_model(self, filepath: Optional[str] = None):
        """
        Load a trained model
        
        Args:
            filepath: Path to load the model from (optional)
        """
        load_path = filepath or self.model_path
        
        if not os.path.exists(load_path):
            raise FileNotFoundError(f"Model file not found: {load_path}")
        
        model_data = joblib.load(load_path)
        
        self.model = model_data['model']
        self.feature_columns = model_data['feature_columns']
        self.class_names = model_data['class_names']
        self.is_trained = model_data['is_trained']
        self.training_stats = model_data.get('training_stats', {})
        
        logger.info(f"Model loaded from {load_path}")
    
    def get_model_stats(self) -> Dict[str, Any]:
        """
        Get model statistics and performance metrics
        
        Returns:
            Dictionary containing model statistics
        """
        if not self.is_trained:
            return {"error": "Model not trained"}
        
        return {
            "is_trained": self.is_trained,
            "feature_count": len(self.feature_columns) if self.feature_columns else 0,
            "class_count": len(self.class_names) if self.class_names else 0,
            "classes": self.class_names,
            "training_stats": self.training_stats
        }

# Example usage
if __name__ == "__main__":
    # Configure logging
    logging.basicConfig(level=logging.INFO)
    
    # Create sample data for testing
    np.random.seed(42)
    n_samples = 1000
    
    # Generate synthetic features
    X = pd.DataFrame({
        'duration': np.random.exponential(10, n_samples),
        'packet_count': np.random.poisson(50, n_samples),
        'byte_count': np.random.poisson(5000, n_samples),
        'packets_per_second': np.random.exponential(5, n_samples),
        'syn_count': np.random.poisson(2, n_samples),
        'ack_count': np.random.poisson(20, n_samples),
        'forward_packet_ratio': np.random.beta(2, 2, n_samples),
        'avg_packet_size': np.random.normal(100, 20, n_samples)
    })
    
    # Generate synthetic labels (0 = Normal, 1 = Attack)
    y = np.random.choice([0, 1], n_samples, p=[0.7, 0.3])
    
    # Create and train model
    detector = IntrusionDetector()
    stats = detector.train(X, y)
    
    print("Training completed!")
    print(f"Test Accuracy: {stats['test_accuracy']:.4f}")
    
    # Test single flow prediction
    sample_flow = {
        'duration': 5.2,
        'packet_count': 25,
        'byte_count': 1200,
        'packets_per_second': 4.8,
        'syn_count': 1,
        'ack_count': 10,
        'forward_packet_ratio': 0.6,
        'avg_packet_size': 48
    }
    
    result = detector.predict_single_flow(sample_flow)
    print(f"Sample prediction: {result}")
    
    # Save model
    detector.save_model()
    print("Model saved successfully!")
