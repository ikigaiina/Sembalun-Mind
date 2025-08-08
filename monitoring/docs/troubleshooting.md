# Troubleshooting Guide 🔧

> **Complete troubleshooting guide for Sembalun Monitor**

This guide helps you diagnose and fix common issues with the Sembalun Monitor system. Follow the systematic approach for quick problem resolution.

## 🎯 Quick Problem Resolution

### 1. Check System Status
```bash
# Quick status check
sembalun-monitor status

# Detailed system test
sembalun-monitor test --verbose

# View recent logs
sembalun-monitor logs --level error --lines 20
```

### 2. Common Quick Fixes
```bash
# Restart the monitor
# Press Ctrl+C to stop, then:
sembalun-monitor start

# Clear cache and restart
sembalun-monitor start --clear-cache

# Reset configuration
sembalun-monitor setup --reset
```

### 3. Verify Prerequisites
```bash
# Check Node.js version (need 18+)
node --version

# Check if Sembalun app is running
curl -I http://localhost:5173

# Test Supabase connection
curl -H "apikey: YOUR_KEY" https://your-project.supabase.co/rest/v1/
```

---

## 🚨 Common Issues and Solutions

### Installation Issues

#### Issue: "Node.js version too old"
```bash
Error: The engine "node" is incompatible with this module. Expected version ">=18.0.0"
```

**Solutions:**
1. **Update Node.js:**
   ```bash
   # Using Node Version Manager (recommended)
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
   nvm install 20
   nvm use 20
   
   # Or download from nodejs.org
   # https://nodejs.org/en/download/
   ```

2. **Verify installation:**
   ```bash
   node --version  # Should show v18.0.0 or higher
   npm --version   # Should show v8.0.0 or higher
   ```

#### Issue: "Permission denied" (Global Installation)
```bash
Error: EACCES: permission denied, mkdir '/usr/local/lib/node_modules/sembalun-monitor'
```

**Solutions:**
1. **Fix npm permissions (recommended):**
   ```bash
   mkdir ~/.npm-global
   npm config set prefix '~/.npm-global'
   echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
   source ~/.bashrc
   ```

2. **Alternative: Use sudo (not recommended):**
   ```bash
   sudo npm install -g sembalun-monitor
   ```

#### Issue: "Module not found" after installation
```bash
Error: Cannot find module 'sembalun-monitor'
```

**Solutions:**
1. **Verify installation:**
   ```bash
   npm list -g sembalun-monitor
   which sembalun-monitor
   ```

2. **Reinstall:**
   ```bash
   npm uninstall -g sembalun-monitor
   npm cache clean --force
   npm install -g sembalun-monitor
   ```

3. **Check PATH:**
   ```bash
   echo $PATH
   # Ensure npm global bin directory is in PATH
   ```

### Connection Issues

#### Issue: "Cannot connect to Sembalun app"
```bash
Error: connect ECONNREFUSED 127.0.0.1:5173
```

**Diagnosis:**
```bash
# Check if app is running
curl -I http://localhost:5173
lsof -i :5173  # Linux/macOS
netstat -an | findstr :5173  # Windows
```

**Solutions:**
1. **Start your Sembalun app:**
   ```bash
   cd /path/to/sembalun
   npm run dev
   ```

2. **Check correct URL:**
   - Development: `http://localhost:5173`
   - Production: `https://your-domain.com`

3. **Update monitor configuration:**
   ```bash
   sembalun-monitor setup
   # Update the app URL when prompted
   ```

#### Issue: "Supabase connection failed"
```bash
Error: Invalid API key or Supabase URL
```

**Diagnosis:**
```bash
# Test Supabase connection
curl -H "apikey: YOUR_ANON_KEY" https://your-project.supabase.co/rest/v1/

# Check environment variables
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY
```

**Solutions:**
1. **Verify credentials:**
   - Check Supabase project settings
   - Copy the exact URL and anon key
   - Ensure no extra spaces or quotes

2. **Update configuration:**
   ```bash
   sembalun-monitor setup
   # Re-enter Supabase credentials
   ```

