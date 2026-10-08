"use client"

import * as React from "react"
import { MenuIcon, XIcon } from "lucide-react"

import { defined } from "../internal/defined.js"
import { ResizeHandle } from "../internal/resize-handle.js"
import { AppShellContext, SidebarInSheetContext, type AppShellContextValue } from "../internal/shell-context.js"
import { useLabels, type Labels } from "../lib/labels.js"
import { useStoredState } from "../lib/use-stored-state.js"
import { cn } from "../lib/utils.js"
import { Button } from "./button.js"

/**
 * Los textos viven una sola vez, en `sebs7n-ui/labels`. Acá queda el alias para
 * que el tipo público siga llamándose igual y nadie tenga que cambiar un import.
 */
type AppShellLabels = Labels["appShell"]

type AppShellProps = Omit<React.ComponentProps<"div">, "children"> & {
  /** Un <Sidebar>. Se renderiza fijo en desktop y dentro de un Sheet en mobile. */
  sidebar: React.ReactNode
  /**
   * El borde derecho del sidebar se arrastra (≥ lg) entre `sidebarMinWidth` y `sidebarMaxWidth`; por debajo de 140 px
   * pliega al riel de íconos y desde el riel se despliega arrastrando. Doble clic o Enter en el separador alternan.
   * Por defecto, sí: es el usuario quien acomoda su espacio. En el teléfono no existe (el sidebar es una hoja).
   */
  sidebarResizable?: boolean
  /**
   * Si arrastrar por debajo del umbral, Enter y el doble clic pliegan al riel. Por defecto, sí. Apagalo cuando los
   * ítems no tienen ícono: un riel sin íconos queda vacío (el ancho sigue siendo redimensionable).
   */
  sidebarCollapsible?: boolean
  /** Controlado: el ancho del sidebar desplegado, en px. Sin esto, el shell lo maneja (`defaultSidebarWidth`). */
  sidebarWidth?: number
  /** Ancho inicial en px. Por defecto, 256. */
  defaultSidebarWidth?: number
  /** Mínimo y máximo del ancho desplegado. Por defecto, 200 y 360. */
  sidebarMinWidth?: number
  sidebarMaxWidth?: number
  /** Se llama al soltar el separador o con cada tecla: para que la app guarde el ancho. */
  onSidebarWidthChange?: (width: number) => void
  /** Controlado: si el sidebar está plegado al riel de íconos. Sin esto, el shell lo maneja (`defaultSidebarCollapsed`). */
  sidebarCollapsed?: boolean
  defaultSidebarCollapsed?: boolean
  onSidebarCollapsedChange?: (collapsed: boolean) => void
  /**
   * Si se pasa, el shell recuerda el ancho y el plegado del sidebar en `localStorage` con esta clave (por ejemplo
   * `"mi-app:sidebar"`). Se adopta después de montar: el HTML del servidor siempre sale con el ancho por defecto y
   * desplegado. Sin clave, vale hasta recargar.
   */
  sidebarStorageKey?: string
  /** Contenido de la barra superior mobile (logo, campana, avatar), a la derecha de la hamburguesa. */
  mobileBar?: React.ReactNode
  /** Ruta actual (usePathname() en Next): cuando cambia, el Sheet mobile se cierra y el foco va al main. */
  pathname?: string
  /** id del <main> (destino del skip link). */
  mainId?: string
  /**
   * El wallpaper: círculos grandes del color del brand, fijos detrás de todo, como la home de iCloud. Sobre
   * él la barra (`header` y la del teléfono) y la `Toolbar` pasan a `material-translucent`, y
   * `Card`, `WidgetCard` y el `Sidebar` al cuerpo translúcido (`material-translucent-body`); menús,
   * diálogos y campos siguen opacos. Es opt-in porque cambia el fondo de la app entera, y esa
   * decisión es de la app.
   */
  ambient?: boolean
  /**
   * La barra global de iCloud (catálogo §2.1), a todo el ancho arriba del sidebar y del contenido
   * (≥ lg): 44 px, `surface-header`, el borde entre paneles abajo y `0 6px 0 16px`. Adentro va lo que
   * la app quiera —marca, búsqueda, botones de ícono de 36, avatar de 28—. En el teléfono manda
   * `mobileBar`. Sobre el wallpaper (`ambient`) pasa a `material-translucent`.
   */
  header?: React.ReactNode
  /**
   * @deprecated Desde 2.0 el shell es siempre el de iCloud: sidebar a ras y barras opacas. `"bar"` se
   * acepta y no hace nada; la barra flotante (`"floating"`) se fue. Se borra en 3.0.
   */
  variant?: "bar"
  /**
   * Un panel lateral acoplado a la derecha (asistente, ayuda, detalle) que EMPUJA el contenido, sin
   * overlay ni bloqueo: la app de la izquierda sigue operable. El contenido solo se monta mientras está
   * abierto, así que puede ser pesado y diferido (`next/dynamic`). < lg pasa a ser un Sheet modal.
   */
  aside?: React.ReactNode
  /** Controlado: si el panel está abierto. Sin esto, el shell lo maneja (`defaultAsideOpen`). */
  asideOpen?: boolean
  defaultAsideOpen?: boolean
  onAsideOpenChange?: (open: boolean) => void
  /** Nombre accesible del `<aside>` y título por defecto de su cabecera. Por defecto, `labels.aside`. */
  asideLabel?: string
  /** Lo que va en la cabecera del panel, a la izquierda de la «X». Por defecto, `asideLabel`. */
  asideTitle?: React.ReactNode
  /** Botones de la cabecera del panel, entre el título y la «X». */
  asideActions?: React.ReactNode
  /** Ancho inicial en px (≥ lg), y al que vuelve el doble clic en el separador. Por defecto, 400. */
  asideWidth?: number
  asideMinWidth?: number
  asideMaxWidth?: number
  /** Se llama al soltar el separador o con cada tecla: para que la app guarde el ancho. */
  onAsideWidthChange?: (width: number) => void
  /** Si se pasa, el shell recuerda el ancho del panel en `localStorage` (igual que `sidebarStorageKey`). */
  asideStorageKey?: string
  labels?: Partial<AppShellLabels>
  children?: React.ReactNode
}

