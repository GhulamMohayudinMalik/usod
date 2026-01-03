"""
Network Threat Detection AI Service
FastAPI service for PCAP analysis and real-time network monitoring using NFStream model

Endpoints compatible with Node.js backend (usod/app/backend):
- POST /api/start-capture - Start real-time monitoring
- POST /api/stop-capture - Stop real-time monitoring
- GET /api/get-threats - Get detected threats
- POST /api/analyze-pcap - Analyze PCAP file (file_path format)
- GET /api/model-stats - Get model statistics
- POST /api/clear-threats - Clear detected threats
- GET /health - Health check
"""

from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, List, Any
import uvicorn
import os
import tempfile
import uuid
import json
import threading
import time
import requests
from pathlib import Path
from datetime import datetime

# Import our modules
import sys
sys.path.insert(0, str(Path(__file__).parent.parent))

from src.analyzer import NetworkThreatAnalyzer
from src.predictor import NetworkThreatPredictor
from src.feature_extractor import NFSTREAM_ATTRIBUTES

app = FastAPI(
    title="Network Threat Detection API",
    description="AI-powered network threat detection service with real-time monitoring",
    version="2.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("ALLOWED_ORIGINS", "*").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================================
# Global State for Real-Time Monitoring
# ============================================================================

monitoring_state = {
    "active": False,
    "start_time": None,
    "end_time": None,
    "interface": None,
    "duration": None,
    "session_id": None,
    "stats": {
        "total_flows": 0,
        "benign_flows": 0,
        "attack_flows": 0,
        "flows_per_second": 0.0
    }
}

detected_threats: List[Dict[str, Any]] = []
monitoring_thread: Optional[threading.Thread] = None
stop_monitoring_flag = threading.Event()

# Webhook configuration for Node.js backend
NODEJS_BACKEND_URL = os.getenv("NODEJS_BACKEND_URL", "http://localhost:5000")
WEBHOOK_ENDPOINT = f"{NODEJS_BACKEND_URL}/api/network/webhook"

# Results storage directory
RESULTS_DIR = Path(__file__).parent.parent / "monitoring_results"
RESULTS_DIR.mkdir(exist_ok=True)

# ============================================================================
# Initialize AI Components
# ============================================================================

print("Loading AI analyzer...")
try:
    analyzer = NetworkThreatAnalyzer()
    predictor = NetworkThreatPredictor()
    print("SUCCESS: AI analyzer loaded successfully")
    print(f"  - Model: {predictor.class_names_nfstream if hasattr(predictor, 'class_names_nfstream') else 'NFStream Binary'}")
except Exception as e:
    print(f"ERROR: Failed to load analyzer: {e}")
    analyzer = None
    predictor = None

# ============================================================================
# Pydantic Models
# ============================================================================

class CaptureRequest(BaseModel):
    interface: str = "auto"
    duration: int = 300  # Default 5 minutes

class AnalysisResponse(BaseModel):
    status: str
    total_flows: int
    threats_detected: bool
    summary: Dict[str, Any]
    results_url: Optional[str] = None
    analysis_id: Optional[str] = None
    processing_time: Optional[float] = None

class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    extractor_available: bool
    monitoring_active: bool
    timestamp: str

class ThreatData(BaseModel):
    threat_id: str
    threat_type: str
    severity: str
    source_ip: str
    destination_ip: str
    confidence: float
    timestamp: str
    details: Dict[str, Any]

# ============================================================================
# Webhook Integration
# ============================================================================

def send_webhook(threat_data: Dict[str, Any]):
    """Send threat data to Node.js backend via webhook."""
    try:
        response = requests.post(
            WEBHOOK_ENDPOINT,
            json=threat_data,
            headers={"Content-Type": "application/json"},
            timeout=5.0
        )
        if response.status_code == 200:
            print(f"✅ Webhook sent: {threat_data.get('threat_id', 'unknown')}")
        else:
            print(f"⚠️ Webhook failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Webhook error: {e}")

# ============================================================================
# Real-Time Monitoring Functions
# ============================================================================

def get_network_interfaces():
    """Get available network interfaces for capture."""
    interfaces = []
    
    try:
        # Try Windows NPF device format
        import winreg
        from nfstream import NFStreamer
        
        reg_path = r"SYSTEM\CurrentControlSet\Control\Network\{4D36E972-E325-11CE-BFC1-08002BE10318}"
        reg_key = winreg.OpenKey(winreg.HKEY_LOCAL_MACHINE, reg_path)
        i = 0
        while True:
            try:
                guid = winreg.EnumKey(reg_key, i)
                conn_path = f"{reg_path}\\{guid}\\Connection"
                try:
                    conn_key = winreg.OpenKey(winreg.HKEY_LOCAL_MACHINE, conn_path)
                    name = winreg.QueryValueEx(conn_key, "Name")[0]
                    npf_name = f"\\Device\\NPF_{guid}"
                    
                    # Test if interface works
                    try:
                        test = NFStreamer(source=npf_name, statistical_analysis=True)
                        interfaces.append({'name': npf_name, 'display': name})
                        del test
                    except:
                        pass
                    winreg.CloseKey(conn_key)
                except:
                    pass
                i += 1
            except OSError:
                break
        winreg.CloseKey(reg_key)
    except ImportError:
        # Not on Windows, try psutil
        try:
            import psutil
            net_if_addrs = psutil.net_if_addrs()
            for iface_name, addrs in net_if_addrs.items():
                has_ipv4 = any(addr.family == 2 for addr in addrs)
                if has_ipv4:
                    interfaces.append({'name': iface_name, 'display': iface_name})
        except:
            pass
    except Exception as e:
        print(f"Error getting interfaces: {e}")
    
    return interfaces

def select_interface(requested: str = "auto"):
    """Select network interface for capture."""
    interfaces = get_network_interfaces()
    
    if not interfaces:
        return None, None
    
    if requested != "auto":
        # Try to find the requested interface
        for iface in interfaces:
            if requested in iface['name'] or requested in iface['display']:
                return iface['name'], iface['display']
    
    # Auto-select Wi-Fi or Ethernet
    for iface in interfaces:
        if 'Wi-Fi' in iface['display'] or 'WiFi' in iface['display']:
            return iface['name'], iface['display']
        elif 'Ethernet' in iface['display']:
            return iface['name'], iface['display']
    
    # Fallback to first interface
    return interfaces[0]['name'], interfaces[0]['display']

def run_monitoring(interface: str, duration: int, session_id: str):
    """Background thread for real-time network monitoring."""
    global monitoring_state, detected_threats
    
    try:
        from nfstream import NFStreamer
        import pandas as pd
        import numpy as np
        
        print(f"🚀 Starting real-time monitoring on {interface}")
        
        BATCH_SIZE = 10
        IDLE_TIMEOUT = 15
        ACTIVE_TIMEOUT = 30
        
        streamer = NFStreamer(
            source=interface,
            statistical_analysis=True,
            active_timeout=ACTIVE_TIMEOUT,
            idle_timeout=IDLE_TIMEOUT,
            splt_analysis=0,
            n_dissections=0,
        )
        
        batch = []
        start_time = time.time()
        monitoring_state["stats"]["flows_per_second"] = 0.0
        
        for flow in streamer:
            # Check stop conditions
            if stop_monitoring_flag.is_set():
                print("⏹️ Monitoring stopped by user")
                break
            
            if time.time() - start_time >= duration:
                print("⏱️ Monitoring duration reached")
                break
            
            # Extract features from flow
            flow_data = {}
            for attr in NFSTREAM_ATTRIBUTES:
                try:
                    val = getattr(flow, attr, 0)
                    flow_data[attr] = 0 if val is None else val
                except:
                    flow_data[attr] = 0
            
            # Add metadata for threat details
            flow_data['_src_ip'] = flow.src_ip
            flow_data['_dst_ip'] = flow.dst_ip
            flow_data['_src_port'] = flow.src_port
            flow_data['_dst_port'] = flow.dst_port
            flow_data['_protocol'] = flow.protocol
            
            batch.append(flow_data)
            
            # Process batch
            if len(batch) >= BATCH_SIZE:
                try:
                    df = pd.DataFrame(batch)
                    
                    # Separate metadata
                    metadata = df[['_src_ip', '_dst_ip', '_src_port', '_dst_port', '_protocol']].copy()
                    feature_df = df.drop(columns=['_src_ip', '_dst_ip', '_src_port', '_dst_port', '_protocol'])
                    feature_df = feature_df.replace([np.inf, -np.inf], np.nan).fillna(0)
                    
                    # Make predictions
                    predictions = predictor.predict_nfstream(feature_df)
                    
                    # Update stats
                    for i, pred in enumerate(predictions):
                        monitoring_state["stats"]["total_flows"] += 1
                        
                        if pred == 'BENIGN':
                            monitoring_state["stats"]["benign_flows"] += 1
                        else:
                            monitoring_state["stats"]["attack_flows"] += 1
                            
                            # Create threat entry
                            threat_id = f"rt_{session_id}_{len(detected_threats)+1:06d}"
                            threat_data = {
                                "threat_id": threat_id,
                                "threat_type": pred,
                                "severity": "high" if "DDoS" in pred else "medium",
                                "source_ip": str(metadata.iloc[i]['_src_ip']),
                                "destination_ip": str(metadata.iloc[i]['_dst_ip']),
                                "source_port": int(metadata.iloc[i]['_src_port']),
                                "destination_port": int(metadata.iloc[i]['_dst_port']),
                                "protocol": int(metadata.iloc[i]['_protocol']),
                                "confidence": 0.85,  # NFStream model confidence
                                "timestamp": datetime.now().isoformat(),
                                "details": {
                                    "session_id": session_id,
                                    "flow_index": monitoring_state["stats"]["total_flows"],
                                    "detection_type": "real-time"
                                }
                            }
                            detected_threats.append(threat_data)
                            
                            # Send webhook to Node.js backend
                            send_webhook(threat_data)
                            
                            print(f"⚠️ ATTACK: {pred} from {threat_data['source_ip']} → {threat_data['destination_ip']}")
                    
                    # Update flows per second
                    elapsed = time.time() - start_time
                    if elapsed > 0:
                        monitoring_state["stats"]["flows_per_second"] = round(
                            monitoring_state["stats"]["total_flows"] / elapsed, 2
                        )
                    
                    batch = []
                    
                except Exception as e:
                    print(f"❌ Batch processing error: {e}")
                    batch = []
        
        print(f"✅ Monitoring complete. Analyzed {monitoring_state['stats']['total_flows']} flows")
        
    except Exception as e:
        print(f"❌ Monitoring error: {e}")
        import traceback
        traceback.print_exc()
    
    finally:
        monitoring_state["active"] = False
        monitoring_state["end_time"] = datetime.now().isoformat()

def save_monitoring_session(session_id: str) -> str:
    """Save monitoring session results to file."""
    global monitoring_state, detected_threats
    
    session_data = {
        "session_id": session_id,
        "start_time": monitoring_state["start_time"],
        "end_time": monitoring_state["end_time"],
        "interface": monitoring_state["interface"],
        "duration_requested": monitoring_state["duration"],
        "statistics": {
            "total_flows": monitoring_state["stats"]["total_flows"],
            "benign_flows": monitoring_state["stats"]["benign_flows"],
            "attack_flows": monitoring_state["stats"]["attack_flows"],
            "attack_percentage": round(
                monitoring_state["stats"]["attack_flows"] / max(monitoring_state["stats"]["total_flows"], 1) * 100, 2
            ),
            "flows_per_second": monitoring_state["stats"]["flows_per_second"]
        },
        "threats": detected_threats,
        "summary": {
            "threat_types": {},
            "top_source_ips": {},
            "top_destination_ips": {}
        }
    }
    
    # Generate summary
    for threat in detected_threats:
        # Count threat types
        threat_type = threat.get("threat_type", "unknown")
        session_data["summary"]["threat_types"][threat_type] = \
            session_data["summary"]["threat_types"].get(threat_type, 0) + 1
        
        # Count source IPs
        src_ip = threat.get("source_ip", "unknown")
        session_data["summary"]["top_source_ips"][src_ip] = \
            session_data["summary"]["top_source_ips"].get(src_ip, 0) + 1
        
        # Count destination IPs
        dst_ip = threat.get("destination_ip", "unknown")
        session_data["summary"]["top_destination_ips"][dst_ip] = \
            session_data["summary"]["top_destination_ips"].get(dst_ip, 0) + 1
    
    # Sort and limit top IPs
    session_data["summary"]["top_source_ips"] = dict(
        sorted(session_data["summary"]["top_source_ips"].items(), key=lambda x: -x[1])[:10]
    )
    session_data["summary"]["top_destination_ips"] = dict(
        sorted(session_data["summary"]["top_destination_ips"].items(), key=lambda x: -x[1])[:10]
    )
    
    # Save to file
    filename = f"session_{session_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    filepath = RESULTS_DIR / filename
    
    with open(filepath, 'w') as f:
        json.dump(session_data, f, indent=2)
    
    print(f"💾 Session saved: {filepath}")
    return str(filepath)

# ============================================================================
# API Endpoints - Legacy Format (for Node.js backend compatibility)
# ============================================================================

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    return HealthResponse(
        status="healthy",
        model_loaded=analyzer is not None and predictor is not None,
        extractor_available=analyzer is not None and analyzer.extractor.nfstream_available,
        monitoring_active=monitoring_state["active"],
        timestamp=datetime.utcnow().isoformat()
    )


@app.post("/api/start-capture")
async def start_capture(request: CaptureRequest):
    """Start real-time network monitoring."""
    global monitoring_state, monitoring_thread, detected_threats
    
    if monitoring_state["active"]:
        raise HTTPException(status_code=400, detail="Monitoring is already active")
    
    if predictor is None:
        raise HTTPException(status_code=503, detail="AI model not loaded")
    
    # Select interface
    interface, display_name = select_interface(request.interface)
    
    if interface is None:
        raise HTTPException(
            status_code=400, 
            detail="No network interfaces available. Run as Administrator."
        )
    
    # Initialize session
    session_id = str(uuid.uuid4())[:8]
    stop_monitoring_flag.clear()
    detected_threats = []  # Clear previous threats
    
    monitoring_state.update({
        "active": True,
        "start_time": datetime.now().isoformat(),
        "end_time": None,
        "interface": display_name,
        "duration": request.duration,
        "session_id": session_id,
        "stats": {
            "total_flows": 0,
            "benign_flows": 0,
            "attack_flows": 0,
            "flows_per_second": 0.0
        }
    })
    
    # Start monitoring thread
    monitoring_thread = threading.Thread(
        target=run_monitoring,
        args=(interface, request.duration, session_id),
        daemon=True
    )
    monitoring_thread.start()
    
    return {
        "status": "started",
        "message": f"Real-time monitoring started on {display_name}",
        "session_id": session_id,
        "interface": display_name,
        "duration": request.duration
    }


@app.post("/api/stop-capture")
async def stop_capture():
    """Stop real-time network monitoring and save results."""
    global monitoring_state
    
    if not monitoring_state["active"]:
        raise HTTPException(status_code=400, detail="Monitoring is not active")
    
    # Signal thread to stop
    stop_monitoring_flag.set()
    
    # Wait a moment for thread to finish
    if monitoring_thread and monitoring_thread.is_alive():
        monitoring_thread.join(timeout=5.0)
    
    monitoring_state["active"] = False
    monitoring_state["end_time"] = datetime.now().isoformat()
    
    # Save session results
    session_id = monitoring_state.get("session_id", "unknown")
    results_file = save_monitoring_session(session_id)
    
    return {
        "status": "stopped",
        "message": "Monitoring stopped successfully",
        "session_id": session_id,
        "results_file": results_file,
        "statistics": monitoring_state["stats"],
        "duration": {
            "start": monitoring_state["start_time"],
            "end": monitoring_state["end_time"]
        }
    }


@app.get("/api/get-threats")
async def get_threats(limit: int = 50):
    """Get detected threats from current/recent monitoring session."""
    threats = detected_threats[-limit:] if limit > 0 else detected_threats
    
    return {
        "threats": threats,
        "count": len(threats),
        "total": len(detected_threats),
        "monitoring_active": monitoring_state["active"],
        "timestamp": datetime.now().isoformat()
    }


@app.post("/api/analyze-pcap")
async def analyze_pcap_legacy(request: dict):
    """
    Analyze PCAP file (legacy endpoint for Node.js backend).
    Accepts {"file_path": "...", "batch_size": 5000} format.
    """
    if analyzer is None:
        raise HTTPException(status_code=503, detail="AI analyzer not loaded")
    
    file_path = request.get("file_path")
    if not file_path:
        raise HTTPException(status_code=400, detail="file_path is required")
    
    # Get batch size (default 5000)
    batch_size = int(request.get("batch_size", 5000))
    batch_size = max(1000, min(50000, batch_size))  # Clamp between 1000-50000
    
    pcap_path = Path(file_path)
    if not pcap_path.exists():
        raise HTTPException(status_code=404, detail=f"File not found: {file_path}")
    
    try:
        start_time = datetime.utcnow()
        
        print(f"\n📊 Batch size for breakdown: {batch_size}")
        
        # Analyze PCAP with batch size
        results = analyzer.analyze_pcap(
            pcap_path,
            model_type='nfstream',
            save_results=False,  # Keep in memory only
            batch_size=batch_size
        )
        
        if results['status'] != 'success':
            raise HTTPException(status_code=400, detail=results.get('message', 'Analysis failed'))
        
        processing_time = (datetime.utcnow() - start_time).total_seconds()
        
        # Extract threats from the dataframe
        threats_list = []
        if 'dataframe' in results and results.get('threat_detected', False):
            df = results['dataframe']
            attacks_df = df[df['Prediction'] != 'BENIGN'].copy()
            
            print(f"📊 Extracting {len(attacks_df)} threats from analysis...")
            
            for idx, row in attacks_df.iterrows():
                # Generate unique threat ID
                threat_id = f"pcap_{datetime.now().strftime('%Y%m%d%H%M%S')}_{idx:06d}"
                
                # Determine severity based on attack type
                attack_type = str(row.get('Prediction', 'UNKNOWN'))
                if 'DDoS' in attack_type:
                    severity = 'critical'
                elif 'DoS' in attack_type or 'PortScan' in attack_type:
                    severity = 'high'
                elif 'Brute' in attack_type or 'Web' in attack_type:
                    severity = 'high'
                else:
                    severity = 'medium'
                
                # Extract IP and port info if available
                src_ip = str(row.get('src_ip', row.get('_src_ip', '0.0.0.0')))
                dst_ip = str(row.get('dst_ip', row.get('_dst_ip', '0.0.0.0')))
                src_port = int(row.get('src_port', row.get('_src_port', 0)))
                dst_port = int(row.get('dst_port', row.get('_dst_port', 0)))
                protocol = int(row.get('protocol', row.get('_protocol', 0)))
                
                # Get confidence
                confidence = float(row.get('Confidence', 0.85))
                
                threat_data = {
                    "threat_id": threat_id,
                    "threat_type": attack_type,
                    "predicted_class": attack_type,
                    "severity": severity,
                    "source_ip": src_ip,
                    "destination_ip": dst_ip,
                    "source_port": src_port,
                    "destination_port": dst_port,
                    "protocol": protocol,
                    "confidence": confidence,
                    "timestamp": datetime.now().isoformat(),
                    "details": {
                        "model_used": "NFStream Binary",
                        "pcap_file": str(pcap_path.name),
                        "flow_index": int(idx),
                        "detection_type": "pcap_analysis"
                    }
                }
                threats_list.append(threat_data)
            
            print(f"✅ Extracted {len(threats_list)} threat objects")
        
        # Format response for Node.js backend
        return {
            "success": True,
            "status": "success",
            "threats": threats_list,
            "flowsAnalyzed": results.get('total_flows', 0),
            "file_path": str(pcap_path),
            "analysis_timestamp": datetime.now().isoformat(),
            "processing_time": processing_time,
            "summary": results.get('summary', {}),
            "threat_detected": results.get('threat_detected', False)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error analyzing PCAP: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"PCAP analysis failed: {str(e)}")


@app.get("/api/model-stats")
async def get_model_stats():
    """Get model statistics (legacy endpoint)."""
    stats = monitoring_state["stats"].copy()
    
    return {
        "models": [
            {
                "name": "NFStream Robust Binary",
                "accuracy": 0.7710,  # 77.10% accuracy
                "precision": 0.85,
                "recall": 0.78,
                "f1_score": 0.81,
                "last_updated": datetime.now().isoformat()
            }
        ],
        "detection_status": {
            "is_running": monitoring_state["active"],
            "stats": stats,
            "threats_detected": len(detected_threats),
            "models_loaded": predictor is not None
        },
        "timestamp": datetime.now().isoformat()
    }


@app.post("/api/clear-threats")
async def clear_threats():
    """Clear detected threats from memory."""
    global detected_threats
    
    count = len(detected_threats)
    detected_threats = []
    
    return {
        "success": True,
        "message": f"Cleared {count} threats",
        "timestamp": datetime.now().isoformat()
    }


@app.get("/api/monitoring-status")
async def get_monitoring_status():
    """Get current monitoring status."""
    return {
        "active": monitoring_state["active"],
        "session_id": monitoring_state.get("session_id"),
        "interface": monitoring_state.get("interface"),
        "start_time": monitoring_state.get("start_time"),
        "duration": monitoring_state.get("duration"),
        "stats": monitoring_state["stats"],
        "threats_count": len(detected_threats)
    }


# ============================================================================
# API Endpoints - v1 Format (original endpoints)
# ============================================================================

@app.post("/api/v1/analyze-pcap", response_model=AnalysisResponse)
async def analyze_pcap_v1(
    file: UploadFile = File(...),
    model_type: str = "nfstream",
    max_flows: Optional[int] = None,
    batch_size: int = 5000,
    background_tasks: BackgroundTasks = None
):
    """Analyze PCAP file (v1 endpoint with file upload)."""
    if analyzer is None:
        raise HTTPException(status_code=503, detail="AI analyzer not loaded")
    
    start_time = datetime.utcnow()
    analysis_id = str(uuid.uuid4())
    tmp_path = None
    
    try:
        if not file.filename.endswith(('.pcap', '.pcapng', '.cap')):
            raise HTTPException(
                status_code=400,
                detail="Invalid file type. Expected .pcap, .pcapng, or .cap"
            )
        
        tmp_path = Path(tempfile.gettempdir()) / f"{analysis_id}_{file.filename}"
        
        file_size = 0
        chunk_size = 1024 * 1024
        
        print(f"Receiving PCAP file: {file.filename}...")
        with open(tmp_path, "wb") as f:
            while True:
                chunk = await file.read(chunk_size)
                if not chunk:
                    break
                f.write(chunk)
                file_size += len(chunk)
        
        file_size_mb = file_size / (1024**2)
        print(f"Processing PCAP: {file.filename} ({file_size_mb:.2f} MB)")
        
        results = analyzer.analyze_pcap(
            tmp_path,
            model_type='nfstream',
            max_flows=max_flows,
            batch_size=batch_size,
            save_results=False
        )
        
        if results['status'] != 'success':
            raise HTTPException(status_code=400, detail=results.get('message', 'Analysis failed'))
        
        processing_time = (datetime.utcnow() - start_time).total_seconds()
        
        if tmp_path and tmp_path.exists():
            background_tasks.add_task(lambda: tmp_path.unlink() if tmp_path.exists() else None)
        
        return AnalysisResponse(
            status="success",
            total_flows=results['total_flows'],
            threats_detected=results['threat_detected'],
            summary=results['summary'],
            analysis_id=analysis_id,
            processing_time=processing_time
        )
        
    except HTTPException:
        raise
    except Exception as e:
        if tmp_path and tmp_path.exists():
            try:
                tmp_path.unlink()
            except:
                pass
        
        print(f"Error analyzing PCAP: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to analyze PCAP: {str(e)}")


@app.get("/api/v1/stats")
async def get_stats_v1():
    """Get service statistics (v1 endpoint)."""
    return {
        "analyzer_loaded": analyzer is not None,
        "model_loaded": predictor is not None,
        "extractor_available": analyzer is not None and analyzer.extractor.nfstream_available,
        "supported_formats": [".pcap", ".pcapng", ".cap"],
        "model_type": "NFStream Robust Binary (BENIGN vs ATTACK)",
        "model_accuracy": "77.10%",
        "monitoring_active": monitoring_state["active"]
    }


@app.get("/api/v1/interfaces")
async def get_interfaces_v1():
    """Get available network interfaces."""
    try:
        interfaces = get_network_interfaces()
        
        return {
            "interfaces": [
                {"name": iface['display'], "device": iface['name'], "status": "active"}
                for iface in interfaces
            ],
            "count": len(interfaces)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get interfaces: {str(e)}")


# ============================================================================
# Main Entry Point
# ============================================================================

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    print(f"\n{'='*60}")
    print("NETWORK THREAT DETECTION AI SERVICE")
    print(f"{'='*60}")
    print(f"Starting on http://0.0.0.0:{port}")
    print(f"Webhook endpoint: {WEBHOOK_ENDPOINT}")
    print(f"Results directory: {RESULTS_DIR}")
    print(f"{'='*60}\n")
    
    uvicorn.run(app, host="0.0.0.0", port=port)
