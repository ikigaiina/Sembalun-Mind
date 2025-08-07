# Enterprise Deployment Guide - Sembalun Meditation Platform

## Overview

This guide provides comprehensive deployment instructions for the Sembalun Indonesian Meditation Platform in enterprise environments supporting 10K+ concurrent users.

## Architecture Overview

### Technology Stack
- **Frontend**: React 19.1.0 with Vite 7.0.4
- **Backend**: Supabase with PostgreSQL
- **Authentication**: Supabase Auth with Google OAuth
- **Real-time**: Supabase Realtime
- **CDN**: Vercel Edge Network / Cloudflare
- **Monitoring**: Enterprise Performance Monitor + Security Framework
- **Caching**: Service Worker + CDN + Redis

### Performance Characteristics
- **Time to Interactive**: < 2.3 seconds
- **First Contentful Paint**: < 1.8 seconds
- **Bundle Size**: 1.2MB (gzipped: 350KB)
- **Memory Usage**: < 100MB baseline
- **Concurrent Users**: 10K+ supported
- **Uptime SLA**: 99.9%

## Pre-Deployment Requirements

### System Requirements
```yaml
# Minimum Server Specifications
CPU: 4 cores (8 recommended)
RAM: 8GB (16GB recommended)
Storage: 50GB SSD
Network: 1Gbps connection
OS: Ubuntu 20.04 LTS or similar

# Production Scaling
Load Balancer: NGINX or AWS ALB
CDN: CloudFlare or AWS CloudFront
Database: PostgreSQL 14+ with read replicas
Caching: Redis 6+ cluster
Monitoring: DataDog/New Relic integration
```

### Environment Variables
```bash
# Core Application
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_APP_URL=https://sembalun.com
VITE_CDN_URL=https://cdn.sembalun.com

# Google OAuth
VITE_GOOGLE_CLIENT_ID=your-google-client-id

# Enterprise Features
VITE_SENTRY_DSN=https://your-sentry-dsn
VITE_ANALYTICS_ID=your-analytics-id
VITE_MONITORING_ENDPOINT=https://monitoring.sembalun.com

# Security
VITE_CSP_REPORT_URI=https://csp-reports.sembalun.com
VITE_SECURITY_HEADERS=strict

# Performance
VITE_CACHE_VERSION=v2.1.0
VITE_PRELOAD_AUDIO=true
VITE_ENABLE_SW=true
```

## Deployment Strategies

### 1. Vercel Production Deployment (Recommended)

```bash
# Install dependencies
npm install

# Build for production
npm run prepare:production

# Deploy to Vercel
vercel --prod

# Custom domain setup
vercel domains add sembalun.com
vercel domains add www.sembalun.com
```

#### Vercel Configuration (vercel.json)
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "camera=(), microphone=(), geolocation=(self)"
        }
      ]
    },
    {
      "source": "/static/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://your-project.supabase.co/rest/v1/:path*"
    }
  ]
}
```

### 2. AWS Enterprise Deployment

```bash
# Infrastructure as Code (Terraform)
terraform init
terraform plan -var="environment=production"
terraform apply

# Application deployment
aws s3 sync dist/ s3://sembalun-prod-bucket --delete
aws cloudfront create-invalidation --distribution-id ABCDEF --paths "/*"

# Auto-scaling configuration
aws autoscaling create-auto-scaling-group \
  --auto-scaling-group-name sembalun-asg \
  --min-size 2 \
  --max-size 20 \
  --desired-capacity 4 \
  --target-group-arns arn:aws:elasticloadbalancing:...
```

### 3. Docker Enterprise Deployment

```dockerfile
# Multi-stage production Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine AS production

# Security hardening
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

# Copy built application
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

# Security headers and caching
COPY --chown=nextjs:nodejs security-headers.conf /etc/nginx/conf.d/
COPY --chown=nextjs:nodejs cache-rules.conf /etc/nginx/conf.d/

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

```yaml
# docker-compose.production.yml
version: '3.8'
services:
  app:
    image: sembalun:latest
    ports:
      - "80:80"
      - "443:443"
    environment:
      - NODE_ENV=production
    volumes:
      - ./ssl:/etc/ssl/certs:ro
    restart: unless-stopped
    
  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    restart: unless-stopped
    
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/ssl/certs:ro
    depends_on:
      - app
    restart: unless-stopped

volumes:
  redis_data:
```

