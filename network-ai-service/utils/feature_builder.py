"""
Feature Builder
Builds comprehensive feature sets for network flow analysis
"""

import pandas as pd
import numpy as np
from typing import List, Dict, Any, Optional, Tuple
import logging
from datetime import datetime, timedelta
from collections import defaultdict
import ipaddress

logger = logging.getLogger(__name__)

class NetworkFeatureBuilder:
    """
    Builds comprehensive feature sets for network flow analysis
    """
    
    def __init__(self):
        """Initialize feature builder"""
        self.feature_stats = {}
        self.ip_ranges = {}
        self.port_categories = self._initialize_port_categories()
    
    def _initialize_port_categories(self) -> Dict[str, List[int]]:
        """Initialize port categories for feature engineering"""
        return {
            'well_known': list(range(0, 1024)),
            'registered': list(range(1024, 49152)),
            'dynamic': list(range(49152, 65536)),
            'http_ports': [80, 8080, 8000, 8008, 8888],
            'https_ports': [443, 8443],
            'ssh_ports': [22],
            'ftp_ports': [21, 20],
            'smtp_ports': [25, 587, 465],
            'dns_ports': [53],
            'dhcp_ports': [67, 68],
            'snmp_ports': [161, 162],
            'telnet_ports': [23],
            'rdp_ports': [3389],
            'vnc_ports': [5900, 5901, 5902],
            'database_ports': [3306, 5432, 1433, 1521, 27017],
            'mail_ports': [110, 143, 993, 995],
            'file_sharing_ports': [139, 445, 2049],
            'gaming_ports': [27015, 27016, 25565],
            'p2p_ports': [6881, 6882, 6883, 6884, 6885, 6886, 6887, 6888, 6889, 6890]
        }
    
    def build_basic_features(self, flow: Dict[str, Any]) -> Dict[str, Any]:
        """
        Build basic flow features
        
        Args:
            flow: Network flow dictionary
            
        Returns:
            Dictionary of basic features
        """
        features = {}
        
        # Basic flow information
        features['duration'] = flow.get('duration', 0)
        features['packet_count'] = flow.get('packet_count', 0)
        features['byte_count'] = flow.get('byte_count', 0)
        
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
        
        # Protocol information
        features['protocol'] = flow.get('protocol', 'unknown')
        features['is_tcp'] = 1 if features['protocol'] == 'TCP' else 0
        features['is_udp'] = 1 if features['protocol'] == 'UDP' else 0
        features['is_icmp'] = 1 if features['protocol'] == 'ICMP' else 0
        
        return features
    
    def build_tcp_features(self, flow: Dict[str, Any]) -> Dict[str, Any]:
        """
        Build TCP-specific features
        
        Args:
            flow: Network flow dictionary
            
        Returns:
            Dictionary of TCP features
        """
        features = {}
        
        if flow.get('protocol') != 'TCP':
            # Return zero values for non-TCP flows
            features.update({
                'syn_count': 0, 'ack_count': 0, 'fin_count': 0, 'rst_count': 0,
                'psh_count': 0, 'urg_count': 0, 'syn_ratio': 0, 'ack_ratio': 0,
                'fin_ratio': 0, 'rst_ratio': 0, 'psh_ratio': 0, 'urg_ratio': 0,
                'tcp_flag_count': 0, 'is_syn_flood': 0, 'is_fin_scan': 0,
                'is_null_scan': 0, 'is_xmas_scan': 0
            })
            return features
        
        # TCP flag counts
        features['syn_count'] = flow.get('syn_count', 0)
        features['ack_count'] = flow.get('ack_count', 0)
        features['fin_count'] = flow.get('fin_count', 0)
        features['rst_count'] = flow.get('rst_count', 0)
        features['psh_count'] = flow.get('psh_count', 0)
        features['urg_count'] = flow.get('urg_count', 0)
        
        # TCP flag ratios
        packet_count = flow.get('packet_count', 1)
        features['syn_ratio'] = features['syn_count'] / packet_count
        features['ack_ratio'] = features['ack_count'] / packet_count
        features['fin_ratio'] = features['fin_count'] / packet_count
        features['rst_ratio'] = features['rst_count'] / packet_count
        features['psh_ratio'] = features['psh_count'] / packet_count
        features['urg_ratio'] = features['urg_count'] / packet_count
        
        # TCP flag diversity
        features['tcp_flag_count'] = flow.get('tcp_flag_count', 0)
        
        # Attack pattern detection
        features['is_syn_flood'] = 1 if features['syn_ratio'] > 0.8 and features['ack_ratio'] < 0.2 else 0
        features['is_fin_scan'] = 1 if features['fin_ratio'] > 0.5 else 0
        features['is_null_scan'] = 1 if features['tcp_flag_count'] == 0 and packet_count > 10 else 0
        features['is_xmas_scan'] = 1 if features['fin_ratio'] > 0.3 and features['urg_ratio'] > 0.3 else 0
        
        return features
    
    def build_direction_features(self, flow: Dict[str, Any]) -> Dict[str, Any]:
        """
        Build direction-based features
        
        Args:
            flow: Network flow dictionary
            
        Returns:
            Dictionary of direction features
        """
        features = {}
        
        # Direction counts
        features['forward_packets'] = flow.get('forward_packets', 0)
        features['backward_packets'] = flow.get('backward_packets', 0)
        features['forward_bytes'] = flow.get('forward_bytes', 0)
        features['backward_bytes'] = flow.get('backward_bytes', 0)
        
        # Direction ratios
        total_packets = features['forward_packets'] + features['backward_packets']
        total_bytes = features['forward_bytes'] + features['backward_bytes']
        
        if total_packets > 0:
            features['forward_packet_ratio'] = features['forward_packets'] / total_packets
            features['backward_packet_ratio'] = features['backward_packets'] / total_packets
        else:
            features['forward_packet_ratio'] = 0
            features['backward_packet_ratio'] = 0
        
        if total_bytes > 0:
            features['forward_byte_ratio'] = features['forward_bytes'] / total_bytes
            features['backward_byte_ratio'] = features['backward_bytes'] / total_bytes
        else:
            features['forward_byte_ratio'] = 0
            features['backward_byte_ratio'] = 0
        
        # Direction asymmetry
        features['packet_asymmetry'] = abs(features['forward_packet_ratio'] - features['backward_packet_ratio'])
        features['byte_asymmetry'] = abs(features['forward_byte_ratio'] - features['backward_byte_ratio'])
        
        return features
    
    def build_timing_features(self, flow: Dict[str, Any]) -> Dict[str, Any]:
        """
        Build timing-based features
        
        Args:
            flow: Network flow dictionary
            
        Returns:
            Dictionary of timing features
        """
        features = {}
        
        # Basic timing
        features['duration'] = flow.get('duration', 0)
        features['avg_inter_arrival_time'] = flow.get('avg_inter_arrival_time', 0)
        features['min_inter_arrival_time'] = flow.get('min_inter_arrival_time', 0)
        features['max_inter_arrival_time'] = flow.get('max_inter_arrival_time', 0)
        
        # Timing statistics
        if features['min_inter_arrival_time'] > 0 and features['max_inter_arrival_time'] > 0:
            features['inter_arrival_variance'] = features['max_inter_arrival_time'] - features['min_inter_arrival_time']
        else:
            features['inter_arrival_variance'] = 0
        
        # Burst detection
        features['is_burst'] = 1 if features['packets_per_second'] > 100 else 0
        features['is_slow'] = 1 if features['packets_per_second'] < 0.1 and features['duration'] > 10 else 0
        
        return features
    
    def build_port_features(self, flow: Dict[str, Any]) -> Dict[str, Any]:
        """
        Build port-based features
        
        Args:
            flow: Network flow dictionary
            
        Returns:
            Dictionary of port features
        """
        features = {}
        
        src_port = flow.get('src_port', 0)
        dst_port = flow.get('dst_port', 0)
        
        # Port categories
        features['src_port_category'] = self._get_port_category(src_port)
        features['dst_port_category'] = self._get_port_category(dst_port)
        
        # Well-known port usage
        features['uses_well_known_src'] = 1 if src_port in self.port_categories['well_known'] else 0
        features['uses_well_known_dst'] = 1 if dst_port in self.port_categories['well_known'] else 0
        
        # Specific service detection
        features['is_http'] = 1 if dst_port in self.port_categories['http_ports'] else 0
        features['is_https'] = 1 if dst_port in self.port_categories['https_ports'] else 0
        features['is_ssh'] = 1 if dst_port in self.port_categories['ssh_ports'] else 0
        features['is_ftp'] = 1 if dst_port in self.port_categories['ftp_ports'] else 0
        features['is_smtp'] = 1 if dst_port in self.port_categories['smtp_ports'] else 0
        features['is_dns'] = 1 if dst_port in self.port_categories['dns_ports'] else 0
        features['is_database'] = 1 if dst_port in self.port_categories['database_ports'] else 0
        features['is_p2p'] = 1 if dst_port in self.port_categories['p2p_ports'] else 0
        
        # Port scanning indicators
        features['is_port_scan'] = 1 if (src_port in self.port_categories['well_known'] and 
                                        dst_port not in self.port_categories['well_known']) else 0
        
        # High port usage
        features['uses_high_ports'] = 1 if (src_port > 1024 or dst_port > 1024) else 0
        
        return features
    
    def build_ip_features(self, flow: Dict[str, Any]) -> Dict[str, Any]:
        """
        Build IP address-based features
        
        Args:
            flow: Network flow dictionary
            
        Returns:
            Dictionary of IP features
        """
        features = {}
        
        src_ip = flow.get('src_ip', '0.0.0.0')
        dst_ip = flow.get('dst_ip', '0.0.0.0')
        
        try:
            # IP address types
            src_ip_obj = ipaddress.ip_address(src_ip)
            dst_ip_obj = ipaddress.ip_address(dst_ip)
            
            features['src_is_private'] = 1 if src_ip_obj.is_private else 0
            features['dst_is_private'] = 1 if dst_ip_obj.is_private else 0
            features['src_is_multicast'] = 1 if src_ip_obj.is_multicast else 0
            features['dst_is_multicast'] = 1 if dst_ip_obj.is_multicast else 0
            features['src_is_loopback'] = 1 if src_ip_obj.is_loopback else 0
            features['dst_is_loopback'] = 1 if dst_ip_obj.is_loopback else 0
            
            # IP version
            features['src_ipv4'] = 1 if src_ip_obj.version == 4 else 0
            features['dst_ipv4'] = 1 if dst_ip_obj.version == 4 else 0
            
        except ValueError:
            # Handle invalid IP addresses
            features.update({
                'src_is_private': 0, 'dst_is_private': 0,
                'src_is_multicast': 0, 'dst_is_multicast': 0,
                'src_is_loopback': 0, 'dst_is_loopback': 0,
                'src_ipv4': 1, 'dst_ipv4': 1
            })
        
        # Same subnet detection (simplified)
        try:
            src_network = ipaddress.ip_network(f"{src_ip}/24", strict=False)
            dst_network = ipaddress.ip_network(f"{dst_ip}/24", strict=False)
            features['same_subnet'] = 1 if src_network == dst_network else 0
        except:
            features['same_subnet'] = 0
        
        return features
    
    def build_flow_features(self, flow: Dict[str, Any]) -> Dict[str, Any]:
        """
        Build flow-specific features
        
        Args:
            flow: Network flow dictionary
            
        Returns:
            Dictionary of flow features
        """
        features = {}
        
        # Flow size categories
        packet_count = flow.get('packet_count', 0)
        byte_count = flow.get('byte_count', 0)
        
        features['is_small_flow'] = 1 if packet_count < 5 else 0
        features['is_large_flow'] = 1 if packet_count > 1000 else 0
        features['is_high_volume'] = 1 if byte_count > 1000000 else 0  # 1MB
        
        # Flow duration categories
        duration = flow.get('duration', 0)
        features['is_short_flow'] = 1 if duration < 1 else 0
        features['is_long_flow'] = 1 if duration > 300 else 0  # 5 minutes
        
        # Flow completeness
        features['is_complete_flow'] = 1 if (flow.get('syn_count', 0) > 0 and 
                                           flow.get('fin_count', 0) > 0) else 0
        
        return features
    
    def build_all_features(self, flow: Dict[str, Any]) -> Dict[str, Any]:
        """
        Build comprehensive feature set for a network flow
        
        Args:
            flow: Network flow dictionary
            
        Returns:
            Dictionary containing all features
        """
        features = {}
        
        # Build all feature categories
        features.update(self.build_basic_features(flow))
        features.update(self.build_tcp_features(flow))
        features.update(self.build_direction_features(flow))
        features.update(self.build_timing_features(flow))
        features.update(self.build_port_features(flow))
        features.update(self.build_ip_features(flow))
        features.update(self.build_flow_features(flow))
        
        return features
    
    def _get_port_category(self, port: int) -> str:
        """Get port category for a given port number"""
        if port in self.port_categories['well_known']:
            return 'well_known'
        elif port in self.port_categories['registered']:
            return 'registered'
        elif port in self.port_categories['dynamic']:
            return 'dynamic'
        else:
            return 'unknown'
    
    def build_features_batch(self, flows: List[Dict[str, Any]]) -> pd.DataFrame:
        """
        Build features for a batch of flows
        
        Args:
            flows: List of network flow dictionaries
            
        Returns:
            DataFrame with all features
        """
        logger.info(f"Building features for {len(flows)} flows")
        
        feature_list = []
        
        for i, flow in enumerate(flows):
            try:
                features = self.build_all_features(flow)
                features['flow_id'] = flow.get('flow_id', f'flow_{i}')
                feature_list.append(features)
            except Exception as e:
                logger.warning(f"Error building features for flow {i}: {e}")
                continue
        
        df = pd.DataFrame(feature_list)
        logger.info(f"Built {len(df)} feature vectors with {len(df.columns)} features")
        
        return df
    
    def get_feature_names(self) -> List[str]:
        """Get list of all feature names"""
        # Create a dummy flow to get feature names
        dummy_flow = {
            'duration': 1, 'packet_count': 1, 'byte_count': 1,
            'protocol': 'TCP', 'src_ip': '192.168.1.1', 'dst_ip': '192.168.1.2',
            'src_port': 80, 'dst_port': 8080, 'syn_count': 1, 'ack_count': 1,
            'forward_packets': 1, 'backward_packets': 1, 'forward_bytes': 1, 'backward_bytes': 1
        }
        
        features = self.build_all_features(dummy_flow)
        return list(features.keys())

# Example usage
if __name__ == "__main__":
    # Configure logging
    logging.basicConfig(level=logging.INFO)
    
    # Create feature builder
    builder = NetworkFeatureBuilder()
    
    # Sample flow data
    sample_flow = {
        'flow_id': 'flow_001',
        'src_ip': '192.168.1.100',
        'dst_ip': '192.168.1.1',
        'src_port': 12345,
        'dst_port': 80,
        'protocol': 'TCP',
        'duration': 10.5,
        'packet_count': 100,
        'byte_count': 5000,
        'syn_count': 1,
        'ack_count': 50,
        'fin_count': 1,
        'forward_packets': 60,
        'backward_packets': 40,
        'forward_bytes': 3000,
        'backward_bytes': 2000
    }
    
    # Build features
    features = builder.build_all_features(sample_flow)
    
    print("Sample flow features:")
    for key, value in features.items():
        print(f"  {key}: {value}")
    
    print(f"\nTotal features: {len(features)}")
    print(f"Feature names: {builder.get_feature_names()}")
