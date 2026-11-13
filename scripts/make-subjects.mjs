// Turns plain wikilinks on a Themes page into real Subject pages.
//
//   npm run subjects -- "content/Themes/Decoding American Wet Dream (DAWD).md"
//   npm run subjects -- "content/Themes/Some Theme.md" --dry     (preview only)
//
// Authors just type [[Some Name]] (or [[Some Name|shown text]]). For every such
// link that does not already point at a page, this script:
//   1. creates content/Subjects/some-name.md  (title + link back to the theme)
//   2. rewrites the link to [[Subjects/some-name|Some Name]]
// If the link sits in a table row that has a film link ([[movies/...]]), that
// film is listed on the subject page, so shared subjects collect all their films.
// Links that already contain a "/" or "#", embeds (![[...]]), and anything inside
// code blocks are left alone. Safe to re-run: nothing is overwritten.
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync, mkdirSync } from "node:fs"
import { basename, dirname, join, resolve } from "node:path"

const args = process.argv.slice(2)
const dry = args.includes("--dry")
const target = args.find((a) => !a.startsWith("--"))
if (!target) {
  console.error('Usage: npm run subjects -- "content/Themes/<page>.md" [--dry]')
  process.exit(1)
}

const contentDir = resolve("content")
const subjectsDir = join(contentDir, "Subjects")
const themePath = resolve(target)
if (!existsSync(themePath)) {
  console.error(`File not found: ${target}`)
  process.exit(1)
}

// ---- index of every existing page (by lowercase basename) ----
const pages = new Map() // basename -> absolute path
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) walk(p)
    else if (name.endsWith(".md")) pages.set(name.slice(0, -3).toLowerCase(), p)
  }
}
walk(contentDir)

const slugify = (s) =>
  s
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

const frontField = (text, key) => {
  const m = text.match(new RegExp(`^${key}:\\s*"?(.*?)"?\\s*$`, "m"))
  return m ? m[1] : undefined
}

const filmBullet = (filmTarget, fallbackTitle) => {
  const file = pages.get(basename(filmTarget).toLowerCase())
  let title = fallbackTitle
  let extra = ""
  if (file) {
    const fm = readFileSync(file, "utf8")
    title = frontField(fm, "title") ?? title
    const year = frontField(fm, "release_year")
    const director = frontField(fm, "director")
    if (year) extra += ` (${year})`
    if (director) extra += ` — ${director}`
  }
  return `- [[${filmTarget}|${title}]]${extra}`
}

// ---- process the theme page ----
const original = readFileSync(themePath, "utf8")
const eol = original.includes("\r\n") ? "\r\n" : "\n"
const lines = original.split(/\r?\n/)
const themeName = frontField(original, "title") ? basename(themePath, ".md") : basename(themePath, ".md")

const linkRe = /(?<!!)\[\[([^\[\]|\\#/]+?)(?:\\?\|([^\[\]]*?))?\]\]/g
const filmRe = /\[\[(movies\/[^\[\]|\\#]+?)(?:\\?\|([^\[\]]*?))?\]\]/

const subjects = new Map() // slug -> { title, file, films:[bullet], isNew }
let inFence = false
let inFront = lines[0]?.trim() === "---"

const out = lines.map((line, i) => {
  if (inFront) {
    if (i > 0 && line.trim() === "---") inFront = false
    return line
  }
  if (/^\s*(```|~~~)/.test(line)) {
    inFence = !inFence
    return line
  }
  if (inFence) return line

  const isTableRow = line.trimStart().startsWith("|")
  const filmMatch = isTableRow ? line.match(filmRe) : null
  const film = filmMatch ? filmBullet(filmMatch[1], filmMatch[2] ?? basename(filmMatch[1])) : null
  const pipe = isTableRow ? "\\|" : "|"

  return line.replace(linkRe, (whole, rawName, rawAlias) => {
    const name = rawName.trim()
    const display = (rawAlias ?? name).trim()
    const slug = slugify(name)
    if (!slug) return whole

    const existing = pages.get(name.toLowerCase()) ?? pages.get(slug)
    const inSubjects = (p) => p && dirname(p) === subjectsDir
    if (existing && !inSubjects(existing)) return whole // already a real page elsewhere

    let entry = subjects.get(slug)
    if (!entry) {
      const file = existing ?? join(subjectsDir, `${slug}.md`)
      entry = { title: name, file, films: [], isNew: !existing }
      subjects.set(slug, entry)
    }
    if (film && !entry.films.includes(film)) entry.films.push(film)
    return `[[Subjects/${basename(entry.file, ".md")}${pipe}${display}]]`
  })
})

// ---- write subject pages ----
let created = 0
let updated = 0
for (const { title, file, films, isNew } of subjects.values()) {
  if (isNew) {
    let body = `---${eol}title: "${title.replace(/"/g, '\\"')}"${eol}---${eol}`
    body += `A secondary subject of [[${themeName}]].${eol}`
    if (films.length) body += `${eol}## Films${eol}${eol}${films.join(eol)}${eol}`
    if (!dry) {
      mkdirSync(subjectsDir, { recursive: true })
      writeFileSync(file, body)
    }
    created++
    console.log(`  + created  Subjects/${basename(file)}`)
  } else {
    let text = readFileSync(file, "utf8")
    const fresh = films.filter((f) => !text.includes(f.match(/\[\[([^|\]]+)/)[1]))
    if (fresh.length) {
      if (!/^## Films/m.test(text)) text = text.replace(/\s*$/, `${eol}${eol}## Films${eol}`)
      text = text.replace(/\s*$/, `${eol}${fresh.join(eol)}${eol}`)
      if (!dry) writeFileSync(file, text)
      updated++
      console.log(`  ~ updated  Subjects/${basename(file)} (+${fresh.length} film)`)
    }
  }
}

const result = out.join(eol)
if (result !== original && !dry) writeFileSync(themePath, result)

console.log(
  `${dry ? "[dry run] " : ""}${created} subject page(s) created, ${updated} updated, ` +
    `${result !== original ? "theme links rewritten" : "no links needed changing"}.`,
)
