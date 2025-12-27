"""
Feature Extractor Module
Extracts features from PCAP files using NFStream and maps them to CICIDS2017 format.

Updated to extract CICIDS2017-compatible features for the multiclass model.
"""

import pandas as pd
import numpy as np
from pathlib import Path
from typing import Union, List, Optional


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

# NFStream attributes for raw extraction
NFSTREAM_ATTRIBUTES = [
    'dst_port',
    'bidirectional_duration_ms',
    'src2dst_packets', 'dst2src_packets', 'bidirectional_packets',
    'src2dst_bytes', 'dst2src_bytes', 'bidirectional_bytes',
    'src2dst_max_ps', 'src2dst_min_ps', 'src2dst_mean_ps', 'src2dst_stddev_ps',
    'dst2src_max_ps', 'dst2src_min_ps', 'dst2src_mean_ps', 'dst2src_stddev_ps',
    'bidirectional_min_ps', 'bidirectional_max_ps', 'bidirectional_mean_ps', 'bidirectional_stddev_ps',
    'bidirectional_mean_piat_ms', 'bidirectional_stddev_piat_ms', 'bidirectional_max_piat_ms', 'bidirectional_min_piat_ms',
    'src2dst_duration_ms', 'src2dst_mean_piat_ms', 'src2dst_stddev_piat_ms', 'src2dst_max_piat_ms', 'src2dst_min_piat_ms',
    'dst2src_duration_ms', 'dst2src_mean_piat_ms', 'dst2src_stddev_piat_ms', 'dst2src_max_piat_ms', 'dst2src_min_piat_ms',
    'src2dst_psh_packets', 'src2dst_urg_packets', 'src2dst_syn_packets', 'src2dst_fin_packets', 'src2dst_rst_packets', 'src2dst_ack_packets',
    'dst2src_psh_packets', 'dst2src_urg_packets', 'dst2src_syn_packets', 'dst2src_fin_packets', 'dst2src_rst_packets', 'dst2src_ack_packets',
]

# Flow metadata fields (for display/debugging)
FLOW_METADATA = ['src_ip', 'dst_ip', 'src_port', 'dst_port', 'protocol']


