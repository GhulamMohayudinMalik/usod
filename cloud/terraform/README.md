# USOD Platform - Terraform Infrastructure as Code

This directory contains Terraform configurations for deploying the USOD platform across multiple cloud providers (AWS, GCP, Azure).

---

## Overview

**Infrastructure Distribution:**
- **AWS** - Node.js Backend + MongoDB + S3 Storage
- **GCP** - Python AI Service + PCAP Storage
- **Azure** - Hyperledger Fabric Blockchain Network
- **Oracle Cloud (OCI)** - Alternative/Additional deployment (Always Free tier)

---

## Prerequisites

### 1. Install Terraform

**Windows:**
```powershell
# Using Chocolatey
choco install terraform

# Or download from: https://www.terraform.io/downloads
```

**Verify Installation:**
```bash
terraform version
```

### 2. Install Cloud CLI Tools

**AWS CLI:**
```bash
# Windows
choco install awscli

# Verify
aws --version
```

**Google Cloud SDK:**
```bash
# Download from: https://cloud.google.com/sdk/docs/install
# Verify
gcloud --version
```

**Azure CLI:**
```bash
# Windows
choco install azure-cli

# Verify
az --version
```

**Oracle Cloud CLI (Optional):**
```bash
# Windows (using Python)
pip install oci-cli

# Verify
oci --version

# Configure
oci setup config
```

### 3. Generate SSH Keys

```bash
# Generate SSH key pair
ssh-keygen -t rsa -b 4096 -f ~/.ssh/usod-key

# This creates:
# - Private key: ~/.ssh/usod-key
# - Public key: ~/.ssh/usod-key.pub
```

---

## Setup Instructions

### AWS Setup

1. **Configure AWS Credentials:**
   ```bash
   aws configure
   # Enter Access Key ID
   # Enter Secret Access Key  
   # Enter Default region: us-east-1
   # Enter Default output format: json
   ```

2. **Import SSH Key to AWS:**
   ```bash
   aws ec2 import-key-pair \
     --key-name usod-key \
     --public-key-material fileb://~/.ssh/usod-key.pub \
     --region us-east-1
   ```

3. **Configure Variables:**
   ```bash
   cd aws
   cp terraform.tfvars.example terraform.tfvars
   # Edit terraform.tfvars with your values
   ```

4. **Deploy Infrastructure:**
   ```bash
   # Initialize Terraform
   terraform init

   # Preview changes
   terraform plan

   # Apply changes
   terraform apply
   # Type 'yes' when prompted

   # View outputs
   terraform output
   ```

5. **Get Connection Info:**
   ```bash
   # SSH to backend server
   terraform output ssh_command

   # Get backend IP
   terraform output backend_public_ip
   ```

---

### GCP Setup

1. **Authenticate with GCP:**
   ```bash
   # Login to GCP
   gcloud auth login

   # Set application default credentials
   gcloud auth application-default login

   # List projects
   gcloud projects list

   # Set active project
   gcloud config set project YOUR_PROJECT_ID
   ```

2. **Enable Required APIs:**
   ```bash
   gcloud services enable compute.googleapis.com
   gcloud services enable storage-api.googleapis.com
   ```

3. **Configure Variables:**
   ```bash
   cd gcp
   cp terraform.tfvars.example terraform.tfvars
   # Edit terraform.tfvars - MUST set project_id!
   ```

4. **Deploy Infrastructure:**
   ```bash
   terraform init
   terraform plan
   terraform apply
   
   # View outputs
   terraform output
   ```

5. **Get Connection Info:**
   ```bash
   # SSH to AI service
   terraform output ssh_command
   
   # Or use gcloud
   terraform output gcloud_ssh_command
   ```

---

### Oracle Cloud Infrastructure (OCI) Setup

1. **Create OCI Account:**
   ```bash
   # Sign up for Always Free tier: https://www.oracle.com/cloud/free/
   # No credit card required for Always Free tier
   ```

2. **Generate API Key:**
   ```bash
   # In OCI Console:
   # 1. Click Profile icon → User Settings
   # 2. Under Resources → API Keys → Add API Key
   # 3. Download private key and save as ~/.oci/oci_api_key.pem
   # 4. Copy the configuration preview
   
   # Set permissions
   chmod 600 ~/.oci/oci_api_key.pem
   ```

