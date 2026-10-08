// @vitest-environment node
import { readdirSync, readFileSync } from "node:fs"
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

/**
 * La escala de iCloud web (2.0): base 17, pasos 11/12/14/15/17/19/22/32 y 48 de display (3.0: title-1 y title-2 suben para más contraste). Los roles
 * conservan el nombre de Apple para que los componentes no se renombren; cambia el valor. El
 * chrome (menús, campos, botones, metadatos) es `callout` (14), como en iCloud; `body` (17) es
 * el texto que se lee: celdas, párrafos, recordatorios.
 */
const APPLE_ROLES: Record<string, { size: number; weight: number; lineHeight: number }> = {
  "large-title": { size: 48, weight: 600, lineHeight: 52 },
  "title-1": { size: 32, weight: 600, lineHeight: 38 },
  "title-2": { size: 22, weight: 600, lineHeight: 28 },
  "title-3": { size: 19, weight: 600, lineHeight: 24 },
  headline: { size: 17, weight: 600, lineHeight: 22 },
  body: { size: 17, weight: 400, lineHeight: 22 },
  // Alias de `body` desde R1: era el cuerpo de los controles `lg` (15 px). Queda para no romper.
  "body-large": { size: 17, weight: 400, lineHeight: 22 },
  subheadline: { size: 15, weight: 400, lineHeight: 20 },
  callout: { size: 14, weight: 400, lineHeight: 18 },
  footnote: { size: 12, weight: 400, lineHeight: 16 },
  caption: { size: 11, weight: 400, lineHeight: 13 },
  "mono-body": { size: 14, weight: 400, lineHeight: 18 },
  "mono-callout": { size: 12, weight: 400, lineHeight: 16 },
}

describe("roles de Apple con la escala de iCloud (2.0)", () => {
  it("cada rol declara el tamaño, el peso y el interlineado de iCloud", () => {
    for (const [role, { size, weight, lineHeight }] of Object.entries(APPLE_ROLES)) {
      expect(utility(role), role).toEqual({ size, weight })
      const line = theme.match(new RegExp(`^@utility text-${role} \\{(.+)\\}$`, "m"))![1]!
      expect(line, role).toContain(`line-height: ${lineHeight}px`)
    }
  })

  it("solo usa pasos de la escala de iCloud", () => {
    const pasos = new Set([11, 12, 14, 15, 17, 19, 22, 32, 48])
    for (const [role, { size }] of Object.entries(APPLE_ROLES)) expect(pasos.has(size), role).toBe(true)
  })

  it("los títulos grandes llevan tracking cerrado (3.0) y los demás ninguno", () => {
    expect(theme).toMatch(/^@utility text-large-title \{.*letter-spacing: -0\.012em;.*\}$/m)
    expect(theme).toMatch(/^@utility text-title-1 \{.*letter-spacing: -0\.01em;.*\}$/m)
    expect(theme).toMatch(/^@utility text-title-2 \{.*letter-spacing: -0\.006em;.*\}$/m)
    for (const role of Object.keys(APPLE_ROLES)) {
      if (["large-title", "title-1", "title-2"].includes(role)) continue
      expect(theme.match(new RegExp(`^@utility text-${role} \\{(.+)\\}$`, "m"))![1], role).not.toContain("letter-spacing")
    }
  })

  // Un rol trae su peso: pisarlo con `font-normal` es usar un título como cuerpo. Para cuerpo a
  // 15 px está `text-body-large`.
  it("ningún componente pisa el peso de un título con font-normal", () => {
    const dirs = ["../src/components/", "../src/variants/"]
    const pisados: string[] = []
    for (const dir of dirs) {
      const url = new URL(dir, import.meta.url)
      for (const file of readdirSync(url)) {
        const source = readFileSync(new URL(file, url), "utf8")
        for (const match of source.matchAll(/\S*text-(?:large-title|title-[123])\s+\S*font-normal/g)) pisados.push(`${file}: ${match[0]}`)
      }
    }
    expect(pisados).toEqual([])
  })

  it("tailwind-merge los reconoce como tamaño de letra: un color no se come el rol", async () => {
    const { cn } = await import("../src/lib/utils.js")
    for (const role of Object.keys(APPLE_ROLES)) {
      expect(cn(`text-${role}`, "text-label-secondary")).toBe(`text-${role} text-label-secondary`)
      expect(cn("text-callout", `text-${role}`)).toBe(`text-${role}`)
    }
  })
})