## Security Hardening

### 1. Content Security Policy
```javascript
// Implemented in enterprise-security.ts
const cspDirectives = {
  'default-src': "'self'",
  'script-src': "'self' https://cdn.jsdelivr.net https://api.supabase.co",
  'style-src': "'self' 'unsafe-inline' https://fonts.googleapis.com",
  'img-src': "'self' data: https: https://*.supabase.co",
  'connect-src': "'self' https://api.supabase.co wss://*.supabase.co",
  'font-src': "'self' https://fonts.gstatic.com",
  'media-src': "'self' data: blob:",
  'object-src': "'none'",
  'base-uri': "'self'",
  'form-action': "'self'",
  'frame-ancestors': "'none'"
};
```

### 2. Rate Limiting Configuration
```javascript
// Production rate limits
const rateLimitRules = [
  {
    endpoint: /\/api\/auth\//,
    limit: 10,      // requests
    window: 300,    // 5 minutes
    blockDuration: 900 // 15 minutes
  },
  {
    endpoint: /\/api\/meditation\/start/,
    limit: 50,
    window: 3600,   // 1 hour
    blockDuration: 300
  }
];
```

### 3. SSL/TLS Configuration
```nginx
# nginx SSL configuration
server {
    listen 443 ssl http2;
    server_name sembalun.com www.sembalun.com;
    
    ssl_certificate /etc/ssl/certs/sembalun.pem;
    ssl_certificate_key /etc/ssl/private/sembalun.key;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;
    
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options DENY;
    add_header X-XSS-Protection "1; mode=block";
}
```

## Performance Optimization

### 1. CDN Configuration
```javascript
// Cloudflare settings
const cdnConfig = {
  caching: {
    browser_ttl: 31536000, // 1 year for static assets
    edge_ttl: 7200,        // 2 hours for API responses
    always_online: true
  },
  minification: {
    css: true,
    js: true,
    html: true
  },
  compression: {
    gzip: true,
    brotli: true
  },
  optimization: {
    auto_minify: true,
    rocket_loader: false, // Disabled for React
    mirage: true
  }
};
```

### 2. Database Optimization
```sql
-- Supabase performance indexes
CREATE INDEX CONCURRENTLY idx_users_meditation_sessions 
ON meditation_sessions(user_id, created_at DESC);

CREATE INDEX CONCURRENTLY idx_meditation_progress 
ON meditation_progress(user_id, session_date);

CREATE INDEX CONCURRENTLY idx_user_achievements 
ON user_achievements(user_id, achievement_type);

-- Enable row level security
ALTER TABLE meditation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE meditation_content ENABLE ROW LEVEL SECURITY;
```

### 3. Caching Strategy
```javascript
// Service Worker caching
const cacheStrategy = {
  // Static assets - Cache First
  static: {
    strategy: 'CacheFirst',
    expiration: {
      maxEntries: 200,
      maxAgeSeconds: 365 * 24 * 60 * 60 // 1 year
    }
  },
  
  // API responses - Network First
  api: {
    strategy: 'NetworkFirst',
    expiration: {
      maxEntries: 100,
      maxAgeSeconds: 24 * 60 * 60 // 1 day
    },
    networkTimeoutSeconds: 3
  },
  
  // Audio files - Cache First
  audio: {
    strategy: 'CacheFirst',
    expiration: {
      maxEntries: 100,
      maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
    }
  }
};
```

## Monitoring and Observability

### 1. Performance Monitoring
```javascript
// Enterprise monitoring integration
const monitoringConfig = {
  metrics: {
    coreWebVitals: true,
    customMetrics: true,
    errorTracking: true,
    performanceAnalytics: true
  },
  
  alerts: {
    performanceThreshold: {
      lcp: 2500,     // milliseconds
      fid: 100,      // milliseconds
      cls: 0.1       // score
    },
    
    errorRate: 0.01, // 1%
    uptime: 0.999    // 99.9%
  },
  
  reporting: {
    interval: 60000,    // 1 minute
    batchSize: 100,
    compression: true
  }
};
```

### 2. Log Aggregation
```yaml
# Elasticsearch/Kibana setup
logging:
  driver: "json-file"
  options:
    max-size: "100m"
    max-file: "5"
    
# Log levels
levels:
  production: "warn"
  staging: "info"
  development: "debug"
```

