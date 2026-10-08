"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react"

import { cssOfOklch, oklchOfHex as oklchOfHexLocal, textoSobre, type Oklch } from "../_lib/color"
import { createTheme, PRESETS, type ThemeConfig } from "sebs7n-ui/lib/theme"

import { ambientGuardado, CONFIG_VERSION, luzGuardada } from "../_lib/wallpaper"

/**
 * La configuración del material que el visitante arma en el Playground.
 *
 * Vive arriba de todo el sitio y no adentro de la página del Playground por una razón: lo que
 * alguien quiere después de elegir su color es **ver los 60 componentes así**, no
 * una pantalla de muestra. Se guarda en `localStorage` y se aplica a `<html>`, así que navegar
 * a Button o a Dialog los muestra con la misma configuración.
 *
 * Se escribe como estilo inline de `<html>` porque es el mismo lugar donde una app pone sus
 * variables (`:root`): lo que se ve acá es exactamente lo que va a dar el CSS que se copia.
 */
export type GlassConfig = {
  /** `null` = el brand del sitio, sin pisar. */
  brand: Oklch | null
  brandDark: Oklch | null
  /**
   * El wallpaper del Playground (`AppShell ambient`). Arranca prendido (W): es la home de iCloud.
   * Las otras páginas de docs son opacas siempre, y la home lo lleva siempre (`_lib/wallpaper.ts`).
   */
  ambient: boolean
  /** `--ambient`: cuánto color lleva el wallpaper, de 0 a 1. */
  luz: number
  /** Neutros con tinte de marca (el default de 3.0). `false` = `data-neutral-tint="off"` en `<html>`. */
  tint: boolean
  /** Grano de fondo: `off` · `subtle` (default, sin atributo) · `strong` (`data-grain="strong"` en `<html>`). */
  grain: "off" | "subtle" | "strong"
  /** La fuente de titulares: `inter` (la sans, sin `--font-heading`) o una serif de ejemplo cargada en `--font-heading`. */
  heading: "inter" | "serif"
  /** Las perillas del motor de tema (`sebs7n-ui/lib/theme`): forma, densidad, neutros, superficies, movimiento y contraste. */
  shape: NonNullable<ThemeConfig["shape"]>
  density: NonNullable<ThemeConfig["density"]>
  surfaces: NonNullable<ThemeConfig["surfaces"]>
  motion: NonNullable<ThemeConfig["motion"]>
  contrast: NonNullable<ThemeConfig["contrast"]>
  /** `brand` (el default) · `warm` · `cool` · `none`, con su intensidad de 0 a 1. `tint: false` es `none`. */
  neutralsKind: NonNullable<NonNullable<ThemeConfig["neutrals"]>["tint"]>
  neutralsIntensity: number
  typeScale: NonNullable<NonNullable<ThemeConfig["typography"]>["scale"]>
  typeTracking: NonNullable<NonNullable<ThemeConfig["typography"]>["tracking"]>
  /** El preset por industria elegido (`PRESETS`), solo para mostrarlo: lo que vale son los campos de arriba. */
  preset: string | null
  /** Los últimos colores de marca probados. No van al CSS: son la memoria del selector. */
  recientes: Oklch[]
}

export const DEFAULTS: GlassConfig = { brand: null, brandDark: null, ambient: true, luz: 1, tint: true, grain: "subtle", heading: "inter", shape: "standard", density: "standard", surfaces: "raised", motion: "standard", contrast: "standard", neutralsKind: "brand", neutralsIntensity: 1, typeScale: "standard", typeTracking: "standard", preset: null, recientes: [] }

const CLAVE = "sebs7n-ui:playground"

type Contexto = {
  config: GlassConfig
  set: (cambios: Partial<GlassConfig>) => void
  reset: () => void
  esDefault: boolean
}

const GlassConfigContext = createContext<Contexto | null>(null)

/** La serif de ejemplo (Bitter, cargada en el layout del sitio con `--font-serif-demo`). */
export const SERIF_DE_EJEMPLO = "var(--font-serif-demo)"

/** Las variables que se ESCRIBEN en `<html>`: las del CSS que se copia y, además, `--font-heading` si hay serif. */
export function variablesAplicadas(config: GlassConfig): Record<string, string> {
  const salida = variables(config)
  if (config.heading === "serif") salida["--font-heading"] = SERIF_DE_EJEMPLO
  return salida
}

