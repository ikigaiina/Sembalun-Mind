#!/usr/bin/env node

/**
 * Sembalun Monitor Alert System
 * Advanced alerting with multiple channels and intelligent thresholds
 */

import nodemailer from 'nodemailer';
import fetch from 'node-fetch';
import fs from 'fs-extra';
import chalk from 'chalk';
import winston from 'winston';
import { CronJob } from 'cron';

class AlertSystem {
  constructor(config = {}) {
    this.config = {
      alertsFile: 'data/alerts.json',
      rulesFile: 'config/alert-rules.json',
      maxAlerts: 10000,
      digestInterval: '0 8 * * *', // Daily at 8 AM
      ...config
    };

    this.alerts = [];
    this.rules = [];
    this.channels = new Map();
    this.rateLimits = new Map();
    
    this.setupLogger();
    this.loadAlerts();
    this.loadRules();
    this.setupChannels();
    this.startDigestJob();
  }

  setupLogger() {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      transports: [
        new winston.transports.File({ filename: 'logs/alerts.log' }),
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        })
      ]
    });
  }

  async loadAlerts() {
    try {
      if (await fs.exists(this.config.alertsFile)) {
        this.alerts = await fs.readJson(this.config.alertsFile);
      }
    } catch (error) {
      this.logger.error('Failed to load alerts:', error);
      this.alerts = [];
    }
  }

  async saveAlerts() {
    try {
      await fs.ensureDir('data');
      await fs.writeJson(this.config.alertsFile, this.alerts, { spaces: 2 });
    } catch (error) {
      this.logger.error('Failed to save alerts:', error);
    }
  }

  async loadRules() {
    try {
      if (await fs.exists(this.config.rulesFile)) {
        this.rules = await fs.readJson(this.config.rulesFile);
      } else {
        this.rules = this.getDefaultRules();
        await this.saveRules();
      }
    } catch (error) {
      this.logger.error('Failed to load alert rules:', error);
      this.rules = this.getDefaultRules();
    }
  }

  async saveRules() {
    try {
      await fs.ensureDir('config');
      await fs.writeJson(this.config.rulesFile, this.rules, { spaces: 2 });
    } catch (error) {
      this.logger.error('Failed to save alert rules:', error);
    }
  }

  getDefaultRules() {
    return [
      {
        id: 'high_response_time',
        name: 'High Response Time',
        condition: 'responseTime > 3000',
        severity: 'warning',
        channels: ['console', 'webhook'],
        rateLimitMinutes: 5,
        enabled: true
      },
      {
        id: 'critical_response_time',
        name: 'Critical Response Time',
        condition: 'responseTime > 5000',
        severity: 'critical',
        channels: ['console', 'email', 'webhook'],
        rateLimitMinutes: 1,
        enabled: true
      },
      {
        id: 'high_cpu',
        name: 'High CPU Usage',
        condition: 'systemHealth.cpu > 80',
        severity: 'warning',
        channels: ['console', 'webhook'],
        rateLimitMinutes: 10,
        enabled: true
      },
      {
        id: 'critical_cpu',
        name: 'Critical CPU Usage',
        condition: 'systemHealth.cpu > 90',
        severity: 'critical',
        channels: ['console', 'email', 'webhook'],
        rateLimitMinutes: 5,
        enabled: true
      },
      {
        id: 'high_memory',
        name: 'High Memory Usage',
        condition: 'systemHealth.memory > 85',
        severity: 'warning',
        channels: ['console', 'webhook'],
        rateLimitMinutes: 10,
        enabled: true
      },
      {
        id: 'low_disk_space',
        name: 'Low Disk Space',
        condition: 'systemHealth.disk > 90',
        severity: 'critical',
        channels: ['console', 'email', 'webhook'],
        rateLimitMinutes: 30,
        enabled: true
      },
      {
        id: 'app_down',
        name: 'Application Down',
        condition: 'uptime === 0',
        severity: 'critical',
        channels: ['console', 'email', 'webhook', 'telegram'],
        rateLimitMinutes: 1,
        enabled: true
      },
      {
        id: 'high_error_rate',
        name: 'High Error Rate',
        condition: 'errorRate > 5',
        severity: 'warning',
        channels: ['console', 'webhook'],
        rateLimitMinutes: 5,
        enabled: true
      },
      {
        id: 'low_user_activity',
        name: 'Low User Activity',
        condition: 'sessionCount < 10 && Date.now() - Date.parse(timestamp) < 3600000', // Less than 10 sessions in the last hour
        severity: 'info',
        channels: ['console'],
        rateLimitMinutes: 60,
        enabled: false
      },
      {
        id: 'cultural_engagement_drop',
        name: 'Cultural Engagement Drop',
        condition: 'culturalEngagement < 30',
        severity: 'warning',
        channels: ['console', 'webhook'],
        rateLimitMinutes: 30,
        enabled: true
      }
    ];
  }

  setupChannels() {
    // Console channel (always available)
    this.channels.set('console', {
      send: async (alert) => {
        const color = this.getSeverityColor(alert.severity);
        console.log(color(`🚨 ${alert.severity.toUpperCase()}: ${alert.message}`));
      }
    });

    // Email channel
    if (this.config.email?.enabled) {
      const transporter = nodemailer.createTransporter(this.config.email.smtp);
      
      this.channels.set('email', {
        send: async (alert) => {
          try {
            await transporter.sendMail({
              from: this.config.email.smtp.auth.user,
              to: this.config.email.recipients.join(','),
              subject: `${this.config.email.subject} - ${alert.severity.toUpperCase()}`,
              html: this.generateEmailHTML(alert)
            });
            
            this.logger.info('Email alert sent successfully');
          } catch (error) {
            this.logger.error('Failed to send email alert:', error);
          }
        }
      });
    }

    // Webhook channel (Slack, Discord, etc.)
    if (this.config.webhook?.enabled) {
      this.channels.set('webhook', {
        send: async (alert) => {
          try {
            const payload = this.generateWebhookPayload(alert);
            
            const response = await fetch(this.config.webhook.url, {
              method: this.config.webhook.method || 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...this.config.webhook.headers
              },
              body: JSON.stringify(payload)
            });

            if (!response.ok) {
              throw new Error(`Webhook returned status ${response.status}`);
            }

            this.logger.info('Webhook alert sent successfully');
          } catch (error) {
            this.logger.error('Failed to send webhook alert:', error);
          }
        }
      });
    }

    // Telegram channel
    if (this.config.telegram?.enabled) {
      this.channels.set('telegram', {
        send: async (alert) => {
          try {
            const message = this.generateTelegramMessage(alert);
            
            await fetch(`https://api.telegram.org/bot${this.config.telegram.botToken}/sendMessage`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chat_id: this.config.telegram.chatId,
                text: message,
                parse_mode: 'HTML'
              })
            });

            this.logger.info('Telegram alert sent successfully');
          } catch (error) {
            this.logger.error('Failed to send Telegram alert:', error);
          }
        }
      });
    }
  }

  getSeverityColor(severity) {
    switch (severity) {
      case 'critical': return chalk.red;
      case 'warning': return chalk.yellow;
      case 'info': return chalk.blue;
      default: return chalk.white;
    }
  }

  generateEmailHTML(alert) {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Sembalun Monitor Alert</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .header { background: #1e3c72; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .alert-${alert.severity} { 
            padding: 15px; 
            border-left: 5px solid ${alert.severity === 'critical' ? '#ef4444' : alert.severity === 'warning' ? '#fbbf24' : '#3b82f6'};
            background: ${alert.severity === 'critical' ? '#fef2f2' : alert.severity === 'warning' ? '#fffbeb' : '#eff6ff'};
            margin: 15px 0;
        }
        .timestamp { color: #666; font-size: 0.9em; }
        .metrics { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0; }
        .footer { text-align: center; color: #666; font-size: 0.9em; padding: 20px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🧘‍♀️ Sembalun Monitor Alert</h1>
        <p>Your meditation platform monitoring system</p>
    </div>
    
    <div class="content">
        <div class="alert-${alert.severity}">
            <h2>${alert.severity.toUpperCase()}: ${alert.rule?.name || 'Alert'}</h2>
            <p><strong>Message:</strong> ${alert.message}</p>
            <p class="timestamp"><strong>Time:</strong> ${new Date(alert.timestamp).toLocaleString()}</p>
        </div>
        
        ${alert.metrics ? `
        <div class="metrics">
            <h3>Current Metrics</h3>
            <ul>
                ${alert.metrics.responseTime ? `<li>Response Time: ${alert.metrics.responseTime}ms</li>` : ''}
                ${alert.metrics.systemHealth ? `
                    <li>CPU Usage: ${alert.metrics.systemHealth.cpu}%</li>
                    <li>Memory Usage: ${alert.metrics.systemHealth.memory}%</li>
                    <li>Disk Usage: ${alert.metrics.systemHealth.disk}%</li>
                ` : ''}
                ${alert.metrics.userCount ? `<li>Active Users: ${alert.metrics.userCount}</li>` : ''}
                ${alert.metrics.sessionCount ? `<li>Daily Sessions: ${alert.metrics.sessionCount}</li>` : ''}
            </ul>
        </div>
        ` : ''}
        
        <p>Please check your <a href="http://localhost:3002">monitoring dashboard</a> for more details.</p>
    </div>
    
    <div class="footer">
        <p>Sembalun Monitor v1.0.0 | Generated at ${new Date().toLocaleString()}</p>
    </div>
</body>
</html>`;
  }

  generateWebhookPayload(alert) {
    const template = this.config.webhook.template;
    
    if (template) {
      // Use custom template
      let payload = JSON.parse(JSON.stringify(template));
      
      // Replace template variables
      const replaceVariables = (obj) => {
        if (typeof obj === 'string') {
          return obj
            .replace(/{{message}}/g, alert.message)
            .replace(/{{level}}/g, alert.severity)
            .replace(/{{timestamp}}/g, alert.timestamp)
            .replace(/{{rule}}/g, alert.rule?.name || 'Unknown');
        } else if (typeof obj === 'object' && obj !== null) {
          for (const key in obj) {
            obj[key] = replaceVariables(obj[key]);
          }
        }
        return obj;
      };
      
      return replaceVariables(payload);
    } else {
      // Default Slack-compatible format
      const color = alert.severity === 'critical' ? 'danger' : 
                   alert.severity === 'warning' ? 'warning' : 'good';
      
      return {
        attachments: [{
          color,
          title: `Sembalun Monitor - ${alert.severity.toUpperCase()}`,
          text: alert.message,
          fields: [
            {
              title: 'Rule',
              value: alert.rule?.name || 'Manual',
              short: true
            },
            {
              title: 'Time',
              value: new Date(alert.timestamp).toLocaleString(),
              short: true
            }
          ],
          footer: 'Sembalun Monitor',
          ts: Math.floor(new Date(alert.timestamp).getTime() / 1000)
        }]
      };
    }
  }

  generateTelegramMessage(alert) {
    const emoji = alert.severity === 'critical' ? '🔴' : 
                 alert.severity === 'warning' ? '🟡' : '🔵';
    
    return `${emoji} <b>Sembalun Monitor Alert</b>

<b>Severity:</b> ${alert.severity.toUpperCase()}
<b>Rule:</b> ${alert.rule?.name || 'Manual'}
<b>Message:</b> ${alert.message}
<b>Time:</b> ${new Date(alert.timestamp).toLocaleString()}

${alert.metrics ? `
<b>Current Metrics:</b>
${alert.metrics.responseTime ? `• Response Time: ${alert.metrics.responseTime}ms` : ''}
${alert.metrics.systemHealth ? `• CPU: ${alert.metrics.systemHealth.cpu}% | Memory: ${alert.metrics.systemHealth.memory}%` : ''}
` : ''}

Check your dashboard for more details.`;
  }

  async processMetrics(metrics) {
    const triggeredRules = [];
    
    for (const rule of this.rules) {
      if (!rule.enabled) continue;
      
      try {
        // Check if rule condition is met
        if (this.evaluateCondition(rule.condition, metrics)) {
          // Check rate limiting
          if (this.isRateLimited(rule.id, rule.rateLimitMinutes || 5)) {
            continue;
          }
          
          triggeredRules.push(rule);
          
          // Create alert
          const alert = await this.createAlert({
            ruleId: rule.id,
            rule,
            severity: rule.severity,
            message: this.generateAlertMessage(rule, metrics),
            metrics,
            timestamp: new Date().toISOString()
          });
          
          // Send through configured channels
          await this.sendAlert(alert, rule.channels || ['console']);
          
          // Update rate limit
          this.updateRateLimit(rule.id);
        }
      } catch (error) {
        this.logger.error(`Error processing rule ${rule.id}:`, error);
      }
    }
    
    return triggeredRules;
  }

  evaluateCondition(condition, metrics) {
    try {
      // Create a safe evaluation context
      const context = {
        ...metrics,
        Date,
        Math,
        timestamp: new Date().toISOString()
      };
      
      // Simple condition evaluation (in production, consider using a safer library)
      const func = new Function(...Object.keys(context), `return ${condition}`);
      return func(...Object.values(context));
    } catch (error) {
      this.logger.error('Condition evaluation error:', error);
      return false;
    }
  }

  isRateLimited(ruleId, minutes) {
    const key = `rule_${ruleId}`;
    const limit = this.rateLimits.get(key);
    
    if (!limit) return false;
    
    const now = Date.now();
    const limitTime = minutes * 60 * 1000;
    
    return (now - limit) < limitTime;
  }

  updateRateLimit(ruleId) {
    const key = `rule_${ruleId}`;
    this.rateLimits.set(key, Date.now());
  }

  generateAlertMessage(rule, metrics) {
    // Generate a descriptive message based on the rule
    switch (rule.id) {
      case 'high_response_time':
      case 'critical_response_time':
        return `Response time is ${metrics.responseTime}ms (threshold: ${rule.id.includes('critical') ? '5000ms' : '3000ms'})`;
      
      case 'high_cpu':
      case 'critical_cpu':
        return `CPU usage is ${metrics.systemHealth?.cpu}% (threshold: ${rule.id.includes('critical') ? '90%' : '80%'})`;
      
      case 'high_memory':
        return `Memory usage is ${metrics.systemHealth?.memory}% (threshold: 85%)`;
      
      case 'low_disk_space':
        return `Disk usage is ${metrics.systemHealth?.disk}% (threshold: 90%)`;
      
      case 'app_down':
        return 'Application appears to be down or unreachable';
      
      case 'high_error_rate':
        return `Error rate is ${metrics.errorRate}% (threshold: 5%)`;
      
      case 'low_user_activity':
        return `Only ${metrics.sessionCount} sessions today (threshold: 10)`;
      
      case 'cultural_engagement_drop':
        return `Cultural engagement is ${metrics.culturalEngagement}% (threshold: 30%)`;
      
      default:
        return `Alert triggered: ${rule.name}`;
    }
  }

  async createAlert(alertData) {
    const alert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...alertData,
      acknowledged: false,
      createdAt: new Date().toISOString()
    };
    
    this.alerts.unshift(alert);
    
    // Keep only recent alerts in memory
    if (this.alerts.length > this.config.maxAlerts) {
      this.alerts = this.alerts.slice(0, this.config.maxAlerts);
    }
    
    await this.saveAlerts();
    return alert;
  }

  async sendAlert(alert, channels) {
    const promises = channels.map(async (channelName) => {
      const channel = this.channels.get(channelName);
      if (channel) {
        try {
          await channel.send(alert);
        } catch (error) {
          this.logger.error(`Failed to send alert via ${channelName}:`, error);
        }
      } else {
        this.logger.warn(`Unknown alert channel: ${channelName}`);
      }
    });
    
    await Promise.allSettled(promises);
  }

  async acknowledgeAlert(alertId) {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      alert.acknowledgedAt = new Date().toISOString();
      await this.saveAlerts();
      return alert;
    }
    return null;
  }

  startDigestJob() {
    new CronJob(this.config.digestInterval, async () => {
      await this.sendDailyDigest();
    }).start();
  }

  async sendDailyDigest() {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const dayAlerts = this.alerts.filter(alert => 
      new Date(alert.timestamp) > yesterday
    );
    
    if (dayAlerts.length === 0) return;
    
    const digest = {
      date: new Date().toISOString().split('T')[0],
      totalAlerts: dayAlerts.length,
      critical: dayAlerts.filter(a => a.severity === 'critical').length,
      warning: dayAlerts.filter(a => a.severity === 'warning').length,
      info: dayAlerts.filter(a => a.severity === 'info').length,
      topRules: this.getTopTriggeredRules(dayAlerts),
      summary: this.generateDigestSummary(dayAlerts)
    };
    
    // Send digest via email if configured
    if (this.channels.has('email')) {
      await this.channels.get('email').send({
        severity: 'info',
        message: 'Daily Alert Digest',
        digest,
        timestamp: new Date().toISOString()
      });
    }
    
    this.logger.info('Daily digest sent', digest);
  }

  getTopTriggeredRules(alerts) {
    const ruleCounts = {};
    alerts.forEach(alert => {
      const ruleName = alert.rule?.name || 'Unknown';
      ruleCounts[ruleName] = (ruleCounts[ruleName] || 0) + 1;
    });
    
    return Object.entries(ruleCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([rule, count]) => ({ rule, count }));
  }

  generateDigestSummary(alerts) {
    if (alerts.length === 0) return 'No alerts in the last 24 hours.';
    
    const critical = alerts.filter(a => a.severity === 'critical').length;
    const warning = alerts.filter(a => a.severity === 'warning').length;
    
    let summary = `${alerts.length} alerts in the last 24 hours. `;
    
    if (critical > 0) {
      summary += `${critical} critical alerts require immediate attention. `;
    }
    
    if (warning > 0) {
      summary += `${warning} warnings detected. `;
    }
    
    return summary;
  }

  getAlerts(options = {}) {
    let filtered = [...this.alerts];
    
    if (options.severity) {
      filtered = filtered.filter(alert => alert.severity === options.severity);
    }
    
    if (options.acknowledged !== undefined) {
      filtered = filtered.filter(alert => alert.acknowledged === options.acknowledged);
    }
    
    if (options.ruleId) {
      filtered = filtered.filter(alert => alert.ruleId === options.ruleId);
    }
    
    if (options.since) {
      filtered = filtered.filter(alert => new Date(alert.timestamp) > new Date(options.since));
    }
    
    return filtered.slice(0, options.limit || 100);
  }
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log(chalk.cyan('\n🚨 Sembalun Alert System\n'));
  
  const alertSystem = new AlertSystem();
  
  // Test alert
  setTimeout(async () => {
    await alertSystem.processMetrics({
      responseTime: 4000,
      systemHealth: { cpu: 85, memory: 70, disk: 20 },
      uptime: 1,
      userCount: 150,
      sessionCount: 45,
      culturalEngagement: 78,
      errorRate: 2
    });
  }, 2000);
  
  process.on('SIGINT', () => {
    console.log(chalk.yellow('\nShutting down alert system...'));
    process.exit(0);
  });
}

export default AlertSystem;