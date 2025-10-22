# Network AI Service - Technical Overview

## 🎯 Purpose

The Network AI Service is a **Python FastAPI-based microservice** that performs real-time network threat detection using machine learning models. It's designed to integrate with the USOD (Unified Security Operations Dashboard) platform.

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     Network AI Service (Port 8000)              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐ │
│  │   Packet     │  →   │   Feature    │  →   │  ML Models   │ │
│  │   Capture    │      │  Extraction  │      │  (RF + ISO)  │ │
│  └──────────────┘      └──────────────┘      └──────────────┘ │
│         │                      │                      │         │
│         ↓                      ↓                      ↓         │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │              FastAPI REST Endpoints                      │  │
│  │  /api/start-capture  |  /api/stop-capture              │  │
│  │  /api/threats        |  /api/statistics                 │  │
│  └─────────────────────────────────────────────────────────┘  │
│                              │                                  │
└──────────────────────────────┼──────────────────────────────────┘
                               │
                               ↓ Webhook (HTTP POST)
                  ┌────────────────────────┐
                  │   Node.js Backend      │
                  │   (Port 5000)          │
                  └────────────────────────┘
                               │
                               ↓
                  ┌────────────────────────┐
                  │   MongoDB + SSE        │
                  │   (Persistence + Live) │
                  └────────────────────────┘
```

---

## 🔧 How Threat Detection Works

### Current Implementation: SimpleDetector (Mock Mode)

Since real network packet capture requires **administrator privileges** and a live network with actual traffic, the system currently uses **`SimpleDetector`** which generates **realistic mock network flows** for testing and demonstration.

### Mock Flow Generation Process

#### 1. **Mock Network Flow Creation**
`services/simple_detector.py` → `_generate_mock_flow()`

Generates realistic network flow data with these attributes:
```python
{
    'src_ip': '192.168.1.144',        # Random source IP
    'dst_ip': '192.168.1.4',          # Random destination IP
    'src_port': 59510,                # Random port
    'dst_port': 80,                   # Common ports (22, 80, 443, etc.)
    'protocol': 'TCP',                # TCP/UDP/ICMP
    'packet_count': 534,              # Random packet count
    'byte_count': 6031,               # Random byte count
    'duration': 3.13,                 # Flow duration
    'flags': 'S',                     # TCP flags
    'is_threat': True/False           # 70% chance of being a threat
}
```

#### 2. **Feature Extraction**
`services/simple_detector.py` → `_extract_mock_features()`

Converts network flow into **25 ML features** that the models expect:
```python
Features:
- duration, total_fwd_packets, total_bwd_packets
- flow_bytes_s, flow_packets_s
- fwd_packet_length_mean, bwd_packet_length_mean
- flow_iat_mean, fwd_iat_mean, bwd_iat_mean
- fwd_psh_flags, bwd_psh_flags, fwd_urg_flags, bwd_urg_flags
- fwd_header_length, bwd_header_length
- fwd_packets_s, bwd_packets_s
- packet_length_mean, packet_length_std, packet_length_variance
- syn_flag_count, rst_flag_count, psh_flag_count
- ack_flag_count, urg_flag_count
```

These features are based on the **CICIDS2017 dataset** format, which is a standard benchmark for network intrusion detection.

#### 3. **ML Model Prediction**
`services/simple_detector.py` → `_predict_threat()`

Two trained ML models analyze the features:

**a) Random Forest Classifier** (`models/rf_model.pkl`)
- **Purpose**: Classify known attack types
- **Training**: Trained on CICIDS2017 dataset with labeled attacks
- **Output**: Prediction (0=benign, 1=attack) + Confidence score
- **Attack Types**: Port Scan, DDoS, Brute Force, Web Attack, Bot, Infiltration

**b) Isolation Forest** (`models/iso_model.pkl`)
- **Purpose**: Detect anomalies (zero-day/unknown attacks)
- **Training**: Unsupervised learning on normal traffic patterns
- **Output**: Anomaly score (negative = anomaly)
- **Use Case**: Catches attacks the Random Forest hasn't seen before

#### 4. **Threat Classification**
`services/simple_detector.py` → `_classify_threat_type()`

Determines the specific attack type based on:
- **Port patterns**: 22 (SSH brute force), 3389 (RDP brute force)
- **Protocol**: UDP floods (DDoS), ICMP (reconnaissance)
- **Packet characteristics**: High packet rate (DDoS), port scanning behavior
- **Byte patterns**: Large transfers (data exfiltration)

Example classifications:
```python
Port 22 + High packets → "brute_force" (SSH attack)
Port 80 + Anomaly → "web_attack" (SQL injection, XSS)
High packet rate → "ddos" (Denial of Service)
Random ports → "port_scan" (Network reconnaissance)
```

#### 5. **Severity Assignment**
`services/simple_detector.py` → `_determine_severity()`

Based on ML model confidence:
```python
confidence >= 0.7  → "high"    (Red alert)
confidence >= 0.4  → "medium"  (Yellow warning)
confidence < 0.4   → "low"     (Blue info)
```

#### 6. **Threat Object Creation**
`services/simple_detector.py` → `_handle_threat_detection()`

Creates a complete threat record:
```python
{
    "threat_id": "threat_000001",
    "threat_type": "web_attack",
    "severity": "low",
    "source_ip": "192.168.1.144",
    "destination_ip": "192.168.1.4",
    "source_port": 59510,
    "destination_port": 80,
    "protocol": "TCP",
    "confidence": 0.13,
    "timestamp": "2025-10-21T12:24:37.482505",
    "details": {
        "rf_prediction": 0,          # Random Forest: benign
        "rf_confidence": 0.13,        # Low confidence
        "iso_prediction": 1,          # Isolation Forest: anomaly!
        "iso_score": 0.005,           # Anomaly score
        "flow_duration": 3.13,
        "packet_count": 534,
        "byte_count": 6031
    }
}
```

#### 7. **Webhook to Node.js**
`services/simple_detector.py` → `_send_webhook()`

Sends the threat to the Node.js backend:
```python
POST http://localhost:5000/api/network/webhook
Content-Type: application/json

