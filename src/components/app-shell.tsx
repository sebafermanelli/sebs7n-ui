"use client"

import * as React from "react"
import { MenuIcon } from "lucide-react"

import { AppShellContext, SidebarInSheetContext, type AppShellContextValue } from "../internal/shell-context.js"
import { useLabels, type Labels } from "../lib/labels.js"
import { cn } from "../lib/utils.js"
import { Button } from "./button.js"
import { Navbar } from "./navbar.js"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "./sheet.js"

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
   * La luz ambiente: tres focos de color que salen del brand, fijos detrás de todo.
   *
   * Sobre una página lisa el vidrio no tiene nada que desenfocar y se ve como un gris plano;
   * con esto el Sidebar, las Cards y los menús muestran el material. Es opt-in porque cambia el
   * fondo de la app entera, y esa decisión es de la app.
   */
  ambient?: boolean
  /**
   * `floating` (el default): la barra del teléfono es el `Navbar` flotante —transparente arriba,
   * una píldora de vidrio al scrollear— y el `Sidebar` va despegado, en su propia píldora.
   * `bar`: las dos a ras de la ventana, como antes de 1.10. El `Sidebar` se elige con su propia
   * prop `variant`; esta decide la barra.
   */
  variant?: "floating" | "bar"
  labels?: Partial<AppShellLabels>
  children?: React.ReactNode
}

// Layout de dashboard estilo Vercel.
// ≥ lg: [sidebar sticky a todo el alto | main]. < lg: barra de 56px + main a todo el ancho;
// la hamburguesa abre el mismo sidebar en un Sheet izquierdo, que se cierra al navegar.
// El alto sale de --app-shell-height (100dvh); para embeberlo en una caja, sobreescribilo.
// Mismo corte que lg de Tailwind (64rem): desde ahí el sidebar está fijo y el Sheet sobra.
const DESKTOP_QUERY = "(min-width: 64rem)"

function AppShell({ className, sidebar, mobileBar, pathname, mainId = "contenido", ambient = false, variant = "floating", labels: labelsProp, children, ...props }: AppShellProps) {
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

  // Lo de la barra del teléfono: la hamburguesa con su Sheet y lo que pase la app. Lo mismo
  // en las dos variantes; cambia la superficie que lo contiene.
  const barContent = (
    <>
      <Sheet
        open={mobileOpen}
        onOpenChange={(open) => {
          if (open) focusMainOnClose.current = false
          setMobileOpen(open)
        }}
      >
        <SheetTrigger render={<Button variant="ghost" size="icon-sm" aria-label={labels.openMenu} className="-ml-2" />}>
          <MenuIcon aria-hidden="true" />
        </SheetTrigger>
        <SheetContent
          side="left"
          // Cierre por navegación: el foco va al <main> mismo (no a su primer control, que es lo que
          // hace Base UI si le devolvemos el elemento). El flag se limpia al abrir: finalFocus puede
          // evaluarse más de una vez.
          finalFocus={() => {
            if (!focusMainOnClose.current) return true
            requestAnimationFrame(() => mainRef.current?.focus({ preventScroll: true }))
            return false
          }}
          className="gap-0 overflow-hidden overscroll-contain p-0 [&_[data-slot=sidebar-header]>:first-child]:pr-10"
        >
          <SheetTitle className="sr-only">{labels.navigation}</SheetTitle>
          <SidebarInSheetContext.Provider value={true}>{sidebar}</SidebarInSheetContext.Provider>
        </SheetContent>
      </Sheet>
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
          // así que va con `bg-background`, no con la superficie `bg-background-100`.
          "grid min-h-(--app-shell-height) grid-cols-1 bg-background [--app-shell-height:100dvh] lg:grid-cols-[auto_minmax(0,1fr)]",
          // `bg-ambient` pinta el mismo color de página y le suma los focos encima.
          ambient && "bg-ambient",
          className
        )}
        {...props}
      >
        <a
          href={`#${mainId}`}
          className="sr-only z-50 rounded-control bg-background-100 px-3 py-2 text-button-14 text-gray-1000 shadow-menu focus-visible:not-sr-only focus-visible:fixed focus-visible:top-2 focus-visible:left-2 focus-visible:focus-ring"
        >
          {labels.skipToContent}
        </a>
        <div data-slot="app-shell-sidebar" className="sticky top-0 hidden h-(--app-shell-height) lg:flex">
          {sidebar}
        </div>
        <div data-slot="app-shell-column" className="flex min-w-0 flex-col">
          {variant === "floating" ? (
            // El `Navbar` flotante del paquete: arriba es transparente y al scrollear se vuelve
            // una píldora. El aire de arriba y de los costados es fijo, no solo al scrollear:
            // la barra es sticky y ocupa su alto, y si el margen apareciera con el scroll el
            // contenido saltaría 12px.
            <Navbar
              data-slot="app-shell-mobile-bar"
              variant="floating"
              className="z-40 px-3 pt-3 lg:hidden"
              surfaceClassName="max-w-none rounded-full"
            >
              <div className="flex h-14 items-center gap-2 px-4">{barContent}</div>
            </Navbar>
          ) : (
            <header
              data-slot="app-shell-mobile-bar"
              className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-2 border-b border-gray-alpha-400 glass px-4 shadow-card lg:hidden"
            >
              {barContent}
            </header>
          )}
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
