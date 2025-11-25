# USOD Platform - Complete Deployment Guide

This guide provides a complete walkthrough for deploying the USOD platform across AWS, GCP, and Azure using Terraform and Ansible.

---

## 🎯 Overview

**What you're deploying:**
- **AWS EC2** → Node.js Backend + Next.js Frontend
- **GCP Compute Engine** → Python AI Service
- **Azure VM** → Hyperledger Fabric Blockchain

**Technologies:**
- Infrastructure as Code (IaC): Terraform
- Configuration Management: Ansible
- Cloud Providers: AWS, GCP, Azure (all free tier/credits)

---

## 📋 Prerequisites Checklist

### 1. Tools Installation

- [ ] **Terraform** (>= 1.0)
  ```bash
  choco install terraform
  terraform version
  ```

- [ ] **Ansible** (>= 2.9)
  ```bash
  pip install ansible
  ansible --version
  ```

- [ ] **AWS CLI**
  ```bash
  choco install awscli
  aws --version
  ```

- [ ] **Google Cloud SDK**
  ```bash
  # Download from: https://cloud.google.com/sdk/docs/install
  gcloud --version
  ```

- [ ] **Azure CLI**
  ```bash
  choco install azure-cli
  az --version
  ```

### 2. Cloud Accounts

- [ ] AWS Account (Free Tier)
- [ ] GCP Account ($300 credits for new users)
- [ ] Azure Account (Student credits: $100)

### 3. SSH Keys

```bash
# Generate SSH key pair
ssh-keygen -t rsa -b 4096 -f ~/.ssh/usod-key

# Set proper permissions
chmod 600 ~/.ssh/usod-key
chmod 644 ~/.ssh/usod-key.pub
```

---

## 🚀 Step-by-Step Deployment

### STEP 1: Configure Cloud Credentials

#### AWS
```bash
aws configure
# Enter:
# - Access Key ID
# - Secret Access Key
# - Default region: us-east-1
# - Default output format: json
```

#### GCP
```bash
# Login to GCP
gcloud auth login

# Set application default credentials
gcloud auth application-default login

# List your projects
gcloud projects list

# Set active project
gcloud config set project YOUR_PROJECT_ID

# Enable required APIs
gcloud services enable compute.googleapis.com
gcloud services enable storage-api.googleapis.com
```

#### Azure
```bash
# Login to Azure
az login

# List subscriptions
az account list --output table

# Set active subscription
az account set --subscription "your-subscription-id"
```

---

### STEP 2: Deploy Infrastructure with Terraform

#### 2.1 Deploy AWS (Backend)

```bash
cd cloud/terraform/aws

# Copy and edit configuration
cp terraform.tfvars.example terraform.tfvars
nano terraform.tfvars
# Update:
# - key_name (must exist in AWS or import your key)
# - aws_region (optional)
# - allowed_ssh_cidr (your IP for security)

# Import SSH key to AWS (if needed)
aws ec2 import-key-pair \
  --key-name usod-key \
  --public-key-material fileb://~/.ssh/usod-key.pub \
  --region us-east-1

# Initialize Terraform
terraform init

# Preview changes
terraform plan

# Deploy infrastructure
terraform apply
# Type 'yes' when prompted

# Save outputs (you'll need these)
terraform output > aws-outputs.txt
terraform output backend_public_ip
```

#### 2.2 Deploy GCP (AI Service)

```bash
cd ../gcp

# Copy and edit configuration
cp terraform.tfvars.example terraform.tfvars
nano terraform.tfvars
# Update:
# - project_id (REQUIRED - your GCP project ID)
# - region, zone (optional)

# Initialize and deploy
terraform init
terraform plan
terraform apply

# Save outputs
terraform output > gcp-outputs.txt
terraform output ai_service_public_ip
```

#### 2.3 Deploy Azure (Blockchain)

```bash
cd ../azure

# Copy and edit configuration
cp terraform.tfvars.example terraform.tfvars
nano terraform.tfvars
# Update:
# - location (optional)
# - vm_size (optional)

# Initialize and deploy
terraform init
terraform plan
terraform apply

# Save outputs
terraform output > azure-outputs.txt
terraform output blockchain_public_ip
```

**✅ Checkpoint:** You should now have 3 running VMs across AWS, GCP, and Azure.

---

### STEP 3: Configure Ansible Inventory

```bash
cd ../../ansible

# Edit inventory file
nano inventory/production.yml

# Update the following IPs (from Terraform outputs):
# - aws-backend: ansible_host: <AWS_IP>
# - gcp-ai: ansible_host: <GCP_IP>
# - azure-blockchain: ansible_host: <AZURE_IP>

# Also update environment variables:
# - mongodb_uri (MongoDB Atlas or other)
# - jwt_secret (generate a strong secret)
# - backend_webhook_url (http://<AWS_IP>:5000/api/network/webhook)
```

**Generate secrets:**
```bash
# Generate JWT secret
openssl rand -hex 32

# Generate session secret
openssl rand -base64 32
```

---

### STEP 4: Test Ansible Connectivity

