# Deployment Guide 🚀

> **Complete production deployment guide for Sembalun Monitor**

This guide covers deploying the Sembalun Monitor system to production environments, from simple VPS deployments to enterprise-grade cloud infrastructures.

## 🎯 Deployment Overview

The Sembalun Monitor is designed to be deployed independently from your main Sembalun application, providing external monitoring capabilities without any interference.

### Deployment Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Sembalun App  │    │  Monitor Server │    │ Dashboard/Alerts│
│   (Production)  │◄───┤   (External)    │◄───┤   (Optional)    │
│                 │    │                 │    │                 │
│ your-app.com    │    │ monitor.app.com │    │ alerts.app.com  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Key Benefits
- ✅ **External Monitoring** - Monitors your app from outside perspective
- ✅ **Zero Interference** - No impact on your main application
- ✅ **Independent Scaling** - Scale monitoring independently
- ✅ **Fault Isolation** - Monitor continues even if app has issues
- ✅ **Multi-App Support** - Can monitor multiple applications

---

## 🌐 Deployment Options

### 1. VPS/Dedicated Server
Deploy to your own server (DigitalOcean, Linode, etc.)

### 2. Cloud Platform
Deploy to cloud platforms (AWS, GCP, Azure, Heroku, Railway)

### 3. Docker Container
Containerized deployment for any platform

### 4. Serverless Functions
Deploy components as serverless functions (Vercel, Netlify)

### 5. Kubernetes Cluster
Enterprise-grade deployment with orchestration

---

## 🖥️ VPS Deployment (Recommended)

### Prerequisites
- Ubuntu 20.04+ or similar Linux distribution
- 2GB+ RAM, 20GB+ disk space
- Node.js 18+ installed
- Domain name (optional but recommended)

### Step 1: Server Preparation
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Create monitoring user
sudo adduser monitoring
sudo usermod -aG sudo monitoring

# Switch to monitoring user
su - monitoring
```

### Step 2: Install Sembalun Monitor
```bash
# Install globally
npm install -g sembalun-monitor

# Create directory structure
mkdir -p ~/sembalun-monitor/{config,logs,data}
cd ~/sembalun-monitor

# Run setup wizard
sembalun-monitor setup
```

### Step 3: Configure for Production
Create `config/monitor.json`:
```json
{
  "appUrl": "https://your-sembalun-app.com",
  "supabaseUrl": "https://your-project.supabase.co",
  "supabaseKey": "your-production-supabase-key",
  "port": 3001,
  "dashboardPort": 3002,
  "logLevel": "warn",
  "checkInterval": 30000,
  "dataRetentionDays": 90,
  "alerts": {
    "email": {
      "enabled": true,
      "smtp": {
        "host": "smtp.gmail.com",
        "port": 587,
        "secure": false,
        "auth": {
          "user": "alerts@yourcompany.com",
          "pass": "your-app-password"
        }
      },
      "recipients": ["admin@yourcompany.com", "dev@yourcompany.com"]
    },
    "webhook": {
      "enabled": true,
      "url": "https://hooks.slack.com/services/YOUR/PRODUCTION/WEBHOOK"
    }
  },
  "security": {
    "apiKey": {
      "enabled": true,
      "key": "your-secure-production-api-key"
    }
  }
}
```

### Step 4: PM2 Process Management
Create `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [
    {
      name: 'sembalun-monitor',
      script: '/home/monitoring/.npm-global/bin/sembalun-monitor',
      args: 'start -c config/monitor.json',
      cwd: '/home/monitoring/sembalun-monitor',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        MONITOR_LOG_LEVEL: 'warn'
      },
      log_file: 'logs/combined.log',
      out_file: 'logs/out.log',
      error_file: 'logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    },
    {
      name: 'sembalun-dashboard',
      script: '/home/monitoring/.npm-global/bin/sembalun-monitor',
      args: 'dashboard --port 3002',
      cwd: '/home/monitoring/sembalun-monitor',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M'
    }
  ]
};
```

Start with PM2:
```bash
# Start applications
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
pm2 startup
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u monitoring --hp /home/monitoring
```

### Step 5: Reverse Proxy with Nginx
```bash
# Install Nginx
sudo apt install nginx

