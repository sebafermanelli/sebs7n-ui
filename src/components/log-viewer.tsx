"use client"

import * as React from "react"

import { defined } from "../internal/defined.js"
import { useLabels, type Labels } from "../lib/labels.js"
import { cn } from "../lib/utils.js"

type LogViewerLabels = NonNullable<Labels["logViewer"]>

/** Los textos por defecto (no están en `defaultLabels`: el componente es solo por subpath). */
const logViewerLabels: LogViewerLabels = { label: "Registro", empty: "Todavía no hay líneas.", loading: "Cargando…", warn: "Aviso", error: "Error", info: "Info" }

type LogLevel = "info" | "warn" | "error"

type LogLine = {
  /** La clave de la línea. Por defecto, su posición. */
  id?: string | number
  /** La hora, ya formateada («14:02:11»). */
  time?: string
  /** `info` por defecto. */
  level?: LogLevel
  /** De dónde viene la línea (un servicio): una columna angosta entre la hora y el mensaje. */
  source?: string
  /** El texto. */
  message: string
}

type LogViewerProps = Omit<React.ComponentProps<"div">, "children" | "role"> & {
  /** Las líneas, de la más vieja a la más nueva. */
  lines: readonly LogLine[]
  /** Sigue la última línea mientras el scroll esté al final; si se sube a leer, se queda ahí. Por defecto, `true`. */
  follow?: boolean
  /** Trayendo las líneas: muestra «Cargando…» y marca la región como ocupada. */
  loading?: boolean
  /** Lo que se ve sin líneas (por ejemplo, «Ninguna línea coincide con los filtros»). Por defecto, `labels.empty`. */
  emptyMessage?: React.ReactNode
  /** `terminal`: fondo oscuro en los dos temas, como una terminal. Por defecto, `default`: el relleno gris de la superficie. */
  variant?: "default" | "terminal"
  /** Textos: `label`, `empty`, `loading` y los niveles `info`, `warn` y `error`. Por defecto, `logViewerLabels`. */
  labels?: Partial<LogViewerLabels>
}

const LEVEL_CLASS: Record<LogLevel, string> = { info: "text-label-secondary", warn: "text-amber-ink", error: "text-red-ink" }

// A menos de esto del final se considera «al final»: el redondeo de zooms y de subpíxeles no la rompe.
const BOTTOM_SLACK = 24

/**
 * El visor de logs: monoespaciado, una línea por renglón, con el rol `log` (un lector de pantalla
 * anuncia lo nuevo sin quitarle el foco a nadie) y `tabIndex={0}` para recorrerlo con el teclado
 * (flechas, Re Pág). El nivel va en color **y** en texto: `warn` y `error` llevan «Aviso» / «Error»
 * a la vista, e `info` lo dice solo para el lector.
 *
 * Con `follow` baja solo cuando llegan líneas, pero únicamente si el scroll estaba al final: quien
 * sube a leer no pierde el lugar. No filtra ni corta: `lines` ya viene filtrada y acotada (los
 * últimos 500, por ejemplo), y las pausas, la descarga y la búsqueda son botones de la app (en
 * una `FilterBar`). Pasá `aria-label` con lo que se mira («Log del despliegue»).
 */
function LogViewer({ lines, follow = true, loading = false, emptyMessage, variant = "default", labels: labelsProp, className, ref, onScroll, "aria-label": ariaLabel, ...props }: LogViewerProps) {
  const labels = { ...logViewerLabels, ...useLabels().logViewer, ...defined(labelsProp) }
  const element = React.useRef<HTMLDivElement | null>(null)
  const atEnd = React.useRef(true)
  const setRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      element.current = node
      if (typeof ref === "function") ref(node)
      else if (ref) ref.current = node
    },
    [ref]
  )

  // Después de pintar las líneas nuevas: si seguía al final, baja con ellas.
  React.useEffect(() => {
    const node = element.current
    if (follow && atEnd.current && node) node.scrollTop = node.scrollHeight
  }, [lines, follow])

  return (
    <div
      aria-busy={loading || undefined}
      aria-label={ariaLabel ?? labels.label}
      className={cn(
        "h-80 min-h-0 overflow-auto p-3 font-mono text-footnote leading-6",
        variant === "terminal" ? "dark rounded-surface border border-separator-strong bg-background p-4" : "rounded-control bg-fill-1",
        className
      )}
      data-slot="log-viewer"
      data-variant={variant}
      onScroll={(event) => {
        const node = event.currentTarget
        atEnd.current = node.scrollHeight - node.scrollTop - node.clientHeight <= BOTTOM_SLACK
        onScroll?.(event)
      }}
      ref={setRef}
      role="log"
      tabIndex={0}
      {...props}
    >
      {loading ? (
        <p className="text-label-secondary">{labels.loading}</p>
      ) : lines.length === 0 ? (
        <p className="text-label-secondary">{emptyMessage ?? labels.empty}</p>
      ) : (
        lines.map((line, index) => {
          const level = line.level ?? "info"
          return (
            <div className="flex gap-3 whitespace-nowrap" data-level={level} data-slot="log-line" key={line.id ?? index}>
              {line.time != null && <span className="shrink-0 text-label-tertiary">{line.time}</span>}
              {line.source != null && <span className="w-28 shrink-0 truncate text-brand-900">{line.source}</span>}
              <span className={LEVEL_CLASS[level]}>
                {level === "info" ? <span className="sr-only">{labels.info}: </span> : <span className="font-semibold uppercase">{labels[level]}: </span>}
                {line.message}
              </span>
            </div>
          )
        })
      )}
    </div>
  )
}

export { LogViewer, logViewerLabels, type LogLevel, type LogLine, type LogViewerLabels, type LogViewerProps }
