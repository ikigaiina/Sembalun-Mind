# Sembalun External Monitor 🔍

> **Completely Independent Monitoring System** - Zero interference with your main Sembalun application

A comprehensive, self-contained monitoring solution for the Sembalun meditation platform. This system operates entirely independently from your main application, providing real-time insights, health checks, performance monitoring, and alerting without any impact on your production app.

## 🚀 Key Features

### 📊 **Complete Independence**
- **Zero App Integration**: No code changes needed in your main Sembalun app
- **External Monitoring**: Monitors your app from the outside like a real user would
- **Self-Contained**: All dependencies and data storage are isolated
- **Non-Intrusive**: No performance impact on your main application

### 🎯 **Comprehensive Monitoring**
- **Real-time Health Checks**: App availability and response time monitoring
- **Performance Metrics**: CPU, memory, disk usage, and system resources
- **User Analytics**: User count, session tracking, engagement metrics
- **Cultural Analytics**: Indonesian cultural feature usage and engagement
- **AI Personalization Insights**: Track AI recommendation system performance
- **Error Monitoring**: Automatic error detection and alerting
- **Uptime Tracking**: Detailed availability and downtime reports

### 🎨 **Beautiful Dashboard**
- **Web-based Interface**: Modern, responsive dashboard
- **Real-time Updates**: Live WebSocket connections for instant updates
- **Interactive Charts**: Performance graphs and trend visualization
- **Alert Management**: Visual alert system with categorization
- **Mobile Friendly**: Works perfectly on all devices
- **Dark Theme**: Beautiful gradient design optimized for monitoring

### 🚨 **Smart Alerting**
- **Multi-channel Alerts**: Email, Telegram, Webhook notifications
- **Intelligent Thresholds**: Smart alerting based on performance patterns
- **Alert Levels**: Error, Warning, Info with different notification rules
- **Rate Limiting**: Prevents alert spam with intelligent grouping
- **Historical Tracking**: Complete alert history and acknowledgment

## 📦 Quick Installation

### Option 1: NPM Global Install (Recommended)
```bash
# Install globally for easy CLI access
npm install -g sembalun-monitor

# Quick setup wizard
sembalun-monitor setup

# Start monitoring
sembalun-monitor start

# Open dashboard
sembalun-monitor dashboard
```

### Option 2: Local Installation
```bash
# Clone or copy the monitoring directory
cd sembalun/monitoring

# Install dependencies
npm install

# Run setup
npm run setup

# Start monitoring
npm start
```

## 🔧 Configuration

### Automatic Setup (Recommended)
```bash
sembalun-monitor setup
```
The setup wizard will guide you through:
- App URL configuration
- Supabase connection settings
- Alert preferences (email, webhook)
- Monitoring intervals
- Port configuration

### Manual Configuration
Create `config/monitor.json`:
```json
{
  "appUrl": "http://localhost:5173",
  "supabaseUrl": "https://your-project.supabase.co",
  "supabaseKey": "your-anon-key",
  "port": 3001,
  "checkInterval": 30000,
  "alerts": {
    "email": true,
    "emailRecipient": "admin@yourapp.com",
    "webhook": true,
    "webhookUrl": "https://hooks.slack.com/your-webhook"
  }
}
```

## 🚀 Usage

### Start Monitoring
```bash
# With default settings
sembalun-monitor start

# With custom config
sembalun-monitor start -c config/monitor.json

# With CLI options
sembalun-monitor start --port 3001 --url http://localhost:5173
```

### Dashboard Access
```bash
# Start dashboard server
sembalun-monitor dashboard

# Access at http://localhost:3002
```

### Check Status
```bash
# Quick status check
sembalun-monitor status

# View logs
sembalun-monitor logs

# Follow logs in real-time
sembalun-monitor logs --follow
```

### Test Connectivity
```bash
# Test all connections
sembalun-monitor test

# Test specific URL
sembalun-monitor test --url https://your-app.vercel.app
```

## 📊 Dashboard Overview

