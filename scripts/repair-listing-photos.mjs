import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync('listings-data.js', 'utf8');
const context = { window: {} };
vm.createContext(context);
vm.runInContext(source, context);
const listings = context.window.IPROPERTY_LISTINGS;
const isUsable = (image) => image && !image.includes('image-fallback.svg') && !image.includes('futuristic-property-hero');
const usable = listings.filter((listing) => isUsable(listing.image));
const pools = new Map();

for (const listing of usable) {
  const key = listing.propertyType.toLowerCase();
  const pool = pools.get(key) || [];
  pool.push(listing.image);
  pools.set(key, pool);
}

let repaired = 0;
for (const listing of listings) {
  if (isUsable(listing.image)) continue;
  const pool = pools.get(listing.propertyType.toLowerCase()) || usable.map((item) => item.image);
  listing.image = pool.length ? pool[repaired % pool.length] : 'assets/futuristic-property-hero.jpg';
  repaired += 1;
}

fs.writeFileSync('listings-data.js', `window.IPROPERTY_LISTINGS=${JSON.stringify(listings)};\n`);
console.log(`Repaired ${repaired} missing listing photos.`);
