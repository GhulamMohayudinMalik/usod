"""
Model Predictor Module
Loads trained models and makes predictions on network flow data.

Updated to use the new multiclass CICIDS2017 model as primary.
"""

import joblib
import pandas as pd
import numpy as np
from pathlib import Path
from typing import Union, List, Tuple, Optional


# CICIDS2017 Feature Names (78 features used by our model)
CICIDS2017_FEATURES = [
    'Destination Port', 'Flow Duration', 'Total Fwd Packets', 'Total Backward Packets',
    'Total Length of Fwd Packets', 'Total Length of Bwd Packets', 'Fwd Packet Length Max',
    'Fwd Packet Length Min', 'Fwd Packet Length Mean', 'Fwd Packet Length Std',
    'Bwd Packet Length Max', 'Bwd Packet Length Min', 'Bwd Packet Length Mean',
    'Bwd Packet Length Std', 'Flow Bytes/s', 'Flow Packets/s', 'Flow IAT Mean',
    'Flow IAT Std', 'Flow IAT Max', 'Flow IAT Min', 'Fwd IAT Total', 'Fwd IAT Mean',
    'Fwd IAT Std', 'Fwd IAT Max', 'Fwd IAT Min', 'Bwd IAT Total', 'Bwd IAT Mean',
    'Bwd IAT Std', 'Bwd IAT Max', 'Bwd IAT Min', 'Fwd PSH Flags', 'Bwd PSH Flags',
    'Fwd URG Flags', 'Bwd URG Flags', 'Fwd Header Length', 'Bwd Header Length',
    'Fwd Packets/s', 'Bwd Packets/s', 'Min Packet Length', 'Max Packet Length',
    'Packet Length Mean', 'Packet Length Std', 'Packet Length Variance',
    'FIN Flag Count', 'SYN Flag Count', 'RST Flag Count', 'PSH Flag Count',
    'ACK Flag Count', 'URG Flag Count', 'CWE Flag Count', 'ECE Flag Count',
    'Down/Up Ratio', 'Average Packet Size', 'Avg Fwd Segment Size', 'Avg Bwd Segment Size',
    'Fwd Header Length.1', 'Fwd Avg Bytes/Bulk', 'Fwd Avg Packets/Bulk', 'Fwd Avg Bulk Rate',
    'Bwd Avg Bytes/Bulk', 'Bwd Avg Packets/Bulk', 'Bwd Avg Bulk Rate', 'Subflow Fwd Packets',
    'Subflow Fwd Bytes', 'Subflow Bwd Packets', 'Subflow Bwd Bytes', 'Init_Win_bytes_forward',
    'Init_Win_bytes_backward', 'act_data_pkt_fwd', 'min_seg_size_forward', 'Active Mean',
    'Active Std', 'Active Max', 'Active Min', 'Idle Mean', 'Idle Std', 'Idle Max', 'Idle Min'
]


