"use client"

import * as React from "react"

import { dragSeparator, isRtl, separatorClassName, separatorKey } from "../internal/separator.js"
import { useLabels } from "../lib/labels.js"
import { cn } from "../lib/utils.js"

/**
 * Paneles que se reparten el espacio y se redimensionan arrastrando la línea que los separa. iCloud
 * web no tiene uno (Mail es fijo: 230 | 380 | resto); se arma con su línea entre paneles
 * (`separator-strong`, §1.4), que se vuelve acento al agarrarla.
 *
 * `ResizablePanelGroup` > `ResizablePanel` · `ResizableHandle` · `ResizablePanel`. Los tamaños son
 * porcentajes del grupo. El separador es el «window splitter» de WAI-ARIA: tabulable, con su valor,
 * flechas de a `keyboardStep`, Shift el doble, Home/End a los extremos. `onLayout` avisa al soltar
 * (o con cada tecla) para guardar el reparto; `defaultLayout` lo restaura.
 */
type Orientation = "horizontal" | "vertical"
type PanelConfig = { defaultSize?: number; minSize: number; maxSize: number }
type Change = number | "min" | "max"

type GroupContextValue = {
  orientation: Orientation
  order: string[]
  sizes: Record<string, number>
  register: (id: string, config: PanelConfig) => () => void
  /** Aplica un cambio al par de paneles de un separador. `base` es el reparto desde el que se mide (el del comienzo del arrastre). */
  resize: (prev: string, next: string, change: Change, base?: Record<string, number>) => void
  commit: () => void
  /** Hasta dónde puede ir el panel de antes de un separador, con el reparto de ahora. */
  limits: (prev: string, next: string) => { min: number; max: number } | null
  sizesNow: () => Record<string, number>
  groupSize: () => number
  step: number
}

const GroupContext = React.createContext<GroupContextValue | null>(null)

function useGroup(part: string) {
  const context = React.useContext(GroupContext)
  if (!context) throw new Error(`${part} va adentro de un <ResizablePanelGroup>`)
  return context
}

const useIsoLayoutEffect = typeof window === "undefined" ? React.useEffect : React.useLayoutEffect
const round = (value: number) => Math.round(value * 100) / 100

/** Cuánto puede moverse un separador: el mínimo y el máximo del panel de antes, sin romper los del de después. */
function bounds(prev: PanelConfig, next: PanelConfig, pair: number) {
  return { min: Math.max(prev.minSize, pair - next.maxSize), max: Math.min(prev.maxSize, pair - next.minSize) }
}

type ResizablePanelGroupProps = React.ComponentProps<"div"> & {
  /** `horizontal` (default): paneles lado a lado. `vertical`: apilados. */
  orientation?: Orientation
  /** Se llama con los tamaños (en %, en el orden de los paneles) al soltar un separador o con cada tecla. Para guardarlos. */
  onLayout?: (sizes: number[]) => void
  /** Los tamaños al arrancar, en el orden de los paneles: lo que se guardó con `onLayout`. Le gana al `defaultSize` de cada panel. */
  defaultLayout?: number[]
  /** Cuánto mueve una flecha, en %. Shift, el doble. Por defecto, 5. */
  keyboardStep?: number
}

