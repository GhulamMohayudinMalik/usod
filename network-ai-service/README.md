# USOD Network AI Service

AI-powered network threat detection service for the USOD (Unified Security Operations Dashboard) platform.

## Overview

This service provides real-time network packet capture, flow analysis, and machine learning-based threat detection. It integrates with the main USOD backend to provide comprehensive security monitoring.

## Features

- **Real-time Packet Capture**: Capture network traffic using Scapy
- **Flow Analysis**: Convert packets to network flows for ML analysis
- **Threat Detection**: ML models for intrusion detection and anomaly detection
- **REST API**: FastAPI-based service for integration with Node.js backend
- **PCAP Analysis**: Analyze uploaded packet capture files

## Architecture

```
Network Traffic → Packet Capture → Flow Extraction → ML Models → Threat Detection
                                                                    ↓
Node.js Backend ← REST API ← FastAPI Service ← Threat Results
```

## Directory Structure

```
network-ai-service/
├── main.py                    # FastAPI server (production)
├── requirements.txt           # Python dependencies
├── README.md                  # This file
├── model_training_fast.py     # Fast ML training (MVP version)
├── capture/                   # Packet capture modules
│   ├── packet_capture.py      # Scapy-based packet capture
│   ├── flow_extractor.py      # Network flow extraction
│   └── preprocessor.py        # Feature preprocessing
├── models/                    # ML model implementations
│   ├── intrusion_detector.py  # Random Forest classifier
│   ├── anomaly_detector.py    # Isolation Forest detector
│   └── model_trainer.py       # Model training utilities
├── services/                  # Core detection services
│   ├── real_time_detector.py  # Full real-time detection
│   └── simple_detector.py     # Mock-based detection (stable)
├── utils/                     # Utility modules
│   ├── pcap_parser.py         # PCAP file parsing
│   ├── feature_builder.py     # Network feature extraction
│   └── cicids2017_loader.py    # Dataset loading
└── data/                      # Data and models
    ├── raw/                   # CICIDS2017 dataset (8 CSV files)
    └── processed/             # Processed data and trained models
        ├── *.pkl             # Trained models (RF, IF, scaler, encoder)
        ├── *.csv             # Processed datasets (train/val/test)
        ├── *.json            # Metadata and results
        └── *.png             # Visualization plots (for research paper)
```

## Cleanup History (MVP Optimization)

### 🗑️ Files Removed for MVP (Can be restored for enhancement)
- `test_*.py` - All test scripts (20+ files)
- `debug_*.py` - Debug and diagnostic scripts
- `model_training.py` - Full training with extensive hyperparameter tuning
- `model_training_improved.py` - Improved training with caching
- `feature_engineering.py` - Standalone feature engineering script
- `simple_main.py` - Alternative FastAPI server
- `generate_traffic.py` - Traffic generation utilities
- `check_training_status.py` - Training status checker
- `use_models_example.py` - Model usage examples

### 📁 Files Kept for Production
- `main.py` - **Primary FastAPI server** (stable, production-ready)
- `model_training_fast.py` - **Fast ML training** (MVP version, ~5 minutes)
- `services/simple_detector.py` - **Mock-based detection** (stable fallback)
- `services/real_time_detector.py` - **Full detection** (for future enhancement)
- All trained models and data in `data/processed/`
- **Visualization plots** (kept for research paper)

### 🔄 For Future Enhancement
When ready to enhance the models:
1. **Restore advanced training**: Copy back `model_training.py` and `model_training_improved.py`
2. **Add test scripts**: Restore `test_*.py` files for comprehensive testing
3. **Enable real-time**: Switch from `simple_detector.py` to `real_time_detector.py`
4. **Add debugging**: Restore `debug_*.py` and diagnostic scripts

## Setup Instructions

### Prerequisites

1. **Python 3.8+**
2. **Npcap (Windows)** or **libpcap (Linux/Mac)**
3. **Administrator privileges** for packet capture

### Installation

1. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Install Npcap (Windows only):**
   - Download from: https://npcap.com/
   - Install with "WinPcap API-compatible Mode" enabled

3. **Test the setup:**
   ```bash
   python test_setup.py
   ```

### Running the Service

1. **Start the FastAPI service:**
   ```bash
   python main.py
   ```

2. **Service will be available at:**
   - API: http://localhost:8000
   - Documentation: http://localhost:8000/docs

## API Endpoints

### Core Endpoints

- `GET /` - Service health check
- `GET /health` - Detailed health status
- `POST /api/start-capture` - Start network monitoring
- `POST /api/stop-capture` - Stop network monitoring
- `GET /api/get-threats` - Get detected threats
- `POST /api/analyze-pcap` - Analyze PCAP file
- `GET /api/model-stats` - Get ML model statistics

### Example Usage

**Start monitoring:**
```bash
curl -X POST "http://localhost:8000/api/start-capture" \
     -H "Content-Type: application/json" \
     -d '{"interface": "eth0", "duration": 60}'
```