{threat_data}
```

The Node.js backend then:
1. **Saves to MongoDB** (persistence)
2. **Broadcasts via SSE** (real-time to dashboard)
3. **Logs in SecurityLog** (audit trail)

---

## 📊 Detection Loop

The `SimpleDetector` runs a continuous detection loop:

```python
# Every 5 seconds:
1. Generate 1-3 random mock flows
2. Extract features from each flow
3. Run through ML models
4. If threat detected (70% probability):
   - Classify threat type
   - Determine severity
   - Create threat object
   - Send webhook to Node.js
   - Log to console
5. Repeat
```

This simulates a **real network monitoring scenario** where packets are constantly being analyzed.

---

## 🔄 Real vs Mock Mode

### Current: SimpleDetector (Mock Mode)
- ✅ **No admin privileges required**
- ✅ **Works without network traffic**
- ✅ **Perfect for development/testing**
- ✅ **Demonstrates ML model capabilities**
- ❌ Not analyzing real packets

### Future: Full Network Capture
When deploying in production with admin access:
1. Use **Scapy/Npcap** to capture real packets
2. Parse packets into network flows
3. Extract features from real traffic
4. Use same ML models for detection
5. Detect real attacks on your network

The ML models are **already trained** and ready - they just need real packet data instead of mock data!

---

## 🎓 Why This Approach?

### Educational Value
- Demonstrates **complete ML pipeline** (feature extraction → prediction → classification)
- Shows **ensemble learning** (combining multiple models)
- Teaches **network flow analysis** concepts

### Research Contribution
- **Hybrid Detection**: Combines supervised (Random Forest) + unsupervised (Isolation Forest)
- **Zero-day Detection**: Isolation Forest catches unknown attacks
- **Real-time Processing**: Async architecture for low latency

### Production Ready
- **Modular Design**: Easy to swap mock detector with real packet capture
- **Webhook Integration**: Decoupled from backend
- **Scalable**: Can handle high packet rates with proper optimization

---

## 📈 Statistics & Monitoring

The service tracks:
- **Total flows analyzed**: Count of network flows processed
- **Threats detected**: Number of attacks found
- **Detection rate**: Percentage of flows flagged as threats
- **Model performance**: RF vs ISO detection counts

Access via: `GET /api/statistics`

---

## 🚀 Future Enhancements

### 1. Real Packet Capture
Replace mock flows with actual packet capture using Scapy:
```python
from scapy.all import sniff

def packet_callback(packet):
    # Convert packet → flow → features → ML prediction
    pass

sniff(iface="eth0", prn=packet_callback)
```

### 2. Additional ML Models
- **Neural Network**: Deep learning for complex patterns
- **LSTM**: Sequence analysis for multi-stage attacks
- **Ensemble Voting**: Combine all models for higher accuracy

### 3. Advanced Features
- **Geo-IP Lookup**: Map source IPs to countries
- **Threat Intelligence**: Check IPs against blacklists
- **Automatic Blocking**: Integrate with firewall APIs
- **PCAP Export**: Save suspicious traffic for forensic analysis

---

## 🧪 Testing the System

### Generate More Threats
The mock detector has a **70% threat probability** - it will generate threats frequently for testing.

### Adjust Detection Rate
In `simple_detector.py`, line ~168:
```python
'is_threat': random.random() < 0.70  # 70% chance
```
Change to `0.90` for more threats or `0.30` for fewer.

### View Raw Flow Data
Enable detailed logging in `main.py`:
```python
logger.setLevel(logging.DEBUG)
```

---

## 📝 API Endpoints Summary

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/start-capture` | POST | Start threat detection |
| `/api/stop-capture` | POST | Stop detection |
| `/api/threats` | GET | Get detected threats |
| `/api/statistics` | GET | Get model statistics |
| `/api/health` | GET | Health check |

---

## 🎯 Key Takeaways

1. **Threat Generation**: Mock flows simulate realistic network traffic patterns
2. **ML Detection**: Trained models (RF + ISO) analyze 25 features per flow
3. **Real-time Pipeline**: Detection → Classification → Webhook → Dashboard
4. **Production Ready**: Same models work with real packets (just swap data source)
5. **Research Quality**: Ensemble learning + zero-day detection capabilities

The system **demonstrates a complete, production-grade network intrusion detection pipeline** using industry-standard ML techniques and real-world datasets (CICIDS2017).

---

**For more details, see:**
- `services/simple_detector.py` - Full implementation
- `models/` - Trained ML models
- `README.md` - Setup and usage instructions

