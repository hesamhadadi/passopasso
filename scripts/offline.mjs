import { readdir, writeFile, readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
const files = (await readdir("dist", { recursive: true, withFileTypes: true }))
  .filter((x) => x.isFile() && x.name !== "sw.js")
  .map((x) => (x.parentPath + "/" + x.name).replace(/^dist/, ""))
  .sort();
const h = createHash("sha256");
for (const f of files) h.update(await readFile("dist" + f));
const name = "passopasso-" + h.digest("hex").slice(0, 12);
await writeFile(
  "dist/sw.js",
  `const NAME=${JSON.stringify(name)},FILES=${JSON.stringify(files)};self.addEventListener('install',e=>e.waitUntil(caches.open(NAME).then(c=>c.addAll(FILES))));self.addEventListener('activate',e=>e.waitUntil(Promise.all([caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('passopasso-')&&k!==NAME).map(k=>caches.delete(k)))),self.clients.claim()])));self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method!=='GET'||u.origin!==location.origin)return;const key=e.request.mode==='navigate'?'/index.html':u.pathname;if(FILES.includes(key))e.respondWith(caches.open(NAME).then(c=>c.match(key)).then(r=>r||fetch(e.request)))})`,
);
