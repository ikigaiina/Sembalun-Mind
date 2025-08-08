# Quick Start Guide ⚡

> **Get Sembalun Monitor up and running in 5 minutes**

This guide will get you monitoring your Sembalun application as quickly as possible. Perfect for first-time users who want to see results immediately.

## 🎯 5-Minute Quick Start

### Step 1: Install (30 seconds)
```bash
# Install globally
npm install -g sembalun-monitor

# Verify installation
sembalun-monitor --version
```

### Step 2: Setup (2 minutes)
```bash
# Run interactive setup
sembalun-monitor setup
```

**Quick Setup Answers:**
```
App URL: http://localhost:5173          # Your Sembalun app
Supabase URL: [your-supabase-url]       # From your .env file
Supabase Key: [your-anon-key]           # From your .env file
Check interval: 30                      # Default 30 seconds
Monitor port: 3001                      # Default port
Enable email alerts: No                 # Skip for quick start
Enable webhook alerts: No               # Skip for quick start
```

### Step 3: Start Monitoring (30 seconds)
```bash
# Start the monitor
sembalun-monitor start
```

**Expected Output:**
```
🚀 Sembalun Monitor Dashboard
=====================================
✓ Monitor Server: http://localhost:3001
✓ WebSocket: ws://localhost:3002  
✓ Dashboard: http://localhost:3001/dashboard
✓ Health Check: http://localhost:3001/health
=====================================
⚡ Monitoring: http://localhost:5173
⏱️ Check Interval: 30s
📊 Version: 1.0.0
```

### Step 4: Open Dashboard (30 seconds)
```bash
# In a new terminal
sembalun-monitor dashboard

# Then open browser to:
# http://localhost:3002
```

### Step 5: Verify Everything Works (1 minute)
```bash
# Check status
sembalun-monitor status

# Test connectivity
sembalun-monitor test
```

🎉 **Done!** Your monitoring system is now running and tracking your Sembalun app.

---

## 🎨 What You'll See

### Dashboard Overview
When you open `http://localhost:3002`, you'll see:

#### System Health Panel 💚
- **Uptime**: Shows how long your app has been responding
- **Response Time**: Current and average response times
- **CPU Usage**: System resource utilization
- **Memory Usage**: RAM consumption tracking

#### User Analytics Panel 👥
- **Total Users**: Current user count from Supabase
- **Daily Sessions**: Meditation sessions today
- **Cultural Engagement**: Indonesian feature usage
- **AI Personalization**: Recommendation system activity

#### Performance Chart 📊
- **Real-time Response Time**: Live performance graph
- **Trends**: Performance over time
- **Alerts**: Any performance issues

#### Recent Alerts Panel 🚨
- **Live Alert Feed**: Real-time notifications
- **Severity Levels**: Color-coded alert importance
- **Alert History**: Recent system events

#### System Logs Panel 📝
- **Live Log Stream**: Real-time log output
- **Log Filtering**: Filter by level (error, warn, info)
- **Search**: Find specific log entries

### Key Metrics You'll Monitor

```
Health Monitoring:
├── 🟢 App Status: Online/Offline
├── ⏱️  Response Time: <1000ms (Good)
├── 📈 Uptime: 99.9%
└── 🔍 Error Rate: <1%

System Resources:  
├── 🖥️  CPU: 45% (Normal)
├── 💾 Memory: 62% (Good)
├── 💿 Disk: 23% (Good)
└── 🌐 Network: Healthy

User Activity:
├── 👥 Users: 1,247 total
├── 🧘 Sessions: 89 today
├── 🎭 Cultural: 78% engagement
└── 🤖 AI Usage: 65% adoption
```

---

## 🔧 Essential Commands

### Basic Operations
```bash
# Start monitoring
sembalun-monitor start

# Stop monitoring  
# Press Ctrl+C or close terminal

# Check status
sembalun-monitor status

# View logs
sembalun-monitor logs

# Test connectivity
sembalun-monitor test
```

### Dashboard Commands
```bash
# Start dashboard server
sembalun-monitor dashboard

# Access dashboard
open http://localhost:3002    # macOS
start http://localhost:3002   # Windows  
xdg-open http://localhost:3002 # Linux
```

### Configuration Commands
```bash
# Re-run setup wizard
sembalun-monitor setup

# Start with custom config
sembalun-monitor start -c config/custom.json

# Change ports
sembalun-monitor start --port 3005
sembalun-monitor dashboard --port 3006
```

---

## 🚨 Setting Up Alerts (Optional)

### Email Alerts Setup
```bash
# Re-run setup to add email alerts
sembalun-monitor setup

# Answer "Yes" to email alerts
# Provide Gmail app password (not your regular password)
```

**Gmail App Password Setup:**
1. Enable 2FA on your Google account
2. Go to Google Account Settings > Security > 2-Step Verification
3. Generate an "App password" for "Mail"
4. Use this app password in the setup wizard

