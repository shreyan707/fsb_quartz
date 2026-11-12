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
// Quartz's page text glues table cells together ("LanguageHindiCountryIndia"), and search matches
// word *starts*, so searching "hindi" never finds the film. Re-read each built page's tables and
// append their cells separated by spaces so every cell value is a searchable word.
const entities = { "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#39;": "'", "&nbsp;": " " }
const cellText = (html) =>
  html
    .replace(/<[^>]*>/g, "")
    .replace(/&(?:amp|lt|gt|quot|#39|nbsp);/g, (m) => entities[m])
    .replace(/\s+/g, " ")
    .trim()
const tableText = (slug) => {
  const page = join(root, `${slug}.html`)
  if (!existsSync(page)) return ""
  const rows = []
  for (const [table] of readFileSync(page, "utf-8").matchAll(/<table[\s\S]*?<\/table>/g)) {
    for (const [, row] of table.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/g)) {
      const cells = [...row.matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/g)].map((m) => cellText(m[1]))
      const line = cells.filter(Boolean).join(" ")
      if (line) rows.push(line)
    }
  }
  return rows.join("\n")
}

const lean = {}
const search = {}
for (const [slug, entry] of Object.entries(full)) {
  const { content, ...rest } = entry
  lean[slug] = rest
  const tables = tableText(slug)
  search[slug] = {
    title: entry.title ?? "",
    tags: entry.tags ?? [],
    content: tables ? `${content ?? ""}\n${tables}` : (content ?? ""),
  }
}

writeFileSync(file, JSON.stringify(lean))
writeFileSync(join(root, "static", "searchIndex.json"), JSON.stringify(search))
const kb = (o) => (Buffer.byteLength(JSON.stringify(o)) / 1024).toFixed(0)
console.log(`split-content-index: ${Object.keys(full).length} pages, contentIndex ${kb(lean)} KiB, searchIndex ${kb(search)} KiB`)
