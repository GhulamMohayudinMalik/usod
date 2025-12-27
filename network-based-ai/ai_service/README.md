# FastAPI Service - Network Threat Detection

## ✅ Ready for Integration!

This FastAPI service is **production-ready** and uses the NFStream model (BENIGN vs DDoS).

## 🚀 Quick Start

### **1. Install Dependencies**

```bash
pip install -r requirements.txt
```

**Note:** On Windows, also install Npcap: https://npcap.com/

### **2. Start Service**

```bash
cd ai_service
python main.py
```

Or with uvicorn directly:
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Service will be available at: `http://localhost:8000`

### **3. Test Health Check**

```bash
curl http://localhost:8000/health
```

---

## 📡 API Endpoints

### **POST /api/v1/analyze-pcap**
Analyze a PCAP file for network threats.

**Request:**
- `file`: PCAP file (multipart/form-data)
- `model_type`: "nfstream" (default, binary classification)
- `max_flows`: Optional, limit number of flows to analyze

**Response:**
```json
{
  "status": "success",
  "total_flows": 501096,
  "threats_detected": true,
  "summary": {
    "BENIGN": 83208,
    "DDoS": 417888
  },
  "analysis_id": "uuid-here",
  "processing_time": 45.2
}
```

### **GET /health**
Health check endpoint.

### **GET /api/v1/stats**
Get service statistics.

---

## 🔌 Integration Example

See `backend_integration_example.js` for Node.js/Express integration.

**Quick Example:**
```javascript
const formData = new FormData();
formData.append('file', pcapFileBuffer, 'file.pcap');

const response = await axios.post(
  'http://localhost:8000/api/v1/analyze-pcap',
  formData,
  { headers: formData.getHeaders() }
);
```

---

## 🐳 Docker Deployment

```bash
docker build -t network-threat-detection .
docker run -p 8000:8000 network-threat-detection
```

---

## ⚙️ Environment Variables

- `PORT`: Server port (default: 8000)
- `ALLOWED_ORIGINS`: CORS origins (default: "*")
- `SAVE_RESULTS`: Save results to storage (default: "false")

---

## 📝 Notes

- Uses NFStream for feature extraction (no Java/CICFlowMeter needed)
- Model: Binary classification (BENIGN vs DDoS)
- Accuracy: 83.39% DDoS detection
- Supports: .pcap, .pcapng, .cap files


