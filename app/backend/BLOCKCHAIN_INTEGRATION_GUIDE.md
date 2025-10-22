# 🔗 Blockchain Integration Guide

## Overview

This guide explains how to integrate blockchain logging into the existing USOD system.

---

## Files Created

### 1. Configuration Files (✅ Complete)
- `blockchain/network/crypto-config.yaml` - Organization structure
- `blockchain/network/configtx.yaml` - Channel configuration  
- `blockchain/network/docker-compose.yaml` - Container definitions

### 2. Scripts (✅ Complete)
- `blockchain/network/scripts/start-network.sh` - Start blockchain network
- `blockchain/network/scripts/stop-network.sh` - Stop blockchain network
- `blockchain/network/scripts/clean-network.sh` - Clean all artifacts
- `blockchain/network/scripts/deploy-chaincode.sh` - Deploy smart contract

### 3. Backend Integration (✅ Complete)
- `backend/src/services/blockchainService.js` - Blockchain interaction service
- `blockchain/connection-profiles/connection-usod.json` - SDK configuration

---

## Integration Steps

### Step 1: Install Fabric SDK (When Network is Running)

```bash
cd backend
npm install fabric-network fabric-ca-client
```

### Step 2: Modify loggingService.js

Add blockchain logging to the `networkThreat` function:

```javascript
import blockchainService from './blockchainService.js';

// In the networkThreat function, after creating the MongoDB log:

async networkThreat(threatData, req, additionalDetails = {}) {
  // ... existing code to create MongoDB log ...
  
  const log = await logSecurityEvent(userId, action, status, req, {
    // ... existing details ...
  });

  // ✨ NEW: Log to blockchain (non-blocking)
  if (log && log._id) {
    blockchainService.logThreat(log).catch(err => {
      console.error('⚠️  Blockchain logging failed (non-critical):', err.message);
      // Don't fail the request if blockchain is unavailable
    });
  }

  return log;
}
```

### Step 3: Create Blockchain Routes

Create `backend/src/routes/blockchainRoutes.js`:

```javascript
import express from 'express';
import { authenticateToken as auth } from '../middleware/auth.js';
import blockchainService from '../services/blockchainService.js';

const router = express.Router();

// Get threat from blockchain
router.get('/threat/:logId', auth, async (req, res) => {
  try {
    const result = await blockchainService.getThreatLog(req.params.logId);
    
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(404).json({ message: 'Threat not found on blockchain' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Verify threat integrity
router.post('/verify/:logId', auth, async (req, res) => {
  try {
    const { currentData } = req.body;
    const result = await blockchainService.verifyThreatLog(req.params.logId, currentData);
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all threats from blockchain
router.get('/threats', auth, async (req, res) => {
  try {
    const result = await blockchainService.getAllThreats();
    
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(500).json({ message: 'Failed to fetch threats' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get blockchain statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const result = await blockchainService.getStats();
    
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(500).json({ message: 'Failed to fetch stats' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Check blockchain availability
router.get('/status', auth, async (req, res) => {
  try {
    const available = await blockchainService.isAvailable();
    res.json({ 
      available,
      message: available ? 'Blockchain is available' : 'Blockchain is unavailable'
    });
  } catch (error) {
    res.json({ available: false, message: 'Blockchain is unavailable' });
  }
});

export default router;
```

### Step 4: Register Blockchain Routes

In `backend/src/app.js`, add:

```javascript
import blockchainRoutes from './routes/blockchainRoutes.js';

// ... after other routes ...
app.use('/api/blockchain', blockchainRoutes);
```

---

## Running the Blockchain Network

### Prerequisites (Already Done ✅)
- Docker Desktop installed and running
- Hyperledger Fabric binaries downloaded
- Chaincode developed

### When You Have Docker Images Downloaded:

1. **Start the Network:**
   ```bash
   cd blockchain/network
   bash scripts/start-network.sh
   ```

   This will:
   - Generate crypto materials
   - Create genesis block
   - Start Docker containers
   - Create channel
   - Join peer to channel

2. **Deploy Chaincode:**
   ```bash
   bash scripts/deploy-chaincode.sh
   ```

   This will:
   - Package chaincode
   - Install on peer
   - Approve for organization
   - Commit to channel
   - Initialize ledger

3. **Create User Identity for Backend:**
   
   Create `blockchain/network/scripts/enroll-user.sh`:
   ```bash
   #!/bin/bash
   # Enroll application user
   
   export FABRIC_CA_CLIENT_HOME=${PWD}/../wallets
   
   # Enroll admin
   ../bin/fabric-ca-client enroll \
     -u http://admin:adminpw@localhost:7054 \
     --caname ca.org1.usod.com \
     -M ${FABRIC_CA_CLIENT_HOME}/admin
   
   # Register appUser
   ../bin/fabric-ca-client register \
     --caname ca.org1.usod.com \
     --id.name appUser \
     --id.secret appUserPw \
     --id.type client \
     -M ${FABRIC_CA_CLIENT_HOME}/admin
   
   # Enroll appUser
   ../bin/fabric-ca-client enroll \
     -u http://appUser:appUserPw@localhost:7054 \
     --caname ca.org1.usod.com \
     -M ${FABRIC_CA_CLIENT_HOME}/appUser
   
   echo "✅ Application user enrolled"
   ```

   Run it:
   ```bash
   bash scripts/enroll-user.sh
   ```

