# USOD Platform - Ansible Configuration Management

This directory contains Ansible playbooks and roles for deploying and configuring the USOD platform across multiple cloud providers.

---

## Overview

**Ansible automates:**
- Server provisioning and configuration
- Application deployment
- Dependency installation
- Service management
- Configuration file generation

---

## Prerequisites

### 1. Install Ansible

**Windows (WSL or Git Bash):**
```bash
# Using pip
pip install ansible

# Or via WSL (Ubuntu)
sudo apt update
sudo apt install ansible
```

**Verify Installation:**
```bash
ansible --version
```

### 2. SSH Access

Ensure you have:
- SSH private key (`~/.ssh/usod-key`)
- Access to all servers (AWS, GCP, Azure)
- SSH key added to servers (Terraform should have done this)

**Test SSH Access:**
```bash
# Test AWS
ssh -i ~/.ssh/usod-key ubuntu@<AWS_IP>

# Test GCP
ssh -i ~/.ssh/usod-key ubuntu@<GCP_IP>

# Test Azure
ssh -i ~/.ssh/usod-key azureuser@<AZURE_IP>
```

---

## Quick Start

### 1. Update Inventory

After deploying infrastructure with Terraform, update the inventory file:

```bash
cd cloud/ansible
nano inventory/production.yml
```

**Update IP addresses:**
```yaml
# Get IPs from Terraform outputs:
# cd cloud/terraform/aws && terraform output backend_public_ip
# cd cloud/terraform/gcp && terraform output ai_service_public_ip
# cd cloud/terraform/azure && terraform output blockchain_public_ip
```

### 2. Test Connectivity

```bash
# Ping all hosts
ansible all -m ping

# Check if hosts are reachable
ansible all -m command -a "whoami"
```

### 3. Deploy Services

**Deploy Backend (AWS):**
```bash
ansible-playbook playbooks/deploy-backend.yml
```

**Deploy AI Service (GCP):**
```bash
ansible-playbook playbooks/deploy-ai-service.yml
```

**Deploy Frontend:**
```bash
ansible-playbook playbooks/deploy-frontend.yml
```

**Deploy Blockchain (Azure):**
```bash
ansible-playbook playbooks/deploy-blockchain.yml
```

**Deploy All Services:**
```bash
# Deploy in order
ansible-playbook playbooks/deploy-backend.yml
ansible-playbook playbooks/deploy-ai-service.yml
ansible-playbook playbooks/deploy-frontend.yml
ansible-playbook playbooks/deploy-blockchain.yml
```

---

## Playbooks

### deploy-backend.yml

**Purpose:** Deploy Node.js backend to AWS

**What it does:**
- Installs Node.js 18
- Clones repository
- Installs dependencies
- Creates .env file
- Starts backend with PM2
- Configures firewall

**Usage:**
```bash
ansible-playbook playbooks/deploy-backend.yml
```

**Variables:**
- `mongodb_uri` - MongoDB connection string
- `jwt_secret` - JWT secret key
- `service_port` - Backend port (default: 5000)

---

### deploy-ai-service.yml

**Purpose:** Deploy Python AI service to GCP

**What it does:**
- Installs Python 3.10
- Creates virtual environment
- Installs dependencies
- Creates systemd service
- Starts AI service
- Configures firewall

**Usage:**
```bash
ansible-playbook playbooks/deploy-ai-service.yml
```

**Variables:**
- `backend_webhook_url` - Backend webhook URL
- `service_port` - AI service port (default: 8000)

---

### deploy-frontend.yml

**Purpose:** Deploy Next.js frontend

**What it does:**
- Installs Node.js 18
- Clones repository
- Builds Next.js app
- Configures Nginx reverse proxy
- Starts frontend with PM2
- Configures firewall

**Usage:**
```bash
ansible-playbook playbooks/deploy-frontend.yml
```

**Variables:**
- `api_url` - Backend API URL
- `service_port` - Frontend port (default: 3000)

---

### deploy-blockchain.yml

**Purpose:** Deploy Hyperledger Fabric to Azure

**What it does:**
- Installs Docker & Docker Compose
- Downloads Fabric binaries
- Starts blockchain network
- Deploys chaincode
- Configures firewall

**Usage:**
```bash
ansible-playbook playbooks/deploy-blockchain.yml
```

**Variables:**
- `orderer_port` - Orderer port (default: 7050)
- `peer_port` - Peer port (default: 7051)
- `ca_port` - CA port (default: 7054)

---

## Inventory Structure

```yaml
all:
  children:
    backend:
      hosts:
        aws-backend:
          ansible_host: <AWS_IP>
          ansible_user: ubuntu
          
    ai_service:
      hosts:
        gcp-ai:
          ansible_host: <GCP_IP>
          ansible_user: ubuntu
          
    blockchain:
      hosts:
        azure-blockchain:
          ansible_host: <AZURE_IP>
          ansible_user: azureuser
```

---

## Common Commands

### Ping All Hosts
```bash
ansible all -m ping
```

### Run Command on All Hosts
```bash
ansible all -a "uptime"
ansible all -a "df -h"
ansible all -a "free -m"
```

### Check Service Status
```bash
# Backend
ansible backend -a "pm2 status"

# AI Service
ansible ai_service -a "systemctl status usod-ai-service"

# Blockchain
ansible blockchain -a "docker ps"
```

