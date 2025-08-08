# Installation Guide 🚀

> **Complete step-by-step installation guide for Sembalun Monitor**

This guide will walk you through installing and setting up the Sembalun Monitor system. Choose the installation method that best fits your needs.

## 📋 Prerequisites

Before installing Sembalun Monitor, ensure you have:

### System Requirements
- **Node.js 18.0+** ([Download here](https://nodejs.org/))
- **npm 8.0+** (comes with Node.js)
- **4GB+ RAM** available for the monitoring system
- **10GB+ disk space** for logs and data storage
- **Network access** to your Sembalun application

### Verify Prerequisites
```bash
# Check Node.js version
node --version  # Should be 18.0 or higher

# Check npm version
npm --version   # Should be 8.0 or higher

# Check available memory
free -h         # Linux
vm_stat         # macOS
systeminfo      # Windows
```

### Sembalun App Information Needed
- **App URL** (e.g., `http://localhost:5173` or `https://your-app.vercel.app`)
- **Supabase URL** from your `.env` file
- **Supabase Anon Key** from your `.env` file

## 🎯 Installation Methods

### Method 1: Global Installation (Recommended)

This is the easiest method and provides the best user experience with CLI commands available system-wide.

```bash
# Install Sembalun Monitor globally
npm install -g sembalun-monitor

# Verify installation
sembalun-monitor --version

# Run interactive setup wizard
sembalun-monitor setup
```

**Benefits:**
- ✅ CLI commands available anywhere
- ✅ Easy to use and manage
- ✅ Automatic updates via npm
- ✅ Clean installation and uninstallation

### Method 2: Local Installation

Install within your existing Sembalun project directory.

```bash
# Navigate to your Sembalun project
cd /path/to/your/sembalun-project

# Clone or copy the monitoring directory
# (Already included in your project at ./monitoring/)

# Navigate to monitoring directory
cd monitoring

# Install dependencies
npm install

# Verify installation
npm run test-install
```

**Benefits:**
- ✅ Keeps everything in one project
- ✅ Version control with your main app
- ✅ Easy to customize and modify
- ✅ No global dependencies

### Method 3: Docker Installation

Run the monitoring system in a Docker container.

```bash
# Build the Docker image
cd monitoring
docker build -t sembalun-monitor .

# Run the container
docker run -d \
  --name sembalun-monitor \
  -p 3001:3001 \
  -p 3002:3002 \
  -v $(pwd)/config:/app/config \
  -v $(pwd)/logs:/app/logs \
  -v $(pwd)/data:/app/data \
  sembalun-monitor
```

**Benefits:**
- ✅ Isolated environment
- ✅ Easy deployment
- ✅ Consistent across platforms
- ✅ Simple scaling

### Method 4: Development Installation

For developers who want to contribute or customize the monitoring system.

```bash
# Clone the repository
git clone https://github.com/your-org/sembalun.git
cd sembalun/monitoring

# Install dependencies including dev dependencies
npm install

# Install development tools
npm run dev-setup

# Run in development mode
npm run dev
```

## ⚙️ Setup Wizard

After installation, run the interactive setup wizard to configure your monitoring system.

### Global Installation Setup
```bash
sembalun-monitor setup
```

### Local Installation Setup
```bash
npm run setup
```

### Setup Wizard Process

The setup wizard will guide you through:

#### 1. Basic Configuration
```
🔧 Sembalun Monitor Setup Wizard

? What is your Sembalun app URL? http://localhost:5173
? What is your Supabase URL? https://your-project.supabase.co
? What is your Supabase anon key? [hidden]
? Health check interval (seconds)? 30
? Monitor server port? 3001
```

#### 2. Alert Configuration
```
📧 Alert Configuration

? Enable email alerts? Yes
? Alert email address: admin@yourapp.com
? Enable webhook alerts (Slack/Discord)? Yes
? Webhook URL: https://hooks.slack.com/services/YOUR/WEBHOOK/URL
? Enable Telegram alerts? No
```

#### 3. Advanced Settings
```
⚡ Advanced Configuration

? Log level (error/warn/info/debug): info
? Data retention (days): 30
? Enable performance monitoring? Yes
? Enable cultural analytics? Yes
? Enable AI personalization tracking? Yes
```

#### 4. Confirmation
```
✅ Configuration Summary:

App URL: http://localhost:5173
Monitor Port: 3001
Dashboard Port: 3002
Alerts: Email, Webhook
Data Retention: 30 days

? Save configuration and start monitoring? Yes
```

## 🔧 Manual Configuration

If you prefer to configure manually, create the configuration files:

### Create Configuration Directory
```bash
mkdir -p config
mkdir -p logs
mkdir -p data
```

### Create Main Configuration File

**File:** `config/monitor.json`
```json
{
  "appUrl": "http://localhost:5173",
  "supabaseUrl": "https://your-project.supabase.co",
  "supabaseKey": "your-supabase-anon-key",
  "port": 3001,
  "dashboardPort": 3002,
  "checkInterval": 30000,
  "logLevel": "info",
  "dataRetentionDays": 30,
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
      "recipients": ["admin@yourapp.com"]
    },
    "webhook": {
      "enabled": true,
      "url": "https://hooks.slack.com/services/YOUR/WEBHOOK/URL"
    },
    "telegram": {
      "enabled": false
    }
  },
  "thresholds": {
    "responseTime": { "warning": 2000, "error": 5000 },
    "cpu": { "warning": 80, "error": 90 },
    "memory": { "warning": 85, "error": 95 }
  }
}
```

### Create Environment File

**File:** `.env.monitor`
```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Monitor Configuration
MONITOR_PORT=3001
MONITOR_DASHBOARD_PORT=3002
MONITOR_APP_URL=http://localhost:5173
MONITOR_LOG_LEVEL=info

# Optional: Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## 🚀 First Run

### Start the Monitoring System

#### Global Installation
```bash
# Start with default configuration
sembalun-monitor start

# Start with custom configuration file
sembalun-monitor start -c config/monitor.json

# Start with CLI options
sembalun-monitor start --port 3001 --url http://localhost:5173
```

#### Local Installation
```bash
# Start monitoring system
npm start

# Start with custom configuration
npm start -- -c config/monitor.json
```

### Start the Dashboard

#### Global Installation
```bash
# In a new terminal window
sembalun-monitor dashboard
```

#### Local Installation
```bash
# In a new terminal window
npm run dashboard
```

### Verify Installation

#### Check System Status
```bash
# Global installation
sembalun-monitor status

# Local installation
npm run status
```

#### Test Connectivity
```bash
# Global installation
sembalun-monitor test

# Local installation
npm run test
```

#### View Live Logs
```bash
# Global installation
sembalun-monitor logs --follow

# Local installation
npm run logs
```

## 🎨 Access the Dashboard

Once everything is running, you can access:

### Web Dashboard
Open your browser and navigate to:
- **Dashboard**: http://localhost:3002
- **API Health**: http://localhost:3001/health
- **API Metrics**: http://localhost:3001/api/metrics

### Expected Dashboard Features
- ✅ **Real-time metrics** updating every 30 seconds
- ✅ **System health indicators** with color-coded status
- ✅ **Performance charts** showing response times
- ✅ **Alert feed** with recent alerts (may be empty initially)
- ✅ **Live logs** streaming in real-time

## 🐛 Troubleshooting Installation

### Common Installation Issues

#### Node.js Version Error
```bash
# Error: Node.js version too old
# Solution: Update Node.js
curl -fsSL https://nodejs.org/dist/v20.10.0/node-v20.10.0-linux-x64.tar.xz | tar -xJ
```

#### Permission Errors (Global Installation)
```bash
# Error: Permission denied
# Solution: Use npm's recommended approach
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

#### Port Already in Use
```bash
# Error: Port 3001 already in use
# Solution: Check what's using the port
lsof -i :3001  # Linux/macOS
netstat -ano | findstr :3001  # Windows

# Kill the process or use different ports
sembalun-monitor start --port 3005
```

#### Supabase Connection Error
```bash
# Error: Failed to connect to Supabase
# Solution: Verify your configuration
curl -H "apikey: YOUR_ANON_KEY" https://your-project.supabase.co/rest/v1/
```

#### Missing Dependencies
```bash
# Error: Module not found
# Solution: Clear cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Verify Successful Installation

Run this comprehensive test to verify everything is working:

```bash
# Global installation test
sembalun-monitor test --verbose

# Local installation test  
npm run test:integration
```

**Expected output:**
```
🧪 Testing Sembalun Monitor Connectivity

✓ App Connectivity: Available (200ms)
✓ Monitor API: Healthy (150ms)
✓ Dashboard: Available (300ms)
✓ WebSocket: Connected
✓ Supabase: Connected
✓ Log System: Working
✓ Alert System: Ready

🎉 All systems operational!
```

## 📚 Next Steps

After successful installation:

1. **📊 Explore the Dashboard** - Familiarize yourself with the monitoring interface
2. **🚨 Configure Alerts** - Set up email and webhook notifications
3. **📝 Review Logs** - Check the log output for any issues
4. **⚙️ Customize Settings** - Adjust thresholds and monitoring intervals
5. **🚀 Production Setup** - If ready, deploy to production environment

### Recommended Reading
- **[Configuration Guide](./configuration.md)** - Detailed configuration options
- **[Dashboard Manual](./dashboard.md)** - How to use the monitoring dashboard
- **[Alert Setup](./alerts.md)** - Advanced alert configuration
- **[Deployment Guide](./deployment.md)** - Production deployment instructions

## 🆘 Getting Help

If you encounter issues during installation:

1. **Check the logs**: `sembalun-monitor logs --level error`
2. **Review configuration**: Ensure all URLs and keys are correct
3. **Test connectivity**: Use `sembalun-monitor test` to diagnose issues
4. **Check documentation**: Review the [Troubleshooting Guide](./troubleshooting.md)
5. **Community support**: Ask questions in GitHub Discussions
6. **Report bugs**: Create an issue on GitHub with detailed information

---

**Installation Complete!** 🎉

Your Sembalun Monitor is now ready to keep an eye on your meditation application. The system will monitor your app's health, performance, and user engagement without any interference with your main application.

**Next:** Check out the [Quick Start Guide](./quickstart.md) to learn the essential monitoring workflows.