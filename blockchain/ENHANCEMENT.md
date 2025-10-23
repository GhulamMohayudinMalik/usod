# Blockchain Enhancement & Refactoring Guide

## Current Status: 100% Operational ✅

**Implementation:** Traditional Hyperledger Fabric (Docker-based chaincode)  
**Completion:** All core functionality working  
**Next Phase:** Backend integration & optimization  

---

## 🏗️ Current Architecture

### Network Topology
```
┌─────────────────────────────────────────────────────────┐
│                    USOD Blockchain                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────┐    ┌──────────────┐   ┌──────────┐  │
│  │   Orderer    │◄───┤     Peer     │◄──┤   CLI    │  │
│  │  Solo Mode   │    │  USODOrgMSP  │   │  Admin   │  │
│  │  Port 7050   │    │  Port 7051   │   │  Tools   │  │
│  └──────────────┘    └──────┬───────┘   └──────────┘  │
│                              │                          │
│                      ┌───────▼──────────┐              │
│                      │   Chaincode      │              │
│                      │  threat-logger   │              │
│                      │   Node.js 18     │              │
│                      └──────────────────┘              │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Key Components

1. **Orderer Service** (`orderer.usod.com`)
   - Type: Solo (single node)
   - Role: Transaction ordering, block creation
   - Port: 7050

2. **Peer Node** (`peer0.org1.usod.com`)
   - Organization: USODOrgMSP
   - Role: Endorsement, ledger storage, chaincode hosting
   - Ports: 7051 (peer), 7052 (chaincode)

3. **Chaincode** (`threat-logger`)
   - Language: Node.js (fabric-contract-api)
   - Deployment: Traditional Docker container
   - Functions: 10 threat management operations

4. **CLI Container**
   - Tool: fabric-tools:2.5
   - Purpose: Administrative operations
   - Access: Direct peer communication

---

## 📂 Directory Flow

### Startup Flow (`scripts/start.ps1`)
```
1. Clean previous artifacts
   └─ Remove crypto-config, channel-artifacts

2. Generate crypto materials
   └─ cryptogen → crypto-config/
        ├─ ordererOrganizations/
        └─ peerOrganizations/

3. Generate genesis block
   └─ configtxgen → channel-artifacts/genesis.block

4. Generate channel transaction
   └─ configtxgen → channel-artifacts/channel.tx

5. Generate anchor peer update
   └─ configtxgen → channel-artifacts/USODOrgMSPanchors.tx

6. Start Docker containers
   └─ docker-compose up -d
        ├─ orderer.usod.com
        ├─ peer0.org1.usod.com
        └─ cli

7. Create & join channel
   └─ peer channel create/join → usod-channel

8. Update anchor peers
   └─ peer channel update → anchor configuration
```

### Chaincode Deployment Flow (`scripts/deploy-chaincode.ps1`)
```
1. Package chaincode
   └─ peer lifecycle chaincode package
        └─ threat-logger.tar.gz (includes source code)

2. Install on peer
   └─ peer lifecycle chaincode install
        └─ Package ID generated

3. Approve for organization
   └─ peer lifecycle chaincode approveformyorg
        └─ USODOrgMSP approval

4. Commit definition
   └─ peer lifecycle chaincode commit
        └─ Chaincode activated on channel

5. Automatic container creation
   └─ Peer builds & starts Docker container
        └─ dev-peer0.org1.usod.com-threat-logger_1.0-<hash>
```

---

## 🔧 How to Use for Refactoring

### 1. Modify Chaincode Logic

**File:** `hyperledger/chaincode/threat-logger/index.js`

**Add New Function:**
```javascript
async GetThreatsByTimeRange(ctx, startTime, endTime) {
    const query = {
        selector: {
            timestamp: {
                $gte: startTime,
                $lte: endTime
            }
        }
    };
    
    const iterator = await ctx.stub.getQueryResult(JSON.stringify(query));
    const results = [];
    
    let result = await iterator.next();
    while (!result.done) {
        const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
        results.push(JSON.parse(strValue));
        result = await iterator.next();
    }
    
    await iterator.close();
    return JSON.stringify(results);
}
```

**Deploy Updated Chaincode:**
1. Increment version: `threat-logger_1.0` → `threat-logger_1.1`
2. Increment sequence: `--sequence 1` → `--sequence 2`
3. Run: `.\scripts\deploy-chaincode.ps1`

### 2. Add New Organization

**Modify:** `crypto-config.yaml`
```yaml
PeerOrgs:
  - Name: USODOrg
    Domain: org1.usod.com
    Template:
      Count: 1
  
  # Add second organization
  - Name: PartnerOrg
    Domain: org2.usod.com
    Template:
      Count: 1
