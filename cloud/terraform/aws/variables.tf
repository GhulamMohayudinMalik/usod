# AWS Terraform Variables
# Define all input variables for the infrastructure

variable "aws_region" {
  description = "AWS region for deployment"
  type        = string
  default     = "us-east-1"
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

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t2.micro" # Free tier eligible
}

variable "key_name" {
  description = "SSH key pair name (must exist in AWS)"
  type        = string
  default     = "usod-key"
  
  validation {
    condition     = length(var.key_name) > 0
    error_message = "Key name cannot be empty. Create an SSH key pair in AWS first."
  }
}

variable "allowed_ssh_cidr" {
  description = "CIDR blocks allowed to SSH (restrict in production)"
  type        = list(string)
  default     = ["0.0.0.0/0"] # WARNING: Open to all, change for production
}

variable "tags" {
  description = "Additional tags for all resources"
  type        = map(string)
  default     = {}
}

