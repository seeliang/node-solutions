# Node EJS to Static HTML

Compile EJS templates into static HTML files. Useful for landing pages, prototypes, or prerendered sites.

## Prerequisites
- Node.js 18+ and npm

## Install
```bash
npm install
# If EJS is not in package.json yet:
npm i ejs
```

## Suggested structure
```
node-ejs-to-static-html
├─ views/                # .ejs templates (pages + partials)
├─ data/                 # optional JSON data (e.g., site.json)
├─ public/               # static assets to copy to dist
└─ dist/                 # output HTML (generated)
```

## Example build script
This example renders all `.ejs` files in `views/` (excluding partials starting with `_`) to `dist/`. Save it as `scripts/build.js`.

````javascript
/* Example: render EJS views to dist */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import fse from 'fs-extra';
import ejs from 'ejs';
import glob from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const viewsDir = path.join(__dirname, '..', 'views');
const distDir = path.join(__dirname, '..', 'dist');
const publicDir = path.join(__dirname, '..', 'public');
const dataFile = path.join(__dirname, '..', 'data', 'site.json');

async function main() {
  await fse.ensureDir(distDir);

  // Load optional data
  let data = {};
  if (fs.existsSync(dataFile)) {
    data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
  }

  // Copy public assets
  if (fs.existsSync(publicDir)) {
    await fse.copy(publicDir, distDir);
  }

  // Find all page templates
  const files = glob.sync('**/*.ejs', { cwd: viewsDir, nodir: true, dot: false })
    .filter(f => !path.basename(f).startsWith('_')); // skip partials

  for (const rel of files) {
    const src = path.join(viewsDir, rel);
    const outRel = rel.replace(/\.ejs$/i, '.html');
    const out = path.join(distDir, outRel);
    await fse.ensureDir(path.dirname(out));

    const html = await ejs.renderFile(src, data, { root: viewsDir, async: true });
    fs.writeFileSync(out, html, 'utf8');
    console.log(`Generated: ${outRel}`);
  }

  console.log('Done.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});