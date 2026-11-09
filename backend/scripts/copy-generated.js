import fs from 'node:fs';
import path from 'node:path';

const srcDir = path.resolve('src/generated/prisma');
const destDir = path.resolve('dist/generated/prisma');

if (!fs.existsSync(srcDir)) {
  process.stderr.write(`Generated Prisma client not found at ${srcDir}\n`);
  process.exit(1);
}

fs.rmSync(destDir, { recursive: true, force: true });
fs.cpSync(srcDir, destDir, { recursive: true });
process.stdout.write(`Copied ${srcDir} -> ${destDir}\n`);
