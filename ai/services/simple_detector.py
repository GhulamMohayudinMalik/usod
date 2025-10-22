"""
Simple Real-time Network Threat Detection Service
Simplified version for testing without admin privileges
"""

import asyncio
import threading
import time
import logging
import requests
from datetime import datetime
from typing import Dict, List, Any, Optional
from pathlib import Path
import json
import joblib
import numpy as np
import pandas as pd
import warnings

# Suppress sklearn warnings
warnings.filterwarnings('ignore', category=UserWarning, module='sklearn')

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SimpleDetector:
    """
    Simple real-time network threat detection service
    Uses mock data for testing without admin privileges
    """
    
    def __init__(self, models_path: str = "data/processed"):
        """
        Initialize the simple detector
        
        Args:
            models_path: Path to trained models and scalers
        """
        self.models_path = Path(models_path)
        self.is_running = False
        self.detection_thread = None
        
        # Load trained models
        self.rf_model = None
        self.iso_model = None
        self.scaler = None
        self.metadata = None
        
        # Detection results
        self.detected_threats = []
        self.stats = {
            'packets_captured': 0,
            'flows_analyzed': 0,
            'threats_detected': 0,
            'start_time': None,
            'last_activity': None
        }
        
        # Load models
        self._load_models()
    
    def _load_models(self):
        """Load trained ML models and scalers"""
        try:
            logger.info("Loading trained models...")
            
            # Load models
            self.rf_model = joblib.load(self.models_path / "random_forest_model.pkl")
            self.iso_model = joblib.load(self.models_path / "isolation_forest_model.pkl")
            self.scaler = joblib.load(self.models_path / "scaler.pkl")
            
            # Load metadata
            with open(self.models_path / "metadata.json", 'r') as f:
                self.metadata = json.load(f)
            
            logger.info("✅ Models loaded successfully")
            logger.info(f"  - Random Forest: {type(self.rf_model).__name__}")
            logger.info(f"  - Isolation Forest: {type(self.iso_model).__name__}")
            logger.info(f"  - Scaler: {type(self.scaler).__name__}")
            
        except Exception as e:
            logger.error(f"❌ Failed to load models: {e}")
            raise
    
    def start_detection(self, interface: str = None, duration: int = 3600) -> bool:
        """
        Start simple threat detection (mock data)
        
        Args:
            interface: Network interface to monitor (ignored for mock)
            duration: Detection duration in seconds
            
        Returns:
            bool: True if started successfully
        """
        if self.is_running:
            logger.warning("Detection is already running")
            return False
        
        try:
            logger.info(f"🚀 Starting simple threat detection (mock data)")
            
            # Start detection thread
            self.is_running = True
            self.stats['start_time'] = datetime.now()
            self.stats['last_activity'] = datetime.now()
            
            self.detection_thread = threading.Thread(
                target=self._detection_loop,
                args=(duration,),
                daemon=True
            )
            self.detection_thread.start()
            
            logger.info("✅ Simple detection started successfully")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to start detection: {e}")
            self.is_running = False
            return False
    
    def stop_detection(self) -> bool:
        """
        Stop threat detection
        
        Returns:
            bool: True if stopped successfully
        """
        try:
            logger.info("🛑 Stopping threat detection...")
            
            # Stop detection loop
            self.is_running = False
            
            # Wait for thread to finish
            if self.detection_thread and self.detection_thread.is_alive():
                self.detection_thread.join(timeout=5)
            
            logger.info("✅ Threat detection stopped successfully")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to stop detection: {e}")
            return False
    
    def _detection_loop(self, duration: int):
        """
        Main detection loop running in background thread
        
        Args:
            duration: Detection duration in seconds
        """
        start_time = time.time()
        last_analysis = time.time()
        
        logger.info("🔍 Detection loop started")
        
        while self.is_running and (time.time() - start_time) < duration:
            try:
                current_time = time.time()
                
                # Analyze mock flows every 10 seconds
                if current_time - last_analysis >= 10:
                    self._analyze_mock_flows()
                    last_analysis = current_time
                    self.stats['last_activity'] = datetime.now()
                
                # Update stats
                self.stats['packets_captured'] += 10  # Mock packet count
                
                # Sleep briefly to prevent high CPU usage
                time.sleep(1)
                
            except Exception as e:
                logger.error(f"Error in detection loop: {e}")
                time.sleep(5)
        
        logger.info("🔍 Detection loop completed")
        self.is_running = False
    
    def _analyze_mock_flows(self):
        """
        Analyze mock flows for threats
        """
        try:
            # Generate mock flows
            mock_flows = self._generate_mock_flows()
            
            logger.info(f"🔍 Analyzing {len(mock_flows)} mock flows...")
            
            for flow in mock_flows:
                try:
                    # Extract features from flow
                    features = self._extract_mock_features(flow)
                    
                    if features is None:
                        continue
                    
                    # Predict threat
                    threat_result = self._predict_threat(features, flow)
                    
                    if threat_result['is_threat']:
                        self._handle_threat_detection(threat_result, flow)
                    
                    self.stats['flows_analyzed'] += 1
                    
                except Exception as e:
                    logger.error(f"Error analyzing flow: {e}")
                    continue
            
        except Exception as e:
            logger.error(f"Error in flow analysis: {e}")
    
    def _generate_mock_flows(self) -> List[Dict[str, Any]]:
        """
        Generate mock network flows for testing
        
        Returns:
            List of mock flow dictionaries
        """
        import random
        
        flows = []
        
        # Generate 1-3 mock flows per analysis cycle
        num_flows = random.randint(1, 3)
        
        for i in range(num_flows):
            # Random chance of generating a threat flow
            is_threat = random.random() < 0.7  # 70% chance of threat for testing
            
            if is_threat:
                # Generate threat flow
                flow = {
                    'src_ip': f"192.168.1.{random.randint(100, 200)}",
                    'dst_ip': f"192.168.1.{random.randint(1, 10)}",
                    'src_port': random.randint(1000, 65535),
                    'dst_port': random.choice([22, 80, 443, 3389]),
                    'protocol': 'TCP',
                    'duration': random.uniform(0.1, 5.0),
                    'packet_count': random.randint(10, 1000),
                    'byte_count': random.randint(100, 10000),
                    'syn_count': random.randint(1, 10),
                    'ack_count': random.randint(5, 50),
                    'fin_count': random.randint(0, 2),
                    'forward_packets': random.randint(5, 500),
                    'backward_packets': random.randint(5, 500),
                    'forward_bytes': random.randint(50, 5000),
                    'backward_bytes': random.randint(50, 5000)
                }
            else:
                # Generate normal flow
                flow = {
                    'src_ip': f"192.168.1.{random.randint(1, 50)}",
                    'dst_ip': f"192.168.1.{random.randint(1, 10)}",
                    'src_port': random.randint(1000, 65535),
                    'dst_port': random.choice([80, 443, 53]),
                    'protocol': 'TCP',
                    'duration': random.uniform(1.0, 30.0),
                    'packet_count': random.randint(5, 100),
                    'byte_count': random.randint(100, 5000),
                    'syn_count': 1,
                    'ack_count': random.randint(10, 50),
                    'fin_count': 1,
                    'forward_packets': random.randint(5, 50),
                    'backward_packets': random.randint(5, 50),
                    'forward_bytes': random.randint(100, 2000),
                    'backward_bytes': random.randint(100, 2000)
                }
            
            flows.append(flow)
        
        return flows
    
    def _extract_mock_features(self, flow: Dict[str, Any]) -> Optional[pd.DataFrame]:
        """
        Extract ML features from mock flow using the exact feature names from training
        
        Args:
            flow: Mock flow dictionary
            
        Returns:
            pd.DataFrame: Feature vector with proper column names or None if extraction fails
        """
        try:
            # Use the exact feature names from the trained model
            # These are the 25 selected features from metadata.json
            features_dict = {
                'Destination Port': flow.get('dst_port', 0),
                'Bwd IAT Std': flow.get('duration', 0) * 0.1,  # Mock backward IAT std
                'Average Packet Size': flow.get('byte_count', 0) / max(flow.get('packet_count', 1), 1),
                'Avg Fwd Segment Size': flow.get('forward_bytes', 0) / max(flow.get('forward_packets', 1), 1),
                'SYN Flag Count': flow.get('syn_count', 0),
                'Packet Length Variance': flow.get('byte_count', 0) * 0.1,  # Mock variance
                'Packet Length Mean': flow.get('byte_count', 0) / max(flow.get('packet_count', 1), 1),
                'Fwd Packet Length Std': flow.get('forward_bytes', 0) * 0.1,  # Mock std
                'Fwd Packet Length Mean': flow.get('forward_bytes', 0) / max(flow.get('forward_packets', 1), 1),
                'Fwd PSH Flags': flow.get('forward_packets', 0) * 0.1,  # Mock PSH flags
                'Packet Length Std': flow.get('byte_count', 0) * 0.1,  # Mock std
                'Max Packet Length': flow.get('byte_count', 0) / max(flow.get('packet_count', 1), 1) * 2,  # Mock max
                'Fwd Packet Length Max': flow.get('forward_bytes', 0) / max(flow.get('forward_packets', 1), 1) * 2,
                'Fwd IAT Std': flow.get('duration', 0) * 0.1,  # Mock forward IAT std
                'Fwd IAT Max': flow.get('duration', 0) * 0.5,  # Mock forward IAT max
                'Flow IAT Max': flow.get('duration', 0) * 0.3,  # Mock flow IAT max
                'Bwd Packet Length Mean': flow.get('backward_bytes', 0) / max(flow.get('backward_packets', 1), 1),
                'Init_Win_bytes_forward': flow.get('forward_bytes', 0) * 0.1,  # Mock initial window
                'Bwd IAT Max': flow.get('duration', 0) * 0.2,  # Mock backward IAT max
                'Total Length of Fwd Packets': flow.get('forward_bytes', 0),
                'Subflow Fwd Bytes': flow.get('forward_bytes', 0) * 0.8,  # Mock subflow
                'Flow IAT Std': flow.get('duration', 0) * 0.1,  # Mock flow IAT std
                'Flow Duration': flow.get('duration', 0),
                'Avg Bwd Segment Size': flow.get('backward_bytes', 0) / max(flow.get('backward_packets', 1), 1),
                'Bwd Packet Length Max': flow.get('backward_bytes', 0) / max(flow.get('backward_packets', 1), 1) * 2
            }
            
            # Convert to DataFrame with proper column names
            df = pd.DataFrame([features_dict])
            return df
            
        except Exception as e:
            logger.error(f"Error extracting mock features: {e}")
            return None
    
    def _predict_threat(self, features: pd.DataFrame, flow: Dict[str, Any]) -> Dict[str, Any]:
        """
        Predict threat using ML models
        
        Args:
            features: Feature DataFrame with proper column names
            flow: Flow dictionary
            
        Returns:
            Dict: Threat prediction results
        """
        try:
            # Scale features
            features_scaled = self.scaler.transform(features)
            
            # Random Forest prediction
            rf_prediction = self.rf_model.predict(features_scaled)[0]
            rf_probability = self.rf_model.predict_proba(features_scaled)[0][1]
            
            # Isolation Forest prediction
            iso_prediction = self.iso_model.predict(features_scaled)[0]
            iso_score = -self.iso_model.decision_function(features_scaled)[0]
            
            # Convert to binary
            iso_binary = 1 if iso_prediction == -1 else 0
            
            # Ensemble decision (either model detects threat)
            is_threat = (rf_prediction == 1) or (iso_binary == 1)
            
            # Determine threat type
            threat_type = self._classify_threat_type(flow, rf_prediction, iso_binary)
            
            return {
                'is_threat': bool(is_threat),
                'threat_type': threat_type,
                'confidence': float(max(rf_probability, iso_score)),
                'random_forest': {
                    'prediction': int(rf_prediction),
                    'confidence': float(rf_probability),
                    'is_attack': bool(rf_prediction == 1)
                },
                'isolation_forest': {
                    'prediction': int(iso_binary),
                    'anomaly_score': float(iso_score),
                    'is_anomaly': bool(iso_binary == 1)
                },
                'flow_info': {
                    'src_ip': flow.get('src_ip', 'unknown'),
                    'dst_ip': flow.get('dst_ip', 'unknown'),
                    'src_port': flow.get('src_port', 0),
                    'dst_port': flow.get('dst_port', 0),
                    'protocol': flow.get('protocol', 'unknown'),
                    'duration': flow.get('duration', 0),
                    'packet_count': flow.get('packet_count', 0),
                    'byte_count': flow.get('byte_count', 0)
                }
            }
            
        except Exception as e:
            logger.error(f"Error in threat prediction: {e}")
            return {
                'is_threat': False,
                'threat_type': 'unknown',
                'confidence': 0.0,
                'error': str(e)
            }
    
    def _classify_threat_type(self, flow: Dict[str, Any], rf_pred: int, iso_pred: int) -> str:
        """
        Classify the type of threat based on flow characteristics
        
        Args:
            flow: Flow dictionary
            rf_pred: Random Forest prediction
            iso_pred: Isolation Forest prediction
            
        Returns:
            str: Threat type classification
        """
        try:
            # Basic threat classification based on flow characteristics
            if flow.get('protocol') == 'TCP':
                if flow.get('dst_port') in [22, 23, 3389]:  # SSH, Telnet, RDP
                    return 'brute_force'
                elif flow.get('dst_port') in [80, 443, 8080]:  # HTTP/HTTPS
                    return 'web_attack'
                elif flow.get('packet_count', 0) > 100:  # High packet count
                    return 'ddos'
                else:
                    return 'suspicious_tcp'
            elif flow.get('protocol') == 'UDP':
                if flow.get('packet_count', 0) > 50:  # High UDP traffic
                    return 'udp_flood'
                else:
                    return 'suspicious_udp'
            else:
                return 'anomaly'
                
        except Exception as e:
            logger.error(f"Error classifying threat type: {e}")
            return 'unknown'
    
    def _handle_threat_detection(self, threat_result: Dict[str, Any], flow: Dict[str, Any]):
        """
        Handle detected threat
        
        Args:
            threat_result: Threat prediction results
            flow: Flow dictionary
        """
        try:
            # Create threat record
            threat = {
                'threat_id': f"threat_{len(self.detected_threats) + 1:06d}",
                'threat_type': threat_result['threat_type'],
                'severity': self._determine_severity(threat_result['confidence']),
                'source_ip': flow.get('src_ip', 'unknown'),
                'destination_ip': flow.get('dst_ip', 'unknown'),
                'source_port': flow.get('src_port', 0),
                'destination_port': flow.get('dst_port', 0),
                'protocol': flow.get('protocol', 'unknown'),
                'confidence': threat_result['confidence'],
                'timestamp': datetime.now().isoformat(),
                'details': {
                    'rf_prediction': threat_result['random_forest']['prediction'],
                    'rf_confidence': threat_result['random_forest']['confidence'],
                    'iso_prediction': threat_result['isolation_forest']['prediction'],
                    'iso_score': threat_result['isolation_forest']['anomaly_score'],
                    'flow_duration': flow.get('duration', 0),
                    'packet_count': flow.get('packet_count', 0),
                    'byte_count': flow.get('byte_count', 0)
                }
            }
            
            # Add to detected threats
            self.detected_threats.append(threat)
            self.stats['threats_detected'] += 1
            
            # Log threat detection
            logger.warning(f"🚨 THREAT DETECTED: {threat['threat_type']} from {flow.get('src_ip')}:{flow.get('src_port')} to {flow.get('dst_ip')}:{flow.get('dst_port')} (confidence: {threat_result['confidence']:.3f})")
            
            # Send webhook to Node.js backend
            self._send_webhook(threat)
            
        except Exception as e:
            logger.error(f"Error handling threat detection: {e}")

    def _extract_real_pcap_features(self, flow: Dict[str, Any]) -> Optional[pd.DataFrame]:
        """
        Extract REAL CICIDS2017 features from actual PCAP flow data with bidirectional statistics

        Args:
            flow: Bidirectional flow dictionary with detailed packet inspection

        Returns:
            pd.DataFrame: Feature vector with proper column names or None if extraction fails
        """
        try:
            import numpy as np
            
            # Extract basic flow info
            dst_port = flow.get('dst_port', 0)
            forward_packets = len(flow.get('forward_packets', []))
            backward_packets = len(flow.get('backward_packets', []))
            forward_bytes = flow.get('forward_bytes', 0)
            backward_bytes = flow.get('backward_bytes', 0)
            total_packets = forward_packets + backward_packets
            total_bytes = forward_bytes + backward_bytes
            
            # Get packet length arrays
            forward_packet_lengths = flow.get('forward_packet_lengths', [])
            backward_packet_lengths = flow.get('backward_packet_lengths', [])
            all_packet_lengths = flow.get('packet_lengths', [])
            timestamps = flow.get('timestamps', [])
            
            # Calculate flow duration
            if len(timestamps) > 1:
                flow_duration = (timestamps[-1] - timestamps[0]) * 1000000  # Convert to microseconds
                flow_duration = max(flow_duration, 1)  # Avoid division by zero
            else:
                flow_duration = 1
            
            # ==== Packet Size Features ====
            if all_packet_lengths:
                packet_length_mean = np.mean(all_packet_lengths)
                packet_length_std = np.std(all_packet_lengths)
                packet_length_variance = np.var(all_packet_lengths)
                max_packet_length = np.max(all_packet_lengths)
                average_packet_size = packet_length_mean
            else:
                packet_length_mean = 0
                packet_length_std = 0
                packet_length_variance = 0
                max_packet_length = 0
                average_packet_size = 0
            
            # Forward packet size features
            if forward_packet_lengths:
                fwd_packet_length_mean = np.mean(forward_packet_lengths)
                fwd_packet_length_std = np.std(forward_packet_lengths)
                fwd_packet_length_max = np.max(forward_packet_lengths)
                avg_fwd_segment_size = fwd_packet_length_mean
                total_fwd_packets = forward_bytes
            else:
                fwd_packet_length_mean = 0
                fwd_packet_length_std = 0
                fwd_packet_length_max = 0
                avg_fwd_segment_size = 0
                total_fwd_packets = 0
            
            # Backward packet size features
            if backward_packet_lengths:
                bwd_packet_length_mean = np.mean(backward_packet_lengths)
                bwd_packet_length_max = np.max(backward_packet_lengths)
                avg_bwd_segment_size = bwd_packet_length_mean
            else:
                bwd_packet_length_mean = 0
                bwd_packet_length_max = 0
                avg_bwd_segment_size = 0
            
            # ==== Inter-Arrival Time (IAT) Features ====
            # Calculate IAT arrays
            def calculate_iats(timestamps_list):
                if len(timestamps_list) < 2:
                    return []
                iats = []
                for i in range(1, len(timestamps_list)):
                    iat = (timestamps_list[i] - timestamps_list[i-1]) * 1000000  # Microseconds
                    iats.append(iat)
                return iats
            
            # Forward IATs
            forward_timestamps = [timestamps[i] for i in range(len(timestamps)) if i < len(flow.get('forward_packets', []))]
            forward_iats = calculate_iats(forward_timestamps)
            if forward_iats:
                fwd_iat_mean = np.mean(forward_iats)
                fwd_iat_std = np.std(forward_iats)
                fwd_iat_max = np.max(forward_iats)
            else:
                fwd_iat_mean = 0
                fwd_iat_std = 0
                fwd_iat_max = 0
            
            # Backward IATs
            backward_timestamps = [timestamps[i] for i in range(len(timestamps)) if i >= len(flow.get('forward_packets', []))]
            backward_iats = calculate_iats(backward_timestamps)
            if backward_iats:
                bwd_iat_std = np.std(backward_iats)
                bwd_iat_max = np.max(backward_iats)
            else:
                bwd_iat_std = 0
                bwd_iat_max = 0
            
            # Flow IATs (all packets)
            flow_iats = calculate_iats(timestamps)
            if flow_iats:
                flow_iat_std = np.std(flow_iats)
                flow_iat_max = np.max(flow_iats)
            else:
                flow_iat_std = 0
                flow_iat_max = 0
            
            # ==== TCP Flag Features ====
            syn_flag_count = flow.get('syn_count', 0)
            fwd_psh_flags = flow.get('psh_count', 0)
            
            # ==== Window Size Features ====
            init_win_bytes_forward = flow.get('init_win_bytes_forward', 0)
            
            # ==== Subflow Features ====
            subflow_fwd_bytes = forward_bytes
            
            # Create feature dictionary with exact names from CICIDS2017
            features_dict = {
                'Destination Port': float(dst_port),
                'Bwd IAT Std': float(bwd_iat_std),
                'Average Packet Size': float(average_packet_size),
                'Avg Fwd Segment Size': float(avg_fwd_segment_size),
                'SYN Flag Count': float(syn_flag_count),
                'Packet Length Variance': float(packet_length_variance),
                'Packet Length Mean': float(packet_length_mean),
                'Fwd Packet Length Std': float(fwd_packet_length_std),
                'Fwd Packet Length Mean': float(fwd_packet_length_mean),
                'Fwd PSH Flags': float(fwd_psh_flags),
                'Packet Length Std': float(packet_length_std),
                'Max Packet Length': float(max_packet_length),
                'Fwd Packet Length Max': float(fwd_packet_length_max),
                'Fwd IAT Std': float(fwd_iat_std),
                'Fwd IAT Max': float(fwd_iat_max),
                'Flow IAT Max': float(flow_iat_max),
                'Bwd Packet Length Mean': float(bwd_packet_length_mean),
                'Init_Win_bytes_forward': float(init_win_bytes_forward),
                'Bwd IAT Max': float(bwd_iat_max),
                'Total Length of Fwd Packets': float(total_fwd_packets),
                'Subflow Fwd Bytes': float(subflow_fwd_bytes),
                'Flow IAT Std': float(flow_iat_std),
                'Flow Duration': float(flow_duration),
                'Avg Bwd Segment Size': float(avg_bwd_segment_size),
                'Bwd Packet Length Max': float(bwd_packet_length_max)
            }

            # Convert to DataFrame
            df = pd.DataFrame([features_dict])

            # Ensure all 25 features are present in correct order
            expected_features = [
                'Destination Port', 'Bwd IAT Std', 'Average Packet Size', 'Avg Fwd Segment Size',
                'SYN Flag Count', 'Packet Length Variance', 'Packet Length Mean', 'Fwd Packet Length Std',
                'Fwd Packet Length Mean', 'Fwd PSH Flags', 'Packet Length Std', 'Max Packet Length',
                'Fwd Packet Length Max', 'Fwd IAT Std', 'Fwd IAT Max', 'Flow IAT Max',
                'Bwd Packet Length Mean', 'Init_Win_bytes_forward', 'Bwd IAT Max', 'Total Length of Fwd Packets',
                'Subflow Fwd Bytes', 'Flow IAT Std', 'Flow Duration', 'Avg Bwd Segment Size', 'Bwd Packet Length Max'
            ]

            return df[expected_features]

        except Exception as e:
            logger.error(f"Error extracting real PCAP features: {e}", exc_info=True)
            return None

    def _determine_severity(self, confidence: float) -> str:
        """
        Determine threat severity based on confidence score
        
        Args:
            confidence: Confidence score (0-1)
            
        Returns:
            str: Severity level
        """
        if confidence >= 0.9:
            return 'critical'
        elif confidence >= 0.7:
            return 'high'
        elif confidence >= 0.5:
            return 'medium'
        else:
            return 'low'
    
    def get_detection_status(self) -> Dict[str, Any]:
        """
        Get current detection status
        
        Returns:
            Dict: Detection status information
        """
        return {
            'is_running': self.is_running,
            'stats': self.stats,
            'threats_detected': len(self.detected_threats),
            'models_loaded': self.rf_model is not None and self.iso_model is not None
        }
    
    def get_detected_threats(self, limit: int = 50) -> List[Dict[str, Any]]:
        """
        Get detected threats
        
        Args:
            limit: Maximum number of threats to return
            
        Returns:
            List: Detected threats
        """
        return self.detected_threats[-limit:] if limit > 0 else self.detected_threats
    
    def clear_threats(self):
        """Clear detected threats history"""
        self.detected_threats.clear()
        self.stats['threats_detected'] = 0
        logger.info("🧹 Cleared threat history")
    
    def _send_webhook(self, threat_data: Dict[str, Any]):
        """
        Send threat data to Node.js backend via webhook
        
        Args:
            threat_data: Threat information dictionary
        """
        NODEJS_BACKEND_URL = "http://localhost:5000"
        WEBHOOK_ENDPOINT = f"{NODEJS_BACKEND_URL}/api/network/webhook"
        
        try:
            response = requests.post(
                WEBHOOK_ENDPOINT,
                json=threat_data,
                headers={"Content-Type": "application/json"},
                timeout=5.0
            )
            if response.status_code == 200:
                logger.info(f"✅ Webhook sent successfully: {threat_data['threat_id']}")
            else:
                logger.warning(f"⚠️ Webhook failed with status {response.status_code}: {response.text}")
        except requests.exceptions.Timeout:
            logger.error(f"❌ Webhook timeout for threat {threat_data['threat_id']}")
        except requests.exceptions.ConnectionError:
            logger.error(f"❌ Webhook connection error - is Node.js backend running?")
        except Exception as e:
            logger.error(f"❌ Webhook error: {e}")
