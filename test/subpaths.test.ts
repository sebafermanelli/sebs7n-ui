// @vitest-environment node
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

// @ts-expect-error -- .mjs sin tipos, igual que gen-colors
import { FIN, INICIO, replaceBlock, subpathsTable } from "../scripts/subpaths.mjs"

const root = join(import.meta.dirname, "..")
const readme = readFileSync(join(root, "README.md"), "utf8")

// Mismo trato que colors.css: la tabla está generada, así que el test es el que
// obliga a correr el generador. Antes estaba a mano en dos archivos que se
// contradecían y a los dos les faltaban entry points que sí existen.
describe("tabla de subpaths", () => {
  it("el README tiene la tabla que sale de package.json#exports", () => {
    expect(readme).toContain(INICIO)
    expect(readme).toBe(replaceBlock(readme, subpathsTable(root)))
  })

  it("la tabla nombra todos los patrones de exports que la app puede importar", () => {
    const tabla = subpathsTable(root)
    const exports = JSON.parse(readFileSync(join(root, "package.json"), "utf8")).exports
    // `./package.json` es para las herramientas, no para el código de una app.
    const patrones = Object.keys(exports).filter((clave) => clave !== "./package.json")
    expect(tabla.split("\n").length - 2).toBe(patrones.length)
    expect(tabla).toContain("`schema`")
    expect(tabla).toContain("`tag`")
    expect(tabla).toContain("sebs7n-ui/tokens/<archivo>.json")
  })

  it("el marcador de cierre está después del de apertura", () => {
    expect(readme.indexOf(FIN)).toBeGreaterThan(readme.indexOf(INICIO))
  })
})
