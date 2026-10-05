// @vitest-environment node
//
// Los componentes que viven solo por subpath: `chart` (su peer opcional) y los que quedaron afuera
// del barrel por peso (R5b y R6, con el barrel en su tope, hoy 58 kB). Si uno entra al barrel sin
// querer, el tope se pasa; y si uno exporta un nombre que ya exporta el barrel, la app que importa
// de los dos lados tiene dos cosas con el mismo nombre.
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

// @ts-expect-error -- .mjs sin tipos, igual que en subpaths.test.ts
import { barrelComponents } from "../scripts/subpaths.mjs"

const root = join(import.meta.dirname, "..")
const barrel = readFileSync(join(root, "src/index.ts"), "utf8")

const SOLO_SUBPATH = [
  "chart",
  "tree",
  "split-view",
  "file-grid",
  "calendar-view",
  "stepper",
  "data-table",
  "input-group",
  "multi-select",
  "timeline",
  "resizable",
  "copy-button",
  "password-input",
  "time-picker",
  "date-time-picker",
  "country-picker",
  "phone-input",
  "sortable-list",
  "sortable-grid",
  "drop-zone",
  "carousel",
  "list-index",
  "marquee",
  "disclosure",
  "sidebar-toggle",
  "footer",
  "search-field",
  "tags-input",
  "rating",
  "count-badge",
  "drop-target",
  "auth-layout",
  "notifications-popover",
  "shortcuts-dialog",
  "command-palette",
  "filter-bar",
  "sparkline",
  "log-viewer",
  "stat-grid",
  "metric-chart",
  "bulk-actions-bar",
  "settings-section",
  "widget-board",
  "list-view",
  "filter-disclosure",
  "calendar-agenda",
  "save-bar",
  "entity-overlay",
  "empty-filters-action",
  "sortable-table-head",
  "row-actions",
]

describe("componentes solo por subpath", () => {
  it("ninguno está en el barrel", () => {
    const dentro = barrelComponents(barrel)
    expect(SOLO_SUBPATH.filter((nombre) => dentro.has(nombre))).toEqual([])
  })

  it("una línea comentada no cuenta como exportada", () => {
    const fuente = ['export * from "./components/button.js"', '// export * from "./components/tree.js"', '  //   `tree` sebs7n-ui/tree'].join("\n")
    expect([...barrelComponents(fuente)]).toEqual(["button"])
  })

  it("ninguno exporta un nombre que ya exporta el barrel", async () => {
    const delBarrel = new Set(Object.keys(await import("../src/index.js")))
    const choques: string[] = []
    for (const nombre of SOLO_SUBPATH) {
      const modulo = await import(`../src/components/${nombre}.tsx`)
      for (const exportado of Object.keys(modulo)) if (delBarrel.has(exportado)) choques.push(`${nombre}: ${exportado}`)
    }
    expect(choques).toEqual([])
  }, 60000)
})
