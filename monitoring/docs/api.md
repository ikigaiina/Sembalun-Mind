# API Reference 📡

> **Complete API documentation for Sembalun Monitor**

The Sembalun Monitor provides a comprehensive REST API for accessing monitoring data, managing alerts, and integrating with external systems.

## 🌐 Base URL

```
Development: http://localhost:3001
Production:  https://your-monitor-server.com
```

## 🔐 Authentication

The monitor API supports optional authentication:

### API Key Authentication (Optional)
```bash
# Add API key to requests
curl -H "X-API-Key: your-api-key" http://localhost:3001/api/metrics
```

### Basic Authentication (Optional)
```bash
# Use basic auth if configured
curl -u username:password http://localhost:3001/api/metrics
```

---

## 📊 Core API Endpoints

### Health Check
Get the overall health status of the monitoring system.

**GET** `/health`

```bash
curl http://localhost:3001/health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-08T10:30:00Z",
  "uptime": 3600,
  "version": "1.0.0",
  "metrics": {
    "uptime": 1440,
    "responseTime": 250,
    "userCount": 1250,
    "sessionCount": 89,
    "systemHealth": {
      "cpu": 45,
      "memory": 62,
      "disk": 23
    }
  },
  "services": {
    "monitor": "healthy",
    "dashboard": "healthy",
    "database": "healthy",
    "alerts": "healthy"
  }
}
```

**Status Codes:**
- `200` - System is healthy
- `503` - System has issues

---

## 📈 Metrics API

### Get Current Metrics
Retrieve the latest monitoring metrics.

**GET** `/api/metrics`

```bash
curl http://localhost:3001/api/metrics
```

**Response:**
```json
{
  "timestamp": "2025-01-08T10:30:00Z",
  "uptime": 1440,
  "responseTime": 250,
  "averageResponseTime": 280,
  "errorRate": 0.5,
  "userCount": 1250,
  "sessionCount": 89,
  "culturalEngagement": 78,
  "aiPersonalizationUsage": 65,
  "systemHealth": {
    "cpu": 45,
    "memory": 62,
    "disk": 23,
    "networkLatency": 15
  },
  "appHealth": {
    "status": "online",
    "lastCheck": "2025-01-08T10:29:30Z",
    "consecutiveSuccesses": 48,
    "consecutiveFailures": 0
  }
}
```

### Get Historical Metrics
Retrieve metrics over a time period.

**GET** `/api/metrics/history`

**Query Parameters:**
- `period` - Time period: `1h`, `24h`, `7d`, `30d` (default: `24h`)
- `interval` - Data point interval: `1m`, `5m`, `15m`, `1h` (default: `5m`)
- `metrics` - Comma-separated metric names to include

```bash
# Get last 24 hours with 15-minute intervals
curl "http://localhost:3001/api/metrics/history?period=24h&interval=15m"

# Get specific metrics for last week
curl "http://localhost:3001/api/metrics/history?period=7d&metrics=responseTime,cpu,memory"
```

**Response:**
```json
{
  "period": "24h",
  "interval": "15m",
  "dataPoints": [
    {
      "timestamp": "2025-01-08T09:30:00Z",
      "responseTime": 245,
      "cpu": 42,
      "memory": 58,
      "userCount": 1200
    },
    {
      "timestamp": "2025-01-08T09:45:00Z", 
      "responseTime": 267,
      "cpu": 48,
      "memory": 61,
      "userCount": 1215
    }
  ],
  "summary": {
    "avgResponseTime": 256,
    "maxResponseTime": 320,
    "minResponseTime": 180,
    "avgCpu": 45,
    "maxCpu": 72,
    "uptimePercentage": 99.2
  }
}
```

### Get Performance Summary
Get aggregated performance statistics.

**GET** `/api/metrics/summary`

**Query Parameters:**
- `period` - Time period: `1h`, `24h`, `7d`, `30d` (default: `24h`)

