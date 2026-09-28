import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

import site from "../.generated/site.json"
import { allComponents } from "../app/_lib/all-components"

// La sección «Todos los componentes» del Playground es para revisar el sistema entero en una sola
// página. Si un componente nuevo no aparece ahí, la revisión se lo saltea sin que nadie lo note.
describe("Playground: todos los componentes", () => {
  const grupos = allComponents(site)
  const slugs = grupos.flatMap((grupo) => grupo.components.map((component) => component.slug))

  it("lista todos los componentes del sitio, una vez cada uno", () => {
    expect([...slugs].sort()).toEqual(site.components.map((component) => component.slug).sort())
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it("con los grupos y el orden de la navegación", () => {
    expect(grupos.map((grupo) => grupo.id)).toEqual(site.groups.map((grupo) => grupo.id))
    for (const grupo of grupos) {
      const enNav = site.nav.find((entrada) => entrada.id === grupo.id)!
      expect(grupo.components.map((component) => component.href)).toEqual(enNav.items.map((item) => item.href))
    }
  })

  it("cada uno trae su primera demo y el link a su página", () => {
    for (const grupo of grupos) {
      for (const component of grupo.components) {
        const original = site.components.find((entrada) => entrada.slug === component.slug)!
        expect(component.demoId, component.slug).toBe(original.examples[0]?.id)
        expect(component.demoId, component.slug).toBeTruthy()
        expect(component.href).toBe(`/docs/components/${component.slug}`)
      }
    }
  })

  it("la página del Playground renderiza la sección con esos datos", () => {
    const pagina = readFileSync(new URL("../app/docs/playground/page.tsx", import.meta.url), "utf8")
    expect(pagina).toMatch(/<AllComponents\s[^>]*groups=\{allComponents\(site\)\}/)
  })
})
