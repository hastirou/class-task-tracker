import fs from 'node:fs';

const clientPath = new URL('../src/generated/prisma/client.ts', import.meta.url);

const content = fs.readFileSync(clientPath, 'utf8');
// Normalize relative ESM imports so the path always ends with exactly one .js.
const patched = content.replace(
  /(\bfrom\s+["'])(\.[^"']+?)(\.js)*(["'])/g,
  (_match, prefix: string, importPath: string, _ext: string | undefined, suffix: string) =>
    `${prefix}${importPath}.js${suffix}`,
);
fs.writeFileSync(clientPath, patched);
process.stdout.write(`Patched ESM imports in ${clientPath.pathname || clientPath.toString()}\n`);
