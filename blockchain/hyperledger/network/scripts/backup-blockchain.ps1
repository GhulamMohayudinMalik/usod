#!/usr/bin/env pwsh

Write-Host "================================================"
Write-Host "  USOD Blockchain - Backup System              "
Write-Host "================================================"

# Change to network directory
Set-Location $PSScriptRoot\..

$backupDir = "../../../blockchain/backups"
$timestamp = Get-Date -Format "yyyy-MM-ddTHH-mm-ss"

# Ensure backup directory exists
if (-not (Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir -Force
}

Write-Host "`n[1/4] Creating blockchain data backup..."

# Create backup of persistent volumes
$backupName = "blockchain-backup-$timestamp"
$backupPath = "$backupDir/$backupName"

Write-Host "`nBackup name: $backupName"
Write-Host "Backup path: $backupPath"

# Backup peer ledger data
if (docker volume ls -q | Where-Object { $_ -eq "network_usod_peer0_ledger" }) {
    Write-Host "`n[2/4] Backing up peer ledger data..."
    docker run --rm -v network_usod_peer0_ledger:/data -v "${PWD}/$backupPath":/backup alpine tar czf /backup/peer0_ledger.tar.gz -C /data .
    Write-Host "✅ Peer ledger backed up"
} else {
    Write-Host "⚠️  Peer ledger volume not found - skipping"
}

# Backup chaincode data
if (docker volume ls -q | Where-Object { $_ -eq "network_usod_peer0_chaincode" }) {
    Write-Host "`n[3/4] Backing up chaincode data..."
    docker run --rm -v network_usod_peer0_chaincode:/data -v "${PWD}/$backupPath":/backup alpine tar czf /backup/peer0_chaincode.tar.gz -C /data .
    Write-Host "✅ Chaincode data backed up"
} else {
    Write-Host "⚠️  Chaincode volume not found - skipping"
}

# Backup wallet and certificates
Write-Host "`n[4/4] Backing up wallet and certificates..."
if (Test-Path "../../../backend/blockchain/wallets") {
    Copy-Item "../../../backend/blockchain/wallets" "$backupPath/wallets" -Recurse -Force
    Write-Host "✅ Wallet backed up"
} else {
    Write-Host "⚠️  Wallet not found - skipping"
}

if (Test-Path "crypto-config") {
    Copy-Item "crypto-config" "$backupPath/crypto-config" -Recurse -Force
    Write-Host "✅ Certificates backed up"
} else {
    Write-Host "⚠️  Certificates not found - skipping"
}

# Create backup manifest
$manifest = @{
    timestamp = $timestamp
    backupName = $backupName
    description = "Blockchain data backup"
    volumes = @(
        "network_usod_peer0_ledger",
        "network_usod_peer0_chaincode"
    )
    files = @(
        "wallets",
        "crypto-config"
    )
} | ConvertTo-Json -Depth 3

$manifest | Out-File "$backupPath/manifest.json" -Encoding UTF8

Write-Host "`n================================================"
Write-Host "  Backup completed successfully!                "
Write-Host "================================================"
Write-Host "`nBackup location: $backupPath"
Write-Host "Backup manifest: $backupPath/manifest.json"
Write-Host "`nTo restore: .\scripts\restore-backup.ps1 -BackupName $backupName"
Write-Host ""
