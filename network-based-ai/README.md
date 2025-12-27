# Network Threat Detection AI

AI-powered network threat detection system using Random Forest and NFStream for PCAP file analysis and real-time monitoring.

## ✅ Status: Production Ready

**Current Model:**
- Type: Binary Classification (BENIGN vs ATTACK)
- Accuracy: 77.10% (6.38% False Positive Rate)
- Trained on: NFStream-extracted features from CICIDS2017 + User Traffic

---

## 🚀 Quick Start

### **1. Start Backend API:**

```bash
# Activate virtual environment
.\venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac

# Option 1: Run directly (recommended)
python ai_service/main.py

# Option 2: With auto-reload for development
python -m uvicorn main:app --app-dir ai_service --reload --host 0.0.0.0 --port 8000
```

### **2. Open Web Interface:**
Open `test_pcap_upload.html` in your browser and upload a PCAP file.

### **3. Real-Time Detection:**
```bash
python realtime_detector.py
```

---

## 📁 Project Structure

```
network-based-ai/
├── src/                          # Core modules
│   ├── analyzer.py              # Main analyzer (PCAP → Results)
│   ├── predictor.py             # Model loading & prediction
│   └── feature_extractor.py     # NFStream feature extraction
├── models/                      # Trained models
│   ├── random_forest_nfstream_robust_binary.joblib  # Main model
│   ├── feature_names_nfstream_robust_binary.joblib
│   └── class_names_nfstream_robust_binary.joblib
├── notebooks/                   # Training notebooks
│   ├── train_robust_binary.ipynb
│   └── nfstream_from_scratch.ipynb
├── ai_service/                  # FastAPI REST API
│   ├── main.py
│   └── Dockerfile
├── pcap/                        # PCAP files for testing
├── data_processed/              # Training data CSVs
├── results/                     # Analysis results
├── realtime_detector.py         # Real-time network monitoring
└── test_pcap_upload.html        # Web interface
```

---

## 🔧 Requirements

```bash
pip install -r requirements.txt

# Windows: Install Npcap for real-time capture
# https://npcap.com/
```

---

## 📊 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Service health check |
| `/api/v1/analyze-pcap` | POST | Analyze PCAP file |
| `/api/v1/stats` | GET | Service statistics |
| `/api/v1/interfaces` | GET | Available network interfaces |

**Example Request:**
```bash
curl -X POST "http://localhost:8000/api/v1/analyze-pcap" \
  -F "file=@your_capture.pcap" \
  -F "batch_size=5000"
```

---

## 📝 Notes

- Model detects BENIGN vs ATTACK (DDoS, DoS, PortScan, etc.)
- Uses NFStream for fast feature extraction
- Results include batch-wise breakdown showing attack zones
- Web interface shows visual attack percentage bars

---

## 📚 Documentation

- `network-based-ai.md` - Detailed technical documentation
- `PROJECT_STRUCTURE.md` - Complete project structure
