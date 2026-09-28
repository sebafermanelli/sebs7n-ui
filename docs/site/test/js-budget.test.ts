import { gzipSync } from "node:zlib"
import { describe, expect, it } from "vitest"

import { BUDGET_KB, chunkRefs, limitOf, LIMITS, measure, ROUTES } from "../scripts/lib/js-budget.mjs"

const html = `
<link rel="preload" as="script" href="/_next/static/chunks/aaa.js"/>
<script src="/_next/static/chunks/aaa.js" async=""></script>
<script src="/_next/static/chunks/bbb.js" async=""></script>
<script>self.__next_f.push([1,"2:I[\\"/_next/static/chunks/ccc.js\\"]"])</script>
<script src="https://example.com/other.js"></script>
`

describe("chunkRefs", () => {
  it("junta cada chunk una sola vez, venga de un script, un preload o el payload", () => {
    expect(chunkRefs(html).sort()).toEqual(["/_next/static/chunks/aaa.js", "/_next/static/chunks/bbb.js", "/_next/static/chunks/ccc.js"])
  })

  it("no cuenta los <script noModule>: un navegador moderno no los baja", () => {
    const conPolyfill = `${html}<script src="/_next/static/chunks/polyfill.js" noModule=""></script>`
    expect(chunkRefs(conPolyfill)).not.toContain("/_next/static/chunks/polyfill.js")
    expect(chunkRefs(conPolyfill).sort()).toEqual(chunkRefs(html).sort())
    // Con el atributo en cualquier lugar de la etiqueta y en minúsculas, igual.
    expect(chunkRefs('<script nomodule src="/_next/static/chunks/p.js"></script>')).toEqual([])
    // Si el mismo chunk además se pide como módulo, cuenta.
    expect(chunkRefs('<script src="/_next/static/chunks/p.js" noModule=""></script><script src="/_next/static/chunks/p.js"></script>')).toEqual([
      "/_next/static/chunks/p.js",
    ])
  })

  it("ignora scripts que no son chunks de Next", () => {
    expect(chunkRefs('<script src="/foo.js"></script>')).toEqual([])
  })
})

describe("measure", () => {
  it("suma el gzip de cada chunk referenciado", () => {
    const files: Record<string, Buffer> = {
      "/_next/static/chunks/aaa.js": Buffer.from("a".repeat(5000)),
      "/_next/static/chunks/bbb.js": Buffer.from("console.log(1)"),
      "/_next/static/chunks/ccc.js": Buffer.from("x"),
    }
    const esperado = Object.values(files).reduce((total, file) => total + gzipSync(file).length, 0)
    const result = measure(html, (src: string) => files[src]!)
    expect(result.files).toBe(3)
    expect(result.bytes).toBe(esperado)
    expect(result.kb).toBe(Math.round(esperado / 1024))
  })
})

describe("configuración", () => {
  it("mide las siete rutas acordadas; 200 KB salvo Chart y Playground, que tienen el suyo", () => {
    expect(BUDGET_KB).toBe(200)
    expect(LIMITS).toEqual({ "/docs/components/chart": 325, "/docs/playground": 310 })
    expect(limitOf("/docs/components/chart")).toBe(325)
    expect(limitOf("/docs/playground")).toBe(310)
    expect(limitOf("/")).toBe(200)
    expect(limitOf("/docs/iconos")).toBe(200)
    // Un límite propio solo tiene sentido para una ruta que se mide.
    for (const ruta of Object.keys(LIMITS)) expect(ROUTES).toContain(ruta)
    expect(ROUTES).toEqual([
      "/",
      "/docs/instalacion",
      "/docs/components/button",
      "/docs/components/chart",
      "/docs/playground",
      "/docs/iconos",
      "/docs/requests",
    ])
  })
})
