# USOD Platform - Oracle Cloud Infrastructure
# Terraform configuration for deploying services on OCI Always Free tier

terraform {
  required_version = ">= 1.0"
  required_providers {
    oci = {
      source  = "oracle/oci"
      version = "~> 5.0"
    }
  }
}

# Configure OCI Provider
provider "oci" {
  tenancy_ocid     = var.tenancy_ocid
  user_ocid        = var.user_ocid
  fingerprint      = var.fingerprint
  private_key_path = var.private_key_path
  region           = var.region
  
  # Credentials configuration:
  # 1. Create OCI account: https://www.oracle.com/cloud/free/
  # 2. Generate API key: https://docs.oracle.com/en-us/iaas/Content/API/Concepts/apisigningkey.htm
  # 3. Add key to your user profile
  # 4. Update variables with your OCIDs
}

# Get list of availability domains
data "oci_identity_availability_domains" "ads" {
  compartment_id = var.tenancy_ocid
}

# Get latest Oracle Linux image
data "oci_core_images" "oracle_linux" {
  compartment_id           = var.compartment_ocid
  operating_system         = "Oracle Linux"
  operating_system_version = "8"
  shape                    = var.instance_shape
  sort_by                  = "TIMECREATED"
  sort_order               = "DESC"
}

# VCN (Virtual Cloud Network)
resource "oci_core_vcn" "usod_vcn" {
  compartment_id = var.compartment_ocid
  cidr_blocks    = ["10.0.0.0/16"]
  display_name   = "${var.project_name}-vcn"
  dns_label      = "usodvcn"

  freeform_tags = {
    Environment = var.environment
    Project     = var.project_name
  }
}

# Internet Gateway
resource "oci_core_internet_gateway" "usod_igw" {
  compartment_id = var.compartment_ocid
  vcn_id         = oci_core_vcn.usod_vcn.id
  display_name   = "${var.project_name}-igw"
  enabled        = true

  freeform_tags = {
    Environment = var.environment
  }
}

# Route Table
resource "oci_core_route_table" "usod_rt" {
  compartment_id = var.compartment_ocid
  vcn_id         = oci_core_vcn.usod_vcn.id
  display_name   = "${var.project_name}-rt"

  route_rules {
    destination       = "0.0.0.0/0"
    destination_type  = "CIDR_BLOCK"
    network_entity_id = oci_core_internet_gateway.usod_igw.id
  }

  freeform_tags = {
    Environment = var.environment
  }
}

# Subnet
resource "oci_core_subnet" "usod_subnet" {
  compartment_id    = var.compartment_ocid
  vcn_id            = oci_core_vcn.usod_vcn.id
  cidr_block        = "10.0.1.0/24"
  display_name      = "${var.project_name}-subnet"
  dns_label         = "usodsubnet"
  route_table_id    = oci_core_route_table.usod_rt.id
  security_list_ids = [oci_core_security_list.usod_seclist.id]

  freeform_tags = {
    Environment = var.environment
  }
}

