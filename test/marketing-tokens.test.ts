// @vitest-environment node
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

const theme = readFileSync(join(import.meta.dirname, "../src/styles/theme.css"), "utf8")
const utility = (name: string) => theme.match(new RegExp(`^@utility ${name} \\{(.*)\\}$`, "m"))?.[1]

describe("kit de marketing: tokens opt-in", () => {
  it("la escala display es fluida (clamp) y con más contraste que large-title (48)", () => {
    for (const name of ["text-display", "text-display-2", "text-display-3", "text-lead"]) expect(utility(name), name).toMatch(/font-size: clamp\(/)
    const max = (name: string) => parseFloat(utility(name)!.match(/clamp\([^,]+,[^,]+,\s*([\d.]+)rem\)/)![1]!) * 16
    expect(max("text-display")).toBeGreaterThanOrEqual(48 * 1.25)
    expect(max("text-display")).toBeGreaterThan(max("text-display-2"))
    expect(max("text-display-2")).toBeGreaterThan(max("text-display-3"))
  })

  it("los titulares usan la fuente de titulares y text-wrap: balance", () => {
    expect(utility("text-display")).toContain("font-family: var(--font-display)")
    expect(utility("text-display")).toContain("text-wrap: balance")
  })

  it("el énfasis es color sólido o peso: nunca degradé ni background-clip", () => {
    expect(utility("emphasis-accent")).toBe(" color: var(--color-brand-ink); ")
    expect(utility("emphasis-strong")).toContain("font-weight: 700")
    expect(utility("emphasis-muted")).toContain("--color-label-secondary")
    const block = theme.slice(theme.indexOf("Marketing (opt-in"), theme.indexOf("@utility text-title-1"))
    expect(block).not.toMatch(/gradient|background-clip/)
  })

  it("el easing exponencial existe como utilidad", () => {
    expect(utility("ease-out-expo")).toContain("cubic-bezier(0.16, 1, 0.3, 1)")
  })

  it("los roles existentes no cambiaron", () => {
    expect(utility("text-large-title")).toContain("font-size: 48px")
    expect(utility("text-title-1")).toContain("font-size: 28px")
  })
})
