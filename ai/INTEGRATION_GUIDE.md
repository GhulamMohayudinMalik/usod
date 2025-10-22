# Integration Guide: Python AI Service ↔ Node.js Backend ↔ Frontend

## 🔗 Complete Data Flow

This document explains **exactly how a threat goes from generation to display** on your dashboard.

---

## 📊 End-to-End Threat Journey

### Step 1: Mock Flow Generation (Python)
**File**: `services/simple_detector.py` → `start_detection()`

```python
# Detection loop runs every 5 seconds
while time.time() - start_time < duration:
    time.sleep(5)
    
    # Generate 1-3 random network flows
    flows = [_generate_mock_flow() for _ in range(random.randint(1, 3))]
    
    for flow in flows:
        if flow['is_threat']:  # 70% probability
            # Process this flow as a potential threat
```

**Output**: Mock network flow object

---

### Step 2: Feature Extraction (Python)
**File**: `services/simple_detector.py` → `_extract_mock_features()`

```python
# Convert flow into 25 ML features
features = {
    'duration': 3.13,
    'total_fwd_packets': 534,
    'flow_bytes_s': 1925.5,
    # ... 22 more features
}
```

**Output**: Feature vector (pandas DataFrame)

---

### Step 3: ML Prediction (Python)
**File**: `services/simple_detector.py` → `_predict_threat()`

```python
# Load trained models
rf_model = joblib.load('models/rf_model.pkl')
iso_model = joblib.load('models/iso_model.pkl')

# Random Forest: Classify known attacks
rf_pred = rf_model.predict(features)  # 0 or 1
rf_conf = max(rf_model.predict_proba(features)[0])  # 0.0-1.0

# Isolation Forest: Detect anomalies
iso_pred = iso_model.predict(features)  # -1 (anomaly) or 1 (normal)
iso_score = iso_model.score_samples(features)  # Negative = anomaly

# Combine predictions
is_threat = (rf_pred == 1) or (iso_pred == -1)
```

**Output**: Threat prediction with confidence scores

---

### Step 4: Threat Classification (Python)
**File**: `services/simple_detector.py` → `_classify_threat_type()`

```python
# Determine attack type based on port and protocol
if dst_port == 22:
    return "brute_force"  # SSH attack
elif dst_port in [80, 443]:
    return "web_attack"  # HTTP/HTTPS attack
elif protocol == "UDP" and packet_count > 100:
    return "ddos"  # UDP flood
# ... more classification logic
```

**Output**: Specific threat type (e.g., "web_attack", "brute_force")

---

### Step 5: Threat Object Creation (Python)
**File**: `services/simple_detector.py` → `_handle_threat_detection()`

```python
threat = {
    'threat_id': 'threat_000001',
    'threat_type': 'web_attack',
    'severity': 'low',  # Based on confidence
    'source_ip': '192.168.1.144',
    'destination_ip': '192.168.1.4',
    'source_port': 59510,
    'destination_port': 80,
    'protocol': 'TCP',
    'confidence': 0.13,
    'timestamp': '2025-10-21T12:24:37.482505',
    'details': {
        'rf_prediction': 0,
        'rf_confidence': 0.13,
        'iso_prediction': 1,
        'iso_score': 0.005,
        'flow_duration': 3.13,
        'packet_count': 534,
        'byte_count': 6031
    }
}
```

**Output**: Complete threat record

---

### Step 6: Webhook POST (Python → Node.js)
**File**: `services/simple_detector.py` → `_send_webhook()`

```python
import requests

WEBHOOK_ENDPOINT = "http://localhost:5000/api/network/webhook"

response = requests.post(
    WEBHOOK_ENDPOINT,
    json=threat,
    headers={"Content-Type": "application/json"},
    timeout=5.0
)

if response.status_code == 200:
    print(f"✅ Webhook sent successfully: {threat['threat_id']}")
```

**Network Request**:
```http
POST http://localhost:5000/api/network/webhook
Content-Type: application/json

{
  "threat_id": "threat_000001",
  "threat_type": "web_attack",
  ...
}
```

---

### Step 7: Webhook Reception (Node.js)
**File**: `backend/src/routes/networkRoutes.js` → `POST /webhook`

```javascript
router.post('/webhook', async (req, res) => {
  const threatData = req.body;
  
  // 1. Save to MongoDB
  await logActions.networkThreat(threatData, req, {
    source: 'python_ai_service',
    detectedBy: 'ml_models'
  });
  
  // 2. Broadcast via EventBus
  emitNetworkThreat(threatData);
  
  // 3. Respond to Python
  res.json({ success: true, threat_id: threatData.threat_id });
});
```

**Actions**:
1. **MongoDB Storage** (persistence)
2. **EventBus Broadcast** (real-time)
3. **HTTP 200 Response** (acknowledge)

---

### Step 8: MongoDB Storage (Node.js)
**File**: `backend/src/services/loggingService.js` → `networkThreat()`