```bash
# Test SSH connectivity
ansible all -m ping

# Expected output:
# aws-backend | SUCCESS => { "ping": "pong" }
# gcp-ai | SUCCESS => { "ping": "pong" }
# azure-blockchain | SUCCESS => { "ping": "pong" }

# If you get errors, troubleshoot:
# 1. Check SSH manually:
ssh -i ~/.ssh/usod-key ubuntu@<IP>

# 2. Check firewall rules allow SSH (port 22)
# 3. Verify SSH key permissions (chmod 600)
```

---

### STEP 5: Deploy Applications with Ansible

#### 5.1 Deploy Backend (AWS)

```bash
# Update playbook variables if needed
nano playbooks/deploy-backend.yml
# Update git_repo with your repository URL

# Deploy
ansible-playbook playbooks/deploy-backend.yml

# Verify deployment
ansible backend -a "pm2 status"
ansible backend -a "curl -s http://localhost:5000/api/health"
```

#### 5.2 Deploy AI Service (GCP)

```bash
# Update playbook variables
nano playbooks/deploy-ai-service.yml
# Update git_repo

# Deploy
ansible-playbook playbooks/deploy-ai-service.yml

# Verify deployment
ansible ai_service -a "systemctl status usod-ai-service"
ansible ai_service -a "curl -s http://localhost:8000/api/health"
```

#### 5.3 Deploy Frontend (AWS or separate server)

```bash
# Update playbook variables
nano playbooks/deploy-frontend.yml
# Update git_repo and api_url

# Deploy
ansible-playbook playbooks/deploy-frontend.yml

# Verify deployment
ansible frontend -a "pm2 status"
ansible frontend -a "systemctl status nginx"
```

#### 5.4 Deploy Blockchain (Azure)

```bash
# Update playbook variables
nano playbooks/deploy-blockchain.yml
# Update git_repo

# Deploy
ansible-playbook playbooks/deploy-blockchain.yml

# Verify deployment
ansible blockchain -a "docker ps"
ansible blockchain -a "docker logs orderer.usod.com --tail 20"
```

**✅ Checkpoint:** All services should now be running and accessible.

---

### STEP 6: Verify Deployment

#### Test Backend API
```bash
AWS_IP=$(cd ../terraform/aws && terraform output -raw backend_public_ip)
curl http://$AWS_IP:5000/api/health
```

#### Test AI Service
```bash
GCP_IP=$(cd ../terraform/gcp && terraform output -raw ai_service_public_ip)
curl http://$GCP_IP:8000/api/health
```

#### Test Frontend
```bash
curl http://$AWS_IP:3000
# Should return HTML
```

#### Test Blockchain
```bash
AZURE_IP=$(cd ../terraform/azure && terraform output -raw blockchain_public_ip)
ssh -i ~/.ssh/usod-key azureuser@$AZURE_IP "docker ps"
```

---

### STEP 7: Configure MongoDB

**Option 1: MongoDB Atlas (Recommended)**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free cluster (512MB)
3. Create database user
4. Get connection string
5. Update Ansible inventory with connection string
6. Re-run backend deployment:
   ```bash
   ansible-playbook playbooks/deploy-backend.yml
   ```

**Option 2: Self-hosted MongoDB**
```bash
# SSH to backend server
ssh -i ~/.ssh/usod-key ubuntu@<AWS_IP>

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt update
sudo apt install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod

# Update backend .env
nano /opt/usod/backend/.env
# Set: MONGODB_URI=mongodb://localhost:27017/usod

# Restart backend
pm2 restart usod-backend
```

---

### STEP 8: Post-Deployment Configuration

#### Update Frontend Environment
```bash
# SSH to frontend server
ssh -i ~/.ssh/usod-key ubuntu@<AWS_IP>

# Update .env.local
nano /opt/usod/frontend/.env.local
# Set: NEXT_PUBLIC_API_URL=http://<AWS_IP>:5000

# Rebuild and restart
cd /opt/usod/frontend
npm run build
pm2 restart usod-frontend
```

#### Configure CORS
```bash
# Update backend .env
ssh -i ~/.ssh/usod-key ubuntu@<AWS_IP>
nano /opt/usod/backend/.env
# Set: CORS_ORIGIN=http://<AWS_IP>:3000

pm2 restart usod-backend
```

---

## 🔒 Security Hardening

### 1. Restrict SSH Access

Update Terraform variables to limit SSH:
```hcl
# terraform.tfvars
allowed_ssh_cidr = ["<YOUR_IP>/32"]
```

Then reapply:
```bash
terraform apply
```

### 2. Enable Firewall

```bash
ansible all -m ufw -a "rule=allow port=22 proto=tcp" --become
ansible all -m ufw -a "state=enabled" --become
```

### 3. Set Strong Passwords

```bash
# Generate strong secrets
openssl rand -hex 32  # For JWT_SECRET
openssl rand -base64 32  # For SESSION_SECRET
```

### 4. Update SSL (Optional)

```bash
# Install certbot
ansible frontend -m apt -a "name=certbot state=present" --become
ansible frontend -m apt -a "name=python3-certbot-nginx state=present" --become

# Get certificate
ansible frontend -a "certbot --nginx -d yourdomain.com" --become
```