```

**Update:** `configtx.yaml` with new org definition  
**Regenerate:** Crypto materials and channel configuration  

### 3. Scale to Multiple Peers

**Modify:** `crypto-config.yaml`
```yaml
PeerOrgs:
  - Name: USODOrg
    Domain: org1.usod.com
    Template:
      Count: 2  # Changed from 1
```

**Add to:** `docker-compose.yaml`
```yaml
peer1.org1.usod.com:
  container_name: peer1.org1.usod.com
  image: hyperledger/fabric-peer:2.5
  # ... similar configuration to peer0
  ports:
    - 8051:7051  # Different port
```

### 4. Enable CouchDB State Database

**Benefits:**
- Rich queries (JSON)
- Better indexing
- Complex query support

**Add to:** `docker-compose.yaml`
```yaml
couchdb0:
  container_name: couchdb0
  image: couchdb:3.3
  environment:
    - COUCHDB_USER=admin
    - COUCHDB_PASSWORD=adminpw
  ports:
    - 5984:5984

peer0.org1.usod.com:
  environment:
    - CORE_LEDGER_STATE_STATEDATABASE=CouchDB
    - CORE_LEDGER_STATE_COUCHDBCONFIG_COUCHDBADDRESS=couchdb0:5984
    - CORE_LEDGER_STATE_COUCHDBCONFIG_USERNAME=admin
    - CORE_LEDGER_STATE_COUCHDBCONFIG_PASSWORD=adminpw
  depends_on:
    - couchdb0
```

---

## 🚀 Performance Optimization

### 1. Chaincode Optimization

**Current:** All queries scan full ledger  
**Improvement:** Add indexes for common queries

**Create:** `hyperledger/chaincode/threat-logger/META-INF/statedb/couchdb/indexes/indexSeverity.json`
```json
{
  "index": {
    "fields": ["threatDetails.severity"]
  },
  "ddoc": "indexSeverityDoc",
  "name": "indexSeverity",
  "type": "json"
}
```

### 2. Batch Transactions

**Instead of:**
```javascript
for (const threat of threats) {
    await CreateThreatLog(ctx, threat.id, ...);
}
```

**Use:**
```javascript
async CreateBatchThreatLogs(ctx, threatsJSON) {
    const threats = JSON.parse(threatsJSON);
    for (const threat of threats) {
        await ctx.stub.putState(threat.logId, Buffer.from(JSON.stringify(threat)));
    }
    return JSON.stringify({ count: threats.length });
}
```

### 3. Enable Block Event Listening

**Backend Integration:**
```javascript
const { Gateway, Wallets } = require('fabric-network');

// Listen for new blocks
const network = await gateway.getNetwork('usod-channel');
const listener = await network.addBlockListener('my-listener', 
    async (event) => {
        console.log('New block:', event.blockNumber);
        // Process new threats
    }
);
```

---

## 🔐 Security Enhancements

### 1. Enable TLS

**Update:** `docker-compose.yaml`
```yaml
peer0.org1.usod.com:
  environment:
    - CORE_PEER_TLS_ENABLED=true
    - CORE_PEER_TLS_CERT_FILE=/etc/hyperledger/fabric/tls/server.crt
    - CORE_PEER_TLS_KEY_FILE=/etc/hyperledger/fabric/tls/server.key
