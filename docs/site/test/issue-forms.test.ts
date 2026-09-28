// Los formularios de issue son el otro extremo de los links del sitio: `issueUrl` precarga
// campos por su `id`, y si un id cambia en el YAML el link sigue andando pero llega vacío.
// No hay parser de YAML en el sitio y no vale la pena sumarlo: alcanza con leer los ids.
import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

const dir = fileURLToPath(new URL("../../../.github/ISSUE_TEMPLATE/", import.meta.url))
const ids = (file: string) => [...readFileSync(join(dir, file), "utf8").matchAll(/^\s+id:\s*([\w-]+)\s*$/gm)].map((m) => m[1])

describe("formularios de issue", () => {
  it("existen los tres y el config", () => {
    for (const file of ["bug.yml", "component-request.yml", "enhancement.yml", "config.yml"]) {
      expect(existsSync(join(dir, file)), file).toBe(true)
    }
  })

  it("tienen los campos que el sitio precarga", () => {
    expect(ids("bug.yml")).toEqual(expect.arrayContaining(["component", "version", "what-happened", "expected", "reproduction", "browser"]))
    expect(ids("component-request.yml")).toEqual(expect.arrayContaining(["component", "use-case", "references"]))
    expect(ids("enhancement.yml")).toEqual(expect.arrayContaining(["component", "proposal", "use-case"]))
  })

  it("no se pueden abrir issues en blanco", () => {
    expect(readFileSync(join(dir, "config.yml"), "utf8")).toMatch(/^blank_issues_enabled:\s*false/m)
  })
})