```bash
curl "http://localhost:3001/api/metrics/summary?period=7d"
```

**Response:**
```json
{
  "period": "7d",
  "generatedAt": "2025-01-08T10:30:00Z",
  "performance": {
    "averageResponseTime": 275,
    "medianResponseTime": 250,
    "95thPercentileResponseTime": 450,
    "uptimePercentage": 99.8,
    "totalRequests": 50420,
    "errorRate": 0.3
  },
  "resources": {
    "averageCpu": 52,
    "peakCpu": 89,
    "averageMemory": 68,
    "peakMemory": 91,
    "averageDisk": 25
  },
  "user": {
    "totalUsers": 1250,
    "newUsers": 47,
    "totalSessions": 623,
    "averageSessionDuration": 1200,
    "culturalEngagement": 76,
    "aiUsage": 68
  },
  "trends": {
    "responseTime": "improving",
    "userGrowth": "steady",
    "engagement": "increasing"
  }
}
```

---

## 🚨 Alerts API

### Get Alerts
Retrieve alerts with optional filtering.

**GET** `/api/alerts`

**Query Parameters:**
- `limit` - Maximum number of alerts (default: 100, max: 1000)
- `offset` - Pagination offset (default: 0)
- `severity` - Filter by severity: `critical`, `warning`, `info`
- `acknowledged` - Filter by acknowledgment: `true`, `false`
- `ruleId` - Filter by specific alert rule
- `since` - ISO timestamp to filter alerts after
- `until` - ISO timestamp to filter alerts before

```bash
# Get recent alerts
curl http://localhost:3001/api/alerts

# Get critical alerts only
curl "http://localhost:3001/api/alerts?severity=critical"

# Get unacknowledged alerts
curl "http://localhost:3001/api/alerts?acknowledged=false"

# Get alerts from last hour
curl "http://localhost:3001/api/alerts?since=2025-01-08T09:30:00Z"
```

**Response:**
```json
{
  "alerts": [
    {
      "id": "alert_1641640200000_abc123",
      "ruleId": "high_response_time",
      "severity": "warning",
      "message": "Response time is 2500ms (threshold: 2000ms)",
      "timestamp": "2025-01-08T10:25:00Z",
      "acknowledged": false,
      "rule": {
        "id": "high_response_time",
        "name": "High Response Time",
        "condition": "responseTime > 2000"
      },
      "metrics": {
        "responseTime": 2500,
        "cpu": 68,
        "memory": 72
      }
    }
  ],
  "pagination": {
    "total": 156,
    "limit": 100,
    "offset": 0,
    "hasMore": true
  },
  "summary": {
    "total": 156,
    "critical": 12,
    "warning": 89,
    "info": 55,
    "acknowledged": 134,
    "unacknowledged": 22
  }
}
```

### Create Alert
Manually create an alert.

**POST** `/api/alerts`

**Request Body:**
```json
{
  "severity": "warning",
  "message": "Custom alert message",
  "ruleId": "custom_alert",
  "metadata": {
    "source": "external_system",
    "details": "Additional alert context"
  }
}
```

```bash
curl -X POST http://localhost:3001/api/alerts \
  -H "Content-Type: application/json" \
  -d '{"severity": "warning", "message": "Custom alert"}'
```

**Response:**
```json
{
  "alert": {
    "id": "alert_1641640300000_def456",
    "severity": "warning",
    "message": "Custom alert message",
    "timestamp": "2025-01-08T10:30:00Z",
    "acknowledged": false,
    "metadata": {
      "source": "external_system",
      "details": "Additional alert context"
    }
  }
}
```

### Acknowledge Alert
Mark an alert as acknowledged.

**PUT** `/api/alerts/{alertId}/acknowledge`

```bash
curl -X PUT http://localhost:3001/api/alerts/alert_1641640200000_abc123/acknowledge
```

