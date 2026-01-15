#!/usr/bin/env node

/**
 * Verify Build - Check that version.json is in dist
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distVersionPath = path.join(__dirname, '..', 'dist', 'version.json');
const publicVersionPath = path.join(__dirname, '..', 'public', 'version.json');

try {
  // Check if dist/version.json exists
  if (fs.existsSync(distVersionPath)) {
    const versionData = JSON.parse(fs.readFileSync(distVersionPath, 'utf8'));
    console.log(`✅ Build verified: version.json found in dist/`);
    console.log(`   Version: v${versionData.version}.${versionData.build}`);
  } else {
    // Copy from public if it doesn't exist
    if (fs.existsSync(publicVersionPath)) {
      const distDir = path.dirname(distVersionPath);
      if (!fs.existsSync(distDir)) {
        fs.mkdirSync(distDir, { recursive: true });
      }
      fs.copyFileSync(publicVersionPath, distVersionPath);
      console.log(`✅ Copied version.json to dist/`);
    } else {
      console.warn('⚠️  version.json not found in public/. Creating default...');
      const defaultVersion = {
        version: "1.0.0",
        build: 0,
        deployedAt: new Date().toISOString()
      };
      fs.writeFileSync(distVersionPath, JSON.stringify(defaultVersion, null, 2) + '\n');
    }
  }
} catch (error) {
  console.error('❌ Error verifying build:', error);
  process.exit(1);
}
