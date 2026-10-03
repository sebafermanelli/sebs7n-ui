// El sitio corre en entorno `node` sin jsdom: `renderToString`, igual que los demás templates.
import { createElement } from "react"
import { renderToString } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

import BlogPage from "../app/templates/blog/page"
import PostPage, { generateStaticParams } from "../app/templates/blog/[slug]/page"
import BlogNotFound from "../app/templates/blog/not-found"
import { AUTHORS, POSTS, TAGS } from "../app/templates/blog/_data/posts"
import { formatDate, formatDateShort, readingTime } from "../app/templates/blog/_lib/format"

vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND")
  },
}))

describe("datos", () => {
  it("los slugs son únicos y cada artículo tiene un autor que existe", () => {
    expect(new Set(POSTS.map((p) => p.slug)).size).toBe(POSTS.length)
    for (const post of POSTS) expect(AUTHORS.some((a) => a.id === post.authorId)).toBe(true)
  })

  it("los ids de las secciones no se repiten dentro de un artículo (el índice depende de eso)", () => {
    for (const post of POSTS) {
      const ids = post.body.flatMap((b) => (b.type === "h2" ? [b.id] : []))
      expect(new Set(ids).size, post.slug).toBe(ids.length)
      expect(ids.length, post.slug).toBeGreaterThan(0)
    }
  })

  it("las etiquetas salen de los artículos, ordenadas", () => {
    expect(TAGS).toEqual([...TAGS].sort((a, b) => a.localeCompare(b, "es")))
    for (const post of POSTS) for (const tag of post.tags) expect(TAGS).toContain(tag)
  })
})

describe("formato", () => {
  it("la fecha se lee como local: el 18 no se vuelve 17", () => {
    expect(formatDate("2026-09-18")).toContain("18")
    expect(formatDateShort("2026-09-18")).toBe("18 sep 2026")
  })

  it("el tiempo de lectura es de al menos 1 minuto y no cuenta el código", () => {
    expect(readingTime([{ type: "p", text: "hola" }])).toBe(1)
    expect(readingTime([{ type: "code", code: "x ".repeat(5000) }])).toBe(1)
    expect(readingTime([{ type: "p", text: "palabra ".repeat(450) }])).toBe(3)
  })
})

describe("portada", () => {
  const html = renderToString(createElement(BlogPage))

  it("tiene un h1, el filtro por categoría y el primer artículo destacado", () => {
    expect(html.match(/<h1/g)).toHaveLength(1)
    expect(html).toContain(POSTS[0]!.title)
  })

  it("cada artículo enlaza a su página", () => {
    for (const post of POSTS) expect(html).toContain(`href="/templates/blog/${post.slug}"`)
  })

  it("trae la suscripción (el formulario llega diferido) y el filtro de etiqueta como Select, no ToggleGroup", () => {
    expect(html).toContain("Una nota por mes, nada más")
    // Un solo control de etiqueta (Select), no una fila de botones que desborda en 390 px.
    expect(html).toContain('aria-label="Etiqueta"')
    expect(html).not.toContain('data-slot="toggle-group"')
    expect(html).toContain('role="search"')
  })
})

describe("artículo", () => {
  const post = POSTS[1]!

  it("se prerenderiza uno por cada artículo", () => {
    expect(generateStaticParams()).toEqual(POSTS.map((p) => ({ slug: p.slug })))
  })

  it("trae un h1, el índice con anclas que existen y los relacionados", async () => {
    const html = renderToString(await PostPage({ params: Promise.resolve({ slug: post.slug }) }))
    expect(html.match(/<h1/g)).toHaveLength(1)
    expect(html).toContain('aria-label="En esta página"')
    for (const [, id] of html.matchAll(/href="#([a-z-]+)"/g)) expect(html, id).toContain(`id="${id}"`)
    expect(html).toContain("Para seguir leyendo")
  })
})
describe("sobriedad", () => {
  it("pocas etiquetas y pocos artículos: la lista cabe sin paginar", () => {
    expect(TAGS.length).toBeLessThanOrEqual(6)
    expect(POSTS.length).toBeLessThanOrEqual(10)
  })

  it("la lista es texto: sin avatar ni tarjeta, con una línea de meta", () => {
    const html = renderToString(createElement(BlogPage))
    expect(html).not.toContain('data-slot="avatar"')
    expect(html).not.toContain('data-slot="card"')
    expect(html).toContain(formatDateShort(POSTS[0]!.date))
  })

  it("el artículo trae el autor en la meta y los relacionados como enlaces de texto", async () => {
    const html = renderToString(await PostPage({ params: Promise.resolve({ slug: POSTS[1]!.slug }) }))
    expect(html).toContain(AUTHORS.find((a) => a.id === POSTS[1]!.authorId)!.name)
    expect(html).not.toContain('data-slot="card"')
    expect(html).not.toContain('data-slot="slider"')
  })

  it("el 404 propio tiene un h1 y la salida a los artículos", () => {
    const html = renderToString(createElement(BlogNotFound))
    expect(html.match(/<h1/g)).toHaveLength(1)
    expect(html).toContain('href="/templates/blog"')
  })
})
