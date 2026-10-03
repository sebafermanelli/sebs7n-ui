"use client"

import * as React from "react"

import { cn } from "../lib/utils.js"

/** Los colores token de una serie: la clase fija el `currentColor` de su trazo y de su punto. */
export const metricChartColors = {
  brand: "text-brand-900",
  green: "text-green-900",
  red: "text-red-900",
  amber: "text-amber-900",
} as const
export type MetricChartColor = keyof typeof metricChartColors

/** Un punto del eje X ya resuelto en el servidor: la posición, el rótulo y los valores ya formateados. */
export type MetricChartPoint = {
  /** De 0 a 100, a lo ancho del área de trazado. */
  x: number
  label: string
  items: { color: MetricChartColor; name?: string; text: string; /** De 0 a 100, de arriba abajo. */ y: number }[]
}

type FrameProps = {
  points: MetricChartPoint[]
  ariaLabel: string
  describedBy: string
  /** El ancho reservado a la derecha para las etiquetas del eje Y, en px. */
  gutter: number
  className?: string
  style?: React.CSSProperties
  children: React.ReactNode
}

/**
 * El marco interactivo de `MetricChart`: lo único que lleva JS. Recibe el dibujo ya resuelto (SVG,
 * etiquetas) como `children` y le suma la línea punteada, los puntos y el tooltip. Los textos llegan
 * formateados desde el servidor, así ninguna función de formato cruza la frontera cliente.
 */
export function MetricChartFrame({ points, ariaLabel, describedBy, gutter, className, style, children }: FrameProps) {
  const frame = React.useRef<HTMLDivElement>(null)
  const tip = React.useRef<HTMLDivElement>(null)
  const pointer = React.useRef(false)
  const [active, setActive] = React.useState<number | null>(null)
  const last = points.length - 1

  const fromPointer = (event: React.PointerEvent) => {
    const box = frame.current?.getBoundingClientRect()
    if (!box) return
    const width = box.width - gutter
    if (width <= 0) return
    const ratio = Math.min(1, Math.max(0, (event.clientX - box.left) / width))
    setActive(Math.round(ratio * last))
  }

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      if (active != null) event.preventDefault()
      setActive(null)
      return
    }
    const step = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0
    if (step) {
      event.preventDefault()
      setActive((now) => Math.min(last, Math.max(0, (now ?? (step > 0 ? -1 : last + 1)) + step)))
    } else if (event.key === "Home" || event.key === "End") {
      event.preventDefault()
      setActive(event.key === "Home" ? 0 : last)
    }
  }

  // El tooltip va a la derecha de la línea y pasa a la izquierda si no entra: se mide después de pintar.
  React.useLayoutEffect(() => {
    const box = frame.current
    const el = tip.current
    if (!box || !el || active == null) return
    const plot = box.clientWidth - gutter
    const x = ((points[active]?.x ?? 0) / 100) * plot
    const width = el.offsetWidth
    const left = x + 12 + width <= plot ? x + 12 : Math.max(0, x - 12 - width)
    el.style.transform = `translateX(${left}px)`
  }, [active, gutter, points])

  const current = active != null ? points[active] : undefined

  // El anuncio vive afuera del `role="img"`, cuyos hijos son presentacionales para el lector.
  return (
    <div className={cn("relative", className)} data-slot="metric-chart" style={style}>
    <div
      ref={frame}
      aria-describedby={describedBy}
      aria-label={ariaLabel}
      className="absolute inset-0 touch-pan-y select-none rounded-control outline-none focus-visible:focus-ring"
      onBlur={() => {
        pointer.current = false
        setActive(null)
      }}
      onFocus={() => {
        if (!pointer.current) setActive((now) => now ?? last)
      }}
      onKeyDown={onKeyDown}
      onPointerCancel={() => setActive(null)}
      onPointerDown={() => {
        pointer.current = true
      }}
      onPointerLeave={(event) => {
        if (event.pointerType !== "touch") setActive(null)
      }}
      onPointerMove={fromPointer}
      role="img"
      tabIndex={0}
    >
      {children}
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-2.5 left-0" style={{ right: gutter }}>
        {current && (
          <>
            <div className="absolute inset-y-0 border-l border-dashed border-label-tertiary" data-slot="metric-chart-cursor" style={{ left: `${current.x}%` }} />
            {current.items.map((item, index) => (
              <span
                key={index}
                className={cn("absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-surface bg-current", metricChartColors[item.color])}
                data-slot="metric-chart-dot"
                style={{ left: `${current.x}%`, top: `${item.y}%` }}
              />
            ))}
            <div
              ref={tip}
              className="absolute top-0 left-0 z-10 min-w-28 rounded-menu bg-surface px-2.5 py-1.5 text-footnote text-label shadow-menu"
              data-slot="metric-chart-tooltip"
            >
              <div className="text-label-secondary">{current.label}</div>
              {current.items.map((item, index) => (
                <div key={index} className="mt-0.5 flex items-center gap-1.5 whitespace-nowrap">
                  <span aria-hidden="true" className={cn("size-2 shrink-0 rounded-full bg-current", metricChartColors[item.color])} />
                  {item.name && <span className="text-label-secondary">{item.name}</span>}
                  <strong className="ml-auto pl-2 font-semibold tabular-nums">{item.text}</strong>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
      <span aria-live="polite" className="sr-only">
        {current ? `${current.label}: ${current.items.map((item) => (item.name ? `${item.name} ${item.text}` : item.text)).join(", ")}` : ""}
      </span>
    </div>
  )
}
