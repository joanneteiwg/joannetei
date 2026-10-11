import http from "node:http";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const port = 8899;
const outputDir = path.resolve(".sync");
const outputFile = path.join(outputDir, "iproperty-live.json");

const page = `<!doctype html><meta charset="utf-8"><title>iProperty sync receiver</title>
<form method="post" action="/save"><textarea name="payload" aria-label="Listing data"></textarea><button type="submit">Save listing data</button></form>`;

http.createServer(async (request, response) => {
  if (request.method === "GET") {
    response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    response.end(page);
    return;
  }

  if (request.method === "POST" && request.url === "/save") {
    let body = "";
    for await (const chunk of request) body += chunk;
    const payload = new URLSearchParams(body).get("payload") ?? "";
    const records = JSON.parse(payload);
    if (!Array.isArray(records) || records.length === 0) throw new Error("No listing records received");
    await mkdir(outputDir, { recursive: true });
    await writeFile(outputFile, `${JSON.stringify(records, null, 2)}\n`, "utf8");
    response.writeHead(200, { "content-type": "text/plain; charset=utf-8" });
    response.end(`Saved ${records.length} listings`);
    return;
  }

  response.writeHead(404).end("Not found");
}).listen(port, "127.0.0.1", () => {
  console.log(`Receiver ready at http://127.0.0.1:${port}`);
});
