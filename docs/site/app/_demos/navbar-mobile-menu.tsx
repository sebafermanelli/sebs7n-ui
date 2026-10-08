"use client"

import { Navbar, NavbarContent } from "sebs7n-ui/navbar"
import { NavbarMobileMenu } from "sebs7n-ui/navbar-mobile-menu"
import { buttonVariants } from "sebs7n-ui/variants/button"

/**
 * El menú de una barra en el teléfono
 * El botón de ícono abre la hoja de abajo con los links a 44 px, el tema y la CTA al pie. Se oculta desde `md`: achicá la ventana para verlo.
 */
export function Basic() {
  return (
    <div className="w-full">
      <Navbar className="static">
        <NavbarContent className="justify-between">
          <span className="text-headline text-label">Marca</span>
          <NavbarMobileMenu
            footer={
              <a className={buttonVariants({ className: "w-full" })} href="#registro">
                Empezar
              </a>
            }
            items={[
              { href: "#beneficios", label: "Beneficios" },
              { href: "#precios", label: "Precios", active: true },
              { href: "#preguntas", label: "Preguntas" },
            ]}
            showTheme
            title="Menú"
          />
        </NavbarContent>
      </Navbar>
    </div>
  )
}
