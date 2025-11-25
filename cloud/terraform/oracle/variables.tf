# Oracle Cloud Infrastructure (OCI) Terraform Variables
# Define all input variables for the infrastructure

variable "tenancy_ocid" {
  description = "OCID of your tenancy"
  type        = string
  
  validation {
    condition     = length(var.tenancy_ocid) > 0
    error_message = "Tenancy OCID is required."
  }
}

variable "user_ocid" {
  description = "OCID of the user"
  type        = string
  
  validation {
    condition     = length(var.user_ocid) > 0
    error_message = "User OCID is required."
  }
}

variable "fingerprint" {
  description = "Fingerprint of the API key"
  type        = string
  
  validation {
    condition     = length(var.fingerprint) > 0
    error_message = "API key fingerprint is required."
  }
}

variable "private_key_path" {
  description = "Path to your private API key file"
  type        = string
  default     = "~/.oci/oci_api_key.pem"
}

variable "compartment_ocid" {
  description = "OCID of the compartment (can be tenancy OCID for root compartment)"
  type        = string
}

variable "region" {
  description = "OCI region"
  type        = string
  default     = "us-ashburn-1" # Always Free tier available
  
  # Other Always Free regions:
  # - us-phoenix-1
  # - us-sanjose-1
  # - ca-toronto-1
  # - eu-frankfurt-1
  # - uk-london-1
  # - ap-seoul-1
  # - ap-tokyo-1
  # - ap-mumbai-1
  # - sa-saopaulo-1
}

variable "project_name" {
  description = "Project name for resource naming"
  type        = string
  default     = "usod"
}

variable "environment" {
  description = "Environment (production, staging, development)"
  type        = string
  default     = "production"
}

variable "service_name" {
  description = "Service name (backend, ai-service, frontend, blockchain)"
  type        = string
  default     = "app"
}

variable "instance_shape" {
  description = "Compute instance shape"
  type        = string
  default     = "VM.Standard.E2.1.Micro" # Always Free eligible
  
  # Always Free options:
  # - VM.Standard.E2.1.Micro (AMD) - 1 OCPU, 1GB RAM
  # - VM.Standard.A1.Flex (ARM) - Up to 4 OCPUs, 24GB RAM (shared across all instances)
}

variable "instance_ocpus" {
  description = "Number of OCPUs (for flexible shapes)"
  type        = number
  default     = 1
}

variable "instance_memory_gb" {
  description = "Memory in GB (for flexible shapes)"
  type        = number
  default     = 1
}

variable "boot_volume_size" {
  description = "Boot volume size in GB"
  type        = number
  default     = 50 # Supports up to 200GB on Always Free
}

variable "create_data_volume" {
  description = "Whether to create an additional data volume"
  type        = bool
  default     = false
}

variable "data_volume_size" {
  description = "Data volume size in GB"
  type        = number
  default     = 50 # Always Free: 2x 50GB volumes
}

variable "ssh_public_key_path" {
  description = "Path to SSH public key file"
  type        = string
  default     = "~/.ssh/usod-key.pub"
}

variable "hostname_label" {
  description = "Hostname label for the instance"
  type        = string
  default     = "usod-host"
}

variable "bucket_access_type" {
  description = "Object storage bucket access type"
  type        = string
  default     = "NoPublicAccess" # NoPublicAccess, ObjectRead, ObjectReadWithoutList
}

variable "tags" {
  description = "Additional freeform tags for all resources"
  type        = map(string)
  default     = {}
}

