import { act, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { ThemeSwitcherLazy } from "../../src/components/theme-switcher-lazy"

afterEach(() => vi.unstubAllGlobals())

describe("ThemeSwitcherLazy", () => {
  it("ocupa 96 × 32 desde el primer render, decorativo, sin el control real", () => {
    vi.stubGlobal("requestIdleCallback", () => 1)
    vi.stubGlobal("cancelIdleCallback", () => {})
    const { container } = render(<ThemeSwitcherLazy />)
    const placeholder = container.querySelector("[data-slot=theme-switcher-placeholder]")!
    expect(placeholder).toHaveClass("h-8", "w-24")
    expect(placeholder).toHaveAttribute("aria-hidden", "true")
    expect(screen.queryByRole("radiogroup")).toBeNull()
  })

  it("al quedar libre el navegador carga el control real en el mismo lugar", async () => {
    vi.stubGlobal("requestIdleCallback", (cb: () => void) => {
      cb()
      return 1
    })
    vi.stubGlobal("cancelIdleCallback", () => {})
    render(<ThemeSwitcherLazy />)
    expect(await screen.findByRole("radiogroup")).toBeInTheDocument()
    expect(screen.getByRole("radiogroup").closest("[data-slot=theme-switcher]")).toHaveClass("h-8", "w-24")
  })

  it("el puntero adelanta la carga", async () => {
    vi.stubGlobal("requestIdleCallback", () => 1)
    vi.stubGlobal("cancelIdleCallback", () => {})
    const { container } = render(<ThemeSwitcherLazy />)
    await act(async () => {
      container.querySelector("[data-slot=theme-switcher-placeholder]")!.dispatchEvent(new PointerEvent("pointerover", { bubbles: true }))
    })
    expect(await screen.findByRole("radiogroup")).toBeInTheDocument()
  })
})
