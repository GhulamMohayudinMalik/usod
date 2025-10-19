"""
Anomaly Detection Model
Isolation Forest for detecting zero-day threats and anomalies
"""

import pandas as pd
import numpy as np
from typing import List, Dict, Any, Tuple, Optional
import logging
from sklearn.ensemble import IsolationForest
from sklearn.metrics import classification_report, roc_auc_score
import joblib
import os
from datetime import datetime

logger = logging.getLogger(__name__)

class AnomalyDetector:
    """
    Isolation Forest-based anomaly detection system
    Detects zero-day threats and unusual network behavior
    """
    
    def __init__(self, model_path: str = "models/anomaly_detector.pkl"):
        """
        Initialize anomaly detector
        
        Args:
            model_path: Path to save/load the trained model
        """
        self.model_path = model_path
        self.model = IsolationForest(
            contamination=0.1,  # Expected proportion of anomalies
            random_state=42,
            n_jobs=-1
        )
        self.is_trained = False
        self.feature_columns = None
        self.training_stats = {}
        self.threshold = -0.5  # Threshold for anomaly detection
    
    def train(self, X: pd.DataFrame, contamination: float = 0.1) -> Dict[str, Any]:
        """
        Train the anomaly detection model
        
        Args:
            X: Feature matrix (should contain only normal traffic)
            contamination: Expected proportion of anomalies
            
        Returns:
            Training statistics and performance metrics
        """
        logger.info(f"Training anomaly detection model on {len(X)} samples")
        
        # Store feature columns
        self.feature_columns = list(X.columns)
        
        # Update contamination parameter
        self.model.set_params(contamination=contamination)
        
        # Train the model
        self.model.fit(X)
        
        # Calculate anomaly scores for training data
        anomaly_scores = self.model.decision_function(X)
        predictions = self.model.predict(X)
        
        # Calculate statistics
        n_anomalies = np.sum(predictions == -1)
        anomaly_rate = n_anomalies / len(X)
        
        # Store training statistics
        self.training_stats = {
            'train_samples': len(X),
            'contamination': contamination,
            'anomalies_detected': n_anomalies,
            'anomaly_rate': anomaly_rate,
            'mean_anomaly_score': np.mean(anomaly_scores),
            'std_anomaly_score': np.std(anomaly_scores),
            'min_anomaly_score': np.min(anomaly_scores),
            'max_anomaly_score': np.max(anomaly_scores),
            'training_date': datetime.now().isoformat()
        }
        
        # Set threshold based on training data
        self.threshold = np.percentile(anomaly_scores, contamination * 100)
        
        logger.info(f"Training completed - Anomaly rate: {anomaly_rate:.4f}")
        logger.info(f"Anomaly score range: [{np.min(anomaly_scores):.4f}, {np.max(anomaly_scores):.4f}]")
        logger.info(f"Threshold set to: {self.threshold:.4f}")
        
        self.is_trained = True
        
        return self.training_stats
    
    def predict(self, X: pd.DataFrame) -> np.ndarray:
        """
        Predict anomalies for given features
        
        Args:
            X: Feature matrix
            
        Returns:
            Anomaly predictions (-1 for anomaly, 1 for normal)
        """
        if not self.is_trained:
            raise ValueError("Model must be trained before making predictions")
        
        return self.model.predict(X)
    
    def decision_function(self, X: pd.DataFrame) -> np.ndarray:
        """
        Calculate anomaly scores for given features
        
        Args:
            X: Feature matrix
            
        Returns:
            Anomaly scores (lower values indicate more anomalous)
        """
        if not self.is_trained:
            raise ValueError("Model must be trained before making predictions")
        
        return self.model.decision_function(X)
    
    def predict_single_flow(self, flow_features: Dict[str, Any]) -> Dict[str, Any]:
        """
        Predict anomaly for a single network flow
        
        Args:
            flow_features: Dictionary of flow features
            
        Returns:
            Anomaly prediction results
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
        anomaly_score = self.model.decision_function(X)[0]
        
        # Determine if it's an anomaly
        is_anomaly = prediction == -1 or anomaly_score < self.threshold
        
        # Calculate confidence (distance from threshold)
        confidence = abs(anomaly_score - self.threshold)
        
        # Determine severity based on score
        if anomaly_score < self.threshold - 0.5:
            severity = "high"
        elif anomaly_score < self.threshold:
            severity = "medium"
        else:
            severity = "low"
        
        return {
            'is_anomaly': is_anomaly,
            'anomaly_score': anomaly_score,
            'confidence': confidence,
            'severity': severity,
            'threshold': self.threshold,
            'prediction': 'anomaly' if is_anomaly else 'normal'
        }
    
    def evaluate_on_known_attacks(self, X_attacks: pd.DataFrame, 
                                 y_attacks: pd.Series) -> Dict[str, Any]:
        """
        Evaluate model performance on known attack data
        
        Args:
            X_attacks: Feature matrix of known attacks
            y_attacks: Labels (1 for attack, 0 for normal)
            
        Returns:
            Evaluation metrics
        """
        if not self.is_trained:
            raise ValueError("Model must be trained before evaluation")
        
        # Get predictions and scores
        predictions = self.predict(X_attacks)
        scores = self.decision_function(X_attacks)
        
        # Convert predictions to binary (1 for anomaly, 0 for normal)
        binary_predictions = (predictions == -1).astype(int)
        
        # Calculate metrics
        accuracy = np.mean(binary_predictions == y_attacks)
        
        # Calculate AUC if we have both classes
        if len(np.unique(y_attacks)) > 1:
            auc = roc_auc_score(y_attacks, -scores)  # Negative scores for AUC
        else:
            auc = None
        
        # Generate classification report
        report = classification_report(y_attacks, binary_predictions, output_dict=True)
        
        evaluation_results = {
            'accuracy': accuracy,
            'auc': auc,
            'classification_report': report,
            'anomaly_detection_rate': np.mean(binary_predictions),
            'mean_anomaly_score': np.mean(scores),
            'std_anomaly_score': np.std(scores)
        }
        
        logger.info(f"Evaluation on known attacks - Accuracy: {accuracy:.4f}")
        if auc:
            logger.info(f"AUC: {auc:.4f}")
        
        return evaluation_results
    
    def set_threshold(self, threshold: float):
        """
        Set custom threshold for anomaly detection
        
        Args:
            threshold: New threshold value
        """
        self.threshold = threshold
        logger.info(f"Threshold updated to: {threshold:.4f}")
    
    def get_feature_importance(self) -> List[Tuple[str, float]]:
        """
        Get feature importance (if available)
        
        Returns:
            List of (feature_name, importance) tuples
        """
        if not self.is_trained:
            raise ValueError("Model must be trained to get feature importance")
        
        # Isolation Forest doesn't provide direct feature importance
        # We can estimate it by measuring the impact of each feature on anomaly scores
        if self.feature_columns is None:
            return []
        
        # This is a simplified approach - in practice, you might want to use
        # permutation importance or other methods
        importance_scores = np.ones(len(self.feature_columns)) / len(self.feature_columns)
        
        return list(zip(self.feature_columns, importance_scores))
    
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
            'is_trained': self.is_trained,
            'training_stats': self.training_stats,
            'threshold': self.threshold
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
        self.is_trained = model_data['is_trained']
        self.training_stats = model_data.get('training_stats', {})
        self.threshold = model_data.get('threshold', -0.5)
        
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
            "threshold": self.threshold,
            "training_stats": self.training_stats
        }

# Example usage
if __name__ == "__main__":
    # Configure logging
    logging.basicConfig(level=logging.INFO)
    
    # Create sample data for testing
    np.random.seed(42)
    n_normal = 800
    n_anomaly = 200
    
    # Generate normal traffic features
    X_normal = pd.DataFrame({
        'duration': np.random.exponential(10, n_normal),
        'packet_count': np.random.poisson(50, n_normal),
        'byte_count': np.random.poisson(5000, n_normal),
        'packets_per_second': np.random.exponential(5, n_normal),
        'syn_count': np.random.poisson(2, n_normal),
        'ack_count': np.random.poisson(20, n_normal),
        'forward_packet_ratio': np.random.beta(2, 2, n_normal),
        'avg_packet_size': np.random.normal(100, 20, n_normal)
    })
    
    # Generate anomaly features (different distribution)
    X_anomaly = pd.DataFrame({
        'duration': np.random.exponential(0.1, n_anomaly),  # Very short duration
        'packet_count': np.random.poisson(1000, n_anomaly),  # High packet count
        'byte_count': np.random.poisson(100000, n_anomaly),  # High byte count
        'packets_per_second': np.random.exponential(50, n_anomaly),  # High rate
        'syn_count': np.random.poisson(50, n_anomaly),  # High SYN count
        'ack_count': np.random.poisson(5, n_anomaly),  # Low ACK count
        'forward_packet_ratio': np.random.beta(0.1, 2, n_anomaly),  # Skewed ratio
        'avg_packet_size': np.random.normal(50, 5, n_anomaly)  # Small packets
    })
    
    # Train on normal data only
    detector = AnomalyDetector()
    stats = detector.train(X_normal, contamination=0.1)
    
    print("Training completed!")
    print(f"Anomaly rate: {stats['anomaly_rate']:.4f}")
    
    # Test on anomaly data
    y_anomaly = np.ones(n_anomaly)  # All anomalies
    evaluation = detector.evaluate_on_known_attacks(X_anomaly, y_anomaly)
    print(f"Detection accuracy on anomalies: {evaluation['accuracy']:.4f}")
    
    # Test single flow prediction
    sample_flow = {
        'duration': 0.05,  # Very short
        'packet_count': 2000,  # High count
        'byte_count': 100000,  # High bytes
        'packets_per_second': 100,  # High rate
        'syn_count': 100,  # High SYN
        'ack_count': 1,  # Low ACK
        'forward_packet_ratio': 0.05,  # Skewed
        'avg_packet_size': 50  # Small packets
    }
    
    result = detector.predict_single_flow(sample_flow)
    print(f"Sample prediction: {result}")
    
    # Save model
    detector.save_model()
    print("Model saved successfully!")