# Create site configuration
sudo nano /etc/nginx/sites-available/sembalun-monitor
```

Nginx configuration:
```nginx
server {
    listen 80;
    server_name monitor.your-domain.com;

    location / {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /health {
        proxy_pass http://localhost:3001;
    }
}
```

Enable site:
```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/sembalun-monitor /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### Step 6: SSL Certificate with Let's Encrypt
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d monitor.your-domain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

### Step 7: Firewall Configuration
```bash
# Configure UFW firewall
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw allow 3001/tcp  # Monitor API (if direct access needed)
sudo ufw status
```

---

## ☁️ Cloud Platform Deployments

### AWS EC2 Deployment

#### Step 1: Launch EC2 Instance
```bash
# Launch t3.small or larger instance
# Ubuntu 20.04 LTS AMI
# Configure security groups:
# - SSH (22) from your IP
# - HTTP (80) from anywhere
# - HTTPS (443) from anywhere
# - Custom TCP (3001, 3002) from specific IPs if needed
```

#### Step 2: Setup Script
```bash
#!/bin/bash
# User data script for EC2

# Update system
apt update && apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Install PM2 and monitoring tools
npm install -g pm2 sembalun-monitor

# Create monitoring user
useradd -m -s /bin/bash monitoring
mkdir -p /home/monitoring/sembalun-monitor/{config,logs,data}
chown -R monitoring:monitoring /home/monitoring

# Install Nginx
apt install -y nginx

# Configure automatic updates
apt install -y unattended-upgrades
dpkg-reconfigure -plow unattended-upgrades
```

### Google Cloud Platform

#### Step 1: Create VM Instance
```bash
# Create instance
gcloud compute instances create sembalun-monitor \
  --zone=us-central1-a \
  --machine-type=e2-medium \
  --image-family=ubuntu-2004-lts \
  --image-project=ubuntu-os-cloud \
  --boot-disk-size=50GB \
  --tags=http-server,https-server

# SSH to instance
gcloud compute ssh sembalun-monitor --zone=us-central1-a
```

#### Step 2: Startup Script
Create `startup-script.sh`:
```bash
#!/bin/bash
cd /opt
git clone https://github.com/your-org/sembalun-monitor-config.git
cd sembalun-monitor-config
./deploy.sh
```

### Heroku Deployment

#### Step 1: Prepare Application
Create `package.json` in deployment directory:
```json
{
  "name": "sembalun-monitor-heroku",
  "version": "1.0.0",
  "description": "Sembalun Monitor on Heroku",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "postinstall": "npm install -g sembalun-monitor"
  },
  "engines": {
    "node": ">=18.0.0"
  },
  "dependencies": {
    "sembalun-monitor": "^1.0.0"
  }
}
```

Create `server.js`:
```javascript
const { spawn } = require('child_process');

const PORT = process.env.PORT || 3001;

// Start monitor with environment configuration
const monitor = spawn('sembalun-monitor', ['start'], {
  env: {
    ...process.env,
    MONITOR_PORT: PORT,
    MONITOR_APP_URL: process.env.SEMBALUN_APP_URL,
    VITE_SUPABASE_URL: process.env.SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: process.env.SUPABASE_KEY
  },
  stdio: 'inherit'
});

monitor.on('error', (error) => {
  console.error('Failed to start monitor:', error);
  process.exit(1);
});
```

Create `Procfile`:
```
web: npm start
```

#### Step 2: Deploy to Heroku
```bash
# Create Heroku app
heroku create sembalun-monitor

# Set environment variables
heroku config:set SEMBALUN_APP_URL=https://your-app.herokuapp.com
heroku config:set SUPABASE_URL=https://your-project.supabase.co
heroku config:set SUPABASE_KEY=your-anon-key

# Deploy
git init
git add .
git commit -m "Initial deployment"
git push heroku main
```

### Railway Deployment

#### Step 1: Prepare for Railway
Create `railway.json`:
```json
{
  "build": {
    "builder": "nixpacks"
  },
  "deploy": {
    "startCommand": "npm install -g sembalun-monitor && sembalun-monitor start",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 300
  }
}
```

#### Step 2: Environment Variables
Set via Railway dashboard:
```
MONITOR_APP_URL=https://your-app.vercel.app
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
MONITOR_LOG_LEVEL=warn
```

---

## 🐳 Docker Deployment

### Dockerfile
```dockerfile
# Use official Node.js runtime
FROM node:20-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Create non-root user
RUN groupadd -r monitoring && useradd -r -g monitoring monitoring

# Install sembalun-monitor globally
RUN npm install -g sembalun-monitor

# Create directories
RUN mkdir -p config logs data && \
    chown -R monitoring:monitoring /app

# Switch to non-root user
USER monitoring

# Copy configuration
COPY --chown=monitoring:monitoring config/ ./config/

# Expose ports
EXPOSE 3001 3002

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

# Start command
CMD ["sembalun-monitor", "start", "-c", "config/monitor.json"]
```

### docker-compose.yml
```yaml
version: '3.8'

services:
  sembalun-monitor:
    build: .
    container_name: sembalun-monitor
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - MONITOR_LOG_LEVEL=warn
    ports:
      - "3001:3001"
      - "3002:3002"
    volumes:
      - ./config:/app/config:ro
      - ./logs:/app/logs
      - ./data:/app/data
    networks:
      - monitoring
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  nginx:
    image: nginx:alpine
    container_name: sembalun-monitor-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - sembalun-monitor
    networks:
      - monitoring

networks:
  monitoring:
    driver: bridge
```

### Deploy with Docker
```bash
# Build and start
docker-compose up -d

# Check logs
docker-compose logs -f sembalun-monitor

# Scale if needed
docker-compose up -d --scale sembalun-monitor=2
```

---

## ☸️ Kubernetes Deployment

### Deployment Manifest
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: sembalun-monitor
  labels:
    app: sembalun-monitor
spec:
  replicas: 2
  selector:
    matchLabels:
      app: sembalun-monitor
  template:
    metadata:
      labels:
        app: sembalun-monitor
    spec:
      containers:
      - name: monitor
        image: sembalun-monitor:latest
        ports:
        - containerPort: 3001
        - containerPort: 3002
        env:
        - name: NODE_ENV
          value: "production"
        - name: MONITOR_APP_URL
          valueFrom:
            configMapKeyRef:
              name: monitor-config
              key: app-url
        - name: VITE_SUPABASE_URL
          valueFrom:
            secretKeyRef:
              name: monitor-secrets
              key: supabase-url
        - name: VITE_SUPABASE_ANON_KEY
          valueFrom:
            secretKeyRef:
              name: monitor-secrets
              key: supabase-key
        resources:
          requests:
            memory: "256Mi"
            cpu: "100m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 5
          periodSeconds: 5
        volumeMounts:
        - name: config
          mountPath: /app/config
        - name: data
          mountPath: /app/data
      volumes:
      - name: config
        configMap:
          name: monitor-config
      - name: data
        persistentVolumeClaim:
          claimName: monitor-data
```

### Service and Ingress
```yaml
apiVersion: v1
kind: Service
metadata:
  name: sembalun-monitor-service
spec:
  selector:
    app: sembalun-monitor
  ports:
    - name: api
      protocol: TCP
      port: 3001
      targetPort: 3001
    - name: dashboard
      protocol: TCP
      port: 3002
      targetPort: 3002
  type: ClusterIP

---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: sembalun-monitor-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  tls:
  - hosts:
    - monitor.your-domain.com
    secretName: monitor-tls
  rules:
  - host: monitor.your-domain.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: sembalun-monitor-service
            port:
              number: 3002
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: sembalun-monitor-service
            port:
              number: 3001
```

---

## 🔒 Production Security

### Security Hardening
1. **API Key Authentication**:
   ```json
   {
     "security": {
       "apiKey": {
         "enabled": true,
         "key": "your-256-bit-secure-key"
       }
     }
   }
   ```

2. **HTTPS Only**:
   ```json
   {
     "security": {
       "httpsOnly": true,
       "cert": "/etc/ssl/certs/monitor.pem",
       "key": "/etc/ssl/private/monitor.key"
     }
   }
   ```

3. **Rate Limiting**:
   ```json
   {
     "rateLimiting": {
       "enabled": true,
       "maxRequests": 100,
       "windowMs": 900000
     }
   }
   ```

4. **CORS Configuration**:
   ```json
   {
     "cors": {
       "enabled": true,
       "origins": [
         "https://monitor.your-domain.com",
         "https://dashboard.your-domain.com"
       ]
     }
   }
   ```

### Environment Variables Security
```bash
# Use environment variables for sensitive data
export MONITOR_API_KEY="your-secure-api-key"
export VITE_SUPABASE_ANON_KEY="your-supabase-key"
export SMTP_PASSWORD="your-email-password"

# Or use a secrets file
echo "MONITOR_API_KEY=your-key" > /etc/sembalun-monitor/secrets
chmod 600 /etc/sembalun-monitor/secrets
```

---

## 📊 Monitoring the Monitor

### Health Monitoring
```bash
# Monitor the monitor with a simple script
#!/bin/bash
MONITOR_URL="http://localhost:3001/health"
ALERT_EMAIL="admin@yourcompany.com"

if ! curl -f -s $MONITOR_URL > /dev/null; then
    echo "Monitor is down!" | mail -s "Monitor Alert" $ALERT_EMAIL
    sudo systemctl restart sembalun-monitor
fi
```

Add to crontab:
```bash
# Check every 5 minutes
*/5 * * * * /home/monitoring/check-monitor.sh
```

### Log Monitoring
```bash
# Set up log rotation
sudo nano /etc/logrotate.d/sembalun-monitor
```

```
/home/monitoring/sembalun-monitor/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 monitoring monitoring
}
```

---

## 🚀 Scaling and Performance

### Horizontal Scaling
```yaml
# Kubernetes HPA
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: sembalun-monitor-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: sembalun-monitor
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

