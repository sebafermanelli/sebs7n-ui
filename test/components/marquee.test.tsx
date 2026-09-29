import { readFileSync } from "node:fs"
import { join } from "node:path"

import { act, fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { renderToString } from "react-dom/server"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { Marquee } from "../../src/components/marquee"
import { hidratar } from "../hidratar"

const CLIENTS = ["Acme", "Globex", "Initech", "Umbrella"]
const items = CLIENTS.map((name) => ({ id: name, node: <span>{name}</span>, href: `https://example.com/${name.toLowerCase()}` }))

const root = () => document.querySelector<HTMLElement>("[data-slot=marquee]")!
const track = () => document.querySelector<HTMLElement>("[data-slot=marquee-track]")!
const viewport = () => document.querySelector<HTMLElement>("[data-slot=marquee-viewport]")!

// jsdom no mide: el ancho de una tanda (la `ul`) y el de la vista se fijan a mano.
function widths(set: number, viewport: number) {
  vi.spyOn(HTMLElement.prototype, "scrollWidth", "get").mockImplementation(function (this: HTMLElement) {
    return this.tagName === "UL" ? set : 0
  })
  vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockImplementation(function (this: HTMLElement) {
    return this.dataset.slot === "marquee-viewport" ? viewport : 0
  })
}

const media = (reduce: boolean) => (query: string) => ({ matches: reduce && query.includes("reduce"), media: query, addEventListener() {}, removeEventListener() {} })

let intersect: ((entries: { isIntersecting: boolean }[]) => void) | undefined
let resize: (() => void) | undefined
let observed: Element[] = []
beforeEach(() => {
  vi.stubGlobal("matchMedia", media(false))
  observed = []
  vi.stubGlobal(
    "ResizeObserver",
    class {
      constructor(callback: () => void) {
        resize = callback
      }
      observe(element: Element) {
        observed.push(element)
      }
      disconnect() {}
    }
  )
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      constructor(callback: (entries: { isIntersecting: boolean }[]) => void) {
        intersect = callback
      }
      observe() {}
      disconnect() {}
    }
  )
})
afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  intersect = undefined
})

