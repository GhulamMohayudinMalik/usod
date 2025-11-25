# GCP Terraform Variables
# Define all input variables for the infrastructure

variable "project_id" {
  description = "GCP Project ID"
  type        = string
  
  validation {
    condition     = length(var.project_id) > 0
    error_message = "Project ID cannot be empty."
  }
}

variable "project_name" {
  description = "Project name for resource naming"
  type        = string
  default     = "usod"
}

variable "region" {
  description = "GCP region for deployment"
  type        = string
  default     = "us-central1"
}

variable "zone" {
  description = "GCP zone for deployment"
  type        = string
  default     = "us-central1-a"
}

variable "environment" {
  description = "Environment (production, staging, development)"
  type        = string
  default     = "production"
}

variable "machine_type" {
  description = "GCE instance machine type"
  type        = string
  default     = "e2-micro" # Free tier eligible
}

variable "ssh_user" {
  description = "SSH username"
  type        = string
  default     = "ubuntu"
}

variable "ssh_public_key_path" {
  description = "Path to SSH public key file"
  type        = string
  default     = "~/.ssh/usod-key.pub"
}

variable "allowed_ssh_ranges" {
  description = "CIDR ranges allowed to SSH"
  type        = list(string)
  default     = ["0.0.0.0/0"] # WARNING: Restrict in production
}

variable "use_static_ip" {
  description = "Use static IP address for the instance"
  type        = bool
  default     = false
}

variable "labels" {
  description = "Additional labels for all resources"
  type        = map(string)
  default     = {}
}

