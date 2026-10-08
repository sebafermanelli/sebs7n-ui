/**
 * El motor de tema (3.0): una configuración tipada → el CSS y los atributos que la aplican. Pura, sin dependencias, sin `"use client"` y
 * sin JavaScript en runtime: corre en un Server Component, en un script de build o en el navegador, y lo que devuelve es CSS y `data-*`.
 *
 * ```ts
 * import { createTheme, PRESETS } from "sebs7n-ui/lib/theme"
 *
 * const theme = createTheme({ brand: "#0a6c74", shape: "soft", density: "comfortable", neutrals: { tint: "cool" } })
 * theme.css          // «:root { --brand-base: oklch(…); … }» → al globals.css, después del @import del paquete
 * theme.attributes   // { "data-shape": "soft", "data-density": "comfortable", … } → a <html>
 * theme.warnings     // lo que no llega a AA o se parece a un color semántico
 * createTheme(PRESETS["clinico-calmo"].config)   // un preset por industria
 * ```
 *
 * Las perillas son nueve —marca, forma, densidad, neutros, superficies, fondo, tipografía, movimiento y contraste— y cada una vive en
 * `theme.css` como un atributo `data-*` o una variable sobre los tokens de siempre. **Sin configuración, `createTheme()` no escribe nada**:
 * es el «cálido y cuidado» por defecto. El tipo es `ThemeConfig` y el JSON schema, `themeConfigSchema` (también en
 * `tokens/theme-config.schema.json`), para validar una configuración que viene de afuera.
 *
 * Los colores semánticos (éxito, aviso, peligro, información) **no salen de la marca**: ninguna configuración los cambia. Si la marca cae
 * cerca de un matiz semántico, `warnings` lo avisa.
 */
import { composite, contrastRatio, hexOfOklch, luminanceOfHex, luminanceOfOklch, type Oklch } from "./contrast.js"

export type ThemeBrand =
  | string
  | Oklch
  | {
      /** El color base en claro: `#rrggbb` u OKLCH `[L, C, H]`. De acá salen los diez pasos, el texto de contraste y los estados. */
      light: string | Oklch
      /** El de oscuro. Sin valor se deriva del de claro (más claro, con su propio texto de contraste). */
      dark?: string | Oklch
    }

export type ThemeConfig = {
  /** Un nombre para el tema (no cambia nada: es para el JSON que se exporta). */
  name?: string
  /** El color de marca. Sin valor, el azul del paquete. */
  brand?: ThemeBrand
  /** `sharp` (casi recta) · `standard` (la de iCloud, radios 8 a 12) · `soft` · `round`. Una escala que gobierna los 12 roles de radio. */
  shape?: "sharp" | "standard" | "soft" | "round"
  /** `compact` · `standard` · `comfortable`: alturas, paddings y huecos (`--spacing`). Con el dedo no baja de 44 px. */
  density?: "compact" | "standard" | "comfortable"
  neutrals?: {
    /** `none` (grises de iCloud) · `brand` (tinte del matiz de marca, el default) · `warm` · `cool`. */
    tint?: "none" | "brand" | "warm" | "cool"
    /** De 0 a 1: 1 es el tope medido (croma 0,01). Default 1. */
    intensity?: number
  }
  /** `flat` (filo de 1 px, sin sombra) · `raised` (sombras chicas en capas, el default) · `translucent` (raised + el wallpaper de la app). */
  surfaces?: "flat" | "raised" | "translucent"
  background?: {
    /** Cuánto color lleva el wallpaper de `AppShell ambient`: de 0 (liso) a 1. Default 1. */
    wallpaper?: number
    /** `off` · `subtle` (default) · `strong`. */
    grain?: "off" | "subtle" | "strong"
  }
  typography?: {
    /** La `font-family` del texto (una lista CSS). La app carga la fuente; acá se la nombra (`"var(--font-source)"`). Sin valor, Inter. */
    text?: string
    /** La `font-family` de los titulares (`font-display`). Sin valor, la del texto. */
    heading?: string
    /** `compact` · `standard` · `large`: el tamaño de los titulares (±8 %). */
    scale?: "compact" | "standard" | "large"
    /** `tight` · `standard` · `airy`: el tracking de los titulares. */
    tracking?: "tight" | "standard" | "airy"
  }
  /** `calm` (transiciones largas) · `standard` · `none` (sin movimiento, aunque el sistema no lo pida). */
  motion?: "calm" | "standard" | "none"
  /** `standard` · `high` (filetes, rellenos y texto tenue más fuertes; apaga el grano). */
  contrast?: "standard" | "high"
}

