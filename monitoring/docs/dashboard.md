# Dashboard User Manual 📊

> **Complete user guide for the Sembalun Monitor Dashboard**

This manual covers everything you need to know about using the Sembalun Monitor Dashboard to track your meditation application's health, performance, and user engagement.

## 🎯 Dashboard Overview

The Sembalun Monitor Dashboard provides a beautiful, real-time interface for monitoring your meditation platform. Access it at `http://localhost:3002` (or your configured dashboard URL).

### Dashboard Philosophy
- **🔍 External Perspective** - Monitor your app like a real user would
- **📊 Real-time Insights** - Live data updates every 30 seconds  
- **🎨 Beautiful Interface** - Modern, responsive design
- **🚨 Proactive Alerts** - Immediate notifications for issues
- **🧘‍♀️ Cultural Focus** - Specialized metrics for meditation apps

---

## 🖥️ Dashboard Interface

### Main Layout
```
┌─────────────────────────────────────────────────────────┐
│                  Header & Status Bar                   │
├─────────────────┬─────────────────┬─────────────────────┤
│   System Health │   User Analytics│   Performance Chart │
├─────────────────┼─────────────────┼─────────────────────┤
│   Recent Alerts │   Cultural      │   AI Personalization│
│                 │   Engagement    │   Metrics           │
├─────────────────────────────────────────────────────────┤
│                    System Logs                         │
└─────────────────────────────────────────────────────────┘
```

### Color Coding System
- 🟢 **Green**: Healthy, optimal performance
- 🟡 **Yellow**: Warning, attention needed
- 🔴 **Red**: Critical, immediate action required
- 🔵 **Blue**: Information, normal status
- ⚪ **Gray**: Inactive or unavailable

---

## 📊 Dashboard Panels

### 1. System Health Panel 💚

**Location**: Top-left of dashboard  
**Updates**: Every 30 seconds

#### Key Metrics
```
🟢 System Status: Online
⏱️  Response Time: 250ms
📈 Uptime: 99.9% (720 checks)
🖥️  CPU Usage: 45%
💾 Memory Usage: 62%
💿 Disk Usage: 23%
```

#### Understanding Health Indicators

**Response Time**
- 🟢 **< 1000ms**: Excellent performance
- 🟡 **1000-3000ms**: Acceptable, monitor closely
- 🔴 **> 3000ms**: Poor performance, investigate

**Uptime Calculation**
- Based on successful health checks every 30 seconds
- 720 checks = 6 hours of monitoring
- 99.9% = Only 1 failed check out of 1000

**Resource Usage**
- **CPU**: System processor utilization
- **Memory**: RAM consumption  
- **Disk**: Storage space utilization

#### Health Status Meanings
- ✅ **Healthy**: All systems operational
- ⚠️ **Warning**: Some metrics elevated
- 🚨 **Critical**: Immediate attention needed
- ❌ **Down**: Application not responding

### 2. User Analytics Panel 👥

**Location**: Top-center of dashboard  
**Updates**: Every 5 minutes

#### Metrics Displayed
```
👥 Total Users: 1,247
🧘 Daily Sessions: 89
🎭 Cultural Engagement: 78%
🤖 AI Personalization: 65%
```

#### Understanding User Metrics

**Total Users**
- Current count of registered users in Supabase
- Pulled from `users` table
- Updates when new users register

**Daily Sessions** 
- Meditation sessions completed today
- Includes all session types (guided, free, cultural)
- Resets at midnight server time

**Cultural Engagement**
- Percentage of users interacting with Indonesian features
- Includes: wisdom quotes, traditional music, cultural themes
- Higher percentage = better cultural feature adoption

**AI Personalization Usage**
- Percentage of users with active AI recommendations
- Tracks personalization system engagement
- Measures recommendation acceptance rate

### 3. Performance Chart 📈

**Location**: Top-right of dashboard  
**Updates**: Real-time with each health check

#### Chart Features
- **Sparkline Graph**: Shows response time trend
- **20 Data Points**: Last 10 minutes of data
- **Auto-scaling**: Adjusts to data range
- **Green Line**: Response time in milliseconds

#### Reading the Chart
- **Flat Line**: Consistent performance
- **Spikes**: Temporary performance issues
- **Trending Up**: Performance degrading
- **Trending Down**: Performance improving

### 4. Recent Alerts Panel 🚨

**Location**: Bottom-left of dashboard  
**Updates**: Real-time as alerts occur

#### Alert Display
```
🔴 CRITICAL: Application Down (2 min ago)
🟡 WARNING: High CPU: 85% (5 min ago)  
🔵 INFO: New user milestone: 1000+ (1 hour ago)
```

