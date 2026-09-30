"use client"

import { UserIcon } from "lucide-react"
import { Button } from "sebs7n-ui/button"
import { Navbar, NavbarContent } from "sebs7n-ui/navbar"
import { NavbarLink } from "sebs7n-ui/navbar-link"

/**
 * La barra global
 * La barra global de la home de iCloud: a todo el ancho, 44 de alto, translúcida con desenfoque y con el borde abajo desde el principio. Scrolleá dentro del recuadro: el contenido pasa por debajo, desenfocado, y la barra no cambia. Sobre el wallpaper (`data-ambient`) usa un fill más liviano, para que el wallpaper se vea a través.
 */
export function Variantes() {
  return (
    <div className="relative h-56 w-full overflow-y-auto rounded-surface border border-separator bg-background">
      <Navbar>
        <NavbarContent>
          <span className="text-title-3 text-label">
            Marca <span className="text-brand-900">Docs</span>
          </span>
          <nav aria-label="Demo de la barra" className="flex items-center gap-1">
            <NavbarLink active href="#ejemplos">
              Facturas
            </NavbarLink>
            <NavbarLink href="#ejemplos">Ayuda</NavbarLink>
            <Button aria-label="Cuenta" size="icon-md" variant="ghost">
              <UserIcon />
            </Button>
          </nav>
        </NavbarContent>
      </Navbar>
      <div className="flex flex-col gap-3 p-6">
        {Array.from({ length: 8 }, (_, i) => (
          <div className="h-10 rounded-control bg-fill-1" key={i} />
        ))}
      </div>
    </div>
  )
}

/**
 * En la columna del sitio
 * `maxWidth`: la barra sigue a todo el ancho y su contenido se centra en la columna de la página, alineado con los bloques de abajo.
 */
export function Column() {
  return (
    <div className="relative h-56 w-full overflow-y-auto rounded-surface border border-separator bg-background">
      <Navbar>
        <NavbarContent maxWidth={480}>
          <span className="text-title-3 text-label">Facturación</span>
          <NavbarLink href="#ejemplos">Precios</NavbarLink>
        </NavbarContent>
      </Navbar>
      <div className="mx-auto flex max-w-[480px] flex-col gap-3 px-4 py-6">
        {Array.from({ length: 6 }, (_, i) => (
          <div className="h-10 rounded-control bg-fill-1" key={i} />
        ))}
      </div>
    </div>
  )
}