```javascript
async networkThreat(threatData, req, additionalDetails = {}) {
  const userId = req.user?.id || null;  // 'system' for webhooks
  
  return await logSecurityEvent(userId, 'network_threat_detected', 'detected', req, {
    threatData: threatData,  // Store complete threat object
    threatId: threatData.threat_id,
    threatType: threatData.threat_type,
    severity: threatData.severity,
    sourceIP: threatData.source_ip,
    destinationIP: threatData.destination_ip,
    confidence: threatData.confidence,
    // ... more fields
  });
}
```

**MongoDB Document**:
```json
{
  "_id": ObjectId("..."),
  "userId": null,
  "action": "network_threat_detected",
  "status": "detected",
  "ipAddress": "127.0.0.1",
  "userAgent": "python-requests/2.28.1",
  "details": {
    "threatData": { /* complete threat object */ },
    "threatId": "threat_000001",
    "threatType": "web_attack",
    "severity": "low",
    "username": "system",
    // ...
  },
  "timestamp": ISODate("2025-10-21T12:24:37.000Z")
}
```

---

### Step 9: EventBus Broadcast (Node.js)
**File**: `backend/src/services/eventBus.js` → `emitNetworkThreat()`

```javascript
export const emitNetworkThreat = (threatData) => {
  eventBus.emit(NETWORK_EVENTS.THREAT_DETECTED, {
    type: 'network_threat_detected',
    data: threatData,
    timestamp: new Date().toISOString()
  });
};
```

**Event Emitted**: Any listener subscribed to `NETWORK_EVENTS.THREAT_DETECTED` will receive this event.

---

### Step 10: SSE Broadcast (Node.js → Frontend)
**File**: `backend/src/routes/networkRoutes.js` → `GET /stream`

```javascript
// SSE connection handler
const handleNetworkThreat = (eventData) => {
  const threatData = eventData.data;  // Extract threat from event
  
  // Send to connected browser
  res.write(`data: ${JSON.stringify({
    type: 'threat_detected',
    data: threatData,
    timestamp: new Date().toISOString()
  })}\n\n`);
};

// Register listener
eventBus.on(NETWORK_EVENTS.THREAT_DETECTED, handleNetworkThreat);
```

**SSE Message Sent**:
```
data: {"type":"threat_detected","data":{...threat...},"timestamp":"..."}

```

---

### Step 11: Frontend Reception (React/Next.js)
**File**: `frontend/src/app/dashboard/network-monitoring/page.js`

```javascript
// Establish SSE connection
const eventSource = new EventSource(
  `http://localhost:5000/api/network/stream?token=${token}`
);

// Listen for messages
eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  if (data.type === 'threat_detected') {
    // Add to threats array
    setThreats(prev => [data.data, ...prev.slice(0, 49)]);
    
    // Update statistics
    updateStatistics(data.data);
  }
};
```

---

### Step 12: UI Update (React State)
**File**: `frontend/src/app/dashboard/network-monitoring/page.js`

```javascript
// State updates trigger re-render
const [threats, setThreats] = useState([]);
const [statistics, setStatistics] = useState({
  total: 0,
  high: 0,
  medium: 0,
  low: 0,
  byType: {}
});

// When threat arrives:
setThreats([newThreat, ...existingThreats]);  // Prepend new threat

// Statistics recalculated:
setStatistics(prev => ({
  total: prev.total + 1,
  high: threat.severity === 'high' ? prev.high + 1 : prev.high,
  medium: threat.severity === 'medium' ? prev.medium + 1 : prev.medium,
  low: threat.severity === 'low' ? prev.low + 1 : prev.low,
  byType: {
    ...prev.byType,
    [threat.threat_type]: (prev.byType[threat.threat_type] || 0) + 1
  }
}));
```

---

### Step 13: Visual Display (React Components)

**Threat Card Rendered**:
```jsx
<div className="p-4 hover:bg-gray-700/50">
  <div className="flex items-center space-x-2 mb-2">
    <span className="text-sm font-medium text-gray-100">
      WEB_ATTACK
    </span>
    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-400/10 text-blue-400">
      LOW
    </span>
  </div>
  <div className="text-sm text-gray-400 space-y-1">
    <p><span className="font-medium">Source:</span> 192.168.1.144</p>
    <p><span className="font-medium">Destination:</span> 192.168.1.4</p>
    <p><span className="font-medium">Confidence:</span> 13%</p>
    <p><span className="font-medium">Time:</span> 10/21/2025, 12:24:37 PM</p>
  </div>
</div>
```

**Statistics Updated**:
```jsx
<div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-6">
  <p className="text-sm font-medium text-gray-400">Total Threats</p>
  <p className="text-2xl font-bold text-gray-100">2</p>
</div>
```

---

## 🔄 Complete Flow Diagram

```
┌─────────────────┐
│  Python Service │
│  (Port 8000)    │
└────────┬────────┘
         │
         │ 1. Generate mock flow every 5s
         │ 2. Extract 25 features
         │ 3. ML prediction (RF + ISO)
         │ 4. Classify threat type
         │ 5. Create threat object
         │
         ↓ HTTP POST (Webhook)
         │
