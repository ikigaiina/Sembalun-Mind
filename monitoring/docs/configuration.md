# Configuration Guide ⚙️

> **Complete configuration reference for Sembalun Monitor**

This guide covers all configuration options for the Sembalun Monitor system, from basic settings to advanced customization.

## 📋 Configuration Overview

The Sembalun Monitor uses a layered configuration system:

1. **Default Settings** - Built-in defaults for all options
2. **Configuration File** - JSON configuration file
3. **Environment Variables** - Override via environment
4. **CLI Arguments** - Runtime parameter overrides
5. **Interactive Setup** - Wizard-generated configuration

### Configuration Priority
```
CLI Arguments > Environment Variables > Config File > Defaults
```

---

## 🚀 Quick Configuration

### Using the Setup Wizard (Recommended)
```bash
# Global installation
sembalun-monitor setup

# Local installation
npm run setup
```

The setup wizard creates a complete configuration file with all necessary settings.

### Manual Configuration
Create `config/monitor.json` with your settings:

```json
{
  "appUrl": "http://localhost:5173",
  "supabaseUrl": "https://your-project.supabase.co",
  "supabaseKey": "your-anon-key",
  "port": 3001,
  "checkInterval": 30000,
  "alerts": {
    "email": { "enabled": false },
    "webhook": { "enabled": false }
  }
}
```

---

## 📁 Configuration Files

### Main Configuration File
**Location:** `config/monitor.json`

This is the primary configuration file containing all monitor settings.

### Environment Configuration
**Location:** `.env.monitor`

Environment variables for sensitive data and deployment-specific settings.

### Alert Rules Configuration
**Location:** `config/alert-rules.json`

Custom alert rules and thresholds (auto-generated if not present).

### Example File Structure
```
monitoring/
├── config/
│   ├── monitor.json           # Main configuration
│   ├── alert-rules.json      # Alert rules
│   └── monitor.example.json  # Example configuration
├── .env.monitor              # Environment variables
└── logs/                     # Log files
```

---

## 🔧 Core Configuration Options

### Application Monitoring
Configure what application to monitor and how.

```json
{
  "appUrl": "http://localhost:5173",
  "supabaseUrl": "https://your-project.supabase.co",
  "supabaseKey": "your-supabase-anon-key",
  "checkInterval": 30000,
  "timeout": 10000,
  "retries": 3,
  "endpoints": [
    "/",
    "/dashboard",
    "/meditation", 
    "/profile",
    "/settings"
  ]
}
```

**Options:**
- `appUrl` - URL of your Sembalun application
- `supabaseUrl` - Supabase project URL
- `supabaseKey` - Supabase anonymous key
- `checkInterval` - Health check interval in milliseconds (default: 30000)
- `timeout` - Request timeout in milliseconds (default: 10000)  
- `retries` - Number of retry attempts (default: 3)
- `endpoints` - Specific endpoints to monitor (optional)

### Server Configuration
Configure the monitoring server and dashboard.

```json
{
  "port": 3001,
  "dashboardPort": 3002,
  "host": "localhost",
  "cors": {
    "enabled": true,
    "origins": ["http://localhost:3002", "http://localhost:3000"]
  },
  "compression": true,
  "rateLimiting": {
    "enabled": true,
    "maxRequests": 100,
    "windowMs": 900000
  }
}
```

**Options:**
- `port` - Monitor server port (default: 3001)
- `dashboardPort` - Dashboard server port (default: 3002)
- `host` - Bind address (default: "localhost")
- `cors` - CORS configuration for API access
- `compression` - Enable gzip compression (default: true)
- `rateLimiting` - API rate limiting settings

### Data Management
Configure data storage and retention.

```json
{
  "dataRetentionDays": 30,
  "maxAlerts": 10000,
  "maxLogs": 50000,
  "logLevel": "info",
  "logRotation": {
    "enabled": true,
    "maxSize": "10MB",
    "maxFiles": 5
  },
  "backup": {
    "enabled": true,
    "interval": "0 2 * * *",
    "retention": 7
  }
}
```

