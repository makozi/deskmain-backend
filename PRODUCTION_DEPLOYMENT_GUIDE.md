# DeskMain - Production Deployment Guide

**Status**: Task 10 - Production Deployment  
**Date**: May 17, 2026

## Overview

This guide covers deploying the DeskMain application to production environments with high availability, security, and reliability.

## 1. Pre-Deployment Checklist

### Infrastructure Requirements
- [ ] Production PostgreSQL database cluster (High Availability)
- [ ] Redis cluster for caching and sessions
- [ ] Load balancer configured
- [ ] SSL/TLS certificates installed
- [ ] CDN configured for static assets
- [ ] Backup system operational
- [ ] Monitoring and alerting configured
- [ ] Logging infrastructure ready

### Application Requirements
- [ ] All tests passing (100% critical paths)
- [ ] Security audit completed and approved
- [ ] Performance benchmarks met
- [ ] Database migrations tested
- [ ] Environment variables validated
- [ ] Docker images built and scanned
- [ ] API documentation updated
- [ ] Deployment plan reviewed

### Team Requirements
- [ ] Deployment checklist reviewed by team
- [ ] Rollback plan documented
- [ ] On-call schedule established
- [ ] Communication plan ready
- [ ] Stakeholder approval obtained

## 2. Infrastructure Setup

### Database Setup - Production

```bash
# Create production PostgreSQL cluster
# Recommended: AWS RDS Multi-AZ or equivalent managed service

# High Availability Setup:
# - Primary node with synchronous replication
# - At least 2 standby replicas
# - Automated failover enabled
# - Point-in-time recovery enabled

# Create database and user
psql -h primary-rds.region.rds.amazonaws.com -U postgres
CREATE DATABASE deskmain;
CREATE USER deskmain_user WITH ENCRYPTED PASSWORD 'STRONG_PASSWORD_HERE';
GRANT ALL PRIVILEGES ON DATABASE deskmain TO deskmain_user;

# Run migrations
npm run migrate:run
npm run migrate:status
```

### Redis Setup - Production

```bash
# Create production Redis cluster
# Recommended: AWS ElastiCache or equivalent managed service

# Cluster configuration:
# - Node type: cache.r6g.xlarge or larger
# - Number of nodes: 3+ for high availability
# - Multi-AZ enabled
# - Automatic failover enabled
# - Encryption at rest enabled
# - Encryption in transit enabled

# Connection string format:
REDIS_URL=rediss://default:PASSWORD@cluster-endpoint:6379/0
```

### Load Balancer Setup

```bash
# AWS Application Load Balancer configuration

# Create target group
aws elbv2 create-target-group \
  --name deskmain-backend \
  --protocol HTTP \
  --port 5000 \
  --vpc-id vpc-xxxxx \
  --health-check-protocol HTTP \
  --health-check-path /health \
  --health-check-interval-seconds 30 \
  --health-check-timeout-seconds 5 \
  --healthy-threshold-count 2 \
  --unhealthy-threshold-count 3

# Create ALB
aws elbv2 create-load-balancer \
  --name deskmain-alb \
  --subnets subnet-xxxxx subnet-xxxxx \
  --security-groups sg-xxxxx

# Create listener (HTTPS)
aws elbv2 create-listener \
  --load-balancer-arn arn:aws:elasticloadbalancing:... \
  --protocol HTTPS \
  --port 443 \
  --certificates CertificateArn=arn:aws:acm:... \
  --default-actions Type=forward,TargetGroupArn=arn:aws:elasticloadbalancing:...
```

### SSL/TLS Certificate Setup

```bash
# Using AWS Certificate Manager (recommended)
aws acm request-certificate \
  --domain-name deskmain.com \
  --subject-alternative-names www.deskmain.com \
  --validation-method DNS

# Or using Let's Encrypt with Certbot
certbot certonly --dns-route53 \
  -d deskmain.com \
  -d www.deskmain.com \
  --agree-tos
```

## 3. Docker Deployment

### Build Production Image

```bash
# Build multi-stage production image
docker build -t deskmain-backend:latest \
  --build-arg NODE_ENV=production \
  -f Dockerfile .

# Tag with version
docker tag deskmain-backend:latest deskmain-backend:v1.0.0

# Push to container registry (AWS ECR)
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin 123456789.dkr.ecr.us-east-1.amazonaws.com

docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/deskmain-backend:latest
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/deskmain-backend:v1.0.0
```

