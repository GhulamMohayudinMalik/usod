#!/usr/bin/env pwsh

Write-Host "Stopping USOD Blockchain network..."

Set-Location $PSScriptRoot\..

# Stop and remove containers, networks, volumes
docker-compose down -v

# Remove chaincode containers
Write-Host "Removing chaincode containers..."
docker ps -a | Select-String "dev-peer0.org1.usod.com-threat-logger" | ForEach-Object {
    $containerId = ($_ -split '\s+')[0]
    docker rm -f $containerId 2>&1 | Out-Null
}

# Remove chaincode images
Write-Host "Removing chaincode images..."
docker images | Select-String "dev-peer0.org1.usod.com-threat-logger" | ForEach-Object {
    $imageId = ($_ -split '\s+')[2]
    docker rmi -f $imageId 2>&1 | Out-Null
}

Write-Host "Network stopped successfully!"

