#!/usr/bin/env node

const { execSync } = require('child_process');
const os = require('os');
const fs = require('fs');
const path = require('path');

console.log('Installing platform-specific SWC package...');
console.log('Platform:', os.platform(), os.arch());

let swcPackage = '';

if (os.platform() === 'win32') {
  if (os.arch() === 'x64') {
    swcPackage = '@next/swc-win32-x64-msvc';
  } else {
    swcPackage = '@next/swc-win32-ia32-msvc';
  }
} else if (os.platform() === 'darwin') {
  if (os.arch() === 'arm64') {
    swcPackage = '@next/swc-darwin-arm64';
  } else {
    swcPackage = '@next/swc-darwin-x64';
  }
} else if (os.platform() === 'linux') {
  if (os.arch() === 'arm64') {
    swcPackage = '@next/swc-linux-arm64-gnu';
  } else {
    swcPackage = '@next/swc-linux-x64-gnu';
  }
} else {
  console.log('Unsupported platform, skipping SWC installation');
  process.exit(0);
}

if (swcPackage) {
  try {
    console.log(`Installing ${swcPackage}...`);
    execSync(`npm install ${swcPackage}@15.5.2 --no-save`, { stdio: 'inherit' });
    console.log('SWC package installed successfully');
  } catch (error) {
    console.error('Failed to install SWC package:', error.message);
    process.exit(1);
  }
}
