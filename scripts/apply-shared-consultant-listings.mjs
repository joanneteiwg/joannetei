import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const names = ['joanne-tei', 'inshirah', 'umar', 'ai-ming', 'regan-foong'];

for (const name of names) {
  const file = path.join(root, 'consultants', `${name}.html`);
  let html = fs.readFileSync(file, 'utf8');
  const oldStart = html.indexOf('<div class="carousel" data-listing-carousel>');
  const syncedStart = html.indexOf('<div class="carousel" data-synced-listing-carousel>');
  const start = oldStart >= 0 ? oldStart : syncedStart;
  const controls = html.indexOf('<div class="listing-controls">', start);
  if (start < 0 || controls < 0) throw new Error(`Could not find listing carousel in ${name}`);

  html = `${html.slice(0, start)}<div class="carousel" data-synced-listing-carousel><div class="listing-track"></div></div>${html.slice(controls)}`;
  html = html.split(/\r?\n/).filter((line) => !line.includes("document.querySelectorAll('[data-listing-carousel]')")).join('\n');
  html = html.replace(
    '<p style="margin-top:18px;color:var(--muted);font-size:.82rem">Availability and pricing are maintained live. <a href="/listings.html" style="color:var(--lime)">View the full live portfolio &#8599;</a></p>',
    '<p data-listing-sync-note style="margin-top:18px;color:var(--muted);font-size:.82rem">Loading current iProperty listings…</p>'
  );
  html = html.replace(
    /<p style="margin-top:18px;color:var\(--muted\);font-size:\.82rem">Availability and pricing are maintained live\.[\s\S]*?<\/p>/,
    '<p data-listing-sync-note style="margin-top:18px;color:var(--muted);font-size:.82rem">Loading current iProperty listings…</p>'
  );
  html = html.replace('<span class="listing-page-number">1 / 10</span>', '<span class="listing-page-number">1 / 26</span>');
  if (!html.includes('../consultant-listings.js')) {
    html = html.replace('</body>', '<script src="../listings-data.js"></script><script src="../consultant-listings.js"></script></body>');
  }
  fs.writeFileSync(file, html);
}
