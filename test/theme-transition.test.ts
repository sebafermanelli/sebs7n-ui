// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest"

import { startThemeTransition } from "../src/lib/theme-transition"

function reducedMotion(matches: boolean) {
  window.matchMedia = vi.fn().mockReturnValue({ matches }) as unknown as typeof window.matchMedia
}

afterEach(() => {
  delete (document as { startViewTransition?: unknown }).startViewTransition
  vi.restoreAllMocks()
})

describe("startThemeTransition", () => {
  it("sin startViewTransition aplica directo, una vez", () => {
    reducedMotion(false)
    const apply = vi.fn()
    startThemeTransition(apply)
    expect(apply).toHaveBeenCalledTimes(1)
  })

  it("con startViewTransition lo usa una vez y apply corre dentro", () => {
    reducedMotion(false)
    const apply = vi.fn()
    const svt = vi.fn((cb: () => void) => {
      cb()
      return { finished: Promise.resolve() }
    })
    ;(document as unknown as { startViewTransition: unknown }).startViewTransition = svt
    startThemeTransition(apply)
    expect(svt).toHaveBeenCalledTimes(1)
    expect(apply).toHaveBeenCalledTimes(1)
  })

  it("con movimiento reducido aplica directo sin transición", () => {
    reducedMotion(true)
    const apply = vi.fn()
    const svt = vi.fn()
    ;(document as unknown as { startViewTransition: unknown }).startViewTransition = svt
    startThemeTransition(apply)
    expect(svt).not.toHaveBeenCalled()
    expect(apply).toHaveBeenCalledTimes(1)
  })

  it("si startViewTransition tira, aplica directo una vez y no deja estado", () => {
    reducedMotion(false)
    const apply = vi.fn()
    ;(document as unknown as { startViewTransition: unknown }).startViewTransition = () => {
      throw new Error("boom")
    }
    startThemeTransition(apply)
    expect(apply).toHaveBeenCalledTimes(1)
    expect(document.documentElement.hasAttribute("data-theme-transition")).toBe(false)
  })

  it("si la transición se salta o falla, el atributo se va", async () => {
    reducedMotion(false)
    const finished = Promise.reject(new Error("skipped"))
    ;(document as unknown as { startViewTransition: unknown }).startViewTransition = (cb: () => void) => {
      cb()
      return { finished }
    }
    startThemeTransition(() => {})
    expect(document.documentElement.hasAttribute("data-theme-transition")).toBe(true)
    await new Promise((r) => setTimeout(r, 0))
    expect(document.documentElement.hasAttribute("data-theme-transition")).toBe(false)
  })

  it("si apply tira dentro de la transición, no queda atributo", async () => {
    reducedMotion(false)
    const finished = Promise.resolve()
    ;(document as unknown as { startViewTransition: unknown }).startViewTransition = (cb: () => void) => {
      try {
        cb()
      } catch {}
      return { finished }
    }
    startThemeTransition(() => {
      throw new Error("x")
    })
    await new Promise((r) => setTimeout(r, 0))
    expect(document.documentElement.hasAttribute("data-theme-transition")).toBe(false)
  })
})