**Options:**
- `dataRetentionDays` - Days to keep historical data (default: 30)
- `maxAlerts` - Maximum alerts to store in memory (default: 10000)
- `maxLogs` - Maximum log entries to store in memory (default: 50000)
- `logLevel` - Logging level: error, warn, info, debug (default: "info")
- `logRotation` - Log file rotation settings
- `backup` - Automated backup configuration

---

## 🚨 Alert Configuration

### Email Alerts
Configure SMTP email notifications.

```json
{
  "alerts": {
    "email": {
      "enabled": true,
      "smtp": {
        "host": "smtp.gmail.com",
        "port": 587,
        "secure": false,
        "auth": {
          "user": "your-email@gmail.com",
          "pass": "your-app-password"
        }
      },
      "recipients": [
        "admin@yourapp.com",
        "alerts@yourteam.com"
      ],
      "subject": "Sembalun Monitor Alert - {{severity}}",
      "template": "default"
    }
  }
}
```

**Gmail Setup:**
1. Enable 2-Factor Authentication
2. Generate App Password: Google Account → Security → App passwords
3. Use the app password (not your regular password)

**Other SMTP Providers:**
```json
{
  "smtp": {
    "host": "smtp.sendgrid.net",        // SendGrid
    "port": 587,
    "auth": {
      "user": "apikey",
      "pass": "your-sendgrid-api-key"
    }
  }
}
```

### Webhook Alerts
Configure Slack, Discord, or custom webhook notifications.

```json
{
  "alerts": {
    "webhook": {
      "enabled": true,
      "url": "https://hooks.slack.com/services/YOUR/WEBHOOK/URL",
      "method": "POST",
      "headers": {
        "Content-Type": "application/json",
        "Authorization": "Bearer your-token"
      },
      "template": {
        "text": "🚨 Sembalun Alert: {{message}}",
        "attachments": [{
          "color": "{{#if (eq severity 'critical')}}danger{{else}}warning{{/if}}",
          "fields": [
            {
              "title": "Severity",
              "value": "{{severity}}",
              "short": true
            },
            {
              "title": "Time",
              "value": "{{timestamp}}",
              "short": true
            }
          ]
        }]
      }
    }
  }
}
```

**Slack Webhook Setup:**
1. Go to your Slack workspace settings
2. Create a new Incoming Webhook
3. Choose the channel for alerts
4. Copy the webhook URL

**Discord Webhook Setup:**
1. Go to your Discord server settings
2. Navigate to Integrations → Webhooks
3. Create a webhook for your alerts channel
4. Copy the webhook URL

### Telegram Alerts
Configure Telegram bot notifications.

```json
{
  "alerts": {
    "telegram": {
      "enabled": true,
      "botToken": "123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11",
      "chatId": "-1001234567890",
      "parseMode": "HTML"
    }
  }
}
```

**Telegram Bot Setup:**
1. Message @BotFather on Telegram
2. Create a new bot: `/newbot`
3. Get your bot token
4. Add bot to your group and get chat ID

### Alert Rules Configuration
Define custom alert conditions and thresholds.

```json
{
  "thresholds": {
    "responseTime": {
      "warning": 2000,
      "error": 5000
    },
    "cpu": {
      "warning": 80,
      "error": 90
    },
    "memory": {
      "warning": 85,
      "error": 95
    },
    "disk": {
      "warning": 85,
      "error": 95
    },
    "errorRate": {
      "warning": 5,
      "error": 10
    },
    "uptime": {
      "warning": 95,
      "error": 90
    }
  }
}
```