**Response:**
```json
{
  "alert": {
    "id": "alert_1641640200000_abc123",
    "acknowledged": true,
    "acknowledgedAt": "2025-01-08T10:32:00Z",
    "acknowledgedBy": "api"
  }
}
```

### Get Alert Rules
Retrieve configured alert rules.

**GET** `/api/alerts/rules`

```bash
curl http://localhost:3001/api/alerts/rules
```

**Response:**
```json
{
  "rules": [
    {
      "id": "high_response_time",
      "name": "High Response Time",
      "condition": "responseTime > 2000",
      "severity": "warning",
      "channels": ["console", "webhook"],
      "rateLimitMinutes": 5,
      "enabled": true,
      "description": "Triggers when response time exceeds 2 seconds"
    },
    {
      "id": "critical_cpu",
      "name": "Critical CPU Usage",
      "condition": "systemHealth.cpu > 90",
      "severity": "critical",
      "channels": ["console", "email", "webhook"],
      "rateLimitMinutes": 1,
      "enabled": true
    }
  ]
}
```

---

## 📝 Logs API

### Get Logs
Retrieve system logs with filtering and search.

**GET** `/api/logs`

**Query Parameters:**
- `limit` - Maximum number of log entries (default: 100, max: 1000)
- `offset` - Pagination offset (default: 0)
- `level` - Filter by log level: `error`, `warn`, `info`, `debug`
- `source` - Filter by log source/component
- `search` - Text search in log messages
- `since` - ISO timestamp to filter logs after
- `until` - ISO timestamp to filter logs before

```bash
# Get recent logs
curl http://localhost:3001/api/logs

# Get error logs only
curl "http://localhost:3001/api/logs?level=error"

# Search in logs
curl "http://localhost:3001/api/logs?search=connection&limit=50"

# Get logs from specific time range
curl "http://localhost:3001/api/logs?since=2025-01-08T09:00:00Z&until=2025-01-08T10:00:00Z"
```

**Response:**
```json
{
  "logs": [
    {
      "id": "log_1641640200000_xyz789",
      "timestamp": "2025-01-08T10:30:00Z",
      "level": "info",
      "message": "Health check completed successfully",
      "source": "health-checker",
      "category": "general",
      "metadata": {
        "responseTime": 250,
        "status": "healthy"
      }
    },
    {
      "id": "log_1641640150000_abc456",
      "timestamp": "2025-01-08T10:29:10Z",
      "level": "warn",
      "message": "High CPU usage detected: 85%",
      "source": "system-monitor",
      "category": "performance"
    }
  ],
  "pagination": {
    "total": 2847,
    "limit": 100,
    "offset": 0,
    "hasMore": true
  },
  "summary": {
    "levels": {
      "error": 23,
      "warn": 156,
      "info": 2543,
      "debug": 125
    },
    "sources": {
      "health-checker": 1200,
      "system-monitor": 890,
      "alert-system": 445,
      "log-aggregator": 312
    }
  }
}
```

### Export Logs
Export logs in different formats.

**GET** `/api/logs/export`

**Query Parameters:**
- `format` - Export format: `json`, `csv`, `txt` (default: `json`)
- `since` - Start timestamp
- `until` - End timestamp  
- `level` - Filter by log level
- `compressed` - Return compressed data: `true`, `false`

```bash
# Export as CSV
curl "http://localhost:3001/api/logs/export?format=csv&since=2025-01-08T00:00:00Z" > logs.csv

# Export as plain text
curl "http://localhost:3001/api/logs/export?format=txt&level=error" > error-logs.txt

# Export compressed JSON
curl "http://localhost:3001/api/logs/export?compressed=true" > logs.json.gz
```

---

## 🎯 Dashboard API

### Get Dashboard Data
Retrieve all data needed for the monitoring dashboard.

**GET** `/api/dashboard`

```bash
curl http://localhost:3001/api/dashboard
```

