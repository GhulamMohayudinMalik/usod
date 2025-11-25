# USOD Platform - Oracle Cloud Infrastructure (OCI) Deployment

Complete guide for deploying USOD services on Oracle Cloud Infrastructure using the **Always Free tier**.

---

## 🌟 Why Oracle Cloud?

### Always Free Tier Benefits

Oracle Cloud offers the **most generous always-free tier** among major cloud providers:

**✅ NEVER EXPIRES** (Unlike AWS 12-month free tier)  
**✅ NO CREDIT CARD REQUIRED** for Always Free resources  
**✅ POWERFUL RESOURCES** - Up to 4 ARM CPUs + 24GB RAM  
**✅ GENEROUS STORAGE** - 200GB boot + 100GB block volumes  
**✅ HIGH BANDWIDTH** - 10TB/month outbound data transfer  

### Comparison with Other Clouds

| Feature | Oracle Cloud | AWS | GCP | Azure |
|---------|-------------|-----|-----|-------|
| **Expiration** | Never | 12 months | 12 months | 12 months |
| **Compute** | 2x1GB OR 4 ARM OCPUs + 24GB RAM | 1x1GB (750h/mo) | 1x0.6GB | Pay only |
| **Storage** | 200GB boot + 100GB block + 20GB object | 30GB | 30GB | Limited |
| **Network** | 10TB/mo | 1GB/mo | 1GB/mo | 15GB/mo |
| **Credit Card** | Not required | Required | Required | Required |

---

## 📋 Always Free Resources

### Compute
- **Option 1:** 2x VM.Standard.E2.1.Micro
  - 1 OCPU (AMD processor)
  - 1GB RAM each
  - Good for: Backend, Frontend
  
- **Option 2:** VM.Standard.A1.Flex (ARM-based)
  - Up to 4 OCPUs
  - Up to 24GB RAM
  - Distributed across instances
  - Good for: Blockchain, AI Service (can run all services!)

### Storage
- **Boot Volumes:** 200GB total
- **Block Volumes:** 2x 50GB (100GB total)
- **Object Storage:** 20GB
- **Archive Storage:** 10GB

### Network
- **Bandwidth:** 10TB/month outbound
- **Load Balancer:** 1x (10Mbps)
- **VCN:** Unlimited
- **Public IPs:** 2x IPv4

### Database (Bonus)
- **Autonomous Database:** 2x 20GB (1 OCPU each)
- Perfect for MongoDB alternative!

---

## 🚀 Quick Start

### Step 1: Create OCI Account

```bash
# Go to: https://www.oracle.com/cloud/free/
# Click "Start for free"
# Fill in details (NO credit card required for Always Free)
# Verify email
# Login to console: https://cloud.oracle.com/
```

### Step 2: Generate API Key

```bash
# In OCI Console:
# 1. Click your profile icon (top right)
# 2. Click "User Settings"
# 3. Under "Resources" → Click "API Keys"
# 4. Click "Add API Key"
# 5. Select "Generate API Key Pair"
# 6. Download Private Key (save as ~/.oci/oci_api_key.pem)
# 7. Download Public Key (optional)
# 8. Click "Add" and copy the configuration file preview

# Set proper permissions
mkdir -p ~/.oci
chmod 600 ~/.oci/oci_api_key.pem
```

### Step 3: Get Required OCIDs

**Tenancy OCID:**
```bash
# Click profile icon → Tenancy: <name>
# Copy the OCID (starts with ocid1.tenancy.oc1..)
```

**User OCID:**
```bash
# Click profile icon → User Settings
# Copy the OCID (starts with ocid1.user.oc1..)
```

**Compartment OCID:**
```bash
# Navigation Menu → Identity & Security → Compartments
# Use tenancy OCID for root compartment
# Or create new compartment and copy its OCID
```

**Fingerprint:**
```bash
# Already displayed when you added the API key
# Format: aa:bb:cc:dd:ee:ff:...
```

### Step 4: Configure Terraform

```bash
cd cloud/terraform/oracle

# Copy example configuration
cp terraform.tfvars.example terraform.tfvars

# Edit with your values
nano terraform.tfvars

# Required fields:
# - tenancy_ocid
# - user_ocid
# - fingerprint
# - compartment_ocid
# - region

# Optional:
# - service_name (backend, ai-service, blockchain, frontend)
# - instance_shape (E2.1.Micro for AMD, A1.Flex for ARM)
```

### Step 5: Deploy