#### Alert Levels
- 🔴 **CRITICAL**: System down, data loss risk
- 🟡 **WARNING**: Performance issues, user impact
- 🔵 **INFO**: General notifications, milestones

#### Alert Actions
- **Click Alert**: View detailed information
- **Acknowledge**: Mark alert as seen
- **History**: View all historical alerts
- **Filter**: Show only specific alert types

### 5. Cultural Engagement Panel 🎭

**Location**: Bottom-center of dashboard  
**Updates**: Every 10 minutes

#### Cultural Metrics
```
🏛️ Javanese: 456 users (82% engagement)
🌺 Balinese: 312 users (79% engagement)  
🏔️ Sundanese: 289 users (75% engagement)
⛰️ Minangkabau: 193 users (71% engagement)
```

#### Regional Breakdown
- **User Count**: Active users per cultural region
- **Engagement Rate**: Interaction with regional content
- **Top Features**: Most popular cultural elements
- **Language Preference**: Indonesian vs English usage

#### Cultural Features Tracked
- **Traditional Music**: Gamelan, Angklung usage
- **Wisdom Quotes**: Regional saying interactions
- **Visual Themes**: Batik, temple, nature backgrounds
- **Cultural Calendar**: Traditional holiday participation

### 6. AI Personalization Panel 🤖

**Location**: Bottom-right of dashboard  
**Updates**: Every 10 minutes

#### AI Metrics
```
🎯 Recommendation Accuracy: 78%
🔄 Active Personalizations: 1,247
📊 Behavioral Patterns: 156 identified
🧠 Model Performance: 94ms avg response
```

#### AI System Tracking
- **Accuracy**: How often users accept recommendations
- **Active Users**: Users with personalization enabled
- **Pattern Recognition**: Unique behavior patterns identified
- **Response Time**: AI system performance speed

### 7. System Logs Panel 📝

**Location**: Bottom of dashboard  
**Updates**: Real-time log streaming

#### Log Display
```
[10:30:15] INFO: Health check completed (250ms)
[10:29:45] WARN: High CPU usage detected (85%)
[10:29:30] INFO: Cultural metrics collected
[10:29:15] INFO: User analytics updated
```

#### Log Levels
- **ERROR**: System errors, failures
- **WARN**: Warnings, potential issues
- **INFO**: General information, normal operations  
- **DEBUG**: Detailed debugging information

#### Log Features
- **Auto-scroll**: Newest logs appear at top
- **Color Coding**: Error levels have distinct colors
- **Search**: Filter logs by keywords
- **Export**: Download logs for analysis

---

## 🔍 Dashboard Navigation

### Top Navigation Bar
```
Sembalun Monitor | 🟢 Connected | ⚡ Last Update: 2 seconds ago | 🔄 Refresh
```

#### Status Indicators
- **🟢 Connected**: WebSocket connection active
- **🔴 Disconnected**: Connection lost, retrying
- **⚡ Last Update**: Time since last data refresh
- **🔄 Refresh**: Manual refresh button

### Real-time Updates
The dashboard uses WebSocket connections for live updates:

#### Update Frequencies
- **System Health**: Every 30 seconds
- **Performance Chart**: Every 30 seconds
- **User Analytics**: Every 5 minutes
- **Cultural Metrics**: Every 10 minutes
- **AI Metrics**: Every 10 minutes
- **Alerts**: Immediate (real-time)
- **Logs**: Immediate (real-time)

---

## ⚙️ Dashboard Customization

### Viewing Options

#### Panel Toggle
```javascript
// Click panel headers to minimize/maximize
Click "System Health" header → Collapses panel
Click again → Expands panel
```

#### Time Ranges
```
Performance Chart:
- Last 10 minutes (default)
- Last hour
- Last 24 hours
```

#### Alert Filtering
```
Show All Alerts (default)
Show Only Critical
Show Only Warnings
Show Only Info
Show Unacknowledged Only
```

#### Log Filtering
```
All Levels (default)
Errors Only  
Warnings Only
Info Only
Debug Only
```

### Theme Options
The dashboard automatically adapts to:
- **Light Mode**: Better for bright environments
- **Dark Mode**: Easier on eyes in low light
- **System Theme**: Follows OS preference

---

## 📱 Mobile Responsiveness

### Mobile Layout
On mobile devices, the dashboard reorganizes:

```
┌─────────────────────────┐
│     System Health       │
├─────────────────────────┤  
│     User Analytics      │
├─────────────────────────┤
│    Performance Chart    │
├─────────────────────────┤
│     Recent Alerts       │
├─────────────────────────┤
│   Cultural Engagement   │
├─────────────────────────┤
│  AI Personalization     │
├─────────────────────────┤
│     System Logs         │
└─────────────────────────┘
```

