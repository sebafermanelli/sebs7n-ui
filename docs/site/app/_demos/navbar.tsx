"use client"

import { UserIcon } from "lucide-react"
import { Button } from "sebs7n-ui/button"
import { buttonVariants } from "sebs7n-ui/variants/button"
import { Navbar, NavbarContent } from "sebs7n-ui/navbar"

/**
 * La barra global
 * La barra de una app de iCloud: a todo el ancho, 44 de alto, opaca y con el borde abajo desde el principio. Scrolleá dentro del recuadro: el contenido pasa por debajo y la barra no cambia. Sobre el wallpaper de `AppShell ambient` pasa a `material-translucent`.
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
            <a className={buttonVariants({ variant: "ghost", size: "sm" })} href="#ejemplos">
              Ayuda
            </a>
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
