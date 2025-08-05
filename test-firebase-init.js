#!/usr/bin/env node

/**
 * Firebase Initialization Test
 * Tests Firebase configuration and initialization to prevent "Cannot access 't' before initialization" error
 */

import fs from 'fs';
import path from 'path';

console.log('🔥 Testing Firebase Initialization...\n');

// Test Firebase configuration file
console.log('📋 Checking Firebase configuration...');

const firebaseConfigPath = './src/config/firebase.ts';
if (!fs.existsSync(firebaseConfigPath)) {
  console.log('❌ Firebase configuration file not found');
  process.exit(1);
}

const firebaseConfig = fs.readFileSync(firebaseConfigPath, 'utf8');

// Check for potential initialization issues
console.log('🔍 Analyzing Firebase configuration for initialization issues...');

const issues = [];
const checks = [
  {
    test: /export const app = .*initializeApp/,
    issue: 'Direct app export may cause hoisting issues',
    suggestion: 'Use lazy initialization with getter functions'
  },
  {
    test: /export const.*= getFirestore\(app\)/,
    issue: 'Direct Firestore export may cause dependency issues',
    suggestion: 'Use lazy initialization pattern'
  },
  {
    test: /export const auth = getAuth\(app\)/,
    issue: 'Direct auth export may cause initialization timing issues',
    suggestion: 'Check if auth is properly wrapped in initialization checks'
  },
  {
    test: /isSSR.*typeof window === 'undefined'/,
    fix: 'SSR detection implemented',
    status: 'good'
  },
  {
    test: /isClientSide.*!isSSR/,
    fix: 'Client-side detection implemented',
    status: 'good'
  },
  {
    test: /lazy initialization|getFirestore.*\(\)/,
    fix: 'Lazy initialization pattern detected',
    status: 'good'
  }
];

let hasIssues = false;
let hasGoodPatterns = false;

checks.forEach(check => {
  if (check.test.test(firebaseConfig)) {
    if (check.status === 'good') {
      console.log(`✅ ${check.fix}`);
      hasGoodPatterns = true;
    } else {
      console.log(`⚠️  ${check.issue}`);
      console.log(`   Suggestion: ${check.suggestion}`);
      issues.push(check);
      hasIssues = true;
    }
  }
});

// Check for common problematic patterns
const problematicPatterns = [
  {
    pattern: /export const \w+ = (?!null)[^;]*(?:getAuth|getFirestore|getStorage)\([^)]*\)/g,
    issue: 'Direct service export without null checks'
  },
  {
    pattern: /initializeApp\([^)]*\);\s*$/gm,
    issue: 'App initialization without proper error handling'
  },
  {
    pattern: /const app = initializeApp/,
    issue: 'App initialization at module level may cause hoisting issues'
  }
];

problematicPatterns.forEach(({ pattern, issue }) => {
  const matches = firebaseConfig.match(pattern);
  if (matches) {
    console.log(`⚠️  Potential issue: ${issue}`);
    matches.forEach(match => {
      console.log(`   Found: ${match.trim()}`);
    });
    hasIssues = true;
  }
});

// Check for proper patterns
const goodPatterns = [
  {
    pattern: /const.*=.*isClientSide.*\?.*:.*null/,
    description: 'Conditional exports based on client-side detection'
  },
  {
    pattern: /if.*\(!.*\).*{\s*return null;?\s*}/,
    description: 'Null checks for service availability'
  },
  {
    pattern: /try.*{[\s\S]*}.*catch.*{[\s\S]*}/,
    description: 'Error handling for initialization'
  }
];

goodPatterns.forEach(({ pattern, description }) => {
  if (pattern.test(firebaseConfig)) {
    console.log(`✅ Good pattern: ${description}`);
    hasGoodPatterns = true;
  }
});

// Test environment variable configuration
console.log('\n🌍 Checking environment variables...');

const envVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID'
];

let missingEnvVars = [];

// Check if .env files exist
const envFiles = ['.env', '.env.local', '.env.production'];
let hasEnvFile = false;

envFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ Found environment file: ${file}`);
    hasEnvFile = true;
    
    // Read and check for required variables
    const envContent = fs.readFileSync(file, 'utf8');
    envVars.forEach(varName => {
      if (envContent.includes(varName)) {
        console.log(`✅ Environment variable defined: ${varName}`);
      } else {
        if (!missingEnvVars.includes(varName)) {
          missingEnvVars.push(varName);
        }
      }
    });
  }
});

if (!hasEnvFile) {
  console.log('⚠️  No environment files found');
  console.log('   Expected files: .env, .env.local, or .env.production');
  hasIssues = true;
}

if (missingEnvVars.length > 0) {
  console.log('⚠️  Missing environment variables:');
  missingEnvVars.forEach(varName => {
    console.log(`   • ${varName}`);
  });
  hasIssues = true;
}

// Test build-time configuration
console.log('\n📦 Checking built bundle for Firebase issues...');

const distIndexPath = './dist/index.html';
if (fs.existsSync(distIndexPath)) {
  const builtHTML = fs.readFileSync(distIndexPath, 'utf8');
  
  // Check if Firebase modules are properly loaded
  if (builtHTML.includes('type="module"')) {
    console.log('✅ ES modules detected in build');
  } else {
    console.log('⚠️  ES modules not detected - may cause initialization issues');
    hasIssues = true;
  }
  
  // Check for proper module loading order
  const modulePattern = /<script[^>]*src="[^"]*"[^>]*>/g;
  const modules = builtHTML.match(modulePattern) || [];
  
  if (modules.length > 0) {
    console.log(`✅ Found ${modules.length} JavaScript modules in build`);
    
    // Check for potential loading order issues
    const hasPreload = builtHTML.includes('rel="modulepreload"');
    if (hasPreload) {
      console.log('✅ Module preloading configured');
    } else {
      console.log('⚠️  Module preloading not configured - may affect initialization timing');
    }
  }
} else {
  console.log('⚠️  Built application not found. Run npm run build first.');
  hasIssues = true;
}

// Summary and recommendations
console.log('\n📋 FIREBASE INITIALIZATION ANALYSIS');
console.log('=' .repeat(50));

if (!hasIssues && hasGoodPatterns) {
  console.log('✅ Firebase configuration looks good for production!');
  console.log('\n🎯 Key strengths found:');
  console.log('   • SSR/client-side detection implemented');
  console.log('   • Lazy initialization patterns used');
  console.log('   • Proper error handling in place');
} else if (hasIssues) {
  console.log('⚠️  Potential Firebase initialization issues detected');
  console.log('\n🔧 Recommended fixes:');
  
  if (issues.length > 0) {
    issues.forEach(issue => {
      console.log(`   • ${issue.issue}`);
      console.log(`     → ${issue.suggestion}`);
    });
  }
  
  console.log('\n📚 Best practices for Firebase initialization:');
  console.log('   1. Use lazy initialization with getter functions');
  console.log('   2. Add proper SSR/client-side detection');
  console.log('   3. Wrap all Firebase service exports in null checks');
  console.log('   4. Use try-catch blocks for initialization');
  console.log('   5. Ensure environment variables are properly set');
}

console.log('\n🔗 For more information, see:');
console.log('   • Firebase Web SDK documentation');
console.log('   • Vite SSR configuration guide');
console.log('   • React Firebase hooks best practices');

// Exit with appropriate code
if (hasIssues) {
  console.log('\n⚠️  Review recommended before production deployment.');
  process.exit(1);
} else {
  console.log('\n✅ Firebase configuration ready for production!');
  process.exit(0);
}