### Restart Services
```bash
# Backend
ansible backend -a "pm2 restart usod-backend" --become

# AI Service
ansible ai_service -a "systemctl restart usod-ai-service" --become

# Blockchain
ansible blockchain -a "docker-compose -f /opt/usod/blockchain/network/docker-compose.yaml restart" --become
```

### View Logs
```bash
# Backend
ansible backend -a "pm2 logs usod-backend --lines 50" --become

# AI Service
ansible ai_service -a "journalctl -u usod-ai-service -n 50" --become

# Blockchain
ansible blockchain -a "docker logs orderer.usod.com --tail 50" --become
```

### Update Code
```bash
# Pull latest code on all hosts
ansible all -a "git pull" -b --become-user ubuntu -C /opt/usod
```

---

## Configuration Files

### ansible.cfg

Main Ansible configuration:
- Inventory location
- SSH settings
- Logging
- Callbacks

### Templates

**backend.env.j2** - Backend environment variables
**ai-service.service.j2** - AI service systemd unit
**frontend.env.j2** - Frontend environment variables
**nginx-frontend.conf.j2** - Nginx configuration for frontend

---

## Troubleshooting

### Issue: "Host unreachable"
**Solution:**
```bash
# Check if server is running (in Terraform dir)
terraform output

# Test SSH manually
ssh -i ~/.ssh/usod-key ubuntu@<IP>

# Check firewall
ansible all -m command -a "sudo ufw status"
```

### Issue: "Permission denied (publickey)"
**Solution:**
```bash
# Check SSH key permissions
chmod 600 ~/.ssh/usod-key
chmod 644 ~/.ssh/usod-key.pub

# Verify key is added to server
ssh-copy-id -i ~/.ssh/usod-key.pub ubuntu@<IP>
```

### Issue: "Module not found"
**Solution:**
```bash
# Ensure Python is installed
ansible all -m raw -a "python3 --version"

# Install Python if missing
ansible all -m raw -a "sudo apt install -y python3" --become
```

### Issue: "Playbook failed"
**Solution:**
```bash
# Run with verbose output
ansible-playbook playbooks/deploy-backend.yml -vvv

# Check syntax
ansible-playbook playbooks/deploy-backend.yml --syntax-check

# Dry run
ansible-playbook playbooks/deploy-backend.yml --check
```

---

## Best Practices

### 1. Use Vault for Secrets
```bash
# Create encrypted file
ansible-vault create secrets.yml

# Edit encrypted file
ansible-vault edit secrets.yml

# Use in playbook
ansible-playbook playbooks/deploy-backend.yml --ask-vault-pass
```

### 2. Tag Your Tasks
```yaml
tasks:
  - name: Install packages
    apt:
      name: git
    tags: packages
```

```bash
# Run specific tags
ansible-playbook playbooks/deploy-backend.yml --tags packages
```

### 3. Use Check Mode
```bash
# Dry run to see what would change
ansible-playbook playbooks/deploy-backend.yml --check
```

### 4. Limit Hosts
```bash
# Run on specific host
ansible-playbook playbooks/deploy-backend.yml --limit aws-backend

# Run on specific group
ansible-playbook playbooks/deploy-backend.yml --limit backend
```

---

## Advanced Usage

### Deploy to Staging
```bash
# Use staging inventory
ansible-playbook -i inventory/staging.yml playbooks/deploy-backend.yml
```

### Parallel Execution
```bash
# Run on 5 hosts in parallel
ansible-playbook playbooks/deploy-backend.yml -f 5
```

### Custom Variables
```bash
# Override variables
ansible-playbook playbooks/deploy-backend.yml -e "service_port=5001"
```

---

## Maintenance Tasks

### Update System Packages
```bash
ansible all -m apt -a "update_cache=yes upgrade=dist" --become
```

### Restart All Services
```bash
ansible backend -a "pm2 restart all" --become
ansible ai_service -a "systemctl restart usod-ai-service" --become
ansible blockchain -a "docker-compose restart" --become
```

### Backup Configuration
```bash
# Backup environment files
ansible all -m fetch -a "src=/opt/usod/backend/.env dest=./backups/"
```

---

## Integration with Terraform

**Workflow:**
1. Deploy infrastructure with Terraform
2. Get IP addresses from Terraform outputs
3. Update Ansible inventory
4. Deploy applications with Ansible

**Example:**
```bash
# 1. Deploy infrastructure
cd cloud/terraform/aws
terraform apply
terraform output backend_public_ip

# 2. Update inventory
cd ../../ansible
nano inventory/production.yml
# Update ansible_host with Terraform output

# 3. Deploy application
ansible-playbook playbooks/deploy-backend.yml
```

---

## Useful Links

- [Ansible Documentation](https://docs.ansible.com/)
- [Ansible Best Practices](https://docs.ansible.com/ansible/latest/user_guide/playbooks_best_practices.html)
- [Ansible Vault](https://docs.ansible.com/ansible/latest/user_guide/vault.html)
- [Ansible Galaxy](https://galaxy.ansible.com/)

---

**Created:** October 22, 2025  
**Status:** Ready for Deployment  
**Ansible Version:** >= 2.9

