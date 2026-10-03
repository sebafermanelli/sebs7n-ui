"use client"

import * as React from "react"

import { cn } from "../lib/utils.js"

type ResizeHandleProps = Omit<React.ComponentProps<"div">, "onResize"> & {
  /** El borde del panel donde vive: `end` es el derecho (sidebar), `start` el izquierdo (panel lateral). */
  edge: "start" | "end"
  /** Ancho actual, mínimo y máximo, en px: son los `aria-value*` y los destinos de Inicio y Fin. */
  value: number
  min: number
  max: number
  /** El ancho que pide el gesto, sin limitar (el panel decide los límites). `done` es la suelta o una tecla. */
  onResize: (size: number, done: boolean) => void
  /** Doble clic o Enter. */
  onToggle?: () => void
  /** Sube y baja con el arrastre: el panel apaga su transición mientras tanto. */
  onResizing?: (resizing: boolean) => void
}

// El separador arrastrable de los dos bordes del AppShell (sidebar y panel lateral): una zona de agarre de
// 8 px con la línea de 2 al medio, `col-resize`, y el teclado del patrón «window splitter». El ancho se mide
// contra el panel (su padre) y no contra la ventana: el shell puede vivir dentro de un marco más chico.
function ResizeHandle({ edge, value, min, max, onResize, onToggle, onResizing, className, ...props }: ResizeHandleProps) {
  const [dragging, setDragging] = React.useState(false)
  const last = React.useRef<number | null>(null)
  const dir = edge === "end" ? 1 : -1
  const stop = () => {
    setDragging(false)
    onResizing?.(false)
    if (last.current !== null) onResize(last.current, true)
    last.current = null
  }
  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-valuenow={value}
      aria-valuemin={min}
      aria-valuemax={max}
      tabIndex={0}
      data-dragging={dragging ? "" : undefined}
      className={cn(
        "absolute inset-y-0 z-10 w-2 cursor-col-resize touch-none outline-none after:absolute after:inset-y-0 after:start-1/2 after:w-0.5 after:-translate-x-1/2 after:transition-colors hover:after:bg-separator-strong focus-visible:after:bg-brand-500 data-dragging:after:bg-brand-500",
        edge === "end" ? "-end-1" : "-start-1",
        className
      )}
      onPointerDown={(event) => {
        if (event.button !== 0) return
        event.currentTarget.setPointerCapture(event.pointerId)
        last.current = null
        setDragging(true)
        onResizing?.(true)
      }}
      onPointerMove={(event) => {
        const panel = event.currentTarget.parentElement
        if (!dragging || !panel) return
        const rect = panel.getBoundingClientRect()
        last.current = edge === "end" ? event.clientX - rect.left : rect.right - event.clientX
        onResize(last.current, false)
      }}
      onPointerUp={stop}
      onPointerCancel={stop}
      onDoubleClick={onToggle}
      onKeyDown={(event) => {
        if (event.key === "Enter" && onToggle) {
          event.preventDefault()
          return onToggle()
        }
        const step = event.shiftKey ? 48 : 16
        const next = { ArrowRight: value + dir * step, ArrowLeft: value - dir * step, Home: dir > 0 ? min : max, End: dir > 0 ? max : min }[event.key]
        if (next === undefined) return
        event.preventDefault()
        event.stopPropagation()
        onResize(next, true)
      }}
      {...props}
    />
  )
}

export { ResizeHandle }
