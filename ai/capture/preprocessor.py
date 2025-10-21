"""
Feature Preprocessor for Network Traffic Analysis
Handles feature engineering and data preprocessing for ML models
"""

import pandas as pd
import numpy as np
from typing import List, Dict, Any, Tuple
import logging
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.model_selection import train_test_split
import joblib
import os

logger = logging.getLogger(__name__)

class NetworkFeaturePreprocessor:
    """
    Preprocesses network flow data for ML model training and inference
    """
    
    def __init__(self, feature_columns: List[str] = None):
        """
        Initialize preprocessor
        
        Args:
            feature_columns: List of feature column names to use
        """
        self.feature_columns = feature_columns
        self.scaler = StandardScaler()
        self.label_encoders = {}
        self.is_fitted = False
        
        # Define feature groups for different types of preprocessing
        self.numerical_features = [
            'duration', 'packet_count', 'byte_count', 'packets_per_second',
            'bytes_per_second', 'avg_packet_size', 'syn_count', 'ack_count',
            'fin_count', 'rst_count', 'forward_packets', 'backward_packets',
            'forward_bytes', 'backward_bytes', 'avg_inter_arrival_time',
            'min_inter_arrival_time', 'max_inter_arrival_time'
        ]
        
        self.categorical_features = [
            'protocol', 'src_ip', 'dst_ip'
        ]
        
        self.derived_features = [
            'forward_packet_ratio', 'backward_packet_ratio',
            'forward_byte_ratio', 'backward_byte_ratio',
            'syn_ratio', 'ack_ratio', 'fin_ratio', 'rst_ratio'
        ]
    
    def extract_features_from_flow(self, flow_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Extract features from a single network flow
        
        Args:
            flow_data: Dictionary containing flow information
            
        Returns:
            Dictionary of extracted features
        """
        features = {}
        
        # Basic flow features
        features['duration'] = flow_data.get('duration', 0)
        features['packet_count'] = flow_data.get('packet_count', 0)
        features['byte_count'] = flow_data.get('byte_count', 0)
        
        # Rate features
        if features['duration'] > 0:
            features['packets_per_second'] = features['packet_count'] / features['duration']
            features['bytes_per_second'] = features['byte_count'] / features['duration']
        else:
            features['packets_per_second'] = 0
            features['bytes_per_second'] = 0
        
        # Average packet size
        if features['packet_count'] > 0:
            features['avg_packet_size'] = features['byte_count'] / features['packet_count']
        else:
            features['avg_packet_size'] = 0
        
        # TCP flags
        features['syn_count'] = flow_data.get('syn_count', 0)
        features['ack_count'] = flow_data.get('ack_count', 0)
        features['fin_count'] = flow_data.get('fin_count', 0)
        features['rst_count'] = flow_data.get('rst_count', 0)
        
        # Direction features
        features['forward_packets'] = flow_data.get('forward_packets', 0)
        features['backward_packets'] = flow_data.get('backward_packets', 0)
        features['forward_bytes'] = flow_data.get('forward_bytes', 0)
        features['backward_bytes'] = flow_data.get('backward_bytes', 0)
        
        # Timing features
        features['avg_inter_arrival_time'] = flow_data.get('avg_inter_arrival_time', 0)
        features['min_inter_arrival_time'] = flow_data.get('min_inter_arrival_time', 0)
        features['max_inter_arrival_time'] = flow_data.get('max_inter_arrival_time', 0)
        
        # Protocol
        features['protocol'] = flow_data.get('protocol', 'unknown')
        
        # IP addresses (simplified for now)
        features['src_ip'] = flow_data.get('src_ip', '0.0.0.0')
        features['dst_ip'] = flow_data.get('dst_ip', '0.0.0.0')
        
        # Calculate derived features
        total_packets = features['forward_packets'] + features['backward_packets']
        if total_packets > 0:
            features['forward_packet_ratio'] = features['forward_packets'] / total_packets
            features['backward_packet_ratio'] = features['backward_packets'] / total_packets
        else:
            features['forward_packet_ratio'] = 0
            features['backward_packet_ratio'] = 0
        
        total_bytes = features['forward_bytes'] + features['backward_bytes']
        if total_bytes > 0:
            features['forward_byte_ratio'] = features['forward_bytes'] / total_bytes
            features['backward_byte_ratio'] = features['backward_bytes'] / total_bytes
        else:
            features['forward_byte_ratio'] = 0
            features['backward_byte_ratio'] = 0
        
        # TCP flag ratios
        if features['packet_count'] > 0:
            features['syn_ratio'] = features['syn_count'] / features['packet_count']
            features['ack_ratio'] = features['ack_count'] / features['packet_count']
            features['fin_ratio'] = features['fin_count'] / features['packet_count']
            features['rst_ratio'] = features['rst_count'] / features['packet_count']
        else:
            features['syn_ratio'] = 0
            features['ack_ratio'] = 0
            features['fin_ratio'] = 0
            features['rst_ratio'] = 0
        
        return features
    
    def preprocess_dataframe(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Preprocess a DataFrame of network flows
        
        Args:
            df: DataFrame containing network flow data
            
        Returns:
            Preprocessed DataFrame
        """
        logger.info(f"Preprocessing DataFrame with {len(df)} flows")
        
        # Create a copy to avoid modifying original
        processed_df = df.copy()
        
        # Handle missing values
        processed_df = self._handle_missing_values(processed_df)
        
        # Encode categorical variables
        processed_df = self._encode_categorical_features(processed_df)
        
        # Normalize numerical features
        if self.is_fitted:
            processed_df = self._normalize_features(processed_df)
        else:
            logger.warning("Preprocessor not fitted. Call fit() first.")
        
        return processed_df
    
    def fit(self, df: pd.DataFrame) -> 'NetworkFeaturePreprocessor':
        """
        Fit the preprocessor on training data
        
        Args:
            df: Training DataFrame
            
        Returns:
            Self for method chaining
        """
        logger.info("Fitting preprocessor on training data")
        
        # Handle missing values
        df_clean = self._handle_missing_values(df)
        
        # Encode categorical variables
        df_encoded = self._encode_categorical_features(df_clean)
        
        # Fit scaler on numerical features
        numerical_cols = [col for col in self.numerical_features if col in df_encoded.columns]
        if numerical_cols:
            self.scaler.fit(df_encoded[numerical_cols])
            logger.info(f"Fitted scaler on {len(numerical_cols)} numerical features")
        
        self.is_fitted = True
        return self
    
    def transform(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Transform data using fitted preprocessor
        
        Args:
            df: DataFrame to transform
            
        Returns:
            Transformed DataFrame
        """
        if not self.is_fitted:
            raise ValueError("Preprocessor must be fitted before transform")
        
        return self.preprocess_dataframe(df)
    
    def _handle_missing_values(self, df: pd.DataFrame) -> pd.DataFrame:
        """Handle missing values in the dataset"""
        # Fill missing numerical values with 0
        numerical_cols = [col for col in self.numerical_features if col in df.columns]
        df[numerical_cols] = df[numerical_cols].fillna(0)
        
        # Fill missing categorical values with 'unknown'
        categorical_cols = [col for col in self.categorical_features if col in df.columns]
        df[categorical_cols] = df[categorical_cols].fillna('unknown')
        
        return df
    
    def _encode_categorical_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Encode categorical features"""
        for col in self.categorical_features:
            if col in df.columns:
                if col not in self.label_encoders:
                    self.label_encoders[col] = LabelEncoder()
                    df[col] = self.label_encoders[col].fit_transform(df[col].astype(str))
                else:
                    # Handle unseen categories
                    df[col] = df[col].astype(str)
                    unique_values = df[col].unique()
                    known_values = self.label_encoders[col].classes_
                    
                    # Replace unknown values with most common known value
                    unknown_mask = ~df[col].isin(known_values)
                    if unknown_mask.any():
                        most_common = known_values[0]  # Use first known value
                        df.loc[unknown_mask, col] = most_common
                    
                    df[col] = self.label_encoders[col].transform(df[col])
        
        return df
    
    def _normalize_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Normalize numerical features"""
        numerical_cols = [col for col in self.numerical_features if col in df.columns]
        if numerical_cols:
            df[numerical_cols] = self.scaler.transform(df[numerical_cols])
        
        return df
    
    def get_feature_names(self) -> List[str]:
        """Get list of feature names"""
        all_features = self.numerical_features + self.categorical_features + self.derived_features
        return [f for f in all_features if f in self.numerical_features or f in self.derived_features]
    
    def save_preprocessor(self, filepath: str):
        """Save preprocessor to file"""
        preprocessor_data = {
            'scaler': self.scaler,
            'label_encoders': self.label_encoders,
            'is_fitted': self.is_fitted,
            'numerical_features': self.numerical_features,
            'categorical_features': self.categorical_features,
            'derived_features': self.derived_features
        }
        joblib.dump(preprocessor_data, filepath)
        logger.info(f"Preprocessor saved to {filepath}")
    
    def load_preprocessor(self, filepath: str):
        """Load preprocessor from file"""
        if not os.path.exists(filepath):
            raise FileNotFoundError(f"Preprocessor file not found: {filepath}")
        
        preprocessor_data = joblib.load(filepath)
        self.scaler = preprocessor_data['scaler']
        self.label_encoders = preprocessor_data['label_encoders']
        self.is_fitted = preprocessor_data['is_fitted']
        self.numerical_features = preprocessor_data['numerical_features']
        self.categorical_features = preprocessor_data['categorical_features']
        self.derived_features = preprocessor_data['derived_features']
        
        logger.info(f"Preprocessor loaded from {filepath}")

# Example usage
if __name__ == "__main__":
    # Configure logging
    logging.basicConfig(level=logging.INFO)
    
    # Create sample data
    sample_flows = [
        {
            'duration': 10.5,
            'packet_count': 100,
            'byte_count': 5000,
            'protocol': 'TCP',
            'src_ip': '192.168.1.100',
            'dst_ip': '192.168.1.1',
            'syn_count': 1,
            'ack_count': 50,
            'forward_packets': 60,
            'backward_packets': 40
        },
        {
            'duration': 5.2,
            'packet_count': 25,
            'byte_count': 1200,
            'protocol': 'UDP',
            'src_ip': '192.168.1.200',
            'dst_ip': '192.168.1.1',
            'syn_count': 0,
            'ack_count': 0,
            'forward_packets': 15,
            'backward_packets': 10
        }
    ]
    
    # Test feature extraction
    preprocessor = NetworkFeaturePreprocessor()
    
    for i, flow in enumerate(sample_flows):
        features = preprocessor.extract_features_from_flow(flow)
        print(f"Flow {i+1} features:")
        for key, value in features.items():
            print(f"  {key}: {value}")
        print()