describe("Marquee", () => {
  it("en el servidor es una fila quieta con todos los links: sin JS se ve igual", () => {
    const html = renderToString(<Marquee aria-label="Clientes" items={items} />)
    expect(html).toContain('data-mode="static"')
    expect(html.match(/<a /g)).toHaveLength(4)
    expect(html).toContain('aria-label="Clientes"')
    expect(html).not.toContain("animate-marquee")
  })

  it("si entra, queda quieta y centrada", () => {
    widths(300, 800)
    render(<Marquee aria-label="Clientes" items={items} />)
    expect(root()).toHaveAttribute("data-mode", "static")
    expect(screen.getAllByRole("list")).toHaveLength(1)
    expect(track()).not.toHaveClass("animate-marquee")
  })

  it("si desborda, se desplaza en bucle: la tanda se duplica inerte y la pista lleva animate-marquee", () => {
    widths(1200, 400)
    render(<Marquee aria-label="Clientes" items={items} />)
    expect(root()).toHaveAttribute("data-mode", "loop")
    expect(track()).toHaveClass("animate-marquee")
    // La copia no se recorre dos veces: ni el lector (aria-hidden) ni Tab (inert).
    expect(screen.getAllByRole("list")).toHaveLength(1)
    expect(screen.getByRole("list", { name: "Clientes" })).toBeInTheDocument()
    const copy = document.querySelectorAll("ul")[1]!
    expect(copy).toHaveAttribute("aria-hidden", "true")
    expect(copy).toHaveAttribute("inert")
    expect(screen.getAllByRole("link")).toHaveLength(4)
  })

  it("speed: la duración es el ancho de una tanda sobre los px por segundo (40 por defecto)", () => {
    widths(1200, 400)
    const { rerender } = render(<Marquee aria-label="Clientes" items={items} />)
    expect(track().style.getPropertyValue("--sf-marquee-duration")).toBe("30s")
    rerender(<Marquee aria-label="Clientes" items={items} speed={60} />)
    expect(track().style.getPropertyValue("--sf-marquee-duration")).toBe("20s")
  })

  it("con prefers-reduced-motion queda quieta, con scroll a mano", () => {
    vi.stubGlobal("matchMedia", media(true))
    widths(1200, 400)
    render(<Marquee aria-label="Clientes" items={items} />)
    expect(root()).toHaveAttribute("data-mode", "static")
    expect(viewport()).toHaveClass("overflow-x-auto")
    expect(track()).not.toHaveClass("animate-marquee")
  })

  it("fuera de pantalla se pausa (data-paused) y vuelve al entrar", () => {
    widths(1200, 400)
    render(<Marquee aria-label="Clientes" items={items} />)
    act(() => intersect?.([{ isIntersecting: false }]))
    expect(root()).toHaveAttribute("data-paused")
    act(() => intersect?.([{ isIntersecting: true }]))
    expect(root()).not.toHaveAttribute("data-paused")
  })

  it("mide también la tanda: si un logo o la fuente cargan después, la duración se actualiza", () => {
    widths(1200, 400)
    render(<Marquee aria-label="Clientes" items={items} />)
    expect(observed).toContain(document.querySelector("ul"))
    expect(observed).toContain(viewport())
    vi.restoreAllMocks()
    widths(2400, 400)
    act(() => resize?.())
    expect(track().style.getPropertyValue("--sf-marquee-duration")).toBe("60s")
  })

  it("con foco en un link queda quieta con scroll a mano, para que el link enfocado se vea (2.4.7, 2.4.11)", () => {
    widths(1200, 400)
    render(<Marquee aria-label="Clientes" items={items} />)
    const link = screen.getAllByRole("link")[2]!
    act(() => link.focus())
    expect(root()).toHaveAttribute("data-mode", "static")
    expect(track()).not.toHaveClass("animate-marquee")
    expect(viewport()).toHaveClass("overflow-x-auto")
    expect(link).toHaveFocus()
    fireEvent.blur(link, { relatedTarget: document.body })
    act(() => link.blur())
    expect(root()).toHaveAttribute("data-mode", "loop")
  })

  it("en bucle trae un botón visible para pausar y reanudar (2.2.2), con textos de labels", async () => {
    const user = userEvent.setup()
    widths(1200, 400)
    const { rerender } = render(<Marquee aria-label="Clientes" items={items} />)
    const button = screen.getByRole("button", { name: "Pausar" })
    await user.click(button)
    expect(root()).toHaveAttribute("data-paused")
    expect(button).toHaveAccessibleName("Reanudar")
    // Pausada a mano, entrar y salir de pantalla no la vuelve a mover.
    act(() => intersect?.([{ isIntersecting: true }]))
    expect(root()).toHaveAttribute("data-paused")
    await user.click(button)
    expect(root()).not.toHaveAttribute("data-paused")
    rerender(<Marquee aria-label="Clientes" items={items} labels={{ pause: "Pause", play: "Play" }} />)
    expect(screen.getByRole("button", { name: "Pause" })).toBeInTheDocument()
  })

  it("«Reanudar» con el foco en el botón la vuelve a mover: el botón queda fuera de la vista, donde el foco pausa", async () => {
    const user = userEvent.setup()
    widths(1200, 400)
    render(<Marquee aria-label="Clientes" items={items} />)
    const button = screen.getByRole("button", { name: "Pausar" })
    await user.click(button)
    await user.click(screen.getByRole("button", { name: "Reanudar" }))
    expect(button).toHaveFocus()
    expect(root()).not.toHaveAttribute("data-paused")
    expect(root()).toHaveAttribute("data-mode", "loop")
    expect(track()).toHaveClass("animate-marquee")
    // La pausa por foco y por hover de theme.css mira la vista; el botón no puede estar adentro.
    expect(viewport().contains(button)).toBe(false)
    expect(track().contains(button)).toBe(false)
  })

  it("quieta porque entra, no hay botón de pausa", () => {
    widths(300, 800)
    render(<Marquee aria-label="Clientes" items={items} />)
    expect(screen.queryByRole("button")).toBeNull()
  })

  it("un ítem sin href no es link", () => {
    render(<Marquee aria-label="Clientes" items={[{ id: "a", node: "Acme" }, ...items.slice(1)]} />)
    expect(screen.getAllByRole("link")).toHaveLength(3)
    expect(screen.getByText("Acme").closest("a")).toBeNull()
  })

  it("hidrata sin mismatch", async () => {
    widths(1200, 400)
    const ui = <Marquee aria-label="Clientes" items={items} />
    const container = document.createElement("div")
    container.innerHTML = renderToString(ui)
    document.body.append(container)
    const recoverable = vi.fn()
    await hidratar(container, ui, { onRecoverableError: recoverable })
    expect(recoverable).not.toHaveBeenCalled()
  })

  it("theme.css: animate-marquee corre una tanda, se pausa con hover y foco en la vista y con data-paused, y no corre con movimiento reducido", () => {
    const css = readFileSync(join(import.meta.dirname, "../../src/styles/theme.css"), "utf8")
    const utility = css.slice(css.indexOf("@utility animate-marquee"), css.indexOf("@utility transition-control"))
    expect(css).toMatch(/@keyframes sf-marquee\s*\{\s*to\s*\{\s*translate: -50% 0;/)
    expect(utility).toContain("var(--sf-marquee-duration")
    for (const selector of ['[data-slot="marquee-viewport"]:hover &', '[data-slot="marquee-viewport"]:focus-within &', '[data-slot="marquee"][data-paused] &']) expect(utility).toContain(selector)
    // En la raíz no: el botón de pausa está ahí, y con el foco (o el puntero) en «Reanudar» no arrancaba.
    for (const selector of ['[data-slot="marquee"]:hover &', '[data-slot="marquee"]:focus-within &']) expect(utility).not.toContain(selector)
    expect(utility).toMatch(/prefers-reduced-motion: reduce\)\s*\{\s*animation: none;/)
  })
})
