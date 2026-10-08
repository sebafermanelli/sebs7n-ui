import { act, render, screen } from "@testing-library/react"
import { renderToString } from "react-dom/server"
import { afterEach, describe, expect, it, vi } from "vitest"

import { Reveal, RevealGroup } from "../../src/components/reveal"

let observed: { callback: IntersectionObserverCallback; node: Element }[] = []
function stubObserver() {
  observed = []
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      callback: IntersectionObserverCallback
      constructor(callback: IntersectionObserverCallback) {
        this.callback = callback
      }
      observe(node: Element) {
        observed.push({ callback: this.callback, node })
      }
      disconnect() {}
      unobserve() {}
    }
  )
}
function stubMotion(reduce: boolean) {
  vi.stubGlobal("matchMedia", (query: string) => ({ matches: query.includes("reduce") ? reduce : false, media: query, addEventListener() {}, removeEventListener() {} }))
}
function at(top: number) {
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(() => ({ top, bottom: top + 100, height: 100, left: 0, right: 0, width: 0, x: 0, y: top, toJSON() {} }) as DOMRect)
  Object.defineProperty(window, "innerHeight", { configurable: true, value: 800 })
}
function enter(index = 0) {
  act(() => observed[index]!.callback([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver))
}

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe("Reveal", () => {
  it("sin JS el contenido ya está a la vista: el HTML del servidor no trae estado escondido", () => {
    const html = renderToString(<Reveal>Hola</Reveal>)
    expect(html).toContain("Hola")
    expect(html).not.toContain("data-reveal")
  })

  it("lo que ya se ve al montar no se esconde (no parpadea)", () => {
    stubObserver()
    stubMotion(false)
    at(100)
    render(<Reveal>Arriba</Reveal>)
    expect(screen.getByText("Arriba")).not.toHaveAttribute("data-reveal")
  })

  it("lo que está debajo se prepara y entra al asomar, una sola vez", () => {
    stubObserver()
    stubMotion(false)
    at(2000)
    render(<Reveal distance={24}>Abajo</Reveal>)
    const node = screen.getByText("Abajo")
    expect(node).toHaveAttribute("data-reveal", "hidden")
    expect(node.style.getPropertyValue("--reveal-distance")).toBe("24px")
    enter()
    expect(node).toHaveAttribute("data-reveal", "shown")
    expect(node).toHaveClass("data-[reveal=shown]:ease-out-expo")
  })

  it("solo mueve: la opacidad del texto no baja salvo con fade", () => {
    stubObserver()
    stubMotion(false)
    at(2000)
    const { rerender } = render(<Reveal>Texto</Reveal>)
    expect(screen.getByText("Texto").className).not.toContain("opacity-0")
    rerender(<Reveal fade>Texto</Reveal>)
    expect(screen.getByText("Texto").className).toContain("data-[reveal=hidden]:opacity-0")
  })

  it("con prefers-reduced-motion nunca se esconde", () => {
    stubObserver()
    stubMotion(true)
    at(2000)
    render(<Reveal>Quieto</Reveal>)
    const node = screen.getByText("Quieto")
    expect(node).not.toHaveAttribute("data-reveal")
    expect(node).toHaveClass("motion-reduce:translate-y-0", "motion-reduce:transition-none")
    expect(observed).toHaveLength(0)
  })

  it("sin IntersectionObserver muestra todo", () => {
    stubMotion(false)
    at(2000)
    render(<Reveal>Todo</Reveal>)
    expect(screen.getByText("Todo")).not.toHaveAttribute("data-reveal")
  })

  it("el retraso se aplica al entrar", () => {
    stubObserver()
    stubMotion(false)
    at(2000)
    render(<Reveal delay={160}>Con retraso</Reveal>)
    enter()
    expect(screen.getByText("Con retraso").style.transitionDelay).toBe("160ms")
  })
})

describe("RevealGroup", () => {
  it("escalona los hijos de a `step` ms", () => {
    stubObserver()
    stubMotion(false)
    at(2000)
    render(
      <RevealGroup step={100}>
        <p>Uno</p>
        <p>Dos</p>
        <p>Tres</p>
      </RevealGroup>
    )
    observed.forEach((_, index) => enter(index))
    const delays = ["Uno", "Dos", "Tres"].map((text) => screen.getByText(text).closest<HTMLElement>("[data-slot=reveal]")!.style.transitionDelay)
    expect(delays).toEqual(["", "100ms", "200ms"])
  })
})
