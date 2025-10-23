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
├── bin/                    # Hyperledger Fabric binaries
│   ├── cryptogen.exe      # Crypto material generation
│   ├── configtxgen.exe    # Channel & genesis block generation
│   └── peer.exe           # Peer CLI tool
│
├── hyperledger/           # ACTIVE BLOCKCHAIN IMPLEMENTATION
│   ├── network/
│   │   ├── docker-compose.yaml      # Container definitions
│   │   ├── configtx.yaml            # Channel configuration
│   │   ├── crypto-config.yaml       # Organization structure
│   │   ├── scripts/
│   │   │   ├── start.ps1            # Start network
│   │   │   ├── deploy-chaincode.ps1 # Deploy chaincode
│   │   │   └── stop.ps1             # Stop network
│   │   ├── crypto-config/           # Generated certificates
│   │   └── channel-artifacts/       # Genesis block, channel tx
│   │
│   └── chaincode/
│       └── threat-logger/
│           ├── index.js             # Smart contract (10 functions)
│           └── package.json         # Dependencies
│
├── README.md              # This file
└── ENHANCEMENT.md         # Refactoring & improvement guide
```

---

## 🚀 Quick Start

### Prerequisites
- Docker Desktop running
- PowerShell
- Windows 10/11 or WSL2

### 1. Start the Blockchain Network
```powershell
cd blockchain/hyperledger/network
.\scripts\start.ps1
```

**Expected Output:**
- ✅ Crypto materials generated
- ✅ Genesis block created
- ✅ Channel `usod-channel` created
- ✅ Peer joined to channel

### 2. Deploy Chaincode
```powershell
.\scripts\deploy-chaincode.ps1
```

**Expected Output:**
- ✅ Chaincode packaged
- ✅ Installed on peer
- ✅ Approved and committed
- ✅ Docker container running: `dev-peer0.org1.usod.com-threat-logger_1.0-...`

### 3. Test the Blockchain
```powershell
# Initialize with sample data
docker exec cli peer chaincode invoke -C usod-channel -n threat-logger -c '{"function":"InitLedger","Args":[]}'

# Query all threats
docker exec cli peer chaincode query -C usod-channel -n threat-logger -c '{"function":"GetAllThreats","Args":[]}'

# Create a new threat log
docker exec cli peer chaincode invoke -C usod-channel -n threat-logger -c '{"function":"CreateThreatLog","Args":["TEST001","network_threat","{\"type\":\"port_scan\",\"severity\":\"high\"}","hash123","2025-10-23T12:00:00Z","AI_DETECTOR"]}'
```

### 4. Stop the Network
```powershell
.\scripts\stop.ps1
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

### Windows Path Fix
After starting the network, always run:
```powershell
Get-ChildItem -Path crypto-config -Recurse -Filter "config.yaml" | ForEach-Object { 
    $content = Get-Content $_.FullName -Raw 
    $content = $content -replace '\\', '/' 
    Set-Content -Path $_.FullName -Value $content -NoNewline 
}
```
This fixes Windows backslash paths that `cryptogen.exe` generates.

### Chaincode Updates
To update chaincode:
1. Modify `hyperledger/chaincode/threat-logger/index.js`
2. Increment version in `deploy-chaincode.ps1`
3. Increment sequence number
4. Run `.\scripts\deploy-chaincode.ps1`

---

## 🎯 Success Criteria (All Met ✅)

- [x] Network starts without errors
- [x] Channel created and peer joined
- [x] Chaincode deployed successfully
- [x] Chaincode container running
- [x] InitLedger returns status:200
- [x] GetAllThreats returns data
- [x] CreateThreatLog stores new threats
- [x] Data persists across queries
- [x] Immutable ledger verified

---

## 📚 Documentation

- **ENHANCEMENT.md** - Refactoring guide and improvement strategies
- **hyperledger/network/scripts/** - Automated deployment scripts
- **hyperledger/chaincode/threat-logger/index.js** - Smart contract source code

---

## ⚠️ Troubleshooting

**Issue:** Chaincode container not starting  
**Fix:** Check `docker logs <chaincode-container-name>`

**Issue:** Permission errors  
**Fix:** Run Docker Desktop as Administrator

**Issue:** Port conflicts  
**Fix:** Ensure ports 7050, 7051, 7052 are available

**Issue:** Windows path errors  
**Fix:** Run the path fix command above

---

## 🏆 Project Status

**Blockchain Component: 100% COMPLETE**

✅ Traditional Hyperledger Fabric deployment  
✅ Working on Windows with Docker Desktop  
✅ All 10 chaincode functions operational  
✅ Immutable threat log storage verified  
✅ Ready for backend integration  

---

**Last Updated:** October 23, 2025  
**Deployment Method:** Traditional Docker-based chaincode (CCaaS abandoned)  
**Status:** Production-ready for FYP demonstration
