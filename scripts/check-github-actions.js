#!/usr/bin/env node

/**
 * Check GitHub Actions Status
 * Provides information about workflow runs
 */

console.log('🔍 Checking GitHub Actions status...\n');

console.log('📋 To check GitHub Actions status manually:');
console.log('   1. Go to: https://github.com/babelonxyz-max/hyperevm-treasury-dapp/actions');
console.log('   2. Look for "CI/CD Pipeline" workflow');
console.log('   3. Check if it\'s running or has failed\n');

console.log('🔑 Required GitHub Secrets for deployment:');
console.log('   - VERCEL_TOKEN');
console.log('   - VERCEL_ORG_ID');
console.log('   - VERCEL_PROJECT_ID\n');

console.log('📝 To configure secrets:');
console.log('   1. Go to: https://github.com/babelonxyz-max/hyperevm-treasury-dapp/settings/secrets/actions');
console.log('   2. Click "New repository secret"');
console.log('   3. Add each secret\n');

console.log('💡 If secrets are missing, the workflow will:');
console.log('   - Run lint, build, and security audit jobs');
console.log('   - Skip the Vercel deployment job');
console.log('   - Show as "skipped" in the workflow run\n');

console.log('🚀 Alternative: Use Vercel\'s native Git integration');
console.log('   - Vercel Dashboard → Project Settings → Git');
console.log('   - Connect your GitHub repository');
console.log('   - This will auto-deploy on every push\n');
