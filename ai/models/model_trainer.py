"""
Model Training Pipeline
Trains and evaluates ML models for network threat detection
"""

import pandas as pd
import numpy as np
from typing import List, Dict, Any, Tuple, Optional
import logging
import os
from datetime import datetime
import joblib
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix
import matplotlib.pyplot as plt
import seaborn as sns

from .intrusion_detector import IntrusionDetector
from .anomaly_detector import AnomalyDetector
from ..capture.preprocessor import NetworkFeaturePreprocessor

logger = logging.getLogger(__name__)

class ModelTrainer:
    """
    Training pipeline for network threat detection models
    """
    
    def __init__(self, data_path: str = "data/", models_path: str = "models/"):
        """
        Initialize model trainer
        
        Args:
            data_path: Path to training data
            models_path: Path to save trained models
        """
        self.data_path = data_path
        self.models_path = models_path
        self.preprocessor = NetworkFeaturePreprocessor()
        self.intrusion_detector = IntrusionDetector()
        self.anomaly_detector = AnomalyDetector()
        self.training_results = {}
        
        # Create directories if they don't exist
        os.makedirs(data_path, exist_ok=True)
        os.makedirs(models_path, exist_ok=True)
    
    def load_cicids2017_data(self, file_path: str) -> Tuple[pd.DataFrame, pd.Series]:
        """
        Load CICIDS2017 dataset
        
        Args:
            file_path: Path to CICIDS2017 CSV file
            
        Returns:
            Tuple of (features, labels)
        """
        logger.info(f"Loading CICIDS2017 data from {file_path}")
        
        # Load the dataset
        df = pd.read_csv(file_path)
        logger.info(f"Loaded {len(df)} samples with {len(df.columns)} columns")
        
        # CICIDS2017 column mapping (adjust based on actual dataset)
        # These are common column names in CICIDS2017
        label_column = 'Label'  # or 'label' or 'attack'
        
        # Check for different possible label column names
        possible_labels = ['Label', 'label', 'attack', 'Attack', 'class', 'Class']
        for col in possible_labels:
            if col in df.columns:
                label_column = col
                break
        
        if label_column not in df.columns:
            raise ValueError(f"Label column not found. Available columns: {list(df.columns)}")
        
        # Separate features and labels
        y = df[label_column]
        X = df.drop(columns=[label_column])
        
        # Handle missing values
        X = X.fillna(0)
        
        logger.info(f"Features shape: {X.shape}")
        logger.info(f"Labels shape: {y.shape}")
        logger.info(f"Label distribution:\n{y.value_counts()}")
        
        return X, y
    
    def preprocess_data(self, X: pd.DataFrame, y: pd.Series, 
                       test_size: float = 0.2) -> Tuple[pd.DataFrame, pd.Series, pd.DataFrame, pd.Series]:
        """
        Preprocess the dataset
        
        Args:
            X: Feature matrix
            y: Labels
            test_size: Fraction of data for testing
            
        Returns:
            Tuple of (X_train, y_train, X_test, y_test)
        """
        logger.info("Preprocessing data...")
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=test_size, random_state=42, stratify=y
        )
        
        logger.info(f"Data split - Train: {len(X_train)}, Test: {len(X_test)}")
        
        # Fit preprocessor on training data
        self.preprocessor.fit(X_train)
        
        # Transform both training and test data
        X_train_processed = self.preprocessor.transform(X_train)
        X_test_processed = self.preprocessor.transform(X_test)
        
        logger.info("Data preprocessing completed")
        
        return X_train_processed, y_train, X_test_processed, y_test
    
    def train_intrusion_detection(self, X_train: pd.DataFrame, y_train: pd.Series,
                                 X_test: pd.DataFrame, y_test: pd.Series) -> Dict[str, Any]:
        """
        Train intrusion detection model
        
        Args:
            X_train, y_train: Training data
            X_test, y_test: Test data
            
        Returns:
            Training results
        """
        logger.info("Training intrusion detection model...")
        
        # Train the model
        training_stats = self.intrusion_detector.train(X_train, y_train)
        
        # Evaluate on test set
        y_pred = self.intrusion_detector.predict(X_test)
        
        # Calculate additional metrics
        test_accuracy = np.mean(y_pred == y_test)
        test_report = classification_report(y_test, y_pred, output_dict=True)
        
        # Store results
        results = {
            'model_type': 'intrusion_detection',
            'training_stats': training_stats,
            'test_accuracy': test_accuracy,
            'test_classification_report': test_report,
            'feature_importance': self.intrusion_detector.get_feature_importance(top_n=10)
        }
        
        # Save model
        model_path = os.path.join(self.models_path, "intrusion_detector.pkl")
        self.intrusion_detector.save_model(model_path)
        
        logger.info(f"Intrusion detection model trained - Test Accuracy: {test_accuracy:.4f}")
        
        return results
    
    def train_anomaly_detection(self, X_train: pd.DataFrame, y_train: pd.Series,
                               X_test: pd.DataFrame, y_test: pd.Series) -> Dict[str, Any]:
        """
        Train anomaly detection model
        
        Args:
            X_train, y_train: Training data
            X_test, y_test: Test data
            
        Returns:
            Training results
        """
        logger.info("Training anomaly detection model...")
        
        # For anomaly detection, we train only on normal data
        normal_mask = y_train == 'Normal' if 'Normal' in y_train.unique() else y_train == 0
        X_normal = X_train[normal_mask]
        
        if len(X_normal) == 0:
            logger.warning("No normal samples found for anomaly detection training")
            return {"error": "No normal samples found"}
        
        logger.info(f"Training anomaly detector on {len(X_normal)} normal samples")
        
        # Train the model
        training_stats = self.anomaly_detector.train(X_normal)
        
        # Evaluate on test set
        evaluation_results = self.anomaly_detector.evaluate_on_known_attacks(X_test, y_test)
        
        # Store results
        results = {
            'model_type': 'anomaly_detection',
            'training_stats': training_stats,
            'evaluation_results': evaluation_results,
            'normal_samples_used': len(X_normal)
        }
        
        # Save model
        model_path = os.path.join(self.models_path, "anomaly_detector.pkl")
        self.anomaly_detector.save_model(model_path)
        
        logger.info(f"Anomaly detection model trained - Detection Rate: {evaluation_results.get('anomaly_detection_rate', 0):.4f}")
        
        return results
    
    def train_all_models(self, data_file: str) -> Dict[str, Any]:
        """
        Train all models using the complete pipeline
        
        Args:
            data_file: Path to training data file
            
        Returns:
            Complete training results
        """
        logger.info("Starting complete model training pipeline...")
        
        # Load data
        X, y = self.load_cicids2017_data(data_file)
        
        # Preprocess data
        X_train, y_train, X_test, y_test = self.preprocess_data(X, y)
        
        # Save preprocessor
        preprocessor_path = os.path.join(self.models_path, "preprocessor.pkl")
        self.preprocessor.save_preprocessor(preprocessor_path)
        
        # Train intrusion detection
        intrusion_results = self.train_intrusion_detection(X_train, y_train, X_test, y_test)
        
        # Train anomaly detection
        anomaly_results = self.train_anomaly_detection(X_train, y_train, X_test, y_test)
        
        # Store all results
        self.training_results = {
            'intrusion_detection': intrusion_results,
            'anomaly_detection': anomaly_results,
            'preprocessing': {
                'feature_count': len(self.preprocessor.get_feature_names()),
                'preprocessor_path': preprocessor_path
            },
            'training_date': datetime.now().isoformat(),
            'data_info': {
                'total_samples': len(X),
                'train_samples': len(X_train),
                'test_samples': len(X_test),
                'feature_count': X.shape[1]
            }
        }
        
        # Save training results
        results_path = os.path.join(self.models_path, "training_results.pkl")
        joblib.dump(self.training_results, results_path)
        
        logger.info("Complete training pipeline finished!")
        
        return self.training_results
    
    def generate_training_report(self, output_path: str = "training_report.html"):
        """
        Generate a comprehensive training report
        
        Args:
            output_path: Path to save the HTML report
        """
        if not self.training_results:
            logger.warning("No training results available. Run train_all_models() first.")
            return
        
        # Create visualizations
        self._create_training_plots()
        
        # Generate HTML report
        html_content = self._generate_html_report()
        
        with open(output_path, 'w') as f:
            f.write(html_content)
        
        logger.info(f"Training report saved to {output_path}")
    
    def _create_training_plots(self):
        """Create training visualization plots"""
        # This would create various plots for the training report
        # Implementation depends on specific visualization needs
        pass
    
    def _generate_html_report(self) -> str:
        """Generate HTML training report"""
        html = f"""
        <html>
        <head>
            <title>USOD Model Training Report</title>
            <style>
                body {{ font-family: Arial, sans-serif; margin: 40px; }}
                .section {{ margin: 20px 0; }}
                .metric {{ background: #f0f0f0; padding: 10px; margin: 5px 0; }}
                .success {{ color: green; }}
                .warning {{ color: orange; }}
                .error {{ color: red; }}
            </style>
        </head>
        <body>
            <h1>USOD Network AI Model Training Report</h1>
            <p>Generated on: {self.training_results.get('training_date', 'Unknown')}</p>
            
            <div class="section">
                <h2>Data Information</h2>
                <div class="metric">Total Samples: {self.training_results.get('data_info', {}).get('total_samples', 'N/A')}</div>
                <div class="metric">Training Samples: {self.training_results.get('data_info', {}).get('train_samples', 'N/A')}</div>
                <div class="metric">Test Samples: {self.training_results.get('data_info', {}).get('test_samples', 'N/A')}</div>
                <div class="metric">Features: {self.training_results.get('data_info', {}).get('feature_count', 'N/A')}</div>
            </div>
            
            <div class="section">
                <h2>Intrusion Detection Model</h2>
                <div class="metric">Test Accuracy: {self.training_results.get('intrusion_detection', {}).get('test_accuracy', 'N/A'):.4f}</div>
            </div>
            
            <div class="section">
                <h2>Anomaly Detection Model</h2>
                <div class="metric">Detection Rate: {self.training_results.get('anomaly_detection', {}).get('evaluation_results', {}).get('anomaly_detection_rate', 'N/A'):.4f}</div>
            </div>
        </body>
        </html>
        """
        return html
    
    def get_training_summary(self) -> Dict[str, Any]:
        """
        Get a summary of training results
        
        Returns:
            Training summary
        """
        if not self.training_results:
            return {"error": "No training results available"}
        
        summary = {
            "training_date": self.training_results.get('training_date'),
            "data_info": self.training_results.get('data_info', {}),
            "intrusion_detection": {
                "test_accuracy": self.training_results.get('intrusion_detection', {}).get('test_accuracy', 'N/A')
            },
            "anomaly_detection": {
                "detection_rate": self.training_results.get('anomaly_detection', {}).get('evaluation_results', {}).get('anomaly_detection_rate', 'N/A')
            }
        }
        
        return summary

# Example usage
if __name__ == "__main__":
    # Configure logging
    logging.basicConfig(level=logging.INFO)
    
    # Create trainer
    trainer = ModelTrainer()
    
    # For demonstration, we'll create synthetic data
    # In practice, you would use real CICIDS2017 data
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
    
    # Generate synthetic labels
    y = np.random.choice(['Normal', 'Attack'], n_samples, p=[0.7, 0.3])
    
    # Save synthetic data for testing
    synthetic_data = pd.concat([X, pd.Series(y, name='Label')], axis=1)
    synthetic_data.to_csv('data/synthetic_cicids2017.csv', index=False)
    
    # Train models
    results = trainer.train_all_models('data/synthetic_cicids2017.csv')
    
    # Print summary
    summary = trainer.get_training_summary()
    print("Training Summary:")
    print(f"Intrusion Detection Accuracy: {summary['intrusion_detection']['test_accuracy']:.4f}")
    print(f"Anomaly Detection Rate: {summary['anomaly_detection']['detection_rate']:.4f}")
    
    # Generate report
    trainer.generate_training_report("training_report.html")
    print("Training completed and report generated!")