**Response:**
```json
{
  "metrics": {
    "uptime": 1440,
    "responseTime": 250,
    "userCount": 1250,
    "sessionCount": 89,
    "culturalEngagement": 78,
    "systemHealth": {
      "cpu": 45,
      "memory": 62,
      "disk": 23
    }
  },
  "alerts": [
    {
      "id": "alert_recent",
      "severity": "warning",
      "message": "High response time detected",
      "timestamp": "2025-01-08T10:25:00Z"
    }
  ],
  "logs": [
    {
      "timestamp": "2025-01-08T10:30:00Z",
      "level": "info",
      "message": "Health check completed",
      "source": "monitor"
    }
  ],
  "config": {
    "appUrl": "http://localhost:5173",
    "checkInterval": 30000,
    "version": "1.0.0"
  },
  "status": {
    "monitor": "healthy",
    "app": "online",
    "database": "connected",
    "alerts": "active"
  }
}
```

### Get System Status
Get detailed system status information.

**GET** `/api/system/status`

```bash
curl http://localhost:3001/api/system/status
```

**Response:**
```json
{
  "monitor": {
    "status": "healthy",
    "uptime": 3600,
    "version": "1.0.0",
    "processId": 12345,
    "memoryUsage": {
      "rss": 45.2,
      "heapTotal": 12.8,
      "heapUsed": 8.4,
      "external": 1.2
    }
  },
  "app": {
    "url": "http://localhost:5173",
    "status": "online",
    "lastCheck": "2025-01-08T10:29:30Z",
    "responseTime": 250,
    "consecutiveSuccesses": 48
  },
  "database": {
    "type": "supabase",
    "status": "connected",
    "lastQuery": "2025-01-08T10:28:15Z",
    "connectionPool": {
      "active": 3,
      "idle": 2,
      "max": 10
    }
  },
  "system": {
    "platform": "linux",
    "nodeVersion": "20.10.0",
    "cpu": {
      "usage": 45,
      "cores": 8,
      "model": "Intel Core i7"
    },
    "memory": {
      "usage": 62,
      "total": 16384,
      "available": 6226
    },
    "disk": {
      "usage": 23,
      "total": 512000,
      "available": 394240
    }
  }
}
```

---

## 🔧 Configuration API

### Get Configuration
Retrieve current monitoring configuration.

**GET** `/api/config`

```bash
curl http://localhost:3001/api/config
```

**Response:**
```json
{
  "appUrl": "http://localhost:5173",
  "port": 3001,
  "checkInterval": 30000,
  "logLevel": "info",
  "dataRetentionDays": 30,
  "alerts": {
    "email": {
      "enabled": true,
      "recipients": ["admin@example.com"]
    },
    "webhook": {
      "enabled": true,
      "url": "https://hooks.slack.com/services/***"
    }
  },
  "thresholds": {
    "responseTime": {
      "warning": 2000,
      "error": 5000
    },
    "cpu": {
      "warning": 80,
      "error": 90
    }
  }
}
```

### Update Configuration
Update monitoring configuration (requires authentication).

**PUT** `/api/config`

**Request Body:**
```json
{
  "checkInterval": 60000,
  "thresholds": {
    "responseTime": {
      "warning": 3000,
      "error": 6000
    }
  }
}
```

```bash
curl -X PUT http://localhost:3001/api/config \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{"checkInterval": 60000}'
```

---

## 📊 Analytics API

### Get User Analytics
Retrieve user engagement and behavior analytics.

**GET** `/api/analytics/users`

**Query Parameters:**
- `period` - Time period: `24h`, `7d`, `30d` (default: `24h`)
- `breakdown` - Breakdown by: `hour`, `day`, `week`

```bash
curl "http://localhost:3001/api/analytics/users?period=7d&breakdown=day"
```

