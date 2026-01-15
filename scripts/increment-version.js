import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const versionPath = path.join(__dirname, '..', 'version.json');

try {
  const versionData = JSON.parse(fs.readFileSync(versionPath, 'utf8'));
  
  // Increment build number
  versionData.build = (versionData.build || 0) + 1;
  
  // Also update timestamp
  versionData.deployedAt = new Date().toISOString();
  
  fs.writeFileSync(versionPath, JSON.stringify(versionData, null, 2) + '\n');
  
  console.log(`✅ Version incremented to v${versionData.version} (build ${versionData.build})`);
  console.log(`   Deployed at: ${versionData.deployedAt}`);
} catch (error) {
  console.error('❌ Error incrementing version:', error);
  process.exit(1);
}
