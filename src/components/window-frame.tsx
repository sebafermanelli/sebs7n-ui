import * as React from "react"

import { cn } from "../lib/utils.js"

/**
 * El marco de una ventana de producto, para una captura, un video de demo o una pieza de interfaz
 * dibujada en una landing. Es sobrio a propósito: una barra de 36 px con filete, tres puntos neutros
 * (nada de rojo, amarillo y verde) y el título al centro, sobre una superficie opaca.
 *
 * ```tsx
 * <WindowFrame title="Facturas">
 *   <img alt="La lista de facturas del mes" src="/facturas.png" />
 * </WindowFrame>
 * ```
 *
 * - **Sombra del set chico** (2.16): `elevation` elige entre `resting` (`shadow-widget`), `floating`
 *   (`shadow-menu`, el default) y `overlay` (`shadow-modal`). Sin glow ni sombras largas.
 * - **Decorativo por dentro**: la barra y los puntos son `aria-hidden`; el título visible nombra el
 *   grupo (`role="group"` + `aria-labelledby`) solo si lo pasás.
 * - Sin estado ni hooks: sirve en un Server Component.
 */
type WindowFrameProps = Omit<React.ComponentProps<"div">, "title"> & {
  /** El título de la barra (el nombre de la pantalla o la dirección). Nombra el grupo para un lector. */
  title?: string
  /** Muestra los tres puntos de la ventana. Default `true`. */
  controls?: boolean
  /** La sombra, del set chico: `resting` · `floating` (default) · `overlay`. */
  elevation?: "resting" | "floating" | "overlay"
  /** Reemplaza el contenido de la barra (por ejemplo, unas pestañas). Reemplaza al título. */
  bar?: React.ReactNode
  /** Clases del cuerpo (debajo de la barra). */
  contentClassName?: string
}

const elevations = {
  resting: "shadow-widget",
  floating: "shadow-menu",
  overlay: "shadow-modal",
} as const

function WindowFrame({ title, controls = true, elevation = "floating", bar, contentClassName, className, children, ...props }: WindowFrameProps) {
  const titleId = `${React.useId()}-title`
  return (
    <div
      role={title ? "group" : undefined}
      aria-labelledby={title ? titleId : undefined}
      data-slot="window-frame"
      className={cn("overflow-hidden rounded-surface bg-surface text-label", elevations[elevation], className)}
      {...props}
    >
      <div
        aria-hidden={bar ? undefined : "true"}
        data-slot="window-frame-bar"
        className="grid h-9 grid-cols-[4.5rem_minmax(0,1fr)_4.5rem] items-center border-b border-separator bg-surface-bar px-3"
      >
        {bar ? (
          <div className="col-span-3 min-w-0">{bar}</div>
        ) : (
          <>
            <span className="flex gap-1.5" data-slot="window-frame-controls">
              {controls && [0, 1, 2].map((dot) => <span className="size-2.5 rounded-full bg-fill-3" key={dot} />)}
            </span>
            <span className="truncate text-center text-footnote text-label-secondary" id={title ? titleId : undefined}>
              {title}
            </span>
          </>
        )}
      </div>
      <div data-slot="window-frame-content" className={cn("relative", contentClassName)}>
        {children}
      </div>
    </div>
  )
}

export { WindowFrame, type WindowFrameProps }