**Response:**
```json
{
  "period": "7d",
  "summary": {
    "totalUsers": 1250,
    "newUsers": 47,
    "activeUsers": 892,
    "returningUsers": 845,
    "userGrowthRate": 3.9
  },
  "breakdown": [
    {
      "date": "2025-01-02",
      "totalUsers": 1203,
      "newUsers": 8,
      "activeUsers": 756
    },
    {
      "date": "2025-01-03", 
      "totalUsers": 1215,
      "newUsers": 12,
      "activeUsers": 823
    }
  ],
  "engagement": {
    "averageSessionDuration": 1200,
    "sessionsPerUser": 2.3,
    "culturalEngagement": 78,
    "aiPersonalizationUsage": 65
  }
}
```

### Get Cultural Analytics
Retrieve Indonesian cultural feature analytics.

**GET** `/api/analytics/cultural`

```bash
curl http://localhost:3001/api/analytics/cultural
```

**Response:**
```json
{
  "overall": {
    "engagementRate": 78,
    "activeFeatures": 12,
    "totalInteractions": 4582
  },
  "regional": {
    "javanese": {
      "users": 456,
      "engagement": 82,
      "topFeatures": ["wisdom-quotes", "traditional-music", "batik-themes"]
    },
    "balinese": {
      "users": 312,
      "engagement": 79,
      "topFeatures": ["temple-sounds", "pura-ornaments", "hindu-practices"]
    },
    "sundanese": {
      "users": 289,
      "engagement": 75,
      "topFeatures": ["bamboo-music", "mountain-themes", "traditional-stories"]
    },
    "minangkabau": {
      "users": 193,
      "engagement": 71,
      "topFeatures": ["rumah-gadang", "minang-wisdom", "traditional-dances"]
    }
  },
  "features": {
    "wisdom-quotes": {
      "usage": 1823,
      "engagement": 85,
      "languages": {
        "indonesian": 1456,
        "english": 367
      }
    },
    "traditional-music": {
      "usage": 1456,
      "engagement": 78,
      "types": {
        "gamelan": 890,
        "angklung": 345,
        "traditional": 221
      }
    }
  }
}
```

### Get Performance Analytics
Detailed performance metrics and trends.

**GET** `/api/analytics/performance`

```bash
curl "http://localhost:3001/api/analytics/performance?period=30d"
```

**Response:**
```json
{
  "period": "30d",
  "performance": {
    "averageResponseTime": 285,
    "medianResponseTime": 245,
    "95thPercentile": 567,
    "99thPercentile": 892,
    "uptimePercentage": 99.7,
    "errorRate": 0.2
  },
  "trends": {
    "responseTime": {
      "trend": "improving",
      "change": -12.5,
      "significance": "significant"
    },
    "errorRate": {
      "trend": "stable",
      "change": 0.1,
      "significance": "minimal"
    }
  },
  "bottlenecks": [
    {
      "component": "database_queries",
      "impact": "medium",
      "frequency": 0.23,
      "recommendation": "Consider query optimization"
    }
  ],
  "insights": [
    "Response times improved 12.5% this month",
    "Peak usage occurs between 7-9 PM Indonesian time",
    "Cultural features drive 23% longer session durations"
  ]
}
```

---

## 🔌 WebSocket API

The monitoring system provides real-time updates via WebSocket.

### Connection
```javascript
const ws = new WebSocket('ws://localhost:3002');

ws.onopen = function() {
  console.log('Connected to monitor');
};

ws.onmessage = function(event) {
  const message = JSON.parse(event.data);
  handleRealtimeUpdate(message);
};
```

### Message Types

#### Metrics Update
```json
{
  "type": "metrics",
  "data": {
    "responseTime": 250,
    "cpu": 45,
    "memory": 62,
    "timestamp": "2025-01-08T10:30:00Z"
  },
  "timestamp": "2025-01-08T10:30:00Z"
}
```

#### New Alert
```json
{
  "type": "alert", 
  "data": {
    "id": "alert_123",
    "severity": "warning",
    "message": "High CPU usage detected",
    "timestamp": "2025-01-08T10:30:00Z"
  }
}
```