**Custom Alert Rules:**
```json
{
  "customRules": [
    {
      "id": "low_cultural_engagement",
      "name": "Low Cultural Engagement",
      "condition": "culturalEngagement < 50",
      "severity": "warning",
      "channels": ["console", "webhook"],
      "rateLimitMinutes": 30,
      "enabled": true
    },
    {
      "id": "high_session_count",
      "name": "High Session Activity",
      "condition": "sessionCount > 500",
      "severity": "info", 
      "channels": ["console"],
      "rateLimitMinutes": 60,
      "enabled": true
    }
  ]
}
```

---

## 🔍 Monitoring Configuration

### Metrics Collection
Configure which metrics to collect and how often.

```json
{
  "monitoring": {
    "healthCheck": {
      "enabled": true,
      "interval": 30000,
      "timeout": 10000,
      "retries": 3
    },
    "systemMetrics": {
      "enabled": true,
      "interval": 10000,
      "includeNetwork": true,
      "includeProcesses": false
    },
    "userAnalytics": {
      "enabled": true,
      "interval": 300000,
      "includeDemographics": false
    },
    "culturalMetrics": {
      "enabled": true,
      "interval": 300000,
      "trackRegionalPreferences": true,
      "trackLanguageUsage": true
    },
    "aiMetrics": {
      "enabled": true,
      "interval": 300000,
      "trackRecommendations": true,
      "trackPersonalization": true
    }
  }
}
```

**Intervals:**
- `healthCheck` - App availability checks
- `systemMetrics` - CPU, memory, disk usage
- `userAnalytics` - User counts and sessions
- `culturalMetrics` - Indonesian feature usage
- `aiMetrics` - AI personalization performance

### Database Monitoring
Configure Supabase database monitoring.

```json
{
  "database": {
    "enabled": true,
    "connectionTimeout": 5000,
    "queryTimeout": 10000,
    "monitorTables": [
      "users",
      "meditation_sessions",
      "cairn_progress",
      "user_streaks",
      "cultural_interactions",
      "personalization_events"
    ],
    "customQueries": {
      "dailyActiveUsers": {
        "query": "SELECT COUNT(DISTINCT user_id) FROM user_sessions WHERE created_at > NOW() - INTERVAL '24 hours'",
        "interval": 3600000
      },
      "culturalEngagement": {
        "query": "SELECT COUNT(*) FROM cultural_interactions WHERE created_at > NOW() - INTERVAL '24 hours'",
        "interval": 3600000
      }
    }
  }
}
```

### Performance Monitoring
Configure detailed performance tracking.

```json
{
  "performance": {
    "enableMetrics": true,
    "trackResponseTimes": true,
    "trackUserJourneys": true,
    "trackErrors": true,
    "sampling": {
      "enabled": true,
      "rate": 0.1
    },
    "benchmarking": {
      "enabled": true,
      "interval": "0 */6 * * *",
      "endpoints": ["/", "/dashboard", "/meditation"],
      "iterations": 10
    }
  }
}
```

---

## 🔒 Security Configuration

### Authentication and Authorization
Configure API security settings.

```json
{
  "security": {
    "apiKey": {
      "enabled": false,
      "key": "your-secure-api-key"
    },
    "basicAuth": {
      "enabled": false,
      "username": "admin",
      "password": "secure-password"
    },
    "jwt": {
      "enabled": false,
      "secret": "your-jwt-secret",
      "expiresIn": "24h"
    },
    "https": {
      "enabled": false,
      "cert": "path/to/cert.pem",
      "key": "path/to/key.pem"
    },
    "cors": {
      "enabled": true,
      "origins": ["http://localhost:3002"],
      "methods": ["GET", "POST", "PUT", "DELETE"],
      "allowHeaders": ["Content-Type", "Authorization", "X-API-Key"]
    }
  }
}
```

### Data Privacy
Configure data handling and privacy settings.

```json
{
  "privacy": {
    "anonymizeUserData": true,
    "excludePersonalInfo": true,
    "dataRetentionDays": 30,
    "enableGDPRCompliance": true,
    "logPersonalData": false,
    "encryptSensitiveData": true
  }
}
```

---

## 🌍 Environment Variables

