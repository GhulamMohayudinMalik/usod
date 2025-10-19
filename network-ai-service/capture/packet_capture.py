"""
Packet Capture Module
Handles network packet capture using Scapy
"""

import logging
import threading
import time
from typing import List, Dict, Any, Optional, Callable
from datetime import datetime
import platform

# Import Scapy for packet capture
try:
    from scapy.all import sniff, Ether, IP, TCP, UDP, ICMP
    from scapy.interfaces import get_if_list
    SCAPY_AVAILABLE = True
except ImportError:
    SCAPY_AVAILABLE = False
    logging.warning("Scapy not available. Install with: pip install scapy")

logger = logging.getLogger(__name__)

class PacketCapture:
    """
    Network packet capture class using Scapy
    """
    
    def __init__(self, interface: str = None, callback: Callable = None):
        """
        Initialize packet capture
        
        Args:
            interface: Network interface to capture on (None for auto-detect)
            callback: Function to call when packets are captured
        """
        self.interface = interface
        self.callback = callback
        self.capturing = False
        self.capture_thread = None
        self.packets = []
        self.stats = {
            'total_packets': 0,
            'tcp_packets': 0,
            'udp_packets': 0,
            'icmp_packets': 0,
            'other_packets': 0,
            'start_time': None,
            'end_time': None
        }
        
        # Check if Scapy is available
        if not SCAPY_AVAILABLE:
            raise ImportError("Scapy is required for packet capture. Install with: pip install scapy")
    
    def get_available_interfaces(self) -> List[str]:
        """
        Get list of available network interfaces
        
        Returns:
            List of interface names
        """
        try:
            interfaces = get_if_list()
            logger.info(f"Available interfaces: {interfaces}")
            return interfaces
        except Exception as e:
            logger.error(f"Failed to get interfaces: {e}")
            return []
    
    def auto_detect_interface(self) -> Optional[str]:
        """
        Auto-detect the best network interface for capture
        
        Returns:
            Interface name or None if not found
        """
        interfaces = self.get_available_interfaces()
        
        # First, try to find loopback interface (most reliable for testing)
        loopback_interfaces = [iface for iface in interfaces if 'loopback' in iface.lower() or 'lo' in iface.lower()]
        if loopback_interfaces:
            logger.info(f"Auto-detected loopback interface: {loopback_interfaces[0]}")
            return loopback_interfaces[0]
        
        # Prefer interfaces that are likely to have traffic
        preferred = ['eth0', 'en0', 'wlan0', 'Wi-Fi', 'Ethernet']
        
        for pref in preferred:
            if pref in interfaces:
                logger.info(f"Auto-detected interface: {pref}")
                return pref
        
        # Return first available interface
        if interfaces:
            logger.info(f"Using first available interface: {interfaces[0]}")
            return interfaces[0]
        
        logger.warning("No network interfaces found")
        return None
    
    def packet_handler(self, packet):
        """
        Handle captured packets
        
        Args:
            packet: Scapy packet object
        """
        try:
            # Update statistics
            self.stats['total_packets'] += 1
            
            # Count packet types
            if packet.haslayer(TCP):
                self.stats['tcp_packets'] += 1
            elif packet.haslayer(UDP):
                self.stats['udp_packets'] += 1
            elif packet.haslayer(ICMP):
                self.stats['icmp_packets'] += 1
            else:
                self.stats['other_packets'] += 1
            
            # Store packet info
            packet_info = self._extract_packet_info(packet)
            self.packets.append(packet_info)
            
            # Call callback if provided
            if self.callback:
                self.callback(packet_info)
            
            # Log every 100th packet
            if self.stats['total_packets'] % 100 == 0:
                logger.info(f"Captured {self.stats['total_packets']} packets")
                
        except Exception as e:
            logger.error(f"Error processing packet: {e}")
    
    def _extract_packet_info(self, packet) -> Dict[str, Any]:
        """
        Extract relevant information from packet
        
        Args:
            packet: Scapy packet object
            
        Returns:
            Dictionary with packet information
        """
        packet_info = {
            'timestamp': datetime.now().isoformat(),
            'size': len(packet),
            'protocol': 'unknown'
        }
        
        # Extract IP information
        if packet.haslayer(IP):
            ip_layer = packet[IP]
            packet_info.update({
                'src_ip': ip_layer.src,
                'dst_ip': ip_layer.dst,
                'protocol': 'IP',
                'ttl': ip_layer.ttl,
                'tos': ip_layer.tos
            })
        
        # Extract TCP information
        if packet.haslayer(TCP):
            tcp_layer = packet[TCP]
            packet_info.update({
                'protocol': 'TCP',
                'src_port': tcp_layer.sport,
                'dst_port': tcp_layer.dport,
                'flags': tcp_layer.flags,
                'seq': tcp_layer.seq,
                'ack': tcp_layer.ack,
                'window': tcp_layer.window
            })
        
        # Extract UDP information
        elif packet.haslayer(UDP):
            udp_layer = packet[UDP]
            packet_info.update({
                'protocol': 'UDP',
                'src_port': udp_layer.sport,
                'dst_port': udp_layer.dport,
                'length': udp_layer.len
            })
        
        # Extract ICMP information
        elif packet.haslayer(ICMP):
            icmp_layer = packet[ICMP]
            packet_info.update({
                'protocol': 'ICMP',
                'type': icmp_layer.type,
                'code': icmp_layer.code
            })
        
        return packet_info
    
    def start_capture(self, duration: int = 60, filter_str: str = None):
        """
        Start packet capture
        
        Args:
            duration: Capture duration in seconds (0 for continuous)
            filter_str: BPF filter string (e.g., "tcp port 80")
        """
        if self.capturing:
            logger.warning("Capture is already running")
            return
        
        # Auto-detect interface if not specified
        if not self.interface:
            self.interface = self.auto_detect_interface()
            if not self.interface:
                raise ValueError("No suitable network interface found")
        
        self.capturing = True
        self.stats['start_time'] = datetime.now()
        
        logger.info(f"Starting packet capture on {self.interface} for {duration} seconds")
        logger.info(f"Filter: {filter_str or 'None'}")
        
        try:
            # Run capture synchronously for testing
            self._capture_worker(duration, filter_str)
            
        except Exception as e:
            self.capturing = False
            logger.error(f"Failed to start capture: {e}")
            raise
    
    def _capture_worker(self, duration: int, filter_str: str):
        """
        Worker thread for packet capture
        
        Args:
            duration: Capture duration in seconds
            filter_str: BPF filter string
        """
        try:
            # Use Scapy's sniff function
            sniff(
                iface=self.interface,
                prn=self.packet_handler,
                timeout=duration if duration > 0 else None,
                filter=filter_str,
                store=False  # Don't store packets in memory
            )
            
        except Exception as e:
            logger.error(f"Error during packet capture: {e}")
        finally:
            self.capturing = False
            self.stats['end_time'] = datetime.now()
            logger.info("Packet capture stopped")
    
    def stop_capture(self):
        """Stop packet capture"""
        if not self.capturing:
            logger.warning("Capture is not running")
            return
        
        self.capturing = False
        
        if self.capture_thread and self.capture_thread.is_alive():
            self.capture_thread.join(timeout=5)
        
        logger.info("Packet capture stopped")
    
    def get_stats(self) -> Dict[str, Any]:
        """
        Get capture statistics
        
        Returns:
            Dictionary with capture statistics
        """
        stats = self.stats.copy()
        
        if stats['start_time'] and stats['end_time']:
            duration = (stats['end_time'] - stats['start_time']).total_seconds()
            stats['duration_seconds'] = duration
            stats['packets_per_second'] = stats['total_packets'] / duration if duration > 0 else 0
        
        return stats
    
    def get_packets(self, limit: int = 100) -> List[Dict[str, Any]]:
        """
        Get captured packets
        
        Args:
            limit: Maximum number of packets to return
            
        Returns:
            List of packet information dictionaries
        """
        return self.packets[-limit:] if self.packets else []
    
    def clear_packets(self):
        """Clear stored packets"""
        self.packets.clear()
        logger.info("Cleared stored packets")

# Example usage and testing
if __name__ == "__main__":
    # Configure logging
    logging.basicConfig(level=logging.INFO)
    
    # Test packet capture
    def packet_callback(packet_info):
        print(f"Packet: {packet_info['protocol']} {packet_info.get('src_ip', 'N/A')} -> {packet_info.get('dst_ip', 'N/A')}")
    
    try:
        # Create packet capture instance
        capture = PacketCapture(callback=packet_callback)
        
        # List available interfaces
        interfaces = capture.get_available_interfaces()
        print(f"Available interfaces: {interfaces}")
        
        # Start capture for 10 seconds
        capture.start_capture(duration=10, filter_str="tcp")
        
        # Wait for capture to complete
        time.sleep(12)
        
        # Get statistics
        stats = capture.get_stats()
        print(f"Capture statistics: {stats}")
        
        # Get captured packets
        packets = capture.get_packets(limit=5)
        print(f"Captured {len(packets)} packets")
        
    except Exception as e:
        print(f"Error: {e}")
        print("Make sure you have:")
        print("1. Installed Scapy: pip install scapy")
        print("2. Installed Npcap (Windows): https://npcap.com/")
        print("3. Running with administrator privileges")
