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
 * La barra global de la home de iCloud (catálogo §2.1): a todo el ancho, con el borde entre paneles
 * abajo y **translúcida con desenfoque** (`material-translucent`): el contenido de la página pasa por
 * abajo. Fuera del wallpaper su fill (`--sf-translucent-bar`) es más denso, para que el texto llegue
 * a 4,5:1 sobre cualquier cosa; sobre el wallpaper (`data-ambient`) usa el de `material-translucent`
 * y el wallpaper se ve a través. Con menos transparencia o más contraste es la barra opaca
 * (`surface-header`). La barra de `AppShell` no es esta: es su prop `header`, opaca adentro de una
 * app (como Mail o Drive) y translúcida sobre el wallpaper. El contenido va en `NavbarContent`.
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
          // Fuera del wallpaper, el fill denso de la barra: debajo puede pasar cualquier cosa. Sobre él
          // (`data-ambient`), el de `material-translucent`, para que el wallpaper se vea a través.
          "relative material-translucent not-in-data-ambient:[--sf-translucent:var(--sf-translucent-bar)]",
          "text-label shadow-[inset_0_-1px_0_var(--color-separator-strong)]",
          surfaceClassName
        )}
      >
        <NavbarContext.Provider value={state}>{children}</NavbarContext.Provider>
      </div>
    </header>
  )
}

type NavbarContentProps = React.ComponentProps<"div"> & {
  /**
   * El ancho de la columna del sitio (`1448`, `"80rem"`): la barra sigue a todo el ancho y su contenido
   * se centra en esa columna, alineado con los bloques de abajo.
   */
  maxWidth?: number | string
}

/** La fila de la barra: 44 de alto, `0 6px 0 16px` como la de iCloud y los extremos separados. */
function NavbarContent({ className, maxWidth, style, ...props }: NavbarContentProps) {
  return (
    <div
      data-slot="navbar-content"
      className={cn("flex h-11 w-full items-center justify-between gap-4 ps-4 pe-1.5", maxWidth && "mx-auto", className)}
      style={{ maxWidth, ...style }}
      {...props}
    />
  )
}

export { Navbar, NavbarContent, useNavbar, type NavbarContentProps, type NavbarProps, type NavbarState }
