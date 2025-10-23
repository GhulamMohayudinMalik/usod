#!/usr/bin/env pwsh

Write-Host "================================================"
Write-Host "  Deploying Threat Logger Chaincode            "
Write-Host "================================================"

# Change to network directory
Set-Location $PSScriptRoot\..

# Package chaincode (TRADITIONAL method - includes source code)
Write-Host "`n[1/5] Packaging chaincode..."
docker exec cli peer lifecycle chaincode package threat-logger.tar.gz `
  --path /opt/gopath/src/github.com/chaincode/threat-logger `
  --lang node `
  --label threat-logger_1.0

if ($LASTEXITCODE -ne 0) { Write-Error "Failed to package chaincode"; exit 1 }

# Install chaincode on peer
Write-Host "`n[2/5] Installing chaincode on peer..."
docker exec cli peer lifecycle chaincode install threat-logger.tar.gz
if ($LASTEXITCODE -ne 0) { Write-Error "Failed to install chaincode"; exit 1 }

# Get package ID
Write-Host "`n[3/5] Querying installed chaincode..."
$output = docker exec cli peer lifecycle chaincode queryinstalled 2>&1
$packageId = ($output | Select-String -Pattern "Package ID: (threat-logger_1\.0:[a-f0-9]+)").Matches.Groups[1].Value

if (-not $packageId) {
    Write-Error "Failed to get package ID"
    Write-Host "Output was: $output"
    exit 1
}

Write-Host "Package ID: $packageId"

# Approve chaincode for organization
Write-Host "`n[4/5] Approving chaincode for organization..."
docker exec cli peer lifecycle chaincode approveformyorg `
  -o orderer.usod.com:7050 `
  --channelID usod-channel `
  --name threat-logger `
  --version 1.0 `
  --package-id $packageId `
  --sequence 1

if ($LASTEXITCODE -ne 0) { Write-Error "Failed to approve chaincode"; exit 1 }

# Check commit readiness
Write-Host "`nChecking commit readiness..."
docker exec cli peer lifecycle chaincode checkcommitreadiness `
  --channelID usod-channel `
  --name threat-logger `
  --version 1.0 `
  --sequence 1

# Commit chaincode definition
Write-Host "`n[5/5] Committing chaincode definition..."
docker exec cli peer lifecycle chaincode commit `
  -o orderer.usod.com:7050 `
  --channelID usod-channel `
  --name threat-logger `
  --version 1.0 `
  --sequence 1

if ($LASTEXITCODE -ne 0) { Write-Error "Failed to commit chaincode"; exit 1 }

# Wait for chaincode container to start
Write-Host "`nWaiting for chaincode container to start..."
Start-Sleep -Seconds 5

# List Docker containers to verify chaincode is running
Write-Host "`nDocker containers:"
docker ps --format "table {{.Names}}\t{{.Status}}"

Write-Host "`n================================================"
Write-Host "  Chaincode deployed successfully!              "
Write-Host "================================================"
Write-Host "`nNext steps:"
Write-Host "  1. Initialize: docker exec cli peer chaincode invoke -C usod-channel -n threat-logger -c '{\"function\":\"InitLedger\",\"Args\":[]}'"
Write-Host "  2. Query: docker exec cli peer chaincode query -C usod-channel -n threat-logger -c '{\"function\":\"QueryAllThreatLogs\",\"Args\":[]}'"
Write-Host ""

