#!/usr/bin/env pwsh

Write-Host "================================================"
Write-Host "  USOD Blockchain - Traditional Fabric Setup  "
Write-Host "================================================"

# Change to network directory
Set-Location $PSScriptRoot\..

# Clean up previous artifacts
Write-Host "`n[1/7] Cleaning up previous artifacts..."
Remove-Item -Recurse -Force crypto-config -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force channel-artifacts/* -ErrorAction SilentlyContinue

# Generate crypto materials
Write-Host "`n[2/7] Generating crypto materials..."
..\..\bin\cryptogen.exe generate --config=./crypto-config.yaml
if ($LASTEXITCODE -ne 0) { Write-Error "Failed to generate crypto materials"; exit 1 }

# Create channel-artifacts directory
New-Item -ItemType Directory -Force -Path channel-artifacts | Out-Null

# Set FABRIC_CFG_PATH
$env:FABRIC_CFG_PATH = Get-Location

# Generate genesis block
Write-Host "`n[3/7] Generating genesis block..."
..\..\bin\configtxgen.exe -profile OrdererGenesis -channelID system-channel -outputBlock ./channel-artifacts/genesis.block
if ($LASTEXITCODE -ne 0) { Write-Error "Failed to generate genesis block"; exit 1 }

# Generate channel transaction
Write-Host "`n[4/7] Generating channel transaction..."
..\..\bin\configtxgen.exe -profile ChannelConfig -outputCreateChannelTx ./channel-artifacts/channel.tx -channelID usod-channel
if ($LASTEXITCODE -ne 0) { Write-Error "Failed to generate channel transaction"; exit 1 }

# Generate anchor peer update
Write-Host "`n[5/7] Generating anchor peer update..."
..\..\bin\configtxgen.exe -profile ChannelConfig -outputAnchorPeersUpdate ./channel-artifacts/USODOrgMSPanchors.tx -channelID usod-channel -asOrg USODOrgMSP
if ($LASTEXITCODE -ne 0) { Write-Error "Failed to generate anchor peer update"; exit 1 }

# Start Docker containers
Write-Host "`n[6/7] Starting Docker containers..."
docker-compose down -v 2>&1 | Out-Null
docker-compose up -d
if ($LASTEXITCODE -ne 0) { Write-Error "Failed to start Docker containers"; exit 1 }

# Wait for containers to initialize
Write-Host "`n[7/7] Waiting for containers to initialize..."
Start-Sleep -Seconds 8

# Create channel
Write-Host "`nCreating channel 'usod-channel'..."
docker exec cli peer channel create -o orderer.usod.com:7050 -c usod-channel -f ./channel-artifacts/channel.tx --outputBlock ./channel-artifacts/usod-channel.block
if ($LASTEXITCODE -ne 0) { Write-Error "Failed to create channel"; exit 1 }

# Join channel
Write-Host "`nJoining peer to channel..."
docker exec cli peer channel join -b ./channel-artifacts/usod-channel.block
if ($LASTEXITCODE -ne 0) { Write-Error "Failed to join channel"; exit 1 }

# Update anchor peers
Write-Host "`nUpdating anchor peers..."
docker exec cli peer channel update -o orderer.usod.com:7050 -c usod-channel -f ./channel-artifacts/USODOrgMSPanchors.tx
if ($LASTEXITCODE -ne 0) { Write-Warning "Failed to update anchor peers (non-critical)" }

Write-Host "`n================================================"
Write-Host "  Network started successfully!                 "
Write-Host "================================================"
Write-Host "`nNext steps:"
Write-Host "  1. Deploy chaincode: .\scripts\deploy-chaincode.ps1"
Write-Host "  2. Stop network: .\scripts\stop.ps1"
Write-Host ""