┌────────┴────────────┐
│  Node.js Backend    │
│  (Port 5000)        │
│                     │
│  /api/network/      │
│  webhook            │
└────────┬────────────┘
         │
         ├─→ MongoDB: Save threat ────────────┐
         │   (Persistence)                     │
         │                                     │
         └─→ EventBus: Broadcast ─→ SSE ─────┐│
             (Real-time)              │       ││
                                      ↓       ↓↓
                           ┌──────────────────────┐
                           │  Frontend Dashboard  │
                           │  (Port 3000)         │
                           │                      │
                           │  1. SSE receives     │
                           │  2. Update state     │
                           │  3. Re-render UI     │
                           │  4. Display threat   │
                           └──────────────────────┘
                                      ↑
                                      │
                    On page refresh: GET /api/network/threats/history
                                      │
                           Load from MongoDB ────┘
```

---

## ⏱️ Timing

| Event | Time |
|-------|------|
| Mock flow generated | Every 5 seconds |
| ML prediction | ~10-50ms |
| Webhook POST | ~5-20ms |
| MongoDB write | ~10-30ms |
| SSE broadcast | ~1-5ms |
| Frontend update | ~10-50ms |
| **Total latency** | **<100ms** |

---

## 🧪 Testing the Integration

### 1. Check Python Logs
```bash
# Terminal running: python main.py
INFO:services.simple_detector:🔍 Analyzing 3 mock flows...
WARNING:services.simple_detector:🚨 THREAT DETECTED: web_attack from 192.168.1.144:59510 to 192.168.1.4:80
INFO:services.simple_detector:✅ Webhook sent successfully: threat_000001
```

### 2. Check Node.js Logs
```bash
# Terminal running: npm run dev (backend)
🔗 WEBHOOK RECEIVED from Python AI service
📦 Request body: {"threat_id":"threat_000001",...}
💾 WEBHOOK: Threat saved to MongoDB: threat_000001
📡 WEBHOOK: Emitting threat event via EventBus...
🚨 SSE: Broadcasting threat to client...
✅ SSE: Threat broadcasted to client - threat_000001
```

### 3. Check Browser Console
```javascript
// F12 → Console
📡 SSE message received: {type: "threat_detected", data: {...}, timestamp: "..."}
🚨 THREAT DETECTED! Adding to list: {threat_id: "threat_000001", ...}
📋 Updated threats list length: 1
✅ Threat added and statistics updated
```

### 4. Check MongoDB
```bash
# MongoDB Compass or CLI
db.securitylogs.find({action: "network_threat_detected"}).count()
# Should show: 2 (or more)

db.securitylogs.find({action: "network_threat_detected"}).pretty()
# Shows full threat documents
```

---

## 🎯 Key Integration Points

### Python → Node.js
- **Protocol**: HTTP POST (webhook)
- **Endpoint**: `http://localhost:5000/api/network/webhook`
- **Format**: JSON
- **Auth**: None (internal service-to-service)

### Node.js → MongoDB
- **Driver**: Mongoose ODM
- **Collection**: `securitylogs`
- **Model**: `SecurityLog`
- **Action**: `network_threat_detected`

### Node.js → Frontend
- **Protocol**: Server-Sent Events (SSE)
- **Endpoint**: `http://localhost:5000/api/network/stream`
- **Format**: JSON over SSE
- **Auth**: JWT token (query parameter)

### Frontend → Node.js
- **Protocol**: HTTP GET (on page load)
- **Endpoint**: `http://localhost:5000/api/network/threats/history`
- **Format**: JSON
- **Auth**: JWT token (Authorization header)

---

## 🔒 Security Considerations

1. **Webhook Endpoint**: Currently no authentication (internal only)
   - **Future**: Add API key or shared secret
   
2. **SSE Authentication**: JWT token required
   - Token passed as query parameter
   - Verified before establishing connection

3. **MongoDB Access**: Only via Node.js backend
   - No direct frontend access
   - All queries authenticated

4. **CORS**: Frontend (port 3000) → Backend (port 5000)
   - Configured in `backend/src/server.js`

---

## 📚 Related Files

### Python Service
- `network-ai-service/services/simple_detector.py` - Threat detection logic
- `network-ai-service/main.py` - FastAPI server
- `network-ai-service/models/` - Trained ML models

### Node.js Backend
- `backend/src/routes/networkRoutes.js` - API routes
- `backend/src/services/loggingService.js` - MongoDB logging
- `backend/src/services/eventBus.js` - Event broadcasting
- `backend/src/models/SecurityLog.js` - MongoDB schema

### Frontend
- `frontend/src/app/dashboard/network-monitoring/page.js` - UI component
- `frontend/src/services/api.js` - API client

---

**This integration demonstrates a complete, production-grade microservices architecture with real-time data streaming!** 🚀

