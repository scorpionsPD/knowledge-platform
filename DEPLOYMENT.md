# Deployment Guide

## Overview

This document outlines the deployment process for the Knowledge Platform, demonstrating professional DevOps practices including containerization, CI/CD, and production best practices.

## Deployment Options

### Option 1: Docker Compose (Recommended for Single Server)

**Prerequisites:**
- Docker 20.10+
- Docker Compose 2.0+
- 2GB RAM minimum
- 10GB disk space

**Steps:**

1. **Clone and configure**
```bash
git clone https://github.com/scorpionsPD/knowledge-platform.git
cd knowledge-platform
cp .env.production.example .env
# Edit .env with your production values
```

2. **Build images**
```bash
docker-compose build
```

3. **Start services**
```bash
docker-compose up -d
```

4. **Run migrations**
```bash
docker-compose exec backend npx prisma migrate deploy
```

5. **Seed initial data (optional)**
```bash
docker-compose exec backend npm run prisma:seed
```

6. **Verify deployment**
```bash
curl http://localhost:4000/health
curl http://localhost:3000
```

### Option 2: Kubernetes (For Scale)

**Prerequisites:**
- Kubernetes cluster (GKE, EKS, AKS, or local)
- kubectl configured
- Helm 3.x

**Deploy with Helm:**
```bash
helm install knowledge-platform ./helm-chart \
  --set database.password=SECURE_PASSWORD \
  --set backend.sessionSecret=RANDOM_64_CHAR_STRING \
  --set ingress.host=knowledge-platform.yourdomain.com
```

### Option 3: Cloud Platforms

#### Vercel (Frontend) + Railway (Backend + DB)

**Frontend (Vercel):**
```bash
cd frontend
vercel --prod
```

**Backend (Railway):**
1. Connect GitHub repository to Railway
2. Add PostgreSQL database service
3. Configure environment variables
4. Deploy automatically on push to main

#### AWS (Full Stack)

**Architecture:**
- **Frontend**: S3 + CloudFront
- **Backend**: ECS Fargate or EC2 with Auto Scaling
- **Database**: RDS PostgreSQL with Multi-AZ
- **Load Balancer**: Application Load Balancer
- **Caching**: ElastiCache Redis (optional)
- **Monitoring**: CloudWatch

**Deploy with Terraform:**
```bash
cd infrastructure/terraform
terraform init
terraform plan
terraform apply
```

## Production Checklist

### Security
- [x] SESSION_SECRET is 64+ random characters
- [x] AUTH_DISABLED is false
- [x] Database uses SSL connections
- [x] CORS restricted to your domain
- [x] Rate limiting enabled
- [x] Security headers configured
- [x] OAuth configured with real provider
- [x] Secrets stored in environment variables (not code)
- [x] Database backups automated
- [x] SSL/TLS certificates installed

### Performance
- [ ] Database indexes reviewed
- [ ] Connection pool size tuned
- [ ] CDN configured for static assets
- [ ] Gzip/Brotli compression enabled
- [ ] HTTP/2 enabled
- [ ] Database query performance tested
- [ ] Load testing completed

### Monitoring
- [ ] Error tracking (Sentry, Rollbar)
- [ ] Application monitoring (DataDog, New Relic)
- [ ] Uptime monitoring (Pingdom, UptimeRobot)
- [ ] Log aggregation (ELK, CloudWatch)
- [ ] Alerts configured for critical metrics
- [ ] Performance monitoring dashboard

### Reliability
- [ ] Database backup strategy tested
- [ ] Disaster recovery plan documented
- [ ] Zero-downtime deployment process
- [ ] Health checks configured
- [ ] Auto-scaling policies defined
- [ ] Rollback procedure documented

## Environment Variables

### Required (Production)

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Security
SESSION_SECRET=<64-char-random-string>
NODE_ENV=production

# CORS
FRONTEND_ORIGIN=https://app.yourdomain.com

# OAuth
OAUTH_CLIENT_ID=xxx
OAUTH_CLIENT_SECRET=xxx
OAUTH_AUTH_URL=https://provider.com/authorize
OAUTH_TOKEN_URL=https://provider.com/token
OAUTH_CALLBACK_URL=https://yourdomain.com/auth/callback
OAUTH_USERINFO_URL=https://provider.com/userinfo
```

### Optional

```env
# Logging
LOG_LEVEL=info
SENTRY_DSN=https://xxx@sentry.io/xxx

# Performance
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10

# Features
ENABLE_ANALYTICS=true
```

## Database Migration Strategy

### Zero-Downtime Migrations

1. **Backward Compatible Changes First**
```bash
# Add new column (nullable)
npx prisma migrate deploy
```

2. **Deploy Application**
```bash
docker-compose up -d backend
```

3. **Data Migration** (if needed)
```bash
npx prisma db execute --file ./migrations/data-migration.sql
```

4. **Make Column Required** (after deployment)
```bash
npx prisma migrate deploy
```

### Rollback Procedure

```bash
# Restore database from backup
psql $DATABASE_URL < backup-2024-01-27.sql

