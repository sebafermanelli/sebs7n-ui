"use client"

import * as React from "react"

import { cn } from "../lib/utils.js"

/**
 * Si la ventana bajó más de `threshold` px. Una suscripción pasiva al scroll y un
 * booleano: el componente solo re-renderiza cuando cruza el umbral, no en cada
 * pixel. En el servidor es `false` (arriba de todo), que es lo que ve el HTML.
 */
function useScrolled(threshold: number) {
  return React.useSyncExternalStore(
    (onChange) => {
      window.addEventListener("scroll", onChange, { passive: true })
      return () => window.removeEventListener("scroll", onChange)
    },
    () => window.scrollY > threshold,
    () => false
  )
}

type NavbarState = {
  /** La ventana bajó más que el umbral. */
  scrolled: boolean
}

const NavbarContext = React.createContext<NavbarState>({ scrolled: false })

/**
 * El estado de la barra, para un hijo que tiene que cambiar con ella y no le alcanza con CSS
 * (`group-data-scrolled/navbar:…`). Afuera de un `Navbar` devuelve `scrolled: false`.
 */
function useNavbar(): NavbarState {
  return React.useContext(NavbarContext)
}

type NavbarProps = React.ComponentProps<"header"> & {
  /**
   * @deprecated Desde 2.0 el Navbar es siempre la barra global de iCloud, fija a todo el ancho.
   * `"bar"` se acepta y no hace nada; la cápsula despegada (`"floating"`) se fue. Se borra en 3.0.
   */
  variant?: "bar"
  /**
   * `sticky` ocupa su alto en el flujo (el contenido empieza abajo). `fixed` se
   * superpone: para un hero que tiene que llegar hasta arriba de la ventana.
   */
  position?: "sticky" | "fixed"
  /** Cuántos px de scroll prenden `data-scrolled`. Por defecto, 12. */
  scrollThreshold?: number
  /** Clases de la superficie —la caja con fondo—. `className` va al `<header>`. */
  surfaceClassName?: string
}

/**
 * La barra global de iCloud (catálogo §2.1): a todo el ancho, opaca (`surface-header`) con el borde
 * entre paneles abajo, y `material-translucent` solo sobre el wallpaper de `AppShell ambient`, como
 * la de Home. El contenido va en `NavbarContent` (44 de alto).
 *
 * El borde es una sombra interior de 1 px y no un `border`: así la barra mide 44 con él adentro, lo
 * mismo que en iCloud, sin que `NavbarContent` tenga que descontarlo.
 *
 * Expone `data-scrolled` en el `<header>` para quien quiera cambiar algo al bajar
 * (`group-data-scrolled/navbar:…`); la barra en sí no cambia.
 */
function Navbar({ className, surfaceClassName, variant: _variant, position = "sticky", scrollThreshold = 12, children, ...props }: NavbarProps) {
  const scrolled = useScrolled(scrollThreshold)
  const state = React.useMemo(() => ({ scrolled }), [scrolled])
  return (
    <header
      data-slot="navbar"
      data-scrolled={scrolled ? "" : undefined}
      className={cn("group/navbar top-0 z-50 w-full", position === "fixed" ? "fixed inset-x-0" : "sticky", className)}
      {...props}
    >
      <div
        data-slot="navbar-surface"
        className={cn(
          "relative bg-surface-header text-label shadow-[inset_0_-1px_0_var(--color-separator-strong)] in-data-ambient:material-translucent",
          surfaceClassName
        )}
      >
        <NavbarContext.Provider value={state}>{children}</NavbarContext.Provider>
      </div>
    </header>
  )
}

/** La fila de la barra: 44 de alto, `0 6px 0 16px` como la de iCloud y los extremos separados. */
function NavbarContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="navbar-content"
      className={cn("flex h-11 w-full items-center justify-between gap-4 ps-4 pe-1.5", className)}
      {...props}
    />
  )
}

export { Navbar, NavbarContent, useNavbar, type NavbarProps, type NavbarState }
