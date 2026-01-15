#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname);

console.log('🚀 Deploying Felix logo update...\n');

try {
  // Step 1: Add all changes
  console.log('📝 Adding changes...');
  execSync('git add -A', { stdio: 'inherit', cwd: rootDir });
  
  // Step 2: Commit
  console.log('\n💾 Committing changes...');
  try {
    execSync('git commit -m "feat: use Felix logo from usefelix.xyz"', { stdio: 'inherit', cwd: rootDir });
  } catch (e) {
    console.log('   (No new changes to commit)');
  }
  
  // Step 3: Push
  console.log('\n📤 Pushing to GitHub...');
  execSync('git push origin main', { stdio: 'inherit', cwd: rootDir });
  
  // Step 4: Increment version
  console.log('\n📦 Incrementing version...');
  execSync('npm run increment-version', { stdio: 'inherit', cwd: rootDir });
  
  // Step 5: Commit version
  console.log('\n💾 Committing version...');
  execSync('git add version.json public/version.json', { stdio: 'inherit', cwd: rootDir });
  execSync('git commit -m "chore: bump version for logo update"', { stdio: 'inherit', cwd: rootDir });
  execSync('git push origin main', { stdio: 'inherit', cwd: rootDir });
  
  // Step 6: Deploy to Vercel
  console.log('\n🌐 Deploying to Vercel...');
  execSync('npx vercel --prod --yes --force', { stdio: 'inherit', cwd: rootDir });
  
  console.log('\n✅ Deployment complete!');
  
} catch (error) {
  console.error('\n❌ Deployment failed:', error.message);
  process.exit(1);
}
