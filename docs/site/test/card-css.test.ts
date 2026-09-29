// @vitest-environment jsdom
// La franja de la Card con el CSS compilado de verdad (W). Los tests del paquete comparan clases;
// este compila las que emite el componente con Tailwind y las cascadea en un DOM, porque el bug
// que cubre es de orden de reglas: dos clases de igual especificidad, y gana la que Tailwind emite
// última. Una card `subtle` adentro de una `default` sobre el wallpaper heredaba la franja de la de
// afuera, porque `group-data-[variant=default]/card` matchea con cualquier ancestro.
//
// jsdom (el del paquete, que está arriba en el árbol) cascadea selectores y variables, pero no entra en
// `@layer`: por eso las utilidades se compilan sin capa. `var()` no lo resuelve en las
// propiedades normales, así que el fondo se sigue a mano por las variables del elemento.
import { readFileSync } from "node:fs"
import { createRequire } from "node:module"
import { dirname, join, resolve } from "node:path"
import { createElement as h, type ReactNode } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { compile } from "tailwindcss"
import { beforeAll, describe, expect, it } from "vitest"

import { Card, CardHeader, CardTitle } from "../../../src/components/card"

const theme = join(import.meta.dirname, "../../../src/styles/theme.css")
const require = createRequire(import.meta.filename)

async function css(candidates: string[]) {
  const compiler = await compile(`@import "tailwindcss/theme.css";\n@import "${theme}";\n@tailwind utilities;`, {
    base: dirname(theme),
    loadStylesheet: async (id: string, base: string) => {
      const path = id.startsWith("tailwindcss/") ? require.resolve(id) : resolve(base, id)
      return { path, base: dirname(path), content: readFileSync(path, "utf8") }
    },
  })
  return compiler.build(candidates)
}

/**
 * El fondo del elemento, siguiendo `var(--x)` por las variables que hereda. Termina en el token
 * (`var(--sf-…)` o `var(--color-…)`), que vive en `:root` adentro de una capa.
 */
function fondo(el: Element) {
  const estilo = window.getComputedStyle(el)
  let valor = estilo.backgroundColor
  for (let i = 0; i < 8; i++) {
    const [, nombre, respaldo] = valor.match(/^var\((--[\w-]+)(?:,\s*(.+))?\)$/) ?? []
    if (!nombre) break
    const heredado = estilo.getPropertyValue(nombre).trim() || respaldo
    if (!heredado) break
    valor = heredado
  }
  return valor
}

/** jsdom escribe `transparent` como `rgba(0, 0, 0, 0)` en una propiedad y tal cual en una variable. */
const sinFondo = /^(transparent|rgba\(0, 0, 0, 0\))$/

describe("CardHeader: la franja con el CSS compilado", () => {
  const cabecera = (id: string) => document.querySelector(`#${id} > [data-slot=card-header]`)!

  beforeAll(async () => {
    const card = (id: string, variant: "default" | "subtle", ...hijos: ReactNode[]) =>
      h(Card, { id, variant }, h(CardHeader, null, h(CardTitle, null, id)), ...hijos)
    const html = renderToStaticMarkup(
      h(
        "div",
        null,
        card("opaca", "default", card("hundida-opaca", "subtle")),
        h("div", { "data-ambient": "" }, card("widget", "default", card("hundida", "subtle")))
      )
    )
    const clases = [...html.matchAll(/class="([^"]*)"/g)].flatMap(([, c]) => c!.split(/\s+/))
    const estilo = document.createElement("style")
    estilo.textContent = await css([...new Set(clases)])
    document.head.append(estilo)
    document.body.innerHTML = html
  })

  it("fuera del wallpaper: la franja opaca en la default, sin fondo en la hundida", () => {
    expect(fondo(cabecera("opaca"))).toMatch(/^var\(--(color|sf)-surface-bar\)$/)
    expect(fondo(cabecera("hundida-opaca"))).toMatch(sinFondo)
  })

  it("sobre el wallpaper: la franja translúcida en la default", () => {
    expect(fondo(cabecera("widget"))).toMatch(/^var\(--(color|sf)-translucent-strip\)$/)
  })

  it("sobre el wallpaper, una hundida adentro de una default no hereda la franja de la de afuera", () => {
    expect(fondo(cabecera("hundida"))).toMatch(sinFondo)
  })
})
