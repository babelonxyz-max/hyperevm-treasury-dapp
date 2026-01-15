#!/usr/bin/env node

/**
 * Trigger Vercel Deployment via API
 * Forces a fresh deployment using Vercel API
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Triggering Vercel deployment via API...\n');

// Check for Vercel credentials
const VERCEL_TOKEN = process.env.VERCEL_TOKEN || process.env.VITE_VERCEL_TOKEN;
const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID;
const VERCEL_ORG_ID = process.env.VERCEL_ORG_ID;

if (!VERCEL_TOKEN || !VERCEL_PROJECT_ID || !VERCEL_ORG_ID) {
  console.log('⚠️  Vercel credentials not found in environment variables.');
  console.log('💡 Setting up Vercel CLI deployment instead...\n');
  
  try {
    // Try using Vercel CLI
    execSync('vercel --version', { stdio: 'pipe' });
    console.log('✅ Vercel CLI found. Deploying...\n');
    execSync('vercel --prod --force', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
    console.log('\n✅ Deployment triggered successfully!');
  } catch (error) {
    console.log('❌ Vercel CLI not found.');
    console.log('\n📝 To enable direct deployment:');
    console.log('   1. Install Vercel CLI: npm i -g vercel');
    console.log('   2. Login: vercel login');
    console.log('   3. Link project: vercel link');
    console.log('\n   Or set environment variables:');
    console.log('   - VERCEL_TOKEN');
    console.log('   - VERCEL_PROJECT_ID');
    console.log('   - VERCEL_ORG_ID');
    process.exit(1);
  }
} else {
  // Use Vercel API to trigger deployment
  console.log('📡 Using Vercel API to trigger deployment...\n');
  
  const apiUrl = `https://api.vercel.com/v13/deployments?projectId=${VERCEL_PROJECT_ID}&teamId=${VERCEL_ORG_ID}`;
  
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${VERCEL_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: VERCEL_PROJECT_ID,
        gitSource: {
          type: 'github',
          repo: 'babelonxyz-max/hyperevm-treasury-dapp',
          ref: 'main',
        },
        target: 'production',
        forceNew: true, // Force new deployment
      }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Deployment triggered successfully!');
      console.log(`🔗 Deployment URL: https://vercel.com/deployments/${data.id}`);
      console.log(`🌐 Preview URL: ${data.url}`);
    } else {
      const error = await response.text();
      console.error('❌ Deployment failed:', error);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error triggering deployment:', error.message);
    process.exit(1);
  }
}
