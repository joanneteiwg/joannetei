import { mkdir, readFile, writeFile } from "node:fs/promises";
import { extname } from "node:path";
import vm from "node:vm";

const source = await readFile("listings-data.js", "utf8");
const context = { window: {} };
vm.createContext(context);
vm.runInContext(source, context);
const listings = context.window.IPROPERTY_LISTINGS;
const outputDir = "assets/listing-photos";
await mkdir(outputDir, { recursive: true });

const contentTypeExtensions = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

const failures = [];
let downloaded = 0;

for (const [index, listing] of listings.entries()) {
  const id = listing.url.match(/\/(?:sale|rent)-(\d+)\/?/)?.[1] || String(index + 1);
  try {
    const response = await fetch(listing.image, {
      headers: {
        accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
        referer: "https://www.iproperty.com.my/",
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/141 Safari/537.36",
      },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const type = response.headers.get("content-type")?.split(";")[0] || "";
    if (!type.startsWith("image/")) throw new Error(`Unexpected content type: ${type || "unknown"}`);
    const extension = contentTypeExtensions[type] || extname(new URL(listing.image).pathname) || ".jpg";
    const path = `${outputDir}/${id}${extension}`;
    await writeFile(path, Buffer.from(await response.arrayBuffer()));
    listing.image = path.replaceAll("\\", "/");
    downloaded += 1;
  } catch (error) {
    failures.push({ id, url: listing.image, error: error.message });
  }
  if ((index + 1) % 25 === 0) console.log(`Processed ${index + 1}/${listings.length}`);
}

await writeFile("listings-data.js", `window.IPROPERTY_LISTINGS=${JSON.stringify(listings)};\n`, "utf8");
await writeFile(".sync/iproperty-photo-download-report.json", `${JSON.stringify({ downloaded, failures }, null, 2)}\n`, "utf8");
console.log(`Downloaded ${downloaded}/${listings.length} listing photos. Failures: ${failures.length}.`);
if (failures.length) process.exitCode = 2;