```

**Update chaincode invocations:**
```powershell
docker exec cli peer chaincode invoke --tls --cafile $ORDERER_CA ...
```

### 2. Add Access Control

**Modify chaincode:**
```javascript
async DeleteThreatLog(ctx, logId) {
    // Check caller identity
    const mspId = ctx.clientIdentity.getMSPID();
    if (mspId !== 'USODOrgMSP') {
        throw new Error('Unauthorized: Only USOD admins can delete');
    }
    
    // Check caller has admin role
    const isAdmin = ctx.clientIdentity.assertAttributeValue('role', 'admin');
    if (!isAdmin) {
        throw new Error('Unauthorized: Admin role required');
    }
    
    await ctx.stub.deleteState(logId);
}
```

### 3. Implement Private Data Collections

**For sensitive threat details:**

**Create:** `hyperledger/chaincode/threat-logger/collections_config.json`
```json
[
  {
    "name": "threatPrivateDetails",
    "policy": "OR('USODOrgMSP.member')",
    "requiredPeerCount": 0,
    "maxPeerCount": 3,
    "blockToLive": 1000000
  }
]
```

**Use in chaincode:**
```javascript
await ctx.stub.putPrivateData('threatPrivateDetails', logId, Buffer.from(sensitiveData));
```

---

## 📊 Monitoring & Debugging

### 1. View Chaincode Logs
```powershell
docker logs dev-peer0.org1.usod.com-threat-logger_1.0-<hash> -f
```

### 2. View Peer Logs
```powershell
docker logs peer0.org1.usod.com -f
```

### 3. Inspect Ledger
```powershell
# Get block by number
docker exec cli peer channel getinfo -c usod-channel

# Fetch specific block
docker exec cli peer channel fetch 0 -c usod-channel
```

### 4. Query Installed Chaincode
```powershell
docker exec cli peer lifecycle chaincode queryinstalled
docker exec cli peer lifecycle chaincode querycommitted -C usod-channel
```

---

## 🔄 Upgrade Path

### Switch from Solo to Raft Consensus

**Benefits:**
- Fault tolerance
- Production-ready
- Better performance

**Steps:**
1. Add 3+ orderer nodes in `crypto-config.yaml`
2. Update `configtx.yaml` with Raft profile
3. Configure Raft parameters (tick interval, election timeout)
4. Regenerate genesis block
5. Restart network

---

## 🐛 Common Issues & Fixes

### Issue: Chaincode container exits immediately
**Fix:** Check chaincode syntax errors in logs
```powershell
docker logs <chaincode-container> --tail 100
```

### Issue: Windows path errors (`\` instead of `/`)
**Fix:** Run path fix after network start
```powershell
Get-ChildItem -Path crypto-config -Recurse -Filter "config.yaml" | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    $content = $content -replace '\\', '/'
    Set-Content -Path $_.FullName -Value $content -NoNewline
}
```

### Issue: Port conflicts
**Fix:** Change ports in `docker-compose.yaml`
```yaml
ports:
  - 8050:7050  # Changed from 7050:7050
```

### Issue: Docker network not found
**Fix:** Ensure `CORE_VM_DOCKER_HOSTCONFIG_NETWORKMODE=network_usod` matches actual Docker network name

---

## 📈 Scalability Roadmap

### Phase 1: Current (✅ Complete)
- Single org, single peer, solo orderer
- Basic threat logging
- 10 chaincode functions

### Phase 2: Enhanced Performance
- CouchDB state database
- Indexed queries
- Batch operations
- Event listeners

### Phase 3: Production Deployment
- Multi-peer deployment (3+ peers)
- Raft consensus (3+ orderers)
- TLS enabled
- Private data collections

### Phase 4: Multi-Organization
- Add partner organizations
- Endorsement policies
- Channel access control
- Cross-org threat sharing

---

## 🎯 Integration Checklist

### Backend Integration
- [ ] Install Fabric SDK (`npm install fabric-network fabric-ca-client`)
- [ ] Create connection profile (JSON)
- [ ] Generate admin identity/wallet
- [ ] Implement `blockchainService.js`
- [ ] Create threat logging middleware
- [ ] Add blockchain routes to Express
- [ ] Test end-to-end flow

### Frontend Integration
- [ ] Create blockchain status widget
- [ ] Display threat log verification
- [ ] Show blockchain statistics
- [ ] Add ledger query interface
- [ ] Implement verification UI

---

## 📚 Resources

- **Hyperledger Fabric Docs:** https://hyperledger-fabric.readthedocs.io/
- **Chaincode Tutorial:** https://hyperledger-fabric.readthedocs.io/en/latest/chaincode.html
- **Fabric SDK Node:** https://hyperledger.github.io/fabric-sdk-node/
- **Production Deployment:** https://hyperledger-fabric.readthedocs.io/en/latest/deployment_guide_overview.html

---

**Last Updated:** October 23, 2025  
**Current Phase:** Backend Integration (Next)  
**Status:** Ready for production FYP demonstration
