// Prepares the built site for Cloudflare Workers Static Assets.
//   - copies cloudflare/_headers into <root>/
//   - removes <root>/CNAME (GitHub Pages only)
//   - fails if the free-plan limits (20,000 files, 25 MiB per file) are exceeded
// Run after `quartz build` and the other post-build scripts: node scripts/prepare-cloudflare.mjs public
import { readdirSync, statSync, copyFileSync, rmSync, existsSync } from "node:fs"
import { join, resolve } from "node:path"

const root = resolve(process.argv[2] ?? "public")
const MAX_FILES = 20000
const MAX_BYTES = 25 * 1024 * 1024

copyFileSync("cloudflare/_headers", join(root, "_headers"))
if (existsSync(join(root, "CNAME"))) rmSync(join(root, "CNAME"))

let files = 0
const tooBig = []
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    const st = statSync(p)
    if (st.isDirectory()) walk(p)
    else {
      files++
      if (st.size > MAX_BYTES) tooBig.push(p)
    }
  }
}
walk(root)

if (tooBig.length) {
  console.error(`prepare-cloudflare: files over 25 MiB:\n  ${tooBig.join("\n  ")}`)
  process.exit(1)
}
if (files > MAX_FILES) {
  console.error(`prepare-cloudflare: ${files} files exceeds the free-plan limit of ${MAX_FILES}; switch to Workers Paid (100k).`)
  process.exit(1)
}
console.log(`prepare-cloudflare: ${files} files OK (limit ${MAX_FILES})`)
