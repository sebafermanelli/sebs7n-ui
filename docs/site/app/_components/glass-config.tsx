"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react"

import { cssOfOklch, textoSobre, type Oklch } from "../_lib/color"
import { ambientGuardado, CONFIG_VERSION } from "../_lib/wallpaper"

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
  /** Los últimos colores de marca probados. No van al CSS: son la memoria del selector. */
  recientes: Oklch[]
}

export const DEFAULTS: GlassConfig = { brand: null, brandDark: null, ambient: true, luz: 1, recientes: [] }

const CLAVE = "sebs7n-ui:playground"

type Contexto = {
  config: GlassConfig
  set: (cambios: Partial<GlassConfig>) => void
  reset: () => void
  esDefault: boolean
}

const GlassConfigContext = createContext<Contexto | null>(null)

/** Las variables que la configuración pisa. Lo que está en su default no aparece. */
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
  return salida
}

const TODAS = [
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
      luz: guardado.luz ?? DEFAULTS.luz,
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
  useEffect(() => setConfig(leer()), [])

  useEffect(() => {
    const raiz = document.documentElement
    const pisadas = variables(config)
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
