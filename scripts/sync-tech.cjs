const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const root = path.resolve(__dirname, '..');
const configPath = path.join(root, 'capacitor.config.ts');
const configBakPath = path.join(root, 'capacitor.config.ts.bak');
const techConfigPath = path.join(root, 'capacitor.config.tech.ts');

console.log('Building tech app...');
execSync('npm run build:tech', { stdio: 'inherit', cwd: root });

console.log('Swapping configuration files...');
fs.renameSync(configPath, configBakPath);
fs.renameSync(techConfigPath, configPath);

try {
  console.log('Syncing android-tech...');
  execSync('npx cap sync android', { stdio: 'inherit', cwd: root });
} catch (error) {
  console.error('Sync failed:', error);
} finally {
  console.log('Restoring configuration files...');
  fs.renameSync(configPath, techConfigPath);
  fs.renameSync(configBakPath, configPath);
}
