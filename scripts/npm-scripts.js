
// Script to run Jest tests

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

try {
  // Make test.js executable if it exists
  const testJsPath = path.join(__dirname, 'test.js');
  if (fs.existsSync(testJsPath)) {
    fs.chmodSync(testJsPath, '755');
  }

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
} catch (error) {
  console.error('Error executing script:', error);
  process.exit(1);
}
