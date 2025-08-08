#!/usr/bin/env node

/**
 * Sembalun External Monitor
 * Comprehensive monitoring system that operates independently from the main app
 * 
 * Features:
 * - Real-time performance monitoring
 * - Health checks and uptime monitoring
 * - User analytics tracking
 * - Error monitoring and alerting
 * - Cultural engagement metrics
 * - AI personalization insights
 * - System resource monitoring
 */

import express from 'express';
import { WebSocketServer } from 'ws';
import fetch from 'node-fetch';
import fs from 'fs-extra';
import chalk from 'chalk';
import ora from 'ora';
import { CronJob } from 'cron';
import winston from 'winston';
import si from 'systeminformation';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const packageJson = require('../package.json');

class SembalunMonitor {
  constructor(config = {}) {
    this.config = {
      port: config.port || 3001,
      appUrl: config.appUrl || 'http://localhost:5173',
      supabaseUrl: config.supabaseUrl || process.env.VITE_SUPABASE_URL,
      supabaseKey: config.supabaseKey || process.env.VITE_SUPABASE_ANON_KEY,
      checkInterval: config.checkInterval || 30000, // 30 seconds
      logLevel: config.logLevel || 'info',
      alerts: config.alerts || {
        email: false,
        telegram: false,
        webhook: false
      },
      ...config
    };

    this.metrics = {
      uptime: 0,
      responseTime: 0,
      errorRate: 0,
      userCount: 0,
      sessionCount: 0,
      culturalEngagement: 0,
      aiPersonalizationUsage: 0,
      systemHealth: {
        cpu: 0,
        memory: 0,
        disk: 0
      }
    };

    this.alerts = [];
    this.logs = [];
    this.isRunning = false;

    this.setupLogger();
    this.setupExpress();
    this.setupWebSocket();
  }

