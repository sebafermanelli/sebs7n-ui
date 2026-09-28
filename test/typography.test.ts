// @vitest-environment node
import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

import { TYPE_SCALE } from "../src/lib/utils.js"

const theme = readFileSync(fileURLToPath(new URL("../src/styles/theme.css", import.meta.url)), "utf8")

/** `font-size`/`font-weight` declarados por una utilidad `text-*` de theme.css. */
function utility(name: string): { size: number; weight: number } {
  const line = theme.match(new RegExp(`^@utility text-${name} \\{(.+)\\}$`, "m"))?.[1]
  if (!line) throw new Error(`falta @utility text-${name} en theme.css`)
  const size = line.match(/font-size: (\d+)px/)?.[1]
  const weight = line.match(/font-weight: (\d+)/)?.[1]
  if (!size || !weight) throw new Error(`text-${name} sin font-size o font-weight`)
  return { size: Number(size), weight: Number(weight) }
}

/**
 * Corrección óptica: el peso baja a medida que sube el cuerpo, porque el mismo
 * 600 se lee más grueso a 64px que a 14px. Los números salen de medir
 * vercel.com el 2026-09-22 (ver el comentario en theme.css). El test existe
 * porque es la clase de cosa que se revierte sin querer al tocar la escala:
 * nada visual falla, los títulos vuelven a verse plomizos y nadie se entera.
 */
const HEADING_WEIGHTS: Record<number, number> = {
  72: 400,
  64: 400,
  56: 450,
  48: 450,
  40: 450,
  32: 500,
  24: 500,
  20: 550,
  16: 600,
  14: 600,
}

describe("escala tipográfica", () => {
  it("cada paso de heading emite su peso corregido ópticamente", () => {
    for (const [size, weight] of Object.entries(HEADING_WEIGHTS)) {
      expect(utility(`heading-${size}`), `heading-${size}`).toEqual({ size: Number(size), weight })
    }
  })

  it("el peso de los headings nunca sube con el tamaño", () => {
    const bySize = Object.keys(HEADING_WEIGHTS)
      .map(Number)
      .sort((a, b) => a - b)
    let previous = Number.POSITIVE_INFINITY
    for (const size of bySize) {
      const { weight } = utility(`heading-${size}`)
      expect(weight, `heading-${size}`).toBeLessThanOrEqual(previous)
      previous = weight
    }
  })

  it("button sigue en 500 y label/copy en 400: la corrección es solo de títulos", () => {
    // Solo los pasos de Geist: los roles de macOS (2.0) tienen su propia regla de peso,
    // cubierta por el describe "roles de Apple" más abajo.
    for (const step of TYPE_SCALE) {
      if (!step.startsWith("button-") && !step.startsWith("label-") && !step.startsWith("copy-")) continue
      const expected = step.startsWith("button-") ? 500 : 400
      expect(utility(step).weight, step).toBe(expected)
    }
  })

  it("TYPE_SCALE y theme.css nombran los mismos pasos", () => {
    const inCss = [...theme.matchAll(/^@utility text-([\w-]+) \{/gm)].map((match) => match[1])
    expect([...inCss].sort()).toEqual([...TYPE_SCALE].sort())
  })
})

describe("fuente", () => {
  it("la sans es Inter en todos los sistemas, con system-ui solo como respaldo", () => {
    expect(theme).toMatch(/--font-sans: var\(--font-inter\), "Inter Variable", "Inter", ui-sans-serif, system-ui, sans-serif;/)
  })

  it("la mono es la del sistema: 0 KB y en código la diferencia no molesta", () => {
    expect(theme).toMatch(/--font-mono: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;/)
  })
})

const APPLE_ROLES: Record<string, { size: number; weight: number }> = {
  "large-title": { size: 26, weight: 700 },
  "title-1": { size: 22, weight: 700 },
  "title-2": { size: 17, weight: 600 },
  "title-3": { size: 15, weight: 600 },
  headline: { size: 13, weight: 600 },
  body: { size: 13, weight: 400 },
  callout: { size: 12, weight: 400 },
  subheadline: { size: 11, weight: 400 },
  footnote: { size: 10, weight: 400 },
  caption: { size: 10, weight: 500 },
  "mono-body": { size: 13, weight: 400 },
  "mono-callout": { size: 12, weight: 400 },
}

describe("roles de Apple (2.0)", () => {
  it("cada rol declara el tamaño y el peso de macOS", () => {
    for (const [role, expected] of Object.entries(APPLE_ROLES)) {
      expect(utility(role), role).toEqual(expected)
    }
  })

  it("tailwind-merge los reconoce como tamaño de letra: un color no se come el rol", async () => {
    const { cn } = await import("../src/lib/utils.js")
    for (const role of Object.keys(APPLE_ROLES)) {
      expect(cn(`text-${role}`, "text-gray-900")).toBe(`text-${role} text-gray-900`)
      expect(cn("text-callout", `text-${role}`)).toBe(`text-${role}`)
    }
  })
})
