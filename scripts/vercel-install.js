#!/usr/bin/env node
/**
 * Safe Vercel install — never `cd client` (fails when Root Directory is already `client`).
 * Prefer: leave Root Directory empty and use repo-root vercel.json.
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = process.cwd();
const hasClient = fs.existsSync(path.join(root, 'client', 'package.json'));
const hasWorkspaces = fs.existsSync(path.join(root, 'package.json'));

const run = (cmd) => {
  console.log(`> ${cmd}`);
  execSync(cmd, { stdio: 'inherit', env: process.env });
};

run('npm install --legacy-peer-deps --no-audit --no-fund');

// Only run a nested client install when client/ exists AND we are not already inside it
if (hasClient && hasWorkspaces && path.basename(root) !== 'client') {
  const clientNodeModules = path.join(root, 'client', 'node_modules');
  // workspaces usually hoist — skip second install unless clearly needed
  if (!fs.existsSync(path.join(root, 'node_modules', 'vite'))) {
    run('npm install --legacy-peer-deps --no-audit --no-fund --prefix ./client');
  }
}

console.log('Install complete at', root);