### Deploy with Docker Swarm

```bash
# Initialize swarm mode
docker swarm init

# Create overlay network
docker network create --driver overlay deskmain-network

# Deploy service
docker service create \
  --name deskmain-api \
  --network deskmain-network \
  --publish 5000:5000 \
  --replicas 3 \
  --update-parallelism 1 \
  --update-delay 10s \
  --env-file config/production.env \
  --log-driver awslogs \
  --log-opt awslogs-group=/ecs/deskmain \
  --log-opt awslogs-region=us-east-1 \
  --log-opt awslogs-stream-prefix=ecs \
  123456789.dkr.ecr.us-east-1.amazonaws.com/deskmain-backend:latest
```

### Deploy with Kubernetes

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: deskmain

---
apiVersion: v1
kind: ConfigMap
metadata:
  name: deskmain-config
  namespace: deskmain
data:
  NODE_ENV: "production"
  API_PORT: "5000"
  LOG_LEVEL: "info"

---
apiVersion: v1
kind: Secret
metadata:
  name: deskmain-secrets
  namespace: deskmain
type: Opaque
stringData:
  DATABASE_URL: "postgres://..."
  REDIS_URL: "rediss://..."
  JWT_SECRET: "..."
  EMAIL_API_KEY: "..."

---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: deskmain-api
  namespace: deskmain
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: deskmain-api
  template:
    metadata:
      labels:
        app: deskmain-api
    spec:
      containers:
      - name: api
        image: 123456789.dkr.ecr.us-east-1.amazonaws.com/deskmain-backend:latest
        ports:
        - containerPort: 5000
        envFrom:
        - configMapRef:
            name: deskmain-config
        - secretRef:
            name: deskmain-secrets
        livenessProbe:
          httpGet:
            path: /health
            port: 5000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 5000
          initialDelaySeconds: 20
          periodSeconds: 5
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"

---
apiVersion: v1
kind: Service
metadata:
  name: deskmain-api-service
  namespace: deskmain
spec:
  type: LoadBalancer
  ports:
  - port: 80
    targetPort: 5000
    protocol: TCP
  selector:
    app: deskmain-api
```

## 4. Deployment Procedure

### Step 1: Pre-Deployment Verification

```bash
# Verify all tests pass
npm run test:ci

# Verify database migrations
npm run migrate:status

# Check environment variables
./scripts/check-env.sh production

# Verify health checks
npm run health:check
```

### Step 2: Database Backup

```bash
# Create backup before deployment
pg_dump -h production-db.rds.amazonaws.com \
  -U deskmain_user \
  -d deskmain \
  -Fc -f backups/deskmain-$(date +%Y%m%d-%H%M%S).dump

# Verify backup
pg_restore --list backups/deskmain-*.dump | head -20
```

### Step 3: Migration Execution

```bash
# Run pending migrations
npm run migrate:run

# Verify migrations completed
npm run migrate:status

# Expected output: All migrations executed successfully
```

### Step 4: Application Deployment

```bash
# For Docker Swarm
docker service update \
  --image 123456789.dkr.ecr.us-east-1.amazonaws.com/deskmain-backend:v1.0.0 \
  deskmain-api

# For Kubernetes
kubectl set image deployment/deskmain-api \
  deskmain-api=123456789.dkr.ecr.us-east-1.amazonaws.com/deskmain-backend:v1.0.0 \
  -n deskmain

# Monitor rollout
kubectl rollout status deployment/deskmain-api -n deskmain
```

### Step 5: Health Verification

```bash
# Check API health
curl -X GET https://api.deskmain.com/health

# Expected response:
{
  "status": "ok",
  "database": "connected",
  "redis": "connected",
  "uptime": 120,
  "version": "1.0.0"
}

# Check all endpoints
npm run test:smoke
```

## 5. Monitoring During Deployment

```bash
# Real-time logs
kubectl logs -f deployment/deskmain-api -n deskmain

# Monitor resource usage
kubectl top nodes
kubectl top pods -n deskmain

# Check service status
kubectl describe service deskmain-api-service -n deskmain

# Check recent events
kubectl get events -n deskmain --sort-by='.lastTimestamp'
```

## 6. Rollback Procedure

### If Deployment Fails

```bash
# For Docker Swarm
docker service update \
  --image 123456789.dkr.ecr.us-east-1.amazonaws.com/deskmain-backend:v0.9.0 \
  deskmain-api

