"use client"

import * as React from "react"
import { MenuIcon } from "lucide-react"

import { AppShellContext, SidebarInSheetContext, type AppShellContextValue } from "../internal/shell-context.js"
import { useLabels, type Labels } from "../lib/labels.js"
import { cn } from "../lib/utils.js"
import { Button } from "./button.js"
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
  labels?: Partial<AppShellLabels>
  children?: React.ReactNode
}

// Layout de dashboard estilo Vercel.
// ≥ lg: [sidebar sticky a todo el alto | main]. < lg: barra de 56px + main a todo el ancho;
// la hamburguesa abre el mismo sidebar en un Sheet izquierdo, que se cierra al navegar.
// El alto sale de --app-shell-height (100dvh); para embeberlo en una caja, sobreescribilo.
// Mismo corte que lg de Tailwind (64rem): desde ahí el sidebar está fijo y el Sheet sobra.
const DESKTOP_QUERY = "(min-width: 64rem)"

function AppShell({ className, sidebar, mobileBar, pathname, mainId = "contenido", labels: labelsProp, children, ...props }: AppShellProps) {
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

  return (
    <AppShellContext.Provider value={value}>
      <div
        data-slot="app-shell"
        className={cn(
          // La raíz pinta el fondo de página (el shell suele ocupar todo el viewport),
          // así que va con `bg-background`, no con la superficie `bg-background-100`.
          "grid min-h-(--app-shell-height) grid-cols-1 bg-background [--app-shell-height:100dvh] lg:grid-cols-[auto_minmax(0,1fr)]",
          className
        )}
        {...props}
      >
        <a
          href={`#${mainId}`}
          className="sr-only z-50 rounded-md bg-background-100 px-3 py-2 text-button-14 text-gray-1000 shadow-menu focus-visible:not-sr-only focus-visible:fixed focus-visible:top-2 focus-visible:left-2 focus-visible:focus-ring"
        >
          {labels.skipToContent}
        </a>
        <div data-slot="app-shell-sidebar" className="sticky top-0 hidden h-(--app-shell-height) lg:flex">
          {sidebar}
        </div>
        <div data-slot="app-shell-column" className="flex min-w-0 flex-col">
          <header
            data-slot="app-shell-mobile-bar"
            className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-2 border-b border-gray-400 bg-background-100 px-4 shadow-card lg:hidden"
          >
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
