"""
Network Flow Extractor
Converts captured packets into network flows for ML analysis
"""

import logging
from typing import Dict, List, Any, Tuple
from datetime import datetime, timedelta
from collections import defaultdict
import hashlib

logger = logging.getLogger(__name__)

class NetworkFlow:
    """
    Represents a network flow (5-tuple: src_ip, dst_ip, src_port, dst_port, protocol)
    """
    
    def __init__(self, src_ip: str, dst_ip: str, src_port: int, dst_port: int, protocol: str):
        self.src_ip = src_ip
        self.dst_ip = dst_ip
        self.src_port = src_port
        self.dst_port = dst_port
        self.protocol = protocol
        
        # Flow statistics
        self.packet_count = 0
        self.byte_count = 0
        self.start_time = None
        self.end_time = None
        self.duration = 0
        
        # TCP-specific features
        self.tcp_flags = set()
        self.syn_count = 0
        self.ack_count = 0
        self.fin_count = 0
        self.rst_count = 0
        
        # Timing features
        self.packet_times = []
        self.inter_arrival_times = []
        
        # Flow direction
        self.forward_packets = 0
        self.backward_packets = 0
        self.forward_bytes = 0
        self.backward_bytes = 0
        
        # Generate flow ID
        self.flow_id = self._generate_flow_id()
    
    def _generate_flow_id(self) -> str:
        """Generate unique flow ID based on 5-tuple"""
        flow_string = f"{self.src_ip}:{self.src_port}-{self.dst_ip}:{self.dst_port}-{self.protocol}"
        return hashlib.md5(flow_string.encode()).hexdigest()[:16]
    
    def add_packet(self, packet_info: Dict[str, Any]):
        """
        Add packet to flow and update statistics
        
        Args:
            packet_info: Packet information dictionary
        """
        current_time = datetime.fromisoformat(packet_info['timestamp'])
        
        # Initialize start time
        if self.start_time is None:
            self.start_time = current_time
        
        # Update end time
        self.end_time = current_time
        self.duration = (self.end_time - self.start_time).total_seconds()
        
        # Update packet and byte counts
        self.packet_count += 1
        self.byte_count += packet_info.get('size', 0)
        
        # Store packet time for timing analysis
        self.packet_times.append(current_time)
        
        # Calculate inter-arrival time
        if len(self.packet_times) > 1:
            inter_arrival = (current_time - self.packet_times[-2]).total_seconds()
            self.inter_arrival_times.append(inter_arrival)
        
        # Update TCP flags
        if packet_info.get('protocol') == 'TCP':
            flags = packet_info.get('flags', 0)
            self.tcp_flags.add(flags)
            
            # Count specific flags
            if flags & 0x02:  # SYN
                self.syn_count += 1
            if flags & 0x10:  # ACK
                self.ack_count += 1
            if flags & 0x01:  # FIN
                self.fin_count += 1
            if flags & 0x04:  # RST
                self.rst_count += 1
        
        # Determine packet direction (simplified)
        # In a real implementation, you'd track connection state
        if self.packet_count % 2 == 1:
            self.forward_packets += 1
            self.forward_bytes += packet_info.get('size', 0)
        else:
            self.backward_packets += 1
            self.backward_bytes += packet_info.get('size', 0)
    
    def get_features(self) -> Dict[str, Any]:
        """
        Extract features for ML model
        
        Returns:
            Dictionary of flow features
        """
        features = {
            # Basic flow information
            'flow_id': self.flow_id,
            'src_ip': self.src_ip,
            'dst_ip': self.dst_ip,
            'src_port': self.src_port,
            'dst_port': self.dst_port,
            'protocol': self.protocol,
            
            # Flow statistics
            'packet_count': self.packet_count,
            'byte_count': self.byte_count,
            'duration': self.duration,
            
            # Rate features
            'packets_per_second': self.packet_count / max(self.duration, 0.001),
            'bytes_per_second': self.byte_count / max(self.duration, 0.001),
            'avg_packet_size': self.byte_count / max(self.packet_count, 1),
            
            # TCP features
            'tcp_flag_count': len(self.tcp_flags),
            'syn_count': self.syn_count,
            'ack_count': self.ack_count,
            'fin_count': self.fin_count,
            'rst_count': self.rst_count,
            
            # Direction features
            'forward_packets': self.forward_packets,
            'backward_packets': self.backward_packets,
            'forward_bytes': self.forward_bytes,
            'backward_bytes': self.backward_bytes,
            
            # Timing features
            'avg_inter_arrival_time': sum(self.inter_arrival_times) / max(len(self.inter_arrival_times), 1),
            'min_inter_arrival_time': min(self.inter_arrival_times) if self.inter_arrival_times else 0,
            'max_inter_arrival_time': max(self.inter_arrival_times) if self.inter_arrival_times else 0,
        }
        
        # Add derived features
        features.update(self._calculate_derived_features())
        
        return features
    
    def _calculate_derived_features(self) -> Dict[str, Any]:
        """Calculate derived features"""
        derived = {}
        
        # Flow direction ratio
        total_packets = self.forward_packets + self.backward_packets
        if total_packets > 0:
            derived['forward_packet_ratio'] = self.forward_packets / total_packets
            derived['backward_packet_ratio'] = self.backward_packets / total_packets
        else:
            derived['forward_packet_ratio'] = 0
            derived['backward_packet_ratio'] = 0
        
        # Byte direction ratio
        total_bytes = self.forward_bytes + self.backward_bytes
        if total_bytes > 0:
            derived['forward_byte_ratio'] = self.forward_bytes / total_bytes
            derived['backward_byte_ratio'] = self.backward_bytes / total_bytes
        else:
            derived['forward_byte_ratio'] = 0
            derived['backward_byte_ratio'] = 0
        
        # TCP flag ratios
        if self.packet_count > 0:
            derived['syn_ratio'] = self.syn_count / self.packet_count
            derived['ack_ratio'] = self.ack_count / self.packet_count
            derived['fin_ratio'] = self.fin_count / self.packet_count
            derived['rst_ratio'] = self.rst_count / self.packet_count
        else:
            derived['syn_ratio'] = 0
            derived['ack_ratio'] = 0
            derived['fin_ratio'] = 0
            derived['rst_ratio'] = 0
        
        return derived
    
    def is_expired(self, timeout: int = 300) -> bool:
        """
        Check if flow has expired (no packets for timeout seconds)
        
        Args:
            timeout: Timeout in seconds
            
        Returns:
            True if flow is expired
        """
        if self.end_time is None:
            return False
        
        time_since_last_packet = (datetime.now() - self.end_time).total_seconds()
        return time_since_last_packet > timeout
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert flow to dictionary"""
        return {
            'flow_id': self.flow_id,
            'src_ip': self.src_ip,
            'dst_ip': self.dst_ip,
            'src_port': self.src_port,
            'dst_port': self.dst_port,
            'protocol': self.protocol,
            'packet_count': self.packet_count,
            'byte_count': self.byte_count,
            'duration': self.duration,
            'start_time': self.start_time.isoformat() if self.start_time else None,
            'end_time': self.end_time.isoformat() if self.end_time else None,
            'features': self.get_features()
        }

class FlowExtractor:
    """
    Extracts network flows from captured packets
    """
    
    def __init__(self, flow_timeout: int = 300):
        """
        Initialize flow extractor
        
        Args:
            flow_timeout: Flow timeout in seconds
        """
        self.flow_timeout = flow_timeout
        self.active_flows: Dict[str, NetworkFlow] = {}
        self.completed_flows: List[NetworkFlow] = []
        self.flow_count = 0
    
    def add_packet(self, packet_info: Dict[str, Any]) -> NetworkFlow:
        """
        Add packet to flow extractor
        
        Args:
            packet_info: Packet information dictionary
            
        Returns:
            NetworkFlow object that was updated
        """
        # Extract 5-tuple
        src_ip = packet_info.get('src_ip')
        dst_ip = packet_info.get('dst_ip')
        src_port = packet_info.get('src_port', 0)
        dst_port = packet_info.get('dst_port', 0)
        protocol = packet_info.get('protocol', 'unknown')
        
        # Skip if missing required information
        if not src_ip or not dst_ip:
            return None
        
        # Create flow key (bidirectional)
        flow_key = self._create_flow_key(src_ip, dst_ip, src_port, dst_port, protocol)
        
        # Get or create flow
        if flow_key in self.active_flows:
            flow = self.active_flows[flow_key]
        else:
            flow = NetworkFlow(src_ip, dst_ip, src_port, dst_port, protocol)
            self.active_flows[flow_key] = flow
            self.flow_count += 1
        
        # Add packet to flow
        flow.add_packet(packet_info)
        
        return flow
    
    def _create_flow_key(self, src_ip: str, dst_ip: str, src_port: int, dst_port: int, protocol: str) -> str:
        """
        Create bidirectional flow key
        
        Args:
            src_ip, dst_ip, src_port, dst_port, protocol: Flow parameters
            
        Returns:
            Flow key string
        """
        # Sort IPs and ports to create bidirectional key
        if src_ip < dst_ip or (src_ip == dst_ip and src_port < dst_port):
            return f"{src_ip}:{src_port}-{dst_ip}:{dst_port}-{protocol}"
        else:
            return f"{dst_ip}:{dst_port}-{src_ip}:{src_port}-{protocol}"
    
    def cleanup_expired_flows(self) -> List[NetworkFlow]:
        """
        Remove expired flows and return them
        
        Returns:
            List of expired flows
        """
        expired_flows = []
        active_keys = list(self.active_flows.keys())
        
        for flow_key in active_keys:
            flow = self.active_flows[flow_key]
            if flow.is_expired(self.flow_timeout):
                expired_flows.append(flow)
                self.completed_flows.append(flow)
                del self.active_flows[flow_key]
        
        return expired_flows
    
    def get_active_flows(self) -> List[NetworkFlow]:
        """Get list of active flows"""
        return list(self.active_flows.values())
    
    def get_completed_flows(self, limit: int = 100) -> List[NetworkFlow]:
        """
        Get list of completed flows
        
        Args:
            limit: Maximum number of flows to return
            
        Returns:
            List of completed flows
        """
        return self.completed_flows[-limit:] if self.completed_flows else []
    
    def get_flow_features(self, limit: int = 100) -> List[Dict[str, Any]]:
        """
        Get flow features for ML model
        
        Args:
            limit: Maximum number of flows to return
            
        Returns:
            List of flow feature dictionaries
        """
        # Get recent completed flows
        recent_flows = self.get_completed_flows(limit)
        
        # Extract features
        features = []
        for flow in recent_flows:
            features.append(flow.get_features())
        
        return features
    
    def get_stats(self) -> Dict[str, Any]:
        """Get extractor statistics"""
        return {
            'active_flows': len(self.active_flows),
            'completed_flows': len(self.completed_flows),
            'total_flows': self.flow_count,
            'flow_timeout': self.flow_timeout
        }
    
    def clear_flows(self):
        """Clear all flows"""
        self.active_flows.clear()
        self.completed_flows.clear()
        self.flow_count = 0
        logger.info("Cleared all flows")

# Example usage
if __name__ == "__main__":
    # Configure logging
    logging.basicConfig(level=logging.INFO)
    
    # Create flow extractor
    extractor = FlowExtractor(flow_timeout=60)
    
    # Simulate some packets
    test_packets = [
        {
            'timestamp': datetime.now().isoformat(),
            'src_ip': '192.168.1.100',
            'dst_ip': '192.168.1.1',
            'src_port': 12345,
            'dst_port': 80,
            'protocol': 'TCP',
            'size': 64,
            'flags': 0x02  # SYN
        },
        {
            'timestamp': datetime.now().isoformat(),
            'src_ip': '192.168.1.1',
            'dst_ip': '192.168.1.100',
            'src_port': 80,
            'dst_port': 12345,
            'protocol': 'TCP',
            'size': 60,
            'flags': 0x12  # SYN+ACK
        }
    ]
    
    # Process packets
    for packet in test_packets:
        flow = extractor.add_packet(packet)
        if flow:
            print(f"Updated flow: {flow.flow_id}")
    
    # Get flow features
    features = extractor.get_flow_features()
    print(f"Extracted {len(features)} flow features")
    
    # Print stats
    stats = extractor.get_stats()
    print(f"Extractor stats: {stats}")
