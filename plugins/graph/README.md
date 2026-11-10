# Vendored graph plugin

Local copy of `@quartz-community/graph@1.0.0` (MIT), patched to add a **Pages | Tags**
toggle to the local (per-page) graph, which the expanded (top-right button) graph also follows.

Patches (all in `dist/index.js`, mirrored to `dist/components/index.js`):

- `.graph-mode-toggle` markup inside `.graph-outer`, plus its CSS.
- Mode is stored in `localStorage["graph-mode"]` (`pages` default, or `tags`).
- `pages`: page-to-page links only (tag nodes and `tags/*` links hidden).
- `tags`: only tag edges, depth 2 (page, its tags, other pages sharing them). Tag nodes with
  more than `tagFanoutCap` (default 25) pages are shown but not expanded.
- **Settings panel** (gear icon next to the expanded-graph icon, in both the sidebar graph and the
  expanded overlay): Obsidian-style sliders for *Forces* (center, repel, link force, link distance)
  and *Display* (node size, link thickness, text fade threshold) plus Reset. Changes apply live to
  the running d3 simulation (no re-render), are stored in `localStorage["graph-settings"]` (only the
  keys the visitor changed), and are shared by both graphs. Site-wide starting values come from
  `options.localGraph` / `options.globalGraph` in `quartz.config.yaml` (`centerForce`, `repelForce`,
  `linkDistance`, `opacityScale`, and the new `linkForce`, `nodeSize`, `linkWidth`, all default 1
  where new). Link force is a multiplier on d3's default link strength, so 1 = unchanged.
- The expanded graph honours the same mode. Its extent comes from `globalGraph.depth`, set to 3
  in `quartz.config.yaml` so it shows the current page's neighbourhood; `-1` restores the
  whole-site graph.
- **Layered traversal** (`layers` option, Pages mode only): an ordered list of slug prefixes, where
  index = level in a hierarchy (e.g. `["actor-studio/", "themes/", "subjects/", "movies/"]`).
  The current page always shows its direct neighbours; after that the BFS only expands nodes
  that sit *below* the current page's layer, and only into nodes deeper still. Pages matching no
  prefix are shown when directly linked but never expanded through. Empty `layers` = stock BFS.
  Patched in the BFS block of `graph_inline_default` (helpers `lay`/`lok`).

Loaded through `source: "./plugins/graph"` in `quartz.config.yaml`.
