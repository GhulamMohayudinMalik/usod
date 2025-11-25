# USOD Platform - Azure Infrastructure
# Terraform configuration for deploying Blockchain Network on Azure

terraform {
  required_version = ">= 1.0"
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }
}

# Configure Azure Provider
provider "azurerm" {
  features {}
  
  # Credentials should be configured via:
  # - Azure CLI: az login
  # - Service Principal: ARM_CLIENT_ID, ARM_CLIENT_SECRET, ARM_TENANT_ID, ARM_SUBSCRIPTION_ID
}

# Resource Group
resource "azurerm_resource_group" "usod_rg" {
  name     = "${var.project_name}-${var.environment}-rg"
  location = var.location

  tags = merge(var.tags, {
    Environment = var.environment
    Project     = var.project_name
  })
}

# Virtual Network
resource "azurerm_virtual_network" "usod_vnet" {
  name                = "${var.project_name}-vnet"
  address_space       = ["10.0.0.0/16"]
  location            = azurerm_resource_group.usod_rg.location
  resource_group_name = azurerm_resource_group.usod_rg.name

  tags = merge(var.tags, {
    Environment = var.environment
  })
}

# Subnet
resource "azurerm_subnet" "usod_subnet" {
  name                 = "${var.project_name}-subnet"
  resource_group_name  = azurerm_resource_group.usod_rg.name
  virtual_network_name = azurerm_virtual_network.usod_vnet.name
  address_prefixes     = ["10.0.1.0/24"]
}

# Public IP
resource "azurerm_public_ip" "blockchain_pip" {
  name                = "${var.project_name}-blockchain-pip"
  location            = azurerm_resource_group.usod_rg.location
  resource_group_name = azurerm_resource_group.usod_rg.name
  allocation_method   = "Static"
  sku                 = "Standard"

  tags = merge(var.tags, {
    Environment = var.environment
    Component   = "blockchain"
  })
}

# Network Security Group
resource "azurerm_network_security_group" "blockchain_nsg" {
  name                = "${var.project_name}-blockchain-nsg"
  location            = azurerm_resource_group.usod_rg.location
  resource_group_name = azurerm_resource_group.usod_rg.name

  # SSH
  security_rule {
    name                       = "SSH"
    priority                   = 1001
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "22"
    source_address_prefix      = "*"  # CHANGE in production
    destination_address_prefix = "*"
  }

  # HTTP
  security_rule {
    name                       = "HTTP"
    priority                   = 1002
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "80"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
  }

  # HTTPS
  security_rule {
    name                       = "HTTPS"
    priority                   = 1003
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "443"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
  }

  # Hyperledger Fabric Orderer
  security_rule {
    name                       = "Fabric-Orderer"
    priority                   = 1004
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "7050"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
  }

  # Hyperledger Fabric Peer
  security_rule {
    name                       = "Fabric-Peer"
    priority                   = 1005
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "7051"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
  }

  # Hyperledger Fabric CA
  security_rule {
    name                       = "Fabric-CA"
    priority                   = 1006
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "7054"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
  }

  tags = merge(var.tags, {
    Environment = var.environment
  })
}

# Network Interface
resource "azurerm_network_interface" "blockchain_nic" {
  name                = "${var.project_name}-blockchain-nic"
  location            = azurerm_resource_group.usod_rg.location
  resource_group_name = azurerm_resource_group.usod_rg.name

  ip_configuration {
    name                          = "internal"
    subnet_id                     = azurerm_subnet.usod_subnet.id
    private_ip_address_allocation = "Dynamic"
    public_ip_address_id          = azurerm_public_ip.blockchain_pip.id
  }

  tags = merge(var.tags, {
    Environment = var.environment
  })
}

# Associate NSG with NIC
resource "azurerm_network_interface_security_group_association" "blockchain_nsg_assoc" {
  network_interface_id      = azurerm_network_interface.blockchain_nic.id
  network_security_group_id = azurerm_network_security_group.blockchain_nsg.id
}

# Virtual Machine for Blockchain
resource "azurerm_linux_virtual_machine" "blockchain_vm" {
  name                = "${var.project_name}-blockchain-vm"
  location            = azurerm_resource_group.usod_rg.location
  resource_group_name = azurerm_resource_group.usod_rg.name
  size                = var.vm_size
  admin_username      = var.admin_username

  network_interface_ids = [
    azurerm_network_interface.blockchain_nic.id
  ]

  admin_ssh_key {
    username   = var.admin_username
    public_key = file(var.ssh_public_key_path)
  }

  os_disk {
    caching              = "ReadWrite"
    storage_account_type = "Standard_LRS"
    disk_size_gb         = 30
  }

  source_image_reference {
    publisher = "Canonical"
    offer     = "0001-com-ubuntu-server-jammy"
    sku       = "22_04-lts-gen2"
    version   = "latest"
  }

  custom_data = base64encode(<<-EOF
    #!/bin/bash
    apt-get update
    apt-get upgrade -y
    
    # Install Docker
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    usermod -aG docker ${var.admin_username}
    
    # Install Docker Compose
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    
    # Install basic tools
    apt-get install -y curl wget git htop
    
    # Set hostname
    hostnamectl set-hostname usod-blockchain
    echo "127.0.0.1 usod-blockchain" >> /etc/hosts
  EOF
  )

  tags = merge(var.tags, {
    Environment = var.environment
    Component   = "blockchain"
  })
}

# Storage Account for blockchain data
resource "azurerm_storage_account" "blockchain_storage" {
  name                     = "${var.project_name}blockchain${var.environment}"
  resource_group_name      = azurerm_resource_group.usod_rg.name
  location                 = azurerm_resource_group.usod_rg.location
  account_tier             = "Standard"
  account_replication_type = "LRS"

  tags = merge(var.tags, {
    Environment = var.environment
  })
}

# Container for blockchain artifacts
resource "azurerm_storage_container" "blockchain_artifacts" {
  name                  = "blockchain-artifacts"
  storage_account_name  = azurerm_storage_account.blockchain_storage.name
  container_access_type = "private"
}