```bash
# Initialize Terraform
terraform init

# Preview what will be created
terraform plan

# Deploy infrastructure
terraform apply
# Type 'yes' when prompted

# View outputs
terraform output

# Get SSH command
terraform output ssh_command
```

---

## 💡 Deployment Strategies

### Strategy 1: Single Powerful Instance (Recommended)

Use **1x VM.Standard.A1.Flex** with 4 OCPUs + 24GB RAM to run ALL services:

```hcl
# terraform.tfvars
instance_shape     = "VM.Standard.A1.Flex"
instance_ocpus     = 4
instance_memory_gb = 24
service_name       = "all-in-one"
boot_volume_size   = 100
```

**Advantages:**
- Simple management
- Lower latency (services on same machine)
- Use all free resources
- Perfect for demo/development

**Services Distribution:**
- Backend: Port 5000
- AI Service: Port 8000
- Frontend: Port 3000
- Blockchain: Ports 7050, 7051, 7054

---

### Strategy 2: Separate Instances

Use **2x VM.Standard.E2.1.Micro** for different services:

**Instance 1: Backend + Frontend**
```hcl
instance_shape     = "VM.Standard.E2.1.Micro"
service_name       = "backend"
```

**Instance 2: AI Service + Blockchain**
```hcl
instance_shape     = "VM.Standard.E2.1.Micro"
service_name       = "blockchain"
```

**Advantages:**
- Service isolation
- Can use both Always Free instances
- Better for production

---

### Strategy 3: Hybrid (OCI + Other Clouds)

Use OCI for blockchain (Always Free ARM instance):

- **AWS:** Backend (Free tier - 12 months)
- **GCP:** AI Service ($300 credits)
- **OCI:** Blockchain (Always Free - Forever!)

**Why this works:**
- Blockchain needs resources and persistence
- OCI Always Free never expires
- Other services can use temporary free tiers

---

## 🔧 Configuration Examples

### Example 1: Blockchain on ARM

```hcl
# terraform.tfvars
tenancy_ocid     = "ocid1.tenancy.oc1..aaaaa..."
user_ocid        = "ocid1.user.oc1..aaaaa..."
fingerprint      = "aa:bb:cc:dd:ee..."
private_key_path = "~/.oci/oci_api_key.pem"
compartment_ocid = "ocid1.compartment.oc1..aaaaa..."

region = "us-ashburn-1"

project_name = "usod"
environment  = "production"
service_name = "blockchain"

# ARM instance - powerful and free!
instance_shape     = "VM.Standard.A1.Flex"
instance_ocpus     = 2
instance_memory_gb = 12

boot_volume_size = 100

# Add data volume for blockchain storage
create_data_volume = true
data_volume_size   = 50

ssh_public_key_path = "~/.ssh/usod-key.pub"
```

### Example 2: All Services on One Instance

```hcl
tenancy_ocid     = "ocid1.tenancy.oc1..aaaaa..."
user_ocid        = "ocid1.user.oc1..aaaaa..."
fingerprint      = "aa:bb:cc:dd:ee..."
private_key_path = "~/.oci/oci_api_key.pem"
compartment_ocid = "ocid1.compartment.oc1..aaaaa..."

region = "us-phoenix-1"  # Different region

project_name = "usod"
environment  = "staging"
service_name = "all-services"

# Use all available ARM resources
instance_shape     = "VM.Standard.A1.Flex"
instance_ocpus     = 4
instance_memory_gb = 24

boot_volume_size   = 200  # Maximum
create_data_volume = false  # Not needed, boot volume is large

bucket_access_type = "ObjectRead"  # Public read for assets
```

---

## 📊 Resource Allocation Guide

### For 4 OCPU + 24GB ARM Instance

**Recommended allocation:**

```yaml
Backend (Node.js):
  - Memory: 2GB
  - CPU: 0.5 OCPU

AI Service (Python):
  - Memory: 8GB (for ML models)
  - CPU: 1.5 OCPU

Frontend (Next.js):
  - Memory: 2GB
  - CPU: 0.5 OCPU

Blockchain (Docker):
  - Memory: 10GB
  - CPU: 1.5 OCPU

System:
  - Memory: 2GB
  - CPU: Reserved

Total: 24GB RAM, 4 OCPU
```

### For 2x 1GB AMD Instances

**Instance 1:**
- Backend + Frontend
- Memory: 1GB shared
- Lightweight MongoDB or MongoDB Atlas

**Instance 2:**
- Blockchain only
- Memory: 1GB
- Minimal chaincode deployment

---

## 🔐 Post-Deployment Steps

