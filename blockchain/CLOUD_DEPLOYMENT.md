# USOD Blockchain - Cloud Deployment Guide

**Document Version:** 1.0  
**Last Updated:** December 2025  
**Status:** Production Guide

---

## 🎯 Overview

This guide covers deploying the USOD Hyperledger Fabric blockchain to cloud infrastructure. The blockchain provides immutable threat log storage for the USOD security monitoring system.

---

## ☁️ Cloud Provider Options

### Supported Providers

| Provider | Service | Best For |
|----------|---------|----------|
| **Oracle Cloud** | OCI Compute + Block Volume | **Always Free Tier available!** |
| **AWS** | EC2 + EBS | Most flexible, good Docker support |
| **Azure** | Azure VM + Managed Disks | Enterprise integration |
| **GCP** | Compute Engine + Persistent Disk | Cost-effective |
| **DigitalOcean** | Droplets | Simple, budget-friendly |

### ⭐ Recommended: Oracle Cloud Infrastructure (OCI)
Oracle offers a generous **Always Free Tier** that includes:
- 2 AMD-based Compute VMs (1/8 OCPU, 1 GB RAM each)
- **4 ARM-based Ampere A1 Cores + 24 GB RAM** (can be 1 VM or split)
- 200 GB total block volume storage
- 10 TB/month outbound data transfer

This is perfect for running a Hyperledger Fabric network!

### Minimum Requirements
- **vCPU:** 2 cores (4 recommended)
- **RAM:** 4 GB (8 GB recommended)
- **Storage:** 50 GB SSD (expandable)
- **OS:** Ubuntu 22.04 LTS (recommended)
- **Docker:** 24.0+
- **Docker Compose:** 2.20+

---

## 🚀 Deployment Steps

### Step 1: Provision Cloud VM

---

## 🔶 Oracle Cloud Infrastructure (OCI) Deployment

