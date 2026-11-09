import fs from 'node:fs';

const clientTsPath = new URL('../src/generated/prisma/client.ts', import.meta.url);

// Older Prisma outputs a client.ts; newer ones ship client.js/client.d.ts.
// If client.ts exists, normalize its relative imports to include .js.
// This script is idempotent: re-running won't double-patch.
if (fs.existsSync(clientTsPath)) {
  const content = fs.readFileSync(clientTsPath, 'utf8');
  const patched = content.replace(
    /(\bfrom\s+["'])(\.[^"']+?)(\.js)*(["'])/g,
    (_match, prefix: string, importPath: string, _ext: string | undefined, suffix: string) =>
      `${prefix}${importPath}.js${suffix}`,
  );
  fs.writeFileSync(clientTsPath, patched);
  process.stdout.write(
    `Patched ESM imports in ${clientTsPath.pathname || clientTsPath.toString()}\n`,
  );
} else {
  process.stdout.write('No client.ts generated; skipping patch\n');
}
