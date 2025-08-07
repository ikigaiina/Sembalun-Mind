// Enterprise Health Check System for Sembalun Meditation Platform
// Comprehensive monitoring for production deployment

class HealthCheckMonitor {
  constructor(config = {}) {
    this.config = {
      checkInterval: config.checkInterval || 30000, // 30 seconds
      alertThreshold: config.alertThreshold || 3, // 3 failed checks before alert
      criticalThreshold: config.criticalThreshold || 5, // 5 failed checks before critical
      timeout: config.timeout || 10000, // 10 second timeout
      retries: config.retries || 2,
      ...config,
    };
    
    this.checks = new Map();
    this.failureCount = new Map();
    this.lastResults = new Map();
    this.alerts = [];
    this.isMonitoring = false;
    
    this.initializeChecks();
  }

  initializeChecks() {
    // Core application health checks
    this.addCheck('app_accessibility', this.checkAppAccessibility.bind(this));
    this.addCheck('authentication', this.checkAuthentication.bind(this));
    this.addCheck('database_connectivity', this.checkDatabaseConnectivity.bind(this));
    this.addCheck('audio_services', this.checkAudioServices.bind(this));
    this.addCheck('pwa_functionality', this.checkPWAFunctionality.bind(this));
    this.addCheck('performance_metrics', this.checkPerformanceMetrics.bind(this));
    this.addCheck('security_headers', this.checkSecurityHeaders.bind(this));
    this.addCheck('meditation_features', this.checkMeditationFeatures.bind(this));
  }

  addCheck(name, checkFunction) {
    this.checks.set(name, checkFunction);
    this.failureCount.set(name, 0);
  }

  async startMonitoring() {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    console.log('🏥 Starting health check monitoring...');
    
    // Run initial checks
    await this.runAllChecks();
    
    // Schedule periodic checks
    this.monitoringInterval = setInterval(async () => {
      await this.runAllChecks();
    }, this.config.checkInterval);
  }

  stopMonitoring() {
    if (!this.isMonitoring) return;
    
    this.isMonitoring = false;
    clearInterval(this.monitoringInterval);
    console.log('🛑 Health check monitoring stopped');
  }

  async runAllChecks() {
    const results = {};
    const startTime = Date.now();
    
    console.log('🔍 Running health checks...');
    
    for (const [name, checkFunction] of this.checks) {
      try {
        const checkStartTime = Date.now();
        const result = await this.runSingleCheck(name, checkFunction);
        const checkDuration = Date.now() - checkStartTime;
        
        results[name] = {
          ...result,
          duration: checkDuration,
          timestamp: new Date().toISOString(),
        };
        
        // Update failure tracking
        if (result.status === 'healthy') {
          this.failureCount.set(name, 0);
        } else {
          this.failureCount.set(name, this.failureCount.get(name) + 1);
        }
        
        this.lastResults.set(name, results[name]);
        
      } catch (error) {
        results[name] = {
          status: 'error',
          message: error.message,
          error: true,
          duration: 0,
          timestamp: new Date().toISOString(),
        };
        
        this.failureCount.set(name, this.failureCount.get(name) + 1);
      }
    }
    
    const totalDuration = Date.now() - startTime;
    
    // Generate overall health status
    const overallStatus = this.calculateOverallHealth(results);
    
    const healthReport = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      duration: totalDuration,
      checks: results,
      summary: this.generateSummary(results),
    };
    
    // Handle alerts
    await this.handleAlerts(healthReport);
    
    // Log results
    this.logHealthStatus(healthReport);
    
