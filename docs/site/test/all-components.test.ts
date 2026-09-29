import { readdirSync, readFileSync } from "node:fs"
import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"

import site from "../.generated/site.json"
import { AllComponents } from "../app/_components/all-components"
import { allComponents } from "../app/_lib/all-components"

/** Los componentes del paquete, leídos del disco y no del generador: la vara independiente. */
const enDisco = readdirSync(new URL("../../../src/components/", import.meta.url))
  .filter((archivo) => archivo.endsWith(".tsx"))
  .map((archivo) => archivo.replace(/\.tsx$/, ""))
  .sort()

// La sección «Todos los componentes» del Playground es para revisar el sistema entero en una sola
// página. Si un componente nuevo no aparece ahí, la revisión se lo saltea sin que nadie lo note.
describe("Playground: todos los componentes", () => {
  const grupos = allComponents(site)
  const slugs = grupos.flatMap((grupo) => grupo.components.map((component) => component.slug))

  it("lista todos los componentes del paquete, una vez cada uno", () => {
    // Contra `src/components/` y no contra lo mismo que recibe: si el generador perdiera uno, el
    // site.json y la sección lo perderían juntos y compararlos entre sí no lo vería.
    expect([...slugs].sort()).toEqual(enDisco)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it("la sección renderizada tiene un link y un marco de demo por componente", () => {
    const html = renderToStaticMarkup(createElement(AllComponents, { groups: grupos }))
    for (const slug of enDisco) expect(html, slug).toContain(`href="/docs/components/${slug}"`)
    expect(html).not.toContain("Sin demo.")
    for (const grupo of site.groups) expect(html).toContain(`id="todos-${grupo.id}"`)
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

  it("la página del Playground usa la sección con esos datos", () => {
    // La página entera no se puede renderizar acá (el Playground es de cliente, con next-themes y
    // localStorage); lo que se verifica es que monte la sección que se renderizó arriba.
    const pagina = readFileSync(new URL("../app/docs/playground/page.tsx", import.meta.url), "utf8")
    expect(pagina).toMatch(/<AllComponents\s[^>]*groups=\{allComponents\(site\)\}/)
  })
})