export type Theme = {
  /** El CSS para el `globals.css` (después de `@import "sebs7n-ui/theme.css"`). Vacío si no hay nada que pisar. */
  css: string
  /** Los atributos para `<html>`: `<html {...theme.attributes}>`. */
  attributes: Record<string, string>
  /** Las variables CSS, por tema. */
  variables: { light: Record<string, string>; dark: Record<string, string> }
  /** Lo que no llega a AA o se parece a un color semántico. Vacío = nada que avisar. */
  warnings: string[]
  /** La configuración con los defaults resueltos: es lo que se exporta como JSON. */
  resolved: Required<Pick<ThemeConfig, "shape" | "density" | "surfaces" | "motion" | "contrast">> & ThemeConfig
}

/** El azul del paquete (`--brand-base` de `theme.css`). */
export const DEFAULT_BRAND: Oklch = [0.573, 0.214, 258]

const WHITE = "#ffffff"
const BLACK = "#000000"
/** Las páginas contra las que se mide el acento como texto. */
const PAGE = { light: "#ffffff", dark: "#1c1c1e" } as const

/* ── color ───────────────────────────────────────────────────────────────────────────────────── */

const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)

/** Un `#rgb` o `#rrggbb` en OKLCH. */
export function oklchOfHex(hex: string): Oklch {
  let n = hex.replace("#", "")
  if (n.length === 3) n = [...n].map((d) => d + d).join("")
  if (!/^[0-9a-f]{6}$/i.test(n)) throw new Error(`createTheme: «${hex}» no es un color #rgb o #rrggbb`)
  const [r, g, b] = [0, 2, 4].map((i) => toLinear(parseInt(n.slice(i, i + 2), 16) / 255)) as [number, number, number]
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s
  const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s
  const bb = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s
  const C = Math.hypot(a, bb)
  const h = ((Math.atan2(bb, a) * 180) / Math.PI + 360) % 360
  return [L, C < 1e-4 ? 0 : C, h]
}

const asOklch = (color: string | Oklch): Oklch => (typeof color === "string" ? oklchOfHex(color) : color)
const cssOklch = ([l, c, h]: Oklch) => `oklch(${+l.toFixed(3)} ${+c.toFixed(3)} ${+h.toFixed(1)})`
const ratio = (a: string, b: string) => contrastRatio(luminanceOfHex(a), luminanceOfHex(b))

/** El 60 % de `-900` y el 40 % de `-1000` del acento (la `brand-ink` de `theme.css`), con las L y los k de cada tema. */
function brandInk([, c, h]: Oklch, tema: "light" | "dark"): string {
  const [l9, k9, l10, k10] = tema === "light" ? [0.535, 0.945, 0.269, 0.433] : [0.717, 0.705, 0.968, 0.077]
  const a = hexOfOklch([l9, c * k9, h])
  const b = hexOfOklch([l10, c * k10, h])
  const ch = (x: string, i: number) => parseInt(x.slice(1 + i, 3 + i), 16)
  return `#${[0, 2, 4].map((i) => Math.round(ch(a, i) * 0.6 + ch(b, i) * 0.4).toString(16).padStart(2, "0")).join("")}`
}

/**
 * Elige el texto que va sobre el acento (blanco o negro) y, si ninguno llega a 4,5:1, mueve la luminosidad del acento de a 0,005 hacia
 * el lado que más rápido lo consigue. Devuelve el color final, el texto y si hubo que moverlo.
 */
