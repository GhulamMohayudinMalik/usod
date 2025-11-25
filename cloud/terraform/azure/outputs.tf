# Azure Terraform Outputs
# Values to be displayed after terraform apply

output "resource_group_name" {
  description = "Name of the resource group"
  value       = azurerm_resource_group.usod_rg.name
}

output "blockchain_vm_id" {
  description = "ID of the blockchain VM"
  value       = azurerm_linux_virtual_machine.blockchain_vm.id
}

output "blockchain_public_ip" {
  description = "Public IP address of blockchain VM"
  value       = azurerm_public_ip.blockchain_pip.ip_address
}

output "blockchain_private_ip" {
  description = "Private IP address of blockchain VM"
  value       = azurerm_network_interface.blockchain_nic.private_ip_address
}

output "blockchain_vm_name" {
  description = "Name of the blockchain VM"
  value       = azurerm_linux_virtual_machine.blockchain_vm.name
}

output "storage_account_name" {
  description = "Name of the storage account"
  value       = azurerm_storage_account.blockchain_storage.name
}

output "storage_container_name" {
  description = "Name of the storage container"
  value       = azurerm_storage_container.blockchain_artifacts.name
}

output "ssh_command" {
  description = "SSH command to connect to blockchain VM"
  value       = "ssh -i ~/.ssh/usod-key ${var.admin_username}@${azurerm_public_ip.blockchain_pip.ip_address}"
}

output "nsg_id" {
  description = "ID of the network security group"
  value       = azurerm_network_security_group.blockchain_nsg.id
}

output "summary" {
  description = "Deployment summary"
  value = {
    resource_group    = azurerm_resource_group.usod_rg.name
    location          = var.location
    environment       = var.environment
    vm_name           = azurerm_linux_virtual_machine.blockchain_vm.name
    public_ip         = azurerm_public_ip.blockchain_pip.ip_address
    storage_account   = azurerm_storage_account.blockchain_storage.name
    ssh_command       = "ssh -i ~/.ssh/usod-key ${var.admin_username}@${azurerm_public_ip.blockchain_pip.ip_address}"
    orderer_url       = "http://${azurerm_public_ip.blockchain_pip.ip_address}:7050"
    peer_url          = "http://${azurerm_public_ip.blockchain_pip.ip_address}:7051"
    ca_url            = "http://${azurerm_public_ip.blockchain_pip.ip_address}:7054"
  }
}

