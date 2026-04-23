import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const configPath = path.join(__dirname, 'src', 'config.json');

// Get the target mode from command line arguments
const targetMode = process.argv[2];

if (targetMode !== 'development' && targetMode !== 'production') {
  console.error("Usage: node toggle-env.js <development|production>");
  process.exit(1);
}

try {
  // Read current config
  const rawData = fs.readFileSync(configPath, 'utf8');
  const config = JSON.parse(rawData);

  // Update mode
  config.mode = targetMode;

  // Write back formatted JSON
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');

  console.log(`✅ Successfully switched environment mode to: ${targetMode}`);
} catch (err) {
  console.error('❌ Failed to update config.json:', err.message);
  process.exit(1);
}
