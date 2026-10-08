// @vitest-environment node
// La versión y la cantidad de componentes de la home salen de package.json y de src/components/: nunca se escriben a mano.
// Y todo componente del paquete —las piezas nuevas incluidas— está en el menú, en la búsqueda, en llms.txt y en el registry.
import { readdirSync, readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

import site from "../.generated/site.json"
import search from "../.generated/search.json"

const root = new URL("../../../", import.meta.url)
const pkg = JSON.parse(readFileSync(new URL("package.json", root), "utf8")) as { version: string }
const home = readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8")
const enDisco = readdirSync(new URL("src/components/", root))
  .filter((f) => f.endsWith(".tsx"))
  .map((f) => f.replace(/\.tsx$/, ""))

describe("la home no tiene cifras escritas a mano", () => {
  it("la versión del sitio es la de package.json", () => {
    expect(site.version).toBe(pkg.version)
  })

  it("la home toma versión y cantidad de site.json, y no trae ningún número de versión ni de cantidad literal", () => {
    expect(home).toContain("site.version")
    expect(home).toContain("site.components.length")
    expect(home).not.toMatch(/\bv?\d+\.\d+\.\d+\b/)
    expect(home).not.toMatch(/\b\d{2,3} componentes\b/)
  })

  it("site.json documenta un componente por cada archivo de src/components (menos los internos de meta.mjs)", () => {
    const documentados = new Set(site.components.map((c) => c.slug))
    const sinPagina = enDisco.filter((slug) => !documentados.has(slug))
    // El generador ya falla si falta una entrada en meta.mjs; esto lo ata al conteo que muestra la home.
    expect(sinPagina).toEqual([])
    expect(site.components.length).toBeGreaterThanOrEqual(enDisco.length)
  })
})

describe("menú, búsqueda, llms.txt y registry reflejan todas las piezas", () => {
  const nav = new Set(site.nav.flatMap((g) => ("items" in g ? g.items : []).map((i: { href: string }) => i.href)))
  const buscables = new Set((search as { href: string }[]).map((s) => s.href))
  const llms = readFileSync(new URL("../public/llms.txt", import.meta.url), "utf8")
  const registry = readFileSync(new URL("../public/r/registry.json", import.meta.url), "utf8")

  for (const component of site.components) {
    const href = `/docs/components/${component.slug}`
    it(`${component.slug}: menú, búsqueda, llms.txt y registry`, () => {
      expect(nav.has(href), "menú").toBe(true)
      expect(buscables.has(href), "búsqueda").toBe(true)
      expect(llms, "llms.txt").toContain(`${href}.md`)
      expect(registry, "registry").toContain(`"name": "${component.slug}"`)
    })
  }

  it("las piezas nuevas de 3.0 están en su categoría", () => {
    const grupo = (slug: string) => site.components.find((c) => c.slug === slug)?.group
    expect(grupo("waitlist-form")).toBe("formularios")
    for (const slug of ["skip-link", "navbar-mobile-menu", "theme-switcher-lazy"]) expect(grupo(slug), slug).toBe("navegacion")
    for (const slug of ["window-frame", "reveal", "section-backdrop", "scroll-story", "ruled-list", "section"]) expect(grupo(slug), slug).toBe("contenido")
  })

  it("no queda la página Marketing", () => {
    expect(nav.has("/docs/marketing")).toBe(false)
    expect(buscables.has("/docs/marketing")).toBe(false)
    expect(llms).not.toContain("/docs/marketing")
  })
})
