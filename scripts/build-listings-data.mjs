import { readFile, writeFile } from "node:fs/promises";

const live = JSON.parse(await readFile(".sync/iproperty-live.json", "utf8"));
const previousSource = await readFile("listings-data.js", "utf8");
const previous = JSON.parse(previousSource.replace(/^window\.IPROPERTY_LISTINGS=/, "").replace(/;\s*$/, ""));
const previousById = new Map(previous.map((item) => [listingId(item.url), item]));

function listingId(url) {
  return url.match(/\/(?:sale|rent)-(\d+)\/?/)?.[1] ?? url;
}

function parsedRecord(card) {
  const lines = card.text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const priceIndex = lines.findIndex((line) => /^RM\s[\d,]+(?:\s\/mo)?$/.test(line));
  const price = priceIndex >= 0 ? lines[priceIndex] : "Price on request";
  let titleIndex = priceIndex + 1;
  if (/psf/i.test(lines[titleIndex] ?? "")) titleIndex += 1;
  const title = lines[titleIndex] || "Property listing";
  const sqftIndex = lines.findIndex((line, index) => index > titleIndex && /sqft/i.test(line));
  const propertyType = lines.slice(Math.max(sqftIndex + 1, 0)).find((line) =>
    /(?:House|Condominium|Residence|Apartment|Land|Factory|Warehouse|Office|Shop|Terraced|Bungalow|Semi-Detached|Superlink)/i.test(line)
  ) || "Residential property";
  const furnishing = lines.slice(Math.max(sqftIndex + 1, 0)).find((line) => /Furnished|Unfurnished/i.test(line));
  const details = [sqftIndex >= 0 ? lines[sqftIndex] : "See iProperty for details", furnishing].filter(Boolean).join(" | ");
  return {
    type: /\/rent-/.test(card.url) ? "rent" : "sale",
    price,
    title,
    details,
    propertyType,
    image: card.image,
    url: card.url,
  };
}

const listings = live.map((card) => {
  const old = previousById.get(listingId(card.url));
  const parsed = parsedRecord(card);
  return {
    ...parsed,
    image: card.image.includes("image-fallback.svg") ? (old?.image || "assets/futuristic-property-hero.jpg") : parsed.image,
  };
});

await writeFile("listings-data.js", `window.IPROPERTY_LISTINGS=${JSON.stringify(listings)};\n`, "utf8");
console.log(`Built ${listings.length} listings: ${listings.filter((x) => x.type === "sale").length} sale, ${listings.filter((x) => x.type === "rent").length} rent.`);
