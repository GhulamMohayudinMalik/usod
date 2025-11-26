# 🚀 Backend Deployment Checklist

## Before Deployment

### 1. Environment Configuration
- [ ] Copy `.env.production.example` to `.env.production`
- [ ] Generate secure `JWT_SECRET` (64+ characters)
- [ ] Generate secure `INGEST_API_KEY` (32+ characters)
- [ ] Set production `MONGODB_URI` (MongoDB Atlas or AWS DocumentDB)
- [ ] Set production `FRONTEND_URL` (must use HTTPS)
- [ ] Configure `ALLOWED_ORIGINS` if using multiple domains
- [ ] Run `npm run validate:env` to check configuration

### 2. Database Setup
- [ ] Create production MongoDB database (Atlas/DocumentDB)
- [ ] Configure database authentication
- [ ] Set up database backups
- [ ] Whitelist application IP addresses
- [ ] Test database connection from deployment environment

### 3. Security
- [ ] Change all default secrets and API keys
- [ ] Enable HTTPS/TLS for all endpoints
- [ ] Review CORS configuration
- [ ] Set up AWS WAF (optional but recommended)
- [ ] Configure security groups/firewall rules
- [ ] Enable rate limiting (via AWS API Gateway or application-level)

### 4. Code Preparation
- [ ] Update `package.json` version
- [ ] Remove development dependencies from production build
- [ ] Test Docker build locally: `npm run docker:build`
- [ ] Test Docker container locally: `npm run docker:run`
- [ ] Verify health check endpoint: `curl http://localhost:5000/api/health`

## Deployment Steps

### AWS Elastic Beanstalk
- [ ] Install EB CLI: `pip install awsebcli`
- [ ] Initialize: `eb init -p docker usod-backend`
- [ ] Create environment: `eb create usod-production`
- [ ] Set environment variables: `eb setenv` (see README.deployment.md)
- [ ] Deploy: `eb deploy`
- [ ] Test health: `curl https://your-eb-url.com/api/health`

### AWS ECS/Fargate
- [ ] Create ECR repository
- [ ] Build and push Docker image to ECR
- [ ] Create ECS task definition with environment variables
- [ ] Create ECS service with load balancer
- [ ] Configure health check on ALB to `/api/health`
- [ ] Verify deployment in AWS Console

### AWS EC2 (Manual)
- [ ] Launch EC2 instance (t3.small or larger recommended)
- [ ] Install Docker and Docker Compose
- [ ] Clone repository
- [ ] Create `.env` file with production values
- [ ] Run: `docker-compose up -d`
- [ ] Configure reverse proxy (nginx) with SSL
- [ ] Set up auto-restart on reboot

## Post-Deployment Verification

### 1. Health Checks
- [ ] Verify `/api/health` returns 200 OK
- [ ] Check MongoDB connection status in health response
- [ ] Verify memory usage is normal

### 2. API Endpoints
- [ ] Test authentication: POST `/api/auth/login`
- [ ] Test data endpoints: GET `/api/data/dashboard-stats`
- [ ] Test CORS from frontend domain
- [ ] Verify API documentation: GET `/api/docs`

### 3. Functionality
- [ ] Login with test user account
- [ ] Create and retrieve security events
- [ ] Test real-time SSE streaming: `/api/stream/events`
- [ ] Verify backup functionality works
- [ ] Test network monitoring endpoints

### 4. Performance
- [ ] Check response times (<200ms for most endpoints)
- [ ] Monitor memory usage (should be stable)
- [ ] Test under load (optional: use Apache Bench or k6)
- [ ] Verify database query performance

### 5. Monitoring Setup
- [ ] Configure CloudWatch logs (if using AWS)
- [ ] Set up error alerting
- [ ] Configure uptime monitoring
- [ ] Set up database monitoring
- [ ] Create CloudWatch dashboard

## Post-Deployment Tasks

### Immediate
- [ ] Document production URLs and credentials (securely!)
- [ ] Share health check URL with team
- [ ] Update frontend environment to point to production API
- [ ] Test end-to-end flow with frontend

### Within 24 Hours
- [ ] Monitor error logs for any issues
- [ ] Check database for proper data flow
- [ ] Verify backup system is running
- [ ] Test disaster recovery procedure

### Within 1 Week
- [ ] Set up automated backups schedule
- [ ] Configure auto-scaling (if using ECS/Fargate)
- [ ] Review and optimize database indexes
- [ ] Implement log rotation
- [ ] Set up cost monitoring alerts

## Rollback Plan

If deployment fails:
1. **Elastic Beanstalk:** `eb abort` or rollback in console
2. **ECS:** Update service to previous task definition
3. **Docker Compose:** `docker-compose down && git checkout previous-tag && docker-compose up -d`
4. Restore database from backup if needed
5. Update frontend to point back to old backend

## Troubleshooting

### Container won't start
- Check logs: `docker-compose logs backend`
- Verify environment variables are set
- Check MongoDB connection string
- Ensure port 5000 is not already in use

### Health check failing
- Verify MongoDB is accessible
- Check security group rules
- Ensure container has network access
- Review application logs for errors

### High memory usage
- Check for memory leaks in logs
- Review active connections count
- Restart container: `docker-compose restart backend`
- Consider increasing instance size

### CORS errors
- Verify `FRONTEND_URL` is set correctly
- Check `ALLOWED_ORIGINS` includes all needed domains
- Ensure frontend is using HTTPS in production
- Review browser console for specific CORS error

## Maintenance

### Regular Tasks
- **Daily:** Monitor error logs and health status
- **Weekly:** Review performance metrics and costs
- **Monthly:** Update dependencies, test backups, security audit
- **Quarterly:** Capacity planning, architecture review

### Updates
- Test updates in staging environment first
- Use blue-green deployment for zero-downtime updates
- Always have rollback plan ready
- Monitor closely after updates

## Support Contacts

- AWS Support: [Your AWS Support Plan]
- MongoDB Atlas Support: https://support.mongodb.com
- Team Lead: [Contact Info]
- On-Call: [Contact Info]

---

**Last Updated:** [DATE]
**Deployed Version:** [VERSION]
**Deployment Date:** [DATE]
