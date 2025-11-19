# ClubCompass Deployment Guide

This comprehensive guide covers deploying ClubCompass to production using Vercel (frontend) and AWS Lambda + API Gateway (backend).

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Architecture Overview](#architecture-overview)
3. [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
4. [Backend Deployment (AWS Lambda)](#backend-deployment-aws-lambda)
5. [Database Setup](#database-setup)
6. [Environment Variables](#environment-variables)
7. [CI/CD Pipeline](#cicd-pipeline)
8. [Monitoring & Logging](#monitoring--logging)
9. [Health Checks](#health-checks)
10. [Rollback Procedures](#rollback-procedures)
11. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Accounts
- ✅ Vercel account (for frontend hosting)
- ✅ AWS account (for backend Lambda + API Gateway)
- ✅ Supabase account (for PostgreSQL database)
- ✅ Redis Cloud account (for caching)
- ✅ Sentry account (for error tracking)
- ✅ GitHub account (for CI/CD)

### Required Tools
```bash
# Install Node.js 20+
node --version  # Should be v20.x or higher

# Install Python 3.11+
python --version  # Should be 3.11.x or higher

# Install AWS CLI
aws --version

# Install Vercel CLI
npm install -g vercel

# Install Serverless Framework
npm install -g serverless

# Install Docker (for local testing)
docker --version
```

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    CLOUDFLARE CDN (Optional)                 │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                   VERCEL EDGE NETWORK                        │
│              (Next.js Frontend + Edge Functions)             │
│  - Production: https://clubcompass.bmsce.ac.in              │
│  - Staging: https://staging.clubcompass.bmsce.ac.in         │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              AWS API GATEWAY + LAMBDA                        │
│                  (FastAPI Backend)                           │
│  - Production: https://api.clubcompass.bmsce.ac.in          │
│  - Staging: https://api-staging.clubcompass.bmsce.ac.in     │
└──────────────────────┬──────────────────────────────────────┘
                       │
          ┌────────────┴────────────┐
          │                         │
          ▼                         ▼
┌──────────────────┐      ┌──────────────────┐
│   SUPABASE       │      │   REDIS CLOUD    │
│   (PostgreSQL)   │      │   (Cache)        │
└──────────────────┘      └──────────────────┘
```

---

## Frontend Deployment (Vercel)

### Step 1: Initial Setup

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Link Project:**
   ```bash
   cd frontend
   vercel link
   ```

### Step 2: Configure Environment Variables

In Vercel Dashboard (https://vercel.com/dashboard):

1. Navigate to your project
2. Go to **Settings** → **Environment Variables**
3. Add the following variables:

**Production Environment:**
```bash
NEXT_PUBLIC_API_URL=https://api.clubcompass.bmsce.ac.in/api/v1
NEXT_PUBLIC_SITE_URL=https://clubcompass.bmsce.ac.in
NEXT_PUBLIC_SENTRY_DSN=<your-sentry-dsn>
SENTRY_AUTH_TOKEN=<your-sentry-auth-token>
NEXT_PUBLIC_ENABLE_ANALYTICS=true
```

**Staging Environment:**
```bash
NEXT_PUBLIC_API_URL=https://api-staging.clubcompass.bmsce.ac.in/api/v1
NEXT_PUBLIC_SITE_URL=https://staging.clubcompass.bmsce.ac.in
NEXT_PUBLIC_SENTRY_DSN=<your-sentry-dsn>
SENTRY_AUTH_TOKEN=<your-sentry-auth-token>
```

### Step 3: Manual Deployment

```bash
cd frontend

# Deploy to production
vercel --prod

# Deploy to staging
vercel
```

### Step 4: Configure Custom Domain

1. In Vercel Dashboard, go to **Settings** → **Domains**
2. Add custom domain: `clubcompass.bmsce.ac.in`
3. Add staging domain: `staging.clubcompass.bmsce.ac.in`
4. Update DNS records as instructed by Vercel

### Step 5: Verify Deployment

```bash
# Check production
curl https://clubcompass.bmsce.ac.in

# Run health check script
./scripts/health-check.sh production
```

---

## Backend Deployment (AWS Lambda)

### Step 1: AWS Setup

1. **Configure AWS credentials:**
   ```bash
   aws configure
   # Enter your AWS Access Key ID
   # Enter your AWS Secret Access Key
   # Default region: us-east-1
   # Default output format: json
   ```

2. **Create IAM User for Deployment:**
   - Create IAM user: `clubcompass-deployer`
   - Attach policies: `AdministratorAccess` (or create custom policy)
   - Save Access Key ID and Secret Access Key

### Step 2: Setup AWS Resources

```bash
# Run the setup script
./scripts/setup-aws-resources.sh prod

# This will create:
# - SSM Parameters for secrets
# - IAM roles
# - CloudWatch Log Groups
```

**Manual SSM Parameter Setup:**
```bash
# Database URL
aws ssm put-parameter \
  --name "/clubcompass/prod/database-url" \
  --value "postgresql://user:password@host:5432/clubcompass_prod" \
  --type "SecureString" \
  --region us-east-1

# Redis URL
aws ssm put-parameter \
  --name "/clubcompass/prod/redis-url" \
  --value "redis://redis-host:6379" \
  --type "String" \
  --region us-east-1

# Secret Key (generate with: openssl rand -hex 32)
aws ssm put-parameter \
  --name "/clubcompass/prod/secret-key" \
  --value "$(openssl rand -hex 32)" \
  --type "SecureString" \
  --region us-east-1

# Allowed Origins
aws ssm put-parameter \
  --name "/clubcompass/prod/allowed-origins" \
  --value "https://clubcompass.bmsce.ac.in" \
  --type "String" \
  --region us-east-1
```

### Step 3: Install Serverless Framework

```bash
cd backend

# Install globally
npm install -g serverless

# Install plugins locally
npm init -y
npm install --save-dev serverless-python-requirements
npm install --save-dev serverless-offline
npm install --save-dev serverless-dotenv-plugin
```

### Step 4: Deploy Backend

```bash
cd backend

# Deploy to production
serverless deploy --stage prod --region us-east-1 --verbose

# Deploy to staging
serverless deploy --stage staging --region us-east-1 --verbose

# Or use the deployment script
./scripts/deploy-backend.sh prod
```

### Step 5: Configure Custom Domain (Optional)

Using AWS Certificate Manager (ACM) and API Gateway:

1. **Request SSL Certificate in ACM:**
   ```bash
   aws acm request-certificate \
     --domain-name api.clubcompass.bmsce.ac.in \
     --validation-method DNS \
     --region us-east-1
   ```

2. **Add Custom Domain in API Gateway:**
   - Go to API Gateway Console
   - Create Custom Domain Name: `api.clubcompass.bmsce.ac.in`
   - Select ACM certificate
   - Create API Mapping

3. **Update DNS:**
   - Add CNAME record pointing to API Gateway domain

### Step 6: Verify Deployment

```bash
# Get API URL from deployment output
# Test health endpoint
curl https://<api-gateway-url>/health

# Test with custom domain
curl https://api.clubcompass.bmsce.ac.in/health

# Run comprehensive health check
./scripts/health-check.sh production
```

---

## Database Setup

### Using Supabase (Recommended)

1. **Create Supabase Project:**
   - Go to https://supabase.com/dashboard
   - Click "New Project"
   - Choose region (closest to your users)
   - Save database password

2. **Get Connection String:**
   ```
   postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
   ```

3. **Run Migrations:**
   ```bash
   cd backend

   # Set DATABASE_URL
   export DATABASE_URL="postgresql://postgres:password@host:5432/postgres"

   # Run migrations using Alembic (if available)
   alembic upgrade head

   # Or run SQL migrations manually
   psql $DATABASE_URL < migrations/001_create_users_table.sql
   ```

4. **Seed Database:**
   ```bash
   # Run seeding script
   python seed_clubs.py

   # Or use SQL file
   psql $DATABASE_URL < seed_clubs.sql
   ```

### Using AWS RDS (Alternative)

1. **Create RDS PostgreSQL Instance:**
   ```bash
   aws rds create-db-instance \
     --db-instance-identifier clubcompass-prod \
     --db-instance-class db.t3.micro \
     --engine postgres \
     --engine-version 15.4 \
     --master-username clubcompass \
     --master-user-password <strong-password> \
     --allocated-storage 20 \
     --region us-east-1
   ```

2. **Configure Security Group:**
   - Allow inbound traffic on port 5432 from Lambda security group

---

## Environment Variables

### Frontend Environment Variables

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | ✅ Yes | `https://api.clubcompass.bmsce.ac.in/api/v1` |
| `NEXT_PUBLIC_SITE_URL` | Frontend URL | ✅ Yes | `https://clubcompass.bmsce.ac.in` |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry DSN | No | `https://xxx@xxx.ingest.sentry.io/xxx` |
| `SENTRY_AUTH_TOKEN` | Sentry auth token | No | `sntrys_xxx` |
| `NEXT_PUBLIC_ENABLE_ANALYTICS` | Enable analytics | No | `true` |

### Backend Environment Variables

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ Yes | `postgresql://user:pass@host:5432/db` |
| `REDIS_URL` | Redis connection string | ✅ Yes | `redis://host:6379` |
| `SECRET_KEY` | JWT secret key | ✅ Yes | Generated with `openssl rand -hex 32` |
| `ALGORITHM` | JWT algorithm | ✅ Yes | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Access token expiry | ✅ Yes | `60` |
| `REFRESH_TOKEN_EXPIRE_DAYS` | Refresh token expiry | ✅ Yes | `7` |
| `ALLOWED_ORIGINS` | CORS allowed origins | ✅ Yes | `https://clubcompass.bmsce.ac.in` |
| `SENTRY_DSN` | Sentry DSN | No | `https://xxx@xxx.ingest.sentry.io/xxx` |
| `ENVIRONMENT` | Environment name | ✅ Yes | `production` |

---

## CI/CD Pipeline

### GitHub Actions Workflows

Three workflows are configured:

1. **`frontend-ci.yml`** - Frontend CI (runs on PR)
2. **`backend-ci.yml`** - Backend CI (runs on PR)
3. **`deploy-frontend.yml`** - Deploy frontend to Vercel
4. **`deploy-backend.yml`** - Deploy backend to AWS Lambda
5. **`deploy-staging.yml`** - Deploy to staging environment

### Required GitHub Secrets

Navigate to: Repository → Settings → Secrets and variables → Actions

**Vercel Secrets:**
```
VERCEL_TOKEN=<your-vercel-token>
VERCEL_ORG_ID=<your-org-id>
VERCEL_PROJECT_ID=<your-project-id>
```

**AWS Secrets:**
```
AWS_ACCESS_KEY_ID=<your-access-key-id>
AWS_SECRET_ACCESS_KEY=<your-secret-access-key>
AWS_REGION=us-east-1
```

**Sentry Secrets:**
```
NEXT_PUBLIC_SENTRY_DSN=<your-sentry-dsn>
SENTRY_AUTH_TOKEN=<your-sentry-auth-token>
```

**Database Secrets:**
```
PROD_DATABASE_URL=<your-production-database-url>
STAGING_DATABASE_URL=<your-staging-database-url>
```

**Other Secrets:**
```
NEXT_PUBLIC_API_URL=https://api.clubcompass.bmsce.ac.in/api/v1
NEXT_PUBLIC_SITE_URL=https://clubcompass.bmsce.ac.in
STAGING_API_URL=https://api-staging.clubcompass.bmsce.ac.in/api/v1
STAGING_SITE_URL=https://staging.clubcompass.bmsce.ac.in
```

### Deployment Flow

```
1. Developer pushes to `develop` branch
   ↓
2. CI runs tests and linting
   ↓
3. If tests pass, deploy to staging
   ↓
4. Manual testing on staging
   ↓
5. Create PR to `main` branch
   ↓
6. Code review and approval
   ↓
7. Merge to `main` triggers production deployment
   ↓
8. Automated deployment to Vercel + AWS Lambda
   ↓
9. Health checks run automatically
```

---

## Monitoring & Logging

### Sentry Setup

1. **Create Sentry Project:**
   - Go to https://sentry.io
   - Create new project for Next.js (frontend)
   - Create new project for Python/FastAPI (backend)

2. **Get DSN:**
   - Copy DSN from project settings
   - Add to environment variables

3. **Configure Alerts:**
   - Set up email alerts for errors
   - Configure Slack integration (optional)

### CloudWatch (AWS)

**View Lambda Logs:**
```bash
# View recent logs
aws logs tail /aws/lambda/clubcompass-api-prod-api --follow

# View logs from last hour
aws logs tail /aws/lambda/clubcompass-api-prod-api --since 1h
```

**Create Alarms:**
```bash
# Create alarm for 5xx errors
aws cloudwatch put-metric-alarm \
  --alarm-name clubcompass-api-5xx-errors \
  --alarm-description "Alert on 5xx errors" \
  --metric-name 5XXError \
  --namespace AWS/ApiGateway \
  --statistic Sum \
  --period 300 \
  --evaluation-periods 1 \
  --threshold 10 \
  --comparison-operator GreaterThanThreshold
```

### Vercel Analytics

- Automatically enabled for Vercel deployments
- View in Vercel Dashboard → Analytics
- Tracks:
  - Page views
  - Web Vitals (LCP, FID, CLS)
  - Visitor geography
  - Device types

---

## Health Checks

### Automated Health Checks

```bash
# Check both frontend and backend
./scripts/health-check.sh production

# Check staging environment
./scripts/health-check.sh staging
```

### Manual Health Checks

**Frontend:**
```bash
curl https://clubcompass.bmsce.ac.in
# Should return 200 OK with HTML
```

**Backend:**
```bash
# Health endpoint
curl https://api.clubcompass.bmsce.ac.in/health
# Returns: {"status": "healthy", "service": "clubcompass-api", "version": "1.0.0"}

# API documentation
curl https://api.clubcompass.bmsce.ac.in/docs
# Should return 200 OK
```

### Uptime Monitoring (UptimeRobot)

1. Create account at https://uptimerobot.com
2. Add monitors:
   - Frontend: `https://clubcompass.bmsce.ac.in`
   - Backend Health: `https://api.clubcompass.bmsce.ac.in/health`
3. Set check interval: 5 minutes
4. Configure alerts: Email/SMS/Slack

---

## Rollback Procedures

### Frontend Rollback (Vercel)

**Using Script:**
```bash
./scripts/rollback.sh frontend production
```

**Manual Rollback:**
```bash
cd frontend

# List recent deployments
vercel ls

# Rollback to specific deployment
vercel rollback <deployment-url> --yes
```

### Backend Rollback (AWS Lambda)

**Using Serverless:**
```bash
cd backend

# Rollback to previous version
serverless rollback --stage prod

# Or use script
./scripts/rollback.sh backend production
```

**Manual Rollback via AWS Console:**
1. Go to Lambda Console
2. Select function: `clubcompass-api-prod-api`
3. Go to Versions tab
4. Select previous version
5. Update alias to point to previous version

---

## Troubleshooting

### Common Issues

#### 1. Frontend Build Fails

**Error:** `Module not found` or `Type errors`

**Solution:**
```bash
cd frontend

# Clear cache
rm -rf .next node_modules package-lock.json

# Reinstall dependencies
npm install

# Run type check
npm run type-check

# Build
npm run build
```

#### 2. Backend Deployment Fails

**Error:** `Serverless: Deployment failed`

**Solution:**
```bash
# Check AWS credentials
aws sts get-caller-identity

# Check if SSM parameters exist
aws ssm get-parameters \
  --names "/clubcompass/prod/database-url" \
          "/clubcompass/prod/redis-url" \
          "/clubcompass/prod/secret-key" \
  --with-decryption

# Check serverless.yml syntax
serverless package --stage prod

# Try deploying with verbose logging
serverless deploy --stage prod --verbose
```

#### 3. Database Connection Issues

**Error:** `Connection refused` or `Timeout`

**Solution:**
```bash
# Test database connection
psql $DATABASE_URL -c "SELECT 1"

# Check if Lambda has VPC access (if database is in VPC)
# Ensure security group allows inbound from Lambda

# Check DATABASE_URL format
echo $DATABASE_URL
# Should be: postgresql://user:password@host:5432/database
```

#### 4. CORS Errors

**Error:** `Access-Control-Allow-Origin` errors in browser

**Solution:**
```bash
# Check ALLOWED_ORIGINS in backend
# Update SSM parameter
aws ssm put-parameter \
  --name "/clubcompass/prod/allowed-origins" \
  --value "https://clubcompass.bmsce.ac.in,https://www.clubcompass.bmsce.ac.in" \
  --type "String" \
  --overwrite

# Redeploy backend
serverless deploy --stage prod
```

#### 5. Environment Variables Not Loading

**Error:** `undefined` or `null` for environment variables

**Solution:**

**Frontend (Vercel):**
- Check Vercel Dashboard → Settings → Environment Variables
- Ensure variables start with `NEXT_PUBLIC_` for client-side access
- Redeploy after adding variables

**Backend (Lambda):**
- Check SSM Parameter Store
- Verify IAM role has permission to read SSM parameters
- Check `serverless.yml` environment section

### Performance Issues

#### Slow API Response Times

1. **Check CloudWatch Metrics:**
   - Lambda duration
   - API Gateway latency

2. **Optimize Database Queries:**
   ```bash
   # Enable slow query log
   # Check database connections
   ```

3. **Add Caching:**
   - Implement Redis caching for frequent queries
   - Use Vercel Edge Caching for static content

4. **Scale Resources:**
   - Increase Lambda memory (improves CPU)
   - Use provisioned concurrency for consistent performance

### Getting Help

- **Documentation:** Check this deployment guide
- **Logs:** Review CloudWatch and Vercel logs
- **Sentry:** Check error tracking in Sentry dashboard
- **Support:** Contact DevOps team or create GitHub issue

---

## Deployment Checklist

### Pre-Deployment

- [ ] All tests passing
- [ ] Code reviewed and approved
- [ ] Environment variables configured
- [ ] Database migrations ready
- [ ] Sentry configured
- [ ] Custom domains configured

### Deployment

- [ ] Deploy to staging first
- [ ] Test on staging
- [ ] Run health checks
- [ ] Deploy to production
- [ ] Verify production deployment
- [ ] Run post-deployment tests

### Post-Deployment

- [ ] Monitor error rates in Sentry
- [ ] Check CloudWatch metrics
- [ ] Verify all features working
- [ ] Update documentation
- [ ] Notify team of deployment

---

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Serverless Framework Docs](https://www.serverless.com/framework/docs)
- [AWS Lambda Documentation](https://docs.aws.amazon.com/lambda/)
- [Supabase Documentation](https://supabase.com/docs)
- [Sentry Documentation](https://docs.sentry.io/)

---

**Last Updated:** 2024-11-18
**Version:** 1.0.0
**Maintained By:** ClubCompass DevOps Team
