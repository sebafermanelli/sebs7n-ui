"use client"

import * as React from "react"
import { ChevronLeftIcon } from "lucide-react"

import { dragSeparator, separatorKey } from "../internal/separator.js"
import { useLabels } from "../lib/labels.js"
import { cn } from "../lib/utils.js"

/**
 * El master-detail de iCloud Mail y Notes (catálogo §2.4): sidebar (230) | lista (380) | detalle, en
 * paneles opacos separados por la línea entre paneles (`separator-strong`), a todo el alto.
 *
 * Se acomoda al ancho que **le toca** (container query, no el de la ventana): angosto (< 672) muestra
 * un solo panel —el activo— y `SplitViewBack` vuelve al anterior; mediano muestra lista y detalle; ancho
 * (≥ 1024), los tres. Sin manijas para redimensionar, como iCloud; con `resizable`, el sidebar y la
 * lista llevan en su borde el separador de `Resizable` (en px, con mínimo y máximo).
 */
type SplitViewPane = "sidebar" | "list" | "detail"
type SplitViewWidths = { sidebar: number; list: number }

type SplitViewContextValue = { pane: SplitViewPane; setPane: (pane: SplitViewPane) => void }

type ResizeContextValue = {
  widths: SplitViewWidths
  setWidth: (pane: keyof SplitViewWidths, width: number) => void
  commit: () => void
}

/** Los anchos de Mail y hasta dónde se pueden mover. */
const WIDTHS: SplitViewWidths = { sidebar: 230, list: 380 }
const LIMITS: Record<keyof SplitViewWidths, [number, number]> = { sidebar: [180, 360], list: [260, 560] }
const ResizeContext = React.createContext<ResizeContextValue | null>(null)

const SplitViewContext = React.createContext<SplitViewContextValue | null>(null)
const PaneContext = React.createContext<SplitViewPane | null>(null)

/** El panel activo y cómo cambiarlo: la fila de la lista llama `setPane("detail")` al elegirse. */
function useSplitView(): SplitViewContextValue {
  const context = React.useContext(SplitViewContext)
  if (!context) throw new Error("useSplitView va adentro de un <SplitView>")
  return context
}

type SplitViewProps = React.ComponentProps<"div"> & {
  /** El panel activo: el único que se ve en angosto. Pasarlo lo vuelve controlado. */
  pane?: SplitViewPane
  /** El panel activo al arrancar. Por defecto la lista, como Mail en el teléfono. */
  defaultPane?: SplitViewPane
  onPaneChange?: (pane: SplitViewPane) => void
  /**
   * El sidebar y la lista se redimensionan con un separador en su borde (arrastre o flechas), entre
   * 180–360 y 260–560 px. Por defecto no, como Mail.
   */
  resizable?: boolean
  /** Los anchos al arrancar, en px (lo guardado con `onWidthsChange`). Por defecto, los de Mail: 230 y 380. */
  defaultWidths?: Partial<SplitViewWidths>
  /** Se llama con los anchos al soltar un separador o con cada tecla. Para guardarlos. */
  onWidthsChange?: (widths: SplitViewWidths) => void
}