4. **Test Backend Connection:**
   ```bash
   cd ../../backend
   node -e "import('./src/services/blockchainService.js').then(m => m.default.isAvailable().then(a => console.log('Blockchain available:', a)))"
   ```

---

## Frontend Integration

### Add Blockchain Verification UI

In your threat details modal or AI Insights page:

```javascript
const verifyThreat = async (threatId, threatData) => {
  try {
    const response = await fetch(`/api/blockchain/verify/${threatId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ currentData: threatData })
    });
    
    const result = await response.json();
    
    if (result.valid) {
      alert('✅ Threat data is verified and untampered!');
    } else {
      alert('❌ WARNING: Threat data has been tampered!');
    }
  } catch (error) {
    console.error('Verification failed:', error);
  }
};
```

### Add Blockchain Status Indicator

```javascript
const [blockchainStatus, setBlockchainStatus] = useState(null);

useEffect(() => {
  const checkBlockchain = async () => {
    try {
      const response = await fetch('/api/blockchain/status', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setBlockchainStatus(data.available);
    } catch (error) {
      setBlockchainStatus(false);
    }
  };
  
  checkBlockchain();
}, []);

// In your UI:
{blockchainStatus && (
  <div className="bg-green-100 p-2 rounded">
    🔗 Blockchain Active - All threats are immutable
  </div>
)}
```

---

## Testing

### Test Chaincode Directly

```bash
# From blockchain/network directory

# Create a test threat
docker exec cli peer chaincode invoke \
  -C usod-channel \
  -n threat-logger \
  -c '{"function":"CreateThreatLog","Args":["test123","network_threat","{\"type\":\"port_scan\",\"severity\":\"high\"}","abc123","2025-10-21T23:00:00Z","test"]}'

# Query the threat
docker exec cli peer chaincode query \
  -C usod-channel \
  -n threat-logger \
  -c '{"function":"ReadThreatLog","Args":["test123"]}'

# Get all threats
docker exec cli peer chaincode query \
  -C usod-channel \
  -n threat-logger \
  -c '{"function":"GetAllThreats","Args":[]}'
```

### Test via Backend API

```bash
# Check blockchain status
curl http://localhost:5000/api/blockchain/status \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get blockchain stats
curl http://localhost:5000/api/blockchain/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Monitoring

### View Container Logs

```bash
# Orderer logs
docker logs -f orderer.usod.com

# Peer logs
docker logs -f peer0.org1.usod.com

# Chaincode logs
docker logs -f $(docker ps | grep "dev-peer0" | awk '{print $1}')
```

### Check Blockchain Status

```bash
# List running containers
docker ps

# Check channel info
docker exec cli peer channel getinfo -c usod-channel

# Query installed chaincodes
docker exec cli peer lifecycle chaincode queryinstalled
```

---

## Troubleshooting

### Issue: Backend can't connect to blockchain

**Check:**
1. Is Docker running? `docker ps`
2. Are containers healthy? Look for "Up" status
3. Is the wallet created? Check `blockchain/wallets/appUser`
4. Is connection profile correct? Check `blockchain/connection-profiles/connection-usod.json`

**Solution:**
```bash
cd blockchain/network
bash scripts/enroll-user.sh
```

### Issue: Chaincode not found

**Solution:**
```bash
cd blockchain/network
bash scripts/deploy-chaincode.sh
```

### Issue: Network won't start

**Solution:**
```bash
cd blockchain/network
bash scripts/clean-network.sh
bash scripts/start-network.sh
```

---

## Performance Considerations

### Blockchain is Optional

The system is designed to work even if blockchain is unavailable:

```javascript
// Blockchain logging is non-blocking
blockchainService.logThreat(log).catch(err => {
  console.error('Blockchain unavailable, continuing with MongoDB only');
});
```

### For Production

1. **Enable TLS** - Change `CORE_PEER_TLS_ENABLED=true` in docker-compose.yaml
2. **Use Raft Consensus** - Replace `solo` orderer with Raft for fault tolerance
3. **Add More Peers** - Increase redundancy
4. **Implement Caching** - Cache blockchain queries
5. **Use Events** - Listen to blockchain events instead of polling

---

## Summary

### ✅ What's Ready Now:
- Network configuration files
- Docker compose setup
- Startup/deployment scripts
- Blockchain service (backend)
- Connection profile
- Chaincode (smart contract)

### ⏳ What Needs Docker Images:
- Starting the network
- Deploying chaincode
- Testing end-to-end
- Creating user identities

### 🎯 Next Session Tasks:
1. Download Docker images (~1.5-2 GB)
2. Run `bash scripts/start-network.sh`
3. Run `bash scripts/deploy-chaincode.sh`
4. Run `bash scripts/enroll-user.sh`
5. Install Fabric SDK: `npm install fabric-network fabric-ca-client`
6. Add blockchain routes to backend
7. Test with Postman/frontend

---

**Everything is prepared and ready to go!** 🚀

