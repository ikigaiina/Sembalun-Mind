#!/usr/bin/env node

/**
 * Sembalun Monitor Log Aggregator
 * Centralized log collection and analysis system
 */

import fs from 'fs-extra';
import path from 'path';
import winston from 'winston';
import { CronJob } from 'cron';
import chalk from 'chalk';
import { WebSocketServer } from 'ws';

class LogAggregator {
  constructor(config = {}) {
    this.config = {
      logDir: config.logDir || 'logs',
      retentionDays: config.retentionDays || 30,
      maxLogSize: config.maxLogSize || 10 * 1024 * 1024, // 10MB
      port: config.port || 3003,
      patterns: config.patterns || {
        error: /ERROR|FATAL|CRITICAL/i,
        warning: /WARN|WARNING/i,
        info: /INFO|DEBUG/i,
        performance: /SLOW|TIMEOUT|PERFORMANCE/i,
        security: /SECURITY|AUTH|UNAUTHORIZED/i,
        user: /USER|SESSION|LOGIN/i
      },
      ...config
    };

    this.logs = [];
    this.stats = {
      totalLogs: 0,
      errorCount: 0,
      warningCount: 0,
      infoCount: 0,
      lastProcessed: null
    };

    this.setupLogger();
    this.setupWebSocket();
    this.startLogWatcher();
    this.startCleanupJob();
  }

