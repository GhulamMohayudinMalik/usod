# Oracle Cloud Infrastructure (OCI) Terraform Outputs
# Values to be displayed after terraform apply

output "instance_id" {
  description = "OCID of the compute instance"
  value       = oci_core_instance.usod_instance.id
}

output "instance_public_ip" {
  description = "Public IP address of the instance"
  value       = oci_core_instance.usod_instance.public_ip
}

output "instance_private_ip" {
  description = "Private IP address of the instance"
  value       = oci_core_instance.usod_instance.private_ip
}

output "instance_name" {
  description = "Display name of the instance"
  value       = oci_core_instance.usod_instance.display_name
}

output "instance_shape" {
  description = "Shape of the instance"
  value       = oci_core_instance.usod_instance.shape
}

output "vcn_id" {
  description = "OCID of the VCN"
  value       = oci_core_vcn.usod_vcn.id
}

output "subnet_id" {
  description = "OCID of the subnet"
  value       = oci_core_subnet.usod_subnet.id
}

output "bucket_name" {
  description = "Name of the object storage bucket"
  value       = oci_objectstorage_bucket.usod_bucket.name
}

output "bucket_namespace" {
  description = "Object storage namespace"
  value       = data.oci_objectstorage_namespace.ns.namespace
}

output "bucket_url" {
  description = "URL of the object storage bucket"
  value       = "https://objectstorage.${var.region}.oraclecloud.com/n/${data.oci_objectstorage_namespace.ns.namespace}/b/${oci_objectstorage_bucket.usod_bucket.name}/o/"
}

output "data_volume_id" {
  description = "OCID of the data volume (if created)"
  value       = var.create_data_volume ? oci_core_volume.usod_data_volume[0].id : null
}

output "ssh_command" {
  description = "SSH command to connect to the instance"
  value       = "ssh -i ~/.ssh/usod-key opc@${oci_core_instance.usod_instance.public_ip}"
}

output "console_url" {
  description = "OCI Console URL for the instance"
  value       = "https://cloud.oracle.com/compute/instances/${oci_core_instance.usod_instance.id}?region=${var.region}"
}

output "summary" {
  description = "Deployment summary"
  value = {
    region           = var.region
    environment      = var.environment
    service          = var.service_name
    instance_name    = oci_core_instance.usod_instance.display_name
    public_ip        = oci_core_instance.usod_instance.public_ip
    shape            = oci_core_instance.usod_instance.shape
    bucket_name      = oci_objectstorage_bucket.usod_bucket.name
    ssh_command      = "ssh -i ~/.ssh/usod-key opc@${oci_core_instance.usod_instance.public_ip}"
    backend_url      = "http://${oci_core_instance.usod_instance.public_ip}:5000"
    ai_service_url   = "http://${oci_core_instance.usod_instance.public_ip}:8000"
    frontend_url     = "http://${oci_core_instance.usod_instance.public_ip}:3000"
    blockchain_orderer = "http://${oci_core_instance.usod_instance.public_ip}:7050"
    blockchain_peer    = "http://${oci_core_instance.usod_instance.public_ip}:7051"
    blockchain_ca      = "http://${oci_core_instance.usod_instance.public_ip}:7054"
  }
}

