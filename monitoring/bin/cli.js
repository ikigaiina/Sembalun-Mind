#!/usr/bin/env node

/**
 * Sembalun Monitor CLI
 * Command-line interface for monitoring system
 */

import { program } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import SembalunMonitor from '../src/monitor.js';
import DashboardServer from '../src/dashboard-server.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const packageJson = await fs.readJson(path.join(__dirname, '../package.json'));

program
  .name('sembalun-monitor')
  .description('External monitoring system for Sembalun meditation platform')
  .version(packageJson.version);

program
  .command('start')
  .description('Start the monitoring system')
  .option('-p, --port <port>', 'Monitor server port', '3001')
  .option('-u, --url <url>', 'App URL to monitor', 'http://localhost:5173')
  .option('-i, --interval <ms>', 'Check interval in milliseconds', '30000')
  .option('-c, --config <file>', 'Configuration file')
  .action(async (options) => {
    console.log(chalk.cyan('\n🚀 Starting Sembalun Monitor...\n'));
    
    let config = {};
    
    if (options.config) {
      try {
        config = await fs.readJson(options.config);
      } catch (error) {
        console.error(chalk.red('Failed to read config file:'), error.message);
        process.exit(1);
      }
    }
    
    config = {
      ...config,
      port: options.port || config.port,
      appUrl: options.url || config.appUrl,
      checkInterval: parseInt(options.interval) || config.checkInterval
    };
    
    const monitor = new SembalunMonitor(config);
    
    process.on('SIGINT', async () => {
      console.log(chalk.yellow('\n⚡ Shutting down gracefully...'));
      await monitor.stop();
      process.exit(0);
    });
    
    try {
      await monitor.start();
    } catch (error) {
      console.error(chalk.red('Failed to start monitor:'), error.message);
      process.exit(1);
    }
  });

program
  .command('dashboard')
  .description('Start the monitoring dashboard')
  .option('-p, --port <port>', 'Dashboard server port', '3002')
  .option('-m, --monitor <url>', 'Monitor API URL', 'http://localhost:3001')
  .action((options) => {
    console.log(chalk.cyan('\n🎨 Starting Dashboard Server...\n'));
    
    const dashboard = new DashboardServer({
      port: options.port,
      monitorUrl: options.monitor
    });
    
    process.on('SIGINT', () => {
      console.log(chalk.yellow('\n⚡ Shutting down dashboard...'));
      dashboard.stop();
      process.exit(0);
    });
    
    dashboard.start();
  });

program
  .command('setup')
  .description('Interactive setup wizard')
  .action(async () => {
    console.log(chalk.cyan('\n🔧 Sembalun Monitor Setup Wizard\n'));
    
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'appUrl',
        message: 'What is your Sembalun app URL?',
        default: 'http://localhost:5173'
      },
      {
        type: 'input',
        name: 'supabaseUrl',
        message: 'What is your Supabase URL?',
        validate: (input) => input.includes('supabase.co') || 'Please enter a valid Supabase URL'
      },
      {
        type: 'password',
        name: 'supabaseKey',
        message: 'What is your Supabase anon key?',
        mask: '*'
      },
      {
        type: 'number',
        name: 'checkInterval',
        message: 'Health check interval (seconds)?',
        default: 30
      },
      {
        type: 'number',
        name: 'port',
        message: 'Monitor server port?',
        default: 3001
      },
      {
        type: 'confirm',
        name: 'enableEmail',
        message: 'Enable email alerts?',
        default: false
      },
      {
        type: 'input',
        name: 'emailRecipient',
        message: 'Alert email address:',
        when: (answers) => answers.enableEmail,
        validate: (input) => input.includes('@') || 'Please enter a valid email'
      },
      {
        type: 'confirm',
        name: 'enableWebhook',
        message: 'Enable webhook alerts?',
        default: false
      },
      {
        type: 'input',
        name: 'webhookUrl',
        message: 'Webhook URL:',
        when: (answers) => answers.enableWebhook,
        validate: (input) => input.startsWith('http') || 'Please enter a valid URL'
      }
    ]);
    
    const config = {
      appUrl: answers.appUrl,
      supabaseUrl: answers.supabaseUrl,
      supabaseKey: answers.supabaseKey,
      checkInterval: answers.checkInterval * 1000,
      port: answers.port,
      alerts: {
        email: answers.enableEmail,
        emailRecipient: answers.emailRecipient,
        webhook: answers.enableWebhook,
        webhookUrl: answers.webhookUrl
      }
    };
    
    const spinner = ora('Saving configuration...').start();
    
    try {
      await fs.ensureDir('config');
      await fs.writeJson('config/monitor.json', config, { spaces: 2 });
      
      // Create environment file
      const envContent = `VITE_SUPABASE_URL=${answers.supabaseUrl}
VITE_SUPABASE_ANON_KEY=${answers.supabaseKey}
MONITOR_PORT=${answers.port}
MONITOR_APP_URL=${answers.appUrl}`;
      
      await fs.writeFile('.env.monitor', envContent);
      
      spinner.succeed('Configuration saved successfully!');
      
      console.log(chalk.green('\n✅ Setup completed!'));
      console.log(chalk.gray('Configuration saved to: config/monitor.json'));
      console.log(chalk.gray('Environment saved to: .env.monitor'));
      console.log(chalk.blue('\n🚀 Start monitoring with: sembalun-monitor start -c config/monitor.json'));
      
    } catch (error) {
      spinner.fail('Failed to save configuration');
      console.error(chalk.red('Error:'), error.message);
    }
  });