### Main Dashboard (http://localhost:3002)
- **System Health**: Real-time health indicators and uptime status
- **Performance Metrics**: Response times, CPU, memory usage with sparkline charts
- **User Analytics**: User counts, session statistics, engagement metrics
- **Cultural Insights**: Indonesian cultural feature usage and interaction rates
- **AI Personalization**: Recommendation system performance and usage patterns
- **Recent Alerts**: Live alert feed with severity indicators
- **System Logs**: Real-time log streaming with filtering

### API Endpoints (http://localhost:3001)
- `GET /health` - Monitor health check
- `GET /api/metrics` - Current metrics data
- `GET /api/alerts` - Recent alerts
- `GET /api/logs` - System logs
- `GET /api/dashboard` - Complete dashboard data

## 🔍 Monitored Metrics

### Application Health
- **Response Time**: Average and current response times
- **Uptime Percentage**: Availability tracking with downtime reports
- **Error Rate**: HTTP error tracking and analysis
- **Endpoint Health**: Individual endpoint monitoring

### System Performance
- **CPU Usage**: Real-time processor utilization
- **Memory Usage**: RAM consumption and trends
- **Disk Space**: Storage utilization and alerts
- **Network**: Response times and connectivity issues

### User Analytics
- **Active Users**: Current and historical user counts
- **Session Metrics**: Daily meditation sessions and duration
- **Feature Usage**: Most used features and engagement patterns
- **Geographic Distribution**: User location insights (if available)

### Cultural Engagement
- **Regional Preferences**: Javanese, Balinese, Sundanese, Minangkabau usage
- **Cultural Content**: Traditional wisdom, music, and practice engagement
- **Language Usage**: Indonesian vs English preference tracking
- **Cultural Calendar**: Event-based engagement patterns

### AI Personalization
- **Recommendation Accuracy**: AI suggestion success rates
- **Personalization Usage**: Feature adoption and effectiveness
- **Behavioral Patterns**: User journey and preference analysis
- **Model Performance**: AI system health and response times

## 🚨 Alerting System

### Alert Levels
- **🔴 Error**: Critical issues requiring immediate attention
- **🟡 Warning**: Performance degradation or potential issues
- **🔵 Info**: General information and status updates

### Alert Channels
- **Console**: Real-time console notifications
- **Dashboard**: Visual alerts in web interface
- **Email**: Configurable email notifications
- **Webhook**: Slack, Discord, or custom webhook integration
- **Telegram**: Bot notifications (optional)

### Smart Alert Rules
- **Response Time**: Alerts when response time > 3 seconds
- **Error Rate**: Alerts when error rate > 5%
- **System Resources**: CPU > 80%, Memory > 85%, Disk > 90%
- **Uptime**: Alerts for any downtime or connectivity issues
- **User Impact**: Alerts for significant user experience degradation

## 📈 Data Storage

### Local Storage (No External Dependencies)
- **Metrics History**: 30 days of detailed metrics in JSON files
- **Daily Summaries**: Automated daily performance reports
- **Alert History**: Complete alert log with acknowledgment tracking
- **System Logs**: Rotating log files with configurable retention
- **Configuration**: Local config files with encryption options

### File Structure
```
monitoring/
├── logs/                    # All log files
│   ├── combined.log        # General application logs
│   ├── error.log          # Error-specific logs
│   ├── metrics-YYYY-MM-DD.json  # Daily metrics
│   └── daily-summary-YYYY-MM-DD.json  # Daily reports
├── config/                 # Configuration files
│   └── monitor.json       # Main configuration
└── data/                   # Cache and temporary data
```

## 🛠️ Advanced Configuration

### Environment Variables
```bash
# App monitoring
MONITOR_APP_URL=http://localhost:5173
MONITOR_PORT=3001
MONITOR_DASHBOARD_PORT=3002

# Supabase connection
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Monitoring settings
MONITOR_CHECK_INTERVAL=30000
MONITOR_LOG_LEVEL=info

# Alert settings
MONITOR_EMAIL_ENABLED=false
MONITOR_WEBHOOK_ENABLED=false
MONITOR_TELEGRAM_ENABLED=false
```

### Cron Jobs Configuration
```javascript
// Custom monitoring schedule
{
  "healthCheck": "*/30 * * * * *",    // Every 30 seconds
  "detailedMetrics": "*/5 * * * *",   // Every 5 minutes  
  "dailySummary": "0 0 * * *",        // Daily at midnight
  "systemCleanup": "0 2 * * 0"        // Weekly cleanup
}
```