3. **Test manually:**
   ```bash
   curl -H "apikey: YOUR_KEY" \
        -H "Authorization: Bearer YOUR_KEY" \
        https://your-project.supabase.co/rest/v1/users?select=count
   ```

#### Issue: "Port already in use"
```bash
Error: listen EADDRINUSE: address already in use :::3001
```

**Diagnosis:**
```bash
# Check what's using the port
lsof -i :3001  # Linux/macOS
netstat -ano | findstr :3001  # Windows
```

**Solutions:**
1. **Kill the process:**
   ```bash
   # Linux/macOS
   kill -9 $(lsof -ti:3001)
   
   # Windows
   taskkill /F /PID <PID_NUMBER>
   ```

2. **Use different port:**
   ```bash
   sembalun-monitor start --port 3005
   sembalun-monitor dashboard --port 3006
   ```

3. **Update configuration:**
   ```json
   {
     "port": 3005,
     "dashboardPort": 3006
   }
   ```

### Dashboard Issues

#### Issue: "Dashboard not loading"
```bash
Browser shows: "This site can't be reached" at localhost:3002
```

**Diagnosis:**
```bash
# Check if dashboard server is running
curl -I http://localhost:3002
sembalun-monitor status
```

**Solutions:**
1. **Start dashboard server:**
   ```bash
   # In a new terminal
   sembalun-monitor dashboard
   ```

2. **Check for port conflicts:**
   ```bash
   lsof -i :3002
   # If port is used, try different port:
   sembalun-monitor dashboard --port 3006
   ```

3. **Clear browser cache:**
   - Hard refresh: Ctrl+F5 (Windows) / Cmd+Shift+R (Mac)
   - Clear browser cache and cookies
   - Try incognito/private browsing mode

#### Issue: "Dashboard shows no data"
```bash
Dashboard loads but shows "Loading..." or empty metrics
```

**Diagnosis:**
```bash
# Check API endpoints
curl http://localhost:3001/health
curl http://localhost:3001/api/metrics
curl http://localhost:3001/api/dashboard
```

**Solutions:**
1. **Wait for first metrics collection:**
   - Initial data collection takes 30-60 seconds
   - Check logs for collection progress

2. **Verify monitor is running:**
   ```bash
   sembalun-monitor status
   ```

3. **Check WebSocket connection:**
   - Open browser developer tools
   - Look for WebSocket connection errors
   - Verify WebSocket URL: `ws://localhost:3002`

4. **Restart both services:**
   ```bash
   # Stop monitor (Ctrl+C)
   # Stop dashboard (Ctrl+C)
   sembalun-monitor start
   # In new terminal:
   sembalun-monitor dashboard
   ```

### Alert Issues

#### Issue: "Email alerts not working"
```bash
Alerts appear in dashboard but no emails received
```

**Diagnosis:**
```bash
# Check alert configuration
cat config/monitor.json | grep -A 10 "email"

# Test SMTP connection
sembalun-monitor test --component alerts
```

**Solutions:**
1. **Verify SMTP settings:**
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
         "recipients": ["admin@example.com"]
       }
     }
   }
   ```

2. **Gmail-specific setup:**
   - Enable 2-Factor Authentication
   - Generate App Password (not regular password)
   - Use app password in configuration

3. **Test email manually:**
   ```bash
   # Trigger test alert
   sembalun-monitor alert --test --severity warning --message "Test alert"
   ```

4. **Check spam folder:**
   - Alert emails might be filtered as spam
   - Add monitor email to contacts/whitelist

#### Issue: "Webhook alerts not working"
```bash
Alerts generated but webhook not triggered
```

**Diagnosis:**
```bash
# Test webhook URL manually
curl -X POST https://hooks.slack.com/services/YOUR/WEBHOOK/URL \
  -H "Content-Type: application/json" \
  -d '{"text": "Test message"}'
