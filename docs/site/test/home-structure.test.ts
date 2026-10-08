// @vitest-environment node
// La home del sitio sigue la receta de la landing de referencia (`app/templates/landing`): misma barra,
// mismos encabezados de sección, mismo ancho y mismo patrón de carga diferida. Si la receta cambia en uno,
// este test avisa que el otro quedó atrás.
import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

const app = new URL("../app", import.meta.url).pathname
const read = (f: string) => readFileSync(`${app}/${f}`, "utf8")
const landing = (f: string) => read(`templates/landing/_components/${f}`)

describe("home y landing comparten estructura", () => {
  it("el encabezado de sección es el mismo componente, línea por línea", () => {
    expect(read("_components/section-header.tsx")).toBe(landing("section-header.tsx"))
  })

  it("el selector de tema diferido y la hoja del teléfono siguen el mismo patrón (dynamic, ssr:false)", () => {
    for (const f of ["theme-toggle.tsx", "mobile-menu-lazy.tsx", "site-nav-lazy.tsx"]) {
      expect(read(`_components/${f}`), f).toMatch(/dynamic\(/)
      expect(read(`_components/${f}`), f).toContain("ssr: false")
      expect(landing(f), f).toContain("ssr: false")
    }
    expect(read("_components/theme-toggle.tsx")).toContain("h-8 w-24")
    expect(landing("theme-toggle.tsx")).toContain("h-8 w-24")
  })

  it("la barra: Navbar de 1080, menú diferido, tema diferido, «Empezar» en gris y menú móvil", () => {
    for (const src of [read("_components/site-header.tsx"), landing("landing-navbar.tsx")]) {
      expect(src).toContain("<NavbarContent maxWidth={1080}>")
      expect(src).toContain("<SiteNavLazy")
      expect(src).toContain("<ThemeToggle")
      expect(src).toContain("<MobileMenuButton")
      expect(src).toMatch(/variant: "secondary", size: "sm"/)
      expect(src).not.toMatch(/^"use client"/)
    }
  })

  it("el menú con paneles usa NavigationMenu con triggers y viewport", () => {
    for (const src of [read("_components/site-nav.tsx"), landing("site-nav.tsx")]) {
      expect(src).toContain("<NavigationMenuTrigger>")
      expect(src).toContain("<NavigationMenuViewport")
    }
  })

  it("la home: mismo ancho, escena «cálido y cuidado» con piezas del paquete y pie de la landing", () => {
    const home = read("page.tsx")
    const ref = read("templates/landing/page.tsx")
    for (const src of [home, ref]) {
      expect(src).toContain("max-w-[1080px]")
      expect(src).not.toMatch(/^"use client"/)
    }
    expect(home).toContain('className="min-h-dvh bg-background" id="top"')
    // El titular en la escala display, la bajada en text-lead y una pantalla armada en un WindowFrame.
    expect(home).toContain("text-display")
    expect(home).toContain("text-lead")
    for (const pieza of ["Reveal", "RevealGroup", "WindowFrame", "RuledList", "SectionBackdrop", "ThemeSwitcherLazy"]) expect(home, pieza).toContain(`<${pieza}`)
    // Sin la grilla de cards idénticas con ícono de antes.
    expect(home).not.toContain("<CardGrid")
    expect(home.match(/<SectionHeader/g)!.length).toBeGreaterThanOrEqual(3)
    expect(home.match(/<h1[\s>]/g)).toHaveLength(1)
    expect(home).toContain("<SiteFooter")
    expect(read("_components/site-footer.tsx")).toContain("<FooterContent maxWidth={1080}>")
    expect(landing("landing-footer.tsx")).toContain("<FooterContent maxWidth={1080}>")
  })

  it("las secciones con ancla llevan scroll-mt-20 y las anclas del pie existen", () => {
    const home = read("page.tsx")
    for (const [, id] of home.matchAll(/id="([\w-]+)"/g)) if (id !== "top") expect(home, id).toContain(`scroll-mt-20`)
    expect(home).toContain('id="top"')
    expect(read("_components/site-footer.tsx")).toContain('href="#top"')
  })

  it("la home es una portada de sistema: sin banda de cifras ni card de cierre de marketing, y el conteo sale de site.json", () => {
    const home = read("page.tsx")
    expect(home).not.toContain('id="cifras"')
    expect(home).not.toContain('id="empezar"')
    expect(home).not.toContain("Instalalo en un minuto")
    expect(home).toContain("site.components.length")
    expect(home).not.toMatch(/value: "\d/)
  })
})
