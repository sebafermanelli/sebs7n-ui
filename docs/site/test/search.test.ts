import { describe, expect, it } from "vitest"

import { groupResults, normalize, plainText, search, type SearchEntry } from "../app/_lib/search"

const entry = (title: string, extra: Partial<SearchEntry> = {}): SearchEntry => ({
  title,
  href: `/docs/components/${title.toLowerCase()}`,
  group: "Formularios",
  description: "",
  keywords: "",
  ...extra,
})

describe("normalize", () => {
  it("pasa a minúsculas y saca tildes", () => {
    expect(normalize("Configuración ÁRBOL")).toBe("configuracion arbol")
  })
})

describe("search", () => {
  const index = [entry("Button"), entry("Badge", { keywords: "button etiqueta" }), entry("Select"), entry("Tokens", { group: "Sistema", description: "Los colores" })]

  it("sin consulta no devuelve nada", () => {
    expect(search(index, "   ")).toEqual([])
  })

  it("el título que empieza con el término gana al que lo tiene en las keywords", () => {
    expect(search(index, "butt").map((e) => e.title)).toEqual(["Button", "Badge"])
  })

  it("todos los términos tienen que aparecer, sin importar tildes", () => {
    expect(search(index, "sistema colores").map((e) => e.title)).toEqual(["Tokens"])
    expect(search(index, "sístema").map((e) => e.title)).toEqual(["Tokens"])
  })

  it("corta en 12 resultados", () => {
    const muchos = Array.from({ length: 20 }, (_, i) => entry(`Item${i}`))
    expect(search(muchos, "item")).toHaveLength(12)
  })
})

describe("groupResults (el buscador con Command)", () => {
  it("agrupa sin perder el ranking: los grupos salen en el orden de su mejor resultado", () => {
    const ranked = [entry("Tokens", { group: "Sistema" }), entry("Button"), entry("Theming", { group: "Sistema" }), entry("Badge")]
    expect(groupResults(ranked).map(([group, entries]) => [group, entries.map((e) => e.title)])).toEqual([
      ["Sistema", ["Tokens", "Theming"]],
      ["Formularios", ["Button", "Badge"]],
    ])
  })

  it("sin resultados no hay grupos", () => {
    expect(groupResults([])).toEqual([])
  })
})

describe("plainText", () => {
  it("saca el markdown mínimo de Inline para la fila de una línea", () => {
    expect(plainText("Usa `aria-invalid` y **nunca** color solo")).toBe("Usa aria-invalid y nunca color solo")
  })
})
