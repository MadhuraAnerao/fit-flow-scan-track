
#!/usr/bin/env node

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Make test.js executable
fs.chmodSync(path.join(__dirname, 'test.js'), '755');

const scriptName = process.argv[2];

if (scriptName === 'test') {
  // Run Jest tests
  const args = process.argv.slice(3);
  const result = spawnSync('node', [path.join(__dirname, 'test.js'), ...args], { stdio: 'inherit' });
  process.exit(result.status);
} else if (scriptName === 'test:coverage') {
  // Run Jest tests with coverage
  const result = spawnSync('node', [path.join(__dirname, 'test.js'), '--coverage'], { stdio: 'inherit' });
  process.exit(result.status);
} else {
  console.error(`Unknown script: ${scriptName}`);
  process.exit(1);
}
