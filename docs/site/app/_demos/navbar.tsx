"use client"

import { buttonVariants } from "sebs7n-ui/variants/button"
import { Navbar, NavbarContent } from "sebs7n-ui/navbar"

/**
 * Las dos variantes
 * Las dos en el estado scrolleado (`scrollThreshold={-1}`), para ver la superficie: `bar` translúcida con blur y borde abajo, `floating` despegada en una píldora. Scrolleá dentro de cada recuadro para ver el contenido pasar por debajo. Arriba de todo, las dos son transparentes y a todo el ancho.
 */
export function Variantes() {
  return (
    <div className="flex w-full flex-col gap-6">
      {(["bar", "floating"] as const).map((variant) => (
        <div className="relative h-56 w-full overflow-y-auto rounded-xl border border-gray-400 bg-background" key={variant}>
          <Navbar scrollThreshold={-1} variant={variant}>
            <NavbarContent>
              <span className="text-heading-16 text-gray-1000">Marca</span>
              <nav aria-label={`Demo ${variant}`} className="flex items-center gap-1">
                <a className={buttonVariants({ variant: "ghost", size: "sm" })} href="#ejemplos">
                  Ayuda
                </a>
                <a className={buttonVariants({ size: "sm" })} href="#ejemplos">
                  Ingresar
                </a>
              </nav>
            </NavbarContent>
          </Navbar>
          <div className="flex flex-col gap-3 p-6">
            {Array.from({ length: 8 }, (_, i) => (
              <div className="h-10 rounded-md bg-gray-100" key={i} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
