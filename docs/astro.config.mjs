import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';

const prepareSite = fileURLToPath(new URL('../scripts/build-docs.py', import.meta.url));

export default defineConfig({
  output: 'static',
  base: process.env.DOCS_BASE || '/',
  outDir: '../dist/docs',
  build: { format: 'file' },
  compressHTML: false,
  integrations: [{
    name: 'kav-ui-docs',
    hooks: {
      'astro:build:done': ({ dir }) => {
        execFileSync('python3', [prepareSite, '--site-dir', fileURLToPath(dir)], {
          stdio: 'inherit',
        });
      },
    },
  }],
});
