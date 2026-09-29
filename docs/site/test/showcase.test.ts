import { createElement, type ComponentType } from "react"
import { renderToString } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { FilesShowcase } from "../app/_components/showcase/files"
import { HomeShowcase } from "../app/_components/showcase/home"
import { SHOWCASES, Showcase } from "../app/_components/showcase/index"
import { MailShowcase } from "../app/_components/showcase/mail"
import { SettingsShowcase } from "../app/_components/showcase/settings"

// Las pantallas del Playground son componentes reales del paquete: si uno cambia su API o tira al
// renderizar, la pantalla se rompe en el sitio sin que ningún test lo diga.
describe("Playground: pantallas", () => {
  it("el selector tiene las cuatro opciones, en orden", () => {
    expect(SHOWCASES.map((showcase) => showcase.label)).toEqual(["Inicio", "Archivos", "Ajustes", "Correo"])
    const html = renderToString(createElement(Showcase))
    for (const { label } of SHOWCASES) expect(html).toContain(`>${label}<`)
    expect(html).toContain('role="tablist"')
  })

  const pantallas: [string, ComponentType, string][] = [
    ["home", HomeShowcase, "Facturas"],
    ["files", FilesShowcase, "Factura 0013.pdf"],
    ["settings", SettingsShowcase, "Ajustes"],
    ["mail", MailShowcase, "Comprobante de pago"],
  ]

  it.each(pantallas)("%s se renderiza sin tirar", (_id, Pantalla, texto) => {
    const html = renderToString(createElement(Pantalla))
    expect(html).toContain(texto)
  })

  it("Inicio arranca fuera de edición, con «Editar» en la barra", () => {
    const html = renderToString(createElement(HomeShowcase))
    expect(html).toMatch(/<button[^>]*data-slot="button"[^>]*>(?:<[^>]+>)*Editar</)
    expect(html).not.toContain("animate-jiggle")
  })

  it("cada opción tiene su pantalla", () => {
    expect(SHOWCASES.map((showcase) => showcase.id)).toEqual(pantallas.map(([id]) => id))
  })
})