function ResizablePanelGroup({ className, orientation = "horizontal", onLayout, defaultLayout, keyboardStep = 5, ...props }: ResizablePanelGroupProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const configs = React.useRef(new Map<string, PanelConfig>())
  const [version, bump] = React.useReducer((value: number) => value + 1, 0)
  const [order, setOrder] = React.useState<string[]>([])
  const [sizes, setSizes] = React.useState<Record<string, number>>({})
  const sizesRef = React.useRef(sizes)
  sizesRef.current = sizes

  const register = React.useCallback((id: string, config: PanelConfig) => {
    configs.current.set(id, config)
    bump()
    return () => {
      configs.current.delete(id)
      bump()
    }
  }, [])

  // El orden de los paneles es el del DOM; con él se arma el reparto inicial: `defaultLayout`, o el
  // `defaultSize` de cada uno y el resto en partes iguales entre los que no lo traen.
  useIsoLayoutEffect(() => {
    const ids = [...(ref.current?.querySelectorAll<HTMLElement>(":scope > [data-slot=resizable-panel]") ?? [])].map((panel) => panel.id)
    setOrder((current) => (current.join() === ids.join() ? current : ids))
    setSizes((current) => {
      if (ids.length && ids.every((id) => id in current)) return current
      if (defaultLayout?.length === ids.length) return Object.fromEntries(ids.map((id, index) => [id, defaultLayout[index]!]))
      const given = ids.map((id) => configs.current.get(id)?.defaultSize)
      const rest = Math.max(0, 100 - given.reduce<number>((sum, size) => sum + (size ?? 0), 0))
      const free = given.filter((size) => size === undefined).length
      return Object.fromEntries(ids.map((id, index) => [id, round(given[index] ?? rest / free)]))
    })
    // `defaultLayout` es el valor inicial: cambiarlo después no reparte de nuevo.
  }, [version])

  const layout = React.useCallback(() => order.map((id) => sizesRef.current[id] ?? 0), [order])

  const resize = React.useCallback((prev: string, next: string, change: Change, base = sizesRef.current) => {
    const a = configs.current.get(prev)
    const b = configs.current.get(next)
    if (!a || !b) return
    const pair = (base[prev] ?? 0) + (base[next] ?? 0)
    const { min, max } = bounds(a, b, pair)
    const target = change === "min" ? min : change === "max" ? max : (base[prev] ?? 0) + change
    const size = round(Math.min(max, Math.max(min, target)))
    const updated = { ...sizesRef.current, [prev]: size, [next]: round(pair - size) }
    sizesRef.current = updated
    setSizes(updated)
  }, [])

  const commit = React.useCallback(() => onLayout?.(layout()), [onLayout, layout])
  const limits = React.useCallback((prev: string, next: string) => {
    const a = configs.current.get(prev)
    const b = configs.current.get(next)
    if (!a || !b) return null
    return bounds(a, b, (sizesRef.current[prev] ?? 0) + (sizesRef.current[next] ?? 0))
  }, [])
  const groupSize = React.useCallback(() => {
    const rect = ref.current?.getBoundingClientRect()
    return (orientation === "horizontal" ? rect?.width : rect?.height) || 0
  }, [orientation])
  const sizesNow = React.useCallback(() => sizesRef.current, [])

  const value = React.useMemo(
    () => ({ orientation, order, sizes, register, resize, commit, limits, sizesNow, groupSize, step: keyboardStep }),
    [orientation, order, sizes, register, resize, commit, limits, sizesNow, groupSize, keyboardStep]
  )

  return (
    <GroupContext.Provider value={value}>
      <div
        ref={ref}
        data-slot="resizable-panel-group"
        data-orientation={orientation}
        className={cn("flex h-full w-full overflow-hidden", orientation === "vertical" && "flex-col", className)}
        {...props}
      />
    </GroupContext.Provider>
  )
}

type ResizablePanelProps = React.ComponentProps<"div"> & {
  /** El tamaño al arrancar, en % del grupo. Sin él, reparte el resto con los demás que no lo traen. */
  defaultSize?: number
  /** El mínimo, en %. Por defecto, 0. */
  minSize?: number
  /** El máximo, en %. Por defecto, 100. */
  maxSize?: number
}