class PCAPFeatureExtractor:
    """
    Extract features from PCAP files using NFStream.
    
    Supports two modes:
    1. Basic mode: Maps NFStream native features to CICIDS2017 format (fast, ~60 features accurate)
    2. Full mode: Uses CICFlowMeterPlugin for complete 78-feature extraction (slower, most accurate)
    """
    
    def __init__(self):
        """Initialize the feature extractor."""
        self.nfstream_available = self._check_nfstream()
        self.cicflowmeter_plugin = None
        
        if not self.nfstream_available:
            print("WARNING: NFStream not available. Install with: pip install nfstream")
        else:
            # Try to load CICFlowMeter plugin
            try:
                import sys
                from pathlib import Path
                plugin_path = Path(__file__).parent.parent
                if str(plugin_path) not in sys.path:
                    sys.path.insert(0, str(plugin_path))
                from cicflowmeter_nfstream_plugin import CICFlowMeterPlugin, extract_cicids_features
                self.cicflowmeter_plugin = CICFlowMeterPlugin
                self.extract_cicids_features_func = extract_cicids_features
                print("  CICFlowMeterPlugin loaded for full 78-feature extraction")
            except ImportError as e:
                print(f"  Warning: CICFlowMeterPlugin not available: {e}")
    
    def _check_nfstream(self) -> bool:
        """Check if NFStream is available."""
        try:
            import nfstream
            return True
        except ImportError:
            return False

    
    def extract_features(self, pcap_path: Union[str, Path],
                         max_flows: Optional[int] = None,
                         include_metadata: bool = True) -> pd.DataFrame:
        """
        Extract CICIDS2017-compatible features from PCAP file.
        
        Args:
            pcap_path: Path to PCAP file
            max_flows: Maximum number of flows to extract
            include_metadata: Include flow metadata (IPs, ports) for display
        
        Returns:
            DataFrame with CICIDS2017 features ready for prediction.
        """
        if not self.nfstream_available:
            raise RuntimeError("NFStream not installed. Run: pip install nfstream")
        
        from nfstream import NFStreamer
        
        pcap_path = Path(pcap_path)
        if not pcap_path.exists():
            raise FileNotFoundError(f"PCAP file not found: {pcap_path}")
        
        file_size_mb = pcap_path.stat().st_size / 1024**2
        
        if file_size_mb > 100:
            print(f"Processing large PCAP file: {pcap_path.name} ({file_size_mb:.2f} MB)")
        else:
            print(f"Processing PCAP file: {pcap_path.name} ({file_size_mb:.2f} MB)")
        
        # Create NFStreamer with statistical features
        streamer = NFStreamer(
            source=str(pcap_path),
            statistical_analysis=True,
            splt_analysis=0,
            n_dissections=0,
        )
        
        flows_list = []
        metadata_list = []
        flow_count = 0
        
        for flow in streamer:
            # Extract NFStream attributes
            flow_dict = {}
            for attr in NFSTREAM_ATTRIBUTES:
                try:
                    value = getattr(flow, attr, 0)
                    flow_dict[attr] = 0 if value is None else value
                except:
                    flow_dict[attr] = 0
            
            flows_list.append(flow_dict)
            
            # Extract metadata for display
            if include_metadata:
                meta = {
                    'src_ip': getattr(flow, 'src_ip', ''),
                    'dst_ip': getattr(flow, 'dst_ip', ''),
                    'src_port': getattr(flow, 'src_port', 0),
                    'dst_port': getattr(flow, 'dst_port', 0),
                    'protocol': getattr(flow, 'protocol', 0),
                }
                metadata_list.append(meta)
            
            flow_count += 1
            
            if flow_count % 25000 == 0:
                print(f"  Processed {flow_count:,} flows...")
            
            if max_flows and flow_count >= max_flows:
                print(f"  Reached max_flows limit: {max_flows:,}")
                break
        
        if flow_count > 0:
            print(f"  SUCCESS: Extracted {flow_count:,} flows")
        
        if not flows_list:
            print("WARNING: No flows found in PCAP file")
            return pd.DataFrame(columns=CICIDS2017_FEATURES)
        
        # Convert to DataFrame and map to CICIDS2017 features
        df_raw = pd.DataFrame(flows_list)
        df_cicids = self._map_to_cicids(df_raw)
        
        # Add metadata columns if requested
        if include_metadata and metadata_list:
            df_meta = pd.DataFrame(metadata_list)
            df_cicids = pd.concat([df_meta, df_cicids], axis=1)
        
        return df_cicids
    
    def _map_to_cicids(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Map NFStream features to CICIDS2017 format.
        
        Args:
            df: DataFrame with NFStream features
        
        Returns:
            DataFrame with CICIDS2017-compatible features.
        """
        result = pd.DataFrame()
        
        # Basic mappings
        result['Destination Port'] = df.get('dst_port', 0)
        result['Flow Duration'] = df.get('bidirectional_duration_ms', 0)
        result['Total Fwd Packets'] = df.get('src2dst_packets', 0)
        result['Total Backward Packets'] = df.get('dst2src_packets', 0)
        result['Total Length of Fwd Packets'] = df.get('src2dst_bytes', 0)
        result['Total Length of Bwd Packets'] = df.get('dst2src_bytes', 0)
        
        # Packet length stats
        result['Fwd Packet Length Max'] = df.get('src2dst_max_ps', 0)
        result['Fwd Packet Length Min'] = df.get('src2dst_min_ps', 0)
        result['Fwd Packet Length Mean'] = df.get('src2dst_mean_ps', 0)
        result['Fwd Packet Length Std'] = df.get('src2dst_stddev_ps', 0)
        result['Bwd Packet Length Max'] = df.get('dst2src_max_ps', 0)
        result['Bwd Packet Length Min'] = df.get('dst2src_min_ps', 0)
        result['Bwd Packet Length Mean'] = df.get('dst2src_mean_ps', 0)
        result['Bwd Packet Length Std'] = df.get('dst2src_stddev_ps', 0)
        
        # Flow rates
        duration_s = (df.get('bidirectional_duration_ms', 1) / 1000).replace(0, 0.001)
        total_bytes = df.get('bidirectional_bytes', df.get('src2dst_bytes', 0) + df.get('dst2src_bytes', 0))
        total_packets = df.get('bidirectional_packets', df.get('src2dst_packets', 0) + df.get('dst2src_packets', 0))
        
        result['Flow Bytes/s'] = total_bytes / duration_s
        result['Flow Packets/s'] = total_packets / duration_s
        
        # Inter-arrival times
        result['Flow IAT Mean'] = df.get('bidirectional_mean_piat_ms', 0)
        result['Flow IAT Std'] = df.get('bidirectional_stddev_piat_ms', 0)
        result['Flow IAT Max'] = df.get('bidirectional_max_piat_ms', 0)
        result['Flow IAT Min'] = df.get('bidirectional_min_piat_ms', 0)
        
        result['Fwd IAT Total'] = df.get('src2dst_duration_ms', 0)
        result['Fwd IAT Mean'] = df.get('src2dst_mean_piat_ms', 0)
        result['Fwd IAT Std'] = df.get('src2dst_stddev_piat_ms', 0)
        result['Fwd IAT Max'] = df.get('src2dst_max_piat_ms', 0)
        result['Fwd IAT Min'] = df.get('src2dst_min_piat_ms', 0)
        
        result['Bwd IAT Total'] = df.get('dst2src_duration_ms', 0)
        result['Bwd IAT Mean'] = df.get('dst2src_mean_piat_ms', 0)
        result['Bwd IAT Std'] = df.get('dst2src_stddev_piat_ms', 0)
        result['Bwd IAT Max'] = df.get('dst2src_max_piat_ms', 0)
        result['Bwd IAT Min'] = df.get('dst2src_min_piat_ms', 0)
        
        # Flags
        result['Fwd PSH Flags'] = df.get('src2dst_psh_packets', 0)
        result['Bwd PSH Flags'] = df.get('dst2src_psh_packets', 0)
        result['Fwd URG Flags'] = df.get('src2dst_urg_packets', 0)
        result['Bwd URG Flags'] = df.get('dst2src_urg_packets', 0)
        
        # Header lengths (estimate)
        result['Fwd Header Length'] = df.get('src2dst_packets', 0) * 20
        result['Bwd Header Length'] = df.get('dst2src_packets', 0) * 20
        
        # Packets per second
        result['Fwd Packets/s'] = df.get('src2dst_packets', 0) / duration_s
        result['Bwd Packets/s'] = df.get('dst2src_packets', 0) / duration_s
        
        # Overall packet stats
        result['Min Packet Length'] = df.get('bidirectional_min_ps', 0)
        result['Max Packet Length'] = df.get('bidirectional_max_ps', 0)
        result['Packet Length Mean'] = df.get('bidirectional_mean_ps', 0)
        result['Packet Length Std'] = df.get('bidirectional_stddev_ps', 0)
        result['Packet Length Variance'] = result['Packet Length Std'] ** 2
        
        # TCP flags
        result['FIN Flag Count'] = df.get('src2dst_fin_packets', 0) + df.get('dst2src_fin_packets', 0)
        result['SYN Flag Count'] = df.get('src2dst_syn_packets', 0) + df.get('dst2src_syn_packets', 0)
        result['RST Flag Count'] = df.get('src2dst_rst_packets', 0) + df.get('dst2src_rst_packets', 0)
        result['PSH Flag Count'] = df.get('src2dst_psh_packets', 0) + df.get('dst2src_psh_packets', 0)
        result['ACK Flag Count'] = df.get('src2dst_ack_packets', 0) + df.get('dst2src_ack_packets', 0)
        result['URG Flag Count'] = df.get('src2dst_urg_packets', 0) + df.get('dst2src_urg_packets', 0)
        result['CWE Flag Count'] = 0  # Not available in NFStream
        result['ECE Flag Count'] = 0  # Not available in NFStream
        
        # Ratios
        fwd_packets = df.get('src2dst_packets', 0).replace(0, 1)
        result['Down/Up Ratio'] = df.get('dst2src_packets', 0) / fwd_packets
        
        # Averages
        result['Average Packet Size'] = total_bytes / total_packets.replace(0, 1)
        result['Avg Fwd Segment Size'] = result['Fwd Packet Length Mean']
        result['Avg Bwd Segment Size'] = result['Bwd Packet Length Mean']
        
        # Duplicate header length
        result['Fwd Header Length.1'] = result['Fwd Header Length']
        
        # Bulk features (not available in NFStream, set to 0)
        result['Fwd Avg Bytes/Bulk'] = 0
        result['Fwd Avg Packets/Bulk'] = 0
        result['Fwd Avg Bulk Rate'] = 0
        result['Bwd Avg Bytes/Bulk'] = 0
        result['Bwd Avg Packets/Bulk'] = 0
        result['Bwd Avg Bulk Rate'] = 0
        
        # Subflow features
        result['Subflow Fwd Packets'] = df.get('src2dst_packets', 0)
        result['Subflow Fwd Bytes'] = df.get('src2dst_bytes', 0)
        result['Subflow Bwd Packets'] = df.get('dst2src_packets', 0)
        result['Subflow Bwd Bytes'] = df.get('dst2src_bytes', 0)
        
        # Window sizes (not available, estimate with 0)
        result['Init_Win_bytes_forward'] = 0
        result['Init_Win_bytes_backward'] = 0
        
        # Other features
        result['act_data_pkt_fwd'] = df.get('src2dst_packets', 0)
        result['min_seg_size_forward'] = result['Fwd Packet Length Min']
        
        # Active/Idle times (not directly available)
        result['Active Mean'] = 0
        result['Active Std'] = 0
        result['Active Max'] = 0
        result['Active Min'] = 0
        result['Idle Mean'] = 0
        result['Idle Std'] = 0
        result['Idle Max'] = 0
        result['Idle Min'] = 0
        
        # Clean up
        result = result.replace([np.inf, -np.inf], 0)
        result = result.fillna(0)
        
        return result
    
    def extract_nfstream_features(self, pcap_path: Union[str, Path],
                                  max_flows: Optional[int] = None) -> pd.DataFrame:
        """
        Extract raw NFStream features (legacy method for backward compatibility).
        
        Args:
            pcap_path: Path to PCAP file
            max_flows: Maximum number of flows to extract
        
        Returns:
            DataFrame with raw NFStream features.
        """
        if not self.nfstream_available:
            raise RuntimeError("NFStream not installed. Run: pip install nfstream")
        
        from nfstream import NFStreamer
        
        pcap_path = Path(pcap_path)
        if not pcap_path.exists():
            raise FileNotFoundError(f"PCAP file not found: {pcap_path}")
        
        streamer = NFStreamer(
            source=str(pcap_path),
            statistical_analysis=True,
            splt_analysis=0,
            n_dissections=0,
        )
        
        flows_list = []
        flow_count = 0
        
        for flow in streamer:
            flow_dict = {}
            for attr in NFSTREAM_ATTRIBUTES:
                try:
                    value = getattr(flow, attr, 0)
                    flow_dict[attr] = 0 if value is None else value
                except:
                    flow_dict[attr] = 0
            
            flows_list.append(flow_dict)
            flow_count += 1
            
            if max_flows and flow_count >= max_flows:
                break
        
        if not flows_list:
            return pd.DataFrame(columns=NFSTREAM_ATTRIBUTES)
        
        df = pd.DataFrame(flows_list)
        df = df.replace([np.inf, -np.inf], np.nan).fillna(0)
        
        return df
    
    def extract_cicids_full_features(self, pcap_path: Union[str, Path],
                                      max_flows: Optional[int] = None,
                                      include_metadata: bool = True) -> pd.DataFrame:
        """
        Extract complete CICIDS2017-compatible features using CICFlowMeterPlugin.
        
        This method provides the MOST ACCURATE feature extraction, matching
        all 78 features in the CICIDS2017 dataset as closely as possible.
        
        Args:
            pcap_path: Path to PCAP file
            max_flows: Maximum number of flows to extract
            include_metadata: Include flow metadata (IPs, ports) for display
        
        Returns:
            DataFrame with all 78 CICIDS2017 features ready for prediction.
        """
        if not self.nfstream_available:
            raise RuntimeError("NFStream not installed. Run: pip install nfstream")
        
        if self.cicflowmeter_plugin is None:
            raise RuntimeError("CICFlowMeterPlugin not loaded. Check cicflowmeter_nfstream_plugin.py")
        
        from nfstream import NFStreamer
        
        pcap_path = Path(pcap_path)
        if not pcap_path.exists():
            raise FileNotFoundError(f"PCAP file not found: {pcap_path}")
        
        file_size_mb = pcap_path.stat().st_size / 1024**2
        
        if file_size_mb > 100:
            print(f"Processing large PCAP with CICFlowMeterPlugin: {pcap_path.name} ({file_size_mb:.2f} MB)")
        else:
            print(f"Processing PCAP with CICFlowMeterPlugin: {pcap_path.name} ({file_size_mb:.2f} MB)")
        
        # Create NFStreamer with CICFlowMeterPlugin
        streamer = NFStreamer(
            source=str(pcap_path),
            statistical_analysis=True,
            splt_analysis=0,
            n_dissections=0,
            udps=self.cicflowmeter_plugin()  # Use our custom plugin
        )
        
        features_list = []
        metadata_list = []
        flow_count = 0
        
        for flow in streamer:
            # Extract all 78 CICIDS features using plugin
            features = self.extract_cicids_features_func(flow)
            features_list.append(features)
            
            # Extract metadata for display
            if include_metadata:
                meta = {
                    'src_ip': getattr(flow, 'src_ip', ''),
                    'dst_ip': getattr(flow, 'dst_ip', ''),
                    'src_port': getattr(flow, 'src_port', 0),
                    'dst_port': getattr(flow, 'dst_port', 0),
                    'protocol': getattr(flow, 'protocol', 0),
                }
                metadata_list.append(meta)
            
            flow_count += 1
            
            if flow_count % 25000 == 0:
                print(f"  Processed {flow_count:,} flows...")
            
            if max_flows and flow_count >= max_flows:
                print(f"  Reached max_flows limit: {max_flows:,}")
                break
        
        if flow_count > 0:
            print(f"  SUCCESS: Extracted {flow_count:,} flows with 78 CICIDS features")
        
        if not features_list:
            print("WARNING: No flows found in PCAP file")
            return pd.DataFrame(columns=CICIDS2017_FEATURES)
        
        # Convert to DataFrame
        df = pd.DataFrame(features_list)
        
        # Add metadata columns if requested
        if include_metadata and metadata_list:
            df_meta = pd.DataFrame(metadata_list)
            df = pd.concat([df_meta, df], axis=1)
        
        # Clean up
        df = df.replace([np.inf, -np.inf], np.nan).fillna(0)
        
        return df


def get_required_features() -> List[str]:
    """Get list of CICIDS2017 feature names."""
    return CICIDS2017_FEATURES.copy()



if __name__ == "__main__":
    print("CICIDS2017 Features:")
    print(f"Total: {len(CICIDS2017_FEATURES)} features")
    for i, f in enumerate(CICIDS2017_FEATURES[:10]):
        print(f"  {i+1}. {f}")
    print("  ...")
