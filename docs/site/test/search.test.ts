import { describe, expect, it } from "vitest"

import { normalize, search, type SearchEntry } from "../app/_lib/search"

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
