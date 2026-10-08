import { act, fireEvent, render, screen } from "@testing-library/react"
import { renderToString } from "react-dom/server"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { ScrollSequence, scrollSequenceProgress, scrollSequenceState } from "../../src/components/scroll-sequence"
import { hidratar } from "../hidratar"

const STEPS = [{ label: "Borrador" }, { label: "Revisada" }, { label: "Emitida" }]

function Stage() {
  return (
    <ScrollSequence aria-label="Una factura de borrador a emitida" steps={STEPS}>
      {({ step, label }) => (
        <p data-testid={`stage-${step}`}>
          Factura F-0012 · {label}
          {step === 2 && " ✓"}
        </p>
      )}
    </ScrollSequence>
  )
}

// La pista mide 3 pantallas de 800: 1600 px de recorrido. `top` es lo que la página ya scrolleó.
let top = 0
function mockLayout() {
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
    if (this.dataset.slot === "scroll-sequence-track") return { top, height: 2400, bottom: top + 2400, left: 0, right: 0, width: 0, x: 0, y: top, toJSON() {} } as DOMRect
    return { top: 0, height: 0, bottom: 0, left: 0, right: 0, width: 0, x: 0, y: 0, toJSON() {} } as DOMRect
  })
  Object.defineProperty(window, "innerHeight", { configurable: true, value: 800 })
}
function stubMotion(reduce: boolean) {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: query.includes("reduce") ? reduce : false,
    media: query,
    addEventListener() {},
    removeEventListener() {},
  }))
}
async function scrollTo(y: number) {
  top = -y
  await act(async () => {
    fireEvent.scroll(window)
    await new Promise((resolve) => requestAnimationFrame(() => resolve(null)))
  })
}

beforeEach(() => {
  top = 0
  mockLayout()
})
afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe("estado puro", () => {
  it("el progreso sale de la posición de la pista y se acota a 0..1", () => {
    expect(scrollSequenceProgress({ top: 0, height: 2400 }, 800)).toBe(0)
    expect(scrollSequenceProgress({ top: -800, height: 2400 }, 800)).toBe(0.5)
    expect(scrollSequenceProgress({ top: -5000, height: 2400 }, 800)).toBe(1)
    expect(scrollSequenceProgress({ top: 300, height: 2400 }, 800)).toBe(0)
    expect(scrollSequenceProgress({ top: 0, height: 500 }, 800)).toBe(0)
  })

  it("el paso es función del progreso: el mismo progreso da el mismo paso, bajando o subiendo", () => {
    expect(scrollSequenceState(0, 3)).toMatchObject({ step: 0, stepProgress: 0 })
    expect(scrollSequenceState(0.5, 3).step).toBe(1)
    expect(scrollSequenceState(0.99, 3).step).toBe(2)
    expect(scrollSequenceState(1, 3)).toMatchObject({ step: 2, stepProgress: 1 })
    expect(scrollSequenceState(0.2, 3).stepProgress).toBeCloseTo(0.6)
  })
})

describe("ScrollSequence", () => {
  it("sin JS: el HTML del servidor trae todos los pasos en orden, apilados", () => {
    const html = renderToString(<Stage />)
    const static_ = html.slice(html.indexOf('data-slot="scroll-sequence-static"'))
    expect(static_.indexOf("Borrador")).toBeLessThan(static_.indexOf("Revisada"))
    expect(static_.indexOf("Revisada")).toBeLessThan(static_.indexOf("Emitida"))
    expect(html).toContain("<noscript>")
  })

  it("avanza al bajar y retrocede al subir", async () => {
    stubMotion(false)
    render(<Stage />)
    await act(async () => {})
    expect(screen.getByTestId("stage-0")).toBeInTheDocument()
    await scrollTo(800)
    expect(screen.getByTestId("stage-1")).toBeInTheDocument()
    await scrollTo(1600)
    expect(screen.getByTestId("stage-2")).toHaveTextContent("Emitida ✓")
    await scrollTo(700)
    expect(screen.getByTestId("stage-1")).toBeInTheDocument()
    await scrollTo(0)
    expect(screen.getByTestId("stage-0")).toBeInTheDocument()
    expect(screen.queryByTestId("stage-2")).toBeNull()
  })

  it("el indicador marca el paso actual y anuncia el cambio", async () => {
    stubMotion(false)
    render(<Stage />)
    await act(async () => {})
    const nav = screen.getByRole("list", { name: "Pasos" })
    expect(nav).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Borrador/ })).toHaveAttribute("aria-current", "step")
    await scrollTo(1600)
    expect(screen.getByRole("button", { name: /Emitida/ })).toHaveAttribute("aria-current", "step")
    expect(screen.getByRole("button", { name: /Borrador/ })).not.toHaveAttribute("aria-current")
    expect(screen.getByRole("status")).toHaveTextContent("Paso 3 de 3: Emitida")
  })

  it("el progreso continuo va en variables CSS del escenario (transform y opacity las leen)", async () => {
    stubMotion(false)
    const { container } = render(<Stage />)
    await act(async () => {})
    await scrollTo(400)
    const stage = container.querySelector<HTMLElement>("[data-slot=scroll-sequence-stage]")!
    expect(stage.style.getPropertyValue("--scroll-sequence-progress")).toBe("0.25")
    expect(Number(stage.style.getPropertyValue("--scroll-sequence-step-progress"))).toBeCloseTo(0.75)
  })

  it("un botón del indicador lleva al paso", async () => {
    stubMotion(false)
    const scroll = vi.fn()
    vi.stubGlobal("scrollTo", scroll)
    render(<Stage />)
    await act(async () => {})
    fireEvent.click(screen.getByRole("button", { name: /Revisada/ }))
    expect(scroll).toHaveBeenCalledWith(expect.objectContaining({ top: 800 }))
  })

  it("con prefers-reduced-motion: los pasos apilados, sin escenario sticky", async () => {
    stubMotion(true)
    const { container } = render(<Stage />)
    await act(async () => {})
    expect(container.querySelector("[data-slot=scroll-sequence-track]")).toBeNull()
    expect(screen.getAllByTestId(/stage-/)).toHaveLength(3)
  })

  it("hidrata sin diferencias con el HTML del servidor", async () => {
    stubMotion(false)
    const container = document.createElement("div")
    container.innerHTML = renderToString(<Stage />)
    document.body.append(container)
    const errors = vi.spyOn(console, "error").mockImplementation(() => {})
    await hidratar(container, <Stage />)
    expect(errors).not.toHaveBeenCalled()
    container.remove()
  })
})

describe("ScrollSequence sin JS", () => {
  it("el <noscript> esconde la pista y muestra la lista", () => {
    const html = renderToString(<Stage />)
    expect(html).toMatch(/<noscript><style>[^<]*scroll-sequence-track[^<]*display:none/)
  })
})
