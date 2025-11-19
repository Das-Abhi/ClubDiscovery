# Infrastructure Documentation

## Overview

This document describes the infrastructure setup for ClubCompass in production.

## Architecture Components

### Frontend (Vercel)
- **Platform:** Vercel Edge Network
- **Framework:** Next.js 15
- **Domain:** clubcompass.bmsce.ac.in
- **Features:**
  - Automatic SSL/TLS
  - Global CDN
  - Edge Functions
  - Serverless Functions
  - Automatic scaling

### Backend (AWS Lambda + API Gateway)
- **Platform:** AWS Lambda
- **API Gateway:** HTTP API
- **Runtime:** Python 3.11
- **Framework:** FastAPI
- **Domain:** api.clubcompass.bmsce.ac.in

### Database (Supabase PostgreSQL)
- **Provider:** Supabase
- **Version:** PostgreSQL 15
- **Hosting:** Cloud-managed
- **Backups:** Automated daily

### Cache (Redis Cloud)
- **Provider:** Redis Cloud
- **Use Cases:**
  - Session management
  - Rate limiting
  - API response caching

### Monitoring (Sentry)
- **Frontend:** JavaScript/Next.js SDK
- **Backend:** Python/FastAPI SDK
- **Features:**
  - Error tracking
  - Performance monitoring
  - Release tracking

## Resource Specifications

### Frontend
- **Build:** Automated on git push
- **Deployment:** Automatic (Vercel)
- **Caching:** Edge caching enabled
- **Bandwidth:** Unlimited (Vercel Pro)

### Backend
- **Memory:** 512 MB per Lambda function
- **Timeout:** 30 seconds
- **Concurrency:** 10 (can be increased)
- **Cold Start:** ~1-2 seconds

### Database
- **Instance:** db.t3.micro (production)
- **Storage:** 20 GB
- **Connections:** Pooled via Supabase
- **Backups:** Daily automated

## Scaling Strategy

### Horizontal Scaling
- **Frontend:** Automatic (Vercel Edge Network)
- **Backend:** Automatic (AWS Lambda)
- **Database:** Vertical scaling available

### Vertical Scaling
- Increase Lambda memory allocation
- Upgrade database instance type
- Add read replicas (if needed)

## Cost Estimation

### Monthly Costs (Estimated)
- **Vercel:** $20/month (Pro plan)
- **AWS Lambda:** ~$5-10/month (based on usage)
- **Supabase:** $25/month (Pro plan)
- **Redis Cloud:** $5-10/month
- **Sentry:** Free (Developer plan, up to 5k events)

**Total:** ~$55-70/month

## Security

### Network Security
- All traffic encrypted (HTTPS/TLS 1.3)
- CORS configured for frontend domain only
- Rate limiting on API endpoints

### Data Security
- Database encryption at rest
- Secrets stored in AWS SSM Parameter Store
- JWT tokens for authentication
- Password hashing with bcrypt

### Access Control
- IAM roles with least privilege
- Separate production/staging environments
- Admin access logged and monitored

## Disaster Recovery

### Backup Strategy
- **Database:** Daily automated backups (7-day retention)
- **Code:** Version controlled in GitHub
- **Configurations:** Infrastructure as Code (serverless.yml)

### Recovery Procedures
1. Database recovery from Supabase dashboard
2. Rollback deployment using scripts
3. Restore from previous Lambda version

### RTO/RPO
- **RTO (Recovery Time Objective):** 1 hour
- **RPO (Recovery Point Objective):** 24 hours

## Maintenance Windows

### Scheduled Maintenance
- **Time:** Sundays 2:00-4:00 AM IST
- **Frequency:** Monthly
- **Activities:**
  - Database updates
  - Security patches
  - Performance optimization

### Emergency Maintenance
- Performed as needed
- Users notified via status page

## Performance Targets

### Frontend
- **TTFB:** < 200ms
- **FCP:** < 1.5s
- **LCP:** < 2.5s
- **Lighthouse Score:** > 90

### Backend
- **API Response Time:** < 500ms (p95)
- **Error Rate:** < 0.1%
- **Uptime:** 99.9%

## Monitoring & Alerts

### Metrics Tracked
- Request count
- Error rates
- Response times
- Database connections
- Lambda invocations
- Memory usage

### Alert Channels
- Email (critical alerts)
- Slack (all alerts)
- PagerDuty (on-call)

### Alert Thresholds
- Error rate > 1%: Warning
- Error rate > 5%: Critical
- Response time > 1s: Warning
- Downtime > 5 min: Critical

## Compliance

### Data Privacy
- GDPR compliant (data deletion on request)
- No PII in logs
- User consent for analytics

### Security Standards
- OWASP Top 10 addressed
- Regular security audits
- Dependency vulnerability scanning

---

**Last Updated:** 2024-11-18
**Version:** 1.0.0