Use environment variables for sensitive configuration or deployment-specific settings.

### Core Environment Variables
```bash
# Application Configuration
MONITOR_APP_URL=http://localhost:5173
MONITOR_PORT=3001
MONITOR_DASHBOARD_PORT=3002
MONITOR_LOG_LEVEL=info

# Supabase Configuration  
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Monitoring Configuration
MONITOR_CHECK_INTERVAL=30000
MONITOR_DATA_RETENTION_DAYS=30
MONITOR_ENABLE_ALERTS=true

# Security
MONITOR_API_KEY=your-api-key
MONITOR_JWT_SECRET=your-jwt-secret
```

### Alert Configuration
```bash
# Email Alerts
ALERT_EMAIL_ENABLED=true
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
ALERT_EMAIL_RECIPIENTS=admin@example.com,alerts@example.com

# Webhook Alerts
ALERT_WEBHOOK_ENABLED=true
WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL

# Telegram Alerts
ALERT_TELEGRAM_ENABLED=false
TELEGRAM_BOT_TOKEN=your-bot-token
TELEGRAM_CHAT_ID=your-chat-id
```

### Production Environment
```bash
# Production Settings
NODE_ENV=production
MONITOR_LOG_LEVEL=warn
MONITOR_ENABLE_COMPRESSION=true
MONITOR_ENABLE_RATE_LIMITING=true

# Security
MONITOR_ENABLE_HTTPS=true
MONITOR_CERT_PATH=/path/to/cert.pem
MONITOR_KEY_PATH=/path/to/key.pem

# Performance
MONITOR_MAX_MEMORY=2048
MONITOR_WORKER_PROCESSES=4
```

---

## 🎯 Advanced Configuration

### Custom Metrics
Define custom metrics specific to your Sembalun application.

```json
{
  "customMetrics": {
    "meditationCompletionRate": {
      "query": "SELECT (COUNT(CASE WHEN completed = true THEN 1 END) * 100.0 / COUNT(*)) FROM meditation_sessions WHERE created_at > NOW() - INTERVAL '24 hours'",
      "interval": 300000,
      "threshold": {
        "warning": 70,
        "error": 50
      }
    },
    "userRetentionRate": {
      "query": "SELECT retention_rate FROM user_retention_view WHERE period = '7d'",
      "interval": 3600000,
      "threshold": {
        "warning": 60,
        "error": 40
      }
    },
    "averageSessionDuration": {
      "query": "SELECT AVG(duration_minutes) FROM meditation_sessions WHERE created_at > NOW() - INTERVAL '24 hours'",
      "interval": 300000,
      "threshold": {
        "warning": 10,
        "error": 5
      }
    }
  }
}
```

### Plugin Configuration
Configure custom monitoring plugins.

```json
{
  "plugins": {
    "enabled": true,
    "directory": "plugins/",
    "autoLoad": true,
    "plugins": [
      {
        "name": "cultural-analytics",
        "enabled": true,
        "config": {
          "trackRegions": ["java", "bali", "sunda", "minang"],
          "trackLanguages": ["id", "en"]
        }
      },
      {
        "name": "ai-insights",
        "enabled": true,
        "config": {
          "modelEndpoint": "http://localhost:8000/predict",
          "updateInterval": 3600000
        }
      }
    ]
  }
}
```

### Multi-Environment Configuration
Configure different settings for different environments.

```json
{
  "environments": {
    "development": {
      "appUrl": "http://localhost:5173",
      "port": 3001,
      "logLevel": "debug",
      "alerts": {
        "email": { "enabled": false },
        "webhook": { "enabled": false }
      }
    },
    "staging": {
      "appUrl": "https://sembalun-staging.vercel.app",
      "port": 3001,
      "logLevel": "info",
      "alerts": {
        "email": { "enabled": true },
        "webhook": { "enabled": true }
      }
    },
    "production": {
      "appUrl": "https://sembalun.app",
      "port": 3001,
      "logLevel": "warn",
      "alerts": {
        "email": { "enabled": true },
        "webhook": { "enabled": true },
        "telegram": { "enabled": true }
      }
    }
  }
}
```