#### New Log Entry
```json
{
  "type": "log",
  "data": {
    "level": "error",
    "message": "Database connection failed",
    "source": "db-connector",
    "timestamp": "2025-01-08T10:30:00Z"
  }
}
```

#### System Status
```json
{
  "type": "status",
  "data": {
    "monitor": "healthy",
    "app": "online", 
    "database": "connected"
  }
}
```

---

## ❌ Error Responses

### Standard Error Format
```json
{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "The request parameters are invalid",
    "details": {
      "field": "period",
      "issue": "Must be one of: 1h, 24h, 7d, 30d"
    },
    "timestamp": "2025-01-08T10:30:00Z",
    "requestId": "req_123456"
  }
}
```

### HTTP Status Codes
- `200` - Success
- `400` - Bad Request (invalid parameters)
- `401` - Unauthorized (missing/invalid API key)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `429` - Rate Limited (too many requests)
- `500` - Internal Server Error
- `503` - Service Unavailable (system overloaded)

### Common Error Codes
```json
{
  "INVALID_REQUEST": "Request parameters are invalid",
  "UNAUTHORIZED": "Authentication required",
  "FORBIDDEN": "Access denied",
  "NOT_FOUND": "Resource not found",
  "RATE_LIMITED": "Too many requests",
  "SYSTEM_ERROR": "Internal system error",
  "SERVICE_UNAVAILABLE": "Service temporarily unavailable"
}
```

---

## 🔐 Rate Limiting

API endpoints are rate limited to ensure system stability:

### Rate Limits
- **Health checks**: 60 requests/minute
- **Metrics**: 30 requests/minute  
- **Alerts**: 20 requests/minute
- **Logs**: 10 requests/minute
- **Analytics**: 5 requests/minute

### Rate Limit Headers
```http
X-RateLimit-Limit: 30
X-RateLimit-Remaining: 27
X-RateLimit-Reset: 1641640260
```

### Rate Limit Response
```json
{
  "error": {
    "code": "RATE_LIMITED",
    "message": "Rate limit exceeded. Try again in 60 seconds.",
    "retryAfter": 60
  }
}
```

---

## 📝 Request Examples

### Using cURL
```bash
# Get current metrics
curl -X GET http://localhost:3001/api/metrics

# Create an alert with data
curl -X POST http://localhost:3001/api/alerts \
  -H "Content-Type: application/json" \
  -d '{"severity": "warning", "message": "Custom alert"}'

# Get filtered logs
curl -G http://localhost:3001/api/logs \
  -d "level=error" \
  -d "limit=50" \
  -d "search=connection"
```

### Using JavaScript
```javascript
// Get metrics
const metrics = await fetch('http://localhost:3001/api/metrics')
  .then(res => res.json());

// Create alert
const alert = await fetch('http://localhost:3001/api/alerts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    severity: 'warning',
    message: 'Custom alert from JavaScript'
  })
}).then(res => res.json());

// Get dashboard data
const dashboard = await fetch('http://localhost:3001/api/dashboard')
  .then(res => res.json());
```

### Using Python
```python
import requests
import json

# Get current metrics
response = requests.get('http://localhost:3001/api/metrics')
metrics = response.json()

# Create an alert  
alert_data = {
    'severity': 'warning',
    'message': 'Custom alert from Python'
}
response = requests.post(
    'http://localhost:3001/api/alerts',
    headers={'Content-Type': 'application/json'},
    json=alert_data
)
alert = response.json()

# Get logs with filtering
params = {
    'level': 'error',
    'limit': 50,
    'search': 'connection'
}
response = requests.get('http://localhost:3001/api/logs', params=params)
logs = response.json()
```

---

This API provides comprehensive access to all monitoring data and functionality. Use it to integrate Sembalun Monitor with your existing tools, create custom dashboards, or build automated monitoring workflows.