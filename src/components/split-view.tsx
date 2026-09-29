"use client"

import * as React from "react"
import { ChevronLeftIcon } from "lucide-react"

import { cn } from "../lib/utils.js"

/**
 * El master-detail de iCloud Mail y Notes (catálogo §2.4): sidebar (230) | lista (380) | detalle, en
 * paneles opacos separados por la línea entre paneles (`separator-strong`), a todo el alto.
 *
 * Se acomoda al ancho que **le toca** (container query, no el de la ventana): angosto (< 672) muestra
 * un solo panel —el activo— y `SplitViewBack` vuelve al anterior; mediano muestra lista y detalle; ancho
 * (≥ 1024), los tres. Sin manijas para redimensionar, como iCloud: eso va a ser `Resizable` (R6).
 */
type SplitViewPane = "sidebar" | "list" | "detail"

type SplitViewContextValue = { pane: SplitViewPane; setPane: (pane: SplitViewPane) => void }

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
}

function SplitView({ className, pane: paneProp, defaultPane = "list", onPaneChange, ...props }: SplitViewProps) {
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
  return (
    <SplitViewContext.Provider value={value}>
      <div
        data-slot="split-view"
        data-pane={pane}
        className={cn("group/split @container/split flex h-full min-h-0 w-full overflow-hidden bg-surface text-label", className)}
        {...props}
      />
    </SplitViewContext.Provider>
  )
}

type SplitViewPaneProps = React.ComponentProps<"section">

function makePane(name: SplitViewPane, slot: string, paneClassName: string) {
  function Pane({ className, ...props }: SplitViewPaneProps) {
    const { pane } = useSplitView()
    return (
      <PaneContext.Provider value={name}>
        <section
          data-slot={slot}
          data-active={pane === name ? "" : undefined}
          className={cn("hidden min-h-0 w-full min-w-0 flex-col overflow-y-auto data-active:flex", paneClassName, className)}
          {...props}
        />
      </PaneContext.Provider>
    )
  }
  return Pane
}

// Angosto: solo el activo. Mediano: la lista y el detalle (el sidebar solo si es el activo, y
// entonces sale el detalle). Ancho: los tres. Cada panel lleva la línea entre paneles a su derecha.
const SplitViewSidebar = makePane(
  "sidebar",
  "split-view-sidebar",
  "bg-surface-secondary @2xl/split:w-[230px] @2xl/split:shrink-0 @2xl/split:border-e @2xl/split:border-separator-strong @5xl/split:flex @5xl/split:w-[230px]"
)
const SplitViewList = makePane(
  "list",
  "split-view-list",
  // Con el sidebar abierto en mediano el detalle sale, y la lista toma su lugar.
  "@2xl/split:flex @2xl/split:w-[320px] @2xl/split:shrink-0 @2xl/split:border-e @2xl/split:border-separator-strong @2xl/split:group-data-[pane=sidebar]/split:flex-1 @2xl/split:group-data-[pane=sidebar]/split:border-e-0 @5xl/split:w-[380px] @5xl/split:group-data-[pane=sidebar]/split:flex-none @5xl/split:group-data-[pane=sidebar]/split:border-e"
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
}
