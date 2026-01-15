#!/usr/bin/env node

/**
 * Check Vercel Deployment Status
 * Shows recent deployments and their status
 */

import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Checking Vercel deployment status...\n');

try {
  // Check if Vercel CLI is available
  execSync('vercel --version', { stdio: 'pipe' });
  
  console.log('📊 Recent deployments:\n');
  
  try {
    // List recent deployments
    const deployments = execSync('vercel ls --json', { 
      encoding: 'utf-8',
      cwd: path.join(__dirname, '..'),
      stdio: 'pipe'
    });
    
    const deploymentList = JSON.parse(deployments);
    if (deploymentList.length > 0) {
      console.log('Recent deployments:');
      deploymentList.slice(0, 5).forEach((deploy, index) => {
        const timeAgo = new Date(deploy.created) - new Date();
        const minutesAgo = Math.abs(Math.floor(timeAgo / 60000));
        console.log(`\n${index + 1}. ${deploy.url || 'N/A'}`);
        console.log(`   State: ${deploy.state || 'unknown'}`);
        console.log(`   Created: ${minutesAgo} minutes ago`);
        console.log(`   Production: ${deploy.target === 'production' ? '✅' : '❌'}`);
      });
    } else {
      console.log('No deployments found.');
    }
  } catch (error) {
    console.log('⚠️  Could not fetch deployment list.');
    console.log('💡 Try: vercel ls');
  }
  
  console.log('\n💡 To force a new deployment:');
  console.log('   npm run hard-deploy');
  console.log('   or');
  console.log('   vercel --prod --force');
  
} catch (error) {
  console.log('⚠️  Vercel CLI not found.');
  console.log('\n📝 To check deployments:');
  console.log('   1. Install Vercel CLI: npm i -g vercel');
  console.log('   2. Login: vercel login');
  console.log('   3. Check deployments: vercel ls');
  console.log('\n🌐 Or check Vercel Dashboard:');
  console.log('   https://vercel.com/dashboard');
}