    return healthReport;
  }

  async runSingleCheck(name, checkFunction) {
    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Health check timeout: ${name}`)), this.config.timeout)
    );
    
    try {
      const result = await Promise.race([checkFunction(), timeout]);
      return result || { status: 'healthy', message: 'Check passed' };
    } catch (error) {
      console.error(`❌ Health check failed: ${name}`, error);
      return {
        status: 'unhealthy',
        message: error.message,
        error: true,
      };
    }
  }

  // Individual health check implementations
  async checkAppAccessibility() {
    try {
      const response = await fetch('/', {
        method: 'GET',
        timeout: 5000,
      });
      
      if (response.ok) {
        return {
          status: 'healthy',
          message: 'Application accessible',
          data: {
            status_code: response.status,
            response_time: response.headers.get('x-response-time'),
          },
        };
      } else {
        return {
          status: 'unhealthy',
          message: `HTTP ${response.status}: ${response.statusText}`,
        };
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        message: `Network error: ${error.message}`,
      };
    }
  }

  async checkAuthentication() {
    try {
      // Check if Supabase auth is responding
      const authResponse = await fetch('/api/auth/health', {
        method: 'GET',
        timeout: 5000,
      });
      
      if (authResponse.ok) {
        return {
          status: 'healthy',
          message: 'Authentication service operational',
        };
      } else {
        return {
          status: 'unhealthy',
          message: 'Authentication service unavailable',
        };
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        message: `Auth check failed: ${error.message}`,
      };
    }
  }

  async checkDatabaseConnectivity() {
    try {
      // Simple query to check database connectivity
      const dbResponse = await fetch('/api/health/database', {
        method: 'GET',
        timeout: 8000,
      });
      
      if (dbResponse.ok) {
        const data = await dbResponse.json();
        return {
          status: 'healthy',
          message: 'Database connectivity verified',
          data: {
            connection_count: data.connections,
            query_time: data.query_time,
          },
        };
      } else {
        return {
          status: 'unhealthy',
          message: 'Database connectivity issues',
        };
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        message: `Database check failed: ${error.message}`,
      };
    }
  }

  async checkAudioServices() {
    try {
      // Check if audio files are accessible
      const audioResponse = await fetch('/audio/meditation-bell.mp3', {
        method: 'HEAD',
        timeout: 5000,
      });
      
      if (audioResponse.ok) {
        return {
          status: 'healthy',
          message: 'Audio services operational',
          data: {
            content_length: audioResponse.headers.get('content-length'),
            content_type: audioResponse.headers.get('content-type'),
          },
        };
      } else {
        return {
          status: 'unhealthy',
          message: 'Audio services unavailable',
        };
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        message: `Audio check failed: ${error.message}`,
      };
    }
  }

  async checkPWAFunctionality() {
    try {
      // Check PWA manifest
      const manifestResponse = await fetch('/manifest.json', {
        method: 'GET',
        timeout: 5000,
      });
      
      // Check service worker
      const swResponse = await fetch('/sw.js', {
        method: 'GET',
        timeout: 5000,
      });
      
      if (manifestResponse.ok && swResponse.ok) {
        return {
          status: 'healthy',
          message: 'PWA functionality operational',
          data: {
            manifest_status: manifestResponse.status,
            service_worker_status: swResponse.status,
          },
        };
      } else {
        return {
          status: 'unhealthy',
          message: 'PWA functionality degraded',
        };
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        message: `PWA check failed: ${error.message}`,
      };
    }
  }

  async checkPerformanceMetrics() {
    try {
      const startTime = performance.now();
      
      // Simple performance test - load main page
      const response = await fetch('/', {
        method: 'GET',
        cache: 'no-cache',
      });
      
      const endTime = performance.now();
      const responseTime = endTime - startTime;
      
      const isHealthy = responseTime < 2000; // 2 second threshold
      
      return {
        status: isHealthy ? 'healthy' : 'degraded',
        message: isHealthy ? 'Performance within normal range' : 'Performance degraded',
        data: {
          response_time: Math.round(responseTime),
          threshold: 2000,
          memory_usage: this.getMemoryUsage(),
        },
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: `Performance check failed: ${error.message}`,
      };
    }
  }

  async checkSecurityHeaders() {
    try {
      const response = await fetch('/', { method: 'HEAD' });
      
      const requiredHeaders = [
        'x-frame-options',
        'x-content-type-options',
        'x-xss-protection',
        'strict-transport-security',
      ];
      
      const missingHeaders = requiredHeaders.filter(
        header => !response.headers.has(header)
      );
      
      if (missingHeaders.length === 0) {
        return {
          status: 'healthy',
          message: 'Security headers present',
        };
      } else {
        return {
          status: 'degraded',
          message: `Missing security headers: ${missingHeaders.join(', ')}`,
          data: { missing_headers: missingHeaders },
        };
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        message: `Security header check failed: ${error.message}`,
      };
    }
  }

  async checkMeditationFeatures() {
    try {
      // Check if meditation endpoints are responding
      const meditationResponse = await fetch('/meditation', {
        method: 'GET',
        timeout: 5000,
      });
      
      const breathingResponse = await fetch('/breathing', {
        method: 'GET',
        timeout: 5000,
      });
      
      if (meditationResponse.ok && breathingResponse.ok) {
        return {
          status: 'healthy',
          message: 'Meditation features operational',
        };
      } else {
        return {
          status: 'unhealthy',
          message: 'Meditation features unavailable',
        };
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        message: `Meditation features check failed: ${error.message}`,
      };
    }
  }

  calculateOverallHealth(results) {
    const statuses = Object.values(results).map(r => r.status);
    
    if (statuses.every(s => s === 'healthy')) return 'healthy';
    if (statuses.some(s => s === 'unhealthy' || s === 'error')) return 'unhealthy';
    if (statuses.some(s => s === 'degraded')) return 'degraded';
    
    return 'unknown';
  }

  generateSummary(results) {
    const total = Object.keys(results).length;
    const healthy = Object.values(results).filter(r => r.status === 'healthy').length;
    const degraded = Object.values(results).filter(r => r.status === 'degraded').length;
    const unhealthy = Object.values(results).filter(r => r.status === 'unhealthy' || r.status === 'error').length;
    
    return {
      total_checks: total,
      healthy: healthy,
      degraded: degraded,
      unhealthy: unhealthy,
      success_rate: Math.round((healthy / total) * 100),
    };
  }

  async handleAlerts(healthReport) {
    for (const [checkName, result] of Object.entries(healthReport.checks)) {
      const failureCount = this.failureCount.get(checkName);
      
      if (failureCount >= this.config.criticalThreshold) {
        await this.sendAlert('critical', checkName, result, failureCount);
      } else if (failureCount >= this.config.alertThreshold) {
        await this.sendAlert('warning', checkName, result, failureCount);
      }
    }
  }

  async sendAlert(level, checkName, result, failureCount) {
    const alert = {
      level,
      check: checkName,
      message: result.message,
      failure_count: failureCount,
      timestamp: new Date().toISOString(),
    };
    
    this.alerts.push(alert);
    
    // Log alert
    console.error(`🚨 ${level.toUpperCase()} ALERT: ${checkName} - ${result.message} (${failureCount} failures)`);
    
    // Send to monitoring systems (implement based on your setup)
    if (typeof window !== 'undefined' && window.datadog) {
      window.datadog.addError(new Error(result.message), {
        health_check: checkName,
        alert_level: level,
        failure_count: failureCount,
      });
    }
  }

  logHealthStatus(healthReport) {
    const emoji = healthReport.status === 'healthy' ? '✅' : 
                  healthReport.status === 'degraded' ? '⚠️' : '❌';
    
    console.log(`${emoji} Health Check: ${healthReport.status.toUpperCase()} (${healthReport.duration}ms)`);
    console.log(`   Success Rate: ${healthReport.summary.success_rate}% (${healthReport.summary.healthy}/${healthReport.summary.total_checks})`);
    
    if (healthReport.status !== 'healthy') {
      const failedChecks = Object.entries(healthReport.checks)
        .filter(([_, result]) => result.status !== 'healthy')
        .map(([name, result]) => `${name}: ${result.message}`);
      
      console.warn('   Failed Checks:', failedChecks);
    }
  }

  getMemoryUsage() {
    if ('memory' in performance) {
      return {
        used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
        limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024),
      };
    }
    return null;
  }

  getHealthStatus() {
    const results = {};
    for (const [name, result] of this.lastResults) {
      results[name] = result;
    }
    
    return {
      status: this.calculateOverallHealth(results),
      checks: results,
      alerts: this.alerts.slice(-10), // Last 10 alerts
      summary: this.generateSummary(results),
      monitoring: this.isMonitoring,
    };
  }

  // Export health data for external monitoring
  exportHealthData() {
    return {
      timestamp: new Date().toISOString(),
      monitoring_active: this.isMonitoring,
      checks: Object.fromEntries(this.lastResults),
      failure_counts: Object.fromEntries(this.failureCount),
      recent_alerts: this.alerts.slice(-20),
      config: this.config,
    };
  }
}

// Initialize and export health monitor
const healthMonitor = new HealthCheckMonitor({
  checkInterval: 30000, // 30 seconds
  alertThreshold: 3,
  criticalThreshold: 5,
  timeout: 10000,
});

// Auto-start monitoring in production
if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
  healthMonitor.startMonitoring();
}

export default healthMonitor;
export { HealthCheckMonitor };