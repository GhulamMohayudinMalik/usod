# GCP Terraform Outputs
# Values to be displayed after terraform apply

output "ai_service_instance_id" {
  description = "GCE instance ID for AI service"
  value       = google_compute_instance.ai_service.instance_id
}

output "ai_service_public_ip" {
  description = "Public IP address of AI service instance"
  value       = google_compute_instance.ai_service.network_interface[0].access_config[0].nat_ip
}

output "ai_service_private_ip" {
  description = "Private IP address of AI service instance"
  value       = google_compute_instance.ai_service.network_interface[0].network_ip
}

output "ai_service_name" {
  description = "Name of the AI service instance"
  value       = google_compute_instance.ai_service.name
}

output "static_ip_address" {
  description = "Reserved static IP address"
  value       = google_compute_address.ai_service_ip.address
}

output "pcap_bucket_name" {
  description = "Name of the Cloud Storage bucket for PCAP files"
  value       = google_storage_bucket.pcap_storage.name
}

output "pcap_bucket_url" {
  description = "URL of the PCAP storage bucket"
  value       = google_storage_bucket.pcap_storage.url
}

output "ssh_command" {
  description = "SSH command to connect to AI service instance"
  value       = "ssh -i ~/.ssh/usod-key ${var.ssh_user}@${google_compute_instance.ai_service.network_interface[0].access_config[0].nat_ip}"
}

output "gcloud_ssh_command" {
  description = "gcloud SSH command"
  value       = "gcloud compute ssh ${google_compute_instance.ai_service.name} --zone=${var.zone}"
}

output "summary" {
  description = "Deployment summary"
  value = {
    project_id        = var.project_id
    region            = var.region
    zone              = var.zone
    environment       = var.environment
    instance_name     = google_compute_instance.ai_service.name
    public_ip         = google_compute_instance.ai_service.network_interface[0].access_config[0].nat_ip
    pcap_bucket       = google_storage_bucket.pcap_storage.name
    ssh_command       = "ssh -i ~/.ssh/usod-key ${var.ssh_user}@${google_compute_instance.ai_service.network_interface[0].access_config[0].nat_ip}"
    ai_service_url    = "http://${google_compute_instance.ai_service.network_interface[0].access_config[0].nat_ip}:8000"
  }
}

