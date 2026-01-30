#!/usr/bin/env node
/**
 * Build script for Hexo blog
 * 1. Sync memos from API
 * 2. Clean and generate Hexo site
 * 3. Copy memos.json to public directory
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('=== Starting build process ===\n');

// Step 1: Sync memos from API
console.log('Step 1: Syncing memos from API...');
try {
  execSync('node scripts/sync-memos.js', { stdio: 'inherit' });
  console.log('✓ Memos synced successfully\n');
} catch (error) {
  console.error('✗ Failed to sync memos:', error.message);
  process.exit(1);
}

// Step 2: Clean and generate Hexo site
console.log('Step 2: Cleaning and generating Hexo site...');
try {
  execSync('hexo clean', { stdio: 'inherit' });
  execSync('hexo generate', { stdio: 'inherit' });
  console.log('✓ Hexo site generated successfully\n');
} catch (error) {
  console.error('✗ Failed to generate Hexo site:', error.message);
  process.exit(1);
}

// Step 3: Copy memos.json to public directory
console.log('Step 3: Copying memos.json to public directory...');
try {
  const sourceFile = path.join(__dirname, 'source', '_data', 'memos.json');
  const publicDir = path.join(__dirname, 'public', '_data');
  const publicFile = path.join(publicDir, 'memos.json');
  
  // Ensure public/_data directory exists
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  
  // Copy file
  fs.copyFileSync(sourceFile, publicFile);
  console.log('✓ memos.json copied to public/_data\n');
} catch (error) {
  console.error('✗ Failed to copy memos.json:', error.message);
  process.exit(1);
}

console.log('=== Build completed successfully! ===');
console.log('You can now run: hexo server');
