// @vitest-environment node
//
// El barrel no puede arrastrar un peer opcional. En 0.7.0 `export * from "./components/chart.js"`
// metió `recharts` en `dist/index.js`, y la primera app que hizo `from "sebs7n-ui"` sin recharts
// dejó de compilar sin usar un solo gráfico. Un peer opcional solo puede vivir detrás de un subpath.
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

const root = join(import.meta.dirname, "..")
const read = (path: string) => readFileSync(join(root, path), "utf8")

describe("barrel y peers opcionales", () => {
  const pkg = JSON.parse(read("package.json"))
  const opcionales = Object.entries(pkg.peerDependenciesMeta ?? {})
    .filter(([, meta]) => (meta as { optional?: boolean }).optional)
    .map(([name]) => name)

  it("hay peers opcionales declarados (si no, este test no vigila nada)", () => {
    expect(opcionales).toContain("recharts")
  })

  it("ningún módulo que el barrel re-exporta importa un peer opcional", () => {
    const barrel = read("src/index.ts")
    const modulos = [...barrel.matchAll(/from "\.\/([^"]+)\.js"/g)].map((m) => `src/${m[1]}.ts`)
    const culpables: string[] = []
    for (const modulo of modulos) {
      let fuente: string
      try {
        fuente = read(modulo)
      } catch {
        fuente = read(`${modulo}x`)
      }
      for (const peer of opcionales) {
        if (new RegExp(`from "${peer}(/|")`).test(fuente)) culpables.push(`${modulo} → ${peer}`)
      }
    }
    expect(culpables).toEqual([])
  })
})
