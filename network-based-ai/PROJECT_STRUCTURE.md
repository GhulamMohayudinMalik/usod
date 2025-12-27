# Network-Based AI - Project Structure

## Clean Project Layout

```
network-based-ai/
├── src/                          # Core modules
│   ├── analyzer.py               # PCAP analysis orchestrator
│   ├── predictor.py              # Model loading & prediction
│   ├── feature_extractor.py      # NFStream feature extraction
│   └── __init__.py
│
├── models/                       # Trained models
│   ├── random_forest_nfstream_robust_binary.joblib  # Main binary model
│   ├── feature_names_nfstream_robust_binary.joblib
│   ├── class_names_nfstream_robust_binary.joblib
│   └── ... (other models)
│
├── ai_service/                   # FastAPI REST API
│   ├── main.py                   # API endpoints
│   ├── Dockerfile
│   ├── requirements.txt
│   └── README.md
│
├── notebooks/                    # Training notebooks
│   ├── train_robust_binary.ipynb       # Binary model training
│   ├── nfstream_from_scratch.ipynb     # Original NFStream training
│   └── 06_multiclass_csv_training.ipynb
│
├── dataset/                      # CICIDS2017 CSV files
├── data_processed/               # Processed training data
├── user_traffic/                 # User captured PCAPs
├── pcap/                         # Test PCAP files
├── results/                      # Analysis results
│
├── realtime_detector.py          # Real-time threat detection
├── test_pcap_upload.html         # Web interface
├── requirements.txt              # Dependencies
├── README.md                     # Main documentation
└── network-based-ai.md           # Detailed technical docs
```

## Quick Commands

```bash
# Start API Server
python ai_service/main.py
# Or with auto-reload:
python -m uvicorn main:app --app-dir ai_service --reload --host 0.0.0.0 --port 8000

# Real-time Detection
python realtime_detector.py

# Analyze PCAP (Python)
python -c "from src.analyzer import NetworkThreatAnalyzer; a = NetworkThreatAnalyzer(); a.analyze_pcap('pcap/Friday-WorkingHours.pcap')"
```
