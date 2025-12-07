#!/usr/bin/env pwsh

Write-Host "================================================"
Write-Host "  Stopping USOD Blockchain Network"
Write-Host "================================================"

Set-Location $PSScriptRoot\..

# Stop containers but PRESERVE volumes (keeps blockchain data!)
Write-Host "`nStopping containers (preserving data)..."
docker-compose down

Write-Host "`n================================================"
Write-Host "  Network stopped - Data preserved!"
Write-Host "================================================"
Write-Host "`nTo restart: .\scripts\start-persistent.ps1"
Write-Host "To WIPE all data: .\scripts\reset.ps1"

