"""
CICIDS2017 Dataset Loader
Loads and preprocesses the CICIDS2017 dataset for ML training
"""

import pandas as pd
import numpy as np
import os
from typing import List, Dict, Any, Tuple, Optional
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

class CICIDS2017Loader:
    """
    Loader for CICIDS2017 dataset
    """
    
    def __init__(self, data_path: str = "data/raw"):
        """
        Initialize CICIDS2017 loader
        
        Args:
            data_path: Path to CICIDS2017 CSV files
        """
        self.data_path = Path(data_path)
        self.dataset_info = {
            'Monday-WorkingHours.pcap_ISCX.csv': {'type': 'normal', 'size': '168.73 MB'},
            'Tuesday-WorkingHours.pcap_ISCX.csv': {'type': 'normal', 'size': '128.82 MB'},
            'Wednesday-workingHours.pcap_ISCX.csv': {'type': 'normal', 'size': '214.74 MB'},
            'Thursday-WorkingHours-Morning-WebAttacks.pcap_ISCX.csv': {'type': 'web_attacks', 'size': '49.61 MB'},
            'Thursday-WorkingHours-Afternoon-Infilteration.pcap_ISCX.csv': {'type': 'infiltration', 'size': '79.25 MB'},
            'Friday-WorkingHours-Morning.pcap_ISCX.csv': {'type': 'normal', 'size': '55.62 MB'},
            'Friday-WorkingHours-Afternoon-DDos.pcap_ISCX.csv': {'type': 'ddos', 'size': '73.55 MB'},
            'Friday-WorkingHours-Afternoon-PortScan.pcap_ISCX.csv': {'type': 'port_scan', 'size': '73.34 MB'}
        }
    
    def list_available_files(self) -> List[str]:
        """
        List available CICIDS2017 files
        
        Returns:
            List of available file names
        """
        available_files = []
        for file_name in self.dataset_info.keys():
            file_path = self.data_path / file_name
            if file_path.exists():
                available_files.append(file_name)
            else:
                logger.warning(f"File not found: {file_name}")
        
        return available_files
    
    def load_single_file(self, file_name: str, sample_size: Optional[int] = None) -> Tuple[pd.DataFrame, pd.Series]:
        """
        Load a single CICIDS2017 file
        
        Args:
            file_name: Name of the file to load
            sample_size: Number of samples to load (None for all)
            
        Returns:
            Tuple of (features, labels)
        """
        file_path = self.data_path / file_name
        
        if not file_path.exists():
            raise FileNotFoundError(f"File not found: {file_path}")
        
        logger.info(f"Loading {file_name}...")
        
        # Load the CSV file
        if sample_size:
            df = pd.read_csv(file_path, nrows=sample_size)
        else:
            df = pd.read_csv(file_path)
        
        logger.info(f"Loaded {len(df)} samples from {file_name}")
        
        # Separate features and labels
        # The last column is the label
        X = df.iloc[:, :-1]  # All columns except the last
        y = df.iloc[:, -1]    # Last column (Label)
        
        # Clean column names (remove leading/trailing spaces)
        X.columns = X.columns.str.strip()
        
        return X, y
    
    def load_all_files(self, sample_size_per_file: Optional[int] = None) -> Tuple[pd.DataFrame, pd.Series]:
        """
        Load all available CICIDS2017 files
        
        Args:
            sample_size_per_file: Number of samples to load per file (None for all)
            
        Returns:
            Tuple of (combined_features, combined_labels)
        """
        available_files = self.list_available_files()
        
        if not available_files:
            raise FileNotFoundError("No CICIDS2017 files found in the data directory")
        
        logger.info(f"Loading {len(available_files)} files...")
        
        all_features = []
        all_labels = []
        
        for file_name in available_files:
            try:
                X, y = self.load_single_file(file_name, sample_size_per_file)
                all_features.append(X)
                all_labels.append(y)
                
                logger.info(f"Loaded {file_name}: {len(X)} samples, {len(X.columns)} features")
                
            except Exception as e:
                logger.error(f"Error loading {file_name}: {e}")
                continue
        
        if not all_features:
            raise RuntimeError("No files could be loaded successfully")
        
        # Combine all data
        combined_X = pd.concat(all_features, ignore_index=True)
        combined_y = pd.concat(all_labels, ignore_index=True)
        
        logger.info(f"Combined dataset: {len(combined_X)} samples, {len(combined_X.columns)} features")
        logger.info(f"Label distribution:\n{combined_y.value_counts()}")
        
        return combined_X, combined_y
    
    def load_by_attack_type(self, attack_type: str, sample_size: Optional[int] = None) -> Tuple[pd.DataFrame, pd.Series]:
        """
        Load files by attack type
        
        Args:
            attack_type: Type of attack ('normal', 'ddos', 'port_scan', 'web_attacks', 'infiltration')
            sample_size: Number of samples to load (None for all)
            
        Returns:
            Tuple of (features, labels)
        """
        matching_files = []
        for file_name, info in self.dataset_info.items():
            if info['type'] == attack_type:
                file_path = self.data_path / file_name
                if file_path.exists():
                    matching_files.append(file_name)
        
        if not matching_files:
            raise ValueError(f"No files found for attack type: {attack_type}")
        
        logger.info(f"Loading {len(matching_files)} files for attack type: {attack_type}")
        
        all_features = []
        all_labels = []
        
        for file_name in matching_files:
            try:
                X, y = self.load_single_file(file_name, sample_size)
                all_features.append(X)
                all_labels.append(y)
            except Exception as e:
                logger.error(f"Error loading {file_name}: {e}")
                continue
        
        if not all_features:
            raise RuntimeError(f"No files could be loaded for attack type: {attack_type}")
        
        # Combine data
        combined_X = pd.concat(all_features, ignore_index=True)
        combined_y = pd.concat(all_labels, ignore_index=True)
        
        logger.info(f"Loaded {len(combined_X)} samples for {attack_type}")
        
        return combined_X, combined_y
    
    def get_dataset_info(self) -> Dict[str, Any]:
        """
        Get information about the dataset
        
        Returns:
            Dictionary with dataset information
        """
        available_files = self.list_available_files()
        
        info = {
            'total_files': len(available_files),
            'available_files': available_files,
            'file_info': {k: v for k, v in self.dataset_info.items() if k in available_files},
            'total_size_mb': sum([float(v['size'].split()[0]) for k, v in self.dataset_info.items() if k in available_files])
        }
        
        return info
    
    def create_balanced_sample(self, normal_ratio: float = 0.7, attack_ratio: float = 0.3, 
                             sample_size: int = 100000) -> Tuple[pd.DataFrame, pd.Series]:
        """
        Create a balanced sample of the dataset
        
        Args:
            normal_ratio: Ratio of normal samples
            attack_ratio: Ratio of attack samples
            sample_size: Total number of samples to generate
            
        Returns:
            Tuple of (features, labels)
        """
        normal_samples = int(sample_size * normal_ratio)
        attack_samples = int(sample_size * attack_ratio)
        
        logger.info(f"Creating balanced sample: {normal_samples} normal, {attack_samples} attack")
        
        # Load normal samples
        try:
            normal_X, normal_y = self.load_by_attack_type('normal', normal_samples)
        except ValueError:
            logger.warning("No normal files found, using all available data")
            normal_X, normal_y = self.load_all_files(normal_samples)
            normal_y = normal_y.replace('BENIGN', 'Normal')
        
        # Load attack samples
        attack_X_list = []
        attack_y_list = []
        
        attack_types = ['ddos', 'port_scan', 'web_attacks', 'infiltration']
        samples_per_attack = attack_samples // len(attack_types)
        
        for attack_type in attack_types:
            try:
                X, y = self.load_by_attack_type(attack_type, samples_per_attack)
                attack_X_list.append(X)
                attack_y_list.append(y)
            except ValueError:
                logger.warning(f"No files found for attack type: {attack_type}")
                continue
        
        if not attack_X_list:
            logger.warning("No attack samples found, using normal samples only")
            return normal_X, normal_y
        
        # Combine attack samples
        attack_X = pd.concat(attack_X_list, ignore_index=True)
        attack_y = pd.concat(attack_y_list, ignore_index=True)
        
        # Combine normal and attack samples
        combined_X = pd.concat([normal_X, attack_X], ignore_index=True)
        combined_y = pd.concat([normal_y, attack_y], ignore_index=True)
        
        # Shuffle the data
        combined_X = combined_X.sample(frac=1, random_state=42).reset_index(drop=True)
        combined_y = combined_y.sample(frac=1, random_state=42).reset_index(drop=True)
        
        logger.info(f"Created balanced sample: {len(combined_X)} samples")
        logger.info(f"Label distribution:\n{combined_y.value_counts()}")
        
        return combined_X, combined_y

# Example usage
if __name__ == "__main__":
    # Configure logging
    logging.basicConfig(level=logging.INFO)
    
    # Create loader
    loader = CICIDS2017Loader()
    
    # Get dataset info
    info = loader.get_dataset_info()
    print("Dataset Info:")
    print(f"Total files: {info['total_files']}")
    print(f"Available files: {info['available_files']}")
    
    # Load a small sample
    try:
        X, y = loader.create_balanced_sample(sample_size=1000)
        print(f"\nLoaded sample: {X.shape[0]} samples, {X.shape[1]} features")
        print(f"Label distribution:\n{y.value_counts()}")
    except Exception as e:
        print(f"Error loading data: {e}")
