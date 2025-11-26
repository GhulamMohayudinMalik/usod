# Backend Deployment Guide

## 📋 Prerequisites

- Node.js 20+ (for local development)
- Docker & Docker Compose (for containerized deployment)
- MongoDB Atlas account or AWS DocumentDB (for production database)
- AWS Account with appropriate permissions

## 🚀 Quick Start

### Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your local settings
   ```

3. **Start the server:**
   ```bash
   npm run dev
   ```

### Docker Development

1. **Build and start services:**
   ```bash
   docker-compose up --build
   ```

2. **Stop services:**
   ```bash
   docker-compose down
   ```

## ☁️ AWS Deployment Options

### Option 1: AWS Elastic Beanstalk (Recommended for Quick Deploy)

1. **Install EB CLI:**
   ```bash
   pip install awsebcli
   ```

2. **Initialize Elastic Beanstalk:**
   ```bash
   eb init -p docker usod-backend --region us-east-1
   ```

3. **Create environment:**
   ```bash
   eb create usod-production
   ```

4. **Set environment variables:**
   ```bash
   eb setenv NODE_ENV=production \
     MONGODB_URI="your-mongodb-uri" \
     JWT_SECRET="your-jwt-secret" \
     INGEST_API_KEY="your-api-key" \
     FRONTEND_URL="https://your-frontend-url.com"
   ```

5. **Deploy:**
   ```bash
   eb deploy
   ```

### Option 2: AWS ECS with Fargate

1. **Build and push Docker image to ECR:**
   ```bash
   # Create ECR repository
   aws ecr create-repository --repository-name usod-backend
   
   # Login to ECR
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com
   
   # Build and tag image
   docker build -t usod-backend .
   docker tag usod-backend:latest YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/usod-backend:latest
   
   # Push to ECR
   docker push YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/usod-backend:latest
   ```

2. **Create ECS Task Definition** with environment variables
3. **Create ECS Service** with Application Load Balancer
4. **Configure health checks** to use `/api/health`

### Option 3: AWS EC2 with Docker

1. **Launch EC2 instance** (Amazon Linux 2 or Ubuntu)
2. **Install Docker:**
   ```bash
   sudo yum update -y
   sudo yum install docker -y
   sudo service docker start
   ```

3. **Clone repository and deploy:**
   ```bash
   git clone your-repo-url
   cd backend
   docker-compose up -d
   ```

## 🔐 Environment Variables Setup

### Production Environment Variables

Create these in AWS Parameter Store or Secrets Manager:

```bash
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/usod
JWT_SECRET=<generate-strong-random-64-char-string>
INGEST_API_KEY=<generate-strong-random-32-char-string>
FRONTEND_URL=https://your-frontend-domain.com
ALLOWED_ORIGINS=https://app.yourdomain.com,https://admin.yourdomain.com
PORT=5000
```

### Generate Secure Secrets

```bash
# For JWT_SECRET (64 characters)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# For INGEST_API_KEY (32 characters)
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

## 🗄️ Database Setup

### Option 1: MongoDB Atlas (Recommended)

1. Create cluster at https://cloud.mongodb.com
2. Get connection string
3. Update `MONGODB_URI` in environment variables

### Option 2: AWS DocumentDB

1. Create DocumentDB cluster in AWS Console
2. Configure VPC security groups
3. Get connection string
4. Update `MONGODB_URI` with DocumentDB endpoint

## 🏥 Health Checks

- **JSON endpoint:** `GET /api/health` (for load balancers)
- **HTML endpoint:** `GET /health` (for humans)

Configure AWS Load Balancer health checks:
- **Path:** `/api/health`
- **Port:** 5000
- **Protocol:** HTTP
- **Healthy threshold:** 2
- **Unhealthy threshold:** 3
- **Timeout:** 5 seconds
- **Interval:** 30 seconds

## 📊 Monitoring & Logging

### CloudWatch Integration

For production logging, consider adding:
- Winston logger with CloudWatch transport
- AWS X-Ray for tracing
- CloudWatch metrics for custom metrics

## 🔄 CI/CD Pipeline (GitHub Actions Example)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to AWS

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v1
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      
      - name: Deploy to Elastic Beanstalk
        run: |
          eb deploy usod-production
```

## 🛡️ Security Checklist

- [ ] Change default JWT_SECRET and INGEST_API_KEY
- [ ] Use HTTPS in production
- [ ] Configure proper CORS origins
- [ ] Set up AWS WAF for DDoS protection
- [ ] Enable VPC security groups
- [ ] Use AWS Secrets Manager for sensitive data
- [ ] Enable MongoDB authentication
- [ ] Set up regular backups
- [ ] Configure rate limiting (consider AWS API Gateway)

## 📝 Post-Deployment

1. **Verify health check:**
   ```bash
   curl https://your-backend-url.com/api/health
   ```

2. **Test API endpoints:**
   ```bash
   curl https://your-backend-url.com/api/docs
   ```

3. **Monitor logs:**
   ```bash
   # For Elastic Beanstalk
   eb logs
   
   # For ECS
   aws logs tail /ecs/usod-backend --follow
   ```

## 🔧 Troubleshooting

### Common Issues

1. **Connection timeout:** Check security groups and VPC configuration
2. **Database connection failed:** Verify MongoDB URI and network access
3. **CORS errors:** Update ALLOWED_ORIGINS environment variable
4. **Memory issues:** Increase container/instance size

### Logs

- Docker: `docker-compose logs -f backend`
- AWS EB: `eb logs`
- AWS ECS: CloudWatch Logs

## 📚 Additional Resources

- [AWS Elastic Beanstalk Documentation](https://docs.aws.amazon.com/elasticbeanstalk/)
- [AWS ECS Documentation](https://docs.aws.amazon.com/ecs/)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
