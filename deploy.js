#!/usr/bin/env node

/**
 * Sembalun Automated Deployment Script
 * This script prepares the project for manual Vercel deployment
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Preparing Sembalun for Vercel deployment...\n');

// 1. Clean and build
console.log('📦 Building production version...');
try {
  execSync('npm run clean', { stdio: 'inherit' });
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build completed successfully!\n');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}

// 2. Verify essential files
console.log('🔍 Verifying deployment files...');
const requiredFiles = [
  'dist/index.html',
  'dist/manifest.webmanifest', 
  'dist/sw.js',
  'vercel.json',
  'package.json'
];

let allFilesExist = true;
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ Missing: ${file}`);
    allFilesExist = false;
  }
});

if (!allFilesExist) {
  console.error('\n❌ Some required files are missing. Please check your build.');
  process.exit(1);
}

// 3. Bundle size check
console.log('\n📊 Bundle analysis:');
const distStats = fs.statSync('dist');
const getDirectorySize = (dir) => {
  let size = 0;
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);
    
    if (stats.isDirectory()) {
      size += getDirectorySize(filePath);
    } else {
      size += stats.size;
    }
  });
  
  return size;
};

const totalSize = getDirectorySize('dist');
const sizeMB = (totalSize / 1024 / 1024).toFixed(2);

console.log(`📦 Total build size: ${sizeMB} MB`);
if (totalSize < 10 * 1024 * 1024) { // 10MB
  console.log('✅ Bundle size is optimal for deployment');
} else {
  console.log('⚠️  Bundle size is large, consider optimization');
}

// 4. Create deployment summary
const deploymentInfo = {
  timestamp: new Date().toISOString(),
  buildSize: `${sizeMB} MB`,
  nodeVersion: process.version,
  status: 'ready-for-deployment'
};

fs.writeFileSync('deployment-info.json', JSON.stringify(deploymentInfo, null, 2));

console.log('\n🎉 Sembalun is ready for deployment!');
console.log('\n📋 Next steps:');
console.log('1. Go to https://vercel.com/new');
console.log('2. Drag and drop the entire project folder');
console.log('3. Or use: vercel --prod (after vercel login)');
console.log('4. Your Indonesian meditation PWA will be live! 🙏');

console.log('\n🌐 The built app is in the "dist" folder');
console.log('🔧 Deployment configuration is in "vercel.json"');
console.log('📊 Build info saved to "deployment-info.json"');

console.log('\n✨ Selamat! Ready to bring meditation to the world! ✨');