# Network-Based AI Threat Detection System

> Complete documentation for the AI-powered network threat detection system.

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Models](#models)
4. [Core Components](#core-components)
5. [Usage Guide](#usage-guide)
6. [Training](#training)
7. [API Service](#api-service)
8. [Technical Details](#technical-details)
9. [File Reference](#file-reference)

---

## Overview

This project implements an AI-powered network threat detection system that can:

- **Analyze PCAP files** for malicious traffic patterns
- **Detect attacks in real-time** from live network interfaces
- **Classify traffic** as BENIGN or ATTACK (DDoS, DoS, PortScan, etc.)
- **Provide API endpoints** for integration with other systems

### Key Features

| Feature | Description |
|---------|-------------|
| PCAP Analysis | Analyzes network capture files for threats |
| Real-time Detection | Monitors live network traffic |
| Multiple Models | Binary and multiclass classification |
| Low False Positives | Trained on user traffic to reduce FPR |
| FastAPI Service | Ready-to-deploy REST API |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Input Sources                          │
├─────────────────┬─────────────────┬─────────────────────────┤
│   PCAP Files    │  Live Network   │      API Requests       │
└────────┬────────┴────────┬────────┴────────────┬────────────┘
         │                 │                     │
         ▼                 ▼                     ▼
┌─────────────────────────────────────────────────────────────┐
│              NFStream Feature Extraction                     │
│              (46 statistical features)                       │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                 Random Forest Classifier                     │
│    ┌─────────────────────┬─────────────────────┐            │
│    │   Binary Model      │   Multiclass Model  │            │
│    │ BENIGN vs ATTACK    │ 8 attack categories │            │
│    │ 77.10% accuracy     │ 99.78% accuracy     │            │
│    │ 6.38% FPR           │                     │            │
│    └─────────────────────┴─────────────────────┘            │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                      Output                                  │
│    - Classification result (BENIGN/ATTACK)                   │
│    - Confidence scores                                       │
│    - Attack breakdown (if multiclass)                        │
│    - JSON/CSV reports                                        │
└─────────────────────────────────────────────────────────────┘
```

---

## Models

### Currently Trained Models

| Model | Type | Accuracy | FPR | Features | Use Case |
|-------|------|----------|-----|----------|----------|
| `nfstream_robust_binary` | Binary | 77.10% | 6.38% | 46 NFStream | **Primary - Real-time** |
| `multiclass_cicids` | 8-class | 99.78% | - | 78 CICFlowMeter | PCAP analysis |
| `nfstream_from_scratch` | Binary | 83.39% | ~10% | 46 NFStream | Legacy |
| `cicflowmeter` | 4-class | 99.89% | - | 78 CICFlowMeter | Friday-specific |

### Model Files Location

```
models/
├── random_forest_nfstream_robust_binary.joblib    # 632 MB - Main binary
├── random_forest_multiclass_cicids.joblib          # 10 MB  - Multiclass
├── random_forest_nfstream_from_scratch.joblib      # 833 MB - Legacy
├── feature_names_*.joblib                          # Feature lists
└── class_names_*.joblib                            # Class labels
```

### Classes Detected

**Binary Model:**
- BENIGN
- ATTACK

**Multiclass Model:**
- BENIGN
- DDoS
- DoS
- PortScan
- Brute Force
- Web Attack
- Infiltration
- Other

---

## Core Components

### 1. NetworkThreatAnalyzer (`src/analyzer.py`)

Main orchestrator for PCAP analysis.

```python
from src.analyzer import NetworkThreatAnalyzer

analyzer = NetworkThreatAnalyzer()
results = analyzer.analyze_pcap(
    'path/to/file.pcap',
    model_type='nfstream',  # or 'multiclass', 'cicflowmeter'
    max_flows=100000,
    save_results=True
)
```

**Parameters:**
- `model_type`: 'nfstream' (binary), 'multiclass', 'cicflowmeter'
- `max_flows`: Limit flows to analyze (None for all)
- `save_results`: Save CSV/JSON results

### 2. NetworkThreatPredictor (`src/predictor.py`)

Model loading and prediction engine.

```python
from src.predictor import NetworkThreatPredictor

predictor = NetworkThreatPredictor()

# Binary prediction (NFStream features)
predictions = predictor.predict_nfstream(df_features)

# Multiclass prediction (CICFlowMeter features)
predictions = predictor.predict(df_features)
```

### 3. FeatureExtractor (`src/feature_extractor.py`)

Extracts 46 NFStream features from PCAP files.

```python
from src.feature_extractor import FeatureExtractor

extractor = FeatureExtractor()
df_features = extractor.extract_nfstream_features('file.pcap', max_flows=10000)
```

**NFStream Features (46):**
- Destination port
- Flow duration
- Packet counts (bidirectional, src2dst, dst2src)
- Byte counts
- Packet sizes (min, max, mean, stddev)
- Inter-arrival times (PIAT)
- TCP flag counts (SYN, FIN, RST, PSH, ACK, URG)

---

## Usage Guide

### PCAP File Analysis

```powershell
# Quick analysis
python -c "from src.analyzer import NetworkThreatAnalyzer; a = NetworkThreatAnalyzer(); a.analyze_pcap('file.pcap', model_type='nfstream')"

# Full analysis with multiclass
python -c "from src.analyzer import NetworkThreatAnalyzer; a = NetworkThreatAnalyzer(); a.analyze_pcap('file.pcap', model_type='multiclass')"
```

**Output:**
```
============================================================
ANALYSIS SUMMARY
============================================================
File: file.pcap
Total flows: 501,096

DETECTION RESULTS
  ✓ BENIGN: 224,689 (44.8%)
  ⚠ ATTACK: 276,407 (55.2%)

⚠️  THREAT DETECTED: 276,407 malicious flows (55.2%)
============================================================
```

### Real-Time Detection

```powershell
python realtime_detector.py
```

1. Select network interface (Wi-Fi, Ethernet, etc.)
2. Monitor live output for ATTACK alerts
3. Press Ctrl+C to stop

**Output:**
```
[ALERT] 3 attack(s) detected! (ATTACK:3)

REAL-TIME STATISTICS - 00:35:43
Total flows: 254
  BENIGN: 243 (95.7%)
  ATTACKS: 11 (4.3%)
Rate: 2.6 flows/second
```

### Capture Network Traffic

```powershell
# List interfaces
tshark -D

# Capture for 15 minutes
tshark -i <interface_number> -a duration:900 -w my_traffic.pcap
```

---

## Training

### Training Data Sources

| Source | Location | Purpose |
|--------|----------|---------|
| CICIDS2017 CSVs | `dataset/` | Pre-labeled attack data |
| CICIDS2017 PCAPs | External drives | Raw network captures |
| User traffic | `user_traffic/` | Reduce false positives |

### Training Scripts

| Script | Purpose |
|--------|---------|
| `train_robust_binary.py` | Binary model from processed CSVs |
| `train_robust_binary_csv.py` | Binary model from CICIDS CSVs |
| `train_all_csv_model.py` | Multiclass from all CSVs |
| `train_nfstream_multiclass.py` | Multiclass from NFStream features |
| `train_cicflowmeter_model.py` | CICFlowMeter-based model |

### Training Notebook

The primary training notebook is `notebooks/train_robust_binary.ipynb`:

1. Extracts NFStream features from PCAPs
2. Labels Monday/Tuesday/Thursday as BENIGN
3. Labels Friday/Wednesday as ATTACK
4. Includes user traffic as BENIGN
5. Trains balanced Random Forest
6. Saves model to `models/`

---

## API Service

### FastAPI Endpoints

Location: `ai_service/`

**Start Server:**
```powershell
cd ai_service
uvicorn main:app --host 0.0.0.0 --port 8000
```

**Endpoints:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/analyze` | Analyze uploaded PCAP |
| GET | `/health` | Health check |
| GET | `/stats` | Service statistics |

**Example Request:**
```bash
curl -X POST "http://localhost:8000/analyze" \
  -F "file=@capture.pcap" \
  -F "model_type=nfstream"
```

**Response:**
```json
{
  "status": "success",
  "total_flows": 1000,
  "attacks_detected": 150,
  "attack_percentage": 15.0,
  "breakdown": {
    "BENIGN": 850,
    "ATTACK": 150
  }
}
```

---

## Technical Details

### Feature Extraction Pipeline

```
PCAP File
    │
    ▼
NFStreamer (nfstream library)
    │
    ├── statistical_analysis=True
    ├── splt_analysis=0
    └── n_dissections=0
    │
    ▼
46 Statistical Features
    │
    ├── dst_port
    ├── bidirectional_duration_ms
    ├── src2dst_packets, dst2src_packets, bidirectional_packets
    ├── src2dst_bytes, dst2src_bytes, bidirectional_bytes
    ├── *_max_ps, *_min_ps, *_mean_ps, *_stddev_ps
    ├── *_mean_piat_ms, *_stddev_piat_ms, *_max_piat_ms, *_min_piat_ms
    └── *_syn_packets, *_fin_packets, *_rst_packets, *_psh_packets, *_ack_packets
    │
    ▼
Random Forest Classifier (150 trees, max_depth=30)
    │
    ▼
Prediction: BENIGN or ATTACK
```

### CICIDS2017 Attack Schedule

| Day | Attacks | Time Windows |
|-----|---------|--------------|
| Monday | None | All BENIGN |
| Tuesday | Brute Force | Small % |
| Wednesday | **DoS** (Slowloris, Hulk, GoldenEye) | 9:43-11:24 |
| Thursday | Web Attack, Infiltration | Small % |
| Friday | **DDoS, PortScan, Bot** | 13:00-16:30 |

### Model Performance

**NFStream Robust Binary (Primary):**
- Training data: 700,000 flows (balanced)
- Accuracy: 77.10%
- False Positive Rate: 6.38%
- False Negative Rate: 39.41%

**Why FNR is high:**
- Training used file-level labeling (entire Friday = ATTACK)
- Some benign traffic in Friday is labeled as ATTACK
- Trade-off for lower FPR on user traffic

---

## File Reference

### Root Directory

| File | Purpose |
|------|---------|
| `realtime_detector.py` | Real-time network monitoring |
| `extract_pcap_features.py` | PCAP to CSV feature extraction |
| `cicids_labeller.py` | CICIDS2017 attack labeling logic |
| `cicflowmeter_nfstream_plugin.py` | NFStream plugin for 78 features |
| `list_interfaces.py` | Network interface discovery |
| `requirements.txt` | Python dependencies |
| `test_pcap_upload.html` | Web demo for PCAP upload |

### Source Directory (`src/`)

| File | Purpose |
|------|---------|
| `analyzer.py` | Main PCAP analysis orchestrator |
| `predictor.py` | Model loading and prediction |
| `feature_extractor.py` | NFStream feature extraction |

### Training Scripts

| File | Purpose |
|------|---------|
| `train_robust_binary.py` | Binary from processed CSVs |
| `train_robust_binary_csv.py` | Binary from CICIDS CSVs |
| `train_all_csv_model.py` | Multiclass from all CSVs |
| `train_nfstream_multiclass.py` | Multiclass with NFStream |
| `train_cicflowmeter_model.py` | CICFlowMeter-based |

### Notebooks

| File | Purpose |
|------|---------|
| `train_robust_binary.ipynb` | **Primary training notebook** |
| `nfstream_from_scratch.ipynb` | Original binary training |
| `06_multiclass_csv_training.ipynb` | Multiclass CSV training |

### Data Directories

| Directory | Contents |
|-----------|----------|
| `dataset/` | 8 CICIDS2017 CSV files (~600MB) |
| `data_processed/` | Processed training CSVs |
| `user_traffic/` | User captured PCAPs |
| `models/` | 21 model files (~1.6GB) |
| `results/` | Analysis output files |

---

## Dependencies

```
nfstream>=6.5.0
scikit-learn>=1.0.0
pandas>=1.3.0
numpy>=1.20.0
joblib>=1.0.0
fastapi>=0.68.0
uvicorn>=0.15.0
psutil>=5.8.0
```

---

## Quick Start

```powershell
# 1. Activate virtual environment
.\venv\Scripts\Activate

# 2. Analyze a PCAP
python -c "from src.analyzer import NetworkThreatAnalyzer; a = NetworkThreatAnalyzer(); a.analyze_pcap('pcap/Friday-WorkingHours.pcap', model_type='nfstream')"

# 3. Start real-time detection
python realtime_detector.py

# 4. Start API server
cd ai_service && uvicorn main:app --host 0.0.0.0 --port 8000
```

---

## Integration Examples

### Python Integration

```python
from src.analyzer import NetworkThreatAnalyzer

analyzer = NetworkThreatAnalyzer()

# Analyze PCAP
results = analyzer.analyze_pcap('capture.pcap', model_type='nfstream')

if results['threat_detected']:
    print(f"Attacks: {results['summary']['attack_count']}")
    print(f"Attack %: {results['summary']['attack_percentage']:.1f}%")
```

### REST API Integration

```javascript
// Node.js example
const FormData = require('form-data');
const fs = require('fs');
const axios = require('axios');

const form = new FormData();
form.append('file', fs.createReadStream('capture.pcap'));

axios.post('http://localhost:8000/analyze', form)
  .then(res => console.log(res.data));
```

---

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| NFStream not loading | `pip install nfstream --upgrade` |
| No interfaces found | Run as Administrator |
| High false positives | Add more user traffic to training |
| Model not found | Check `models/` directory |

### Performance Tips

- Limit `max_flows` for large PCAPs
- Use `model_type='nfstream'` for speed
- Increase NFStream timeouts for fewer flows

---

*Last updated: December 24, 2024*
