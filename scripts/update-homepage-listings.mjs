import { readFile, writeFile } from "node:fs/promises";

const file = "index.html";
let html = await readFile(file, "utf8");

const section = `<section id="projects"><div class="wrap"><div class="section-head"><div><div class="eyebrow">Property Listings</div><h2 class="title">Featured Cyberjaya Listings.</h2></div><p>Browse Joanne Tei’s complete, current iProperty portfolio. Every listing includes its matching property photo and links to the active advertisement.</p></div><div class="carousel" data-synced-listing-carousel><div class="listing-track"></div></div><div class="listing-controls"><button class="control" data-listing-prev aria-label="Previous listing page">←</button><span class="listing-page-number">1 / 32</span><button class="control" data-listing-next aria-label="Next listing page">→</button></div><p data-listing-sync-note style="margin-top:18px;color:var(--muted);font-size:.82rem">Loading current iProperty listings…</p></div></section>`;

html = html.replace(/<section id="projects">[\s\S]*?<section class="portfolio"/, `${section}\n<section class="portfolio"`);
html = html.replace(/document\.querySelectorAll\('\[data-listing-carousel\]'\)[\s\S]*?showPage\(\)\}\);\s*/, "");
if (!html.includes('src="listings-data.js"')) {
  html = html.replace(/<script>\r?\ndocument\.getElementById\('year'\)/, '<script src="listings-data.js"></script>\n<script src="consultant-listings.js"></script>\n<script>\ndocument.getElementById(\'year\')');
}

await writeFile(file, html, "utf8");
