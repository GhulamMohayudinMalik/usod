#!/usr/bin/env pwsh

param(
    [Parameter(Mandatory=$true)]
    [string]$BackupName
)

Write-Host "================================================"
Write-Host "  USOD Blockchain - Restore System             "
Write-Host "================================================"

# Change to network directory
Set-Location $PSScriptRoot\..

$backupDir = "../../../blockchain/backups"
$backupPath = "$backupDir/$BackupName"

if (-not (Test-Path $backupPath)) {
    Write-Host "❌ Backup not found: $backupPath"
    Write-Host "Available backups:"
    Get-ChildItem $backupDir -Directory | ForEach-Object { Write-Host "  - $($_.Name)" }
    exit 1
}

Write-Host "`nRestoring from backup: $BackupName"
Write-Host "Backup path: $backupPath"

# Stop current network
Write-Host "`n[1/5] Stopping current network..."
docker-compose down

# Remove existing volumes
Write-Host "`n[2/5] Removing existing volumes..."
docker volume rm network_usod_peer0_ledger -f 2>$null
docker volume rm network_usod_peer0_chaincode -f 2>$null

# Create new volumes
Write-Host "`n[3/5] Creating new volumes..."
docker volume create network_usod_peer0_ledger
docker volume create network_usod_peer0_chaincode

# Restore ledger data
if (Test-Path "$backupPath/peer0_ledger.tar.gz") {
    Write-Host "`n[4/5] Restoring peer ledger data..."
    docker run --rm -v network_usod_peer0_ledger:/data -v "${PWD}/$backupPath":/backup alpine tar xzf /backup/peer0_ledger.tar.gz -C /data
    Write-Host "✅ Peer ledger restored"
} else {
    Write-Host "⚠️  Peer ledger backup not found - skipping"
}

# Restore chaincode data
if (Test-Path "$backupPath/peer0_chaincode.tar.gz") {
    Write-Host "`nRestoring chaincode data..."
    docker run --rm -v network_usod_peer0_chaincode:/data -v "${PWD}/$backupPath":/backup alpine tar xzf /backup/peer0_chaincode.tar.gz -C /data
    Write-Host "✅ Chaincode data restored"
} else {
    Write-Host "⚠️  Chaincode backup not found - skipping"
}

# Restore wallet and certificates
Write-Host "`n[5/5] Restoring wallet and certificates..."
if (Test-Path "$backupPath/wallets") {
    Copy-Item "$backupPath/wallets" "../../../backend/blockchain/wallets" -Recurse -Force
    Write-Host "✅ Wallet restored"
} else {
    Write-Host "⚠️  Wallet backup not found - skipping"
}

if (Test-Path "$backupPath/crypto-config") {
    Copy-Item "$backupPath/crypto-config" "crypto-config" -Recurse -Force
    Write-Host "✅ Certificates restored"
} else {
    Write-Host "⚠️  Certificates backup not found - skipping"
}

Write-Host "`n================================================"
Write-Host "  Restore completed successfully!               "
Write-Host "================================================"
Write-Host "`nNext steps:"
Write-Host "  1. Start network: .\scripts\start-persistent.ps1"
Write-Host "  2. Verify data: Check blockchain endpoints"
Write-Host ""
