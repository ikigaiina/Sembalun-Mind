#!/usr/bin/env node

/**
 * Deployment Validation Script
 * Validates that all deployment configurations are correct for Vercel
 */

import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..');

console.log('🔍 Validating deployment configuration...\n');

// Validation checks
const checks = [];

// 1. Verify Vercel configuration
function validateVercelConfig() {
  const vercelPath = resolve(projectRoot, 'vercel.json');
  
  if (!existsSync(vercelPath)) {
    return { pass: false, message: 'vercel.json not found' };
  }

  try {
    const config = JSON.parse(readFileSync(vercelPath, 'utf-8'));
    
    // Check build command
    if (!config.buildCommand || !config.buildCommand.includes('vite.config.deploy.ts')) {
      return { pass: false, message: 'Build command should use vite.config.deploy.ts' };
    }

    // Check manifest headers
    const manifestHeaders = config.headers?.find(h => 
      h.source.includes('manifest')
    );

    if (!manifestHeaders) {
      return { pass: false, message: 'Missing manifest.json headers configuration' };
    }

    const requiredHeaders = ['Content-Type', 'Cache-Control', 'Access-Control-Allow-Origin'];
    const configuredHeaders = manifestHeaders.headers.map(h => h.key);
    
    for (const required of requiredHeaders) {
      if (!configuredHeaders.includes(required)) {
        return { pass: false, message: `Missing required header: ${required}` };
      }
    }

    return { pass: true, message: 'Vercel configuration is valid' };
  } catch (error) {
    return { pass: false, message: `Invalid JSON in vercel.json: ${error.message}` };
  }
}

// 2. Verify dist directory and manifest files
function validateDistDirectory() {
  const distPath = resolve(projectRoot, 'dist');
  
  if (!existsSync(distPath)) {
    return { pass: false, message: 'dist directory not found - run build first' };
  }

  const manifestPath = resolve(distPath, 'manifest.json');
  const webmanifestPath = resolve(distPath, 'manifest.webmanifest');
  const swPath = resolve(distPath, 'sw.js');

  if (!existsSync(manifestPath)) {
    return { pass: false, message: 'manifest.json not found in dist/' };
  }

  if (!existsSync(webmanifestPath)) {
    return { pass: false, message: 'manifest.webmanifest not found in dist/' };
  }

  if (!existsSync(swPath)) {
    return { pass: false, message: 'sw.js (service worker) not found in dist/' };
  }

  try {
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
    
    // Validate required manifest fields
    const requiredFields = ['name', 'short_name', 'start_url', 'display', 'icons'];
    for (const field of requiredFields) {
      if (!manifest[field]) {
        return { pass: false, message: `Missing required manifest field: ${field}` };
      }
    }

    // Validate icons
    if (!Array.isArray(manifest.icons) || manifest.icons.length === 0) {
      return { pass: false, message: 'Manifest must have at least one icon' };
    }

    return { pass: true, message: 'PWA files are correctly generated' };
  } catch (error) {
    return { pass: false, message: `Invalid manifest.json: ${error.message}` };
  }
}

// 3. Verify Vite configs have PWA support
function validateViteConfigs() {
  const configs = [
    'vite.config.ts',
    'vite.config.production.ts', 
    'vite.config.deploy.ts',
    'vite.config.emergency.ts'
  ];

  const results = [];

  for (const configFile of configs) {
    const configPath = resolve(projectRoot, configFile);
    
    if (!existsSync(configPath)) {
      results.push(`⚠️  ${configFile}: Not found`);
      continue;
    }

    try {
      const content = readFileSync(configPath, 'utf-8');
      
      const hasPWA = content.includes('VitePWA');
      const hasManifest = content.includes('manifest:');
      
      if (configFile === 'vite.config.emergency.ts') {
        // Emergency config should have minimal PWA support
        if (!hasPWA) {
          results.push(`❌ ${configFile}: Missing VitePWA plugin (required for manifest)`);
        } else {
          results.push(`✅ ${configFile}: Has PWA support`);
        }
      } else if (hasPWA && hasManifest) {
        results.push(`✅ ${configFile}: Complete PWA configuration`);
      } else if (hasPWA) {
        results.push(`⚠️  ${configFile}: Has PWA but missing manifest configuration`);
      } else {
        results.push(`❌ ${configFile}: Missing PWA configuration`);
      }
    } catch (error) {
      results.push(`❌ ${configFile}: Error reading file - ${error.message}`);
    }
  }

  const hasErrors = results.some(r => r.includes('❌'));
  
  return {
    pass: !hasErrors,
    message: results.join('\n'),
    details: results
  };
}

// 4. Validate package.json scripts
function validatePackageScripts() {
  const packagePath = resolve(projectRoot, 'package.json');
  
  try {
    const pkg = JSON.parse(readFileSync(packagePath, 'utf-8'));
    const scripts = pkg.scripts || {};

    const requiredScripts = [
      'build:deploy',
      'build',
      'preview'
    ];

    const missingScripts = requiredScripts.filter(script => !scripts[script]);
    
    if (missingScripts.length > 0) {
      return { 
        pass: false, 
        message: `Missing required scripts: ${missingScripts.join(', ')}` 
      };
    }

    // Check if build:deploy uses correct config
    if (!scripts['build:deploy'].includes('vite.config.deploy.ts')) {
      return {
        pass: false,
        message: 'build:deploy script should use vite.config.deploy.ts'
      };
    }

    return { pass: true, message: 'Package.json scripts are configured correctly' };
  } catch (error) {
    return { pass: false, message: `Error reading package.json: ${error.message}` };
  }
}

// Run all checks
checks.push(['Vercel Configuration', validateVercelConfig()]);
checks.push(['Distribution Files', validateDistDirectory()]);
checks.push(['Vite Configurations', validateViteConfigs()]);
checks.push(['Package Scripts', validatePackageScripts()]);

// Display results
let allPassed = true;

for (const [checkName, result] of checks) {
  const status = result.pass ? '✅' : '❌';
  console.log(`${status} ${checkName}`);
  
  if (result.details) {
    // Multi-line result
    console.log(`   ${result.details.join('\n   ')}`);
  } else {
    console.log(`   ${result.message}`);
  }
  
  console.log();
  
  if (!result.pass) {
    allPassed = false;
  }
}

// Summary
console.log('=====================================');
if (allPassed) {
  console.log('🎉 All deployment validations passed!');
  console.log('✅ Ready for production deployment');
  console.log('\nNext steps:');
  console.log('1. Commit these changes');
  console.log('2. Deploy to Vercel');
  console.log('3. Test manifest.json access on deployed site');
} else {
  console.log('❌ Some validations failed');
  console.log('⚠️  Please fix the issues above before deploying');
  process.exit(1);
}