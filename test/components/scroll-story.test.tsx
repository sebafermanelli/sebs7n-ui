import { act, fireEvent, render, screen } from "@testing-library/react"
import { renderToString } from "react-dom/server"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { ScrollSequence } from "../../src/components/scroll-sequence"
import { ScrollStory } from "../../src/components/scroll-story"

const STEPS = [
  { label: "Cargar", title: "Cargá la factura", description: "Desde un PDF o a mano." },
  { label: "Revisar", title: "Revisala con tu equipo" },
  { label: "Emitir", title: "Emitila" },
]

function Story() {
  return (
    <ScrollStory aria-label="Recorrido" steps={STEPS}>
      {({ step, mode }) => <p data-testid={`stage-${step}`}>escena {step} {mode}</p>}
    </ScrollStory>
  )
}

let top = 0
function mockLayout() {
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
    if (this.dataset.slot === "scroll-sequence-track") return { top, height: 2400, bottom: top + 2400, left: 0, right: 0, width: 0, x: 0, y: top, toJSON() {} } as DOMRect
    return { top: 0, height: 0, bottom: 0, left: 0, right: 0, width: 0, x: 0, y: 0, toJSON() {} } as DOMRect
  })
  Object.defineProperty(window, "innerHeight", { configurable: true, value: 800 })
}
/** `reduce`: movimiento reducido; `fits`: si cumple la media query del escenario. */
function stubMedia({ reduce = false, fits = true }: { reduce?: boolean; fits?: boolean }) {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: query.includes("reduce") ? reduce : fits,
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

describe("ScrollStory", () => {
  it("lista numerada 01–03 con el paso actual marcado, y cambia al bajar", async () => {
    stubMedia({})
    render(<Story />)
    await act(async () => {})
    const list = screen.getByRole("list")
    expect(list.textContent).toContain("01")
    expect(list.textContent).toContain("03")
    expect(screen.getByRole("button", { name: /Cargá la factura/ })).toHaveAttribute("aria-current", "step")
    await scrollTo(1700)
    expect(screen.getByRole("button", { name: /Emitila/ })).toHaveAttribute("aria-current", "step")
    expect(screen.getByRole("status")).toHaveTextContent("Paso 3 de 3: Emitir")
    expect(screen.getByTestId("stage-2")).toHaveTextContent("scroll")
  })

  it("un botón de la lista lleva al paso (goTo)", async () => {
    stubMedia({})
    const scroll = vi.fn()
    vi.stubGlobal("scrollTo", scroll)
    render(<Story />)
    await act(async () => {})
    fireEvent.click(screen.getByRole("button", { name: /Revisala/ }))
    expect(scroll).toHaveBeenCalledWith(expect.objectContaining({ top: 800 }))
  })

  it("con prefers-reduced-motion: los pasos apilados con título y bajada", async () => {
    stubMedia({ reduce: true })
    const { container } = render(<Story />)
    await act(async () => {})
    expect(container.querySelector("[data-slot=scroll-sequence-track]")).toBeNull()
    expect(screen.getAllByTestId(/stage-/)).toHaveLength(3)
    expect(screen.getByRole("heading", { name: /Cargá la factura/ })).toBeInTheDocument()
    expect(screen.getByText("Desde un PDF o a mano.")).toBeInTheDocument()
  })

  it("minStage: si el escenario no entra (teléfono, ventana baja) también se apila", async () => {
    stubMedia({ fits: false })
    const { container } = render(<Story />)
    await act(async () => {})
    expect(container.querySelector("[data-slot=scroll-sequence-track]")).toBeNull()
    expect(screen.getAllByTestId(/stage-/)).toHaveLength(3)
  })

  it("sin JS: el HTML trae los pasos apilados y la consulta de minStage en CSS", () => {
    const html = renderToString(<Story />)
    expect(html).toContain('data-slot="scroll-sequence-static"')
    expect(html).toContain("@media not all and (min-width: 768px) and (min-height: 600px)")
    expect(html).toContain("<noscript>")
  })
})

describe("ScrollSequence minStage (retrocompatible)", () => {
  const seq = (minStage?: string) => (
    <ScrollSequence minStage={minStage} steps={[{ label: "A" }, { label: "B" }]}>
      {({ step }) => <p data-testid={`s-${step}`}>x</p>}
    </ScrollSequence>
  )

  it("sin minStage no consulta nada más y sigue en escenario fijo", async () => {
    const asked: string[] = []
    vi.stubGlobal("matchMedia", (query: string) => {
      asked.push(query)
      return { matches: false, media: query, addEventListener() {}, removeEventListener() {} }
    })
    const { container } = render(seq())
    await act(async () => {})
    expect(asked).toEqual(["(prefers-reduced-motion: reduce)"])
    expect(container.querySelector("[data-slot=scroll-sequence-track]")).not.toBeNull()
  })

  it("con minStage que se cumple sigue en escenario fijo", async () => {
    stubMedia({ fits: true })
    const { container } = render(seq("(min-width: 640px)"))
    await act(async () => {})
    expect(container.querySelector("[data-slot=scroll-sequence-track]")).not.toBeNull()
  })
})
