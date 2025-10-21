"""
Real-time Network Threat Detection Service
Integrates packet capture, flow extraction, and ML models for live threat detection
"""

import asyncio
import threading
import time
import logging
from datetime import datetime
from typing import Dict, List, Any, Optional
from pathlib import Path
import json
import joblib
import numpy as np
import pandas as pd

# Import our existing modules
from capture.packet_capture import PacketCapture
from capture.flow_extractor import FlowExtractor, NetworkFlow
from utils.feature_builder import NetworkFeatureBuilder

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class RealTimeDetector:
    """
    Real-time network threat detection service
    Integrates packet capture, flow extraction, and ML models
    """
    
    def __init__(self, models_path: str = "data/processed"):
        """
        Initialize the real-time detector
        
        Args:
            models_path: Path to trained models and scalers
        """
        self.models_path = Path(models_path)
        self.is_running = False
        self.capture_thread = None
        
        # Initialize components
        self.packet_capture = PacketCapture()
        self.flow_extractor = FlowExtractor(flow_timeout=300)  # 5 minutes timeout
        self.feature_builder = NetworkFeatureBuilder()
        
        # Load trained models
        self.rf_model = None
        self.iso_model = None
        self.scaler = None
        self.label_encoder = None
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
            
            # Load label encoder if available
            try:
                self.label_encoder = joblib.load(self.models_path / "label_encoder.pkl")
            except FileNotFoundError:
                logger.warning("Label encoder not found, using default mapping")
                self.label_encoder = None
            
            logger.info("✅ Models loaded successfully")
            logger.info(f"  - Random Forest: {type(self.rf_model).__name__}")
            logger.info(f"  - Isolation Forest: {type(self.iso_model).__name__}")
            logger.info(f"  - Scaler: {type(self.scaler).__name__}")
            
        except Exception as e:
            logger.error(f"❌ Failed to load models: {e}")
            raise
    
    def start_detection(self, interface: str = None, duration: int = 3600) -> bool:
        """
        Start real-time threat detection
        
        Args:
            interface: Network interface to monitor
            duration: Detection duration in seconds
            
        Returns:
            bool: True if started successfully
        """
        if self.is_running:
            logger.warning("Detection is already running")
            return False
        
        try:
            # Auto-detect interface if not specified
            if not interface:
                interface = self.packet_capture.auto_detect_interface()
                if not interface:
                    logger.error("No suitable network interface found")
                    return False
            
            logger.info(f"🚀 Starting real-time threat detection on {interface}")
            
            # Start packet capture
            if not self.packet_capture.start_capture():
                logger.error("Failed to start packet capture")
                return False
            
            # Start detection thread
            self.is_running = True
            self.stats['start_time'] = datetime.now()
            self.stats['last_activity'] = datetime.now()
            
            self.capture_thread = threading.Thread(
                target=self._detection_loop,
                args=(duration,),
                daemon=True
            )
            self.capture_thread.start()
            
            logger.info("✅ Real-time detection started successfully")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to start detection: {e}")
            self.is_running = False
            return False
    
    def stop_detection(self) -> bool:
        """
        Stop real-time threat detection
        
        Returns:
            bool: True if stopped successfully
        """
        if not self.is_running:
            logger.warning("Detection is not running")
            return False
        
        try:
            logger.info("🛑 Stopping real-time threat detection...")
            
            # Stop packet capture
            self.packet_capture.stop_capture()
            
            # Stop detection loop
            self.is_running = False
            
            # Wait for thread to finish
            if self.capture_thread and self.capture_thread.is_alive():
                self.capture_thread.join(timeout=5)
            
            logger.info("✅ Real-time detection stopped successfully")
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
                
                # Analyze flows every 10 seconds
                if current_time - last_analysis >= 10:
                    self._analyze_flows()
                    last_analysis = current_time
                    self.stats['last_activity'] = datetime.now()
                
                # Update stats
                self.stats['packets_captured'] = len(self.packet_capture.get_packets())
                
                # Sleep briefly to prevent high CPU usage
                time.sleep(1)
                
            except Exception as e:
                logger.error(f"Error in detection loop: {e}")
                time.sleep(5)
        
        logger.info("🔍 Detection loop completed")
        self.is_running = False
    
    def _analyze_flows(self):
        """
        Analyze captured flows for threats
        """
        try:
            # Get completed flows
            flows = self.flow_extractor.get_completed_flows()
            
            if not flows:
                return
            
            logger.info(f"🔍 Analyzing {len(flows)} flows...")
            
            for flow in flows:
                try:
                    # Extract features from flow
                    features = self._extract_flow_features(flow)
                    
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
            
            # Clean up expired flows
            self.flow_extractor.cleanup_expired_flows()
            
        except Exception as e:
            logger.error(f"Error in flow analysis: {e}")
    
    def _extract_flow_features(self, flow: NetworkFlow) -> Optional[np.ndarray]:
        """
        Extract ML features from network flow
        
        Args:
            flow: Network flow object
            
        Returns:
            np.ndarray: Feature vector or None if extraction fails
        """
        try:
            # Get flow features as dictionary
            flow_dict = flow.get_features()
            
            if not flow_dict:
                return None
            
            # Build comprehensive features using NetworkFeatureBuilder
            features_dict = self.feature_builder.build_all_features(flow_dict)
            
            if not features_dict:
                return None
            
            # Convert to numpy array
            feature_values = list(features_dict.values())
            features = np.array(feature_values)
            
            # Ensure we have the right number of features (25)
            if len(features) != 25:
                logger.warning(f"Expected 25 features, got {len(features)}")
                # Pad or truncate to 25 features
                if len(features) < 25:
                    features = np.pad(features, (0, 25 - len(features)), 'constant')
                else:
                    features = features[:25]
            
            return features.reshape(1, -1)
            
        except Exception as e:
            logger.error(f"Error extracting flow features: {e}")
            return None
    
    def _predict_threat(self, features: np.ndarray, flow: NetworkFlow) -> Dict[str, Any]:
        """
        Predict threat using ML models
        
        Args:
            features: Feature vector
            flow: Network flow object
            
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
                    'src_ip': flow.src_ip,
                    'dst_ip': flow.dst_ip,
                    'src_port': flow.src_port,
                    'dst_port': flow.dst_port,
                    'protocol': flow.protocol,
                    'duration': flow.duration,
                    'packet_count': flow.packet_count,
                    'byte_count': flow.byte_count
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
    
    def _classify_threat_type(self, flow: NetworkFlow, rf_pred: int, iso_pred: int) -> str:
        """
        Classify the type of threat based on flow characteristics
        
        Args:
            flow: Network flow object
            rf_pred: Random Forest prediction
            iso_pred: Isolation Forest prediction
            
        Returns:
            str: Threat type classification
        """
        try:
            # Basic threat classification based on flow characteristics
            if flow.protocol == 'TCP':
                if flow.dst_port in [22, 23, 3389]:  # SSH, Telnet, RDP
                    return 'brute_force'
                elif flow.dst_port in [80, 443, 8080]:  # HTTP/HTTPS
                    return 'web_attack'
                elif flow.packet_count > 1000:  # High packet count
                    return 'ddos'
                else:
                    return 'suspicious_tcp'
            elif flow.protocol == 'UDP':
                if flow.packet_count > 500:  # High UDP traffic
                    return 'udp_flood'
                else:
                    return 'suspicious_udp'
            else:
                return 'anomaly'
                
        except Exception as e:
            logger.error(f"Error classifying threat type: {e}")
            return 'unknown'
    
    def _handle_threat_detection(self, threat_result: Dict[str, Any], flow: NetworkFlow):
        """
        Handle detected threat
        
        Args:
            threat_result: Threat prediction results
            flow: Network flow object
        """
        try:
            # Create threat record
            threat = {
                'threat_id': f"threat_{len(self.detected_threats) + 1:06d}",
                'threat_type': threat_result['threat_type'],
                'severity': self._determine_severity(threat_result['confidence']),
                'source_ip': flow.src_ip,
                'destination_ip': flow.dst_ip,
                'source_port': flow.src_port,
                'destination_port': flow.dst_port,
                'protocol': flow.protocol,
                'confidence': threat_result['confidence'],
                'timestamp': datetime.now().isoformat(),
                'details': {
                    'rf_prediction': threat_result['random_forest']['prediction'],
                    'rf_confidence': threat_result['random_forest']['confidence'],
                    'iso_prediction': threat_result['isolation_forest']['prediction'],
                    'iso_score': threat_result['isolation_forest']['anomaly_score'],
                    'flow_duration': flow.duration,
                    'packet_count': flow.packet_count,
                    'byte_count': flow.byte_count
                }
            }
            
            # Add to detected threats
            self.detected_threats.append(threat)
            self.stats['threats_detected'] += 1
            
            # Log threat detection
            logger.warning(f"🚨 THREAT DETECTED: {threat['threat_type']} from {flow.src_ip}:{flow.src_port} to {flow.dst_ip}:{flow.dst_port} (confidence: {threat_result['confidence']:.3f})")
            
            # TODO: Send to Node.js backend
            # self._send_threat_to_backend(threat)
            
        except Exception as e:
            logger.error(f"Error handling threat detection: {e}")
    
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
