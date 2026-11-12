// Turns a built site into a redirect-only site for the old GitHub Pages address.
// Every page becomes a stub that sends visitors to the same path on the new host
// (canonical link + meta refresh + JS redirect keeping query/hash). 404.html catches
// anything else. index.xml (RSS) is kept so feed readers get items on the new host.
// Everything else (assets, sitemap, CNAME) is deleted.
// Run after `quartz build`: node scripts/make-redirect-site.mjs public https://new.host
import { readdirSync, statSync, writeFileSync, rmSync, existsSync } from "node:fs"
import { join, relative, sep } from "node:path"

const root = process.argv[2] ?? "public"
const target = (process.argv[3] ?? "").replace(/\/+$/, "")
if (!/^https:\/\/[^/]+$/.test(target)) {
  console.error("usage: node scripts/make-redirect-site.mjs <dir> https://new.host")
  process.exit(1)
}

const KEEP = new Set(["index.xml"])
const esc = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;")

const stub = (url) => `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<title>Moved</title>
<link rel="canonical" href="${esc(url)}">
<meta http-equiv="refresh" content="0; url=${esc(url)}">
<script>location.replace(${JSON.stringify(url)} + location.search + location.hash)</script>
</head><body><p>This site has moved to <a href="${esc(url)}">${esc(url)}</a>.</p></body></html>
`

// 404: strip the old /fsb_quartz prefix and go to the same path on the new host
const notFound = `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<title>Moved</title>
<meta name="robots" content="noindex">
<script>location.replace(${JSON.stringify(target)} + location.pathname.replace(/^\\/fsb_quartz(?=\\/|$)/, "").replace(/\\.html$/, "") + location.search + location.hash)</script>
</head><body><p>This site has moved to <a href="${esc(target)}/">${esc(target)}</a>.</p></body></html>
`

let pages = 0
let removed = 0
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) {
      walk(p)
      if (readdirSync(p).length === 0) rmSync(p, { recursive: true })
      continue
    }
    const rel = relative(root, p).split(sep).join("/")
    if (KEEP.has(rel)) continue
    if (rel.endsWith(".html") && rel !== "404.html") {
      // foo/index.html -> /foo/, foo.html -> /foo, index.html -> /
      const path = rel === "index.html" ? "" : rel.replace(/(^|\/)index\.html$/, "$1").replace(/\.html$/, "")
      const url = `${target}/${encodeURI(path)}`
      writeFileSync(p, stub(url))
      pages++
    } else {
      rmSync(p)
      removed++
    }
  }
}

if (!existsSync(root)) {
  console.error(`make-redirect-site: ${root} not found`)
  process.exit(1)
}
walk(root)
writeFileSync(join(root, "404.html"), notFound)
console.log(`make-redirect-site: ${pages} redirect stubs to ${target}, ${removed} other files removed`)