function ResizablePanel({ className, id: idProp, defaultSize, minSize = 0, maxSize = 100, style, ...props }: ResizablePanelProps) {
  const group = useGroup("ResizablePanel")
  const autoId = React.useId()
  const id = idProp ?? autoId
  useIsoLayoutEffect(() => group.register(id, { defaultSize, minSize, maxSize }), [group.register, id, defaultSize, minSize, maxSize])
  // Antes de medir (en el servidor, en el primer render) vale `defaultSize`: el HTML ya sale repartido.
  const size = group.sizes[id] ?? defaultSize ?? 1
  return (
    <div
      id={id}
      data-slot="resizable-panel"
      className={cn("min-h-0 min-w-0 overflow-auto", className)}
      style={{ flexGrow: size, flexShrink: 1, flexBasis: 0, ...style }}
      {...props}
    />
  )
}

type ResizableHandleProps = Omit<React.ComponentProps<"div">, "children"> & {
  /** Una manija visible en el medio de la línea, para que se note que se arrastra. */
  withHandle?: boolean
}

function ResizableHandle({ className, withHandle = false, onKeyDown, onPointerDown, "aria-label": ariaLabel, ...props }: ResizableHandleProps) {
  const group = useGroup("ResizableHandle")
  const labels = useLabels().resizable
  const ref = React.useRef<HTMLDivElement>(null)
  const [pair, setPair] = React.useState<[string, string] | null>(null)

  // Los paneles que mueve son los que tiene al lado en el DOM.
  useIsoLayoutEffect(() => {
    const prev = ref.current?.previousElementSibling as HTMLElement | null
    const next = ref.current?.nextElementSibling as HTMLElement | null
    const found: [string, string] | null = prev?.dataset.slot === "resizable-panel" && next?.dataset.slot === "resizable-panel" ? [prev.id, next.id] : null
    setPair((current) => (current?.join() === found?.join() ? current : found))
  }, [group.order])

  const axis = group.orientation === "horizontal" ? "x" : "y"
  const prevSize = pair ? group.sizes[pair[0]] : undefined
  // El mínimo y el máximo reales: los del panel de antes, sin romper los del de después.
  const limits = pair ? group.limits(pair[0], pair[1]) : null

  return (
    <div
      ref={ref}
      role="separator"
      tabIndex={0}
      data-slot="resizable-handle"
      aria-label={ariaLabel ?? labels.handle}
      aria-orientation={group.orientation === "horizontal" ? "vertical" : "horizontal"}
      aria-controls={pair?.[0]}
      aria-valuenow={prevSize === undefined ? undefined : Math.round(prevSize)}
      aria-valuemin={limits ? Math.round(limits.min) : undefined}
      aria-valuemax={limits ? Math.round(limits.max) : undefined}
      className={cn(separatorClassName, className)}
      onKeyDown={(event) => {
        onKeyDown?.(event)
        if (event.defaultPrevented || !pair) return
        const change = separatorKey(event, axis, axis === "x" && isRtl(event.currentTarget), group.step, group.step * 2)
        if (change === null) return
        event.preventDefault()
        group.resize(pair[0], pair[1], change)
        group.commit()
      }}
      onPointerDown={(event) => {
        onPointerDown?.(event)
        if (event.defaultPrevented || !pair) return
        const base = group.sizesNow()
        const total = group.groupSize()
        dragSeparator(
          event,
          axis,
          (deltaPx) => total && group.resize(pair[0], pair[1], (deltaPx / total) * 100, base),
          () => group.commit()
        )
      }}
      {...props}
    >
      {withHandle && (
        <span
          data-slot="resizable-grip"
          aria-hidden="true"
          className={cn(
            "z-10 shrink-0 rounded-full border border-separator-strong bg-surface shadow-segment transition-colors group-hover/separator:border-brand-700 group-data-dragging/separator:border-brand-700",
            group.orientation === "horizontal" ? "h-6 w-1.5" : "h-1.5 w-6"
          )}
        />
      )}
    </div>
  )
}

export { ResizableHandle, ResizablePanel, ResizablePanelGroup, type ResizableHandleProps, type ResizablePanelGroupProps, type ResizablePanelProps }