3. **Get OCIDs:**
   ```bash
   # Tenancy OCID: Profile menu → Tenancy → Copy OCID
   # User OCID: Profile menu → User Settings → Copy OCID
   # Compartment OCID: Navigation → Identity → Compartments → Copy OCID
   ```

4. **Configure Variables:**
   ```bash
   cd oracle
   cp terraform.tfvars.example terraform.tfvars
   # Edit terraform.tfvars with your OCIDs and fingerprint
   ```

5. **Deploy Infrastructure:**
   ```bash
   terraform init
   terraform plan
   terraform apply
   
   # View outputs
   terraform output
   ```

6. **Get Connection Info:**
   ```bash
   # SSH to instance (default user is 'opc')
   terraform output ssh_command
   
   # Get public IP
   terraform output instance_public_ip
   ```

---

### Azure Setup

1. **Login to Azure:**
   ```bash
   # Login
   az login

   # List subscriptions
   az account list --output table

   # Set active subscription
   az account set --subscription "your-subscription-id"
   ```

2. **Configure Variables:**
   ```bash
   cd azure
   cp terraform.tfvars.example terraform.tfvars
   # Edit terraform.tfvars with your values
   ```

3. **Deploy Infrastructure:**
   ```bash
   terraform init
   terraform plan
   terraform apply
   
   # View outputs
   terraform output
   ```

4. **Get Connection Info:**
   ```bash
   # SSH to blockchain VM
   terraform output ssh_command
   
   # Get blockchain IPs
   terraform output blockchain_public_ip
   ```

---

## Common Terraform Commands

### Initialize
```bash
terraform init
# Downloads provider plugins and initializes backend
```

### Plan
```bash
terraform plan
# Shows what changes will be made (dry run)

# Save plan to file
terraform plan -out=tfplan
```

### Apply
```bash
terraform apply
# Creates/updates infrastructure

# Apply saved plan
terraform apply tfplan

# Auto-approve (skip confirmation)
terraform apply -auto-approve
```

### Destroy
```bash
terraform destroy
# Deletes all infrastructure

# Destroy specific resource
terraform destroy -target=aws_instance.backend
```

### Output
```bash
# Show all outputs
terraform output

# Show specific output
terraform output backend_public_ip

# Output as JSON
terraform output -json
```

### State
```bash
# List resources in state
terraform state list

# Show resource details
terraform state show aws_instance.backend

# Remove resource from state
terraform state rm aws_instance.backend
```

### Format
```bash
# Format Terraform files
terraform fmt

# Check if files are formatted
terraform fmt -check
```

### Validate
```bash
# Validate configuration syntax
terraform validate
```

---

## Project Structure

```
terraform/
├── aws/
│   ├── main.tf                    # AWS resources
│   ├── variables.tf               # Input variables
│   ├── outputs.tf                 # Output values
│   ├── terraform.tfvars.example   # Example config
│   └── terraform.tfvars           # Your config (gitignored)
├── gcp/
│   ├── main.tf                    # GCP resources
│   ├── variables.tf
│   ├── outputs.tf
│   ├── terraform.tfvars.example
│   └── terraform.tfvars           # Your config (gitignored)
├── azure/
│   ├── main.tf                    # Azure resources
│   ├── variables.tf
│   ├── outputs.tf
│   ├── terraform.tfvars.example
│   └── terraform.tfvars           # Your config (gitignored)
└── README.md                      # This file
```

---

## Resource Overview

### AWS Resources
- 1x EC2 t2.micro instance (Backend)
- 1x Elastic IP
- 1x Security Group
- 1x S3 Bucket (Static assets)
- 1x CloudWatch Log Group

### GCP Resources
- 1x Compute Engine e2-micro (AI Service)
- 1x Cloud Storage Bucket (PCAP files)
- 3x Firewall Rules (SSH, API, HTTP/HTTPS)
- 1x Static IP (optional)

### Azure Resources
- 1x Resource Group
- 1x Virtual Network + Subnet
- 1x Linux VM Standard_B1s (Blockchain)
- 1x Public IP
- 1x Network Security Group
- 1x Storage Account + Container

### Oracle Cloud (OCI) Resources
- 1x VCN (Virtual Cloud Network)
- 1x Subnet + Route Table + Internet Gateway
- 1x Security List
- 1x Compute Instance (VM.Standard.E2.1.Micro or A1.Flex)
- 1x Object Storage Bucket
- 1x Block Volume (optional)

---

## Cost Estimates

