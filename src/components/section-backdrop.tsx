import type * as React from "react"

import { cn } from "../lib/utils.js"

/**
 * Un fondo de sección, opt-in. Ninguno es un degradé de adorno ni un glow: son tres texturas quietas
 * que se leen como papel.
 *
 * ```tsx
 * <SectionBackdrop variant="grid">
 *   <SectionHeader title="…" />
 * </SectionBackdrop>
 * ```
 *
 * - `wash`: un lavado de la marca de 7 % que se apaga hacia abajo (el brand de la app, sea cual sea).
 * - `grid`: una retícula de filetes de 1 px (`separator`) que se desvanece hacia los bordes, como
 *   papel milimetrado.
 * - `grain`: ruido fino al 5 %, para sacarle lo plano a una superficie.
 *
 * La capa es `aria-hidden`, no recibe puntero, queda detrás (`-z-10` dentro de un `isolate`) y no
 * lleva texto: el contraste del contenido sigue midiéndose contra `bg-background`. Sin estado: sirve
 * en un Server Component.
 */
type SectionBackdropProps = React.ComponentProps<"div"> & {
  /** `wash` · `grid` · `grain`. Default `wash`. */
  variant?: "wash" | "grid" | "grain"
  /** Desde dónde se apaga la textura: `top` (default, la fuerza queda arriba), `center` o `none`. */
  fade?: "top" | "center" | "none"
  /** Clases de la capa decorativa (no del contenedor). */
  backdropClassName?: string
}

// El ruido es SVG inline (feTurbulence): sin pedido de red y sin imagen que versionar.
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 .5 0 0 0 0 .5 0 0 0 0 .5 0 0 0 .55 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")"

const MASKS = {
  top: "radial-gradient(ellipse 80% 70% at 50% 0%, #000 25%, transparent 100%)",
  center: "radial-gradient(ellipse 70% 70% at 50% 50%, #000 20%, transparent 100%)",
  none: undefined,
} as const

function layerStyle(variant: NonNullable<SectionBackdropProps["variant"]>, fade: NonNullable<SectionBackdropProps["fade"]>): React.CSSProperties {
  const mask = MASKS[fade]
  const base: React.CSSProperties = mask ? { maskImage: mask, WebkitMaskImage: mask } : {}
  if (variant === "grid") {
    return {
      ...base,
      backgroundImage: "linear-gradient(to right, var(--sf-separator) 1px, transparent 1px), linear-gradient(to bottom, var(--sf-separator) 1px, transparent 1px)",
      backgroundSize: "56px 56px",
      backgroundPosition: "center top",
    }
  }
  if (variant === "grain") return { ...base, backgroundImage: GRAIN, backgroundSize: "160px 160px", opacity: 0.05 }
  // `wash`: la marca al 7 % arriba que se va a nada; sin mask, el propio degradé ya cae.
  return {
    ...base,
    backgroundImage: "linear-gradient(to bottom, color-mix(in oklab, var(--sf-brand-700) 7%, transparent), transparent 75%)",
  }
}

function SectionBackdrop({ variant = "wash", fade = "top", backdropClassName, className, children, ...props }: SectionBackdropProps) {
  return (
    <div data-slot="section-backdrop" data-variant={variant} className={cn("relative isolate", className)} {...props}>
      <div
        aria-hidden="true"
        data-slot="section-backdrop-layer"
        className={cn("pointer-events-none absolute inset-0 -z-10", backdropClassName)}
        style={layerStyle(variant, variant === "wash" ? "none" : fade)}
      />
      {children}
    </div>
  )
}

export { SectionBackdrop, type SectionBackdropProps }
