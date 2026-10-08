// @vitest-environment jsdom
//
// axe-core sobre la primera demo de CADA componente del sitio, en claro y en oscuro (3.0). Corre en jsdom: sin layout ni estilos
// calculados, así que las reglas de contraste de color (`color-contrast`) y las de página entera (`region`, `landmark-one-main`,
// `page-has-heading-one`) no se pueden evaluar acá; las dos primeras se miden aparte (`test/contrast.test.ts` del paquete, y
// `node scripts/axe-chrome.mjs` en un navegador real). Lo demás —nombres accesibles, roles ARIA, ids duplicados, etiquetas de
// formulario, tablas, listas— sí.
//
// Una violación nueva rompe el test. Las que quedan por limitación de jsdom o por una demo que muestra el caso a propósito van en
// `CONOCIDAS`, con el motivo, y el test falla si una deja de ocurrir (para que la lista no engorde sola).
import { cleanup, render } from "@testing-library/react"
import axe from "axe-core"
import { Suspense, createElement } from "react"
import { afterEach, describe, expect, it, vi } from "vitest"

import site from "../.generated/site.json"
import { LOADERS } from "../app/_demos/registry"

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: () => {}, replace: () => {}, prefetch: () => {}, back: () => {}, refresh: () => {} }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
}))

// `componente--Demo` → motivo. Se completa con lo que devuelve la primera corrida.
// `next/link` y `next/image` traen su propio React (el del sitio): se reemplazan por lo que dibujan en el DOM.
vi.mock("next/link", async () => {
  const React = await import("react")
  return { default: ({ href, children, ...props }: { href: string; children?: React.ReactNode }) => React.createElement("a", { href: String(href), ...props }, children) }
})

// jsdom no trae `matchMedia`, que usan Recharts y los hooks de ancho.
window.matchMedia ??= ((query: string) => ({ matches: false, media: query, onchange: null, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, dispatchEvent: () => false })) as typeof window.matchMedia
Element.prototype.getAnimations ??= () => []
window.ResizeObserver ??= class { observe() {} unobserve() {} disconnect() {} } as unknown as typeof ResizeObserver
window.IntersectionObserver ??= class { observe() {} unobserve() {} disconnect() {} takeRecords() { return [] } root = null; rootMargin = ""; thresholds = [] } as unknown as typeof IntersectionObserver

const CONOCIDAS: Record<string, string> = {
  "app-shell--Completo": "jsdom no aplica `hidden`/`md:flex`: ve la barra de escritorio y la del teléfono a la vez (dos `banner`); en un navegador una de las dos es `display: none`",
  "file-grid--Basico": "el «…» de la miniatura es un botón solo para el puntero (`aria-hidden`, `tabindex=-1`) dentro de la opción: el teclado tiene Shift+F10 (documentado en FileGrid)",
}

const DESACTIVADAS = ["color-contrast", "region", "landmark-one-main", "page-has-heading-one", "scrollable-region-focusable"]

afterEach(cleanup)

const primeras = site.components.flatMap((c) => (c.examples[0] ? [{ slug: c.slug, id: c.examples[0].id }] : []))

for (const tema of ["light", "dark"] as const) {
  describe(`axe (${tema})`, () => {
    for (const { slug, id } of primeras) {
      it(`${slug}`, async () => {
        document.documentElement.classList.toggle("dark", tema === "dark")
        const cargar = LOADERS[id]
        if (!cargar) throw new Error(`falta el loader de ${id}`)
        const { default: Demo } = await cargar()
        const { container } = render(createElement(Suspense, { fallback: null }, createElement(Demo)))
        await new Promise((r) => setTimeout(r, 30))
        const resultado = await axe.run(container, { rules: Object.fromEntries(DESACTIVADAS.map((r) => [r, { enabled: false }])) })
        const reporte = resultado.violations.map((v) => `${v.id} (${v.impact}): ${v.nodes.length} × ${v.nodes[0]?.html.slice(0, 120)}`)
        if (CONOCIDAS[id]) {
          expect(reporte.length, `${id}: la violación conocida («${CONOCIDAS[id]}») ya no ocurre: sacala de CONOCIDAS`).toBeGreaterThan(0)
        } else {
          expect(reporte, id).toEqual([])
        }
      }, 20000)
    }
  })
}