// El layout de una app de iCloud.
// ≥ lg: [header opcional a todo el ancho] / [sidebar sticky | main]. < lg: barra de 44 + main a todo el ancho;
// la hamburguesa abre el mismo sidebar en un Sheet izquierdo, que se cierra al navegar.
// El alto sale de --app-shell-height (100dvh); para embeberlo en una caja, sobreescribilo.
// Mismo corte que lg de Tailwind (64rem): desde ahí el sidebar está fijo y el Sheet sobra.
const DESKTOP_QUERY = "(min-width: 64rem)"

const asideLabels = { aside: "Panel lateral", closeAside: "Cerrar panel", resizeAside: "Cambiar el ancho del panel", resizeSidebar: "Cambiar el ancho de la barra lateral" }
// Un panel no baja de esto: arrastrando por debajo del umbral el sidebar pliega al riel (64); el contenido principal
// nunca queda más angosto que MAIN_MIN, y si el panel lateral no entra pasa a ser una hoja.
const RAIL = 64
const COLLAPSE_AT = 140
const MAIN_MIN = 480
const ASIDE_MS = 200
const TABBABLE = 'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

// ≥ lg, por matchMedia. Sin matchMedia (jsdom) se toma desktop; en el servidor, no: ahí el panel nunca está montado.
function subscribeDesktop(onChange: () => void) {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return () => {}
  const query = window.matchMedia(DESKTOP_QUERY)
  query.addEventListener("change", onChange)
  return () => query.removeEventListener("change", onChange)
}
const desktopSnapshot = () => (typeof window.matchMedia === "function" ? window.matchMedia(DESKTOP_QUERY).matches : true)
function useIsDesktop() {
  return React.useSyncExternalStore(subscribeDesktop, desktopSnapshot, () => false)
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

type Panel = { w: number; c: boolean }
const isPanel = (value: unknown): value is Panel => typeof (value as Panel | null)?.w === "number" && typeof (value as Panel).c === "boolean"

// El ancho y el plegado de un panel del shell: controlados o no, con recuerdo opcional (clave) y con un estado
// «en vivo» mientras se arrastra (no se guarda ni se avisa hasta soltar). El valor guardado se adopta tras montar.
function usePanel(key: string | undefined, initial: Panel, width?: number, collapsed?: boolean, onWidth?: (w: number) => void, onCollapsed?: (c: boolean) => void) {
  const [stored, setStored] = useStoredState(key ?? "", initial, isPanel)
  const [live, setLive] = React.useState<Panel | null>(null)
  const set = (next: Panel, done: boolean) => {
    if (!done) return setLive(next)
    setLive(null)
    setStored(next)
    if (next.w !== (width ?? stored.w)) onWidth?.(next.w)
    if (next.c !== (collapsed ?? stored.c)) onCollapsed?.(next.c)
  }
  return [{ w: live?.w ?? width ?? stored.w, c: live?.c ?? collapsed ?? stored.c }, set, live !== null] as const
}

type SheetModule = typeof import("./sheet.js")

// Una sola carga del Sheet para todos los AppShell de la página: la promesa y el módulo quedan acá.
let sheetCargado: SheetModule | null = null
let sheetPromesa: Promise<SheetModule> | null = null
const cargarSheet = () => (sheetPromesa ??= import("./sheet.js").then((mod) => (sheetCargado = mod)))

function AppShell({
  className,
  sidebar,
  sidebarResizable = true,
  sidebarCollapsible = true,
  sidebarWidth,
  defaultSidebarWidth = 256,
  sidebarMinWidth = 200,
  sidebarMaxWidth = 360,
  onSidebarWidthChange,
  sidebarCollapsed,
  defaultSidebarCollapsed = false,
  onSidebarCollapsedChange,
  sidebarStorageKey,
  mobileBar,
  pathname,
  mainId = "contenido",
  ambient = false,
  header,
  variant: _variant,
  aside,
  asideOpen: asideOpenProp,
  defaultAsideOpen = false,
  onAsideOpenChange,
  asideLabel,
  asideTitle,
  asideActions,
  asideWidth = 400,
  asideMinWidth = 320,
  asideMaxWidth = 640,
  onAsideWidthChange,
  asideStorageKey,
  labels: labelsProp,
  children,
  ...props
}: AppShellProps) {
  // El provider gana sobre el español; la prop `labels` gana sobre el provider, porque es la
  // excepción puntual de una pantalla y no una traducción.
  const labels = { ...asideLabels, ...useLabels().appShell, ...defined(labelsProp) }
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const mainRef = React.useRef<HTMLElement>(null)
  const focusMainOnClose = React.useRef(false)

  const closeMobile = React.useCallback((options?: { focusMain?: boolean }) => {
    focusMainOnClose.current = options?.focusMain ?? false
    setMobileOpen(false)
  }, [])

  // Cualquier navegación (no solo un SidebarItem) cierra el Sheet.
  const lastPathname = React.useRef(pathname)
  React.useEffect(() => {
    if (pathname === lastPathname.current) return
    lastPathname.current = pathname
    closeMobile({ focusMain: true })
  }, [pathname, closeMobile])

  // Al pasar a desktop, el Sheet se cierra (el sidebar ya está a la vista).
  React.useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return
    const query = window.matchMedia(DESKTOP_QUERY)
    const onChange = (event: { matches: boolean }) => {
      if (event.matches) setMobileOpen(false)
    }
    query.addEventListener("change", onChange)
    return () => query.removeEventListener("change", onChange)
  }, [])

  // El panel lateral: abierto controlado o no; ≥ lg una columna, < lg un Sheet modal.
  const [asideOpenState, setAsideOpenState] = React.useState(defaultAsideOpen)
  const asideOpen = aside != null && (asideOpenProp ?? asideOpenState)
  const setAsideOpen = React.useCallback(
    (open: boolean) => {
      if (asideOpenProp === undefined) setAsideOpenState(open)
      onAsideOpenChange?.(open)
    },
    [asideOpenProp, onAsideOpenChange]
  )
  const isDesktop = useIsDesktop()
  const rootRef = React.useRef<HTMLDivElement>(null)
  const sidebarId = React.useId()
  const asideId = React.useId()
  const [resizing, setResizing] = React.useState<"sidebar" | "aside" | null>(null)
  const [animated, setAnimated] = React.useState(false)

  // El sidebar: ancho y plegado. Rail de 64 plegado; desplegado entre el mínimo y el máximo.
  const [sidebarState, setSidebar, sidebarLive] = usePanel(
    sidebarStorageKey,
    { w: defaultSidebarWidth, c: defaultSidebarCollapsed },
    sidebarWidth,
    sidebarCollapsed,
    onSidebarWidthChange,
    onSidebarCollapsedChange
  )
  const sidebarW = clamp(sidebarState.w, sidebarMinWidth, sidebarMaxWidth)
  const sidebarIsCollapsed = sidebarState.c
  const commitSidebar = (next: Panel, done: boolean) => {
    if (done) setAnimated(true)
    setSidebar(next, done)
  }
  const resizeSidebar = (size: number, done: boolean) => {
    // Con el teclado desde el riel (suelta sin arrastre previo), cualquier avance lo despliega.
    const collapse = sidebarCollapsible && size < (done && !sidebarLive && sidebarIsCollapsed ? RAIL + 1 : COLLAPSE_AT)
    commitSidebar({ w: collapse ? sidebarW : clamp(size, sidebarMinWidth, sidebarMaxWidth), c: collapse }, done)
  }
  const setSidebarCollapsed = (collapsed: boolean) => commitSidebar({ w: sidebarW, c: collapsed }, true)

  // El ancho del shell mismo (no el de la ventana: el shell puede vivir en un marco): el panel lateral deja
  // siempre al contenido al menos MAIN_MIN, y si no entra pasa a ser una hoja. 0 = sin medir (servidor, jsdom).
  const [shellWidth, setShellWidth] = React.useState(0)
  React.useEffect(() => {
    const root = rootRef.current
    if (!root || typeof ResizeObserver === "undefined") return
    const observer = new ResizeObserver(([entry]) => entry && setShellWidth(Math.round(entry.contentRect.width)))
    observer.observe(root)
    return () => observer.disconnect()
  }, [])
  const room = shellWidth ? shellWidth - (sidebarIsCollapsed ? RAIL : sidebarW) - MAIN_MIN : Infinity
  const docked = isDesktop && room >= asideMinWidth

  const [asideState, setAside] = usePanel(asideStorageKey, { w: asideWidth, c: false }, undefined, undefined, onAsideWidthChange)
  const asideMax = Math.min(asideMaxWidth, room)
  const width = clamp(asideState.w, asideMinWidth, asideMax)
  const asideDefault = clamp(asideWidth, asideMinWidth, asideMax)
  const dragging = resizing === "aside"
  const asideRef = React.useRef<HTMLElement>(null)
  const opener = React.useRef<HTMLElement | null>(null)

  // Mientras se cierra, el contenido sigue montado lo que dura la transición; después se desmonta.
  const [present, setPresent] = React.useState(asideOpen)
  React.useEffect(() => {
    if (asideOpen) {
      setPresent(true)
      return
    }
    const timer = setTimeout(() => setPresent(false), ASIDE_MS)
    return () => clearTimeout(timer)
  }, [asideOpen])

  // Foco: al abrir va al primer control del panel (si la app no lo llevó ya adentro); al cerrar, al
  // botón que lo abrió. No se atrapa: Tab sale del panel como de cualquier columna.
  const wasOpen = React.useRef(false)
  React.useEffect(() => {
    if (asideOpen && !wasOpen.current) {
      const active = document.activeElement
      opener.current = active instanceof HTMLElement && active !== document.body ? active : null
      if (docked) {
        const frame = requestAnimationFrame(() => {
          const panel = asideRef.current
          if (!panel || panel.contains(document.activeElement)) return
          ;(panel.querySelector<HTMLElement>(TABBABLE) ?? panel).focus({ preventScroll: true })
        })
        wasOpen.current = true
        return () => cancelAnimationFrame(frame)
      }
    }
    if (!asideOpen && wasOpen.current) {
      const target = opener.current
      const panel = asideRef.current
      if (target?.isConnected && (!panel || panel.contains(document.activeElement) || document.activeElement === document.body)) {
        target.focus({ preventScroll: true })
      }
    }
    wasOpen.current = asideOpen && docked
  }, [asideOpen, docked])

  const value = React.useMemo<AppShellContextValue>(
    () => ({ mobileOpen, setMobileOpen, closeMobile, asideOpen, setAsideOpen, sidebarCollapsed: sidebarIsCollapsed, setSidebarCollapsed }),
    // `setSidebarCollapsed` se rehace en cada render; lo que lee (el ancho y el plegado) está en estas dependencias.
    [mobileOpen, closeMobile, asideOpen, setAsideOpen, sidebarIsCollapsed, sidebarW]
  )

  // Lo de la barra del teléfono: la hamburguesa con su Sheet y lo que pase la app.
  // El Sheet (el Dialog de Base UI, con su focus trap y el bloqueo de scroll) se pide recién
  // cuando hace falta: en desktop nunca se abre, y en el teléfono recién al tocar la hamburguesa.
  // Importado de entrada pesaba ~13 KB gzip en cada página con AppShell (medido en el sitio de
  // docs). El toque no se pierde: deja `mobileOpen` en true y el Sheet se abre cuando llega.
  // Lo mismo si la app lo abre desde `useAppShell()`.
  //
  // No se precarga con el hover ni con el foco, a propósito: al llegar el módulo la hamburguesa
  // provisoria se cambia por el trigger de Base UI —es otro nodo—, y si eso pasa con el foco
  // adentro, el foco se cae al `<body>`; si pasa entre el pointerdown y el click de un toque, el
  // click se pierde. Cargándolo en el click, el cambio coincide con la apertura, y abrir el Sheet
  // ya mueve el foco adentro; al cerrarlo vuelve al trigger nuevo.
  //
  // El estado arranca siempre en `null`, aunque el módulo ya esté en memoria: un AppShell que
  // hidrata tarde (otro Suspense, un segundo shell) tiene que coincidir con el HTML del servidor,
  // que nunca lo tiene. Si ya estaba cargado se toma en el layout effect, antes de pintar.
  const [sheet, setSheet] = React.useState<SheetModule | null>(null)
  React.useLayoutEffect(() => {
    if (!sheet && sheetCargado) setSheet(sheetCargado)
  }, [sheet])
  React.useEffect(() => {
    if ((mobileOpen || (asideOpen && !docked)) && !sheet) void cargarSheet().then(setSheet)
  }, [mobileOpen, asideOpen, docked, sheet])
  // El Sheet se monta cerrado y se abre en el frame siguiente. Si naciera con `open`, Base UI no
  // pasa por el estado inicial de la transición (`data-starting-style`) y la primera apertura
  // aparecía de golpe, sin deslizarse desde el costado como las siguientes.
  const [listo, setListo] = React.useState(false)
  React.useEffect(() => {
    if (!sheet || listo) return
    const frame = requestAnimationFrame(() => setListo(true))
    return () => cancelAnimationFrame(frame)
  }, [sheet, listo])

  const triggerProps = { variant: "plain", size: "icon-sm", "aria-label": labels.openMenu, className: "-ms-1" } as const

  const asideHeader = (
    <>
      <h2 className="min-w-0 flex-1 truncate text-callout font-semibold text-label">{asideTitle ?? asideLabel ?? labels.aside}</h2>
      {asideActions}
    </>
  )

  const barContent = (
    <>
      {sheet ? (
        <sheet.Sheet
          open={mobileOpen && listo}
          onOpenChange={(open) => {
            if (open) focusMainOnClose.current = false
            setMobileOpen(open)
          }}
        >
          <sheet.SheetTrigger render={<Button {...triggerProps} />}>
            <MenuIcon aria-hidden="true" />
          </sheet.SheetTrigger>
          <sheet.SheetContent
            side="left"
            finalFocus={() => {
              if (!focusMainOnClose.current) return true
              requestAnimationFrame(() => mainRef.current?.focus({ preventScroll: true }))
              return false
            }}
            className="gap-0 overflow-hidden overscroll-contain p-0 [&_[data-slot=sidebar-header]>:first-child]:pe-10"
          >
            <sheet.SheetTitle className="sr-only">{labels.navigation}</sheet.SheetTitle>
            <SidebarInSheetContext.Provider value={true}>{sidebar}</SidebarInSheetContext.Provider>
          </sheet.SheetContent>
        </sheet.Sheet>
      ) : (
        // Hasta que llega el Sheet, un botón con el mismo aspecto y lo que anuncia el trigger de
        // Base UI (`aria-haspopup`, `aria-expanded`). Tocado, dice `expanded` mientras el Sheet llega.
        <Button
          {...triggerProps}
          data-slot="sheet-trigger"
          aria-haspopup="dialog"
          aria-expanded={mobileOpen}
          onClick={() => {
            focusMainOnClose.current = false
            setMobileOpen(true)
          }}
        >
          <MenuIcon aria-hidden="true" />
        </Button>
      )}
      <div data-slot="app-shell-mobile-bar-content" className="flex min-w-0 flex-1 items-center gap-2">
        {mobileBar}
      </div>
    </>
  )

  return (
    <AppShellContext.Provider value={value}>
      <div
        ref={rootRef}
        data-slot="app-shell"
        data-ambient={ambient ? "" : undefined}
        className={cn(
          // La raíz pinta el fondo de página (el shell suele ocupar todo el viewport),
          // así que va con `bg-background`, no con la superficie `bg-surface`.
          "grid min-h-(--app-shell-height) grid-cols-1 bg-background [--app-shell-height:100dvh]",
          aside == null ? "lg:grid-cols-[auto_minmax(0,1fr)]" : "lg:grid-cols-[auto_minmax(0,1fr)_auto]",
          // Lo que mide la barra global: el sidebar se pega debajo de ella y descuenta su alto.
          // Con barra, la fila de arriba mide lo suyo y la de abajo se estira hasta el alto del shell.
          header == null ? "[--app-shell-header:0px]" : "[--app-shell-header:2.75rem] lg:grid-rows-[auto_minmax(0,1fr)]",
          // `bg-ambient` pinta el mismo color de página y le suma los círculos del wallpaper detrás.
          ambient && "bg-ambient",
          className
        )}
        {...props}
      >
        <a
          href={`#${mainId}`}
          className="sr-only z-50 rounded-control bg-surface px-3 py-2 text-callout text-label shadow-menu focus-visible:not-sr-only focus-visible:fixed focus-visible:top-2 focus-visible:start-2 focus-visible:focus-ring"
        >
          {labels.skipToContent}
        </a>
        {header != null && (
          <header
            data-slot="app-shell-header"
            className="sticky top-0 z-40 hidden h-11 min-w-0 items-center gap-2 border-b border-separator-strong bg-surface-header ps-4 pe-(--sf-bar-end) bar-end text-label in-data-ambient:material-translucent lg:col-span-2 lg:flex"
          >
            {header}
          </header>
        )}
        <div
          id={sidebarId}
          data-slot="app-shell-sidebar"
          data-animate={animated ? "" : undefined}
          data-resizing={resizing === "sidebar" ? "" : undefined}
          style={{ "--sidebar-width": `${sidebarW}px` } as React.CSSProperties}
          className="sticky top-(--app-shell-header) hidden h-[calc(var(--app-shell-height)-var(--app-shell-header))] lg:flex"
        >
          {sidebar}
          {isDesktop && sidebarResizable && (
            <ResizeHandle
              edge="end"
              aria-controls={sidebarId}
              aria-label={labels.resizeSidebar}
              data-slot="app-shell-sidebar-handle"
              value={sidebarIsCollapsed ? RAIL : sidebarW}
              min={sidebarIsCollapsed ? RAIL : sidebarMinWidth}
              max={sidebarMaxWidth}
              onResize={resizeSidebar}
              onResizing={(on) => setResizing(on ? "sidebar" : null)}
              onToggle={sidebarCollapsible ? () => setSidebarCollapsed(!sidebarIsCollapsed) : undefined}
            />
          )}
        </div>
        <div data-slot="app-shell-column" className="flex min-w-0 flex-col">
          {/* La barra de una app de iCloud en el teléfono: 44 y con el borde abajo; opaca, y translúcida
              sobre el wallpaper. */}
          <header
            data-slot="app-shell-mobile-bar"
            className="sticky top-0 z-40 flex h-11 shrink-0 items-center gap-2 border-b border-separator-strong bg-surface-header ps-4 pe-(--sf-bar-end) bar-end in-data-ambient:material-translucent lg:hidden"
          >
            {barContent}
          </header>
          {/* El main es un contenedor de consulta (`container-type: inline-size`, sin layout ni paint: no rompe sticky ni
              fixed): el contenido responde al ancho que le deja el sidebar y el panel lateral, no al de la ventana. */}
          <main ref={mainRef} id={mainId} data-slot="app-shell-main" tabIndex={-1} className="@container/main min-w-0 flex-1 outline-none">
            {children}
          </main>
        </div>
        {aside != null && (
          <div
            data-slot="app-shell-aside-column"
            data-state={asideOpen ? "open" : "closed"}
            data-resizing={dragging ? "" : undefined}
            style={{ width: asideOpen && docked ? width : 0 }}
            // Columna ≥ lg que mide 0 cerrada y el ancho del panel abierta: el contenido se corre.
            className="sticky top-0 hidden h-(--app-shell-height) shrink-0 overflow-hidden transition-panel lg:col-start-3 lg:row-span-full lg:row-start-1 lg:block"
          >
            {present && docked && (
              <aside
                ref={asideRef}
                id={asideId}
                data-slot="app-shell-aside"
                aria-label={asideLabel ?? labels.aside}
                tabIndex={-1}
                onKeyDown={(event) => {
                  if (event.key === "Escape" && !event.defaultPrevented) {
                    event.stopPropagation()
                    setAsideOpen(false)
                  }
                }}
                style={{ width }}
                className="relative flex h-full flex-col border-s border-separator-strong bg-surface text-callout text-label outline-none in-data-ambient:material-translucent-body"
              >
                <div
                  data-slot="app-shell-aside-header"
                  className="flex h-11 shrink-0 items-center gap-2 border-b border-separator-strong bg-surface-header ps-4 pe-(--sf-bar-end) bar-end in-data-ambient:material-translucent"
                >
                  {asideHeader}
                  <Button variant="plain" size="icon-sm" aria-label={labels.closeAside} onClick={() => setAsideOpen(false)}>
                    <XIcon aria-hidden="true" />
                  </Button>
                </div>
                <div data-slot="app-shell-aside-body" className="flex min-h-0 flex-1 flex-col">
                  {aside}
                </div>
                <ResizeHandle
                  edge="start"
                  aria-controls={asideId}
                  aria-label={labels.resizeAside}
                  data-slot="app-shell-aside-handle"
                  value={width}
                  min={asideMinWidth}
                  max={asideMax}
                  onResize={(size, done) => setAside({ w: clamp(size, asideMinWidth, asideMax), c: false }, done)}
                  onResizing={(on) => setResizing(on ? "aside" : null)}
                  onToggle={() => setAside({ w: asideDefault, c: false }, true)}
                />
              </aside>
            )}
          </div>
        )}
        {aside != null && present && !docked && sheet && (
          <sheet.Sheet open={asideOpen && listo} onOpenChange={setAsideOpen}>
            <sheet.SheetContent
              side="right"
              labels={{ close: labels.closeAside }}
              className="w-full gap-0 overflow-hidden p-0 [&_[data-slot=sheet-close-button]]:top-1.5 data-[side=right]:w-full data-[side=right]:sm:max-w-none"
            >
              <sheet.SheetTitle className="sr-only">{asideLabel ?? labels.aside}</sheet.SheetTitle>
              <div className="flex h-11 shrink-0 items-center gap-2 border-b border-separator-strong ps-4 pe-14">{asideHeader}</div>
              <div data-slot="app-shell-aside-body" className="flex min-h-0 flex-1 flex-col">
                {aside}
              </div>
            </sheet.SheetContent>
          </sheet.Sheet>
        )}
      </div>
    </AppShellContext.Provider>
  )
}

const fallback: AppShellContextValue = { mobileOpen: false, setMobileOpen: () => {}, closeMobile: () => {}, asideOpen: false, setAsideOpen: () => {}, sidebarCollapsed: false, setSidebarCollapsed: () => {} }

/**
 * Estado del Sheet mobile, del panel lateral (`asideOpen` / `setAsideOpen`) y del sidebar plegado al riel
 * (`sidebarCollapsed` / `setSidebarCollapsed`, para el atajo ⌘B). closeMobile({ focusMain: true }) para cerrarlo al navegar desde un link propio
 * (o pasale `pathname` a AppShell). Fuera de AppShell es un no-op.
 */
function useAppShell(): AppShellContextValue {
  return React.useContext(AppShellContext) ?? fallback
}

export { AppShell, useAppShell, type AppShellLabels, type AppShellProps }
