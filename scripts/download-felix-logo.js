#!/usr/bin/env node

/**
 * Download Felix Logo from usefelix.xyz
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logoPaths = [
  '/logo.svg',
  '/logo.png',
  '/felix-logo.svg',
  '/felix-logo.png',
  '/images/logo.svg',
  '/assets/logo.svg',
  '/img/logo.svg',
  '/_next/static/media/logo',
];

const downloadFile = (url, dest) => {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(dest);
    
    protocol.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });
      } else {
        file.close();
        fs.unlinkSync(dest);
        reject(new Error(`Failed: ${response.statusCode}`));
      }
    }).on('error', (err) => {
      file.close();
      if (fs.existsSync(dest)) fs.unlinkSync(dest);
      reject(err);
    });
  });
};

console.log('🔍 Searching for Felix logo on usefelix.xyz...\n');

// Try common paths
for (const logoPath of logoPaths) {
  const url = `https://usefelix.xyz${logoPath}`;
  const dest = path.join(__dirname, '..', 'public', 'felix-logo-temp.svg');
  
  try {
    console.log(`Trying: ${url}`);
    await downloadFile(url, dest);
    console.log(`✅ Found logo at: ${url}`);
    
    // Move to final location
    const finalDest = path.join(__dirname, '..', 'public', 'felix-logo.svg');
    fs.renameSync(dest, finalDest);
    console.log(`✅ Logo saved to: ${finalDest}`);
    process.exit(0);
  } catch (error) {
    // Continue to next path
  }
}

console.log('❌ Could not find logo automatically.');
console.log('💡 Please provide the logo URL or path manually.');
process.exit(1);
