# USOD Platform - Cloud Deployment Configuration

This directory contains Infrastructure as Code (Terraform) and Configuration Management (Ansible) for deploying the USOD platform across multiple cloud providers.

---

## Overview

**Multi-Cloud Architecture:**
- **AWS** - Node.js Backend + S3 Storage (Free Tier)
- **GCP** - Python AI Service + PCAP Storage ($300 Credits)
- **Azure** - Hyperledger Fabric Blockchain (Student Credits)

---

## Directory Structure

```
cloud/
├── terraform/              # Infrastructure as Code
│   ├── aws/               # AWS resources (Backend)
│   ├── gcp/               # GCP resources (AI Service)
│   ├── azure/             # Azure resources (Blockchain)
│   └── README.md          # Terraform documentation
├── ansible/               # Configuration Management
│   ├── inventory/         # Server inventory
│   ├── playbooks/         # Deployment playbooks
│   ├── templates/         # Configuration templates
│   ├── ansible.cfg        # Ansible configuration
│   └── README.md          # Ansible documentation
└── README.md              # This file
```

---

## Quick Start Guide

### Step 1: Prerequisites

**Install Required Tools:**
```bash
# Terraform
choco install terraform

# Ansible (via WSL or Python)
pip install ansible

# Cloud CLIs
choco install awscli azure-cli
# GCP SDK: https://cloud.google.com/sdk/docs/install

# Generate SSH Keys
ssh-keygen -t rsa -b 4096 -f ~/.ssh/usod-key
```

---

### Step 2: Deploy Infrastructure with Terraform

**AWS (Backend):**
```bash
cd terraform/aws
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your settings

# Initialize and deploy
terraform init
terraform plan
terraform apply

# Save output
terraform output backend_public_ip
```

**GCP (AI Service):**
```bash
cd terraform/gcp
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your GCP project ID

terraform init
terraform plan
terraform apply

# Save output
terraform output ai_service_public_ip
```

**Azure (Blockchain):**
```bash
cd terraform/azure
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars

terraform init
terraform plan
terraform apply

# Save output
terraform output blockchain_public_ip
```

---

### Step 3: Configure Ansible Inventory

Update the inventory file with Terraform outputs:

```bash
cd ansible
nano inventory/production.yml

# Update these IPs from Terraform outputs:
# - aws-backend: ansible_host
# - gcp-ai: ansible_host
# - azure-blockchain: ansible_host
```

---

### Step 4: Deploy Applications with Ansible

**Test Connectivity:**
```bash
ansible all -m ping
```

**Deploy Services:**
```bash
# Deploy Backend
ansible-playbook playbooks/deploy-backend.yml

# Deploy AI Service
ansible-playbook playbooks/deploy-ai-service.yml

# Deploy Frontend
ansible-playbook playbooks/deploy-frontend.yml

# Deploy Blockchain
ansible-playbook playbooks/deploy-blockchain.yml
```

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    USOD Multi-Cloud Platform                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│   │     AWS      │      │     GCP      │      │    Azure     │
│   │   (Backend)  │      │ (AI Service) │      │ (Blockchain) │
│   ├──────────────┤      ├──────────────┤      ├──────────────┤
│   │              │      │              │      │              │
│   │ EC2 t2.micro │      │ e2-micro     │      │ B1s VM       │
│   │ Node.js      │◄────►│ Python       │      │ Fabric       │
│   │ MongoDB      │      │ FastAPI      │      │ Docker       │
│   │ PM2          │      │ Scapy        │      │ Orderer      │
│   │              │      │ ML Models    │      │ Peer         │
│   │              │      │              │      │ CA           │
│   │              │      │              │      │              │
│   │ S3 Bucket    │      │ Cloud Storage│      │ Storage Acct │
│   │ (Assets)     │      │ (PCAP Files) │      │ (Artifacts)  │
│   │              │      │              │      │              │
│   └──────────────┘      └──────────────┘      └──────────────┘
│         │                      │                      │
│         └──────────────────────┴──────────────────────┘
│                            │
│                    ┌───────▼────────┐
│                    │   Next.js      │
│                    │   Frontend     │
│                    │   (AWS/Nginx)  │
│                    └────────────────┘
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Cost Breakdown

### AWS (First Year Free Tier)
- **EC2 t2.micro:** FREE (750 hours/month)
- **S3 Storage:** FREE (5GB)
- **Data Transfer:** FREE (1GB/month)
- **After Free Tier:** ~$10-15/month

