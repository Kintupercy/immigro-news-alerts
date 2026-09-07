import { readFile, writeFile } from 'node:fs/promises';

// Preserve the asset-linked shell before prerender overwrites index.html with
// homepage content. Fail the build rather than deploy an unusable runtime shell.
const shell = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
if (!shell.includes('<div id="root"></div>') || !shell.includes('</head>')) {
  throw new Error('Expected a fresh Vite shell before prerendering');
}
await writeFile(new URL('../dist/news-shell.html', import.meta.url), shell);
console.log('[news-runtime] Preserved Vite shell for request-time news rendering.');