function fitBrand(color: Oklch): { color: Oklch; contrast: string; moved: boolean } {
  const test = (c: Oklch) => {
    const lum = luminanceOfOklch(c)
    const conBlanco = contrastRatio(lum, luminanceOfHex(WHITE))
    const conNegro = contrastRatio(lum, luminanceOfHex(BLACK))
    return conBlanco >= conNegro ? { texto: WHITE, ratio: conBlanco } : { texto: BLACK, ratio: conNegro }
  }
  const first = test(color)
  if (first.ratio >= 4.5) return { color, contrast: first.texto, moved: false }
  // El lado más corto: si con blanco falta poco, se oscurece; si con negro, se aclara. Siempre termina: L = 0 da 21:1 con blanco.
  let best: { color: Oklch; texto: string } | null = null
  for (let paso = 1; paso <= 160 && !best; paso++) {
    for (const dir of [-1, 1]) {
      const l = Math.min(1, Math.max(0, color[0] + dir * paso * 0.005))
      const probe: Oklch = [l, color[1], color[2]]
      const t = test(probe)
      if (t.ratio >= 4.5) {
        best = { color: probe, texto: t.texto }
        break
      }
    }
  }
  return { color: best?.color ?? color, contrast: best?.texto ?? first.texto, moved: true }
}

/** El de oscuro cuando la marca no lo declara: el mismo matiz y croma, más claro (L ≥ 0,6) para que el acento se vea sobre #1C1C1E. */
const deriveDark = ([l, c, h]: Oklch): Oklch => [Math.min(0.78, Math.max(0.6, l)), c, h]

/* ── las perillas ────────────────────────────────────────────────────────────────────────────── */

const NEUTRAL_HUE = { warm: 70, cool: 240 } as const
const MAX_TINT_CHROMA = 0.01
const SEMANTIC_HUES = [
  { name: "peligro (rojo)", hue: 25 },
  { name: "éxito (verde)", hue: 150 },
  { name: "aviso (ámbar)", hue: 80 },
] as const

const hueDistance = (a: number, b: number) => Math.min(Math.abs(a - b) % 360, 360 - (Math.abs(a - b) % 360))

