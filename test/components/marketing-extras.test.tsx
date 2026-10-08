import { act, render } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { readFileSync } from "node:fs"
import { join } from "node:path"

import { AiGlow } from "../../src/components/ai-button"
import { ScrollSequence } from "../../src/components/scroll-sequence"

const css = readFileSync(join(import.meta.dirname, "../../src/styles/theme.css"), "utf8")

describe("AiGlow tintable", () => {
  it("sin tint, igual que siempre; con tint=brand suma la utilidad de marca", () => {
    const { container, rerender } = render(<AiGlow />)
    expect(container.firstElementChild).not.toHaveClass("ai-tint-brand")
    rerender(<AiGlow tint="brand" />)
    expect(container.firstElementChild).toHaveClass("ai-glow", "ai-tint-brand")
  })

  it("el degradé lee --ai-glow-1…4 con los colores de IA de siempre como respaldo", () => {
    const start = css.indexOf("@utility ai-glow {")
    const utility = css.slice(start, css.indexOf("\n}", start))
    for (const [n, fallback] of [[1, "--sf-ai"], [2, "--sf-ai-2"], [3, "--sf-amber-600"], [4, "--sf-blue-600"]] as const) expect(utility).toContain(`var(--ai-glow-${n}, var(${fallback}))`)
    expect(css).toMatch(/@utility ai-tint-brand \{[^}]*--ai-glow-1: var\(--sf-brand-700\);/)
  })
})

describe("ScrollSequence fit=scale", () => {
  afterEach(() => vi.unstubAllGlobals())

  function setup(natural: number, available: number) {
    vi.stubGlobal("matchMedia", (query: string) => ({ matches: false, media: query, addEventListener() {}, removeEventListener() {} }))
    vi.stubGlobal("ResizeObserver", class { observe() {} disconnect() {} unobserve() {} })
    vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(available)
    vi.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockReturnValue(natural)
  }
  const sequence = (fit?: "scale") => (
    <ScrollSequence fit={fit} steps={[{ label: "A" }, { label: "B" }]}>
      {() => <p>escena</p>}
    </ScrollSequence>
  )

  it("achica el contenido que no entra, con piso de 0,5", async () => {
    setup(1000, 700)
    const { container } = render(sequence("scale"))
    await act(async () => {})
    expect(container.querySelector<HTMLElement>("[data-slot=scroll-sequence-fit]")!.style.getPropertyValue("--scroll-sequence-fit")).toBe("0.7")
    vi.restoreAllMocks()
    setup(2000, 700)
    const second = render(sequence("scale"))
    await act(async () => {})
    expect(second.container.querySelector<HTMLElement>("[data-slot=scroll-sequence-fit]")!.style.getPropertyValue("--scroll-sequence-fit")).toBe("0.5")
  })

  it("si entra, escala 1; y sin fit no hay envoltorio (comportamiento de siempre)", async () => {
    setup(500, 700)
    const scaled = render(sequence("scale"))
    await act(async () => {})
    expect(scaled.container.querySelector<HTMLElement>("[data-slot=scroll-sequence-fit]")!.style.getPropertyValue("--scroll-sequence-fit")).toBe("1")
    const plain = render(sequence())
    await act(async () => {})
    expect(plain.container.querySelector("[data-slot=scroll-sequence-fit]")).toBeNull()
  })
})
