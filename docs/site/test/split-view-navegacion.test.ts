// @vitest-environment jsdom
import { act, createElement, type ComponentType } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, describe, expect, it } from "vitest"

import { FilesShowcase } from "../app/_components/showcase/files"
import { MailShowcase } from "../app/_components/showcase/mail"
import { Basico } from "../app/_demos/split-view"

// Sin Testing Library: la de la raíz del repo traería otro React que el del sitio.
;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
let root: Root | null = null
afterEach(() => {
  act(() => root?.unmount())
  root = null
  document.body.innerHTML = ""
})
const render = (element: ReturnType<typeof createElement>) => {
  const container = document.body.appendChild(document.createElement("div"))
  root = createRoot(container)
  act(() => root!.render(element))
}
const click = (element: Element) => act(() => (element as HTMLElement).click())
/** Lo que se toca: el primer botón (o link) cuyo texto empieza así, como en la pantalla. */
const tocar = (texto: string) => {
  const blanco = [...document.querySelectorAll<HTMLElement>("button, a, [role=button]")].find((el) => el.textContent?.trim().startsWith(texto))
  if (!blanco) throw new Error(`No está «${texto}»`)
  click(blanco)
}

const panel = () => document.querySelector("[data-slot=split-view]")?.getAttribute("data-pane")

// En el teléfono se ve un panel por vez: tocar una fila avanza al panel siguiente aunque ya estuviera
// elegida, como Mail en iOS. Antes la demo solo cambiaba la carpeta y el toque sobre la elegida (o
// sobre cualquiera) no llevaba a la lista.
describe("SplitView en angosto: tocar una fila avanza de panel", () => {
  const casos: [string, ComponentType, string, string, string][] = [
    ["la demo", Basico, "Carpetas", "Emitidas", "Acme S.A."],
    ["Correo del Playground", MailShowcase, "Buzones", "Entrada", "Nube Digital"],
  ]

  it.each(casos)("%s: la carpeta ya elegida lleva a la lista, y la fila ya elegida al detalle", (_nombre, Pantalla, atras, carpeta, fila) => {
    render(createElement(Pantalla))
    expect(panel()).toBe("list")
    tocar(atras)
    expect(panel()).toBe("sidebar")
    tocar(carpeta)
    expect(panel()).toBe("list")
    tocar(fila)
    expect(panel()).toBe("detail")
  })
})

// Archivos en el teléfono, como Archivos de iOS: primero las ubicaciones, después las carpetas y
// después lo que hay adentro; «‹» vuelve con el nombre de lo anterior. Antes el sidebar se abría como
// Sheet con la hamburguesa y el árbol no se veía.
describe("Archivos del Playground en angosto: paneles como Archivos de iOS", () => {
  const fila = (texto: string) => [...document.querySelectorAll<HTMLElement>("[role=treeitem]")].find((el) => el.textContent?.trim() === texto)
  const titulo = () => document.querySelector("[data-slot=split-view-detail] h3")?.textContent
  const atras = (pane: "list" | "detail") => document.querySelector<HTMLElement>(`[data-slot=split-view-${pane}] [data-slot=split-view-back]`)

  it("ubicaciones → carpetas → archivos, y «‹» vuelve con el nombre de lo anterior", () => {
    render(createElement(FilesShowcase))
    expect(panel()).toBe("sidebar")
    // Sin hamburguesa ni Sheet: las ubicaciones son el primer panel.
    expect(document.querySelector("[data-slot=sheet-trigger]")).toBeNull()
    tocar("Mis archivos")
    expect(panel()).toBe("list")
    expect(atras("list")?.textContent).toBe("Archivos")
    // Tocar la carpeta, aunque ya sea la elegida, abre lo de adentro.
    click(fila("Septiembre")!)
    expect(panel()).toBe("detail")
    expect(titulo()).toBe("Septiembre")
    expect(atras("detail")?.textContent).toBe("2026")
    click(atras("detail")!)
    expect(panel()).toBe("detail")
    expect(titulo()).toBe("2026")
    expect(atras("detail")?.textContent).toBe("Facturas")
    click(atras("detail")!)
    expect(titulo()).toBe("Facturas")
    expect(atras("detail")?.textContent).toBe("Mis archivos")
    click(atras("detail")!)
    expect(panel()).toBe("list")
    click(atras("list")!)
    expect(panel()).toBe("sidebar")
  })
})