# For Kubernetes
kubectl rollout undo deployment/deskmain-api -n deskmain

# Verify rollback
kubectl rollout status deployment/deskmain-api -n deskmain

# Verify health
curl https://api.deskmain.com/health
```

### Database Rollback

```bash
# If migration caused issues
npm run migrate:rollback

# Or restore from backup
pg_restore -h production-db.rds.amazonaws.com \
  -U deskmain_user \
  -d deskmain \
  -j 4 \
  backups/deskmain-YYYYMMDD-HHMMSS.dump

# Verify data integrity
npm run verify:data
```

## 7. Post-Deployment Tasks

### Verification Checklist
- [ ] All health checks passing
- [ ] API responding to requests
- [ ] Database queries executing
- [ ] Redis cache operational
- [ ] Email service functional
- [ ] File uploads working
- [ ] Authentication flows working
- [ ] Payment processing operational
- [ ] Webhooks delivering
- [ ] Monitoring/alerts active

### Update Documentation
```bash
# Update deployment logs
echo "Deployment completed: $(date)" >> DEPLOYMENT_LOG.md
echo "Version: v1.0.0" >> DEPLOYMENT_LOG.md
echo "Status: SUCCESS" >> DEPLOYMENT_LOG.md

# Tag release in git
git tag -a v1.0.0 -m "Production release v1.0.0"
git push origin v1.0.0
```

### Notify Stakeholders
```bash
# Send notification
- Email team with deployment summary
- Post in Slack #deployments channel
- Update status page
- Notify support team of any changes
```

## 8. Emergency Response

### Service Down

```bash
# Check service status
kubectl get pods -n deskmain

# Restart service
kubectl rollout restart deployment/deskmain-api -n deskmain

# If restart fails, rollback
kubectl rollout undo deployment/deskmain-api -n deskmain
```

### Database Connection Issues

```bash
# Verify database connectivity
psql -h production-db.rds.amazonaws.com \
  -U deskmain_user \
  -d deskmain \
  -c "SELECT 1"

# Check database logs
# AWS RDS: CloudWatch Logs > /aws/rds/instance/deskmain

# Restart database connection pool
# No action needed - app will reconnect automatically
# If persistent, rolling restart required:
kubectl rollout restart deployment/deskmain-api -n deskmain
```

### Memory Leak or High Resource Usage

```bash
# Check resource usage
kubectl top pods -n deskmain

# Check logs for errors
kubectl logs deployment/deskmain-api -n deskmain | grep -i error

# Rolling restart with resource limits
kubectl set resources deployment/deskmain-api \
  -n deskmain \
  --limits=cpu=1000m,memory=1Gi \
  --requests=cpu=500m,memory=512Mi
```

## 9. Deployment Scheduling

### Recommended Deployment Windows
- **Day**: Tuesday-Thursday (avoid Monday and Friday)
- **Time**: 10:00-14:00 UTC (business hours)
- **Duration**: 15-30 minutes with team on-call
- **Frequency**: 2-4 times per month

### Maintenance Windows
- **Quarterly**: Database optimization (VACUUM ANALYZE, index maintenance)
- **Monthly**: Certificate renewal verification
- **Weekly**: Backup verification and testing

## 10. Deployment Checklist

### Before Deployment
- [ ] All tests passing locally
- [ ] Code reviewed and approved
- [ ] Staging deployment successful
- [ ] Database migrations tested
- [ ] Security scan passed
- [ ] Performance benchmarks met
- [ ] Team members notified
- [ ] On-call schedule confirmed

### During Deployment
- [ ] Monitor health checks
- [ ] Monitor application logs
- [ ] Monitor server metrics (CPU, memory, disk)
- [ ] Monitor database performance
- [ ] Check error rates in monitoring system
- [ ] Monitor external service integrations

### After Deployment
- [ ] Verify all endpoints working
- [ ] Test critical user flows
- [ ] Check database consistency
- [ ] Verify backup system
- [ ] Update deployment log
- [ ] Notify stakeholders
- [ ] Document any issues
- [ ] Schedule post-deployment review

## Conclusion

Following this guide ensures a safe, reliable production deployment with minimal downtime and full rollback capability. Always test thoroughly in staging before production deployment.

**Deployment Status**: Ready for production ✅
