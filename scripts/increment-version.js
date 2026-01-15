import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.join(__dirname, '..');
const versionPath = path.join(rootDir, 'version.json');
const publicVersionPath = path.join(rootDir, 'public', 'version.json');

try {
  // Read current version
  const versionData = JSON.parse(fs.readFileSync(versionPath, 'utf8'));
  
  // Increment build number
  versionData.build = (versionData.build || 0) + 1;
  
  // Also update timestamp
  versionData.deployedAt = new Date().toISOString();
  
  // Write to root version.json
  fs.writeFileSync(versionPath, JSON.stringify(versionData, null, 2) + '\n');
  
  // Also copy to public/version.json so it's accessible in the browser
  fs.writeFileSync(publicVersionPath, JSON.stringify(versionData, null, 2) + '\n');
  
  console.log(`✅ Version incremented to v${versionData.version}.${versionData.build}`);
  console.log(`   Deployed at: ${versionData.deployedAt}`);
} catch (error) {
  console.error('❌ Error incrementing version:', error);
  process.exit(1);
}