export function createTheme(config: ThemeConfig = {}): Theme {
  const warnings: string[] = []
  const light: Record<string, string> = {}
  const dark: Record<string, string> = {}
  const attributes: Record<string, string> = {}

  // Marca
  if (config.brand != null) {
    const brand = typeof config.brand === "string" || Array.isArray(config.brand) ? { light: config.brand as string | Oklch } : (config.brand as { light: string | Oklch; dark?: string | Oklch })
    const claro = asOklch(brand.light)
    const fitL = fitBrand(claro)
    if (fitL.moved) warnings.push(`marca (claro): ${cssOklch(claro)} no llega a 4,5:1 con texto blanco ni negro; se movió a ${cssOklch(fitL.color)}`)
    const oscuro = brand.dark != null ? asOklch(brand.dark) : deriveDark(fitL.color)
    const fitD = fitBrand(oscuro)
    if (fitD.moved) warnings.push(`marca (oscuro): ${cssOklch(oscuro)} no llega a 4,5:1 con texto blanco ni negro; se movió a ${cssOklch(fitD.color)}`)
    light["--brand-base"] = cssOklch(fitL.color)
    light["--brand-contrast"] = fitL.contrast
    dark["--brand-base-dark"] = cssOklch(fitD.color)
    dark["--brand-contrast-dark"] = fitD.contrast
    // El acento como texto (`brand-ink`) sobre la página y sobre su propio tinte al 12 %: lo que `Button plain`, los links y el Badge suave dicen.
    for (const [tema, color, contrast] of [["light", fitL.color, fitL.contrast], ["dark", fitD.color, fitD.contrast]] as const) {
      void contrast
      const tinta = brandInk(color, tema)
      const pagina = PAGE[tema]
      const tinte = composite(hexOfOklch(color), 0.12, pagina)
      const sobrePagina = ratio(tinta, pagina)
      const sobreTinte = ratio(tinta, tinte)
      if (sobrePagina < 4.5) warnings.push(`marca (${tema}): el acento como texto llega a ${sobrePagina.toFixed(2)}:1 sobre la página (pide 4,5:1)`)
      if (sobreTinte < 4.5) warnings.push(`marca (${tema}): el acento sobre su tinte (Badge suave) llega a ${sobreTinte.toFixed(2)}:1 (pide 4,5:1)`)
    }
    // Un acento verde o rojo no cambia lo que significa un estado, pero conviene que no se confunda con uno.
    const [, c, h] = fitL.color
    if (c > 0.06) {
      for (const sem of SEMANTIC_HUES) {
        if (hueDistance(h, sem.hue) < 25)
          warnings.push(`marca: el matiz ${Math.round(h)}° está a menos de 25° de ${sem.name}; los roles semánticos siguen en sus colores fijos, pero evitá el acento para decir un estado`)
      }
    }
  }

  // Forma, densidad, superficies, movimiento, contraste: un atributo cada una (sin el atributo, el default).
  if (config.shape && config.shape !== "standard") attributes["data-shape"] = config.shape
  if (config.density && config.density !== "standard") attributes["data-density"] = config.density
  if (config.surfaces === "flat") attributes["data-surface"] = "flat"
  if (config.surfaces === "translucent") attributes["data-surface"] = "translucent"
  if (config.motion && config.motion !== "standard") attributes["data-motion"] = config.motion
  if (config.contrast === "high") attributes["data-contrast"] = "high"

  // Neutros
  const tint = config.neutrals?.tint
  if (tint === "none") attributes["data-neutral-tint"] = "off"
  if (tint === "warm" || tint === "cool") light["--neutral-tint-hue"] = String(NEUTRAL_HUE[tint])
  if (config.neutrals?.intensity != null) {
    const i = Math.min(1, Math.max(0, config.neutrals.intensity))
    if (i !== 1) light["--neutral-tint-chroma"] = String(+(MAX_TINT_CHROMA * i).toFixed(4))
  }

  // Fondo
  if (config.background?.wallpaper != null && config.background.wallpaper !== 1) light["--ambient"] = String(Math.min(1, Math.max(0, config.background.wallpaper)))
  const grain = config.background?.grain
  if (grain === "off" || grain === "strong") attributes["data-grain"] = grain

  // Tipografía
  if (config.typography?.text) light["--font-inter"] = config.typography.text
  if (config.typography?.heading) light["--font-heading"] = config.typography.heading
  if (config.typography?.scale && config.typography.scale !== "standard") attributes["data-type-scale"] = config.typography.scale
  if (config.typography?.tracking && config.typography.tracking !== "standard") attributes["data-type-tracking"] = config.typography.tracking

  const css = [block(":root", light), block(".dark", dark)].filter(Boolean).join("\n\n")
  const resolved = {
    ...config,
    shape: config.shape ?? "standard",
    density: config.density ?? "standard",
    surfaces: config.surfaces ?? "raised",
    motion: config.motion ?? "standard",
    contrast: config.contrast ?? "standard",
  }
  return { css, attributes, variables: { light, dark }, warnings, resolved }
}

function block(selector: string, vars: Record<string, string>): string {
  const entries = Object.entries(vars)
  if (!entries.length) return ""
  const width = Math.max(...entries.map(([k]) => k.length))
  return [`${selector} {`, ...entries.map(([k, v]) => `  ${`${k}:`.padEnd(width + 1)} ${v};`), "}"].join("\n")
}

/* ── presets por industria ───────────────────────────────────────────────────────────────────── */

export type ThemePreset = { id: string; name: string; industry: string; description: string; config: ThemeConfig }

const SERIF = 'ui-serif, Georgia, Cambria, "Times New Roman", serif'

/**
 * Cinco temas de partida por industria, más el default. Cada uno se mide: `test/theme-presets.test.ts` exige que `createTheme` no avise
 * nada (el acento llega a AA como texto y sobre su tinte, en claro y oscuro) y que los neutros con su matiz no bajen el texto de AA.
 */