function SplitView({
  className,
  pane: paneProp,
  defaultPane = "list",
  onPaneChange,
  resizable = false,
  defaultWidths,
  onWidthsChange,
  ...props
}: SplitViewProps) {
  const [own, setOwn] = React.useState(defaultPane)
  const pane = paneProp ?? own
  const setPane = React.useCallback(
    (next: SplitViewPane) => {
      if (paneProp === undefined) setOwn(next)
      onPaneChange?.(next)
    },
    [paneProp, onPaneChange]
  )
  const value = React.useMemo(() => ({ pane, setPane }), [pane, setPane])

  const [widths, setWidths] = React.useState<SplitViewWidths>(() => ({ ...WIDTHS, ...defaultWidths }))
  const widthsRef = React.useRef(widths)
  widthsRef.current = widths
  const resize = React.useMemo<ResizeContextValue>(
    () => ({
      widths,
      setWidth: (name, width) => {
        const [min, max] = LIMITS[name]
        const next = { ...widthsRef.current, [name]: Math.round(Math.min(max, Math.max(min, width))) }
        widthsRef.current = next
        setWidths(next)
      },
      commit: () => onWidthsChange?.(widthsRef.current),
    }),
    [widths, onWidthsChange]
  )

  return (
    <SplitViewContext.Provider value={value}>
      <ResizeContext.Provider value={resizable ? resize : null}>
        <div
          data-slot="split-view"
          data-pane={pane}
          data-resizable={resizable ? "" : undefined}
          className={cn("group/split @container/split flex h-full min-h-0 w-full overflow-hidden bg-surface text-label", className)}
          {...props}
        />
      </ResizeContext.Provider>
    </SplitViewContext.Provider>
  )
}

type SplitViewPaneProps = React.ComponentProps<"section">

function makePane(name: SplitViewPane, slot: string, paneClassName: string, handleClassName?: string) {
  function Pane({ className, id: idProp, style, ...props }: SplitViewPaneProps) {
    const { pane } = useSplitView()
    const resize = React.useContext(ResizeContext)
    const autoId = React.useId()
    const id = idProp ?? autoId
    const width = resize && name !== "detail" ? resize.widths[name] : undefined
    return (
      <PaneContext.Provider value={name}>
        <section
          id={id}
          data-slot={slot}
          data-active={pane === name ? "" : undefined}
          className={cn(
            "hidden min-h-0 w-full min-w-0 flex-col overflow-y-auto data-active:flex",
            paneClassName,
            // Redimensionable: el ancho de Mail pasa a una variable, desde que se ven dos paneles.
            width !== undefined && "@2xl/split:group-data-resizable/split:w-(--split-pane-width) @5xl/split:group-data-resizable/split:w-(--split-pane-width)",
            className
          )}
          style={width !== undefined ? ({ "--split-pane-width": `${width}px`, ...style } as React.CSSProperties) : style}
          {...props}
        />
        {width !== undefined && handleClassName && (
          <PaneHandle name={name as keyof SplitViewWidths} paneId={id} paneLabel={props["aria-label"]} className={handleClassName} />
        )}
      </PaneContext.Provider>
    )
  }
  return Pane
}

/**
 * El separador de un panel: un elemento de ancho 0 pegado a su borde derecho, que dibuja encima de la
 * línea entre paneles el acento al agarrarla y la banda de foco de 3 px. Es el de `Resizable`, en px.
 */
function PaneHandle({ name, paneId, paneLabel, className }: { name: keyof SplitViewWidths; paneId: string; paneLabel?: string; className: string }) {
  const resize = React.useContext(ResizeContext)!
  const labels = useLabels().resizable
  const [min, max] = LIMITS[name]
  const width = resize.widths[name]
  return (
    <div
      role="separator"
      tabIndex={0}
      data-slot="split-view-handle"
      aria-label={paneLabel ? `${labels.handle}: ${paneLabel}` : labels.handle}
      aria-orientation="vertical"
      aria-controls={paneId}
      aria-valuenow={width}
      aria-valuemin={min}
      aria-valuemax={max}
      className={cn(
        "relative z-10 hidden w-0 shrink-0 cursor-col-resize touch-none outline-none select-none",
        "after:absolute after:inset-y-0 after:-start-1.5 after:w-3 pointer-coarse:after:-start-3 pointer-coarse:after:w-6",
        "before:absolute before:inset-y-0 before:-start-px before:w-px before:transition-colors hover:before:bg-brand-700 data-dragging:before:bg-brand-700",
        "focus-visible:before:-start-0.5 focus-visible:before:w-[3px] focus-visible:before:bg-(--sf-focus)",
        className
      )}
      onKeyDown={(event) => {
        const change = separatorKey(event, "x", event.currentTarget.closest("[dir]")?.getAttribute("dir") === "rtl", 10, 40)
        if (change === null) return
        event.preventDefault()
        resize.setWidth(name, change === "min" ? min : change === "max" ? max : width + change)
        resize.commit()
      }}
      onPointerDown={(event) =>
        dragSeparator(
          event,
          "x",
          (delta) => resize.setWidth(name, width + delta),
          () => resize.commit()
        )
      }
    />
  )
}

