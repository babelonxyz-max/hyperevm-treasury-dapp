#!/usr/bin/env node

/**
 * Diagnose Deployment Issues
 * Checks common problems preventing deployments
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Diagnosing deployment issues...\n');

const issues = [];
const warnings = [];
const success = [];

// Check 1: Version files exist
console.log('1️⃣  Checking version files...');
try {
  const versionPath = path.join(__dirname, '..', 'version.json');
  const publicVersionPath = path.join(__dirname, '..', 'public', 'version.json');
  
  if (fs.existsSync(versionPath)) {
    const version = JSON.parse(fs.readFileSync(versionPath, 'utf8'));
    success.push(`✅ version.json exists: v${version.version}.${version.build}`);
  } else {
    issues.push('❌ version.json missing in root');
  }
  
  if (fs.existsSync(publicVersionPath)) {
    const version = JSON.parse(fs.readFileSync(publicVersionPath, 'utf8'));
    success.push(`✅ public/version.json exists: v${version.version}.${version.build}`);
  } else {
    issues.push('❌ public/version.json missing');
  }
} catch (error) {
  issues.push(`❌ Error reading version files: ${error.message}`);
}

// Check 2: Git status
console.log('\n2️⃣  Checking Git status...');
try {
  const gitStatus = execSync('git status --porcelain', { encoding: 'utf-8', cwd: path.join(__dirname, '..') });
  if (gitStatus.trim()) {
    warnings.push('⚠️  Uncommitted changes detected');
    console.log('   Uncommitted files:', gitStatus.trim().split('\n').length);
  } else {
    success.push('✅ Working directory is clean');
  }
  
  const currentBranch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8', cwd: path.join(__dirname, '..') }).trim();
  if (currentBranch === 'main') {
    success.push(`✅ On main branch: ${currentBranch}`);
  } else {
    warnings.push(`⚠️  Not on main branch: ${currentBranch}`);
  }
  
  const lastCommit = execSync('git log -1 --oneline', { encoding: 'utf-8', cwd: path.join(__dirname, '..') }).trim();
  success.push(`✅ Last commit: ${lastCommit}`);
} catch (error) {
  issues.push(`❌ Git error: ${error.message}`);
}

// Check 3: Vercel CLI
console.log('\n3️⃣  Checking Vercel CLI...');
try {
  execSync('vercel --version', { stdio: 'pipe' });
  success.push('✅ Vercel CLI is installed');
} catch (error) {
  warnings.push('⚠️  Vercel CLI not installed (optional, but helpful)');
  console.log('   Install with: npm i -g vercel');
}

// Check 4: GitHub Actions secrets (can't verify, but can check workflow)
console.log('\n4️⃣  Checking GitHub Actions configuration...');
const workflowPath = path.join(__dirname, '..', '.github', 'workflows', 'ci-cd.yml');
if (fs.existsSync(workflowPath)) {
  const workflow = fs.readFileSync(workflowPath, 'utf8');
  if (workflow.includes('VERCEL_TOKEN') && workflow.includes('VERCEL_ORG_ID') && workflow.includes('VERCEL_PROJECT_ID')) {
    warnings.push('⚠️  GitHub Actions requires secrets: VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID');
    console.log('   Check: https://github.com/babelonxyz-max/hyperevm-treasury-dapp/settings/secrets/actions');
  }
  success.push('✅ GitHub Actions workflow exists');
} else {
  issues.push('❌ GitHub Actions workflow missing');
}

// Check 5: Build output
console.log('\n5️⃣  Checking build output...');
const distPath = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distPath)) {
  const distVersionPath = path.join(distPath, 'version.json');
  if (fs.existsSync(distVersionPath)) {
    const version = JSON.parse(fs.readFileSync(distVersionPath, 'utf8'));
    success.push(`✅ dist/version.json exists: v${version.version}.${version.build}`);
  } else {
    warnings.push('⚠️  dist/version.json missing (run: npm run build)');
  }
} else {
  warnings.push('⚠️  dist/ directory missing (run: npm run build)');
}

// Check 6: Package.json scripts
console.log('\n6️⃣  Checking package.json scripts...');
const packagePath = path.join(__dirname, '..', 'package.json');
if (fs.existsSync(packagePath)) {
  const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  if (pkg.scripts?.build) {
    success.push('✅ build script exists');
  } else {
    issues.push('❌ build script missing');
  }
  if (pkg.scripts?.['hard-deploy']) {
    success.push('✅ hard-deploy script exists');
  }
}

// Summary
console.log('\n' + '='.repeat(50));
console.log('📊 DIAGNOSIS SUMMARY');
console.log('='.repeat(50));

if (success.length > 0) {
  console.log('\n✅ Success:');
  success.forEach(msg => console.log(`   ${msg}`));
}

if (warnings.length > 0) {
  console.log('\n⚠️  Warnings:');
  warnings.forEach(msg => console.log(`   ${msg}`));
}

if (issues.length > 0) {
  console.log('\n❌ Issues:');
  issues.forEach(msg => console.log(`   ${msg}`));
}

console.log('\n' + '='.repeat(50));

// Recommendations
console.log('\n💡 RECOMMENDATIONS:\n');

if (issues.length === 0 && warnings.length === 0) {
  console.log('✅ Everything looks good!');
  console.log('\nIf deployments still aren\'t working:');
  console.log('1. Check Vercel Dashboard: https://vercel.com/dashboard');
  console.log('2. Check GitHub Actions: https://github.com/babelonxyz-max/hyperevm-treasury-dapp/actions');
  console.log('3. Verify Vercel Git integration is connected');
  console.log('4. Check if GitHub secrets are configured');
} else {
  if (warnings.some(w => w.includes('GitHub Actions'))) {
    console.log('1. Configure GitHub Secrets:');
    console.log('   - Go to: https://github.com/babelonxyz-max/hyperevm-treasury-dapp/settings/secrets/actions');
    console.log('   - Add: VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID');
  }
  
  if (warnings.some(w => w.includes('Vercel CLI'))) {
    console.log('2. Install Vercel CLI for direct deployment:');
    console.log('   npm i -g vercel');
    console.log('   vercel login');
    console.log('   vercel link');
  }
  
  if (warnings.some(w => w.includes('dist'))) {
    console.log('3. Build the project:');
    console.log('   npm run build');
  }
}

console.log('\n');