### 1.1 Create OCI Account
1. Go to [cloud.oracle.com](https://cloud.oracle.com)
2. Sign up for Free Tier (credit card required but won't be charged for Always Free resources)
3. Select your home region (choose closest to your users)

### 1.2 Create Compute Instance

**Via OCI Console:**
1. Navigate to **Compute → Instances → Create Instance**
2. Configure:
   - **Name:** `usod-blockchain`
   - **Image:** Ubuntu 22.04 (Canonical)
   - **Shape:** VM.Standard.A1.Flex (ARM) - **Always Free!**
     - OCPUs: 2
     - Memory: 12 GB
   - **Boot Volume:** 50 GB (Always Free includes 200 GB total)
   - **Networking:** Create new VCN or use existing

3. Download the SSH key pair or upload your public key

**Via OCI CLI:**
```bash
# Install OCI CLI
bash -c "$(curl -L https://raw.githubusercontent.com/oracle/oci-cli/master/scripts/install/install.sh)"

# Create instance
oci compute instance launch \
  --availability-domain "AD-1" \
  --compartment-id <your-compartment-id> \
  --shape "VM.Standard.A1.Flex" \
  --shape-config '{"ocpus":2,"memoryInGBs":12}' \
  --image-id <ubuntu-22.04-aarch64-image-id> \
  --subnet-id <your-subnet-id> \
  --display-name "usod-blockchain"
```

### 1.3 Configure Security List (Firewall)

**OCI Console → Networking → Virtual Cloud Networks → Your VCN → Security Lists**

Add Ingress Rules:
| Port | Protocol | Source | Description |
|------|----------|--------|-------------|
| 22 | TCP | Your IP/32 | SSH access |
| 7050 | TCP | Backend IP/32 | Orderer |
| 7051 | TCP | Backend IP/32 | Peer |
| 7052 | TCP | Backend IP/32 | Chaincode |

### 1.4 Connect to Instance
```bash
# Get public IP from OCI Console
ssh -i <your-private-key> ubuntu@<public-ip>
```

---

## 🔷 AWS EC2 Deployment

**AWS EC2 Example:**
```bash
# Create EC2 instance
# - AMI: Ubuntu 22.04 LTS
# - Instance Type: t3.medium (2 vCPU, 4 GB RAM)
# - Storage: 50 GB gp3 SSD
# - Security Group: Allow ports 7050, 7051, 7052, 22
```

**Security Group Rules:**
| Port | Protocol | Source | Purpose |
|------|----------|--------|---------|
| 22 | TCP | Your IP | SSH access |
| 7050 | TCP | Backend IP | Orderer |
| 7051 | TCP | Backend IP | Peer |
| 7052 | TCP | Backend IP | Chaincode |

### Step 2: Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Logout and login again for docker group
exit
```

### Step 3: Upload Blockchain Files

```bash
# From your local machine, upload blockchain folder
scp -r blockchain/ ubuntu@<YOUR_VM_IP>:~/usod/

# Or use git
git clone <your-repo> ~/usod
```

### Step 4: Modify Configuration for Cloud

**Update `docker-compose.yaml`:**

Change localhost references to use container names or `0.0.0.0`:

```yaml
# Before (local)
- ORDERER_GENERAL_LISTENADDRESS=0.0.0.0

# Keep as 0.0.0.0 for cloud (already correct)
```

**Update `connection-profile.json` (Backend):**

```json
{
  "peers": {
    "peer0.org1.usod.com": {
      "url": "grpc://<YOUR_VM_IP>:7051"
    }
  },
  "orderers": {
    "orderer.usod.com": {
      "url": "grpc://<YOUR_VM_IP>:7050"
    }
  }
}
```

### Step 5: Start Blockchain on Cloud

```bash
cd ~/usod/blockchain/hyperledger/network

# Make scripts executable (Linux)
chmod +x scripts/*.sh

# For Linux, convert PowerShell scripts to Bash or use:
# Start network manually
docker-compose up -d

# Wait for containers
sleep 15

# Create channel
docker exec cli peer channel create -o orderer.usod.com:7050 -c usod-channel -f ./channel-artifacts/channel.tx

# Join peer
docker exec cli peer channel join -b usod-channel.block

# Update anchors
docker exec cli peer channel update -o orderer.usod.com:7050 -c usod-channel -f ./channel-artifacts/Org1MSPanchors.tx
```

### Step 6: Deploy Chaincode

```bash
# Package chaincode
docker exec cli peer lifecycle chaincode package threat-logger.tar.gz \
  --path /opt/gopath/src/github.com/chaincode/threat-logger \
  --lang node \
  --label threat-logger_1.0

# Install
docker exec cli peer lifecycle chaincode install threat-logger.tar.gz

# Get package ID
PACKAGE_ID=$(docker exec cli peer lifecycle chaincode queryinstalled | grep threat-logger | awk '{print $3}' | cut -d ',' -f1)

# Approve
docker exec cli peer lifecycle chaincode approveformyorg \
  -o orderer.usod.com:7050 \
  --channelID usod-channel \
  --name threat-logger \
  --version 1.0 \
  --package-id $PACKAGE_ID \
  --sequence 1

# Commit
docker exec cli peer lifecycle chaincode commit \
  -o orderer.usod.com:7050 \
  --channelID usod-channel \
  --name threat-logger \
  --version 1.0 \
  --sequence 1
```

### Step 7: Setup Wallet

Copy the admin identity to your backend server:

```bash
# Create wallet directory on backend server
mkdir -p ~/usod/backend/blockchain/wallets

# Copy certificates
cp ~/usod/blockchain/hyperledger/network/crypto-config/peerOrganizations/org1.usod.com/users/Admin@org1.usod.com/msp/signcerts/Admin@org1.usod.com-cert.pem ~/usod/backend/blockchain/wallets/admin-cert.pem

cp ~/usod/blockchain/hyperledger/network/crypto-config/peerOrganizations/org1.usod.com/users/Admin@org1.usod.com/msp/keystore/* ~/usod/backend/blockchain/wallets/admin-key.pem

# Create admin.id (Fabric SDK format)
# Use the setup-wallet script or create manually
```

---

## 🔒 Security Recommendations

### 1. Enable TLS (Production Required)

Modify `docker-compose.yaml`:
```yaml
orderer.usod.com:
  environment:
    - ORDERER_GENERAL_TLS_ENABLED=true
    - ORDERER_GENERAL_TLS_PRIVATEKEY=/var/hyperledger/orderer/tls/server.key
    - ORDERER_GENERAL_TLS_CERTIFICATE=/var/hyperledger/orderer/tls/server.crt
    - ORDERER_GENERAL_TLS_ROOTCAS=[/var/hyperledger/orderer/tls/ca.crt]

peer0.org1.usod.com:
  environment:
    - CORE_PEER_TLS_ENABLED=true
    - CORE_PEER_TLS_CERT_FILE=/etc/hyperledger/fabric/tls/server.crt
    - CORE_PEER_TLS_KEY_FILE=/etc/hyperledger/fabric/tls/server.key
    - CORE_PEER_TLS_ROOTCERT_FILE=/etc/hyperledger/fabric/tls/ca.crt
```

### 2. Firewall Rules

```bash
# Allow only backend server to connect
sudo ufw allow from <BACKEND_IP> to any port 7050
sudo ufw allow from <BACKEND_IP> to any port 7051
sudo ufw allow from <BACKEND_IP> to any port 7052
sudo ufw enable
```

### 3. Use Private Network

Deploy blockchain VM in a private subnet, accessible only via VPN or backend server.

---

## 📊 Monitoring

### Check Container Status
```bash
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

### View Logs
```bash
docker logs orderer.usod.com --tail 100
docker logs peer0.org1.usod.com --tail 100
```

### Check Channel Status
```bash
docker exec cli peer channel list
docker exec cli peer lifecycle chaincode querycommitted --channelID usod-channel
```

---

## 🔄 Backup Strategy

### Automated Backup Script

```bash
#!/bin/bash
# backup-blockchain.sh

BACKUP_DIR="/backups/blockchain/$(date +%Y%m%d_%H%M%S)"
mkdir -p $BACKUP_DIR

# Backup Docker volumes
docker run --rm \
  -v network_orderer_data:/source \
  -v $BACKUP_DIR:/backup \
  alpine tar czf /backup/orderer_data.tar.gz -C /source .

docker run --rm \
  -v network_peer0_ledger:/source \
  -v $BACKUP_DIR:/backup \
  alpine tar czf /backup/peer0_ledger.tar.gz -C /source .

# Backup crypto materials
tar czf $BACKUP_DIR/crypto-config.tar.gz crypto-config/
tar czf $BACKUP_DIR/channel-artifacts.tar.gz channel-artifacts/

echo "Backup completed: $BACKUP_DIR"
```

### Restore Script

```bash
#!/bin/bash
# restore-blockchain.sh

BACKUP_DIR=$1

# Stop containers
docker-compose down

# Restore volumes
docker run --rm \
  -v network_orderer_data:/target \
  -v $BACKUP_DIR:/backup \
  alpine sh -c "cd /target && tar xzf /backup/orderer_data.tar.gz"

docker run --rm \
  -v network_peer0_ledger:/target \
  -v $BACKUP_DIR:/backup \
  alpine sh -c "cd /target && tar xzf /backup/peer0_ledger.tar.gz"

# Restart
docker-compose up -d
```

---

## 🏗️ Production Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Cloud Infrastructure                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐     ┌──────────────┐    ┌──────────────┐ │
│  │   Backend    │────▶│  Blockchain  │◀───│   Backup     │ │
│  │   Server     │     │    Server    │    │   Storage    │ │
│  │  (Node.js)   │     │  (Docker)    │    │   (S3/EBS)   │ │
│  └──────────────┘     └──────────────┘    └──────────────┘ │
│         │                    │                              │
│         │              ┌─────┴─────┐                        │
│         │              │           │                        │
│         ▼         ┌────▼───┐  ┌────▼───┐                   │
│  ┌──────────────┐ │ Orderer│  │  Peer  │                   │
│  │   MongoDB    │ │  :7050 │  │  :7051 │                   │
│  │   (Atlas)    │ └────────┘  └────────┘                   │
│  └──────────────┘                                           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 💰 Cost Estimation

### ⭐ Oracle Cloud - Always Free Tier (Monthly)
| Resource | Specification | Cost |
|----------|--------------|------|
| Compute | VM.Standard.A1.Flex (2 OCPU, 12 GB RAM) | **$0** |
| Block Volume | 50 GB | **$0** |
| Data Transfer | 10 TB/month | **$0** |
| **Total** | | **$0/month** ✨ |

> **Note:** Oracle's Always Free Tier is permanent, not a trial. As long as you stay within limits, you'll never be charged!

### AWS (Monthly)
| Resource | Specification | Cost |
|----------|--------------|------|
| EC2 | t3.medium (blockchain) | ~$30 |
| EBS | 50 GB gp3 | ~$5 |
| Data Transfer | ~10 GB | ~$1 |
| **Total** | | **~$36/month** |

### DigitalOcean (Monthly)
| Resource | Specification | Cost |
|----------|--------------|------|
| Droplet | 2 vCPU, 4 GB RAM | ~$24 |
| Volume | 50 GB | ~$5 |
| **Total** | | **~$29/month** |

---

## ✅ Deployment Checklist

- [ ] Cloud VM provisioned with required specs
- [ ] Docker and Docker Compose installed
- [ ] Blockchain files uploaded
- [ ] Security group/firewall configured
- [ ] `connection-profile.json` updated with VM IP
- [ ] Network started and channel created
- [ ] Chaincode deployed and committed
- [ ] Wallet credentials copied to backend
- [ ] TLS enabled (for production)
- [ ] Backup strategy implemented
- [ ] Monitoring configured

---

## 🆘 Support

For issues with cloud deployment:
1. Check Docker logs: `docker logs <container-name>`
2. Verify network connectivity: `docker exec cli peer channel list`
3. Check chaincode status: `docker exec cli peer lifecycle chaincode querycommitted --channelID usod-channel`

---

**Next Steps:** After blockchain is running on cloud, update your backend's `connection-profile.json` with the cloud server IP and restart the backend service.