class NetworkThreatPredictor:
    """
    Predictor for network threat detection using trained Random Forest models.
    Uses the multiclass CICIDS2017 model for high accuracy threat detection.
    
    Classes: BENIGN, DDoS, DoS, PortScan, Brute Force, Web Attack, Infiltration, Other
    """
    
    def __init__(self, models_dir: Union[str, Path] = None):
        """
        Initialize the predictor.
        
        Args:
            models_dir: Path to directory containing trained models.
                       Defaults to 'models/' in project root.
        """
        if models_dir is None:
            self.models_dir = Path(__file__).parent.parent / 'models'
        else:
            self.models_dir = Path(models_dir)
        
        # Primary model (multiclass CICIDS2017)
        self.model = None
        self.feature_names = None
        self.class_names = None
        
        # Legacy model (NFStream binary) for backward compatibility
        self.nfstream_model = None
        self.feature_names_nfstream = None
        self.class_names_nfstream = None
        
        self._load_models()
    
    def _load_models(self):
        """Load trained models and associated metadata."""
        # Load NFStream Robust Binary model FIRST (this is the primary model now)
        # 77.10% accuracy, 6.38% FPR - BENIGN vs ATTACK
        nfstream_model_path = self.models_dir / 'random_forest_nfstream_robust_binary.joblib'
        if not nfstream_model_path.exists():
            # Fallback to legacy model
            nfstream_model_path = self.models_dir / 'random_forest_nfstream_from_scratch.joblib'
        
        if nfstream_model_path.exists():
            try:
                self.nfstream_model = joblib.load(nfstream_model_path)
                
                # Silence verbose output from Random Forest (prevents [Parallel] spam)
                if hasattr(self.nfstream_model, 'verbose'):
                    self.nfstream_model.verbose = 0
                if hasattr(self.nfstream_model, 'n_jobs'):
                    self.nfstream_model.n_jobs = 1  # Single-threaded = no parallel logs
                
                # Load matching feature names and class names
                if 'robust_binary' in str(nfstream_model_path):
                    nfstream_features_path = self.models_dir / 'feature_names_nfstream_robust_binary.joblib'
                    nfstream_class_names_path = self.models_dir / 'class_names_nfstream_robust_binary.joblib'
                    print(f"Loaded primary model: NFStream Robust Binary (77.10% acc, 6.38% FPR)")
                else:
                    nfstream_features_path = self.models_dir / 'feature_names_nfstream_from_scratch.joblib'
                    nfstream_class_names_path = self.models_dir / 'class_names_nfstream_from_scratch.joblib'
                    print(f"Loaded primary model: NFStream Legacy")
                
                if nfstream_features_path.exists():
                    self.feature_names_nfstream = joblib.load(nfstream_features_path)
                if nfstream_class_names_path.exists():
                    self.class_names_nfstream = joblib.load(nfstream_class_names_path)
                
                print(f"  Classes: {self.class_names_nfstream}")
                print(f"  Features: {len(self.feature_names_nfstream) if self.feature_names_nfstream else 'default'}")
            except Exception as e:
                raise RuntimeError(f"Failed to load NFStream model: {e}")
        else:
            raise FileNotFoundError(f"Primary model not found. Expected: {nfstream_model_path}")
        
        # Optionally load multiclass CICIDS2017 model (if present)
        model_path = self.models_dir / 'random_forest_multiclass_cicids.joblib'
        if model_path.exists():
            self.model = joblib.load(model_path)
            print(f"  Also loaded: Multiclass CICIDS2017 model")
            
            # Load feature names
            features_path = self.models_dir / 'feature_names_multiclass_cicids.joblib'
            if features_path.exists():
                self.feature_names = joblib.load(features_path)
            else:
                self.feature_names = CICIDS2017_FEATURES.copy()
            
            # Load class names
            class_names_path = self.models_dir / 'class_names_multiclass_cicids.joblib'
            if class_names_path.exists():
                self.class_names = joblib.load(class_names_path)
            else:
                self.class_names = ['BENIGN', 'Brute Force', 'DDoS', 'DoS', 'Infiltration', 'Other', 'PortScan', 'Web Attack']
        
        
        # Load CICFlowMeter model (99.89% accuracy, trained on Friday data)
        self.cicflowmeter_model = None
        self.feature_names_cicflowmeter = None
        self.class_names_cicflowmeter = None
        
        cf_model_path = self.models_dir / 'random_forest_cicflowmeter.joblib'
        if cf_model_path.exists():
            try:
                self.cicflowmeter_model = joblib.load(cf_model_path)
                cf_features_path = self.models_dir / 'feature_names_cicflowmeter.joblib'
                if cf_features_path.exists():
                    self.feature_names_cicflowmeter = joblib.load(cf_features_path)
                cf_class_names_path = self.models_dir / 'class_names_cicflowmeter.joblib'
                if cf_class_names_path.exists():
                    self.class_names_cicflowmeter = joblib.load(cf_class_names_path)
                print(f"  CICFlowMeter model: 4 classes, 99.89% accuracy")
            except Exception as e:
                print(f"  Warning: Could not load CICFlowMeter model: {e}")
        
        # Load Robust Binary model (99.76% accuracy, 0.23% FPR)
        self.robust_binary_model = None
        self.feature_names_robust_binary = None
        self.class_names_robust_binary = None
        
        rb_model_path = self.models_dir / 'random_forest_robust_binary.joblib'
        if rb_model_path.exists():
            try:
                self.robust_binary_model = joblib.load(rb_model_path)
                rb_features_path = self.models_dir / 'feature_names_robust_binary.joblib'
                if rb_features_path.exists():
                    self.feature_names_robust_binary = joblib.load(rb_features_path)
                rb_class_names_path = self.models_dir / 'class_names_robust_binary.joblib'
                if rb_class_names_path.exists():
                    self.class_names_robust_binary = joblib.load(rb_class_names_path)
                print(f"  Robust Binary model: BENIGN vs ATTACK, 99.76% accuracy, 0.23% FPR")
            except Exception as e:
                print(f"  Warning: Could not load Robust Binary model: {e}")

    
    def get_required_features(self) -> List[str]:
        """Get list of required feature names for the model."""
        return self.feature_names.copy() if self.feature_names else CICIDS2017_FEATURES.copy()
    
    def preprocess_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Preprocess features to match model requirements.
        
        Args:
            df: DataFrame with network flow features (CICIDS2017 format)
        
        Returns:
            Preprocessed DataFrame ready for prediction.
        """
        required_features = self.get_required_features()
        
        # Strip column names
        df = df.copy()
        df.columns = df.columns.str.strip()
        
        # Check for missing features
        missing_features = [f for f in required_features if f not in df.columns]
        if missing_features:
            # Add missing features with default value 0
            for f in missing_features:
                df[f] = 0
        
        # Select only required features in correct order
        df_processed = df[required_features].copy()
        
        # Handle infinite values
        df_processed = df_processed.replace([np.inf, -np.inf], np.nan)
        
        # Fill NaN with 0
        df_processed = df_processed.fillna(0)
        
        return df_processed
    
    def predict(self, df: pd.DataFrame, return_proba: bool = False) -> Union[np.ndarray, Tuple[np.ndarray, np.ndarray]]:
        """
        Make multiclass predictions.
        
        Args:
            df: DataFrame with CICIDS2017-compatible features
            return_proba: If True, also return prediction probabilities
        
        Returns:
            Array of predicted class labels.
            If return_proba=True, also returns probability array for each class.
        """
        if self.model is None:
            raise RuntimeError("Model not loaded")
        
        # Preprocess
        X = self.preprocess_features(df)
        
        # Predict
        predictions = self.model.predict(X)
        
        if return_proba:
            probabilities = self.model.predict_proba(X)
            return predictions, probabilities
        
        return predictions
    
    def predict_nfstream(self, df: pd.DataFrame, return_proba: bool = False) -> Union[np.ndarray, Tuple[np.ndarray, np.ndarray]]:
        """
        Make predictions using legacy NFStream model (backward compatibility).
        
        Args:
            df: DataFrame with NFStream-extracted features
            return_proba: If True, also return prediction probabilities
        
        Returns:
            Array of predicted class labels ('BENIGN' or 'DDoS').
        """
        if self.nfstream_model is None:
            raise RuntimeError("NFStream model not loaded")
        
        # Get required feature names (in exact training order)
        required = self.feature_names_nfstream if self.feature_names_nfstream else []
        
        # Create a clean feature dataframe with only the required columns
        X = pd.DataFrame()
        for f in required:
            if f in df.columns:
                X[f] = df[f].values
            else:
                X[f] = 0
        
        # Clean up values
        X = X.replace([np.inf, -np.inf], np.nan).fillna(0)
        
        predictions = self.nfstream_model.predict(X)
        
        if return_proba:
            probabilities = self.nfstream_model.predict_proba(X)
            return predictions, probabilities
        
        return predictions
    
    def predict_cicflowmeter(self, df: pd.DataFrame, return_proba: bool = False) -> Union[np.ndarray, Tuple[np.ndarray, np.ndarray]]:
        """
        Make predictions using CICFlowMeter model (99.89% accuracy).
        
        This model is trained on CICIDS2017 Friday data using CICFlowMeter-compatible
        features. Use with extract_cicids_full_features() for best results.
        
        Args:
            df: DataFrame with CICIDS2017-compatible features (78 features)
            return_proba: If True, also return prediction probabilities
        
        Returns:
            Array of predicted class labels.
        """
        if self.cicflowmeter_model is None:
            raise RuntimeError("CICFlowMeter model not loaded")
        
        # Preprocess for CICFlowMeter model
        required = self.feature_names_cicflowmeter if self.feature_names_cicflowmeter else CICIDS2017_FEATURES
        df = df.copy()
        
        # Strip column names
        df.columns = df.columns.str.strip()
        
        for f in required:
            if f not in df.columns:
                df[f] = 0
        
        X = df[required].copy()
        X = X.replace([np.inf, -np.inf], np.nan).fillna(0)
        
        predictions = self.cicflowmeter_model.predict(X)
        
        if return_proba:
            probabilities = self.cicflowmeter_model.predict_proba(X)
            return predictions, probabilities
        
        return predictions

    def predict_robust_binary(self, df: pd.DataFrame, return_proba: bool = False) -> Union[np.ndarray, Tuple[np.ndarray, np.ndarray]]:
        """
        Make predictions using Robust Binary model (99.76% accuracy, 0.23% FPR).
        
        This model is trained on ALL CICIDS2017 data for binary classification
        (BENIGN vs ATTACK). Use with NFStream-extracted features.
        
        Args:
            df: DataFrame with NFStream-compatible features (46 features)
            return_proba: If True, also return prediction probabilities
        
        Returns:
            Array of predicted class labels ('BENIGN' or 'ATTACK').
        """
        if self.robust_binary_model is None:
            raise RuntimeError("Robust Binary model not loaded")
        
        # Preprocess for Robust Binary model
        required = self.feature_names_robust_binary if self.feature_names_robust_binary else []
        df = df.copy()
        
        for f in required:
            if f not in df.columns:
                df[f] = 0
        
        X = df[required].copy()
        X = X.replace([np.inf, -np.inf], np.nan).fillna(0)
        
        predictions = self.robust_binary_model.predict(X)
        
        if return_proba:
            probabilities = self.robust_binary_model.predict_proba(X)
            return predictions, probabilities
        
        return predictions

    
    def get_summary(self, predictions: np.ndarray) -> dict:
        """
        Get summary statistics for predictions.
        
        Args:
            predictions: Array of predictions
        
        Returns:
            Dictionary with summary statistics.
        """
        unique, counts = np.unique(predictions, return_counts=True)
        summary = {'total': len(predictions)}
        
        for label, count in zip(unique, counts):
            summary[label] = int(count)
        
        # Calculate attack count (everything except BENIGN)
        benign_count = summary.get('BENIGN', 0)
        attack_count = len(predictions) - benign_count
        summary['attack_count'] = attack_count
        summary['attack_percentage'] = float(attack_count / len(predictions) * 100) if len(predictions) > 0 else 0.0
        
        return summary


# Quick test function
def test_predictor():
    """Test the predictor with a sample."""
    try:
        predictor = NetworkThreatPredictor()
        print("\n✅ Predictor initialized successfully!")
        print(f"Model loaded: Yes")
        print(f"Classes: {predictor.class_names}")
        print(f"Features: {len(predictor.get_required_features())}")
    except Exception as e:
        print(f"❌ Error: {e}")


if __name__ == "__main__":
    test_predictor()