```

**Solutions:**
1. **Verify webhook URL:**
   - Copy exact URL from Slack/Discord
   - Ensure no trailing spaces or characters

2. **Check webhook format:**
   ```json
   {
     "alerts": {
       "webhook": {
         "enabled": true,
         "url": "https://hooks.slack.com/services/YOUR/WEBHOOK/URL",
         "method": "POST",
         "headers": {
           "Content-Type": "application/json"
         }
       }
     }
   }
   ```

3. **Test webhook:**
   ```bash
   sembalun-monitor webhook --test --url "YOUR_WEBHOOK_URL"
   ```

### Performance Issues

#### Issue: "High CPU/Memory usage"
```bash
Monitor process consuming excessive resources
```

**Diagnosis:**
```bash
# Check process resources
ps aux | grep sembalun-monitor
htop  # Linux
Activity Monitor  # macOS
Task Manager  # Windows
```

**Solutions:**
1. **Increase check intervals:**
   ```json
   {
     "checkInterval": 60000,  // Every minute instead of 30 seconds
     "monitoring": {
       "systemMetrics": {
         "interval": 30000  // Every 30 seconds instead of 10
       }
     }
   }
   ```

2. **Reduce data retention:**
   ```json
   {
     "dataRetentionDays": 7,  // Keep only 7 days
     "maxAlerts": 5000,       // Reduce alert history
     "maxLogs": 10000         // Reduce log history
   }
   ```

3. **Enable data cleanup:**
   ```json
   {
     "cleanup": {
       "enabled": true,
       "interval": "0 2 * * *"  // Daily cleanup at 2 AM
     }
   }
   ```

#### Issue: "Slow dashboard loading"
```bash
Dashboard takes long time to load or is unresponsive
```

**Solutions:**
1. **Enable compression:**
   ```json
   {
     "compression": true,
     "performance": {
       "caching": {
         "enabled": true,
         "ttl": 300000
       }
     }
   }
   ```

2. **Reduce data in dashboard:**
   ```json
   {
     "dashboard": {
       "maxAlerts": 50,      // Show fewer alerts
       "maxLogs": 100,       // Show fewer logs
       "refreshInterval": 30000  // Slower refresh
     }
   }
   ```

3. **Clear browser data:**
   - Clear cache and cookies
   - Disable browser extensions
   - Try different browser

### Data Issues

#### Issue: "Metrics not updating"
```bash
Dashboard shows stale data, metrics don't change
```

**Diagnosis:**
```bash
# Check if monitor is actively collecting data
sembalun-monitor logs --follow | grep "metrics"

# Test metric collection manually
curl http://localhost:3001/api/metrics
```

**Solutions:**
1. **Verify app connectivity:**
   ```bash
   curl -I http://localhost:5173
   ```

2. **Check collection intervals:**
   ```json
   {
     "checkInterval": 30000,  // 30 seconds
     "monitoring": {
       "healthCheck": {
         "interval": 30000
       }
     }
   }
   ```

3. **Restart metric collection:**
   ```bash
   sembalun-monitor restart
   ```

#### Issue: "Cultural/AI metrics showing zero"
```bash
Cultural engagement and AI metrics always show 0%
```

**Diagnosis:**
```bash
# Check if Supabase tables exist
curl -H "apikey: YOUR_KEY" \
     -H "Authorization: Bearer YOUR_KEY" \
     "https://your-project.supabase.co/rest/v1/cultural_interactions?select=count"
```

**Solutions:**
1. **Verify table names:**
   ```json
   {
     "monitoring": {
       "supabaseTables": [
         "users",
         "meditation_sessions", 
         "cultural_interactions",
         "personalization_events"
       ]
     }
   }
   ```

2. **Check table permissions:**
   - Ensure Supabase RLS policies allow read access
   - Verify anon key has necessary permissions

3. **Enable custom queries:**
   ```json
   {
     "customMetrics": {
       "culturalEngagement": {
         "enabled": true,
         "query": "SELECT COUNT(*) FROM cultural_interactions WHERE created_at > NOW() - INTERVAL '1 day'"
       }
     }
   }
   ```

---

## 🔍 Advanced Diagnostics

### Detailed System Check
```bash
# Comprehensive system test
sembalun-monitor test --verbose --all

