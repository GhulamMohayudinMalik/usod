# USOD - Unified Security Operations Dashboard
## Comprehensive Project Report
---

**Version:** 1.0  
**Date:** December 2025  
**Status:** Production Ready

---

## Table of Contents
1. [Executive Summary](#1-executive-summary)
2. [System Architecture](#2-system-architecture)
3. [Backend API Reference](#3-backend-api-reference)
4. [AI Service](#4-ai-service)
5. [Hyperledger Fabric Blockchain](#5-hyperledger-fabric-blockchain)
6. [Frontend Applications](#6-frontend-applications)
7. [Cloud Deployment & Automation](#7-cloud-deployment--automation)
8. [Security Features](#8-security-features)
9. [Technical Stack Summary](#9-technical-stack-summary)

---

## 1. Executive Summary

USOD is a multi-platform, enterprise-grade Security Operations Dashboard that integrates AI-powered network intrusion detection with Hyperledger Fabric blockchain for immutable threat logging. The system provides real-time monitoring capabilities across Web, Desktop (Electron), and Mobile (React Native) platforms.

**Core Value Proposition:**
- **AI Detection**: 99.97% accuracy Random Forest classifier + Isolation Forest anomaly detection
- **Immutable Audit**: Hyperledger Fabric blockchain for tamper-proof threat logs
- **Cross-Platform**: Unified experience across Web, Desktop, and Mobile
- **Real-time**: Server-Sent Events (SSE) for instant threat alerts

---

## 2. System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           PRESENTATION LAYER                                 │
│  ┌─────────────┐  ┌─────────────────┐  ┌──────────────────────┐            │
│  │   Web App   │  │  Desktop App    │  │     Mobile App       │            │
│  │  (Next.js)  │  │   (Electron)    │  │  (React Native/Expo) │            │
│  └──────┬──────┘  └───────┬─────────┘  └──────────┬───────────┘            │
└─────────┼─────────────────┼────────────────────────┼────────────────────────┘
          │                 │                        │
          └─────────────────┼────────────────────────┘
                            │ HTTPS / REST API
┌───────────────────────────▼─────────────────────────────────────────────────┐
│                         AGGREGATION LAYER                                    │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                    Node.js Backend (Express 5.1.0)                      ││
│  │   • JWT Authentication    • SSE Event Bus    • CORS Security           ││
│  │   • Route Controllers     • Middleware       • Session Management       ││
│  └─────────────────────────────────────────────────────────────────────────┘│
└───────────────────────────┬─────────────────────────────────────────────────┘
                            │
          ┌─────────────────┼─────────────────┐
          │                 │                 │
          ▼                 ▼                 ▼
┌─────────────────┐ ┌───────────────┐ ┌─────────────────────────┐
│   DETECTION     │ │  PERSISTENCE  │ │      BLOCKCHAIN         │
│     LAYER       │ │     LAYER     │ │         LAYER           │
│ ┌─────────────┐ │ │ ┌───────────┐ │ │ ┌─────────────────────┐ │
│ │ Python AI   │ │ │ │  MongoDB  │ │ │ │ Hyperledger Fabric  │ │
│ │  Service    │ │ │ └───────────┘ │ │ │   v2.5              │ │
│ │ • FastAPI   │ │ └───────────────┘ │ │ • Raft Consensus    │ │
│ │ • Scapy     │ │                   │ │ • threat-logger     │ │
│ │ • sklearn   │ │                   │ │   chaincode         │ │
│ └─────────────┘ │                   │ └─────────────────────┘ │
└─────────────────┘                   └─────────────────────────┘
```

---

## 3. Backend API Reference

### 3.1 Server Configuration
- **Framework**: Express v5.1.0 (ES Modules)
- **Port**: 5000 (configurable via `PORT` env)
- **CORS**: Open for all origins (cloud deployment mode)
- **Trust Proxy**: Enabled for accurate IP logging

### 3.2 API Routes

#### 3.2.1 Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/login` | User login with username/password | No |
| POST | `/logout` | Terminate session | Yes |
| POST | `/register` | Create new user account | No |
| POST | `/refresh` | Refresh JWT token | Yes |
| GET | `/session-status` | Check current session validity | Yes |
| POST | `/unlock-account` | Unlock locked account (Admin) | Yes |
| GET | `/security/stats` | Get security statistics | Admin |
| GET | `/security/blocked-ips` | Get blocked IP list | Admin |
| POST | `/security/block-ip` | Block an IP address | Admin |
| POST | `/security/unblock-ip` | Unblock an IP address | Admin |

#### 3.2.2 Network Monitoring (`/api/network`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/start-monitoring` | Start real-time network capture | Admin |
| POST | `/stop-monitoring` | Stop network monitoring | Admin |
| GET | `/threats` | Get detected threats (paginated) | Yes |
| GET | `/statistics` | Get AI model statistics | Yes |
| GET | `/status` | Get monitoring status | Yes |
| POST | `/upload-pcap` | Upload and analyze PCAP file | Admin |
| POST | `/webhook` | Receive threats from Python AI | Internal |
| POST | `/block-ip/:ip` | Block a specific IP | Admin |
| POST | `/unblock-ip/:ip` | Unblock a specific IP | Admin |
| POST | `/escalate/:threatId` | Escalate threat to blockchain | Admin |
| POST | `/resolve/:threatId` | Mark threat as resolved | Admin |

#### 3.2.3 Blockchain (`/api/blockchain`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/health` | Check blockchain connection | No |
| GET | `/statistics` | Get blockchain statistics | Yes |
| GET | `/threats` | Query all threats from ledger | Yes |
| GET | `/threats/:logId` | Get specific threat by ID | Yes |
| POST | `/threats/:logId/verify` | Verify log integrity (tamper detection) | Yes |
| POST | `/threats` | Create manual threat log | Yes |

#### 3.2.4 Backup Management (`/api/backup`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/security-logs` | Backup security logs | Admin |
| POST | `/users` | Backup user data | Admin |
| POST | `/full` | Full system backup | Admin |
| GET | `/list` | List available backups | Admin |
| POST | `/restore/:backupName` | Restore from backup | Admin |
| POST | `/cleanup` | Clean old backups | Admin |
| GET | `/stats` | Get backup statistics | Admin |

#### 3.2.5 User Management (`/api/users`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/create` | Create new user | Admin |
| POST | `/change-password` | Change own password | Yes |
| PUT | `/profile` | Update profile | Yes |
| GET | `/users` | List all users | Admin |
| DELETE | `/users/:userId` | Delete user | Admin |
| PUT | `/users/:userId` | Update user details | Admin |
| PUT | `/users/:userId/role` | Change user role | Admin |
| PUT | `/users/:userId/status` | Activate/Deactivate user | Admin |

#### 3.2.6 Data & Dashboard (`/api/data`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/dashboard-stats` | Get dashboard statistics | Yes |
| GET | `/security-events` | Get recent security events | Yes |
| GET | `/login-attempts` | Get login attempt history | Yes |
| GET | `/all` | Get all data | Yes |

#### 3.2.7 Logs (`/api/logs`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | Get security logs (paginated) | Yes |

#### 3.2.8 Real-time Stream (`/api/stream`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/events` | SSE endpoint for real-time events | Yes |

#### 3.2.9 Health & Utility
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | API Documentation homepage | No |
| GET | `/health` | HTML health check page | No |
| GET | `/api/health` | JSON health check (for load balancers) | No |
| GET | `/api/test-db` | Test MongoDB connection | No |

---

## 4. AI Service

### 4.1 Overview
- **Framework**: FastAPI (Python 3.9+)
- **Port**: 8000
- **Packet Capture**: Scapy
- **ML Framework**: Scikit-learn

### 4.2 Machine Learning Models

#### 4.2.1 Random Forest Classifier
- **Purpose**: Supervised classification of known attack types
- **Estimators**: 100 trees
- **Training Data**: CICIDS2017 dataset
- **Accuracy**: 99.97%
- **Attack Classes**: DDoS, PortScan, BruteForce, Infiltration, etc.

#### 4.2.2 Isolation Forest
- **Purpose**: Unsupervised anomaly detection for zero-day threats
- **Contamination**: 0.1
- **Accuracy**: 87.33%
- **Use Case**: Flagging unknown patterns for manual review

### 4.3 Feature Engineering
25 statistical features extracted from bidirectional network flows:
- Flow Duration
- Total Forward/Backward Packets
- Packet Length (Mean, Min, Max, Std)
- Inter-Arrival Time (IAT)
- TCP Flags (SYN, ACK, PSH, FIN, RST counts)
- Flow Bytes/s, Packets/s
- Window Sizes

### 4.4 AI Service Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| GET | `/health` | Detailed health status |
| POST | `/api/start-capture` | Start network monitoring |
| POST | `/api/stop-capture` | Stop network monitoring |
| GET | `/api/get-threats` | Get detected threats |
| POST | `/api/analyze-pcap` | Analyze uploaded PCAP file |
| GET | `/api/model-stats` | Get model performance metrics |

---

## 5. Hyperledger Fabric Blockchain

### 5.1 Network Configuration
- **Version**: Hyperledger Fabric v2.5
- **Consensus**: Raft (Crash Fault Tolerant)
- **Organizations**: USODOrgMSP
- **Channel**: usod-channel
- **Orderer**: orderer.usod.com:7050
- **Peer**: peer0.org1.usod.com:7051

### 5.2 Chaincode: threat-logger

#### Smart Contract Functions
| Function | Description |
|----------|-------------|
| `InitLedger()` | Initialize with sample threat data |
| `CreateThreatLog(logId, logType, threatDetails, hash, timestamp, detector)` | Create new immutable threat record |
| `ReadThreatLog(logId)` | Retrieve threat by ID |
| `ThreatLogExists(logId)` | Check if log exists |
| `VerifyThreatLog(logId, expectedHash)` | Verify integrity by comparing hashes |
| `GetAllThreats()` | Query all threats |
| `QueryThreatsByType(threatType)` | Filter threats by type |
| `QueryThreatsBySeverity(severity)` | Filter by severity |
| `QueryThreatsBySourceIP(sourceIP)` | Filter by source IP |
| `GetBlockchainStats()` | Get ledger statistics |

### 5.3 Tamper Detection Mechanism
1. When a security event occurs, a SHA-256 hash is calculated from the data
2. The original data is stored in MongoDB, the hash is stored in Hyperledger
3. To verify integrity, recalculate hash from MongoDB data and compare with blockchain hash
4. If hashes mismatch → **TAMPERED**

### 5.4 Batching Configuration
```yaml
BatchTimeout: 2s
MaxMessageCount: 10
AbsoluteMaxBytes: 99 MB
PreferredMaxBytes: 512 KB
```

---

## 6. Frontend Applications

### 6.1 Web Application (Next.js 15)
**Location**: `app/frontend/`

#### Pages/Features:
| Page | Description |
|------|-------------|
| Dashboard | Overview metrics, threat summary, system health |
| Network Monitoring | Real-time packet capture control |
| PCAP Analyzer | Upload and analyze PCAP files |
| Threats | View, filter, escalate, resolve threats |
| Blockchain | View immutable ledger, verify logs |
| Blockchain Ledger | Detailed blockchain explorer |
| Security | IP blocking, security statistics |
| Security Lab | Advanced security analysis tools |
| Analytics | Trend analysis, charts |
| AI Insights | Model performance, predictions |
| Logs | Security event audit logs |
| Backup | Create, restore, manage backups |
| Users | User management (Admin) |
| Settings | Application settings |
| Profile/Password | User profile management |

### 6.2 Desktop Application (Electron 38)
**Location**: `desktop/`

#### Electron-Specific Features:
- Native OS notifications for critical alerts
- System tray integration
- Auto-updater support
- Focus management injection for input fields
- Cross-platform: Windows, macOS, Linux

#### Pages (17 total):
Same as Web + Desktop-specific optimizations

### 6.3 Mobile Application (React Native + Expo SDK 54)
**Location**: `mobile/`

#### Screens (16 total):
| Screen | Description |
|--------|-------------|
| LoginScreen | Authentication |
| DashboardScreen | Overview with threat stats |
| NetworkMonitoringScreen | Start/stop monitoring |
| PcapAnalyzerScreen | PCAP file analysis |
| ThreatsScreen | Threat list and management |
| BlockchainScreen | Blockchain overview |
| BlockchainLedgerScreen | Detailed ledger view |
| SecurityScreen | IP management |
| SecurityLabScreen | Security tools |
| AnalyticsScreen | Charts and trends |
| AIInsightsScreen | AI model insights |
| LogsScreen | Audit logs |
| BackupScreen | Backup management |
| UsersScreen | User management |
| SettingsScreen | App settings |
| ChangePasswordScreen | Password update |

#### Mobile-Specific Features:
- 5-second polling mechanism (handles iOS background limitations)
- Expo Push Notifications
- Secure token storage (AsyncStorage + encryption)
- Play Store ready configuration

---

## 7. Cloud Deployment & Automation

### 7.1 Docker Configuration
- **Backend**: Node.js Docker image
- **AI Service**: Python Docker image with ML dependencies
- **Blockchain**: Official Hyperledger Fabric Docker images

### 7.2 CI/CD Pipeline
- GitHub Actions workflow for automated testing
- Docker Compose for local development
- Environment variable validation script

### 7.3 Cloud Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                        AWS / Cloud                          │
│  ┌─────────────────┐  ┌────────────────┐  ┌──────────────┐ │
│  │   Application   │  │   EC2 / ECS    │  │   MongoDB    │ │
│  │  Load Balancer  │──│   Backend +    │──│    Atlas     │ │
│  │                 │  │   AI Service   │  │              │ │
│  └─────────────────┘  └────────────────┘  └──────────────┘ │
│                              │                              │
│                       ┌──────┴──────┐                      │
│                       │ Blockchain  │                      │
│                       │   Nodes     │                      │
│                       └─────────────┘                      │
└─────────────────────────────────────────────────────────────┘
```

### 7.4 Environment Variables
```bash
# Backend
PORT=5000
MONGODB_URI=mongodb://...
JWT_SECRET=...
JWT_EXPIRES_IN=24h
AI_SERVICE_URL=http://localhost:8000

# Blockchain
BLOCKCHAIN_ENABLED=true
FABRIC_CHANNEL_NAME=usod-channel
FABRIC_CHAINCODE_NAME=threat-logger

# AI Service
NODEJS_BACKEND_URL=http://localhost:5000
WEBHOOK_ENDPOINT=/api/network/webhook
```

---

## 8. Security Features

### 8.1 Authentication & Authorization
- **JWT Tokens**: RS256 signed, configurable expiry
- **Role-Based Access Control (RBAC)**: Admin, User roles
- **Session Management**: Server-side session tracking with cleanup
- **Account Lockout**: Auto-lock after failed login attempts

### 8.2 Network Security
- **IP Blocking**: Manual and automatic blocking of malicious IPs
- **Rate Limiting**: Built into security check middleware
- **CORS**: Configurable origins
- **Helmet**: HTTP header hardening

### 8.3 Data Integrity
- **Blockchain Hashing**: SHA-256 hash stored in Hyperledger
- **Tamper Detection**: Compare MongoDB data against blockchain hash
- **Immutable Audit Trail**: Cannot delete or modify blockchain records

### 8.4 Logging & Auditing
All actions logged with:
- User ID, Username
- IP Address, User Agent
- Timestamp
- Action type and status
- Detailed context

---

## 9. Technical Stack Summary

| Component | Technology | Version |
|-----------|------------|---------|
| Backend | Node.js | 18.17.0 |
| Backend Framework | Express | 5.1.0 |
| Database | MongoDB | 7.x |
| ORM | Mongoose | 8.19.0 |
| AI Backend | Python | 3.9+ |
| AI Framework | FastAPI | 0.100+ |
| ML Library | Scikit-learn | 1.3.0 |
| Packet Capture | Scapy | 2.5.0 |
| Blockchain | Hyperledger Fabric | 2.5 |
| Blockchain SDK | fabric-network | 2.2.20 |
| Web Frontend | Next.js | 15.0 |
| UI Framework | React | 19 |
| Styling | TailwindCSS | 3.3 |
| Desktop | Electron | 38.0.0 |
| Mobile | React Native | 0.74 |
| Mobile SDK | Expo | 54 |

---

## Appendix: File Structure

```
usod/
├── ai/                         # Python AI Service
│   ├── main.py                 # FastAPI entry point
│   ├── services/
│   │   └── simple_detector.py  # ML inference logic
│   └── models/                 # Trained ML models
├── app/
│   ├── backend/                # Node.js Backend
│   │   └── src/
│   │       ├── routes/         # API route handlers
│   │       ├── services/       # Business logic
│   │       ├── models/         # Mongoose schemas
│   │       └── middleware/     # Auth, security
│   └── frontend/               # Next.js Web App
├── blockchain/
│   └── hyperledger/
│       ├── chaincode/          # Smart contracts
│       └── network/            # Fabric network config
├── desktop/                    # Electron App
│   ├── public/electron.js      # Main process
│   └── src/pages/              # UI pages
├── mobile/                     # React Native App
│   └── screens/                # App screens
└── publications/technical/     # Technical paper (LaTeX)
```

---

**End of Report**