program
  .command('status')
  .description('Check monitor status')
  .option('-u, --url <url>', 'Monitor URL', 'http://localhost:3001')
  .action(async (options) => {
    const spinner = ora('Checking monitor status...').start();
    
    try {
      const response = await fetch(\`\${options.url}/health\`);
      const data = await response.json();
      
      spinner.succeed('Monitor is running');
      
      console.log(chalk.green('\n📊 Monitor Status:'));
      console.log(\`Status: \${chalk.blue(data.status)}\`);
      console.log(\`Uptime: \${chalk.blue(Math.floor(data.uptime))}s\`);
      console.log(\`Version: \${chalk.blue(data.version)}\`);
      console.log(\`Last Check: \${chalk.blue(new Date(data.timestamp).toLocaleString())}\`);
      
      if (data.metrics) {
        console.log(chalk.green('\n📈 Current Metrics:'));
        console.log(\`Users: \${chalk.blue(data.metrics.userCount)}\`);
        console.log(\`Sessions: \${chalk.blue(data.metrics.sessionCount)}\`);
        console.log(\`Response Time: \${chalk.blue(data.metrics.responseTime)}ms\`);
        console.log(\`CPU: \${chalk.blue(data.metrics.systemHealth.cpu)}%\`);
        console.log(\`Memory: \${chalk.blue(data.metrics.systemHealth.memory)}%\`);
      }
      
    } catch (error) {
      spinner.fail('Monitor is not running or unreachable');
      console.error(chalk.red('Error:'), error.message);
      console.log(chalk.yellow('\n💡 Start the monitor with: sembalun-monitor start'));
    }
  });

program
  .command('logs')
  .description('View monitor logs')
  .option('-f, --follow', 'Follow log output')
  .option('-l, --level <level>', 'Log level (error, warn, info)', 'info')
  .option('-n, --lines <number>', 'Number of lines to show', '50')
  .action(async (options) => {
    try {
      const logFile = options.level === 'error' ? 'logs/error.log' : 'logs/combined.log';
      
      if (!await fs.exists(logFile)) {
        console.log(chalk.yellow('Log file not found. Start the monitor to generate logs.'));
        return;
      }
      
      const content = await fs.readFile(logFile, 'utf8');
      const lines = content.split('\\n').filter(Boolean);
      const recentLines = lines.slice(-parseInt(options.lines));
      
      console.log(chalk.cyan(\`\\n📝 Recent logs (\${options.level}):\\n\`));
      
      recentLines.forEach(line => {
        try {
          const log = JSON.parse(line);
          const timestamp = new Date(log.timestamp).toLocaleTimeString();
          const level = log.level.toUpperCase();
          const message = log.message;
          
          let color = chalk.white;
          if (level === 'ERROR') color = chalk.red;
          else if (level === 'WARN') color = chalk.yellow;
          else if (level === 'INFO') color = chalk.blue;
          
          console.log(color(\`[\${timestamp}] \${level}: \${message}\`));
        } catch {
          console.log(chalk.gray(line));
        }
      });
      
      if (options.follow) {
        console.log(chalk.gray('\\n👀 Following logs... (Press Ctrl+C to stop)'));
        // Implement log following (tail -f equivalent)
        // This would require additional implementation
      }
      
    } catch (error) {
      console.error(chalk.red('Failed to read logs:'), error.message);
    }
  });

program
  .command('test')
  .description('Test monitor connectivity')
  .option('-u, --url <url>', 'App URL to test', 'http://localhost:5173')
  .action(async (options) => {
    console.log(chalk.cyan('\\n🧪 Testing Sembalun Monitor Connectivity\\n'));
    
    const tests = [
      {
        name: 'App Connectivity',
        url: options.url,
        timeout: 5000
      },
      {
        name: 'Monitor API',
        url: 'http://localhost:3001/health',
        timeout: 3000
      },
      {
        name: 'Dashboard',
        url: 'http://localhost:3002',
        timeout: 3000
      }
    ];
    
    for (const test of tests) {
      const spinner = ora(\`Testing \${test.name}...\`).start();
      
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), test.timeout);
        
        const response = await fetch(test.url, {
          signal: controller.signal,
          method: 'HEAD'
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          spinner.succeed(\`\${test.name}: \${chalk.green('✓ Available')}\`);
        } else {
          spinner.warn(\`\${test.name}: \${chalk.yellow(\`⚠ Status \${response.status}\`)}\`);
        }
        
      } catch (error) {
        spinner.fail(\`\${test.name}: \${chalk.red('✗ Unavailable')}\`);
      }
    }
    
    console.log(chalk.blue('\\n💡 If tests fail, make sure the services are running:'));
    console.log(chalk.gray('• App: npm run dev'));
    console.log(chalk.gray('• Monitor: sembalun-monitor start'));
    console.log(chalk.gray('• Dashboard: sembalun-monitor dashboard'));
  });

program.parse();