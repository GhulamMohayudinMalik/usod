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
├── wallets/                   # ⚠️ IMPORTANT: Admin identity for backend (MUST be here!)
│   ├── admin.id               # Admin credentials (Fabric SDK format)
│   ├── admin-cert.pem         # Admin certificate
│   └── admin-key.pem          # Admin private key
│
├── README.md                  # This file
├── ENHANCEMENT.md             # Future improvements guide
├── HASHING_VERIFICATION_SYSTEM.md  # Hash verification documentation
└── CLOUD_DEPLOYMENT.md        # Cloud deployment guide
```

> **⚠️ IMPORTANT:** The `wallets/` directory MUST be at `blockchain/wallets/`, NOT at `app/blockchain/wallets/`. The backend service looks for the wallet at this exact location.

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
.\scripts\reset.ps1              # WARNING: Deletes all blockchain data AND wallet
.\scripts\start-persistent.ps1   # Fresh start
.\scripts\deploy-chaincode.ps1   # Redeploy chaincode
.\scripts\setup-wallet.ps1       # Regenerate wallet (REQUIRED!)
```

> **⚠️ After Reset:** You MUST restart the backend server (`npm run dev` in `app/backend`) for it to reconnect to the blockchain with the new wallet.

### 4. Verify Network Status
```powershell
# Check Docker containers are running
docker ps --format "table {{.Names}}\t{{.Status}}"

# Verify channel exists
docker exec cli peer channel list  # Should show: usod-channel

# Verify chaincode is deployed
docker exec cli peer lifecycle chaincode querycommitted --channelID usod-channel
```

### 5. Verify Backend Connection
After the blockchain is running, the backend should show:
```
🔗 Blockchain Service initialized
   Channel: usod-channel
   Chaincode: threat-logger
   Wallet: C:\...\usod\blockchain\wallets
```

To test connection manually:
```powershell
cd app/backend
node -e "import('./src/services/blockchainService.js').then(m => m.default.isAvailable().then(r => console.log('Available:', r)))"
```
Should output: `Available: true`

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

The Node.js backend connects to this blockchain using the Hyperledger Fabric SDK.

**Connection Profile:** `app/backend/src/config/connection-profile.json`

**Backend Service:** `app/backend/src/services/blockchainService.js` handles:
- Creating threat logs from AI detections
- Querying historical threats
- Verifying log integrity
- Providing immutable audit trail

**Wallet Location:** `blockchain/wallets/` (contains `admin.id`, `admin-cert.pem`, `admin-key.pem`)

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

### Backend Restart Requirements
You must restart the backend server after:
- Running `reset.ps1` (wallet is regenerated)
- Running `setup-wallet.ps1` (wallet is updated)
- Restarting Docker containers (connections are reset)

---

## ⚠️ Troubleshooting

### Backend says "Blockchain disconnected" or "Identity not found"
**Cause:** Wallet not found or backend hasn't loaded the new wallet  
**Fix:**
1. Verify wallet exists: `ls blockchain/wallets/` should show `admin.id`
2. If missing, run: `.\scripts\setup-wallet.ps1`
3. Restart the backend server

### "Channel does not exist" errors
**Cause:** Channel not created or peer not joined  
**Fix:** Run `.\scripts\reset.ps1` then full setup again:
```powershell
.\scripts\start-persistent.ps1
.\scripts\deploy-chaincode.ps1
.\scripts\setup-wallet.ps1
# Then restart backend
```

### Chaincode container not starting
**Cause:** Docker or chaincode issue  
**Fix:** Check logs: `docker logs <chaincode-container-name>`

### Permission errors
**Cause:** Docker Desktop permissions  
**Fix:** Run Docker Desktop as Administrator

### Port conflicts (7050, 7051, 7052)
**Cause:** Ports already in use  
**Fix:** Stop other services using these ports, or modify `docker-compose.yaml`

### Backend shows wrong wallet path
**Cause:** Wallet path misconfigured in `blockchainService.js`  
**Expected path:** `blockchain/wallets/` (relative to project root)  
**Fix:** Verify `blockchainService.js` uses `path.join(__dirname, '../../../../blockchain/wallets')`

---

## 📚 Documentation

- **ENHANCEMENT.md** - Future improvements guide
- **HASHING_VERIFICATION_SYSTEM.md** - Hash verification explained
- **CLOUD_DEPLOYMENT.md** - Cloud hosting guide

---

## 🔄 Complete Reset & Setup Checklist

If blockchain isn't working, follow this complete checklist:

```powershell
# 1. Navigate to network directory
cd blockchain/hyperledger/network

# 2. Full reset (wipes everything)
.\scripts\reset.ps1

# 3. Start fresh network
.\scripts\start-persistent.ps1

# 4. Wait 10 seconds for containers to initialize
Start-Sleep -Seconds 10

# 5. Deploy chaincode
.\scripts\deploy-chaincode.ps1

# 6. Setup wallet
.\scripts\setup-wallet.ps1

# 7. Verify containers are running
docker ps

# 8. Verify wallet exists
ls ../../wallets/

# 9. IMPORTANT: Restart backend server
# Stop the current backend (Ctrl+C) and restart:
cd ../../../app/backend
npm run dev

# 10. Test connection
node -e "import('./src/services/blockchainService.js').then(m => m.default.isAvailable().then(r => console.log('Available:', r)))"
```

---

**Last Updated:** January 2026  
**Status:** Production-ready with full data persistence