// Angosto: solo el activo. Mediano: la lista y el detalle (el sidebar solo si es el activo, y
// entonces sale el detalle). Ancho: los tres. Cada panel lleva la línea entre paneles a su derecha.
const SplitViewSidebar = makePane(
  "sidebar",
  "split-view-sidebar",
  "bg-surface-secondary @2xl/split:w-[230px] @2xl/split:shrink-0 @2xl/split:border-e @2xl/split:border-separator-strong @5xl/split:flex @5xl/split:w-[230px]",
  // El del sidebar, solo con los tres paneles: en mediano el sidebar abierto tapa al detalle y la
  // lista toma el resto, no hay nada que repartir.
  "@5xl/split:block"
)
const SplitViewList = makePane(
  "list",
  "split-view-list",
  // Con el sidebar abierto en mediano el detalle sale, y la lista toma su lugar.
  "@2xl/split:flex @2xl/split:w-[320px] @2xl/split:shrink-0 @2xl/split:border-e @2xl/split:border-separator-strong @2xl/split:group-data-[pane=sidebar]/split:flex-1 @2xl/split:group-data-[pane=sidebar]/split:border-e-0 @5xl/split:w-[380px] @5xl/split:group-data-[pane=sidebar]/split:flex-none @5xl/split:group-data-[pane=sidebar]/split:border-e",
  // El de la lista, desde que se ven lista y detalle (no con el sidebar abierto en mediano).
  "@2xl/split:block @2xl/split:group-data-[pane=sidebar]/split:hidden @5xl/split:group-data-[pane=sidebar]/split:block"
)
const SplitViewDetail = makePane(
  "detail",
  "split-view-detail",
  "flex-1 @2xl/split:flex @2xl/split:group-data-[pane=sidebar]/split:hidden @5xl/split:group-data-[pane=sidebar]/split:flex"
)

type SplitViewBackProps = React.ComponentProps<"button"> & {
  /** Adónde vuelve. Por defecto, el panel anterior: del detalle a la lista, de la lista al sidebar. */
  to?: SplitViewPane
  /** El nombre del panel al que vuelve («Facturas»), como el botón Atrás de iOS. */
  children: React.ReactNode
}

// El «‹ Facturas» de iOS: texto en el acento con el chevron, solo cuando el panel de atrás no se ve.
function SplitViewBack({ className, to, onClick, children, ...props }: SplitViewBackProps) {
  const { setPane } = useSplitView()
  const inPane = React.useContext(PaneContext)
  const target = to ?? (inPane === "detail" ? "list" : "sidebar")
  return (
    <button
      type="button"
      data-slot="split-view-back"
      onClick={(event) => {
        onClick?.(event)
        if (!event.defaultPrevented) setPane(target)
      }}
      className={cn(
        "-ms-1.5 inline-flex h-8 w-fit shrink-0 items-center gap-0.5 rounded-control pe-2 ps-0.5 text-body text-brand-ink outline-none hover:bg-fill-1 focus-visible:focus-ring [&>svg]:size-5",
        inPane === "detail" ? "@2xl/split:hidden" : "@5xl/split:hidden",
        className
      )}
      {...props}
    >
      <ChevronLeftIcon aria-hidden="true" strokeWidth={2.25} />
      {children}
    </button>
  )
}

export {
  SplitView,
  SplitViewBack,
  SplitViewDetail,
  SplitViewList,
  SplitViewSidebar,
  useSplitView,
  type SplitViewBackProps,
  type SplitViewPane,
  type SplitViewPaneProps,
  type SplitViewProps,
  type SplitViewWidths,
}
