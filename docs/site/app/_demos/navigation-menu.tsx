"use client"

import { BookOpenIcon, PaletteIcon, ShieldCheckIcon } from "lucide-react"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from "sebs7n-ui/navigation-menu"

/**
 * Un panel con links
 * `NavigationMenuViewport` va una sola vez, hermano de la lista.
 */
export function Basico() {
  return (
    <NavigationMenu render={<div />}>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Documentación</NavigationMenuTrigger>
          <NavigationMenuContent className="sm:w-[28rem]" keepMounted>
            <ul className="grid gap-0.5 sm:grid-cols-2">
              <li>
                <NavigationMenuLink
                  description="Una dependencia y tres variables"
                  href="/docs/instalacion"
                  icon={<BookOpenIcon />}
                  title="Instalación"
                />
              </li>
              <li>
                <NavigationMenuLink
                  description="Color, tipografía, radios y sombras"
                  href="/docs/tokens"
                  icon={<PaletteIcon />}
                  title="Tokens"
                />
              </li>
              <li>
                <NavigationMenuLink
                  description="Lo que garantiza el paquete"
                  href="/docs/accesibilidad"
                  icon={<ShieldCheckIcon />}
                  title="Accesibilidad"
                />
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink href="/docs/changelog">Changelog</NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
      <NavigationMenuViewport />
    </NavigationMenu>
  )
}