### 3. Health Checks
```javascript
// Application health endpoint
app.get('/health', (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    
    services: {
      database: checkDatabaseHealth(),
      redis: checkRedisHealth(),
      storage: checkStorageHealth()
    },
    
    performance: {
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage()
    }
  };
  
  const overallStatus = Object.values(health.services).every(s => s.status === 'healthy');
  health.status = overallStatus ? 'healthy' : 'unhealthy';
  
  res.status(overallStatus ? 200 : 503).json(health);
});
```

## Scaling Configuration

### 1. Auto-scaling Rules
```yaml
# Kubernetes HPA
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: sembalun-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: sembalun-app
  minReplicas: 3
  maxReplicas: 50
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

### 2. Database Scaling
```sql
-- Read replica configuration
CREATE SUBSCRIPTION sembalun_replica 
CONNECTION 'host=replica.db.com port=5432 dbname=sembalun'
PUBLICATION sembalun_pub;

-- Connection pooling
pgbouncer_config = {
  max_client_conn: 1000,
  default_pool_size: 100,
  pool_mode: 'transaction'
}
```

## Deployment Checklist

### Pre-deployment
- [ ] Environment variables configured
- [ ] SSL certificates installed
- [ ] Database migrations applied
- [ ] CDN configured
- [ ] Load balancer configured
- [ ] Monitoring setup complete

### Security Checklist
- [ ] CSP headers configured
- [ ] Rate limiting enabled
- [ ] Input validation implemented
- [ ] Authentication flows tested
- [ ] HTTPS enforced
- [ ] Security headers configured

### Performance Checklist
- [ ] Bundle size optimized (< 2MB)
- [ ] Images optimized and WebP format
- [ ] Service Worker configured
- [ ] CDN caching rules set
- [ ] Database indexes created
- [ ] Lazy loading implemented

### Post-deployment
- [ ] Health checks passing
- [ ] Performance metrics baseline established
- [ ] Error tracking configured
- [ ] Backup strategy verified
- [ ] Rollback plan tested
- [ ] Documentation updated

## Rollback Strategy

### Automated Rollback
```bash
# Vercel rollback
vercel rollback

# AWS CodeDeploy rollback
aws deploy stop-deployment --deployment-id d-ABCDEF123

# Docker rollback
docker service update --rollback sembalun_app
```

### Manual Rollback
```bash
# Database rollback
psql -h localhost -d sembalun -f rollback_script.sql

# Cache invalidation
redis-cli FLUSHALL

# CDN cache purge
curl -X POST "https://api.cloudflare.com/client/v4/zones/ZONE_ID/purge_cache"
```

## Disaster Recovery

### Backup Strategy
```bash
# Database backup
pg_dump -h prod-db.com -U postgres sembalun > backup_$(date +%Y%m%d_%H%M%S).sql

# Storage backup
aws s3 sync s3://sembalun-storage s3://sembalun-backup-storage

# Configuration backup
kubectl get configmaps -o yaml > configmaps_backup.yaml
```

### Recovery Procedures
```bash
# Database recovery
psql -h replica-db.com -U postgres -d sembalun < latest_backup.sql

# Application recovery
kubectl rollout restart deployment/sembalun-app

# Traffic routing
kubectl patch service sembalun-service -p '{"spec":{"selector":{"app":"sembalun-backup"}}}'
```

## Compliance and Certification

### GDPR Compliance
- Data encryption at rest and in transit
- User data anonymization
- Right to be forgotten implementation
- Cookie consent management
- Privacy policy integration

### OWASP Security Standards
- Input validation and sanitization
- Authentication and session management
- Access control mechanisms
- Cryptographic practices
- Error handling and logging

### Performance Standards
- Core Web Vitals compliance
- WCAG 2.1 AA accessibility
- Mobile-first responsive design
- PWA compliance
- SEO optimization

## Support and Maintenance

### 24/7 Monitoring
- Application performance monitoring
- Infrastructure monitoring
- Security incident response
- Error tracking and alerting
- User experience monitoring

### Maintenance Windows
- Weekly: Security updates
- Monthly: Feature deployments
- Quarterly: Major version updates
- Annually: Infrastructure reviews

### Contact Information
- **DevOps Team**: devops@sembalun.com
- **Security Team**: security@sembalun.com
- **On-call**: +1-XXX-XXX-XXXX

---

*This deployment guide is maintained by the Sembalun DevOps team. Last updated: January 2025.*