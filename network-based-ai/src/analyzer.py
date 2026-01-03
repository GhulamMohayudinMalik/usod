"""
Network Threat Analyzer
End-to-end pipeline for analyzing PCAP files and detecting network threats.

Updated to use the multiclass CICIDS2017 model for high-accuracy detection.
Detects: BENIGN, DDoS, DoS, PortScan, Brute Force, Web Attack, Infiltration, Other
"""

import pandas as pd
import numpy as np
from pathlib import Path
from typing import Union, Optional, Dict
from datetime import datetime
import json

# Use relative imports for package structure, fallback to absolute
try:
    from .predictor import NetworkThreatPredictor
    from .feature_extractor import PCAPFeatureExtractor, CICIDS2017_FEATURES
except ImportError:
    import sys
    parent_dir = Path(__file__).parent.parent
    if str(parent_dir) not in sys.path:
        sys.path.insert(0, str(parent_dir))
    from src.predictor import NetworkThreatPredictor
    from src.feature_extractor import PCAPFeatureExtractor, CICIDS2017_FEATURES


class NetworkThreatAnalyzer:
    """
    Main analyzer class for network threat detection.
    Combines feature extraction and model prediction into a single pipeline.
    
    Uses the multiclass CICIDS2017 model (99.78% accuracy) to detect:
    - BENIGN (normal traffic)
    - DDoS (Distributed Denial of Service)
    - DoS (Denial of Service variants: Hulk, GoldenEye, Slowloris, Slowhttptest)
    - PortScan
    - Brute Force (FTP-Patator, SSH-Patator)
    - Web Attack (SQL Injection, XSS, Brute Force)
    - Infiltration
    - Other (Bot)
    """
    
    def __init__(self, models_dir: Union[str, Path] = None):
        """
        Initialize the analyzer.
        
        Args:
            models_dir: Path to directory containing trained models.
        """
        self.predictor = NetworkThreatPredictor(models_dir)
        self.extractor = PCAPFeatureExtractor()
        
        if not self.extractor.nfstream_available:
            raise RuntimeError("NFStream not available. Required for PCAP analysis. Install with: pip install nfstream")
    
    def analyze_pcap(self, pcap_path: Union[str, Path], 
                     max_flows: Optional[int] = None,
                     save_results: bool = True,
                     output_dir: Union[str, Path] = None,
                     model_type: str = 'nfstream',
                     batch_size: int = 5000,
                     **kwargs) -> Dict:
        """
        Analyze a PCAP file for network threats.
        
        Args:
            pcap_path: Path to PCAP file
            max_flows: Maximum number of flows to analyze
            save_results: Whether to save results to CSV
            output_dir: Directory to save results
            model_type: 'robust_binary' (recommended), 'nfstream', 'cicflowmeter', or 'multiclass'
            batch_size: Number of flows per batch for breakdown (default 5000)
        
        Returns:
            Dictionary containing analysis results with attack details.
        """
        pcap_path = Path(pcap_path)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        # Cache file size before analysis (file may be deleted during processing)
        try:
            pcap_size_mb = pcap_path.stat().st_size / 1024**2
        except:
            pcap_size_mb = 0.0
        
        # Select model based on type
        use_robust_binary = model_type == 'robust_binary' and self.predictor.robust_binary_model is not None
        use_cicflowmeter = model_type == 'cicflowmeter' and self.predictor.cicflowmeter_model is not None
        use_nfstream_model = model_type == 'nfstream' and self.predictor.nfstream_model is not None
        
        if use_robust_binary:
            model_name = "Robust Binary (99.76% accuracy, 0.23% FPR)"
        elif use_cicflowmeter:
            model_name = "CICFlowMeter (4-class, 99.89% accuracy)"
        elif use_nfstream_model:
            model_name = "NFStream Binary (BENIGN/DDoS)"
        else:
            model_name = "Multiclass CICIDS2017"
        
        print(f"\n{'='*60}")
        print(f"PCAP ANALYSIS - {pcap_path.name}")
        print(f"{'='*60}")
        print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"Model: {model_name}")
        
        # Step 1: Extract features
        print(f"\n[1/3] Extracting features from PCAP...")
        
        if use_robust_binary or use_nfstream_model:
            # Use raw NFStream features for binary models
            features_df = self.extractor.extract_nfstream_features(pcap_path, max_flows)
            print(f"      Extracted {len(features_df)} flows (NFStream features)")
        elif use_cicflowmeter:
            # Use CICFlowMeterPlugin for full 78-feature extraction
            features_df = self.extractor.extract_cicids_full_features(pcap_path, max_flows, include_metadata=True)
            print(f"      Extracted {len(features_df)} flows (CICFlowMeter features)")
        else:
            # Use CICIDS2017-mapped features for multiclass model
            features_df = self.extractor.extract_features(pcap_path, max_flows, include_metadata=True)
            print(f"      Extracted {len(features_df)} flows")
        
        if len(features_df) == 0:
            return {
                'status': 'no_flows',
                'message': 'No flows found in PCAP file',
                'pcap_file': str(pcap_path),
                'timestamp': timestamp
            }
        
        # Step 2: Make predictions
        print(f"\n[2/3] Running threat detection...")
        
        if use_robust_binary:
            # Use Robust Binary model (BENIGN/ATTACK, 99.76% accuracy)
            predictions, probabilities = self.predictor.predict_robust_binary(features_df, return_proba=True)
        elif use_cicflowmeter:
            # Use CICFlowMeter model (4-class)
            predictions, probabilities = self.predictor.predict_cicflowmeter(features_df, return_proba=True)
        elif use_nfstream_model:
            # Use NFStream model (binary: BENIGN/DDoS)
            predictions, probabilities = self.predictor.predict_nfstream(features_df, return_proba=True)
        else:
            # Use multiclass CICIDS model
            feature_cols = [c for c in features_df.columns if c in CICIDS2017_FEATURES]
            predictions, probabilities = self.predictor.predict(features_df[feature_cols], return_proba=True)
        
        print(f"      Analyzed {len(predictions)} flows")


        
        # Step 3: Generate results
        print(f"\n[3/3] Generating report...")
        
        features_df['Prediction'] = predictions
        
        # Add confidence (max probability)
        if isinstance(probabilities, np.ndarray) and len(probabilities.shape) == 2:
            features_df['Confidence'] = probabilities.max(axis=1)
        
        # Generate summary with batch breakdown
        summary = self._generate_summary(predictions, batch_size)
        
        results = {
            'status': 'success',
            'pcap_file': str(pcap_path),
            'pcap_size_mb': pcap_size_mb,
            'timestamp': timestamp,
            'model_type': 'robust_binary' if use_robust_binary else ('cicflowmeter' if use_cicflowmeter else ('nfstream_binary' if use_nfstream_model else 'multiclass_cicids')),

            'total_flows': len(predictions),
            'summary': summary,

            'threat_detected': summary.get('attack_count', 0) > 0,
        }
        
        self._print_summary(results)
        
        if save_results:
            if output_dir is None:
                output_dir = Path(__file__).parent.parent / 'results'
            output_dir = Path(output_dir)
            output_dir.mkdir(exist_ok=True)
            
            csv_path = output_dir / f"analysis_{pcap_path.stem}_{timestamp}.csv"
            features_df.to_csv(csv_path, index=False)
            print(f"\n[SAVED] Detailed results saved to: {csv_path}")

            summary_path = output_dir / f"summary_{pcap_path.stem}_{timestamp}.json"
            with open(summary_path, 'w') as f:
                json.dump(results, f, indent=2)
            print(f"[SAVED] Summary saved to: {summary_path}")
            
            results['csv_path'] = str(csv_path)
            results['summary_path'] = str(summary_path)
        
        results['dataframe'] = features_df
        
        return results
    
    def _generate_summary(self, predictions: np.ndarray, batch_size: int = 5000) -> Dict:
        """Generate clean summary statistics for predictions with batch breakdown."""
        unique, counts = np.unique(predictions, return_counts=True)
        total = len(predictions)
        
        # Calculate benign vs attack counts
        benign_count = 0
        attack_types = {}
        
        for label, count in zip(unique, counts):
            if label == 'BENIGN':
                benign_count = int(count)
            else:
                attack_types[str(label)] = int(count)
        
        attack_count = total - benign_count
        
        # Generate batch breakdown
        batch_breakdown = self._generate_batch_breakdown(predictions, batch_size)
        
        # Build clean summary (no duplicate fields)
        summary = {
            # Core statistics
            'total': total,
            'benign_count': benign_count,
            'attack_count': attack_count,
            
            # Percentages (rounded for display)
            'benign_percentage': round(benign_count / total * 100, 2) if total > 0 else 0.0,
            'attack_percentage': round(attack_count / total * 100, 2) if total > 0 else 0.0,
            
            # Attack type breakdown (only if there are attacks)
            'attack_types': attack_types if attack_types else None,
            
            # Batch-wise breakdown
            'batch_size': batch_size,
            'batch_breakdown': batch_breakdown
        }
        
        return summary
    
    def _generate_batch_breakdown(self, predictions: np.ndarray, batch_size: int) -> list:
        """Generate per-batch breakdown of benign/attack flows."""
        total = len(predictions)
        breakdown = []
        
        for start_idx in range(0, total, batch_size):
            end_idx = min(start_idx + batch_size, total)
            batch_predictions = predictions[start_idx:end_idx]
            
            # Count benign and attack in this batch
            batch_benign = int(np.sum(batch_predictions == 'BENIGN'))
            batch_attack = len(batch_predictions) - batch_benign
            batch_total = len(batch_predictions)
            
            breakdown.append({
                'range_start': start_idx + 1,  # 1-indexed for display
                'range_end': end_idx,
                'total': batch_total,
                'benign': batch_benign,
                'attack': batch_attack,
                'attack_percentage': round(batch_attack / batch_total * 100, 2) if batch_total > 0 else 0.0
            })
        
        return breakdown

    
    def _print_summary(self, results: Dict):
        """Print analysis summary."""
        summary = results['summary']
        
        print(f"\n{'='*60}")
        print("ANALYSIS SUMMARY")
        print(f"{'='*60}")
        print(f"File: {results['pcap_file']}")
        print(f"Size: {results['pcap_size_mb']:.2f} MB")
        print(f"Total flows: {summary['total']:,}")
        print(f"\n{'─'*60}")
        print("DETECTION RESULTS")
        print(f"{'─'*60}")
        
        # Sort by count (descending), but BENIGN first
        sorted_items = []
        if 'BENIGN' in summary:
            sorted_items.append(('BENIGN', summary['BENIGN']))
        for k, v in sorted(summary.items(), key=lambda x: -x[1] if isinstance(x[1], int) else 0):
            if k not in ['total', 'attack_count', 'attack_percentage', 'BENIGN'] and isinstance(v, int):
                sorted_items.append((k, v))
        
        for label, count in sorted_items:
            pct = count / summary['total'] * 100
            status = "✓" if label == 'BENIGN' else "⚠"
            print(f"  {status} {label}: {count:,} ({pct:.1f}%)")
        
        print(f"\n{'─'*60}")
        if results['threat_detected']:
            print(f"⚠️  THREAT DETECTED: {summary['attack_count']:,} malicious flows ({summary['attack_percentage']:.1f}%)")
        else:
            print("✅ NO THREATS DETECTED - All traffic appears benign")
        print(f"{'='*60}")
    
    def get_attack_details(self, results: Dict) -> pd.DataFrame:
        """
        Get detailed information about detected attacks.
        
        Args:
            results: Results dictionary from analyze_pcap
        
        Returns:
            DataFrame with attack flows and their details.
        """
        if 'dataframe' not in results:
            return pd.DataFrame()
        
        df = results['dataframe']
        attacks = df[df['Prediction'] != 'BENIGN'].copy()
        
        if len(attacks) == 0:
            return pd.DataFrame()
        
        # Sort by confidence (if available), then by prediction
        if 'Confidence' in attacks.columns:
            attacks = attacks.sort_values(['Prediction', 'Confidence'], ascending=[True, False])
        else:
            attacks = attacks.sort_values('Prediction')
        
        return attacks


def analyze_pcap_file(pcap_path: str, max_flows: int = None) -> Dict:
    """
    Convenience function to analyze a PCAP file.
    
    Args:
        pcap_path: Path to PCAP file
        max_flows: Maximum number of flows to analyze
    
    Returns:
        Analysis results dictionary.
    """
    analyzer = NetworkThreatAnalyzer()
    return analyzer.analyze_pcap(pcap_path, max_flows=max_flows)


if __name__ == "__main__":
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python analyzer.py <pcap_file> [max_flows]")
        print("Example: python analyzer.py traffic.pcap 1000")
        sys.exit(1)
    
    pcap_file = sys.argv[1]
    max_flows = int(sys.argv[2]) if len(sys.argv) > 2 else None
    
    results = analyze_pcap_file(pcap_file, max_flows)
    
    if results['status'] == 'success':
        print("\n✅ Analysis complete!")
    else:
        print(f"\n❌ Analysis failed: {results.get('message', 'Unknown error')}")
