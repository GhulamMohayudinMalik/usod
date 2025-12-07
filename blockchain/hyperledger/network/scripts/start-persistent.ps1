#!/usr/bin/env pwsh

Write-Host "================================================"
Write-Host "  USOD Blockchain - Persistent Setup           "
Write-Host "================================================"

# Change to network directory
Set-Location $PSScriptRoot\..

# Check if crypto materials exist (need to generate if not)
$needsCrypto = -not (Test-Path "crypto-config/peerOrganizations")

if ($needsCrypto) {
    Write-Host "`n[1/5] Generating crypto materials..."
    ..\..\bin\cryptogen.exe generate --config=./crypto-config.yaml --output="crypto-config"
    
    Write-Host "`n[2/5] Generating genesis block..."
    ..\..\bin\configtxgen.exe -profile OrdererGenesis -channelID system-channel -outputBlock ./channel-artifacts/genesis.block
    
    Write-Host "`n[3/5] Generating channel transaction..."
    ..\..\bin\configtxgen.exe -profile ChannelConfig -outputCreateChannelTx ./channel-artifacts/channel.tx -channelID usod-channel
    
    Write-Host "`n[4/5] Generating anchor peer update..."
    ..\..\bin\configtxgen.exe -profile ChannelConfig -outputAnchorPeersUpdate ./channel-artifacts/Org1MSPanchors.tx -channelID usod-channel -asOrg USODOrgMSP
    
    # Fix Windows path separators in generated config
    Write-Host "`n[5/5] Fixing Windows path separators..."
    Get-ChildItem -Path crypto-config -Recurse -Filter "config.yaml" | ForEach-Object { 
        $content = Get-Content $_.FullName -Raw 
        $content = $content -replace '\\', '/' 
        Set-Content -Path $_.FullName -Value $content -NoNewline 
    }
} else {
    Write-Host "`nUsing existing crypto materials..."
}

# Start Docker containers
Write-Host "`nStarting Docker containers..."
docker-compose up -d

# Wait for containers to initialize
Write-Host "Waiting for containers to initialize..."
Start-Sleep -Seconds 10

# Check if peer has joined the channel (this is the key check!)
Write-Host "`nChecking channel membership..."
$channelList = docker exec cli peer channel list 2>&1
$hasChannel = $channelList -match "usod-channel"

if (-not $hasChannel) {
    Write-Host "Channel not found - setting up channel..."
    
    # Try to create channel (may already exist in orderer)
    Write-Host "`nCreating channel 'usod-channel'..."
    $createResult = docker exec cli peer channel create -o orderer.usod.com:7050 -c usod-channel -f ./channel-artifacts/channel.tx 2>&1
    
    # Join peer to channel
    Write-Host "Joining peer to channel..."
    docker exec cli peer channel join -b usod-channel.block
    
    # Update anchor peers
    Write-Host "Updating anchor peers..."
    docker exec cli peer channel update -o orderer.usod.com:7050 -c usod-channel -f ./channel-artifacts/Org1MSPanchors.tx 2>&1
    
    # Check if chaincode is committed
    Write-Host "`nChecking chaincode status..."
    $chaincodeList = docker exec cli peer lifecycle chaincode querycommitted --channelID usod-channel 2>&1
    $hasChaincode = $chaincodeList -match "threat-logger"
    
    if (-not $hasChaincode) {
        Write-Host ""
        Write-Host "================================================"
        Write-Host "  Channel created - Chaincode needed!"
        Write-Host "================================================"
        Write-Host "`nRun these commands:"
        Write-Host "  1. .\scripts\deploy-chaincode.ps1"
        Write-Host "  2. .\scripts\setup-wallet.ps1"
    } else {
        Write-Host "`nChaincode already deployed!"
    }
} else {
    Write-Host "Peer already joined to usod-channel"
}

Write-Host "`n================================================"
Write-Host "  Network started successfully!"
Write-Host "================================================"
Write-Host "`nStop network: .\scripts\stop.ps1"
Write-Host "Reset (wipe data): .\scripts\reset.ps1"
Write-Host ""