# Test specific components
sembalun-monitor test --component database
sembalun-monitor test --component alerts
sembalun-monitor test --component dashboard
```

### Log Analysis
```bash
# View all error logs
sembalun-monitor logs --level error --lines 100

# Follow logs in real-time
sembalun-monitor logs --follow

# Search logs
sembalun-monitor logs --search "connection" --lines 50

# Export logs for analysis
sembalun-monitor logs --export --format json > debug-logs.json
```

### Network Diagnostics
```bash
# Test network connectivity
ping your-supabase-project.supabase.co
nslookup your-domain.com

# Check firewall rules
sudo ufw status  # Linux
netsh advfirewall show allprofiles  # Windows

# Test ports
telnet localhost 3001
telnet localhost 3002
```

### Database Diagnostics
```bash
# Test Supabase connectivity
curl -v -H "apikey: YOUR_KEY" https://your-project.supabase.co/rest/v1/

# Check table access
curl -H "apikey: YOUR_KEY" \
     -H "Authorization: Bearer YOUR_KEY" \
     "https://your-project.supabase.co/rest/v1/users?select=count"

# Verify RLS policies
# Check in Supabase dashboard: Authentication > Policies
```

---

## 🛠️ Recovery Procedures

### Complete Reset
If all else fails, perform a complete reset:

```bash
# Stop all processes
pkill -f sembalun-monitor

# Remove configuration
rm -rf config/
rm -rf logs/
rm -rf data/

# Reinstall
npm uninstall -g sembalun-monitor
npm install -g sembalun-monitor

# Reconfigure
sembalun-monitor setup
```

### Backup and Restore
```bash
# Backup current setup
cp -r config/ config-backup-$(date +%Y%m%d)
cp -r logs/ logs-backup-$(date +%Y%m%d)

# Restore from backup
cp -r config-backup-20250108/ config/
sembalun-monitor start
```

### Factory Reset
```bash
# Reset to default configuration
sembalun-monitor setup --reset --defaults

# Clear all data
sembalun-monitor cleanup --all --confirm

# Restart fresh
sembalun-monitor start
```

---

## 📞 Getting Help

### Self-Help Resources
1. **📖 Documentation**: Check all documentation files in `docs/`
2. **🔍 Log Analysis**: Always check logs first
3. **🧪 System Tests**: Use built-in diagnostic tools
4. **🔄 Simple Restart**: Often fixes transient issues

### Community Support
1. **💬 GitHub Discussions**: Ask questions and share solutions
2. **🐛 Issue Tracker**: Report bugs with detailed information
3. **📚 Wiki**: Community-contributed troubleshooting tips
4. **💡 FAQ**: Check frequently asked questions

### Bug Reports
When reporting issues, include:

```bash
# System information
sembalun-monitor --version
node --version
npm --version
uname -a  # Linux/macOS
systeminfo  # Windows

# Error logs
sembalun-monitor logs --level error --lines 50

# Configuration (sanitized)
cat config/monitor.json | sed 's/"key": "[^"]*"/"key": "REDACTED"/g'

# Test results
sembalun-monitor test --verbose
```

### Professional Support
For production issues or custom setups:
- 📧 Email support for urgent production issues
- 💼 Consulting for custom implementations
- 🏢 Enterprise support for large deployments

---

## ✅ Prevention Tips

### Regular Maintenance
```bash
# Weekly health check
sembalun-monitor test --comprehensive

# Monthly log cleanup
sembalun-monitor cleanup --logs --older-than 30d

# Update dependencies
npm update -g sembalun-monitor
```

### Monitoring Best Practices
1. **Set appropriate thresholds** for your environment
2. **Test alerts regularly** to ensure they work
3. **Monitor the monitor** - check that monitoring is running
4. **Keep backups** of working configurations
5. **Document custom changes** for future reference

### Early Warning Signs
Watch for these indicators of potential issues:
- 📈 Gradually increasing memory usage
- ⏰ Longer response times
- 🔴 Increasing error rates in logs
- 📊 Missing data in metrics
- 🚨 Alert delivery failures

By following this troubleshooting guide, you should be able to resolve most common issues with the Sembalun Monitor system quickly and effectively.