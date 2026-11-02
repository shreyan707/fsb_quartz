// Post-build fix for body #tags. obsidian-flavored-markdown emits an already
// page-relative href ("../../tags/x") and crawl-links then prefixes the path to
// root again, giving "../.././../tags/x". That works on a root-hosted site (the
// browser clamps at "/") but climbs out of the /fsb_quartz/ prefix on GitHub Pages.
// Rewrites those hrefs from their data-slug using the file's real depth.
import { readdirSync, readFileSync, writeFileSync, statSync } from "node:fs"
import { join, relative, dirname, sep } from "node:path"

const root = process.argv[2] ?? "public"
const linkRe = /<a href="[^"]*" (class="[^"]*tag-link[^"]*" data-slug="(tags\/[^"]+)")/g

let files = 0
let links = 0
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) walk(p)
    else if (name.endsWith(".html")) fix(p)
  }
}

const fix = (file) => {
  const html = readFileSync(file, "utf8")
  // foo/bar.html is served at /foo/bar and foo/index.html at /foo/: both resolve
  // relative links from /foo/, so the way up is one "../" per directory
  const dirs = dirname(relative(root, file)).split(sep).filter((s) => s && s !== ".")
  const up = "../".repeat(dirs.length) || "./"
  const out = html.replace(linkRe, (_, rest, slug) => {
    links++
    return `<a href="${up}${slug}" ${rest}`
  })
  if (out !== html) {
    writeFileSync(file, out)
    files++
  }
}

walk(root)
console.log(`fix-tag-links: rewrote ${links} links in ${files} files`)
