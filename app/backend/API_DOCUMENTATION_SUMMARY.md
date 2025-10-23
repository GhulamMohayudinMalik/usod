# 📚 USOD API - Comprehensive Documentation

**Version:** 2.0.0  
**Base URL:** `http://localhost:5000`  
**Documentation Endpoint:** `GET /`

---

## 🎯 **OVERVIEW**

Complete REST API documentation for the **Unified Security Operations Dashboard (USOD)** - an AI-powered network threat detection system with blockchain verification.

### **Total Endpoints:** 59

Access the full interactive documentation at:
```
http://localhost:5000/
```

---

## 📋 **API CATEGORIES**

### 1. **Authentication** (10 endpoints)
**Base Route:** `/api/auth`

- **POST** `/api/auth/login` - User login
- **POST** `/api/auth/register` - Register new user
- **POST** `/api/auth/logout` - User logout
- **POST** `/api/auth/refresh` - Refresh JWT token
- **POST** `/api/auth/unlock-account` - Unlock blocked account
- **GET** `/api/auth/session-status` - Check session status
- **GET** `/api/auth/security/stats` - Security statistics
- **GET** `/api/auth/security/blocked-ips` - List blocked IPs
- **POST** `/api/auth/security/block-ip` - Block an IP
- **POST** `/api/auth/security/unblock-ip` - Unblock an IP

---

### 2. **Blockchain** (9 endpoints)
**Base Route:** `/api/blockchain`

- **GET** `/api/blockchain/health` - Service health check
- **GET** `/api/blockchain/statistics` 🔒 - Blockchain stats
- **GET** `/api/blockchain/threats` 🔒 - Query all threats
- **GET** `/api/blockchain/threats/:logId` 🔒 - Get specific threat
- **GET** `/api/blockchain/threats/:logId/history` 🔒 - Transaction history
- **POST** `/api/blockchain/threats/:logId/verify` 🔒 - Verify hash integrity
- **GET** `/api/blockchain/threats/type/:type` 🔒 - Query by type
- **GET** `/api/blockchain/threats/severity/:severity` 🔒 - Query by severity
- **POST** `/api/blockchain/threats` 🔒 - Create threat log

---

### 3. **Network Monitoring** (11 endpoints)
**Base Route:** `/api/network`

- **POST** `/api/network/start-monitoring` 🔒 - Start monitoring
- **POST** `/api/network/stop-monitoring` 🔒 - Stop monitoring
- **GET** `/api/network/threats` 🔒 - Get detected threats
- **GET** `/api/network/statistics` 🔒 - Monitoring statistics
- **POST** `/api/network/upload-pcap` 🔒 - Upload PCAP file
- **GET** `/api/network/status` 🔒 - Current status
- **GET** `/api/network/health` 🔒 - Health check
- **POST** `/api/network/test-connection` 🔒 - Test AI service
- **GET** `/api/network/threats/history` 🔒 - Historical threats
- **POST** `/api/network/webhook` - AI service webhook
- **GET** `/api/network/stream` - SSE stream

---

### 4. **Data & Analytics** (4 endpoints)
**Base Route:** `/api/data`

- **GET** `/api/data/all` - All dashboard data
- **GET** `/api/data/dashboard-stats` - Dashboard statistics
- **GET** `/api/data/login-attempts` - Login history
- **GET** `/api/data/security-events` - Security events

---

### 5. **Security Logs** (7 endpoints)
**Base Route:** `/api/logs`

- **GET** `/api/logs` - Get all logs (paginated)
- **GET** `/api/logs/statistics` - Log statistics
- **POST** `/api/logs` - Create new log
- **POST** `/api/logs/clear` - Clear all logs
- **PUT** `/api/logs/:id/status` - Update log status
- **GET** `/api/logs/desktop` - Desktop app logs
- **GET** `/api/logs/mobile` - Mobile app logs

---

### 6. **Data Ingestion** (3 endpoints)
**Base Route:** `/api/ingest`  
**Auth:** API Key Required

- **POST** `/api/ingest/login` 🔑 - Log login attempt
- **POST** `/api/ingest/log` 🔑 - Single log entry
- **POST** `/api/ingest/logs` 🔑 - Bulk log ingestion

---

### 7. **Backup & Restore** (7 endpoints)
**Base Route:** `/api/backup`

- **POST** `/api/backup/security-logs` - Backup logs
- **POST** `/api/backup/users` - Backup users
- **POST** `/api/backup/full` - Full database backup
- **GET** `/api/backup/list` - List backups
- **POST** `/api/backup/restore/:backupName` - Restore backup
- **POST** `/api/backup/cleanup` - Delete old backups
- **GET** `/api/backup/stats` - Backup statistics

---

### 8. **User Management** (7 endpoints)
**Base Route:** `/api/users`

