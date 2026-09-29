// @vitest-environment jsdom
// Reglas de `theme.css` que dependen de la cascada, con el CSS compilado de verdad (como
// `card-css.test.ts`). Los tests del paquete solo leen el texto de `theme.css`: no ven si una clase de
// la app le gana a la regla, ni qué selector sale del compilador.
//
// jsdom no entra en `@layer` ni evalúa `:has()`: las capas se desenvuelven acá (las reglas de abajo
// no dependen del orden de capas: usan una variable o `:where()`), y `bar-end` se verifica por el
// selector compilado.
import { readFileSync } from "node:fs"
import { createRequire } from "node:module"
import { dirname, join, resolve } from "node:path"
import { createElement as h } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { compile } from "tailwindcss"
import { beforeAll, describe, expect, it } from "vitest"

import { Collapsible, CollapsibleTrigger } from "../../../src/components/collapsible"
import { Textarea } from "../../../src/components/textarea"

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

/** Saca los `@layer x { … }` dejando su contenido, en orden: jsdom ignora lo que está adentro. */
function unlayer(source: string) {
  let out = ""
  let i = 0
  while (i < source.length) {
    const match = /@layer [\w-]+(?:, [\w-]+)*\s*(;|\{)/g
    match.lastIndex = i
    const found = match.exec(source)
    if (!found) {
      out += source.slice(i)
      break
    }
    out += source.slice(i, found.index)
    if (found[1] === ";") {
      i = found.index + found[0].length
      continue
    }
    // Busca la llave que cierra este bloque y deja su contenido.
    let depth = 1
    let j = found.index + found[0].length
    const start = j
    while (depth > 0 && j < source.length) {
      if (source[j] === "{") depth++
      else if (source[j] === "}") depth--
      j++
    }
    out += unlayer(source.slice(start, j - 1))
    i = j
  }
  return out
}

const classes = (html: string) => [...html.matchAll(/class="([^"]*)"/g)].flatMap(([, value]) => value!.split(/\s+/))

let compiled = ""

beforeAll(async () => {
  const markup = [
    renderToStaticMarkup(h(Textarea, { rows: 3, id: "rows" })),
    renderToStaticMarkup(h(Textarea, { rows: 3, id: "app", className: "min-h-40" })),
    renderToStaticMarkup(h(Textarea, { id: "plain" })),
    renderToStaticMarkup(h(Collapsible, null, h(CollapsibleTrigger, { chevron: true, id: "trigger" }, "Más datos"))),
  ].join("")
  compiled = await css([...classes(markup), "bar-end", "text-body", "animate-marquee"])
  const style = document.createElement("style")
  style.textContent = unlayer(compiled)
  document.head.append(style)
  document.body.innerHTML = markup
})

describe("Textarea rows con el CSS compilado", () => {
  const minHeight = (id: string) => window.getComputedStyle(document.getElementById(id)!).minHeight
  const variable = (id: string) => window.getComputedStyle(document.getElementById(id)!).getPropertyValue("--sf-textarea-min").trim()

  it("rows pone el mínimo de esas filas", () => {
    expect(variable("rows").replace(/\s/g, "")).toBe("calc(3*1lh+1.5rem+2px)")
    expect(minHeight("rows")).toMatch(/var\(--sf-textarea-min/)
  })

  it("un min-h-* de la app le gana a rows", () => {
    expect(minHeight("app")).not.toMatch(/--sf-textarea-min/)
    expect(minHeight("app")).toMatch(/40/)
  })

  it("sin rows, el mínimo de 2.0 (5rem, min-h-20)", () => {
    expect(variable("plain")).toBe("")
    expect(compiled).toMatch(/min-height: var\(--sf-textarea-min, 5rem\)|min-height: var\(--sf-textarea-min,5rem\)/)
  })
})

describe("CollapsibleTrigger chevron con el CSS compilado", () => {
  it("no fija el tamaño de letra: hereda el del contenedor, como en 2.0", () => {
    const block = compiled.slice(compiled.indexOf('[data-slot="collapsible-trigger"]'))
    const rule = block.slice(0, block.indexOf("}"))
    expect(rule).not.toMatch(/font-size|line-height/)
    expect(window.getComputedStyle(document.getElementById("trigger")!).fontSize).not.toBe("14px")
  })

  it("el alto mínimo y el área táctil van en :where(): una clase de la app les gana", () => {
    expect(compiled).toMatch(/:where\(\[data-slot="collapsible-trigger"\]\.group\\\/collapsible-trigger\)\s*\{[^}]*min-height: 24px/)
    expect(window.getComputedStyle(document.getElementById("trigger")!).minHeight).toBe("24px")
  })
})

describe("bar-end compilado", () => {
  const rule = () => {
    const start = compiled.indexOf(".bar-end")
    return compiled.slice(start, compiled.indexOf("--sf-bar-end: 10px", start))
  }

  it("el último botón de ícono se busca entre los hijos visibles: sin sr-only, hidden ni .hidden", () => {
    expect(rule()).toContain(':nth-last-child(1 of :not(.sr-only, [hidden], .hidden))')
    expect(rule()).not.toContain('[data-size^="icon"]:last-child')
  })

  it("también a tres niveles: Toolbar > Group > Button", () => {
    const visible = ":nth-last-child(1 of :not(.sr-only, [hidden], .hidden))"
    expect(rule()).toContain(`> ${visible} > ${visible} > [data-size^="icon"]${visible}`)
  })
})

describe("animate-marquee compilado", () => {
  // Tailwind deja el anidado de `@utility` tal cual (lo aplana el build de la app, con Lightning CSS).
  const rule = () => {
    const start = compiled.indexOf(".animate-marquee {")
    return compiled.slice(start, compiled.indexOf("\n}\n", start))
  }

  it("corre una tanda con la duración del componente, y se pausa con hover y foco en la vista y con data-paused", () => {
    expect(rule()).toMatch(/animation: sf-marquee var\(--sf-marquee-duration, 20s\) linear infinite/)
    for (const selector of [":hover", ":focus-within"]) expect(rule()).toContain(`[data-slot="marquee-viewport"]${selector} &`)
    expect(rule()).toContain('[data-slot="marquee"][data-paused] &')
    // No en la raíz: ahí vive el botón de pausa, y con el foco o el puntero en «Reanudar» la fila no arrancaba.
    for (const selector of [":hover", ":focus-within"]) expect(rule()).not.toContain(`[data-slot="marquee"]${selector} &`)
    expect(rule()).toMatch(/animation-play-state: paused/)
  })

  it("con movimiento reducido no corre", () => {
    expect(rule()).toMatch(/@media \(prefers-reduced-motion: reduce\)\s*\{\s*animation: none/)
  })
})