### 1. SSH to Instance

```bash
# Get SSH command from Terraform
terraform output ssh_command

# SSH (default user is 'opc' for Oracle Linux)
ssh -i ~/.ssh/usod-key opc@<PUBLIC_IP>
```

### 2. Update System

```bash
sudo yum update -y
sudo yum install -y git curl wget htop
```

### 3. Deploy with Ansible

Update `cloud/ansible/inventory/production.yml`:

```yaml
oracle:
  hosts:
    oci-blockchain:
      ansible_host: <PUBLIC_IP>
      ansible_user: opc  # Note: 'opc' not 'ubuntu'
      ansible_ssh_private_key_file: ~/.ssh/usod-key
      ansible_python_interpreter: /usr/bin/python3
  vars:
    env: production
    service_name: blockchain
```

Run deployment:
```bash
cd cloud/ansible
ansible-playbook playbooks/deploy-blockchain.yml -l oracle
```

---

## 💰 Cost Optimization

### Maximizing Always Free

1. **Use ARM instances** - More powerful than AMD (4 OCPU vs 2x 1 OCPU)
2. **Use all 200GB boot volume** - Avoid separate block volumes
3. **Use object storage** for static assets (20GB free)
4. **Use Autonomous Database** instead of MongoDB (20GB free)

### Monitoring Usage

```bash
# Check if instance is Always Free eligible
oci compute instance get --instance-id <INSTANCE_ID> | grep "is-always-free"

# List all Always Free resources
oci limits resource-availability get \
  --compartment-id <COMPARTMENT_ID> \
  --service-name compute
```

### Billing Alerts

```bash
# Set up budget (optional, for paid resources)
oci budgets budget create \
  --compartment-id <COMPARTMENT_ID> \
  --amount 10 \
  --reset-period MONTHLY \
  --target-type COMPARTMENT \
  --display-name "USOD Budget"
```

---

## 🆘 Troubleshooting

### Issue: "Out of host capacity"

**Cause:** Always Free ARM instances are in high demand  
**Solution:**
1. Try different region (us-phoenix-1, eu-frankfurt-1)
2. Try different availability domain
3. Try at different time (early morning UTC)
4. Use AMD E2.1.Micro instead (less demand)

### Issue: "API key authentication failed"

**Cause:** Incorrect OCID or fingerprint  
**Solution:**
```bash
# Verify API key configuration
oci setup repair-file-permissions --file ~/.oci/config
oci iam region list  # Test connection
```

### Issue: "Service limit exceeded"

**Cause:** Trying to create more than Always Free limits  
**Solution:**
```bash
# Check current usage
oci limits resource-availability get \
  --compartment-id <COMPARTMENT_ID> \
  --service-name compute

# Delete unused resources
terraform destroy
```

---

## 📚 Useful Commands

### OCI CLI

```bash
# List instances
oci compute instance list --compartment-id <COMPARTMENT_ID>

# Get instance details
oci compute instance get --instance-id <INSTANCE_ID>

# Stop instance
oci compute instance action --instance-id <INSTANCE_ID> --action STOP

# Start instance
oci compute instance action --instance-id <INSTANCE_ID> --action START

# List buckets
oci os bucket list --compartment-id <COMPARTMENT_ID>
```

### Terraform

```bash
# Show current state
terraform show

# List resources
terraform state list

# Get specific output
terraform output instance_public_ip

# Refresh state
terraform refresh

# Destroy everything
terraform destroy
```

---

## 🌐 Regions

**Always Free available in all regions:**

- **Americas:** us-ashburn-1, us-phoenix-1, ca-toronto-1, sa-saopaulo-1
- **Europe:** eu-frankfurt-1, eu-amsterdam-1, uk-london-1
- **Asia Pacific:** ap-tokyo-1, ap-seoul-1, ap-mumbai-1, ap-sydney-1

**Recommendation:** Choose closest region for lowest latency

---

## 🔗 Useful Links

- **OCI Free Tier:** https://www.oracle.com/cloud/free/
- **OCI Documentation:** https://docs.oracle.com/en-us/iaas/
- **Terraform OCI Provider:** https://registry.terraform.io/providers/oracle/oci/
- **OCI CLI:** https://docs.oracle.com/en-us/iaas/tools/oci-cli/
- **Always Free Resources:** https://docs.oracle.com/en-us/iaas/Content/FreeTier/freetier_topic-Always_Free_Resources.htm

---

**Created:** October 22, 2025  
**Status:** Production Ready  
**Always Free:** Yes, Forever! 🎉