  setupLogger() {
    // Ensure logs directory exists
    fs.ensureDirSync(this.config.logDir);

    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      transports: [
        new winston.transports.File({ 
          filename: path.join(this.config.logDir, 'aggregator.log'),
          maxsize: this.config.maxLogSize,
          maxFiles: 5,
          tailable: true
        }),
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        })
      ]
    });
  }

  setupWebSocket() {
    this.wss = new WebSocketServer({ port: this.config.port });
    
    this.wss.on('connection', (ws) => {
      this.logger.info('Log viewer connected');
      
      // Send recent logs
      ws.send(JSON.stringify({
        type: 'init',
        data: {
          logs: this.logs.slice(-100),
          stats: this.stats
        }
      }));
      
      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message.toString());
          this.handleWebSocketMessage(ws, data);
        } catch (error) {
          this.logger.error('WebSocket message error:', error);
        }
      });
      
      ws.on('close', () => {
        this.logger.info('Log viewer disconnected');
      });
    });
  }

  handleWebSocketMessage(ws, data) {
    switch (data.type) {
      case 'filter':
        const filteredLogs = this.filterLogs(data.filter);
        ws.send(JSON.stringify({
          type: 'filtered',
          data: filteredLogs
        }));
        break;
        
      case 'search':
        const searchResults = this.searchLogs(data.query);
        ws.send(JSON.stringify({
          type: 'search_results',
          data: searchResults
        }));
        break;
        
      case 'export':
        const exportData = this.exportLogs(data.format, data.filter);
        ws.send(JSON.stringify({
          type: 'export',
          data: exportData
        }));
        break;
    }
  }

  startLogWatcher() {
    // Watch for new log files
    const logFiles = [
      'combined.log',
      'error.log',
      'access.log',
      'performance.log',
      'security.log'
    ];

    logFiles.forEach(filename => {
      const filePath = path.join(this.config.logDir, filename);
      
      // Create file if it doesn't exist
      fs.ensureFileSync(filePath);
      
      // Watch for changes
      fs.watchFile(filePath, { interval: 1000 }, () => {
        this.processLogFile(filePath);
      });
    });

    // Initial processing
    logFiles.forEach(filename => {
      const filePath = path.join(this.config.logDir, filename);
      this.processLogFile(filePath);
    });
  }

  async processLogFile(filePath) {
    try {
      const exists = await fs.exists(filePath);
      if (!exists) return;

      const stats = await fs.stat(filePath);
      const filename = path.basename(filePath);
      
      // Skip if file hasn't been modified recently
      const lastModified = stats.mtime.getTime();
      const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
      
      if (lastModified < fiveMinutesAgo) return;

      const content = await fs.readFile(filePath, 'utf8');
      const lines = content.split('\\n').filter(Boolean);
      
      // Process new lines
      lines.forEach(line => {
        const logEntry = this.parseLogLine(line, filename);
        if (logEntry) {
          this.addLog(logEntry);
        }
      });
      
      this.stats.lastProcessed = new Date().toISOString();
      
    } catch (error) {
      this.logger.error('Error processing log file:', filePath, error);
    }
  }

  parseLogLine(line, source) {
    try {
      // Try to parse as JSON first
      const jsonLog = JSON.parse(line);
      return {
        ...jsonLog,
        source,
        parsedAt: new Date().toISOString()
      };
    } catch {
      // Parse as plain text
      const timestamp = this.extractTimestamp(line);
      const level = this.extractLogLevel(line);
      const message = this.cleanLogMessage(line);
      
      return {
        timestamp: timestamp || new Date().toISOString(),
        level: level || 'info',
        message,
        source,
        raw: line,
        parsedAt: new Date().toISOString()
      };
    }
  }

  extractTimestamp(line) {
    // Common timestamp patterns
    const patterns = [
      /\\d{4}-\\d{2}-\\d{2}[T ]\\d{2}:\\d{2}:\\d{2}(?:\\.\\d{3})?(?:Z|[+-]\\d{2}:\\d{2})?/,
      /\\[([^\\]]+)\\]/,
      /^\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}/
    ];

    for (const pattern of patterns) {
      const match = line.match(pattern);
      if (match) {
        try {
          return new Date(match[0].replace(/[\\[\\]]/g, '')).toISOString();
        } catch {
          continue;
        }
      }
    }

    return null;
  }

  extractLogLevel(line) {
    const upperLine = line.toUpperCase();
    
    if (this.config.patterns.error.test(upperLine)) return 'error';
    if (this.config.patterns.warning.test(upperLine)) return 'warn';
    if (upperLine.includes('DEBUG')) return 'debug';
    
    return 'info';
  }

  cleanLogMessage(line) {
    // Remove timestamp and level prefixes
    let cleaned = line
      .replace(/^\\d{4}-\\d{2}-\\d{2}[T ]\\d{2}:\\d{2}:\\d{2}(?:\\.\\d{3})?(?:Z|[+-]\\d{2}:\\d{2})?\\s*/g, '')
      .replace(/^\\[[^\\]]+\\]\\s*/g, '')
      .replace(/^(ERROR|WARN|INFO|DEBUG)\\s*:?\\s*/gi, '')
      .trim();

    return cleaned || line;
  }

  addLog(logEntry) {
    // Add unique ID
    logEntry.id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    
    // Categorize log
    logEntry.category = this.categorizeLog(logEntry);
    
    // Add to memory store
    this.logs.unshift(logEntry);
    
    // Keep only recent logs in memory
    if (this.logs.length > 10000) {
      this.logs = this.logs.slice(0, 10000);
    }
    
    // Update stats
    this.updateStats(logEntry);
    
    // Broadcast to connected clients
    this.broadcastLog(logEntry);
    
    // Check for alerts
    this.checkLogAlerts(logEntry);
  }

  categorizeLog(logEntry) {
    const message = logEntry.message.toLowerCase();
    
    if (this.config.patterns.security.test(message)) return 'security';
    if (this.config.patterns.performance.test(message)) return 'performance';
    if (this.config.patterns.user.test(message)) return 'user';
    if (logEntry.level === 'error') return 'error';
    if (logEntry.level === 'warn') return 'warning';
    
    return 'general';
  }

  updateStats(logEntry) {
    this.stats.totalLogs++;
    
    switch (logEntry.level) {
      case 'error':
        this.stats.errorCount++;
        break;
      case 'warn':
        this.stats.warningCount++;
        break;
      default:
        this.stats.infoCount++;
    }
  }

  broadcastLog(logEntry) {
    const message = JSON.stringify({
      type: 'new_log',
      data: logEntry
    });
    
    this.wss.clients.forEach(client => {
      if (client.readyState === 1) { // WebSocket.OPEN
        client.send(message);
      }
    });
  }

  checkLogAlerts(logEntry) {
    // Check for critical errors
    if (logEntry.level === 'error' && logEntry.message.toLowerCase().includes('critical')) {
      this.sendAlert({
        level: 'critical',
        message: \`Critical error detected: \${logEntry.message}\`,
        source: 'log-aggregator',
        logEntry
      });
    }
    
    // Check for repeated errors
    const recentErrors = this.logs
      .filter(log => log.level === 'error' && log.timestamp > new Date(Date.now() - 5 * 60 * 1000).toISOString())
      .length;
      
    if (recentErrors > 10) {
      this.sendAlert({
        level: 'warning',
        message: \`High error rate: \${recentErrors} errors in the last 5 minutes\`,
        source: 'log-aggregator'
      });
    }
  }

  sendAlert(alert) {
    // This would integrate with the main monitor's alert system
    this.logger.warn('LOG ALERT:', alert);
    
    // Broadcast alert to dashboard
    const message = JSON.stringify({
      type: 'alert',
      data: alert
    });
    
    this.wss.clients.forEach(client => {
      if (client.readyState === 1) {
        client.send(message);
      }
    });
  }

  filterLogs(filter) {
    let filtered = [...this.logs];
    
    if (filter.level && filter.level !== 'all') {
      filtered = filtered.filter(log => log.level === filter.level);
    }
    
    if (filter.category && filter.category !== 'all') {
      filtered = filtered.filter(log => log.category === filter.category);
    }
    
    if (filter.source && filter.source !== 'all') {
      filtered = filtered.filter(log => log.source === filter.source);
    }
    
    if (filter.startDate) {
      filtered = filtered.filter(log => log.timestamp >= filter.startDate);
    }
    
    if (filter.endDate) {
      filtered = filtered.filter(log => log.timestamp <= filter.endDate);
    }
    
    return filtered.slice(0, filter.limit || 1000);
  }

  searchLogs(query) {
    const regex = new RegExp(query, 'i');
    
    return this.logs.filter(log => 
      regex.test(log.message) || 
      regex.test(log.source) ||
      regex.test(log.level)
    ).slice(0, 500);
  }

  exportLogs(format, filter = {}) {
    const logs = this.filterLogs(filter);
    
    switch (format) {
      case 'json':
        return JSON.stringify(logs, null, 2);
        
      case 'csv':
        const headers = ['timestamp', 'level', 'message', 'source', 'category'];
        const csvRows = [headers.join(',')];
        
        logs.forEach(log => {
          const row = headers.map(header => {
            const value = log[header] || '';
            return \`"\${value.toString().replace(/"/g, '""')}"\`;
          });
          csvRows.push(row.join(','));
        });
        
        return csvRows.join('\\n');
        
      case 'txt':
        return logs.map(log => 
          \`[\${log.timestamp}] \${log.level.toUpperCase()}: \${log.message} (\${log.source})\`
        ).join('\\n');
        
      default:
        return logs;
    }
  }

  async generateReport() {
    const report = {
      generated: new Date().toISOString(),
      period: '24h',
      stats: {
        ...this.stats,
        logsPerHour: Math.round(this.stats.totalLogs / 24),
        errorRate: (this.stats.errorCount / this.stats.totalLogs * 100).toFixed(2)
      },
      categories: {},
      sources: {},
      topErrors: [],
      trends: []
    };

    // Category breakdown
    this.logs.forEach(log => {
      report.categories[log.category] = (report.categories[log.category] || 0) + 1;
      report.sources[log.source] = (report.sources[log.source] || 0) + 1;
    });

    // Top errors
    const errorMessages = {};
    this.logs.filter(log => log.level === 'error').forEach(log => {
      const key = log.message.substring(0, 100);
      errorMessages[key] = (errorMessages[key] || 0) + 1;
    });

    report.topErrors = Object.entries(errorMessages)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([message, count]) => ({ message, count }));

    // Save report
    const reportPath = path.join(this.config.logDir, \`log-report-\${new Date().toISOString().split('T')[0]}.json\`);
    await fs.writeJson(reportPath, report, { spaces: 2 });

    return report;
  }

  startCleanupJob() {
    // Daily cleanup job
    new CronJob('0 2 * * *', async () => {
      await this.cleanupOldLogs();
      await this.generateReport();
    }).start();
  }

  async cleanupOldLogs() {
    try {
      const cutoffDate = new Date(Date.now() - (this.config.retentionDays * 24 * 60 * 60 * 1000));
      
      // Clean up log files
      const logFiles = await fs.readdir(this.config.logDir);
      
      for (const file of logFiles) {
        const filePath = path.join(this.config.logDir, file);
        const stats = await fs.stat(filePath);
        
        if (stats.mtime < cutoffDate) {
          await fs.remove(filePath);
          this.logger.info(\`Cleaned up old log file: \${file}\`);
        }
      }
      
      // Clean up in-memory logs
      const cutoffTime = cutoffDate.toISOString();
      const originalLength = this.logs.length;
      this.logs = this.logs.filter(log => log.timestamp > cutoffTime);
      
      const cleaned = originalLength - this.logs.length;
      if (cleaned > 0) {
        this.logger.info(\`Cleaned up \${cleaned} old log entries from memory\`);
      }
      
    } catch (error) {
      this.logger.error('Cleanup error:', error);
    }
  }

  start() {
    this.logger.info(\`Log aggregator started on port \${this.config.port}\`);
    this.logger.info(\`Watching log directory: \${path.resolve(this.config.logDir)}\`);
    this.logger.info(\`Retention period: \${this.config.retentionDays} days\`);
    
    console.log(chalk.green('\\n📝 Sembalun Log Aggregator Started'));
    console.log(chalk.blue(\`🔍 WebSocket Server: ws://localhost:\${this.config.port}\`));
    console.log(chalk.yellow(\`📁 Log Directory: \${path.resolve(this.config.logDir)}\`));
    console.log(chalk.gray(\`🗑️ Retention: \${this.config.retentionDays} days\\n\`));
  }

  stop() {
    if (this.wss) {
      this.wss.close();
    }
    
    this.logger.info('Log aggregator stopped');
  }
}

// CLI usage
if (import.meta.url === \`file://\${process.argv[1]}\`) {
  const aggregator = new LogAggregator();
  
  process.on('SIGINT', () => {
    console.log(chalk.yellow('\\nShutting down log aggregator...'));
    aggregator.stop();
    process.exit(0);
  });
  
  aggregator.start();
}

export default LogAggregator;