### Mobile Features
- **Touch Friendly**: Large touch targets
- **Swipe Navigation**: Swipe between panels
- **Pinch to Zoom**: Zoom into charts
- **Responsive Text**: Text scales appropriately
- **Optimized Loading**: Faster on slower connections

---

## 🚨 Understanding Alerts

### Alert Categories

#### System Alerts
- **App Down**: Application not responding
- **High Response Time**: Slow performance  
- **Resource Usage**: CPU/Memory/Disk warnings
- **Database Issues**: Supabase connection problems

#### User Alerts  
- **Low Activity**: Unusual drop in user sessions
- **Authentication Issues**: Login problems
- **Feature Errors**: Specific feature failures

#### Cultural Alerts
- **Low Engagement**: Cultural features underused
- **Regional Issues**: Specific regional problems
- **Content Errors**: Cultural content loading issues

#### AI Alerts
- **Model Performance**: AI system slow responses
- **Recommendation Issues**: Low acceptance rates
- **Personalization Errors**: System failures

### Alert Lifecycle
1. **Detection**: System detects issue
2. **Creation**: Alert generated with details
3. **Notification**: Sent via email/webhook/dashboard
4. **Acknowledgment**: User marks as seen
5. **Resolution**: Issue resolved, alert auto-clears
6. **Archive**: Stored in alert history

---

## 🎯 Best Practices

### Daily Monitoring Routine
1. **Morning Check**: Review overnight alerts
2. **Performance Review**: Check response times
3. **User Growth**: Monitor user analytics
4. **Cultural Engagement**: Review feature usage
5. **System Health**: Verify resource usage

### Weekly Analysis
1. **Trend Analysis**: Look for patterns over 7 days
2. **Alert Patterns**: Identify recurring issues
3. **User Engagement**: Analyze weekly growth
4. **Performance Trends**: Long-term performance review
5. **Cultural Insights**: Regional usage patterns

### Alert Response
1. **Critical Alerts**: Immediate response required
2. **Warning Alerts**: Investigate within 1 hour
3. **Info Alerts**: Review during normal hours
4. **Pattern Recognition**: Look for alert clusters

### Dashboard Optimization
1. **Keep Open**: Leave dashboard open during work
2. **Multiple Monitors**: Use dedicated monitor if available
3. **Bookmark**: Quick access to dashboard URL
4. **Mobile App**: Use mobile for on-the-go monitoring
5. **Team Sharing**: Share dashboard with team members

---

## 🔧 Troubleshooting Dashboard Issues

### Dashboard Not Loading
```bash
# Check if dashboard server is running
curl -I http://localhost:3002

# If not running, start it:
sembalun-monitor dashboard
```

### No Data Showing
```bash
# Check if monitor is running
sembalun-monitor status

# Check API connectivity
curl http://localhost:3001/api/metrics
```

### WebSocket Connection Failed
1. **Firewall**: Check if port 3002 is blocked
2. **Proxy**: WebSocket may be blocked by proxy
3. **Browser**: Try different browser or incognito mode
4. **Network**: Corporate networks may block WebSockets

### Performance Issues
1. **Clear Cache**: Clear browser cache and cookies
2. **Disable Extensions**: Browser extensions may interfere  
3. **Resource Usage**: Dashboard uses minimal resources
4. **Connection**: Slow network affects real-time updates

---

## 📊 Understanding Your Data

### Normal Baselines
Establish baselines for your application:

```
Response Time Baselines:
- Excellent: < 500ms
- Good: 500ms - 1000ms  
- Acceptable: 1000ms - 2000ms
- Poor: > 2000ms

User Activity Baselines:
- Peak Hours: 7-9 PM Indonesian time
- Weekend Boost: 20-30% higher activity
- Cultural Events: 50%+ engagement spikes

Resource Usage Baselines:
- Normal CPU: 20-50%
- Normal Memory: 40-70%
- Normal Disk: < 80%
```

### Seasonal Patterns
- **Indonesian Holidays**: Higher cultural engagement
- **Weekend Usage**: Increased meditation sessions
- **Evening Peak**: 7-9 PM highest activity
- **Ramadan Period**: Different usage patterns

### Growth Indicators
- **User Growth**: 5-10% monthly growth is healthy
- **Session Growth**: Should match or exceed user growth
- **Cultural Adoption**: 60%+ engagement is excellent
- **AI Usage**: 50%+ personalization adoption is good

---

This dashboard manual provides everything you need to effectively monitor your Sembalun meditation platform. The dashboard is designed to give you immediate insights into your application's health while providing the detailed data needed for informed decision-making.