### Slack/Discord Webhook Setup
```bash
# Re-run setup to add webhook alerts
sembalun-monitor setup

# Answer "Yes" to webhook alerts
# Provide your webhook URL
```

**Slack Webhook Setup:**
1. Go to your Slack workspace settings
2. Create a new webhook for your channel
3. Copy the webhook URL
4. Paste it in the setup wizard

---

## 📊 Understanding Your First Metrics

### What's Normal?
```
✅ Good Performance:
├── Response Time: <1000ms
├── CPU Usage: <70%
├── Memory Usage: <80%
├── Error Rate: <2%
└── Uptime: >99%

⚠️ Watch These:
├── Response Time: 1000-3000ms
├── CPU Usage: 70-85%
├── Memory Usage: 80-90%
├── Error Rate: 2-5%
└── Uptime: 95-99%

🚨 Investigate:
├── Response Time: >3000ms
├── CPU Usage: >85%
├── Memory Usage: >90%
├── Error Rate: >5%
└── Uptime: <95%
```

### Cultural Metrics Explained
```
Cultural Engagement: Percentage of users interacting with:
├── Indonesian wisdom quotes
├── Traditional meditation practices  
├── Regional themes (Javanese, Balinese, etc.)
└── Cultural calendar events

AI Personalization: Percentage of users with:
├── Active recommendation systems
├── Personalized content delivery
├── Behavioral analytics tracking
└── Adaptive meditation suggestions
```

---

## 🐛 Quick Troubleshooting

### App Not Responding?
```bash
# Check if your Sembalun app is running
curl -I http://localhost:5173

# If not, start your Sembalun app
cd /path/to/sembalun
npm run dev
```

### Monitor Not Starting?
```bash
# Check if ports are free
lsof -i :3001    # Linux/macOS
netstat -an | findstr :3001  # Windows

# Start on different port
sembalun-monitor start --port 3005
```

### Dashboard Not Loading?
```bash
# Make sure dashboard server is running
sembalun-monitor dashboard

# Check browser console for errors
# Try refreshing the page
```

### No Metrics Showing?
```bash
# Verify Supabase connection
sembalun-monitor test

# Check configuration
cat config/monitor.json

# Review logs for errors
sembalun-monitor logs --level error
```

### Connection Issues?
```bash
# Test all connections
sembalun-monitor test --verbose

# Check firewall settings
# Verify URLs and API keys
```

---

## 🎯 Next Steps

Now that you have basic monitoring running:

### Immediate Actions (Next 10 minutes)
1. **🔍 Explore Dashboard** - Click through all the panels
2. **📊 Watch Live Updates** - See metrics update in real-time
3. **🧪 Test Alerts** - Temporarily stop your app to see alerts
4. **📝 Check Logs** - Review the log output for your app

### This Week
1. **🚨 Set Up Alerts** - Configure email or Slack notifications
2. **⚙️ Customize Thresholds** - Adjust alert sensitivity
3. **📈 Baseline Performance** - Learn your app's normal metrics
4. **🎭 Understand Cultural Metrics** - See which features are used most

### This Month  
1. **📊 Performance Trends** - Identify patterns in your data
2. **🔧 Optimize Based on Data** - Use insights to improve your app
3. **🚀 Production Deployment** - Set up monitoring in production
4. **📚 Advanced Features** - Explore custom rules and plugins

---

## 📚 Learn More

### Essential Reading
- **[Dashboard Manual](./dashboard.md)** - Detailed dashboard guide
- **[Configuration Guide](./configuration.md)** - Advanced configuration options
- **[Alert Setup](./alerts.md)** - Comprehensive alerting guide

### Advanced Topics
- **[API Reference](./api.md)** - Use the monitoring API directly
- **[Deployment Guide](./deployment.md)** - Production deployment
- **[Best Practices](./best-practices.md)** - Monitoring recommendations

### Community Resources
- **GitHub Discussions** - Ask questions and share experiences
- **Issue Tracker** - Report bugs or request features
- **Wiki** - Community-contributed guides and tips

---

## 🆘 Need Help?

### Quick Solutions
```bash
# Reset everything
sembalun-monitor setup --reset

# View detailed logs  
sembalun-monitor logs --follow --level debug

# Test specific component
sembalun-monitor test --component dashboard
```

### Getting Support
1. **📖 Check Documentation** - Most answers are in the guides
2. **🔍 Search Issues** - Someone may have had the same problem
3. **💬 Ask Community** - GitHub Discussions for questions
4. **🐛 Report Bugs** - GitHub Issues for problems
5. **📧 Direct Support** - For urgent production issues

---

**Congratulations!** 🎉 

You now have a professional monitoring system tracking your Sembalun meditation application. The system will continuously monitor your app's health, performance, and user engagement, alerting you to any issues while providing valuable insights for optimization.

**Happy monitoring!** Your Sembalun app is in good hands. 🧘‍♀️📊