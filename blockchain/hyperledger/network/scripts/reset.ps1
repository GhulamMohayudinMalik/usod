#!/usr/bin/env pwsh

Write-Host "================================================"
Write-Host "  RESET: Wiping ALL Blockchain Data"
Write-Host "================================================"
Write-Host ""
Write-Host "WARNING: This will DELETE all blockchain data!"
Write-Host "Press Ctrl+C to cancel, or"
$null = Read-Host "Press Enter to continue"

Set-Location $PSScriptRoot\..

# Stop and remove everything including volumes
Write-Host "`n[1/4] Stopping containers and removing volumes..."
docker-compose down -v

# Remove chaincode containers
Write-Host "`n[2/4] Removing chaincode containers..."
docker ps -a --format "{{.Names}}" | Select-String "dev-peer0.org1.usod.com-threat-logger" | ForEach-Object {
    docker rm -f $_.ToString().Trim() 2>&1 | Out-Null
}

# Remove chaincode images
Write-Host "`n[3/4] Removing chaincode images..."
docker images --format "{{.Repository}}:{{.Tag}}" | Select-String "dev-peer0.org1.usod.com-threat-logger" | ForEach-Object {
    docker rmi -f $_.ToString().Trim() 2>&1 | Out-Null
}

# Remove crypto materials
Write-Host "`n[4/4] Removing crypto materials..."
if (Test-Path "crypto-config") {
    Remove-Item -Recurse -Force crypto-config
}
if (Test-Path "channel-artifacts/*.block") {
    Remove-Item -Force channel-artifacts/*.block
}

# Also remove wallet so it gets regenerated
$walletPath = "../../wallets"
if (Test-Path $walletPath) {
    Remove-Item -Recurse -Force $walletPath
    Write-Host "Wallet removed (will be regenerated)"
}

Write-Host "`n================================================"
Write-Host "  RESET COMPLETE - All data wiped!"
Write-Host "================================================"
Write-Host "`nTo start fresh: .\scripts\start-persistent.ps1"
Write-Host "Then deploy chaincode: .\scripts\deploy-chaincode.ps1"
Write-Host "Then setup wallet: .\scripts\setup-wallet.ps1"
