const fs = require('fs');
const path = require('path');

function copyDirRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      // Skip original and analysis backup folders to keep dist lightweight
      if (entry.name === 'original' || entry.name === 'analysis' || entry.name === 'backups') continue;
      copyDirRecursive(srcPath, destPath);
    } else {
      // If file already exists in dest (e.g. Vite bundle in dist/assets), don't overwrite if dest is newer
      if (!fs.existsSync(destPath)) {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }
}

console.log('Copying subpages and static assets into dist...');

// 1. Copy subpage portfolios
copyDirRecursive('webdev_portfolio', 'dist/webdev_portfolio');
copyDirRecursive('appdev_portfolio', 'dist/appdev_portfolio');
copyDirRecursive('UIUX_portfolio', 'dist/UIUX_portfolio');
copyDirRecursive('graphic', 'dist/graphic');

// 2. Copy root assets into dist/assets
copyDirRecursive('assets', 'dist/assets');

// 3. Copy root index.live.html into dist/index.live.html
if (fs.existsSync('index.live.html')) {
  fs.copyFileSync('index.live.html', 'dist/index.live.html');
}

// 4. Create alias folders so /projects, /web-developer, etc. all work without 404
const aliases = [
  { from: 'webdev_portfolio/index.live.html', to: 'projects/index.html' },
  { from: 'webdev_portfolio/index.live.html', to: 'web-developer/index.html' },
  { from: 'appdev_portfolio/index.live.html', to: 'beyond-code/index.html' },
  { from: 'appdev_portfolio/index.live.html', to: 'app-developer/index.html' },
  { from: 'UIUX_portfolio/index.live.html', to: 'certificates/index.html' },
  { from: 'UIUX_portfolio/index.live.html', to: 'ui-ux-designer/index.html' },
  { from: 'graphic/index.html', to: 'graphic-designer/index.html' }
];

aliases.forEach(a => {
  if (fs.existsSync(a.from)) {
    const targetDir = path.dirname(path.join('dist', a.to));
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
    // Write an HTML file that redirects or embeds cleanly
    const relToRoot = '../';
    const content = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta http-equiv="refresh" content="0; url=${relToRoot}${a.from}"><script>location.replace('${relToRoot}${a.from}');</script></head><body>Redirecting to <a href="${relToRoot}${a.from}">portfolio</a>...</body></html>`;
    fs.writeFileSync(path.join('dist', a.to), content, 'utf8');
  }
});

console.log('Successfully populated dist folder!');
