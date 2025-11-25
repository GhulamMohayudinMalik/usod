# USOD Platform - GCP Infrastructure  
# Terraform configuration for deploying Python AI Service on Google Cloud

terraform {
  required_version = ">= 1.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

# Configure GCP Provider
provider "google" {
  project = var.project_id
  region  = var.region
  zone    = var.zone
  
  # Credentials should be configured via:
  # - Service account key file: export GOOGLE_APPLICATION_CREDENTIALS="path/to/key.json"
  # - gcloud CLI: gcloud auth application-default login
}

# Compute Engine Instance for AI Service
resource "google_compute_instance" "ai_service" {
  name         = "${var.project_name}-ai-service"
  machine_type = var.machine_type
  zone         = var.zone

  tags = ["ai-service", "http-server", "https-server"]

  boot_disk {
    initialize_params {
      image = "ubuntu-os-cloud/ubuntu-2204-lts"
      size  = 20
      type  = "pd-standard"
    }
  }

  network_interface {
    network = "default"

    access_config {
      // Ephemeral public IP
    }
  }

  metadata = {
    ssh-keys = "${var.ssh_user}:${file(var.ssh_public_key_path)}"
  }

  metadata_startup_script = <<-EOF
    #!/bin/bash
    apt-get update
    apt-get upgrade -y
    
    # Install basic tools
    apt-get install -y curl wget git htop python3-pip python3-venv
    
    # Set hostname
    hostnamectl set-hostname usod-ai-service
    echo "127.0.0.1 usod-ai-service" >> /etc/hosts
    
    # Create application user
    useradd -m -s /bin/bash usod
    usermod -aG sudo usod
  EOF

  labels = {
    environment = var.environment
    project     = var.project_name
    component   = "ai-service"
  }

  service_account {
    scopes = ["cloud-platform"]
  }
}

# Firewall rule for SSH
resource "google_compute_firewall" "ai_service_ssh" {
  name    = "${var.project_name}-ai-service-ssh"
  network = "default"

  allow {
    protocol = "tcp"
    ports    = ["22"]
  }

  source_ranges = var.allowed_ssh_ranges
  target_tags   = ["ai-service"]
}

# Firewall rule for AI Service (FastAPI)
resource "google_compute_firewall" "ai_service_api" {
  name    = "${var.project_name}-ai-service-api"
  network = "default"

  allow {
    protocol = "tcp"
    ports    = ["8000"] # FastAPI port
  }

  source_ranges = ["0.0.0.0/0"]
  target_tags   = ["ai-service"]
}

# Firewall rule for HTTP/HTTPS
resource "google_compute_firewall" "ai_service_web" {
  name    = "${var.project_name}-ai-service-web"
  network = "default"

  allow {
    protocol = "tcp"
    ports    = ["80", "443"]
  }

  source_ranges = ["0.0.0.0/0"]
  target_tags   = ["http-server", "https-server"]
}

# Cloud Storage bucket for PCAP files
resource "google_storage_bucket" "pcap_storage" {
  name          = "${var.project_id}-pcap-files"
  location      = var.region
  force_destroy = false

  uniform_bucket_level_access = true

  versioning {
    enabled = true
  }

  lifecycle_rule {
    condition {
      age = 90 # Delete files older than 90 days
    }
    action {
      type = "Delete"
    }
  }

  labels = {
    environment = var.environment
    project     = var.project_name
    component   = "pcap-storage"
  }
}

# IAM binding for public read (if needed)
# Uncomment if you want public access to PCAP files
# resource "google_storage_bucket_iam_member" "pcap_public_read" {
#   bucket = google_storage_bucket.pcap_storage.name
#   role   = "roles/storage.objectViewer"
#   member = "allUsers"
# }

# Reserve a static IP address
resource "google_compute_address" "ai_service_ip" {
  name   = "${var.project_name}-ai-service-ip"
  region = var.region
}

# Attach static IP to instance
resource "google_compute_instance" "ai_service_with_static_ip" {
  count = var.use_static_ip ? 1 : 0

  name         = "${var.project_name}-ai-service-static"
  machine_type = var.machine_type
  zone         = var.zone

  tags = ["ai-service", "http-server", "https-server"]

  boot_disk {
    initialize_params {
      image = "ubuntu-os-cloud/ubuntu-2204-lts"
      size  = 20
    }
  }

  network_interface {
    network = "default"

    access_config {
      nat_ip = google_compute_address.ai_service_ip.address
    }
  }

  metadata = {
    ssh-keys = "${var.ssh_user}:${file(var.ssh_public_key_path)}"
  }

  metadata_startup_script = <<-EOF
    #!/bin/bash
    apt-get update
    apt-get upgrade -y
    apt-get install -y curl wget git htop python3-pip python3-venv
    hostnamectl set-hostname usod-ai-service
  EOF

  labels = {
    environment = var.environment
    project     = var.project_name
  }
}