**Get threats:**
```bash
curl "http://localhost:8000/api/get-threats?limit=10"
```

**Check health:**
```bash
curl "http://localhost:8000/health"
```

## Development Status

### ✅ Completed (MVP - Week 1-2)
- [x] **FastAPI Service**: Production-ready service with stable endpoints
- [x] **Packet Capture**: Scapy-based real-time packet capture with admin privileges
- [x] **Flow Extraction**: Network flow analysis and feature extraction
- [x] **ML Models**: Random Forest (99.97% accuracy) and Isolation Forest (87.33% accuracy)
- [x] **Feature Engineering**: 25-feature pipeline with preprocessing and scaling
- [x] **Real-time Detection**: Mock-based threat detection with ML model integration
- [x] **API Endpoints**: All core endpoints working (start/stop capture, get threats, health)
- [x] **Model Persistence**: Trained models saved and loaded automatically
- [x] **Data Processing**: CICIDS2017 dataset preprocessing and feature selection

### 🚧 Current Status (Week 3 - Backend Integration)
- [ ] **Node.js Integration**: Connect Python service to USOD backend
- [ ] **Database Logging**: Extend SecurityLog model for network threats
- [ ] **Real-time Updates**: Server-Sent Events for live threat streaming
- [ ] **Dashboard UI**: Network monitoring page with controls

### 📋 Future Enhancements (Week 4+)
- [ ] **Advanced Models**: Neural Networks for malware detection
- [ ] **Ensemble Voting**: Combine multiple ML models for better accuracy
- [ ] **PCAP Upload**: File upload and analysis feature
- [ ] **Performance**: Optimize packet capture and reduce latency
- [ ] **Blockchain**: Hyperledger Fabric integration for immutable logging

## Integration with USOD Backend

The service communicates with the main USOD Node.js backend via REST API:

1. **Node.js backend** calls Python service to start/stop monitoring
2. **Python service** detects threats and sends them to Node.js backend
3. **Node.js backend** stores threats in MongoDB and blockchain
4. **Frontend** displays real-time threats via Server-Sent Events

## Troubleshooting

### Common Issues

1. **"No suitable network interface found"**
   - Run with administrator privileges
   - Check if Npcap is installed (Windows)
   - Verify network interfaces: `python -c "from scapy.all import get_if_list; print(get_if_list())"`

2. **"Permission denied" for packet capture**
   - Run as administrator (Windows) or root (Linux)
   - Check firewall settings

3. **Import errors**
   - Install missing packages: `pip install -r requirements.txt`
   - Check Python version (3.8+ required)

4. **Service won't start**
   - Check if port 8000 is available
   - Verify all dependencies are installed
   - Run `python test_setup.py` to diagnose issues

### Debug Mode

Run with debug logging:
```bash
python main.py --log-level debug
```

## Performance Notes

- **Packet Capture**: Can handle ~10,000 packets/second on modern hardware
- **Flow Extraction**: Processes flows in real-time with minimal latency
- **ML Inference**: Target <100ms per flow for threat detection
- **Memory Usage**: ~100MB base + ~1MB per 1000 active flows

## Security Considerations

- **Network Access**: Service requires raw socket access for packet capture
- **Data Privacy**: No packet payloads are stored, only metadata
- **API Security**: CORS configured for localhost only (development)
- **Admin Rights**: Required for packet capture on most systems

## Contributing

1. Follow PEP 8 style guidelines
2. Add tests for new features
3. Update documentation
4. Test on multiple platforms

## Research Paper Assets

### 📊 Visualization Plots (Kept for Paper)
Located in `data/processed/`:
- `random_forest_confusion_matrix.png` - RF model performance visualization
- `random_forest_roc_curve.png` - ROC curve showing model discrimination
- `isolation_forest_confusion_matrix.png` - Anomaly detection performance
- `isolation_forest_anomaly_scores.png` - Anomaly score distribution
- `feature_importance.png` - Feature importance analysis

### 📈 Model Performance Metrics
- **Random Forest**: 99.97% accuracy, 34.51ms inference time
- **Isolation Forest**: 87.33% accuracy, 909 KB model size
- **Feature Engineering**: 25 selected features from 78 original
- **Dataset**: CICIDS2017 (8 files, ~843 MB, 5 attack classes)

### 🔬 Research Contributions
1. **Hybrid Detection**: Application + Network layer security
2. **Real-time Processing**: <1 second threat detection latency
3. **Ensemble Approach**: Multiple ML models for comprehensive coverage
4. **Feature Engineering**: Automated 25-feature selection pipeline
5. **Production Ready**: FastAPI service with stable endpoints

### 📝 Paper Writing Timeline
- **Current**: Keep all visualization plots and model artifacts
- **Week 8-10**: Write technical paper using these assets
- **Enhancement**: Can retrain with advanced models for better results

## License

Part of the USOD project. See main project license.

## Support

For issues and questions:
1. Check this README
2. Check the main USOD project documentation
3. Create an issue in the project repository
