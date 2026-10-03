// @vitest-environment node
import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

// El usuario acomoda su espacio: el sidebar y el panel lateral se redimensionan por defecto (el paquete) y cada
// shell del sitio recuerda lo acomodado con una clave propia. Nadie apaga el redimensionado.
const app = new URL("../app", import.meta.url).pathname
const read = (file: string) => readFileSync(`${app}/${file}`, "utf8")

describe("sitio: sidebar y panel lateral recuerdan su ancho", () => {
  const casos: Array<[string, string[]]> = [
    ["templates/dashboard/_components/dashboard-shell.tsx", ["sebs7n-ui:dashboard:sidebar", "sebs7n-ui:dashboard:aside"]],
    ["templates/console/_components/console-shell.tsx", ["sebs7n-ui:console:sidebar", "sebs7n-ui:console:aside"]],
    ["_components/showcase/shell.tsx", ["sebs7n-ui:playground:sidebar", "sebs7n-ui:playground:aside"]],
    ["_components/docs-shell.tsx", ["sebs7n-ui:docs:sidebar"]],
  ]
  for (const [file, keys] of casos) {
    it(file, () => {
      const source = read(file)
      for (const key of keys) expect(source).toContain(`"${key}"`)
      expect(source).not.toMatch(/sidebarResizable=\{false\}/)
    })
  }

  it("las claves no se repiten entre shells", () => {
    const todas = casos.flatMap(([file]) => [...read(file).matchAll(/"(sebs7n-ui:[a-z]+:(?:sidebar|aside))"/g)].map((m) => m[1]))
    expect(new Set(todas).size).toBe(todas.length)
  })

  it("el Playground arranca con el sidebar en riel, pero ahora arrastrable (no `collapsed` fijo)", () => {
    const shell = read("_components/showcase/shell.tsx")
    expect(shell).toContain("defaultSidebarCollapsed")
    expect(shell).not.toMatch(/<Sidebar collapsed/)
  })

  it("la documentación no pliega a un riel sin íconos", () => {
    expect(read("_components/docs-shell.tsx")).toContain("sidebarCollapsible={false}")
  })
})
