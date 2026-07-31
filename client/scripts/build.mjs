import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientRoot = path.join(__dirname, '..');
const repoRoot = path.join(clientRoot, '..');

const requireFrom = (pkgJsonPath) => createRequire(pkgJsonPath);

function resolveViteBin() {
  for (const base of [
    path.join(clientRoot, 'package.json'),
    path.join(repoRoot, 'package.json'),
  ]) {
    try {
      const require = requireFrom(base);
      const vitePkgDir = path.dirname(require.resolve('vite/package.json'));
      const bin = path.join(vitePkgDir, 'bin', 'vite.js');
      if (fs.existsSync(bin)) return bin;
    } catch {
      /* try next */
    }
  }
  return null;
}

const viteBin = resolveViteBin();
if (!viteBin) {
  console.error('vite is not installed. Run npm install from the repo root.');
  process.exit(1);
}

const result = spawnSync(process.execPath, [viteBin, 'build', ...process.argv.slice(2)], {
  stdio: 'inherit',
  cwd: clientRoot,
  env: process.env,
});

process.exit(result.status ?? 1);
