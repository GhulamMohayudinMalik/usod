# 🤖 AI Service - Enhancement & Refactoring Guide

**Directory:** `/ai`  
**Purpose:** Python-based AI/ML service for network threat detection  
**Status:** 🟡 Partially Complete - Needs Service Startup & Integration  
**Last Updated:** October 23, 2025

---

## 📋 TABLE OF CONTENTS

1. [Current Architecture](#current-architecture)
2. [Directory Structure](#directory-structure)
3. [Data Flow](#data-flow)
4. [Current Issues](#current-issues)
5. [Enhancement Roadmap](#enhancement-roadmap)
6. [How to Refactor](#how-to-refactor)
7. [Testing Guide](#testing-guide)
8. [Integration Points](#integration-points)

---

## 🏗️ CURRENT ARCHITECTURE

### Tech Stack
- **Framework:** FastAPI (Python 3.9+)
- **ML Models:** scikit-learn (Random Forest, Isolation Forest)
- **Packet Capture:** Scapy, PyShark
- **Dataset:** CICIDS2017 (8 CSV files, ~2GB)
- **API:** REST API on port 8000
- **Communication:** HTTP webhooks to Node.js backend (port 5000)

### Service Components

```
┌─────────────────────────────────────────────────────────────┐
│                   AI SERVICE (FastAPI)                      │
│                     Port: 8000                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐         ┌──────────────────┐         │
│  │  main.py        │────────▶│  API Endpoints   │         │
│  │  (Server Entry) │         │  /start-capture  │         │
│  └─────────────────┘         │  /stop-capture   │         │
│                              │  /analyze-pcap   │         │
│                              │  /threats        │         │
│                              └──────────────────┘         │
│                                      │                     │
│                                      ▼                     │
│  ┌──────────────────────────────────────────────┐         │
│  │         DETECTION SERVICES                   │         │
│  │  ┌────────────────┐  ┌────────────────────┐ │         │
│  │  │ simple_detector│  │ real_time_detector │ │         │
│  │  │  (Mock/Test)   │  │  (Full ML)         │ │         │
│  │  └────────────────┘  └────────────────────┘ │         │
│  └──────────────────────────────────────────────┘         │
│                        │                                   │
│                        ▼                                   │
│  ┌──────────────────────────────────────────────┐         │
│  │           CAPTURE LAYER                      │         │
│  │  ┌────────────────┐  ┌──────────────────┐   │         │
│  │  │packet_capture  │  │ flow_extractor   │   │         │
│  │  │  (Scapy)       │──│ (Flow analysis)  │   │         │
│  │  └────────────────┘  └──────────────────┘   │         │
│  │           │                   │              │         │
│  │           └───────┬───────────┘              │         │
│  │                   ▼                          │         │
│  │          ┌──────────────────┐                │         │
│  │          │  preprocessor    │                │         │
│  │          │  (Feature Eng)   │                │         │
│  │          └──────────────────┘                │         │
│  └──────────────────────────────────────────────┘         │
│                        │                                   │
│                        ▼                                   │
│  ┌──────────────────────────────────────────────┐         │
│  │            ML MODELS                         │         │
│  │  ┌────────────────────┐  ┌────────────────┐ │         │
│  │  │ intrusion_detector │  │anomaly_detector│ │         │
│  │  │ (Random Forest)    │  │(Isolation Frst)│ │         │
│  │  │ Accuracy: ~95%     │  │For Zero-days   │ │         │
│  │  └────────────────────┘  └────────────────┘ │         │
│  └──────────────────────────────────────────────┘         │
│                        │                                   │
│                        ▼                                   │
│              ┌──────────────────┐                         │
│              │  Threat Results  │                         │
│              └──────────────────┘                         │
└─────────────────────┬───────────────────────────────────────┘
                      │ HTTP Webhook
                      ▼
          ┌───────────────────────┐
          │  Node.js Backend      │
          │  Port: 5000           │
          │  /api/network/webhook │
          └───────────────────────┘
```

---

## 📁 DIRECTORY STRUCTURE

```
ai/
├── main.py                    # ⭐ FastAPI server entry point
├── requirements.txt           # Python dependencies
├── model_training_fast.py     # ML model training script
│
├── capture/                   # 📡 Packet capture layer
│   ├── packet_capture.py      # Scapy-based packet sniffing
│   ├── flow_extractor.py      # Convert packets to network flows
│   └── preprocessor.py        # Feature preprocessing
│
├── models/                    # 🧠 ML model implementations
│   ├── intrusion_detector.py  # Random Forest classifier
│   ├── anomaly_detector.py    # Isolation Forest for anomalies
│   └── model_trainer.py       # Training utilities
│
├── services/                  # 🔍 Detection services
│   ├── simple_detector.py     # Mock detector (no admin needed)
│   └── real_time_detector.py  # Full real-time detection
│
├── utils/                     # 🛠️ Utility modules
│   ├── pcap_parser.py         # Parse PCAP files
│   ├── feature_builder.py     # Extract network features
│   └── cicids2017_loader.py   # Load CICIDS2017 dataset
│
├── data/                      # 💾 Data and trained models
│   ├── raw/                   # CICIDS2017 CSV files (8 files)
│   ├── processed/             # Trained models & preprocessed data
│   │   ├── random_forest_model.pkl
│   │   ├── isolation_forest_model.pkl
│   │   ├── scaler.pkl
│   │   ├── label_encoder.pkl
│   │   └── *.csv (train/test/val splits)
│   └── README.md
│
├── README.md                  # Main documentation
├── TECHNICAL_OVERVIEW.md      # Technical details
├── INTEGRATION_GUIDE.md       # Backend integration guide
├── FUTURE_ENHANCEMENTS.md     # Planned features
└── ENHANCEMENT.md             # This file
```

---

## 🔄 DATA FLOW

### 1. Real-time Network Monitoring Flow

```
User Action (Frontend/Backend)
        │
        ▼
POST /start-capture
  ├─ interface: "eth0"
  ├─ duration: 60
  └─ filter: "tcp"
        │
        ▼
┌──────────────────────────┐
│  Packet Capture Thread  │
│  (Scapy sniffing)        │
└──────────────────────────┘
        │ Raw packets
        ▼
┌──────────────────────────┐
│   Flow Extractor         │
│   (Group by 5-tuple)     │
│   - src_ip, dst_ip       │
│   - src_port, dst_port   │
│   - protocol             │
└──────────────────────────┘
        │ Network flows
        ▼
┌──────────────────────────┐
│   Feature Engineering    │
│   (Extract 79 features)  │
│   - Duration, bytes      │
│   - Packet statistics    │
│   - Flag distributions   │
└──────────────────────────┘
        │ Feature vectors
        ▼
┌──────────────────────────┐
│   Preprocessing          │
│   - Normalize values     │
│   - Handle missing data  │
│   - Apply scaling        │
└──────────────────────────┘
        │ Processed features
        ▼
┌──────────────────────────────────────┐
│          ML Models                   │
│  ┌────────────────┐ ┌──────────────┐│
│  │ Random Forest  │ │ Iso. Forest  ││
│  │ (Multi-class)  │ │ (Anomaly)    ││
│  │ Threat Type    │ │ Normal/Anom  ││
│  └────────────────┘ └──────────────┘│
└──────────────────────────────────────┘
        │ Predictions
        ▼
┌──────────────────────────┐
│  Threat Classification   │
│  - DoS/DDoS             │
│  - PortScan             │
│  - Web Attack           │
│  - Infiltration         │
│  - Bot/Brute Force      │
└──────────────────────────┘
        │ Threat objects
        ▼
┌──────────────────────────┐
│  HTTP Webhook            │
│  POST /api/network/      │
│       webhook            │
│  ├─ threat_id           │
│  ├─ threat_type         │
│  ├─ severity            │
│  └─ confidence          │
└──────────────────────────┘
        │
        ▼
Node.js Backend (Port 5000)
        │
        ├─ Save to MongoDB
        ├─ Log to Blockchain
        └─ Emit SSE to Frontend
```

### 2. PCAP File Analysis Flow

```
User Upload PCAP file
        │
        ▼
POST /analyze-pcap
  ├─ file: pcap binary
  └─ model: "all"
        │
        ▼
┌──────────────────────────┐
│   PCAP Parser            │
│   (pyshark/scapy)        │
│   Read all packets       │
└──────────────────────────┘
        │
        ▼
┌──────────────────────────┐
│   Flow Extraction        │
│   (Same as real-time)    │
└──────────────────────────┘
        │
        ▼
┌──────────────────────────┐
│   Batch Processing       │
│   Process all flows      │
│   at once                │
└──────────────────────────┘
        │
        ▼
┌──────────────────────────┐
│   ML Prediction          │
│   (Vectorized)           │
└──────────────────────────┘
        │
        ▼
Return analysis results
  ├─ Total packets
  ├─ Detected threats
  ├─ Threat breakdown
  └─ Timeline
```

---

## 🚨 CURRENT ISSUES

### Critical Issues (Must Fix)

1. **❌ Service Not Running**
   - **Problem:** FastAPI service needs manual startup
   - **Impact:** Backend cannot communicate with AI service
   - **Priority:** P0 - Blocking
   - **Fix:** Run `python main.py` or `uvicorn main:app --reload`

2. **⚠️ Admin Privileges Required**
   - **Problem:** Raw packet capture requires administrator rights
   - **Impact:** Cannot capture on Windows without elevation
   - **Priority:** P1 - High
   - **Workaround:** SimpleDetector provides mock data for testing

3. **🐛 Simple vs Real Detector Confusion**
   - **Problem:** Two detector implementations, unclear which is active
   - **Impact:** May use mock data when real detection expected
   - **Priority:** P2 - Medium
   - **Fix:** Add clear environment variable or config

### Performance Issues

4. **⏱️ Real-time Processing Latency**
   - **Problem:** Flow extraction can lag for high packet rates
   - **Impact:** Delays in threat detection (5-10s latency)
   - **Priority:** P2 - Medium
   - **Fix:** Implement packet buffering and async processing

5. **💾 Memory Usage for Large PCAPs**
   - **Problem:** Loading entire PCAP into memory
   - **Impact:** Out of memory for files >500MB
   - **Priority:** P2 - Medium
   - **Fix:** Stream PCAP processing, process in chunks

### Integration Issues

6. **🔗 No Persistent Connection**
   - **Problem:** Backend must poll or wait for webhooks
   - **Impact:** No real-time streaming of threats
   - **Priority:** P2 - Medium
   - **Fix:** Implement WebSocket or SSE from AI service

7. **📝 Incomplete Error Handling**
   - **Problem:** Silent failures in packet capture thread
   - **Impact:** Monitoring appears active but no detection
   - **Priority:** P1 - High
   - **Fix:** Add comprehensive logging and error callbacks

---

## 🚀 ENHANCEMENT ROADMAP

### Phase 1: Make It Work (1-2 days)

**Goal:** Get AI service running and integrated

- [ ] **Start the AI Service**
  ```bash
  cd ai
  pip install -r requirements.txt
  python main.py
  # Or: uvicorn main:app --host 0.0.0.0 --port 8000 --reload
  ```

- [ ] **Test Health Endpoint**
  ```bash
  curl http://localhost:8000/health
  ```

- [ ] **Test Backend Integration**
  ```bash
  # From Node.js backend
  POST /api/network/test-connection
  ```

- [ ] **Verify Webhook Communication**
  - Start monitoring from backend
  - Check if threats appear in MongoDB
  - Verify blockchain logging

- [ ] **Fix SimpleDetector Mode**
  - Ensure it works without admin privileges
  - Generate realistic mock threats
  - Proper timing and intervals

### Phase 2: Improve Reliability (2-3 days)

**Goal:** Handle errors gracefully, improve logging

- [ ] **Add Comprehensive Logging**
  ```python
  # Replace print() with proper logging
  import logging
  logger = logging.getLogger(__name__)
  logger.info("Packet captured")
  logger.error("Failed to process flow", exc_info=True)
  ```

- [ ] **Implement Health Checks**
  - Check if models are loaded
  - Verify packet capture capability
  - Test Node.js backend connectivity

- [ ] **Add Configuration File**
  ```python
  # config.py
  class Settings(BaseSettings):
      backend_url: str = "http://localhost:5000"
      capture_interface: str = "eth0"
      model_path: str = "./data/processed"
      use_mock_detector: bool = False
  ```

- [ ] **Graceful Degradation**
  - Fall back to mock detector if real capture fails
  - Continue with one model if other fails
  - Return partial results instead of complete failure

### Phase 3: Optimize Performance (3-5 days)

**Goal:** Reduce latency, handle high traffic

- [ ] **Asynchronous Processing**
  ```python
  import asyncio
  from queue import Queue
  
  packet_queue = Queue(maxsize=10000)
  
  async def process_packets():
      while True:
          batch = []
          for _ in range(100):  # Process in batches
              if not packet_queue.empty():
                  batch.append(packet_queue.get())
          if batch:
              await process_batch(batch)
          await asyncio.sleep(0.1)
  ```

- [ ] **Caching and Memoization**
  - Cache feature extraction results
  - Memoize model predictions for identical flows
  - Use LRU cache for recent IPs

- [ ] **Streaming PCAP Processing**
  ```python
  def process_pcap_streaming(filepath, chunk_size=1000):
      with PcapReader(filepath) as pcap:
          chunk = []
          for packet in pcap:
              chunk.append(packet)
              if len(chunk) >= chunk_size:
                  yield process_chunk(chunk)
                  chunk = []
          if chunk:
              yield process_chunk(chunk)
  ```

- [ ] **Parallel Model Execution**
  ```python
  from concurrent.futures import ThreadPoolExecutor
  
  with ThreadPoolExecutor(max_workers=2) as executor:
      rf_future = executor.submit(rf_model.predict, features)
      if_future = executor.submit(if_model.predict, features)
      rf_result = rf_future.result()
      if_result = if_future.result()
  ```

### Phase 4: Advanced Features (1-2 weeks)

**Goal:** Add new capabilities, improve accuracy

- [ ] **Deep Learning Models**
  - Implement LSTM for sequence analysis
  - CNN for packet payload inspection
  - Ensemble voting mechanism

- [ ] **Real-time Model Updates**
  - Online learning capabilities
  - Periodic retraining with new data
  - A/B testing for model versions

- [ ] **Advanced Attack Detection**
  - Malware C&C communication (Priority B)
  - Encrypted traffic analysis
  - Application-layer attacks

- [ ] **Threat Intelligence Integration**
  - IP reputation databases
  - Known malicious signatures
  - Threat feeds (MISP, STIX/TAXII)

- [ ] **Explainable AI**
  - SHAP values for feature importance
  - Attack narratives (why this is a threat)
  - Confidence scores breakdown

---

## 🔧 HOW TO REFACTOR

### 1. Improve Code Structure

**Current Issue:** Mixed concerns, unclear separation

**Refactoring Steps:**

```python
# ❌ BEFORE: Everything in one file
def start_detection(interface):
    packets = capture_packets(interface)
    flows = extract_flows(packets)
    features = build_features(flows)
    predictions = model.predict(features)
    send_webhook(predictions)

# ✅ AFTER: Separate concerns

# services/packet_service.py
class PacketService:
    def capture(self, interface: str) -> Iterator[Packet]:
        """Yields packets from interface"""
        ...

# services/flow_service.py
class FlowService:
    def extract_flows(self, packets: Iterator[Packet]) -> List[Flow]:
        """Converts packets to flows"""
        ...

# services/feature_service.py
class FeatureService:
    def build_features(self, flows: List[Flow]) -> np.ndarray:
        """Extracts ML features from flows"""
        ...

# services/ml_service.py
class MLService:
    def predict(self, features: np.ndarray) -> List[Threat]:
        """Runs ML models and returns threats"""
        ...

# services/webhook_service.py
class WebhookService:
    async def send_threats(self, threats: List[Threat]):
        """Sends threats to backend"""
        ...

# main.py - Orchestrate services
@app.post("/start-capture")
async def start_capture(request: CaptureRequest):
    packets = packet_service.capture(request.interface)
    flows = flow_service.extract_flows(packets)
    features = feature_service.build_features(flows)
    threats = ml_service.predict(features)
    await webhook_service.send_threats(threats)
```

### 2. Add Dependency Injection

**Problem:** Hard-coded dependencies, difficult to test

```python
# ❌ BEFORE
class ThreatDetector:
    def __init__(self):
        self.model = load_model("path/to/model.pkl")  # Hard-coded

# ✅ AFTER
class ThreatDetector:
    def __init__(self, model_loader: ModelLoader):
        self.model_loader = model_loader
        self.model = None
    
    async def initialize(self):
        self.model = await self.model_loader.load()

# Dependency injection container
class ServiceContainer:
    def __init__(self, config: Settings):
        self.config = config
        self.model_loader = ModelLoader(config.model_path)
        self.threat_detector = ThreatDetector(self.model_loader)
    
    async def initialize_all(self):
        await self.threat_detector.initialize()
```

### 3. Implement Repository Pattern

**Problem:** Direct model file access scattered everywhere

```python
# ✅ GOOD: Repository pattern
class ModelRepository:
    def __init__(self, base_path: str):
        self.base_path = Path(base_path)
    
    def load_random_forest(self) -> RandomForestClassifier:
        path = self.base_path / "random_forest_model.pkl"
        with open(path, 'rb') as f:
            return pickle.load(f)
    
    def load_isolation_forest(self) -> IsolationForest:
        path = self.base_path / "isolation_forest_model.pkl"
        with open(path, 'rb') as f:
            return pickle.load(f)
    
    def save_model(self, model, name: str):
        path = self.base_path / f"{name}.pkl"
        with open(path, 'wb') as f:
            pickle.dump(model, f)
```

### 4. Add Type Hints and Validation

**Problem:** No type safety, runtime errors

```python
# ✅ GOOD: Strong typing
from typing import List, Optional, Tuple
from pydantic import BaseModel, validator

class NetworkFlow(BaseModel):
    src_ip: str
    dst_ip: str
    src_port: int
    dst_port: int
    protocol: str
    duration: float
    total_bytes: int
    
    @validator('src_port', 'dst_port')
    def validate_port(cls, v):
        if not 0 <= v <= 65535:
            raise ValueError('Port must be 0-65535')
        return v

class ThreatPrediction(BaseModel):
    threat_id: str
    threat_type: str
    confidence: float
    flow: NetworkFlow
    timestamp: datetime
    
    @validator('confidence')
    def validate_confidence(cls, v):
        if not 0.0 <= v <= 1.0:
            raise ValueError('Confidence must be 0.0-1.0')
        return v
```

### 5. Error Handling Strategy

**Problem:** Silent failures, unclear error states

```python
# ✅ GOOD: Custom exceptions and proper handling
class AIServiceException(Exception):
    """Base exception for AI service"""
    pass

class PacketCaptureError(AIServiceException):
    """Raised when packet capture fails"""
    pass

class ModelLoadError(AIServiceException):
    """Raised when model loading fails"""
    pass

class FeatureExtractionError(AIServiceException):
    """Raised during feature extraction"""
    pass

# Usage
@app.post("/start-capture")
async def start_capture(request: CaptureRequest):
    try:
        result = await detector.start(request.interface)
        return {"status": "started", "session_id": result.session_id}
    except PacketCaptureError as e:
        logger.error(f"Capture failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to start packet capture: {str(e)}"
        )
    except ModelLoadError as e:
        logger.error(f"Model load failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=503,
            detail="AI models not available. Please try again later."
        )
```

---

## 🧪 TESTING GUIDE

### Unit Tests

```python
# tests/test_flow_extractor.py
import pytest
from capture.flow_extractor import FlowExtractor
from scapy.all import IP, TCP

def test_flow_extraction():
    extractor = FlowExtractor()
    
    # Create mock packets
    pkt1 = IP(src="192.168.1.1", dst="10.0.0.1")/TCP(sport=12345, dport=80)
    pkt2 = IP(src="10.0.0.1", dst="192.168.1.1")/TCP(sport=80, dport=12345)
    
    flows = extractor.extract([pkt1, pkt2])
    
    assert len(flows) == 1
    assert flows[0].src_ip == "192.168.1.1"
    assert flows[0].packet_count == 2

# tests/test_ml_service.py
def test_threat_prediction():
    ml_service = MLService(mock_model=True)
    
    features = np.array([[1.0, 2.0, 3.0, ...]])  # Mock features
    predictions = ml_service.predict(features)
    
    assert len(predictions) > 0
    assert 0.0 <= predictions[0].confidence <= 1.0
```

### Integration Tests

```python
# tests/test_api_integration.py
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_start_capture():
    response = client.post("/start-capture", json={
        "interface": "eth0",
        "duration": 10
    })
    assert response.status_code == 200
    assert "session_id" in response.json()

def test_analyze_pcap():
    with open("test.pcap", "rb") as f:
        response = client.post(
            "/analyze-pcap",
            files={"file": ("test.pcap", f, "application/octet-stream")}
        )
    assert response.status_code == 200
    assert "threats" in response.json()
```

### Manual Testing Steps

1. **Test Service Startup**
   ```bash
   cd ai
   python main.py
   # Should see: "Uvicorn running on http://0.0.0.0:8000"
   ```

2. **Test Health Endpoint**
   ```bash
   curl http://localhost:8000/health
   # Should return: {"status": "healthy", ...}
   ```

3. **Test Simple Detector**
   ```bash
   curl -X POST http://localhost:8000/start-capture \
     -H "Content-Type: application/json" \
     -d '{"interface": "any", "duration": 30}'
   
   # Wait 10 seconds, then:
   curl http://localhost:8000/threats
   ```

4. **Test Backend Integration**
   ```bash
   # Start Node.js backend first
   cd ../backend
   npm start
   
   # Then test from backend
   curl -X POST http://localhost:5000/api/network/start-monitoring
   
   # Check threats
   curl http://localhost:5000/api/network/threats
   ```

---

## 🔗 INTEGRATION POINTS

### 1. Backend API (Node.js)

**Backend expects AI service at:** `http://localhost:8000`

**Key Endpoints Backend Calls:**
- `GET /health` - Check if AI service is running
- `POST /start-capture` - Begin network monitoring
- `POST /stop-capture` - End monitoring session
- `POST /analyze-pcap` - Analyze uploaded PCAP file
- `GET /threats` - Retrieve detected threats
- `GET /statistics` - Get monitoring statistics

**Webhook from AI to Backend:**
- `POST /api/network/webhook` - AI sends detected threats here

### 2. Environment Variables

Create `.env` file in `ai/` directory:

```env
# AI Service Configuration
FASTAPI_HOST=0.0.0.0
FASTAPI_PORT=8000
LOG_LEVEL=INFO

# Backend Integration
NODEJS_BACKEND_URL=http://localhost:5000
WEBHOOK_ENDPOINT=/api/network/webhook
WEBHOOK_RETRY_COUNT=3
WEBHOOK_TIMEOUT=10

# Detection Configuration
USE_MOCK_DETECTOR=false
REQUIRE_ADMIN_PRIVILEGES=true
DEFAULT_CAPTURE_INTERFACE=eth0
DEFAULT_CAPTURE_DURATION=3600

# Model Configuration
MODEL_PATH=./data/processed
RANDOM_FOREST_MODEL=random_forest_model.pkl
ISOLATION_FOREST_MODEL=isolation_forest_model.pkl
SCALER_MODEL=scaler.pkl
LABEL_ENCODER=label_encoder.pkl

# Performance
MAX_PACKET_BUFFER=10000
FLOW_TIMEOUT_SECONDS=120
BATCH_PROCESSING_SIZE=100
MAX_CONCURRENT_ANALYSES=3
```

### 3. Data Models Alignment

Ensure data models match between AI service and backend:

```python
# AI Service sends this format
{
    "threat_id": "THREAT_20251023_001",
    "threat_type": "DoS",  # DoS, DDoS, PortScan, WebAttack, etc.
    "severity": "high",     # low, medium, high, critical
    "source_ip": "192.168.1.100",
    "destination_ip": "10.0.0.1",
    "source_port": 12345,
    "destination_port": 80,
    "protocol": "TCP",
    "confidence": 0.95,
    "timestamp": "2025-10-23T10:30:00Z",
    "details": {
        "packet_count": 1500,
        "total_bytes": 75000,
        "duration": 5.2,
        "flags": ["SYN", "ACK"],
        "model_used": "random_forest"
    }
}
```

---

## 📝 QUICK START CHECKLIST

Before you start refactoring:

- [ ] Backup current working code
- [ ] Create a new branch: `git checkout -b ai-service-refactor`
- [ ] Install dependencies: `pip install -r requirements.txt`
- [ ] Verify models exist in `data/processed/`
- [ ] Test current functionality to establish baseline
- [ ] Document any breaking changes
- [ ] Update API documentation after changes
- [ ] Run all tests before committing
- [ ] Update this ENHANCEMENT.md with new findings

---

## 🎯 PRIORITY ACTIONS (Next Steps)

1. **START THE SERVICE** ⭐⭐⭐
   ```bash
   cd ai
   python main.py
   ```

2. **Test Basic Functionality** ⭐⭐
   - Health check
   - Simple detector mode
   - Backend communication

3. **Fix Admin Privilege Issue** ⭐⭐
   - Make SimpleDetector default for testing
   - Clear documentation on when real capture needed

4. **Add Proper Logging** ⭐
   - Replace prints with structured logging
   - Add log rotation
   - Separate log levels

5. **Create Startup Script**
   ```powershell
   # start-ai-service.ps1
   Write-Host "Starting AI Service..."
   cd ai
   python -m venv venv
   .\venv\Scripts\Activate.ps1
   pip install -r requirements.txt
   python main.py
   ```

---

**Last Updated:** October 23, 2025  
**Status:** Ready for refactoring  
**Next Review:** After service is running and tested

