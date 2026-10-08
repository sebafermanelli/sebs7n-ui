// @vitest-environment node
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

import { contrastRatio, luminanceOfHex } from "../src/lib/contrast.js"
import { createTheme, DEFAULT_BRAND, oklchOfHex, PRESETS, themeConfigSchema } from "../src/lib/theme.js"

const css = readFileSync(join(import.meta.dirname, "../src/styles/theme.css"), "utf8")

describe("createTheme: sin configuración no escribe nada", () => {
  it("devuelve CSS vacío, sin atributos ni avisos", () => {
    const t = createTheme()
    expect(t.css).toBe("")
    expect(t.attributes).toEqual({})
    expect(t.warnings).toEqual([])
    expect(t.resolved).toMatchObject({ shape: "standard", density: "standard", surfaces: "raised", motion: "standard", contrast: "standard" })
  })

  it("los valores por defecto explícitos tampoco escriben nada", () => {
    expect(createTheme({ shape: "standard", density: "standard", surfaces: "raised", motion: "standard", contrast: "standard", neutrals: { tint: "brand", intensity: 1 }, background: { wallpaper: 1, grain: "subtle" } }).attributes).toEqual({})
  })
})

describe("createTheme: las perillas", () => {
  it("cada perilla escribe su atributo", () => {
    const t = createTheme({
      shape: "soft", density: "compact", surfaces: "flat", motion: "calm", contrast: "high",
      neutrals: { tint: "none" }, background: { grain: "strong" }, typography: { scale: "large", tracking: "tight" },
    })
    expect(t.attributes).toEqual({
      "data-shape": "soft", "data-density": "compact", "data-surface": "flat", "data-motion": "calm", "data-contrast": "high",
      "data-neutral-tint": "off", "data-grain": "strong", "data-type-scale": "large", "data-type-tracking": "tight",
    })
  })

  it("todo valor de atributo tiene su regla en theme.css", () => {
    const t = createTheme({ shape: "round", density: "comfortable", surfaces: "flat", motion: "none", contrast: "high", typography: { scale: "compact", tracking: "airy" }, background: { grain: "off" } })
    for (const [k, v] of Object.entries(t.attributes)) expect(css, `${k}="${v}"`).toContain(`[${k}="${v}"]`)
    for (const forma of ["sharp", "soft", "round"]) expect(css).toContain(`:root[data-shape="${forma}"]`)
    expect(css).toContain(':root[data-density="compact"]')
    expect(css).toContain(':root[data-density="comfortable"]')
  })

  it("la escala de forma cubre los 12 roles de radio de theme.css", () => {
    const roles = [...css.matchAll(/^ {2}--radius-([a-z-]+): \d+px;/gm)].map((m) => m[1]!).filter((r) => !["control-lg"].includes(r))
    for (const forma of ["sharp", "soft", "round"]) {
      const bloque = css.slice(css.indexOf(`:root[data-shape="${forma}"]`), css.indexOf("}", css.indexOf(`:root[data-shape="${forma}"]`)))
      for (const rol of roles) expect(bloque, `${forma}: --radius-${rol}`).toContain(`--radius-${rol}:`)
    }
  })

  it("neutros: warm y cool fijan el matiz; la intensidad baja el croma, con tope en el medido", () => {
    expect(createTheme({ neutrals: { tint: "warm" } }).variables.light["--neutral-tint-hue"]).toBe("70")
    expect(createTheme({ neutrals: { tint: "cool", intensity: 0.5 } }).variables.light).toMatchObject({ "--neutral-tint-hue": "240", "--neutral-tint-chroma": "0.005" })
    expect(createTheme({ neutrals: { intensity: 7 } }).variables.light["--neutral-tint-chroma"]).toBeUndefined()
  })

  it("fondo y tipografía", () => {
    const t = createTheme({ background: { wallpaper: 0.4 }, typography: { text: "var(--font-a)", heading: "serif" } })
    expect(t.variables.light).toMatchObject({ "--ambient": "0.4", "--font-inter": "var(--font-a)", "--font-heading": "serif" })
    expect(t.css).toContain(":root {")
    expect(t.css).toContain("--font-heading: serif;")
  })

  it("la densidad no baja con el dedo", () => {
    expect(css).toMatch(/@media \(pointer: coarse\) \{\s*:root\[data-density="compact"\] \{ --spacing: 0\.25rem; \}/)
  })
})

describe("createTheme: marca", () => {
  it("acepta hex, OKLCH y {light, dark}; escribe base y contraste", () => {
    const t = createTheme({ brand: "#0a6c74" })
    expect(t.variables.light["--brand-base"]).toMatch(/^oklch\(/)
    expect(t.variables.light["--brand-contrast"]).toMatch(/^#(fff|ffffff|000|000000)$/)
    expect(t.variables.dark["--brand-base-dark"]).toMatch(/^oklch\(/)
    expect(createTheme({ brand: [...DEFAULT_BRAND] as [number, number, number] }).warnings).toEqual([])
    expect(createTheme({ brand: { light: "#0a6c74", dark: "#4fd1d9" } }).variables.dark["--brand-base-dark"]).toMatch(/^oklch\(0\.79/)
  })

  it("el texto sobre el acento es blanco o negro y siempre llega a 4,5:1 (el mejor de los dos nunca baja de 4,58)", () => {
    const amarillo = createTheme({ brand: "#ffd400" })
    expect(amarillo.variables.light["--brand-contrast"]).toBe("#000000")
    expect(createTheme({ brand: "#0a3a8a" }).variables.light["--brand-contrast"]).toBe("#ffffff")
    // Un gris medio: ninguno de los dos extremos es cómodo, pero uno llega.
    const gris = createTheme({ brand: "#777777" })
    expect(["#ffffff", "#000000"]).toContain(gris.variables.light["--brand-contrast"])
  })

  it("una grilla de marcas (5 luminosidades × 6 matices) llega a AA como texto y sobre su tinte, claro y oscuro: sin avisos de contraste", () => {
    for (const l of [0.35, 0.5, 0.6, 0.7, 0.8])
      for (const h of [25, 90, 150, 200, 258, 330]) {
        const avisos = createTheme({ brand: [l, 0.15, h] }).warnings.filter((w) => !w.includes("matiz"))
        expect(avisos, `L${l} h${h}`).toEqual([])
      }
  })

  it("avisa cuando la marca se parece a un color semántico (los roles no se tocan)", () => {
    expect(createTheme({ brand: "#d6293a" }).warnings.some((w) => w.includes("peligro"))).toBe(true)
    expect(createTheme({ brand: "#1e9a4a" }).warnings.some((w) => w.includes("éxito"))).toBe(true)
    expect(createTheme({ brand: "#d6293a" }).css).not.toMatch(/--color-(danger|success|warning|info)/)
  })

  it("oklchOfHex es la inversa de hexOfOklch", () => {
    const [l, c, h] = oklchOfHex("#0a6c74")
    expect(l).toBeGreaterThan(0.4)
    expect(l).toBeLessThan(0.6)
    expect(c).toBeGreaterThan(0.05)
    expect(h).toBeGreaterThan(180)
    expect(() => oklchOfHex("azul")).toThrow(/no es un color/)
  })
})

describe("JSON schema", () => {
  it("tokens/theme-config.schema.json es el schema exportado", () => {
    const archivo = JSON.parse(readFileSync(join(import.meta.dirname, "../tokens/theme-config.schema.json"), "utf8"))
    expect(archivo).toEqual(JSON.parse(JSON.stringify(themeConfigSchema)))
  })

  it("todos los presets cumplen el schema (propiedades y enums conocidos)", () => {
    const props = themeConfigSchema.properties as Record<string, { enum?: readonly string[] }>
    for (const preset of Object.values(PRESETS)) {
      for (const key of Object.keys(preset.config)) expect(Object.keys(props), `${preset.id}.${key}`).toContain(key)
      for (const key of ["shape", "density", "surfaces", "motion", "contrast"] as const) {
        const v = preset.config[key]
        if (v) expect(props[key]!.enum, `${preset.id}.${key}`).toContain(v)
      }
    }
  })

  it("el texto de contraste de blanco sobre el acento por defecto llega a 4,5:1", () => {
    expect(contrastRatio(luminanceOfHex("#ffffff"), luminanceOfHex("#0071e3"))).toBeGreaterThan(4)
  })
})