## 🔒 Security Features

### Safe External Monitoring
- **No Code Injection**: No modifications to your main application
- **Read-Only Access**: Only monitors public endpoints and metrics
- **Isolated Data**: All monitoring data stored separately
- **Secure Communication**: HTTPS support and encrypted connections

### Access Control
- **Local Network**: Default configuration for local development
- **Production Ready**: HTTPS and authentication options for production
- **API Key Support**: Optional API key authentication
- **Rate Limiting**: Built-in protection against abuse

## 📱 Production Deployment

### Deploy Monitoring to Separate Server
```bash
# On your monitoring server
git clone your-repo
cd sembalun/monitoring
npm install --production

# Configure for production
sembalun-monitor setup

# Start as service
pm2 start ecosystem.config.js
```

### Production Configuration
```json
{
  "appUrl": "https://your-app.vercel.app",
  "port": 3001,
  "checkInterval": 30000,
  "logLevel": "warn",
  "alerts": {
    "email": true,
    "webhook": true,
    "webhookUrl": "https://hooks.slack.com/services/YOUR/WEBHOOK/URL"
  },
  "security": {
    "httpsOnly": true,
    "apiKey": "your-secure-api-key"
  }
}
```

## 🐛 Troubleshooting

### Common Issues

**Monitor won't start:**
```bash
# Check if ports are available
netstat -an | grep 3001

# Check configuration
sembalun-monitor test

# View detailed logs
sembalun-monitor logs --level error
```

**Dashboard not loading:**
```bash
# Verify dashboard server is running
curl http://localhost:3002

# Check WebSocket connection
# Look for connection errors in browser console
```

**No metrics data:**
```bash
# Test app connectivity
curl -I http://localhost:5173

# Verify Supabase configuration
# Check API keys and permissions
```

**Alerts not working:**
```bash
# Test webhook
curl -X POST https://your-webhook-url -d '{"test": true}'

# Check email configuration
# Verify SMTP settings and credentials
```

## 📚 API Reference

### Monitor API Endpoints

#### GET /health
```json
{
  "status": "healthy",
  "timestamp": "2025-01-08T10:30:00Z",
  "uptime": 3600,
  "version": "1.0.0",
  "metrics": { ... }
}
```

#### GET /api/metrics
```json
{
  "uptime": 1440,
  "responseTime": 250,
  "userCount": 1250,
  "sessionCount": 89,
  "culturalEngagement": 78,
  "aiPersonalizationUsage": 65,
  "systemHealth": {
    "cpu": 45,
    "memory": 62,
    "disk": 23
  }
}
```

#### GET /api/alerts
```json
[
  {
    "id": "1641640200000",
    "level": "warning",
    "message": "High response time: 2500ms",
    "timestamp": "2025-01-08T10:30:00Z",
    "acknowledged": false
  }
]
```

## 🤝 Contributing

This monitoring system is designed to be completely independent and self-contained. Contributions should maintain this principle:

1. **No main app dependencies**: Don't require changes to the Sembalun application
2. **External monitoring only**: Monitor from outside using public APIs
3. **Self-contained**: All dependencies should be in the monitoring package
4. **Zero impact**: No performance impact on the main application

## 📄 License

MIT License - Same as the main Sembalun project.

## 🙏 Support

- **Documentation**: Complete setup guides and troubleshooting
- **Configuration Help**: Setup wizard and validation tools
- **Community**: GitHub discussions and issue tracking
- **Professional Support**: Available for enterprise deployments

---

**Built with 💙 for Sembalun platform monitoring - Completely independent, completely reliable.**

## Quick Commands Reference

```bash
# Installation & Setup
npm install -g sembalun-monitor
sembalun-monitor setup

# Basic Operations
sembalun-monitor start              # Start monitoring
sembalun-monitor dashboard          # Start dashboard
sembalun-monitor status             # Check status
sembalun-monitor test               # Test connectivity

# Advanced Operations  
sembalun-monitor logs --follow      # Follow logs
sembalun-monitor start -c config.json  # Custom config
```