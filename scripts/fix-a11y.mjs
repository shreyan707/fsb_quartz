// Post-build accessibility fixes for markup we can't change at the source.
//   - Bases view switcher: the plugin emits role="tablist" on a row of plain
//     buttons (no role="tab" children), which is invalid ARIA. Drop the role so
//     it is just a group of buttons.
// Run after `quartz build`: node scripts/fix-a11y.mjs public
import { readdirSync, readFileSync, writeFileSync, statSync } from "node:fs"
import { join } from "node:path"

const root = process.argv[2] ?? "public"
const tablistRe = /(<div class="bases-view-tabs") role="tablist"/g

let files = 0
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) walk(p)
    else if (name.endsWith(".html")) {
      const html = readFileSync(p, "utf-8")
      const fixed = html.replace(tablistRe, "$1")
      if (fixed !== html) {
        writeFileSync(p, fixed)
        files++
      }
    }
  }
}
walk(root)
console.log(`fix-a11y: fixed ${files} files`)