export const PRESETS: Record<string, ThemePreset> = {
  calido: {
    id: "calido",
    name: "Cálido y cuidado",
    industry: "El default",
    description: "El lenguaje de iCloud con neutros tintados por la marca, sombras chicas y titulares con carácter.",
    config: {},
  },
  "sobrio-profesional": {
    id: "sobrio-profesional",
    name: "Sobrio profesional",
    industry: "Legal y finanzas",
    description: "Acento azul profundo, esquinas casi rectas, superficies planas y titulares con serif: seriedad sin frialdad.",
    config: {
      brand: { light: [0.4, 0.12, 255], dark: [0.68, 0.11, 255] },
      shape: "sharp",
      surfaces: "flat",
      neutrals: { tint: "brand", intensity: 0.6 },
      typography: { heading: SERIF, tracking: "tight" },
    },
  },
  "clinico-calmo": {
    id: "clinico-calmo",
    name: "Clínico y calmo",
    industry: "Salud",
    description: "Verde azulado sereno, esquinas suaves, aire de más, neutros fríos y movimiento lento.",
    config: {
      brand: { light: [0.5, 0.1, 195], dark: [0.72, 0.1, 195] },
      shape: "soft",
      density: "comfortable",
      neutrals: { tint: "cool" },
      motion: "calm",
      background: { wallpaper: 0.5, grain: "off" },
    },
  },
  "denso-operativo": {
    id: "denso-operativo",
    name: "Denso operativo",
    industry: "Logística y back-office",
    description: "Para quien pasa el día en tablas: densidad compacta, esquinas rectas, sin sombras ni grano y grises neutros.",
    config: {
      brand: { light: [0.5, 0.13, 258], dark: [0.7, 0.12, 258] },
      shape: "sharp",
      density: "compact",
      surfaces: "flat",
      neutrals: { tint: "none" },
      background: { wallpaper: 0, grain: "off" },
      typography: { scale: "compact" },
    },
  },
  editorial: {
    id: "editorial",
    name: "Editorial",
    industry: "Medios",
    description: "Acento casi negro, titulares grandes con serif y tracking cerrado, neutros cálidos y superficies planas.",
    config: {
      brand: { light: [0.32, 0.04, 265], dark: [0.8, 0.03, 265] },
      shape: "sharp",
      surfaces: "flat",
      neutrals: { tint: "warm" },
      background: { wallpaper: 0, grain: "subtle" },
      typography: { heading: SERIF, scale: "large", tracking: "tight" },
    },
  },
  "calido-consumo": {
    id: "calido-consumo",
    name: "Cálido de consumo",
    industry: "Turismo y comercio",
    description: "Acento ámbar tostado, esquinas redondas, aire generoso, neutros cálidos y un grano suave en el fondo.",
    config: {
      brand: { light: [0.55, 0.14, 55], dark: [0.74, 0.13, 55] },
      shape: "round",
      density: "comfortable",
      neutrals: { tint: "warm" },
      background: { wallpaper: 1, grain: "subtle" },
    },
  },
}

/* ── JSON schema ─────────────────────────────────────────────────────────────────────────────── */

const color = { oneOf: [{ type: "string", pattern: "^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$" }, { type: "array", items: { type: "number" }, minItems: 3, maxItems: 3 }] }

/** El JSON schema (2020-12) de `ThemeConfig`: para validar una configuración que viene de un archivo o de un formulario. */
export const themeConfigSchema = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://ui.sebastianfermanelli.com/schemas/theme-config.json",
  title: "ThemeConfig",
  description: "La configuración de createTheme() de sebs7n-ui.",
  type: "object",
  additionalProperties: false,
  properties: {
    name: { type: "string" },
    brand: {
      description: "El color base (#rrggbb o [L, C, H] en OKLCH), o { light, dark? }.",
      oneOf: [color, { type: "object", required: ["light"], additionalProperties: false, properties: { light: color, dark: color } }],
    },
    shape: { enum: ["sharp", "standard", "soft", "round"] },
    density: { enum: ["compact", "standard", "comfortable"] },
    neutrals: {
      type: "object",
      additionalProperties: false,
      properties: { tint: { enum: ["none", "brand", "warm", "cool"] }, intensity: { type: "number", minimum: 0, maximum: 1 } },
    },
    surfaces: { enum: ["flat", "raised", "translucent"] },
    background: {
      type: "object",
      additionalProperties: false,
      properties: { wallpaper: { type: "number", minimum: 0, maximum: 1 }, grain: { enum: ["off", "subtle", "strong"] } },
    },
    typography: {
      type: "object",
      additionalProperties: false,
      properties: {
        text: { type: "string" },
        heading: { type: "string" },
        scale: { enum: ["compact", "standard", "large"] },
        tracking: { enum: ["tight", "standard", "airy"] },
      },
    },
    motion: { enum: ["calm", "standard", "none"] },
    contrast: { enum: ["standard", "high"] },
  },
} as const