  setupLogger() {
    this.logger = winston.createLogger({
      level: this.config.logLevel,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      transports: [
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log' }),
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        })
      ]
    });

    // Ensure logs directory exists
    fs.ensureDirSync('logs');
  }

  setupExpress() {
    this.app = express();
    this.app.use(express.json());
    this.app.use(express.static('public'));

    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: packageJson.version,
        metrics: this.metrics
      });
    });

    // Metrics API
    this.app.get('/api/metrics', (req, res) => {
      res.json(this.metrics);
    });

    // Alerts API
    this.app.get('/api/alerts', (req, res) => {
      res.json(this.alerts.slice(-100)); // Last 100 alerts
    });

    // Logs API
    this.app.get('/api/logs', (req, res) => {
      const level = req.query.level || 'info';
      const limit = parseInt(req.query.limit) || 100;
      
      res.json(this.logs
        .filter(log => log.level === level || level === 'all')
        .slice(-limit)
      );
    });

    // Dashboard API
    this.app.get('/api/dashboard', (req, res) => {
      res.json({
        metrics: this.metrics,
        alerts: this.alerts.slice(-10),
        logs: this.logs.slice(-20),
        config: {
          appUrl: this.config.appUrl,
          checkInterval: this.config.checkInterval,
          version: packageJson.version
        }
      });
    });
  }

  setupWebSocket() {
    this.wss = new WebSocketServer({ port: this.config.port + 1 });
    
    this.wss.on('connection', (ws) => {
      this.logger.info('Dashboard client connected');
      
      // Send initial data
      ws.send(JSON.stringify({
        type: 'init',
        data: {
          metrics: this.metrics,
          alerts: this.alerts.slice(-10),
          config: this.config
        }
      }));
      
      ws.on('close', () => {
        this.logger.info('Dashboard client disconnected');
      });
    });
  }

  async start() {
    if (this.isRunning) {
      this.logger.warn('Monitor is already running');
      return;
    }

    const spinner = ora('Starting Sembalun Monitor...').start();

    try {
      // Validate configuration
      await this.validateConfig();
      
      // Start HTTP server
      this.server = this.app.listen(this.config.port, () => {
        this.logger.info(`Monitor server running on port ${this.config.port}`);
      });

      // Start monitoring jobs
      this.startMonitoringJobs();
      
      // Start system monitoring
      this.startSystemMonitoring();

      this.isRunning = true;
      spinner.succeed(chalk.green('Sembalun Monitor started successfully!'));
      
      this.displayStartupInfo();
      
    } catch (error) {
      spinner.fail(chalk.red('Failed to start monitor'));
      this.logger.error('Startup error:', error);
      throw error;
    }
  }

  async validateConfig() {
    if (!this.config.supabaseUrl || !this.config.supabaseKey) {
      throw new Error('Supabase configuration is required');
    }

    // Test app connectivity
    try {
      const response = await fetch(this.config.appUrl, { 
        timeout: 5000,
        signal: AbortSignal.timeout(5000)
      });
      if (!response.ok) {
        this.logger.warn(`App URL returned status ${response.status}`);
      }
    } catch (error) {
      this.logger.warn('Could not reach app URL:', this.config.appUrl);
    }
  }

  startMonitoringJobs() {
    // Main health check job
    this.healthCheckJob = new CronJob('*/30 * * * * *', async () => {
      await this.performHealthCheck();
    });

    // Detailed metrics job
    this.metricsJob = new CronJob('*/5 * * * *', async () => {
      await this.collectDetailedMetrics();
    });

    // Daily summary job
    this.summaryJob = new CronJob('0 0 * * *', async () => {
      await this.generateDailySummary();
    });

    this.healthCheckJob.start();
    this.metricsJob.start();
    this.summaryJob.start();

    this.logger.info('Monitoring jobs started');
  }

  startSystemMonitoring() {
    // System resource monitoring
    setInterval(async () => {
      try {
        const [cpu, memory, disk] = await Promise.all([
          si.currentLoad(),
          si.mem(),
          si.diskLayout()
        ]);

        this.metrics.systemHealth = {
          cpu: Math.round(cpu.currentLoad),
          memory: Math.round((memory.used / memory.total) * 100),
          disk: disk.length > 0 ? Math.round((disk[0].size - disk[0].available) / disk[0].size * 100) : 0
        };

        // Check for system alerts
        this.checkSystemAlerts();

      } catch (error) {
        this.logger.error('System monitoring error:', error);
      }
    }, 10000); // Every 10 seconds
  }

  async performHealthCheck() {
    const startTime = Date.now();
    
    try {
      // Check main app
      const appResponse = await fetch(this.config.appUrl, {
        timeout: 10000,
        signal: AbortSignal.timeout(10000)
      });

      this.metrics.responseTime = Date.now() - startTime;
      this.metrics.uptime = appResponse.ok ? this.metrics.uptime + 1 : this.metrics.uptime;

      if (!appResponse.ok) {
        this.createAlert('error', `App health check failed: ${appResponse.status}`);
      }

      // Check Supabase connectivity
      await this.checkSupabaseHealth();

      // Broadcast to dashboard clients
      this.broadcastToClients('metrics', this.metrics);

    } catch (error) {
      this.metrics.responseTime = Date.now() - startTime;
      this.createAlert('error', `Health check failed: ${error.message}`);
      this.logger.error('Health check error:', error);
    }
  }

  async checkSupabaseHealth() {
    try {
      const response = await fetch(`${this.config.supabaseUrl}/rest/v1/`, {
        headers: {
          'apikey': this.config.supabaseKey,
          'Authorization': `Bearer ${this.config.supabaseKey}`
        },
        timeout: 5000,
        signal: AbortSignal.timeout(5000)
      });

      if (!response.ok) {
        this.createAlert('warning', 'Supabase connectivity issue');
      }
    } catch (error) {
      this.createAlert('error', `Supabase health check failed: ${error.message}`);
    }
  }

  async collectDetailedMetrics() {
    try {
      // Get user metrics from Supabase
      const userMetrics = await this.getUserMetrics();
      const sessionMetrics = await this.getSessionMetrics();
      const culturalMetrics = await this.getCulturalMetrics();

      this.metrics = {
        ...this.metrics,
        ...userMetrics,
        ...sessionMetrics,
        ...culturalMetrics,
        lastUpdated: new Date().toISOString()
      };

      // Save metrics to file
      await this.saveMetrics();

      this.logger.info('Detailed metrics collected');

    } catch (error) {
      this.logger.error('Metrics collection error:', error);
    }
  }

  async getUserMetrics() {
    try {
      const response = await fetch(`${this.config.supabaseUrl}/rest/v1/users?select=count`, {
        headers: {
          'apikey': this.config.supabaseKey,
          'Authorization': `Bearer ${this.config.supabaseKey}`,
          'Prefer': 'count=exact'
        }
      });

      const userCount = response.headers.get('content-range')?.split('/')[1] || '0';
      
      return {
        userCount: parseInt(userCount)
      };
    } catch (error) {
      this.logger.error('User metrics error:', error);
      return { userCount: 0 };
    }
  }

  async getSessionMetrics() {
    try {
      const response = await fetch(`${this.config.supabaseUrl}/rest/v1/meditation_sessions?select=count&created_at=gte.${new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()}`, {
        headers: {
          'apikey': this.config.supabaseKey,
          'Authorization': `Bearer ${this.config.supabaseKey}`,
          'Prefer': 'count=exact'
        }
      });

      const sessionCount = response.headers.get('content-range')?.split('/')[1] || '0';
      
      return {
        sessionCount: parseInt(sessionCount)
      };
    } catch (error) {
      this.logger.error('Session metrics error:', error);
      return { sessionCount: 0 };
    }
  }

  async getCulturalMetrics() {
    // Mock cultural engagement metrics
    // In production, this would query actual cultural interaction data
    return {
      culturalEngagement: Math.floor(Math.random() * 100),
      aiPersonalizationUsage: Math.floor(Math.random() * 100)
    };
  }

  checkSystemAlerts() {
    const { cpu, memory, disk } = this.metrics.systemHealth;

    if (cpu > 80) {
      this.createAlert('warning', `High CPU usage: ${cpu}%`);
    }

    if (memory > 85) {
      this.createAlert('warning', `High memory usage: ${memory}%`);
    }

    if (disk > 90) {
      this.createAlert('error', `Low disk space: ${100 - disk}% remaining`);
    }
  }

  createAlert(level, message) {
    const alert = {
      id: Date.now().toString(),
      level,
      message,
      timestamp: new Date().toISOString(),
      acknowledged: false
    };

    this.alerts.unshift(alert);
    
    // Keep only last 1000 alerts
    if (this.alerts.length > 1000) {
      this.alerts = this.alerts.slice(0, 1000);
    }

    // Log alert
    this.logger[level](message);

    // Broadcast to clients
    this.broadcastToClients('alert', alert);

    // Send external notifications
    this.sendAlertNotifications(alert);
  }

  async sendAlertNotifications(alert) {
    // Email notifications
    if (this.config.alerts.email && alert.level === 'error') {
      // Email notification implementation would go here
    }

    // Telegram notifications
    if (this.config.alerts.telegram && alert.level === 'error') {
      // Telegram bot notification implementation would go here
    }

    // Webhook notifications
    if (this.config.alerts.webhook) {
      try {
        await fetch(this.config.alerts.webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(alert)
        });
      } catch (error) {
        this.logger.error('Webhook notification failed:', error);
      }
    }
  }

  broadcastToClients(type, data) {
    const message = JSON.stringify({ type, data, timestamp: new Date().toISOString() });
    
    this.wss.clients.forEach(client => {
      if (client.readyState === 1) { // WebSocket.OPEN
        client.send(message);
      }
    });
  }

  async saveMetrics() {
    const metricsFile = `logs/metrics-${new Date().toISOString().split('T')[0]}.json`;
    const existingMetrics = await fs.readJson(metricsFile).catch(() => []);
    
    existingMetrics.push({
      timestamp: new Date().toISOString(),
      ...this.metrics
    });

    await fs.writeJson(metricsFile, existingMetrics, { spaces: 2 });
  }

  async generateDailySummary() {
    const summary = {
      date: new Date().toISOString().split('T')[0],
      metrics: this.metrics,
      alerts: this.alerts.filter(alert => 
        new Date(alert.timestamp).toDateString() === new Date().toDateString()
      ).length,
      uptime: (this.metrics.uptime / (24 * 60 * 2)) * 100, // Percentage uptime (checks every 30s)
      averageResponseTime: this.metrics.responseTime
    };

    await fs.writeJson(`logs/daily-summary-${summary.date}.json`, summary, { spaces: 2 });
    this.logger.info('Daily summary generated');
  }

  displayStartupInfo() {
    console.log(chalk.cyan('\n🚀 Sembalun Monitor Dashboard'));
    console.log(chalk.gray('====================================='));
    console.log(`${chalk.green('✓')} Monitor Server: ${chalk.blue(`http://localhost:${this.config.port}`)}`);
    console.log(`${chalk.green('✓')} WebSocket: ${chalk.blue(`ws://localhost:${this.config.port + 1}`)}`);
    console.log(`${chalk.green('✓')} Dashboard: ${chalk.blue(`http://localhost:${this.config.port}/dashboard`)}`);
    console.log(`${chalk.green('✓')} Health Check: ${chalk.blue(`http://localhost:${this.config.port}/health`)}`);
    console.log(`${chalk.green('✓')} API Docs: ${chalk.blue(`http://localhost:${this.config.port}/api`)}`);
    console.log(chalk.gray('====================================='));
    console.log(`${chalk.yellow('⚡')} Monitoring: ${chalk.white(this.config.appUrl)}`);
    console.log(`${chalk.yellow('⏱️')} Check Interval: ${chalk.white(this.config.checkInterval / 1000)}s`);
    console.log(`${chalk.yellow('📊')} Version: ${chalk.white(packageJson.version)}\n`);
  }

  async stop() {
    if (!this.isRunning) {
      return;
    }

    const spinner = ora('Stopping Sembalun Monitor...').start();

    try {
      // Stop cron jobs
      if (this.healthCheckJob) this.healthCheckJob.stop();
      if (this.metricsJob) this.metricsJob.stop();
      if (this.summaryJob) this.summaryJob.stop();

      // Close WebSocket server
      if (this.wss) {
        this.wss.close();
      }

      // Close HTTP server
      if (this.server) {
        this.server.close();
      }

      this.isRunning = false;
      spinner.succeed(chalk.green('Sembalun Monitor stopped successfully!'));

    } catch (error) {
      spinner.fail(chalk.red('Error stopping monitor'));
      this.logger.error('Stop error:', error);
      throw error;
    }
  }
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const monitor = new SembalunMonitor();
  
  process.on('SIGINT', async () => {
    console.log(chalk.yellow('\nShutting down gracefully...'));
    await monitor.stop();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    await monitor.stop();
    process.exit(0);
  });

  monitor.start().catch(error => {
    console.error(chalk.red('Failed to start monitor:'), error);
    process.exit(1);
  });
}

export default SembalunMonitor;