/** Las variables que la configuración pisa en el CSS que se copia (la fuente va en el layout, con `next/font`). Lo que está en su default no aparece. */
export function variables(config: GlassConfig): Record<string, string> {
  const salida: Record<string, string> = {}
  if (config.brand) {
    salida["--brand-base"] = cssOfOklch(config.brand)
    salida["--brand-contrast"] = textoSobre(config.brand).hex
  }
  // Sin un brand propio para oscuro, el oscuro usa el de claro: es lo que hace el paquete
  // (`--brand-base-dark: var(--brand-base)`), pero el sitio lo pisa en su globals.css y por eso
  // acá hay que escribirlo.
  const oscuro = config.brandDark ?? config.brand
  if (oscuro) {
    salida["--brand-base-dark"] = cssOfOklch(oscuro)
    salida["--brand-contrast-dark"] = textoSobre(oscuro).hex
  }
  if (config.ambient && config.luz !== DEFAULTS.luz) salida["--ambient"] = String(config.luz)
  // Lo demás lo calcula el motor de tema (matiz e intensidad de los neutros; la marca ya está acá con el veredicto del sitio).
  const motor = createTheme({ ...toThemeConfig(config), brand: undefined }).variables.light
  for (const nombre of ["--neutral-tint-hue", "--neutral-tint-chroma"]) if (motor[nombre]) salida[nombre] = motor[nombre]!
  return salida
}

/** Los atributos `data-*` que escribe el motor de tema: se limpian todos antes de poner los de la configuración. */
export const ATRIBUTOS_DEL_TEMA = ["data-shape", "data-density", "data-surface", "data-motion", "data-contrast", "data-neutral-tint", "data-grain", "data-type-scale", "data-type-tracking"]

/** La configuración del Playground como `ThemeConfig` (lo que `createTheme` entiende y lo que se exporta como JSON). */
export function toThemeConfig(parcial: Partial<GlassConfig>): ThemeConfig {
  const c = { ...DEFAULTS, ...parcial }
  const out: ThemeConfig = {}
  if (c.brand || c.brandDark) out.brand = { light: (c.brand ?? c.brandDark) as Oklch, ...(c.brandDark ? { dark: c.brandDark } : {}) }
  if (c.shape !== "standard") out.shape = c.shape
  if (c.density !== "standard") out.density = c.density
  if (c.surfaces !== "raised") out.surfaces = c.surfaces
  if (c.motion !== "standard") out.motion = c.motion
  if (c.contrast !== "standard") out.contrast = c.contrast
  const tint = c.tint ? c.neutralsKind : "none"
  if (tint !== "brand" || c.neutralsIntensity !== 1) out.neutrals = { tint, ...(c.neutralsIntensity !== 1 ? { intensity: c.neutralsIntensity } : {}) }
  const background: NonNullable<ThemeConfig["background"]> = {}
  if (c.ambient && c.luz !== 1) background.wallpaper = c.luz
  if (!c.ambient) background.wallpaper = 0
  if (c.grain !== "subtle") background.grain = c.grain
  if (Object.keys(background).length) out.background = background
  const typography: NonNullable<ThemeConfig["typography"]> = {}
  if (c.typeScale !== "standard") typography.scale = c.typeScale
  if (c.typeTracking !== "standard") typography.tracking = c.typeTracking
  if (Object.keys(typography).length) out.typography = typography
  return out
}

/** Un preset del motor de tema como campos del Playground (lo que no declara vuelve a su default). */
export function desdePreset(id: string): Partial<GlassConfig> {
  const preset = PRESETS[id]
  if (!preset) return {}
  const t = preset.config
  const brand = t.brand == null ? null : typeof t.brand === "string" ? oklchDe(t.brand) : Array.isArray(t.brand) ? (t.brand as unknown as Oklch) : oklchDe((t.brand as { light: string | Oklch }).light)
  const brandDark = t.brand != null && typeof t.brand === "object" && !Array.isArray(t.brand) && "dark" in t.brand && t.brand.dark != null ? oklchDe(t.brand.dark) : null
  return {
    preset: id,
    brand,
    brandDark,
    shape: t.shape ?? "standard",
    density: t.density ?? "standard",
    surfaces: t.surfaces ?? "raised",
    motion: t.motion ?? "standard",
    contrast: t.contrast ?? "standard",
    tint: t.neutrals?.tint !== "none",
    neutralsKind: t.neutrals?.tint && t.neutrals.tint !== "none" ? t.neutrals.tint : "brand",
    neutralsIntensity: t.neutrals?.intensity ?? 1,
    ambient: (t.background?.wallpaper ?? 1) > 0,
    luz: t.background?.wallpaper && t.background.wallpaper > 0 ? t.background.wallpaper : 1,
    grain: t.background?.grain ?? "subtle",
    heading: "inter",
    typeScale: t.typography?.scale ?? "standard",
    typeTracking: t.typography?.tracking ?? "standard",
  }
}

