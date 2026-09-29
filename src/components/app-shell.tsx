"use client"

import * as React from "react"
import { MenuIcon } from "lucide-react"

import { AppShellContext, SidebarInSheetContext, type AppShellContextValue } from "../internal/shell-context.js"
import { useLabels, type Labels } from "../lib/labels.js"
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
  /** Contenido de la barra superior mobile (logo, campana, avatar), a la derecha de la hamburguesa. */
  mobileBar?: React.ReactNode
  /** Ruta actual (usePathname() en Next): cuando cambia, el Sheet mobile se cierra y el foco va al main. */
  pathname?: string
  /** id del <main> (destino del skip link). */
  mainId?: string
  /**
   * El wallpaper: ondas del color del brand, fijas detrás de todo, como la home de iCloud. Sobre
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
  labels?: Partial<AppShellLabels>
  children?: React.ReactNode
}

// El layout de una app de iCloud.
// ≥ lg: [header opcional a todo el ancho] / [sidebar sticky | main]. < lg: barra de 44 + main a todo el ancho;
// la hamburguesa abre el mismo sidebar en un Sheet izquierdo, que se cierra al navegar.
// El alto sale de --app-shell-height (100dvh); para embeberlo en una caja, sobreescribilo.
// Mismo corte que lg de Tailwind (64rem): desde ahí el sidebar está fijo y el Sheet sobra.
const DESKTOP_QUERY = "(min-width: 64rem)"

type SheetModule = typeof import("./sheet.js")

// Una sola carga del Sheet para todos los AppShell de la página: la promesa y el módulo quedan acá.
let sheetCargado: SheetModule | null = null
let sheetPromesa: Promise<SheetModule> | null = null
const cargarSheet = () => (sheetPromesa ??= import("./sheet.js").then((mod) => (sheetCargado = mod)))

function AppShell({ className, sidebar, mobileBar, pathname, mainId = "contenido", ambient = false, header, variant: _variant, labels: labelsProp, children, ...props }: AppShellProps) {
  // El provider gana sobre el español; la prop `labels` gana sobre el provider, porque es la
  // excepción puntual de una pantalla y no una traducción.
  const labels = { ...useLabels().appShell, ...labelsProp }
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

  const value = React.useMemo<AppShellContextValue>(() => ({ mobileOpen, setMobileOpen, closeMobile }), [mobileOpen, closeMobile])

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
    if (mobileOpen && !sheet) void cargarSheet().then(setSheet)
  }, [mobileOpen, sheet])
  // El Sheet se monta cerrado y se abre en el frame siguiente. Si naciera con `open`, Base UI no
  // pasa por el estado inicial de la transición (`data-starting-style`) y la primera apertura
  // aparecía de golpe, sin deslizarse desde el costado como las siguientes.
  const [listo, setListo] = React.useState(false)
  React.useEffect(() => {
    if (!sheet || listo) return
    const frame = requestAnimationFrame(() => setListo(true))
    return () => cancelAnimationFrame(frame)
  }, [sheet, listo])

  const triggerProps = { variant: "plain", size: "icon-sm", "aria-label": labels.openMenu, className: "-ml-1" } as const

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
            className="gap-0 overflow-hidden overscroll-contain p-0 [&_[data-slot=sidebar-header]>:first-child]:pr-10"
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
        data-slot="app-shell"
        data-ambient={ambient ? "" : undefined}
        className={cn(
          // La raíz pinta el fondo de página (el shell suele ocupar todo el viewport),
          // así que va con `bg-background`, no con la superficie `bg-surface`.
          "grid min-h-(--app-shell-height) grid-cols-1 bg-background [--app-shell-height:100dvh] lg:grid-cols-[auto_minmax(0,1fr)]",
          // Lo que mide la barra global: el sidebar se pega debajo de ella y descuenta su alto.
          // Con barra, la fila de arriba mide lo suyo y la de abajo se estira hasta el alto del shell.
          header == null ? "[--app-shell-header:0px]" : "[--app-shell-header:2.75rem] lg:grid-rows-[auto_minmax(0,1fr)]",
          // `bg-ambient` pinta el mismo color de página y le suma las ondas del wallpaper detrás.
          ambient && "bg-ambient",
          className
        )}
        {...props}
      >
        <a
          href={`#${mainId}`}
          className="sr-only z-50 rounded-control bg-surface px-3 py-2 text-callout text-label shadow-menu focus-visible:not-sr-only focus-visible:fixed focus-visible:top-2 focus-visible:left-2 focus-visible:focus-ring"
        >
          {labels.skipToContent}
        </a>
        {header != null && (
          <header
            data-slot="app-shell-header"
            className="sticky top-0 z-40 hidden h-11 min-w-0 items-center gap-2 border-b border-separator-strong bg-surface-header ps-4 pe-1.5 text-label in-data-ambient:material-translucent lg:col-span-2 lg:flex"
          >
            {header}
          </header>
        )}
        <div
          data-slot="app-shell-sidebar"
          className="sticky top-(--app-shell-header) hidden h-[calc(var(--app-shell-height)-var(--app-shell-header))] lg:flex"
        >
          {sidebar}
        </div>
        <div data-slot="app-shell-column" className="flex min-w-0 flex-col">
          {/* La barra de una app de iCloud en el teléfono: 44, opaca y con el borde abajo. */}
          <header
            data-slot="app-shell-mobile-bar"
            className="sticky top-0 z-40 flex h-11 shrink-0 items-center gap-2 border-b border-separator-strong bg-surface-header ps-4 pe-1.5 in-data-ambient:material-translucent lg:hidden"
          >
            {barContent}
          </header>
          <main ref={mainRef} id={mainId} data-slot="app-shell-main" tabIndex={-1} className="min-w-0 flex-1 outline-none">
            {children}
          </main>
        </div>
      </div>
    </AppShellContext.Provider>
  )
}

const fallback: AppShellContextValue = { mobileOpen: false, setMobileOpen: () => {}, closeMobile: () => {} }

/**
 * Estado del Sheet mobile. closeMobile({ focusMain: true }) para cerrarlo al navegar desde un link propio
 * (o pasale `pathname` a AppShell). Fuera de AppShell es un no-op.
 */
function useAppShell(): AppShellContextValue {
  return React.useContext(AppShellContext) ?? fallback
}

export { AppShell, useAppShell, type AppShellLabels, type AppShellProps }