### Load Balancing
```nginx
upstream monitor_backend {
    server localhost:3001;
    server localhost:3011;
    server localhost:3021;
}

server {
    location /api/ {
        proxy_pass http://monitor_backend;
    }
}
```

### Performance Tuning
```json
{
  "performance": {
    "clustering": {
      "enabled": true,
      "workers": 4
    },
    "caching": {
      "enabled": true,
      "ttl": 300000
    },
    "compression": {
      "enabled": true,
      "level": 6
    }
  }
}
```

---

## 🔄 Backup and Disaster Recovery

### Automated Backups
```bash
#!/bin/bash
# Backup script
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/sembalun-monitor"

# Create backup
mkdir -p $BACKUP_DIR/$DATE
cp -r /home/monitoring/sembalun-monitor/config $BACKUP_DIR/$DATE/
cp -r /home/monitoring/sembalun-monitor/data $BACKUP_DIR/$DATE/

# Compress
tar -czf $BACKUP_DIR/monitor-backup-$DATE.tar.gz -C $BACKUP_DIR $DATE
rm -rf $BACKUP_DIR/$DATE

# Cleanup old backups (keep 30 days)
find $BACKUP_DIR -name "monitor-backup-*.tar.gz" -mtime +30 -delete
```

### Disaster Recovery
```bash
#!/bin/bash
# Recovery script
BACKUP_FILE="/backups/sembalun-monitor/monitor-backup-20250108_120000.tar.gz"
RESTORE_DIR="/home/monitoring/sembalun-monitor"

# Stop services
pm2 stop all

# Extract backup
tar -xzf $BACKUP_FILE -C /tmp/
cp -r /tmp/*/config $RESTORE_DIR/
cp -r /tmp/*/data $RESTORE_DIR/

# Restart services
pm2 start all
```

---

This deployment guide provides comprehensive instructions for deploying Sembalun Monitor in production environments. Choose the deployment method that best fits your infrastructure and requirements.