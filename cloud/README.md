# USOD Cloud Infrastructure

Terraform configuration for deploying the USOD backend to AWS.

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    Vercel       │     │     AWS EC2     │     │  MongoDB Atlas  │
│   (Frontend)    │ ──▶ │   (Backend)     │ ──▶ │   (Database)    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## Prerequisites

1. AWS CLI configured with credentials
2. Terraform >= 1.0.0 installed
3. SSH key pair created in AWS
4. MongoDB Atlas cluster ready

## Quick Start

```bash
# 1. Navigate to terraform directory
cd cloud/terraform

# 2. Copy and edit the variables file
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your values

# 3. Initialize Terraform
terraform init

# 4. Preview changes
terraform plan

# 5. Apply infrastructure
terraform apply

# 6. Note the outputs (IP, SSH command, etc.)
```

## Deploy Application

After infrastructure is created:

```bash
# SSH into the server
ssh -i ~/.ssh/your-key.pem ubuntu@<BACKEND_IP>

# Clone your repo
cd /opt/usod/backend
sudo -u usod git clone https://github.com/your-repo.git .

# Or copy files
scp -r -i ~/.ssh/your-key.pem ./app/backend/* ubuntu@<IP>:/opt/usod/backend/

# Install dependencies
sudo -u usod npm install

# Start the service
sudo systemctl start usod-backend
sudo systemctl status usod-backend
```

## Outputs

After `terraform apply`, you'll get:
- `backend_public_ip` - Server IP address
- `backend_api_url` - Full API URL
- `ssh_command` - Ready-to-use SSH command

## SSL Certificate (Optional)

To add HTTPS with Let's Encrypt:

```bash
ssh -i ~/.ssh/your-key.pem ubuntu@<IP>

# Add your domain to Nginx config first, then:
sudo certbot --nginx -d api.yourdomain.com
```

## Destroy Infrastructure

```bash
terraform destroy
```

## Files

| File | Description |
|------|-------------|
| `main.tf` | Main infrastructure configuration |
| `user-data.sh` | EC2 bootstrap script |
| `terraform.tfvars.example` | Example variables |

## Cost Estimate

- t3.small: ~$15/month
- Elastic IP: Free (when attached)
- Data transfer: Variable

Total: ~$15-25/month