# Security List
resource "oci_core_security_list" "usod_seclist" {
  compartment_id = var.compartment_ocid
  vcn_id         = oci_core_vcn.usod_vcn.id
  display_name   = "${var.project_name}-seclist"

  # Egress Rules - Allow all outbound
  egress_security_rules {
    destination = "0.0.0.0/0"
    protocol    = "all"
    stateless   = false
  }

  # Ingress Rules
  # SSH
  ingress_security_rules {
    protocol    = "6" # TCP
    source      = "0.0.0.0/0"
    stateless   = false
    description = "SSH"

    tcp_options {
      min = 22
      max = 22
    }
  }

  # HTTP
  ingress_security_rules {
    protocol    = "6"
    source      = "0.0.0.0/0"
    stateless   = false
    description = "HTTP"

    tcp_options {
      min = 80
      max = 80
    }
  }

  # HTTPS
  ingress_security_rules {
    protocol    = "6"
    source      = "0.0.0.0/0"
    stateless   = false
    description = "HTTPS"

    tcp_options {
      min = 443
      max = 443
    }
  }

  # Backend API
  ingress_security_rules {
    protocol    = "6"
    source      = "0.0.0.0/0"
    stateless   = false
    description = "Backend API"

    tcp_options {
      min = 5000
      max = 5000
    }
  }

  # AI Service
  ingress_security_rules {
    protocol    = "6"
    source      = "0.0.0.0/0"
    stateless   = false
    description = "AI Service"

    tcp_options {
      min = 8000
      max = 8000
    }
  }

  # Frontend
  ingress_security_rules {
    protocol    = "6"
    source      = "0.0.0.0/0"
    stateless   = false
    description = "Frontend"

    tcp_options {
      min = 3000
      max = 3000
    }
  }

  # Hyperledger Fabric Orderer
  ingress_security_rules {
    protocol    = "6"
    source      = "0.0.0.0/0"
    stateless   = false
    description = "Fabric Orderer"

    tcp_options {
      min = 7050
      max = 7050
    }
  }

  # Hyperledger Fabric Peer
  ingress_security_rules {
    protocol    = "6"
    source      = "0.0.0.0/0"
    stateless   = false
    description = "Fabric Peer"

    tcp_options {
      min = 7051
      max = 7051
    }
  }

  # Hyperledger Fabric CA
  ingress_security_rules {
    protocol    = "6"
    source      = "0.0.0.0/0"
    stateless   = false
    description = "Fabric CA"

    tcp_options {
      min = 7054
      max = 7054
    }
  }

  freeform_tags = {
    Environment = var.environment
  }
}

# Compute Instance (Always Free - VM.Standard.E2.1.Micro)
resource "oci_core_instance" "usod_instance" {
  availability_domain = data.oci_identity_availability_domains.ads.availability_domains[0].name
  compartment_id      = var.compartment_ocid
  shape               = var.instance_shape
  display_name        = "${var.project_name}-${var.service_name}"

  # Shape config for flexible shapes
  shape_config {
    memory_in_gbs = var.instance_memory_gb
    ocpus         = var.instance_ocpus
  }

  source_details {
    source_id   = data.oci_core_images.oracle_linux.images[0].id
    source_type = "image"
    boot_volume_size_in_gbs = var.boot_volume_size
  }

  create_vnic_details {
    subnet_id        = oci_core_subnet.usod_subnet.id
    display_name     = "${var.project_name}-vnic"
    assign_public_ip = true
    hostname_label   = var.hostname_label
  }

  metadata = {
    ssh_authorized_keys = file(var.ssh_public_key_path)
    user_data = base64encode(templatefile("${path.module}/cloud-init.yaml", {
      service_name = var.service_name
    }))
  }

  freeform_tags = {
    Environment = var.environment
    Project     = var.project_name
    Service     = var.service_name
  }
}

# Block Volume for data storage (Always Free - 2x 50GB)
resource "oci_core_volume" "usod_data_volume" {
  count               = var.create_data_volume ? 1 : 0
  availability_domain = data.oci_identity_availability_domains.ads.availability_domains[0].name
  compartment_id      = var.compartment_ocid
  display_name        = "${var.project_name}-data-volume"
  size_in_gbs         = var.data_volume_size

  freeform_tags = {
    Environment = var.environment
    Project     = var.project_name
  }
}

# Volume Attachment
resource "oci_core_volume_attachment" "usod_volume_attachment" {
  count           = var.create_data_volume ? 1 : 0
  attachment_type = "paravirtualized"
  instance_id     = oci_core_instance.usod_instance.id
  volume_id       = oci_core_volume.usod_data_volume[0].id
  display_name    = "${var.project_name}-volume-attachment"
}

# Object Storage Bucket (Always Free - 20GB)
resource "oci_objectstorage_bucket" "usod_bucket" {
  compartment_id = var.compartment_ocid
  namespace      = data.oci_objectstorage_namespace.ns.namespace
  name           = "${var.project_name}-bucket"
  access_type    = var.bucket_access_type

  versioning = "Enabled"

  freeform_tags = {
    Environment = var.environment
    Project     = var.project_name
  }
}

# Get Object Storage namespace
data "oci_objectstorage_namespace" "ns" {
  compartment_id = var.compartment_ocid
}