# Revert to previous Docker image
docker-compose pull backend:previous-tag
docker-compose up -d backend
```

## Monitoring Setup

### Health Checks

**Backend:**
```bash
curl https://api.yourdomain.com/health
# Expected: {"status":"ok","timestamp":"2024-01-27T..."}
```

**Database:**
```bash
docker-compose exec postgres pg_isready
```

### Metrics to Track

- Request rate (req/sec)
- Response time (p50, p95, p99)
- Error rate (%)
- Database connections
- Memory usage
- CPU usage
- Session count

### Alerting Rules

```yaml
alerts:
  - name: High Error Rate
    condition: error_rate > 5%
    severity: critical
    
  - name: Slow Response Time
    condition: p95_latency > 2s
    severity: warning
    
  - name: Database Connection Pool Exhausted
    condition: db_connections > 90%
    severity: critical
```

## Scaling Strategy

### Horizontal Scaling

**Requirements:**
- Load balancer (nginx, ALB, CloudFlare)
- Shared session store (PostgreSQL already used)
- Stateless application design (✅ already implemented)

**Steps:**
```bash
# Scale backend to 3 instances
docker-compose up -d --scale backend=3

# Or with Kubernetes
kubectl scale deployment backend --replicas=3
```

### Vertical Scaling

**Database:**
- Increase CPU/RAM on database server
- Add read replicas for read-heavy workloads

**Application:**
- Increase container resource limits
```yaml
resources:
  limits:
    cpu: 2000m
    memory: 2Gi
```

## Backup Strategy

### Database Backups

**Automated Daily Backups:**
```bash
#!/bin/bash
# /usr/local/bin/backup-db.sh

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="backup_${TIMESTAMP}.sql"

pg_dump $DATABASE_URL > /backups/$BACKUP_FILE
gzip /backups/$BACKUP_FILE

# Upload to S3
aws s3 cp /backups/${BACKUP_FILE}.gz s3://backups/knowledge-platform/

# Retain last 30 days
find /backups -name "*.sql.gz" -mtime +30 -delete
```

**Cron Job:**
```cron
0 2 * * * /usr/local/bin/backup-db.sh
```

### Restore Procedure

```bash
# Download backup
aws s3 cp s3://backups/knowledge-platform/backup_20240127.sql.gz .

# Restore
gunzip backup_20240127.sql.gz
psql $DATABASE_URL < backup_20240127.sql
```

## CI/CD Pipeline

### GitHub Actions Workflow

The pipeline automatically:

1. **On Pull Request:**
   - Runs linting
   - Runs TypeScript compilation
   - Runs all tests
   - Performs security audit

2. **On Push to Main:**
   - All of the above, plus:
   - Builds Docker images
   - Pushes to Docker registry
   - Deploys to staging environment

3. **On Manual Trigger (Production):**
   - Deploys to production
   - Runs database migrations
   - Performs health checks
   - Sends deployment notification

### Manual Deployment

```bash
# Tag release
git tag v1.0.0
git push origin v1.0.0

# Trigger deployment
gh workflow run deploy.yml -f environment=production -f version=v1.0.0
```

## Troubleshooting

### Application Won't Start

**Check logs:**
```bash
docker-compose logs backend
docker-compose logs frontend
```

**Common issues:**
- Database not accessible (check DATABASE_URL)
- Missing environment variables
- Port already in use

### Database Connection Errors

**Verify database is running:**
```bash
docker-compose ps postgres
```

**Test connection:**
```bash
docker-compose exec backend npx prisma db execute --stdin <<< "SELECT 1"
```

### Performance Issues

**Check resource usage:**
```bash
docker stats
```

**Analyze slow queries:**
```sql
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

## Security Hardening

### Firewall Rules

```bash
# Allow only necessary ports
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw enable
```

### SSL/TLS Setup

**With Let's Encrypt:**
```bash
certbot --nginx -d knowledge-platform.yourdomain.com
```

### Regular Updates

```bash
# Update Docker images
docker-compose pull
docker-compose up -d

# Update dependencies
npm audit fix
```

## Cost Optimization

### Resource Sizing

**Minimum (for development/small teams):**
- Backend: 1 vCPU, 1GB RAM
- Frontend: 0.5 vCPU, 512MB RAM
- Database: 1 vCPU, 2GB RAM, 20GB storage

**Production (medium workload):**
- Backend: 2 vCPUs, 2GB RAM (x2 instances)
- Frontend: 1 vCPU, 1GB RAM (x2 instances)
- Database: 2 vCPUs, 4GB RAM, 100GB storage

### Cost-Saving Tips

- Use spot instances for non-critical workloads
- Implement caching (Redis) to reduce database load
- Use CDN for static assets
- Auto-scale during off-peak hours
- Archive old data to cold storage

---

**Author:** Pradeep Dahiya  
**Last Updated:** January 2026  
**Version:** 1.0.0
