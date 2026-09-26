// Ningún link del sitio puede apuntar a una URL que no existe.
//
// Los que había cuando se escribió este test: `llms.txt` mandaba a `/registry` y
// a `/registry.md`, que nunca se publicaron —lo que se sirve es
// `/r/registry.json`—, y tres demos linkeaban rutas inventadas (`/clientes/acme`,
// `/planes/pro`, `#historial`) que quien hace clic en la doc encuentra en 404.
//
// Dos fuentes, porque son dos cosas distintas:
//
//   · las demos, que renderizan anclas de verdad en la página;
//   · lo generado (`llms.txt`, los `.md` por página, `site.json`), que es lo que
//     leen los agentes.
//
// En la prosa se miran solo los links en formato markdown: un `href="/x"` adentro
// de un `código` es un ejemplo, no un link.
import { readdirSync, readFileSync, statSync } from "node:fs"
import { join } from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

const here = fileURLToPath(new URL("..", import.meta.url))
const read = (path: string) => readFileSync(join(here, path), "utf8")
const site = JSON.parse(read(".generated/site.json"))
const SITIO = site.site as string

/** Todo lo que el sitio sirve de verdad: rutas de Next + archivos de public/. */
const validas = new Set<string>(["/", "/docs", "/docs/iconos"])
for (const page of site.pages) validas.add(`/docs/${page.slug}`)
for (const component of site.components) validas.add(`/docs/components/${component.slug}`)

const publicDir = join(here, "public")
const recorrer = (dir: string, prefijo: string, alta: (ruta: string, href: string) => void) => {
  for (const entrada of readdirSync(dir)) {
    const ruta = join(dir, entrada)
    if (statSync(ruta).isDirectory()) recorrer(ruta, `${prefijo}/${entrada}`, alta)
    else alta(ruta, `${prefijo}/${entrada}`)
  }
}
recorrer(publicDir, "", (_ruta, href) => validas.add(href))

const existe = (href: string) => validas.has(href.split("#")[0]!.replace(/\/$/, "") || "/")

describe("links de las demos", () => {
  const demos = readdirSync(join(here, "app/_demos")).filter((archivo) => archivo.endsWith(".tsx") && archivo !== "registry.tsx")

  it("mira todas las demos", () => {
    expect(demos.length).toBeGreaterThan(50)
  })

  for (const demo of demos) {
    const fuente = read(`app/_demos/${demo}`)
    const hrefs = [...fuente.matchAll(/href="([^"]*)"/g)].map(([, href]) => href!)
    if (!hrefs.length) continue
    it(`${demo}: no linkea rutas inventadas`, () => {
      // Una demo no tiene a dónde navegar: o es un ancla muerta (`#`) o apunta a
      // una página del sitio que existe de verdad. Un `#loquesea` es un link roto
      // con otra cara — no hay ningún elemento con ese id.
      const rotos = hrefs.filter((href) => href !== "#" && !existe(href))
      expect(rotos).toEqual([])
    })
  }
})

describe("links de lo generado", () => {
  const fuentes: { nombre: string; texto: string }[] = [
    { nombre: "llms.txt", texto: read("public/llms.txt") },
    { nombre: "llms-full.txt", texto: read("public/llms-full.txt") },
  ]
  recorrer(join(publicDir, "docs"), "public/docs", (ruta, href) =>
    fuentes.push({ nombre: href, texto: readFileSync(ruta, "utf8") })
  )

  it("mira un conjunto de fuentes y de rutas que no está vacío", () => {
    expect(fuentes.length).toBeGreaterThan(60)
    expect(validas.size).toBeGreaterThan(60)
  })

  for (const fuente of fuentes) {
    const links = new Set<string>()
    for (const [, href] of fuente.texto.matchAll(/\]\((\/[^)\s]*)\)/g)) links.add(href!)
    for (const [, href] of fuente.texto.matchAll(new RegExp(`${SITIO}(/[^)\\s"]*)`, "g"))) links.add(href!)
    if (!links.size) continue
    it(`${fuente.nombre}: todos resuelven`, () => {
      expect([...links].filter((href) => !existe(href))).toEqual([])
    })
  }
})
