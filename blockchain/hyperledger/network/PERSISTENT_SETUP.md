# USOD Blockchain - Persistent Setup Guide

## 🎯 **Problem Solved**

This setup fixes the critical issue where blockchain data was lost every time you restarted the network. Now your blockchain data persists across restarts!

## 🔄 **What Was Wrong Before**

- ❌ **Data Loss**: Every restart = lost blockchain data (your 40+ logs)
- ❌ **Manual Setup**: Had to regenerate wallet and redeploy chaincode
- ❌ **No Persistence**: Docker containers didn't save ledger data
- ❌ **Certificate Issues**: Wallet certificates became invalid

## ✅ **What's Fixed Now**

- ✅ **Data Persistence**: Blockchain data survives restarts
- ✅ **Automatic Wallet Management**: Wallet preserved across restarts  
- ✅ **Backup/Restore**: Full backup and restore capabilities
- ✅ **Smart Restart**: Detects fresh vs existing setup

## 🚀 **How to Use**

### **First Time Setup**
```powershell
cd blockchain/hyperledger/network
.\scripts\start-persistent.ps1
.\scripts\deploy-chaincode.ps1
.\scripts\setup-wallet.ps1
```

### **Normal Restart (Data Preserved)**
```powershell
cd blockchain/hyperledger/network
.\scripts\stop.ps1
.\scripts\start-persistent.ps1
# Your data is still there! 🎉
```

### **Backup Your Data**
```powershell
.\scripts\backup-blockchain.ps1
```

### **Restore From Backup**
```powershell
.\scripts\restore-backup.ps1 -BackupName blockchain-backup-2025-10-29T12-00-00
```

## 📁 **What Gets Preserved**

### **Persistent Volumes**
- `peer0_ledger` - All blockchain ledger data
- `peer0_chaincode` - Chaincode state and data

### **Backed Up Files**
- `wallets/` - Admin wallet and certificates
- `crypto-config/` - All cryptographic materials
- `channel-artifacts/` - Channel configuration

## 🔧 **Technical Details**

### **Docker Volumes Added**
```yaml
volumes:
  - peer0_ledger:/var/hyperledger/production
  - peer0_chaincode:/var/hyperledger/chaincode

volumes:
  peer0_ledger:
    driver: local
  peer0_chaincode:
    driver: local
```

### **Smart Detection**
- **Fresh Start**: Generates new crypto materials
- **Restart**: Uses existing materials and preserves data

## 📊 **Benefits**

1. **🔄 No More Data Loss**: Your 40+ logs stay forever
2. **⚡ Faster Restarts**: No need to redeploy everything
3. **🛡️ Backup Safety**: Full backup/restore system
4. **🔧 Easy Management**: Simple scripts for everything
5. **📈 Production Ready**: Proper data persistence

## 🚨 **Important Notes**

- **Always use `start-persistent.ps1`** instead of `start.ps1`
- **Backup regularly** before major changes
- **Don't delete Docker volumes** manually
- **Use restore script** if something goes wrong

## 🔍 **Troubleshooting**

### **Data Still Lost?**
1. Check if volumes exist: `docker volume ls`
2. Verify backup: `.\scripts\backup-blockchain.ps1`
3. Restore from backup: `.\scripts\restore-backup.ps1 -BackupName <name>`

### **Wallet Issues?**
1. Run: `.\scripts\setup-wallet.ps1`
2. Check wallet exists: `ls ../../../backend/blockchain/wallets/`

### **Chaincode Issues?**
1. Check if chaincode is running: `docker ps`
2. Redeploy if needed: `.\scripts\deploy-chaincode.ps1`

## 🎉 **Success!**

Now you can:
- ✅ Restart your laptop without losing blockchain data
- ✅ Keep your 40+ threat logs forever
- ✅ Backup and restore your blockchain
- ✅ Deploy to production with confidence

Your blockchain is now **production-ready** with proper data persistence! 🚀
