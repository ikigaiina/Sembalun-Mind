#!/usr/bin/env node

/**
 * Production Validation Script
 * Validates production build for deployment readiness
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

console.log('🚀 Starting Production Validation...\n');

// Configuration
const DIST_DIR = './dist';
const REQUIRED_FILES = [
  'index.html',
  'manifest.json',
  'manifest.webmanifest',
  'sw.js',
  'registerSW.js'
];

const REQUIRED_STATIC_ASSETS = [
  'icon-192.svg',
  'icon-512.svg',
  'icon-180.png'
];

// Validation Results
const results = {
  passed: 0,
  failed: 0,
  warnings: 0,
  issues: []
};

function logSuccess(message) {
  console.log(`✅ ${message}`);
  results.passed++;
}

function logError(message) {
  console.log(`❌ ${message}`);
  results.failed++;
  results.issues.push({ type: 'error', message });
}

function logWarning(message) {
  console.log(`⚠️  ${message}`);
  results.warnings++;
  results.issues.push({ type: 'warning', message });
}

// Test 1: Build Files Exist
console.log('📁 Checking build files...');
if (!fs.existsSync(DIST_DIR)) {
  logError('Build directory does not exist. Run npm run build first.');
  process.exit(1);
}

REQUIRED_FILES.forEach(file => {
  const filePath = path.join(DIST_DIR, file);
  if (fs.existsSync(filePath)) {
    logSuccess(`Required file exists: ${file}`);
  } else {
    logError(`Missing required file: ${file}`);
  }
});

// Test 2: Static Assets
console.log('\n🖼️  Checking static assets...');
REQUIRED_STATIC_ASSETS.forEach(asset => {
  const assetPath = path.join(DIST_DIR, asset);
  if (fs.existsSync(assetPath)) {
    logSuccess(`Static asset exists: ${asset}`);
  } else {
    logError(`Missing static asset: ${asset}`);
  }
});

// Test 3: Manifest Validation
console.log('\n📱 Validating PWA manifest...');
try {
  const manifestPath = path.join(DIST_DIR, 'manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  
  // Check required manifest fields
  const requiredFields = ['name', 'short_name', 'start_url', 'display', 'icons'];
  requiredFields.forEach(field => {
    if (manifest[field]) {
      logSuccess(`Manifest has required field: ${field}`);
    } else {
      logError(`Manifest missing required field: ${field}`);
    }
  });
  
  // Check icons
  if (manifest.icons && manifest.icons.length > 0) {
    manifest.icons.forEach((icon, index) => {
      if (icon.src && icon.sizes && icon.type) {
        logSuccess(`Icon ${index + 1} properly configured`);
      } else {
        logError(`Icon ${index + 1} missing required properties`);
      }
    });
  }
} catch (error) {
  logError(`Failed to parse manifest.json: ${error.message}`);
}

// Test 4: HTML Structure
console.log('\n🏗️  Validating HTML structure...');
try {
  const htmlPath = path.join(DIST_DIR, 'index.html');
  const html = fs.readFileSync(htmlPath, 'utf8');
  
  // Check for required meta tags
  if (html.includes('<meta name="viewport"')) {
    logSuccess('Viewport meta tag present');
  } else {
    logError('Missing viewport meta tag');
  }
  
  if (html.includes('<meta name="theme-color"')) {
    logSuccess('Theme color meta tag present');
  } else {
    logWarning('Missing theme color meta tag');
  }
  
  if (html.includes('manifest.json')) {
    logSuccess('Manifest linked in HTML');
  } else {
    logError('Manifest not linked in HTML');
  }
  
  // Check for service worker registration
  if (html.includes('registerSW.js')) {
    logSuccess('Service worker registration script present');
  } else {
    logWarning('Service worker registration script not found');
  }
  
} catch (error) {
  logError(`Failed to read index.html: ${error.message}`);
}

// Test 5: JavaScript Modules
console.log('\n📦 Checking JavaScript modules...');
try {
  // Check for JS files in assets directory (new structure)
  const assetsDir = path.join(DIST_DIR, 'assets');
  let jsFiles = [];
  
  if (fs.existsSync(assetsDir)) {
    jsFiles = fs.readdirSync(assetsDir).filter(file => file.endsWith('.js'));
  }
  
  // Also check for JS files in js directory (old structure) 
  const jsDir = path.join(DIST_DIR, 'js');
  if (fs.existsSync(jsDir)) {
    const jsFromJsDir = fs.readdirSync(jsDir).filter(file => file.endsWith('.js'));
    jsFiles = [...jsFiles, ...jsFromJsDir];
  }
  
  if (jsFiles.length > 0) {
    logSuccess(`Found ${jsFiles.length} JavaScript modules`);
    
    // Check for main index file
    const hasIndex = jsFiles.some(file => file.includes('index'));
    if (hasIndex) {
      logSuccess('Main application module found');
    } else {
      logError('Main application module not found');
    }
    
    // Log all found modules for debugging
    jsFiles.forEach(file => {
      logSuccess(`Module found: ${file}`);
    });
    
  } else {
    logError('No JavaScript modules found');
  }
} catch (error) {
  logError(`Failed to check JavaScript modules: ${error.message}`);
}

// Test 6: CSS Assets
console.log('\n🎨 Checking CSS assets...');
try {
  const assetsDir = path.join(DIST_DIR, 'assets');
  if (fs.existsSync(assetsDir)) {
    const cssFiles = fs.readdirSync(assetsDir).filter(file => file.endsWith('.css'));
    
    if (cssFiles.length > 0) {
      logSuccess(`Found ${cssFiles.length} CSS files`);
    } else {
      logWarning('No CSS files found - using inline styles?');
    }
  } else {
    logWarning('Assets directory not found');
  }
} catch (error) {
  logError(`Failed to check CSS assets: ${error.message}`);
}

// Test 7: Service Worker Validation
console.log('\n⚙️  Validating service worker...');
try {
  const swPath = path.join(DIST_DIR, 'sw.js');
  if (fs.existsSync(swPath)) {
    const swContent = fs.readFileSync(swPath, 'utf8');
    
    // Check for basic service worker features
    if (swContent.includes('install') && swContent.includes('fetch')) {
      logSuccess('Service worker has basic event handlers');
    } else {
      logWarning('Service worker missing basic event handlers');
    }
    
    if (swContent.includes('precacheAndRoute')) {
      logSuccess('Service worker configured for precaching');
    } else {
      logWarning('Service worker not configured for precaching');
    }
  } else {
    logError('Service worker file not found');
  }
} catch (error) {
  logError(`Failed to validate service worker: ${error.message}`);
}

// Test 8: File Size Analysis
console.log('\n📊 Analyzing bundle sizes...');
try {
  let totalSize = 0;
  let jsFiles = [];
  
  // Check assets directory for JS files
  const assetsDir = path.join(DIST_DIR, 'assets');
  if (fs.existsSync(assetsDir)) {
    const assetsFiles = fs.readdirSync(assetsDir).filter(file => file.endsWith('.js'));
    assetsFiles.forEach(file => {
      const filePath = path.join(assetsDir, file);
      const stats = fs.statSync(filePath);
      const sizeKB = (stats.size / 1024).toFixed(2);
      totalSize += stats.size;
      jsFiles.push({ file, sizeKB, size: stats.size });
      
      if (stats.size > 1024 * 1024) { // 1MB
        logWarning(`Large bundle detected: ${file} (${sizeKB}KB)`);
      } else {
        logSuccess(`Bundle size OK: ${file} (${sizeKB}KB)`);
      }
    });
  }
  
  // Check js directory for JS files
  const jsDir = path.join(DIST_DIR, 'js');
  if (fs.existsSync(jsDir)) {
    const jsDirFiles = fs.readdirSync(jsDir).filter(file => file.endsWith('.js'));
    jsDirFiles.forEach(file => {
      const filePath = path.join(jsDir, file);
      const stats = fs.statSync(filePath);
      const sizeKB = (stats.size / 1024).toFixed(2);
      totalSize += stats.size;
      jsFiles.push({ file, sizeKB, size: stats.size });
      
      if (stats.size > 1024 * 1024) { // 1MB
        logWarning(`Large bundle detected: ${file} (${sizeKB}KB)`);
      } else {
        logSuccess(`Bundle size OK: ${file} (${sizeKB}KB)`);
      }
    });
  }
  
  if (jsFiles.length > 0) {
    const totalKB = (totalSize / 1024).toFixed(2);
    if (totalSize > 5 * 1024 * 1024) { // 5MB
      logWarning(`Total bundle size is large: ${totalKB}KB`);
    } else {
      logSuccess(`Total bundle size is reasonable: ${totalKB}KB`);
    }
  } else {
    logError('No JavaScript files found for size analysis');
  }
} catch (error) {
  logError(`Failed to analyze bundle sizes: ${error.message}`);
}

// Test 9: Production Environment Check
console.log('\n🌍 Checking production configuration...');
try {
  // Check if build was created with production settings
  const htmlPath = path.join(DIST_DIR, 'index.html');
  const html = fs.readFileSync(htmlPath, 'utf8');
  
  // Look for production indicators
  if (html.includes('crossorigin')) {
    logSuccess('Production CORS settings detected');
  } else {
    logWarning('Production CORS settings not found');
  }
  
  if (html.includes('modulepreload')) {
    logSuccess('Module preloading configured');
  } else {
    logWarning('Module preloading not configured');
  }
  
} catch (error) {
  logError(`Failed to check production configuration: ${error.message}`);
}

// Summary
console.log('\n📋 VALIDATION SUMMARY');
console.log('=' .repeat(50));
console.log(`✅ Passed: ${results.passed}`);
console.log(`❌ Failed: ${results.failed}`);
console.log(`⚠️  Warnings: ${results.warnings}`);

if (results.failed > 0) {
  console.log('\n🚨 CRITICAL ISSUES FOUND:');
  results.issues.filter(issue => issue.type === 'error').forEach(issue => {
    console.log(`   • ${issue.message}`);
  });
}

if (results.warnings > 0) {
  console.log('\n⚠️  WARNINGS:');
  results.issues.filter(issue => issue.type === 'warning').forEach(issue => {
    console.log(`   • ${issue.message}`);
  });
}

// Exit code
if (results.failed > 0) {
  console.log('\n❌ Production validation FAILED. Please fix the issues above.');
  process.exit(1);
} else if (results.warnings > 0) {
  console.log('\n⚠️  Production validation PASSED with warnings.');
  process.exit(0);
} else {
  console.log('\n✅ Production validation PASSED! Ready for deployment.');
  process.exit(0);
}