### GCP ($300 Free Credits)
- **e2-micro:** FREE (Always Free tier)
- **Cloud Storage:** FREE (5GB)
- **Network:** FREE (1GB/month)
- **Credits Last:** ~12 months
- **After Credits:** ~$5-10/month

### Azure (Student $100 Credits)
- **B1s VM:** ~$7.59/month
- **Storage:** ~$2/month
- **Network:** Minimal
- **Credits Last:** ~12 months
- **Total:** ~$10/month

**Total Estimated Cost:** $0-5/month (with free tiers)

---

## Deployment Checklist

### Pre-Deployment
- [ ] Install Terraform, Ansible, Cloud CLIs
- [ ] Generate SSH keys
- [ ] Create cloud accounts (AWS, GCP, Azure)
- [ ] Configure credentials (AWS CLI, gcloud, az login)
- [ ] Fork/clone repository to GitHub

### Terraform Deployment
- [ ] Update terraform.tfvars files
- [ ] Import SSH keys to cloud providers
- [ ] Deploy AWS infrastructure
- [ ] Deploy GCP infrastructure
- [ ] Deploy Azure infrastructure
- [ ] Save all Terraform outputs

### Ansible Configuration
- [ ] Update inventory with IPs from Terraform
- [ ] Configure MongoDB URI
- [ ] Set JWT secret
- [ ] Update webhook URLs
- [ ] Test SSH connectivity

### Application Deployment
- [ ] Deploy backend
- [ ] Deploy AI service
- [ ] Deploy frontend
- [ ] Deploy blockchain network
- [ ] Verify all services running

### Post-Deployment
- [ ] Test API endpoints
- [ ] Verify database connections
- [ ] Test AI service integration
- [ ] Test blockchain network
- [ ] Configure DNS (optional)
- [ ] Set up SSL certificates (optional)
- [ ] Configure monitoring (optional)

---

## Common Issues & Solutions

### Terraform Issues

**Issue:** "Provider not found"
```bash
terraform init -upgrade
```

**Issue:** "Authentication failed"
```bash
# AWS
aws configure

# GCP
gcloud auth application-default login

# Azure
az login
```

### Ansible Issues

**Issue:** "Host unreachable"
```bash
# Check SSH
ssh -i ~/.ssh/usod-key ubuntu@<IP>

# Check firewall
ansible all -a "sudo ufw status"
```

**Issue:** "Permission denied"
```bash
chmod 600 ~/.ssh/usod-key
```

---

## Maintenance

### Update Code
```bash
# Pull latest code on all servers
ansible all -a "git pull" -b --become-user ubuntu -C /opt/usod
```

### Restart Services
```bash
ansible backend -a "pm2 restart all" --become
ansible ai_service -a "systemctl restart usod-ai-service" --become
ansible blockchain -a "docker-compose restart" --become
```

### View Logs
```bash
ansible backend -a "pm2 logs --lines 50" --become
ansible ai_service -a "journalctl -u usod-ai-service -n 50" --become
ansible blockchain -a "docker logs orderer.usod.com --tail 50" --become
```

---

## Cleanup

### Destroy Infrastructure

**CAUTION:** This will delete all resources!

```bash
# Destroy Azure
cd terraform/azure
terraform destroy

# Destroy GCP
cd terraform/gcp
terraform destroy

# Destroy AWS
cd terraform/aws
terraform destroy
```

---

## Documentation

- **Terraform:** See `terraform/README.md`
- **Ansible:** See `ansible/README.md`
- **AWS Resources:** See `terraform/aws/main.tf`
- **GCP Resources:** See `terraform/gcp/main.tf`
- **Azure Resources:** See `terraform/azure/main.tf`

---

## Security Notes

1. **Never commit secrets** - Add `*.tfvars` to `.gitignore`
2. **Restrict SSH access** - Update security groups with your IP
3. **Use strong passwords** - For MongoDB, JWT secrets
4. **Enable encryption** - EBS, Cloud Storage, Managed Disks
5. **Regular updates** - Keep OS and packages updated
6. **Monitor costs** - Set up billing alerts

---

## Support

- **Terraform Docs:** https://www.terraform.io/docs
- **Ansible Docs:** https://docs.ansible.com/
- **AWS Free Tier:** https://aws.amazon.com/free/
- **GCP Free Tier:** https://cloud.google.com/free
- **Azure Student:** https://azure.microsoft.com/free/students/

---

**Status:** Ready for Deployment  
**Created:** October 22, 2025  
**Last Updated:** October 22, 2025

