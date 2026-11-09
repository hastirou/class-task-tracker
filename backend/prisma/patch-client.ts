import fs from 'node:fs';

const clientPath = new URL('../src/generated/prisma/client.ts', import.meta.url);

const content = fs.readFileSync(clientPath, 'utf8');
const patched = content.replace(/(\bfrom\s+["'])(\.[^"']+)(["'])/g, '$1$2.js$3');
fs.writeFileSync(clientPath, patched);
process.stdout.write(`Patched ESM imports in ${clientPath.pathname || clientPath.toString()}\n`);