### AWS (Free Tier - First Year)
- EC2 t2.micro: **FREE** (750 hours/month)
- S3: **FREE** (5GB storage, 20,000 GET, 2,000 PUT)
- Data Transfer: **FREE** (1GB/month outbound)

**After Free Tier:** ~$10-15/month

### GCP (Always Free + $300 Credit)
- e2-micro: **FREE** (1 instance, 30GB disk)
- Cloud Storage: **FREE** (5GB)
- Network: **FREE** (1GB/month)

**After Credits:** ~$5-10/month

### Azure (Free for Students - $100 Credit)
- B1s VM: ~$7.59/month
- Storage: ~$2/month
- Network: Minimal

**Total:** ~$10/month (covered by student credits)

### Oracle Cloud (Always Free - No Expiration!)
- **Compute:**
  - 2x AMD VM.Standard.E2.1.Micro (1 OCPU, 1GB RAM each): **FREE FOREVER**
  - OR 4 OCPUs + 24GB RAM of ARM A1.Flex instances: **FREE FOREVER**
- **Storage:**
  - 2x 50GB Block Volumes: **FREE FOREVER**
  - 200GB Boot Volume: **FREE FOREVER**
  - 20GB Object Storage: **FREE FOREVER**
- **Network:** 10TB/month outbound: **FREE FOREVER**

**Total:** **$0/month FOREVER** (no expiration, no credit card required!)

---

## Security Best Practices

### 1. Restrict SSH Access
```hcl
# In terraform.tfvars, change:
allowed_ssh_cidr = ["YOUR_IP/32"]

# Get your IP:
curl ifconfig.me
```

### 2. Use Strong SSH Keys
```bash
# Generate 4096-bit key
ssh-keygen -t rsa -b 4096 -f ~/.ssh/usod-key

# Set proper permissions
chmod 600 ~/.ssh/usod-key
chmod 644 ~/.ssh/usod-key.pub
```

### 3. Enable Encryption
- AWS: EBS encryption (enabled in config)
- GCP: Disk encryption (enabled by default)
- Azure: Managed disk encryption (enabled by default)

### 4. Don't Commit Secrets
```bash
# Add to .gitignore:
*.tfvars
*.tfstate
*.tfstate.backup
.terraform/
```

---

## Troubleshooting

### Issue: "Error: Provider not found"
**Solution:**
```bash
terraform init -upgrade
```

### Issue: "Authentication failed"
**Solution:**
```bash
# AWS
aws configure

# GCP
gcloud auth application-default login

# Azure
az login
```

### Issue: "Resource already exists"
**Solution:**
```bash
# Import existing resource
terraform import aws_instance.backend i-1234567890abcdef0

# Or change resource name in config
```

### Issue: "Insufficient permissions"
**Solution:**
- AWS: Ensure IAM user has EC2, S3, VPC permissions
- GCP: Ensure account has Compute Admin role
- Azure: Ensure account has Contributor role

---

## Cleanup

### Destroy All Resources

**AWS:**
```bash
cd aws
terraform destroy
# Type 'yes' to confirm
```

**GCP:**
```bash
cd gcp
terraform destroy
```

**Azure:**
```bash
cd azure
terraform destroy
```

### Verify Deletion

**AWS:**
```bash
aws ec2 describe-instances --query 'Reservations[*].Instances[*].[InstanceId,State.Name]' --output table
```

**GCP:**
```bash
gcloud compute instances list
```

**Azure:**
```bash
az vm list --output table
```

---

## Next Steps

After deploying infrastructure:

1. **Configure Ansible** - Use the IP addresses from Terraform outputs in Ansible inventory
2. **Deploy Applications** - Run Ansible playbooks to install and configure services
3. **Test Connectivity** - Verify all services are accessible
4. **Set up Monitoring** - Configure CloudWatch/Cloud Monitoring/Azure Monitor
5. **Configure DNS** - Point your domain to the public IPs
6. **Enable HTTPS** - Set up SSL certificates with Let's Encrypt

---

## Useful Links

- [Terraform Documentation](https://www.terraform.io/docs)
- [AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [GCP Provider](https://registry.terraform.io/providers/hashicorp/google/latest/docs)
- [Azure Provider](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs)
- [Terraform Best Practices](https://www.terraform.io/docs/cloud/guides/recommended-practices)

---

**Created:** October 22, 2025  
**Status:** Ready for Deployment  
**Terraform Version:** >= 1.0

