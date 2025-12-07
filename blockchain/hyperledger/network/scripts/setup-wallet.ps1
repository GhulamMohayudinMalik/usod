#!/usr/bin/env pwsh

Write-Host "================================================"
Write-Host "  Setting up Persistent Wallet                  "
Write-Host "================================================"

# Change to network directory
Set-Location $PSScriptRoot\..

# Correct wallet path (blockchain/wallets from network directory)
$walletPath = "../../wallets"
$adminIdPath = "$walletPath/admin.id"

# Certificate paths
$certSource = "crypto-config/peerOrganizations/org1.usod.com/users/Admin@org1.usod.com/msp/signcerts/Admin@org1.usod.com-cert.pem"
$keySource = "crypto-config/peerOrganizations/org1.usod.com/users/Admin@org1.usod.com/msp/keystore"

Write-Host "`nWallet path: $walletPath"

# Ensure wallet directory exists
if (-not (Test-Path $walletPath)) {
    New-Item -ItemType Directory -Path $walletPath -Force | Out-Null
    Write-Host "Created wallet directory"
}

# Always regenerate wallet from current crypto materials
Write-Host "`nGenerating wallet from current certificates..."

if (-not (Test-Path $certSource)) {
    Write-Host "ERROR: Certificate not found at $certSource"
    Write-Host "Make sure crypto materials are generated first!"
    exit 1
}

$keyFile = Get-ChildItem $keySource -ErrorAction SilentlyContinue | Select-Object -First 1
if (-not $keyFile) {
    Write-Host "ERROR: Private key not found in $keySource"
    Write-Host "Make sure crypto materials are generated first!"
    exit 1
}

# Read certificate and key content
$certContent = Get-Content $certSource -Raw
$keyContent = Get-Content $keyFile.FullName -Raw

# Escape newlines for JSON
$certEscaped = $certContent -replace "`r`n", "\n" -replace "`n", "\n"
$keyEscaped = $keyContent -replace "`r`n", "\n" -replace "`n", "\n"

# Create admin.id JSON file (Fabric SDK wallet format)
$adminId = @"
{"credentials":{"certificate":"$certEscaped","privateKey":"$keyEscaped"},"mspId":"USODOrgMSP","type":"X.509","version":1}
"@

# Write the admin.id file
Set-Content -Path $adminIdPath -Value $adminId -NoNewline

# Also copy raw cert and key for reference
Copy-Item $certSource "$walletPath/admin-cert.pem" -Force
Copy-Item $keyFile.FullName "$walletPath/admin-key.pem" -Force

Write-Host "Wallet created successfully!"
Write-Host "  - admin.id: Created"
Write-Host "  - admin-cert.pem: Copied"
Write-Host "  - admin-key.pem: Copied"

Write-Host "`n================================================"
Write-Host "  Wallet setup complete!                        "
Write-Host "================================================"
Write-Host "`nWallet location: $walletPath"
Write-Host "Backend will use this wallet for blockchain access"
Write-Host ""