---

## 📊 Monitoring & Maintenance

### View Logs

```bash
# Backend logs
ansible backend -a "pm2 logs usod-backend --lines 50"

# AI service logs
ansible ai_service -a "journalctl -u usod-ai-service -n 50"

# Frontend logs
ansible frontend -a "pm2 logs usod-frontend --lines 50"

# Blockchain logs
ansible blockchain -a "docker logs peer0.usod.com --tail 50"
```

### Restart Services

```bash
# Restart backend
ansible backend -a "pm2 restart usod-backend" --become

# Restart AI service
ansible ai_service -a "systemctl restart usod-ai-service" --become

# Restart frontend
ansible frontend -a "pm2 restart usod-frontend" --become

# Restart blockchain
ansible blockchain -a "docker-compose -f /opt/usod/blockchain/network/docker-compose.yaml restart" --become
```

### Update Code

```bash
# Pull latest code
ansible all -m git -a "repo=https://github.com/your-org/usod-testing.git dest=/opt/usod version=main force=yes" --become-user ubuntu

# Restart services
ansible-playbook playbooks/deploy-backend.yml --tags restart
ansible-playbook playbooks/deploy-ai-service.yml --tags restart
ansible-playbook playbooks/deploy-frontend.yml --tags restart
```

---

## 💰 Cost Management

### Set Billing Alerts

**AWS:**
```bash
aws budgets create-budget \
  --account-id $(aws sts get-caller-identity --query Account --output text) \
  --budget file://budget.json
```

**GCP:**
```bash
gcloud billing budgets create \
  --billing-account=BILLING_ACCOUNT_ID \
  --display-name="USOD Budget" \
  --budget-amount=50USD
```

**Azure:**
```bash
az consumption budget create \
  --subscription-id SUBSCRIPTION_ID \
  --budget-name "USOD Budget" \
  --amount 50
```

### Monitor Usage

```bash
# AWS
aws ce get-cost-and-usage \
  --time-period Start=2025-10-01,End=2025-10-31 \
  --granularity MONTHLY \
  --metrics BlendedCost

# GCP
gcloud billing accounts list

# Azure
az consumption usage list
```

---

## 🧹 Cleanup (Destroy Infrastructure)

**⚠️ WARNING:** This will delete all resources and data!

```bash
# Destroy Azure
cd cloud/terraform/azure
terraform destroy

# Destroy GCP
cd ../gcp
terraform destroy

# Destroy AWS
cd ../aws
terraform destroy
```

---

## 🆘 Troubleshooting

### Issue: Terraform "Provider not found"
```bash
terraform init -upgrade
```

### Issue: Ansible "Host unreachable"
```bash
# Check SSH manually
ssh -i ~/.ssh/usod-key ubuntu@<IP>

# Check security groups allow SSH
# AWS: Check Security Group rules
# GCP: Check Firewall rules
# Azure: Check Network Security Group
```

### Issue: Service not starting
```bash
# Check logs
ansible <host> -a "journalctl -xe"
ansible <host> -a "pm2 logs --lines 100"

# Check service status
ansible <host> -a "systemctl status <service>"
ansible <host> -a "pm2 status"
```

### Issue: Out of memory
```bash
# Check memory usage
ansible all -a "free -m"

# Consider upgrading instance types:
# - AWS: t2.micro → t2.small
# - GCP: e2-micro → e2-small
# - Azure: B1s → B1ms
```

---

## ✅ Deployment Checklist

### Pre-Deployment
- [ ] All tools installed (Terraform, Ansible, Cloud CLIs)
- [ ] SSH keys generated
- [ ] Cloud accounts created and configured
- [ ] Repository forked/cloned to GitHub

### Terraform Deployment
- [ ] AWS infrastructure deployed
- [ ] GCP infrastructure deployed
- [ ] Azure infrastructure deployed
- [ ] All Terraform outputs saved

### Ansible Configuration
- [ ] Inventory updated with IPs
- [ ] MongoDB URI configured
- [ ] JWT secret set
- [ ] Webhook URLs updated
- [ ] SSH connectivity tested

### Application Deployment
- [ ] Backend deployed and running
- [ ] AI service deployed and running
- [ ] Frontend deployed and running
- [ ] Blockchain network running

### Testing
- [ ] Backend API accessible
- [ ] AI service responding
- [ ] Frontend loading
- [ ] Blockchain containers running
- [ ] All services connected

### Post-Deployment
- [ ] Security hardened (SSH, firewall)
- [ ] Billing alerts configured
- [ ] Monitoring set up
- [ ] Documentation complete

---

## 📞 Support Resources

- **Terraform:** https://www.terraform.io/docs
- **Ansible:** https://docs.ansible.com/
- **AWS:** https://docs.aws.amazon.com/
- **GCP:** https://cloud.google.com/docs
- **Azure:** https://docs.microsoft.com/azure/

---

**Last Updated:** October 22, 2025  
**Status:** Production Ready  
**Estimated Deployment Time:** 2-3 hours

