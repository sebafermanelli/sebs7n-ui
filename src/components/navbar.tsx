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

type NavbarProps = React.ComponentProps<"header"> & {
  /**
   * `bar`: a todo el ancho; transparente arriba y, al scrollear, translúcida con
   * blur y un borde abajo.
   *
   * `floating`: arranca igual que `bar`, pegada arriba y a todo el ancho, y al
   * scrollear se despega: margen a los costados y arriba, borde redondeado y la
   * sombra de un menú. La transición es de 300 ms sobre padding, radio, fondo y
   * blur, así que la barra se transforma en la píldora en vez de saltar.
   */
  variant?: "bar" | "floating"
  /**
   * `sticky` ocupa su alto en el flujo (el contenido empieza abajo). `fixed` se
   * superpone: para un hero que tiene que llegar hasta arriba de la ventana.
   */
  position?: "sticky" | "fixed"
  /** Cuántos px de scroll la despegan. Por defecto, 12. */
  scrollThreshold?: number
}

/**
 * La barra de navegación de un sitio o de un portal: la superficie, la posición y
 * el comportamiento al scrollear. El contenido va en `NavbarContent`.
 *
 * Expone `data-scrolled` y `data-variant` en el `<header>`, para que un hijo
 * pueda cambiar con ella (`group-data-scrolled/navbar:…`).
 *
 * Con `prefers-reduced-motion` la barra cambia igual, pero sin transición: lo
 * corta el reset de `base.css`.
 */
function Navbar({ className, variant = "bar", position = "sticky", scrollThreshold = 12, children, ...props }: NavbarProps) {
  const scrolled = useScrolled(scrollThreshold)
  const floating = variant === "floating" && scrolled
  return (
    <header
      data-slot="navbar"
      data-variant={variant}
      data-scrolled={scrolled ? "" : undefined}
      className={cn(
        "group/navbar top-0 z-50 w-full transition-[padding] duration-300 ease-out",
        position === "fixed" ? "fixed inset-x-0" : "sticky",
        floating ? "px-3 pt-3 sm:px-4" : "px-0 pt-0",
        className
      )}
      {...props}
    >
      <div
        data-slot="navbar-surface"
        className={cn(
          "border border-transparent transition-[background-color,border-color,border-radius,box-shadow,backdrop-filter] duration-300 ease-out",
          !scrolled && "rounded-none bg-transparent",
          // El 80 % deja ver lo que pasa por debajo; el blur lo vuelve una textura y no ruido.
          scrolled && "bg-background-100/80 backdrop-blur-md backdrop-saturate-150",
          scrolled && !floating && "rounded-none border-b-gray-400",
          floating && "mx-auto max-w-6xl rounded-2xl border-gray-400 shadow-menu"
        )}
      >
        {children}
      </div>
    </header>
  )
}

/** La fila de la barra: alto de 56px, ancho de contenido y los extremos separados. */
function NavbarContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="navbar-content"
      className={cn("mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6", className)}
      {...props}
    />
  )
}

export { Navbar, NavbarContent, type NavbarProps }
