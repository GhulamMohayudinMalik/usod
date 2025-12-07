# USOD Blockchain - Hyperledger Fabric Implementation

## Overview
This directory contains a **fully operational Hyperledger Fabric blockchain** for immutable threat log storage in the USOD (Unified Security Operations Dashboard) system.

## Status: ✅ 100% OPERATIONAL

**Deployment Method:** Traditional Hyperledger Fabric (Docker-based chaincode)  
**Network Type:** Single Organization, Single Peer, Solo Orderer  
**Chaincode Language:** Node.js (fabric-contract-api)  
**Current Version:** 1.0  

---

## 📁 Directory Structure

```
blockchain/
├── bin/                       # Hyperledger Fabric binaries (v2.5)
│   ├── cryptogen.exe          # Crypto material generation
│   ├── configtxgen.exe        # Channel & genesis block generation
│   └── peer.exe               # Peer CLI tool
│
├── hyperledger/               # ACTIVE BLOCKCHAIN IMPLEMENTATION
│   ├── network/
│   │   ├── docker-compose.yaml      # Container definitions
│   │   ├── configtx.yaml            # Channel configuration
│   │   ├── crypto-config.yaml       # Organization structure
│   │   ├── scripts/
│   │   │   ├── start-persistent.ps1 # Start network (with persistence)
│   │   │   ├── stop.ps1             # Stop network (preserves data)
│   │   │   ├── reset.ps1            # Full reset (wipes all data)
│   │   │   ├── deploy-chaincode.ps1 # Deploy chaincode
│   │   │   ├── setup-wallet.ps1     # Setup admin wallet
│   │   │   ├── backup-blockchain.ps1    # Backup data
│   │   │   └── restore-backup.ps1       # Restore from backup
│   │   ├── crypto-config/           # Generated certificates
│   │   └── channel-artifacts/       # Genesis block, channel tx
│   │
│   └── chaincode/
│       └── threat-logger/
│           ├── index.js             # Smart contract (10 functions)
│           └── package.json         # Dependencies
│
├── wallets/                   # Admin identity for backend
│   └── admin.id               # Admin credentials (Fabric SDK format)
│
├── README.md                  # This file
├── ENHANCEMENT.md             # Future improvements guide
├── HASHING_VERIFICATION_SYSTEM.md  # Hash verification documentation
└── CLOUD_DEPLOYMENT.md        # Cloud deployment guide
```

---

## 🚀 Quick Start

### Prerequisites
- Docker Desktop running
- PowerShell
- Windows 10/11 or WSL2

### 1. First Time Setup
```powershell
cd blockchain/hyperledger/network
.\scripts\start-persistent.ps1    # Creates channel, generates crypto
.\scripts\deploy-chaincode.ps1    # Deploys smart contract
.\scripts\setup-wallet.ps1        # Creates admin identity for backend
```

### 2. Normal Start/Stop (Data Preserved)
```powershell
.\scripts\stop.ps1               # Stop - keeps all data!
.\scripts\start-persistent.ps1   # Restart - data intact!
```

### 3. Full Reset (Wipe Everything)
```powershell
.\scripts\reset.ps1              # WARNING: Deletes all blockchain data
.\scripts\start-persistent.ps1   # Fresh start
.\scripts\deploy-chaincode.ps1   # Redeploy chaincode
.\scripts\setup-wallet.ps1       # Regenerate wallet
```

### 4. Verify Network Status
```powershell
docker ps --format "table {{.Names}}\t{{.Status}}"
docker exec cli peer channel list  # Should show: usod-channel
```

---

## 📋 Available Chaincode Functions

| Function | Type | Description |
|----------|------|-------------|
| `InitLedger` | Write | Initialize ledger with sample threat |
| `CreateThreatLog` | Write | Create new immutable threat log |
| `ReadThreatLog` | Read | Get specific threat by ID |
| `GetAllThreats` | Read | Retrieve all threat logs |
| `GetThreatsByType` | Read | Filter by threat type (e.g., "network_threat") |
| `GetThreatsBySeverity` | Read | Filter by severity (e.g., "high", "critical") |
| `GetThreatsBySourceIP` | Read | Filter by source IP address |
| `GetThreatStats` | Read | Get blockchain statistics |
| `VerifyThreatLog` | Read | Verify log integrity with hash |
| `ThreatLogExists` | Read | Check if log exists |

---

## 🔧 Architecture

### Network Components
- **Orderer** (`orderer.usod.com:7050`) - Transaction ordering service
- **Peer** (`peer0.org1.usod.com:7051`) - Endorsing peer, ledger storage
- **CLI** - Command-line interface for peer operations
- **Chaincode Container** - Node.js smart contract runtime

### Data Flow
```
1. Application → REST API (Node.js backend)
2. Backend → Fabric SDK → Peer
3. Peer → Chaincode (validate & execute)
4. Chaincode → World State (CouchDB/LevelDB)
5. Transaction → Orderer → Block
6. Block → Blockchain (immutable ledger)
```

---

## 📊 Verification

Check if blockchain is running:
```powershell
docker ps --format "table {{.Names}}\t{{.Status}}"
```

**Expected containers:**
- `orderer.usod.com` - Up
- `peer0.org1.usod.com` - Up
- `cli` - Up
- `dev-peer0.org1.usod.com-threat-logger_1.0-...` - Up

---

## 🔗 Integration with Backend

**Next Step:** Connect the Node.js backend to this blockchain using the Hyperledger Fabric SDK.

**Connection Profile:** Will be created in `backend/src/config/connection-profile.json`

**Backend Service:** `backend/src/services/blockchainService.js` will handle:
- Creating threat logs from AI detections
- Querying historical threats
- Verifying log integrity
- Providing immutable audit trail

---

## 📝 Important Notes

### Data Persistence
- **`stop.ps1`** - Stops network but **preserves all data**
- **`reset.ps1`** - **WIPES all data** (use with caution)
- Data is stored in Docker volumes: `orderer_data`, `peer0_ledger`, `peer0_chaincode`

### Chaincode Updates
To update chaincode:
1. Modify `hyperledger/chaincode/threat-logger/index.js`
2. Increment version in `deploy-chaincode.ps1`
3. Increment sequence number
4. Run `.\scripts\deploy-chaincode.ps1`

---

## ⚠️ Troubleshooting

**Issue:** "channel does not exist" errors  
**Fix:** Run `.\scripts\reset.ps1` then full setup again

**Issue:** Chaincode container not starting  
**Fix:** Check `docker logs <chaincode-container-name>`

**Issue:** Permission errors  
**Fix:** Run Docker Desktop as Administrator

**Issue:** Port conflicts  
**Fix:** Ensure ports 7050, 7051, 7052 are available

---

## 📚 Documentation

- **ENHANCEMENT.md** - Future improvements guide
- **HASHING_VERIFICATION_SYSTEM.md** - Hash verification explained
- **CLOUD_DEPLOYMENT.md** - Cloud hosting guide

---

**Last Updated:** December 2025  
**Status:** Production-ready with full data persistence
