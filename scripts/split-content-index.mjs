// Post-build: split the content index so ordinary pages don't download page text.
//   static/contentIndex.json -> slug, filePath, title, links, tags   (explorer, graph, 404)
//   static/searchIndex.json  -> title, tags, content                 (search, fetched on first open)
// Run after `quartz build`: node scripts/split-content-index.mjs public
import { readFileSync, writeFileSync, existsSync } from "node:fs"
import { join } from "node:path"

const root = process.argv[2] ?? "public"
const file = join(root, "static", "contentIndex.json")
if (!existsSync(file)) {
  console.error(`split-content-index: ${file} not found`)
  process.exit(1)
}

const full = JSON.parse(readFileSync(file, "utf-8"))
if (!Object.values(full).some((e) => typeof e.content === "string")) {
  console.log("split-content-index: already split, nothing to do")
  process.exit(0)
}
const lean = {}
const search = {}
for (const [slug, entry] of Object.entries(full)) {
  const { content, ...rest } = entry
  lean[slug] = rest
  search[slug] = { title: entry.title ?? "", tags: entry.tags ?? [], content: content ?? "" }
}

writeFileSync(file, JSON.stringify(lean))
writeFileSync(join(root, "static", "searchIndex.json"), JSON.stringify(search))
const kb = (o) => (Buffer.byteLength(JSON.stringify(o)) / 1024).toFixed(0)
console.log(`split-content-index: ${Object.keys(full).length} pages, contentIndex ${kb(lean)} KiB, searchIndex ${kb(search)} KiB`)
