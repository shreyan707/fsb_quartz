// Post-build image step. For every raster image under <root>/assets:
//   1. writes a WebP copy next to JPG/PNG files (same name, .webp) - originals are untouched
//      (images already in WebP just get explicit width/height)
//   2. rewrites <img src="...jpg"> in the built HTML to <picture> with the WebP
//      source and explicit width/height (stops layout shift while images load)
// Run after `quartz build`: node scripts/optimize-images.mjs public
import { readdirSync, readFileSync, writeFileSync, statSync, existsSync } from "node:fs"
import { join, dirname, resolve, extname, sep } from "node:path"
import sharp from "sharp"

const root = resolve(process.argv[2] ?? "public")
const assetsDir = join(root, "assets")
const RASTER = new Set([".jpg", ".jpeg", ".png", ".webp"])

const walk = (dir, visit) => {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) walk(p, visit)
    else visit(p)
  }
}

// 1. WebP variants + dimensions
const dims = new Map() // absolute source path -> { width, height, webp }
const sources = []
if (existsSync(assetsDir)) {
  walk(assetsDir, (p) => {
    if (RASTER.has(extname(p).toLowerCase())) sources.push(p)
  })
}
let written = 0
for (const src of sources) {
  const isWebp = extname(src).toLowerCase() === ".webp"
  const webp = src.replace(/\.[^.]+$/, ".webp")
  const img = sharp(src)
  const { width, height } = await img.metadata()
  const fresh = isWebp || (existsSync(webp) && statSync(webp).mtimeMs >= statSync(src).mtimeMs)
  if (!fresh) {
    await img.webp({ quality: 80 }).toFile(webp)
    written++
  }
  dims.set(src, { width, height, webp })
}

// 2. Rewrite <img> tags in HTML
const imgRe = /<img ([^>]*?)src="([^"]+)"([^>]*?)\/?>/g
let rewritten = 0
let pages = 0
walk(root, (file) => {
  if (!file.endsWith(".html")) return
  const html = readFileSync(file, "utf-8")
  const out = html.replace(imgRe, (tag, before, src, after, offset, whole) => {
    if (/^(https?:)?\/\//.test(src) || src.startsWith("data:")) return tag
    if (whole.slice(0, offset).endsWith('type="image/webp"/>')) return tag // already wrapped
    let rel
    try {
      rel = decodeURIComponent(src.split(/[?#]/)[0])
    } catch {
      return tag
    }
    const abs = resolve(dirname(file), rel)
    const info = dims.get(abs)
    if (!info || !abs.startsWith(assetsDir + sep)) return tag
    if (extname(abs).toLowerCase() === ".webp") {
      // Already WebP: only add dimensions
      if (/ width=/.test(tag)) return tag
      rewritten++
      return `<img ${before}src="${src}"${after.replace(/\s*\/$/, "")} width="${info.width}" height="${info.height}" decoding="async"/>`
    }
    const webpSrc = src.replace(/\.(jpe?g|png)(?=$|[?#])/i, ".webp")
    const sized = / width=/.test(tag) ? "" : ` width="${info.width}" height="${info.height}"`
    const img = `<img ${before}src="${src}"${after.replace(/\s*\/$/, "")}${sized} decoding="async"/>`
    rewritten++
    return `<picture><source srcset="${webpSrc}" type="image/webp"/>${img}</picture>`
  })
  if (out !== html) {
    writeFileSync(file, out)
    pages++
  }
})
console.log(
  `optimize-images: ${sources.length} images (${written} new WebP), ${rewritten} <img> tags rewritten in ${pages} pages`,
)
