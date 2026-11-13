// Local test server for the built site: node scripts/serve.mjs [dir] [port]
// Serves public/ at the root, like the live Cloudflare site (http://localhost:8123/).
import http from "node:http"
import { readFile, stat } from "node:fs/promises"
import { join, extname, resolve, sep } from "node:path"

const root = resolve(process.argv[2] ?? "public")
const port = Number(process.argv[3] ?? 8123)
const types = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".mjs": "text/javascript",
  ".css": "text/css", ".json": "application/json", ".xml": "application/xml",
  ".webp": "image/webp", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png",
  ".avif": "image/avif", ".gif": "image/gif", ".svg": "image/svg+xml", ".ico": "image/x-icon",
  ".woff2": "font/woff2", ".woff": "font/woff", ".txt": "text/plain", ".wasm": "application/wasm",
}
const isFile = async (f) => stat(f).then((s) => s.isFile(), () => false)
const isDir = async (f) => stat(f).then((s) => s.isDirectory(), () => false)

http.createServer(async (req, res) => {
  const p = decodeURIComponent(req.url.split("?")[0])
  let f = join(root, p)
  if (f !== root && !f.startsWith(root + sep)) { res.writeHead(403); return res.end() }
  if (await isDir(f)) f = join(f, "index.html")
  else if (!(await isFile(f)) && (await isFile(f + ".html"))) f += ".html"
  if (!(await isFile(f))) {
    res.writeHead(404, { "content-type": "text/html; charset=utf-8" })
    return res.end(await readFile(join(root, "404.html")).catch(() => "not found"))
  }
  res.writeHead(200, { "content-type": types[extname(f).toLowerCase()] ?? "application/octet-stream" })
  res.end(await readFile(f))
}).listen(port, () => console.log(`Serving ${root} on http://localhost:${port}/`))