- **POST** `/api/users/create` 🔒 - Create user (admin)
- **POST** `/api/users/change-password` 🔒 - Change password
- **PUT** `/api/users/profile` 🔒 - Update profile
- **GET** `/api/users/users` 🔒 - List all users (admin)
- **DELETE** `/api/users/users/:userId` 🔒 - Delete user (admin)
- **PUT** `/api/users/users/:userId/role` 🔒 - Update role (admin)
- **PUT** `/api/users/settings` 🔒 - Update settings

---

### 9. **Real-time Streaming** (1 endpoint)
**Base Route:** `/api/stream`

- **GET** `/api/stream/logs` - SSE stream for real-time logs

---

## 🔐 **AUTHENTICATION**

### Bearer Token (JWT)
Most endpoints require a Bearer token in the `Authorization` header:

```bash
Authorization: Bearer YOUR_JWT_TOKEN
```

**Get Token:**
```bash
POST /api/auth/login
Body: { "username": "admin", "password": "your_password" }
```

### API Key
Ingestion endpoints require an API key in the `X-API-Key` header:

```bash
X-API-Key: YOUR_API_KEY
```

---

## 📊 **RESPONSE FORMATS**

### Success Response
```json
{
  "status": "success",
  "data": { ... },
  "message": "Operation completed"
}
```

### Error Response
```json
{
  "status": "error",
  "error": "Error message",
  "code": 400
}
```

---

## 🚀 **QUICK START**

### 1. Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}'
```

### 2. Get Blockchain Statistics
```bash
curl http://localhost:5000/api/blockchain/statistics \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Query Threats
```bash
curl http://localhost:5000/api/blockchain/threats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4. Verify Threat Log
```bash
curl -X POST http://localhost:5000/api/blockchain/threats/LOG_123/verify \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🛠️ **TECHNOLOGY STACK**

### Backend
- Node.js v22+
- Express.js
- MongoDB
- JWT Authentication
- bcrypt for passwords

### Frontend
- React + Next.js
- Tailwind CSS
- Chart.js

### Blockchain
- Hyperledger Fabric (Production)
- Mock Blockchain (Demo)
- SHA256 Hashing

### AI/ML
- Python + FastAPI
- scikit-learn
- Random Forest
- Isolation Forest

### Deployment
- Docker
- Terraform (IaC)
- Ansible (Config Management)
- AWS, GCP, Azure, OCI

---

## 🌐 **MULTI-PLATFORM SUPPORT**

### Web Dashboard
```
http://localhost:3000
```

### Desktop App
- Electron-based
- Windows, Mac, Linux
- Offline mode support

### Mobile App
- React Native
- iOS & Android
- Push notifications

---

## 📈 **HEALTH & STATUS**

### Check Server Health
```bash
GET /api/blockchain/health
GET /api/network/health
```

### System Information
Available in the root documentation endpoint:
- Server uptime
- Memory usage
- Node.js version
- Database connection status
- Blockchain service status

---

## 📝 **EXAMPLE REQUESTS**

### Create Threat Log on Blockchain
```javascript
fetch('http://localhost:5000/api/blockchain/threats', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    logId: 'THREAT_001',
    logType: 'network_threat',
    threatDetails: {
      type: 'port_scan',
      severity: 'high',
      ip: '192.168.1.100'
    },
    detectionMethod: 'AI_DETECTOR',
    confidence: 0.95,
    status: 'active'
  })
});
```

### Upload PCAP File
```javascript
const formData = new FormData();
formData.append('pcap', file);

fetch('http://localhost:5000/api/network/upload-pcap', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN'
  },
  body: formData
});
```

### Real-time Event Stream
```javascript
const eventSource = new EventSource('http://localhost:5000/api/stream/logs');

eventSource.onmessage = (event) => {
  const log = JSON.parse(event.data);
  console.log('New log:', log);
};
```

---

## 🔗 **RELATED DOCUMENTATION**

- [Blockchain Integration Guide](../blockchain/MOCK_BLOCKCHAIN_SOLUTION.md)
- [Frontend Integration Guide](../blockchain/FRONTEND_INTEGRATION.md)
- [Cloud Deployment Guide](../cloud/DEPLOYMENT_GUIDE.md)
- [FYP Implementation Plan](../.cursor/FYP_IMPLEMENTATION_PLAN.md)

---

## 📞 **SUPPORT**

For issues or questions:
- Check the interactive docs: `http://localhost:5000/`
- Review error messages in server logs
- Ensure MongoDB is running
- Verify JWT token validity

---

## ✅ **TESTING**

### Test All Endpoints
```bash
# Health checks
curl http://localhost:5000/api/blockchain/health
curl http://localhost:5000/api/network/health

# Login
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}' \
  | jq -r '.token')

# Test authenticated endpoints
curl http://localhost:5000/api/blockchain/statistics \
  -H "Authorization: Bearer $TOKEN"
```

---

**Last Updated:** October 23, 2025  
**API Version:** 2.0.0  
**Status:** ✅ Production Ready