---

## ⚡ Performance Configuration

### Optimization Settings
Configure performance optimizations.

```json
{
  "performance": {
    "caching": {
      "enabled": true,
      "ttl": 300000,
      "maxSize": 1000
    },
    "compression": {
      "enabled": true,
      "level": 6,
      "threshold": 1024
    },
    "clustering": {
      "enabled": false,
      "workers": "auto"
    },
    "memoryManagement": {
      "maxOldSpaceSize": 2048,
      "gcInterval": 300000
    }
  }
}
```

### Resource Limits
Configure resource usage limits.

```json
{
  "limits": {
    "maxConnections": 1000,
    "maxRequestsPerMinute": 100,
    "maxMemoryUsage": "2GB",
    "maxDiskUsage": "10GB",
    "maxLogFileSize": "100MB",
    "maxAlertHistory": 10000
  }
}
```

---

## 🔧 Configuration Validation

### Validate Configuration
```bash
# Global installation
sembalun-monitor config --validate

# Local installation
npm run config:validate
```

### Test Configuration
```bash
# Test specific configuration file
sembalun-monitor test --config config/monitor.json

# Test environment-specific config
NODE_ENV=production sembalun-monitor test
```

### Configuration Schema
The monitor uses JSON Schema validation. Check `schemas/config.schema.json` for the complete specification.

---

## 🚀 Configuration Examples

### Minimal Configuration
```json
{
  "appUrl": "http://localhost:5173",
  "supabaseUrl": "https://your-project.supabase.co",
  "supabaseKey": "your-anon-key"
}
```

### Development Configuration
```json
{
  "appUrl": "http://localhost:5173",
  "supabaseUrl": "https://your-project.supabase.co", 
  "supabaseKey": "your-anon-key",
  "port": 3001,
  "logLevel": "debug",
  "checkInterval": 30000,
  "alerts": {
    "email": { "enabled": false },
    "webhook": { "enabled": false }
  }
}
```

### Production Configuration
```json
{
  "appUrl": "https://sembalun.app",
  "supabaseUrl": "https://your-project.supabase.co",
  "supabaseKey": "your-anon-key", 
  "port": 3001,
  "logLevel": "warn",
  "checkInterval": 30000,
  "dataRetentionDays": 90,
  "alerts": {
    "email": {
      "enabled": true,
      "recipients": ["admin@sembalun.app", "alerts@sembalun.app"]
    },
    "webhook": {
      "enabled": true,
      "url": "https://hooks.slack.com/services/YOUR/WEBHOOK/URL"
    }
  },
  "security": {
    "apiKey": {
      "enabled": true,
      "key": "${MONITOR_API_KEY}"
    },
    "https": {
      "enabled": true,
      "cert": "/etc/ssl/cert.pem", 
      "key": "/etc/ssl/key.pem"
    }
  },
  "performance": {
    "caching": { "enabled": true },
    "compression": { "enabled": true },
    "clustering": { "enabled": true, "workers": 4 }
  }
}
```

---

## 🔄 Configuration Updates

### Runtime Configuration Updates
Some settings can be updated without restarting the monitor:

```bash
# Update check interval
sembalun-monitor config --set checkInterval=60000

# Update alert thresholds
sembalun-monitor config --set thresholds.responseTime.warning=3000

# Enable/disable specific alerts
sembalun-monitor config --set alerts.email.enabled=true
```

### Configuration Reloading
```bash
# Reload configuration from file
sembalun-monitor config --reload

# Reload specific configuration section
sembalun-monitor config --reload alerts
```

---

This comprehensive configuration guide covers all aspects of customizing your Sembalun Monitor. Start with the basic configuration and gradually add advanced features as needed. The setup wizard is always available to help generate proper configuration files.