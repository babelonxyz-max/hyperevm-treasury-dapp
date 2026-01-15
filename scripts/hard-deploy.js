#!/usr/bin/env node

/**
 * Hard Deploy Script
 * Forces a fresh deployment to Vercel with cache bypass
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Starting hard deployment...\n');

try {
  // Step 1: Increment version
  console.log('📦 Incrementing version...');
  execSync('npm run increment-version', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
  
  // Step 2: Clean build artifacts
  console.log('\n🧹 Cleaning build artifacts...');
  execSync('npm run clean', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
  
  // Step 3: Force deploy to Vercel (if Vercel CLI is available)
  console.log('\n🌐 Checking for Vercel CLI...');
  try {
    execSync('vercel --version', { stdio: 'pipe' });
    
    console.log('✅ Vercel CLI found. Deploying...\n');
    
    // Check if we're in a git repo
    try {
      const gitBranch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8', cwd: path.join(__dirname, '..') }).trim();
      const isMain = gitBranch === 'main';
      
      if (isMain) {
        console.log('📤 Deploying to production (--prod --force)...');
        execSync('vercel --prod --force', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
      } else {
        console.log('📤 Deploying to preview (--force)...');
        execSync('vercel --force', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
      }
      
      console.log('\n✅ Hard deployment completed successfully!');
    } catch (error) {
      console.log('⚠️  Not a git repository or git error. Deploying anyway...');
      execSync('vercel --force', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
    }
  } catch (error) {
    console.log('⚠️  Vercel CLI not found. Skipping direct deployment.');
    console.log('💡 Vercel should auto-deploy via Git integration within 1-2 minutes.');
    console.log('💡 To enable direct deployment, install Vercel CLI: npm i -g vercel');
    console.log('💡 Or push to GitHub to trigger automatic deployment via GitHub Actions.\n');
    
    // Step 4: Commit and push if in git repo
    try {
      const gitStatus = execSync('git status --porcelain', { encoding: 'utf-8', cwd: path.join(__dirname, '..') });
      
      if (gitStatus.trim()) {
        console.log('📝 Changes detected. Committing and pushing...');
        execSync('git add .', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
        execSync('git commit -m "chore: hard deploy - force fresh build"', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
        execSync('git push origin main', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
        console.log('\n✅ Changes pushed to GitHub. GitHub Actions will deploy automatically.');
      } else {
        console.log('📝 No changes to commit. Creating empty commit to trigger deployment...');
        execSync('git commit --allow-empty -m "chore: trigger hard deployment"', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
        execSync('git push origin main', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
        console.log('\n✅ Empty commit pushed. GitHub Actions will deploy automatically.');
      }
    } catch (error) {
      console.log('⚠️  Not a git repository. Please deploy manually or set up Vercel CLI.');
    }
  }
  
} catch (error) {
  console.error('\n❌ Hard deployment failed:', error.message);
  process.exit(1);
}
