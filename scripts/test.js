
#!/usr/bin/env node

process.env.BABEL_ENV = 'test';
process.env.NODE_ENV = 'test';

const jest = require('jest');
const argv = process.argv.slice(2);

// Add any default arguments you want to pass to Jest
const defaultArgs = ['--config', 'jest.config.js'];

// Combine default arguments with any passed in arguments
jest.run([...defaultArgs, ...argv]);
