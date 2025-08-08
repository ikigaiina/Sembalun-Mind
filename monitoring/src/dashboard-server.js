#!/usr/bin/env node

/**
 * Sembalun Monitor Dashboard Server
 * Standalone web dashboard for monitoring Sembalun app
 * Completely independent - no interference with main app
 */

import express from 'express';
import { WebSocketServer } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import fs from 'fs-extra';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class DashboardServer {
  constructor(config = {}) {
    this.config = {
      port: config.port || 3002,
      monitorUrl: config.monitorUrl || 'http://localhost:3001',
      ...config
    };

    this.setupExpress();
  }

  setupExpress() {
    this.app = express();
    this.app.use(express.static(path.join(__dirname, '../public')));
    this.app.use(express.json());

    // Serve the main dashboard
    this.app.get('/', (req, res) => {
      res.send(this.generateDashboardHTML());
    });

    // API proxy to monitor
    this.app.get('/api/*', async (req, res) => {
      try {
        const response = await fetch(`${this.config.monitorUrl}${req.path}`);
        const data = await response.json();
        res.json(data);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
  }

  generateDashboardHTML() {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sembalun Monitor Dashboard</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
            color: white;
            min-height: 100vh;
        }

        .container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 20px;
        }

        .header {
            text-align: center;
            margin-bottom: 30px;
        }

        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }

        .header p {
            opacity: 0.8;
            font-size: 1.2em;
        }

        .dashboard-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }

        .card {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 15px;
            padding: 20px;
            border: 1px solid rgba(255, 255, 255, 0.2);
            transition: transform 0.3s ease;
        }

        .card:hover {
            transform: translateY(-5px);
        }

        .card h3 {
            margin-bottom: 15px;
            font-size: 1.3em;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .metric {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            padding: 8px 12px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 8px;
        }

        .metric-value {
            font-weight: bold;
        }

        .status-indicator {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            display: inline-block;
            margin-right: 8px;
        }

        .status-healthy {
            background-color: #4ade80;
            box-shadow: 0 0 10px #4ade80;
        }

        .status-warning {
            background-color: #fbbf24;
            box-shadow: 0 0 10px #fbbf24;
        }

        .status-error {
            background-color: #ef4444;
            box-shadow: 0 0 10px #ef4444;
        }

        .chart-container {
            height: 200px;
            position: relative;
            margin-top: 15px;
        }

        .alerts-list {
            max-height: 300px;
            overflow-y: auto;
        }

        .alert-item {
            padding: 10px;
            margin-bottom: 8px;
            border-radius: 8px;
            font-size: 0.9em;
        }

        .alert-error {
            background: rgba(239, 68, 68, 0.2);
            border-left: 4px solid #ef4444;
        }

        .alert-warning {
            background: rgba(251, 191, 36, 0.2);
            border-left: 4px solid #fbbf24;
        }

        .alert-info {
            background: rgba(59, 130, 246, 0.2);
            border-left: 4px solid #3b82f6;
        }

        .logs-container {
            background: rgba(0, 0, 0, 0.3);
            border-radius: 10px;
            padding: 15px;
            font-family: 'Courier New', monospace;
            font-size: 0.8em;
            max-height: 400px;
            overflow-y: auto;
        }

        .log-entry {
            margin-bottom: 5px;
            padding: 2px 5px;
            border-radius: 3px;
        }

        .log-error {
            background: rgba(239, 68, 68, 0.1);
        }

        .log-warning {
            background: rgba(251, 191, 36, 0.1);
        }

        .log-info {
            background: rgba(59, 130, 246, 0.1);
        }

        .connection-status {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 10px 15px;
            border-radius: 20px;
            font-size: 0.9em;
            font-weight: bold;
        }

        .connected {
            background: rgba(74, 222, 128, 0.2);
            border: 1px solid #4ade80;
        }

        .disconnected {
            background: rgba(239, 68, 68, 0.2);
            border: 1px solid #ef4444;
        }

        .footer {
            text-align: center;
            padding: 20px;
            opacity: 0.6;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            margin-top: 30px;
        }

        @media (max-width: 768px) {
            .dashboard-grid {
                grid-template-columns: 1fr;
            }
            
            .header h1 {
                font-size: 2em;
            }
        }

        .refresh-btn {
            background: rgba(255, 255, 255, 0.2);
            border: none;
            color: white;
            padding: 10px 20px;
            border-radius: 8px;
            cursor: pointer;
            font-weight: bold;
            transition: background 0.3s;
            margin-left: 10px;
        }

        .refresh-btn:hover {
            background: rgba(255, 255, 255, 0.3);
        }

        .sparkline {
            height: 60px;
            width: 100%;
            margin-top: 10px;
        }
    </style>
</head>
<body>
    <div id="connectionStatus" class="connection-status disconnected">
        🔴 Disconnected
    </div>

    <div class="container">
        <div class="header">
            <h1>🧘‍♀️ Sembalun Monitor Dashboard</h1>
            <p>Real-time monitoring for your meditation platform</p>
            <button class="refresh-btn" onclick="refreshData()">🔄 Refresh</button>
        </div>

        <div class="dashboard-grid">
            <!-- System Health Card -->
            <div class="card">
                <h3>
                    <span class="status-indicator" id="systemStatus"></span>
                    System Health
                </h3>
                <div class="metric">
                    <span>Uptime</span>
                    <span class="metric-value" id="uptime">Loading...</span>
                </div>
                <div class="metric">
                    <span>Response Time</span>
                    <span class="metric-value" id="responseTime">Loading...</span>
                </div>
                <div class="metric">
                    <span>CPU Usage</span>
                    <span class="metric-value" id="cpuUsage">Loading...</span>
                </div>
                <div class="metric">
                    <span>Memory Usage</span>
                    <span class="metric-value" id="memoryUsage">Loading...</span>
                </div>
            </div>

            <!-- User Analytics Card -->
            <div class="card">
                <h3>
                    👥 User Analytics
                </h3>
                <div class="metric">
                    <span>Total Users</span>
                    <span class="metric-value" id="userCount">Loading...</span>
                </div>
                <div class="metric">
                    <span>Daily Sessions</span>
                    <span class="metric-value" id="sessionCount">Loading...</span>
                </div>
                <div class="metric">
                    <span>Cultural Engagement</span>
                    <span class="metric-value" id="culturalEngagement">Loading...</span>
                </div>
                <div class="metric">
                    <span>AI Personalization</span>
                    <span class="metric-value" id="aiUsage">Loading...</span>
                </div>
            </div>

            <!-- Performance Metrics Card -->
            <div class="card">
                <h3>
                    📊 Performance
                </h3>
                <div class="chart-container">
                    <canvas id="performanceChart" class="sparkline"></canvas>
                </div>
                <div class="metric">
                    <span>Avg Response Time</span>
                    <span class="metric-value" id="avgResponseTime">Loading...</span>
                </div>
                <div class="metric">
                    <span>Error Rate</span>
                    <span class="metric-value" id="errorRate">Loading...</span>
                </div>
            </div>

            <!-- Recent Alerts Card -->
            <div class="card">
                <h3>
                    🚨 Recent Alerts
                </h3>
                <div class="alerts-list" id="alertsList">
                    Loading alerts...
                </div>
            </div>
        </div>

        <!-- System Logs -->
        <div class="card">
            <h3>📝 System Logs</h3>
            <div class="logs-container" id="logsContainer">
                Loading logs...
            </div>
        </div>

        <div class="footer">
            <p>Sembalun Monitor v1.0.0 | Last updated: <span id="lastUpdate">Never</span></p>
        </div>
    </div>

    <script>
        let ws;
        let performanceData = [];
        let chart;

        // Initialize dashboard
        function init() {
            connectWebSocket();
            loadInitialData();
            startPerformanceChart();
            
            // Auto refresh every 30 seconds
            setInterval(refreshData, 30000);
        }

        function connectWebSocket() {
            const wsUrl = 'ws://localhost:3002';
            ws = new WebSocket(wsUrl);

            ws.onopen = function() {
                document.getElementById('connectionStatus').className = 'connection-status connected';
                document.getElementById('connectionStatus').innerHTML = '🟢 Connected';
            };

            ws.onmessage = function(event) {
                const message = JSON.parse(event.data);
                handleWebSocketMessage(message);
            };

            ws.onclose = function() {
                document.getElementById('connectionStatus').className = 'connection-status disconnected';
                document.getElementById('connectionStatus').innerHTML = '🔴 Disconnected';
                
                // Reconnect after 5 seconds
                setTimeout(connectWebSocket, 5000);
            };

            ws.onerror = function(error) {
                console.error('WebSocket error:', error);
            };
        }

        function handleWebSocketMessage(message) {
            switch(message.type) {
                case 'metrics':
                    updateMetrics(message.data);
                    break;
                case 'alert':
                    addAlert(message.data);
                    break;
                case 'log':
                    addLog(message.data);
                    break;
            }
        }

        async function loadInitialData() {
            try {
                const response = await fetch('/api/dashboard');
                const data = await response.json();
                
                updateMetrics(data.metrics);
                updateAlerts(data.alerts);
                updateLogs(data.logs);
                
            } catch (error) {
                console.error('Failed to load initial data:', error);
            }
        }

        function updateMetrics(metrics) {
            document.getElementById('uptime').textContent = formatUptime(metrics.uptime);
            document.getElementById('responseTime').textContent = metrics.responseTime + 'ms';
            document.getElementById('cpuUsage').textContent = metrics.systemHealth.cpu + '%';
            document.getElementById('memoryUsage').textContent = metrics.systemHealth.memory + '%';
            
            document.getElementById('userCount').textContent = metrics.userCount.toLocaleString();
            document.getElementById('sessionCount').textContent = metrics.sessionCount.toLocaleString();
            document.getElementById('culturalEngagement').textContent = metrics.culturalEngagement + '%';
            document.getElementById('aiUsage').textContent = metrics.aiPersonalizationUsage + '%';
            
            document.getElementById('avgResponseTime').textContent = metrics.responseTime + 'ms';
            document.getElementById('errorRate').textContent = (metrics.errorRate || 0) + '%';

            // Update system status indicator
            const systemStatus = document.getElementById('systemStatus');
            if (metrics.responseTime < 1000 && metrics.systemHealth.cpu < 80) {
                systemStatus.className = 'status-indicator status-healthy';
            } else if (metrics.responseTime < 3000 && metrics.systemHealth.cpu < 90) {
                systemStatus.className = 'status-indicator status-warning';
            } else {
                systemStatus.className = 'status-indicator status-error';
            }

            // Add to performance chart
            performanceData.push({
                timestamp: Date.now(),
                responseTime: metrics.responseTime
            });

            // Keep only last 20 data points
            if (performanceData.length > 20) {
                performanceData.shift();
            }

            updatePerformanceChart();
            document.getElementById('lastUpdate').textContent = new Date().toLocaleTimeString();
        }

        function updateAlerts(alerts) {
            const alertsList = document.getElementById('alertsList');
            alertsList.innerHTML = '';

            if (alerts.length === 0) {
                alertsList.innerHTML = '<p style="opacity: 0.6;">No recent alerts</p>';
                return;
            }

            alerts.forEach(alert => {
                addAlert(alert);
            });
        }

        function addAlert(alert) {
            const alertsList = document.getElementById('alertsList');
            const alertElement = document.createElement('div');
            alertElement.className = \`alert-item alert-\${alert.level}\`;
            alertElement.innerHTML = \`
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span>\${alert.message}</span>
                    <small>\${new Date(alert.timestamp).toLocaleTimeString()}</small>
                </div>
            \`;
            
            alertsList.insertBefore(alertElement, alertsList.firstChild);
            
            // Keep only last 10 alerts visible
            while (alertsList.children.length > 10) {
                alertsList.removeChild(alertsList.lastChild);
            }
        }

        function updateLogs(logs) {
            const logsContainer = document.getElementById('logsContainer');
            logsContainer.innerHTML = '';

            logs.forEach(log => {
                addLog(log);
            });
        }

        function addLog(log) {
            const logsContainer = document.getElementById('logsContainer');
            const logElement = document.createElement('div');
            logElement.className = \`log-entry log-\${log.level}\`;
            logElement.innerHTML = \`[\${new Date(log.timestamp).toLocaleTimeString()}] \${log.level.toUpperCase()}: \${log.message}\`;
            
            logsContainer.insertBefore(logElement, logsContainer.firstChild);
            
            // Keep only last 50 logs visible
            while (logsContainer.children.length > 50) {
                logsContainer.removeChild(logsContainer.lastChild);
            }
        }

        function startPerformanceChart() {
            const canvas = document.getElementById('performanceChart');
            const ctx = canvas.getContext('2d');
            
            // Set canvas size
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
            
            updatePerformanceChart();
        }

        function updatePerformanceChart() {
            const canvas = document.getElementById('performanceChart');
            const ctx = canvas.getContext('2d');
            
            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            if (performanceData.length < 2) return;

            // Draw sparkline
            ctx.strokeStyle = '#4ade80';
            ctx.lineWidth = 2;
            ctx.beginPath();

            const maxResponseTime = Math.max(...performanceData.map(d => d.responseTime));
            const minResponseTime = Math.min(...performanceData.map(d => d.responseTime));
            const range = maxResponseTime - minResponseTime || 1;

            performanceData.forEach((point, index) => {
                const x = (index / (performanceData.length - 1)) * canvas.width;
                const y = canvas.height - ((point.responseTime - minResponseTime) / range) * canvas.height;
                
                if (index === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });

            ctx.stroke();
        }

        function formatUptime(checks) {
            const minutes = Math.floor(checks / 2); // 30-second intervals
            const hours = Math.floor(minutes / 60);
            const days = Math.floor(hours / 24);
            
            if (days > 0) return \`\${days}d \${hours % 24}h\`;
            if (hours > 0) return \`\${hours}h \${minutes % 60}m\`;
            return \`\${minutes}m\`;
        }

        function refreshData() {
            loadInitialData();
        }

        // Initialize when page loads
        window.addEventListener('load', init);

        // Handle window resize for charts
        window.addEventListener('resize', () => {
            const canvas = document.getElementById('performanceChart');
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
            updatePerformanceChart();
        });
    </script>
</body>
</html>`;
  }

  start() {
    this.server = this.app.listen(this.config.port, () => {
      console.log(chalk.green(`🎨 Dashboard server running on port ${this.config.port}`));
      console.log(chalk.blue(`📊 Dashboard URL: http://localhost:${this.config.port}`));
    });
  }

  stop() {
    if (this.server) {
      this.server.close();
    }
  }
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const dashboard = new DashboardServer();
  dashboard.start();

  process.on('SIGINT', () => {
    console.log(chalk.yellow('\nShutting down dashboard...'));
    dashboard.stop();
    process.exit(0);
  });
}

export default DashboardServer;