const oklchDe = (color: string | Oklch): Oklch => (typeof color === "string" ? oklchOfHexLocal(color) : color)

const TODAS = [
  "--font-heading",
  "--neutral-tint-hue",
  "--neutral-tint-chroma",
  "--brand-base",
  "--brand-contrast",
  "--brand-base-dark",
  "--brand-contrast-dark",
  "--ambient",
  // Las de 1.x: se limpian por si quedaron escritas en `<html>` de una visita anterior.
  "--glass",
  "--glass-tint",
  "--radius-control",
  "--radius-surface",
  "--radius-panel",
]

function leer(): GlassConfig {
  try {
    const crudo = localStorage.getItem(CLAVE)
    if (!crudo) return DEFAULTS
    // Solo las claves de hoy: lo guardado por la 1.x (`glass`, `tint`, `radios`) se ignora.
    const guardado = JSON.parse(crudo) as Partial<GlassConfig> & { v?: unknown }
    return {
      brand: guardado.brand ?? null,
      brandDark: guardado.brandDark ?? null,
      ambient: ambientGuardado(guardado),
      luz: luzGuardada(guardado),
      tint: guardado.tint ?? true,
      grain: guardado.grain === "off" || guardado.grain === "strong" ? guardado.grain : "subtle",
      shape: guardado.shape ?? "standard",
      density: guardado.density ?? "standard",
      surfaces: guardado.surfaces ?? "raised",
      motion: guardado.motion ?? "standard",
      contrast: guardado.contrast ?? "standard",
      neutralsKind: guardado.neutralsKind ?? "brand",
      neutralsIntensity: typeof guardado.neutralsIntensity === "number" ? guardado.neutralsIntensity : 1,
      typeScale: guardado.typeScale ?? "standard",
      typeTracking: guardado.typeTracking ?? "standard",
      preset: guardado.preset ?? null,
      heading: guardado.heading === "serif" ? "serif" : "inter",
      recientes: guardado.recientes ?? [],
    }
  } catch {
    // Modo privado, almacenamiento bloqueado o un JSON viejo: el sitio anda igual con los defaults.
    return DEFAULTS
  }
}

export function GlassConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<GlassConfig>(DEFAULTS)

  // Después de hidratar, no en el estado inicial: el servidor no conoce el `localStorage`, y
  // arrancar con lo guardado haría que el primer render del cliente no coincida con el HTML.
  // Costo aceptado: quien guardó el wallpaper apagado (`v: 2`, `ambient: false`) lo ve prendido en
  // el HTML del servidor y se apaga al hidratar, un parpadeo en el Playground. Evitarlo pide una
  // cookie que el servidor lea, y no vale la pena para una preferencia de la demo.
  useEffect(() => setConfig(leer()), [])

  useEffect(() => {
    const raiz = document.documentElement
    const pisadas = variablesAplicadas(config)
    for (const atributo of ATRIBUTOS_DEL_TEMA) raiz.removeAttribute(atributo)
    for (const [atributo, valor] of Object.entries(createTheme({ ...toThemeConfig(config), brand: undefined }).attributes)) raiz.setAttribute(atributo, valor)
    for (const nombre of TODAS) {
      if (nombre in pisadas) raiz.style.setProperty(nombre, pisadas[nombre]!)
      else raiz.style.removeProperty(nombre)
    }
  }, [config])

  const set = useCallback((cambios: Partial<GlassConfig>) => {
    setConfig((actual) => {
      const siguiente = { ...actual, ...cambios }
      try {
        localStorage.setItem(CLAVE, JSON.stringify({ ...siguiente, v: CONFIG_VERSION }))
      } catch {
        // Sin almacenamiento la configuración vale hasta recargar. No es un error que mostrar.
      }
      return siguiente
    })
  }, [])

  const reset = useCallback(() => {
    try {
      localStorage.removeItem(CLAVE)
    } catch {
      // Ídem.
    }
    setConfig(DEFAULTS)
  }, [])

  const value = useMemo(
    () => ({ config, set, reset, esDefault: JSON.stringify(config) === JSON.stringify(DEFAULTS) }),
    [config, set, reset]
  )
  return <GlassConfigContext.Provider value={value}>{children}</GlassConfigContext.Provider>
}

export function useGlassConfig(): Contexto {
  const contexto = useContext(GlassConfigContext)
  if (!contexto) throw new Error("useGlassConfig va adentro de <GlassConfigProvider>")
  return contexto
}
