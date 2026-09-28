"use client"

import { BookOpenIcon, FileTextIcon, PaletteIcon, ReceiptIcon, ShieldCheckIcon, UsersIcon } from "lucide-react"
import { useId } from "react"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from "sebs7n-ui/navigation-menu"
import { menuLabelClassName } from "sebs7n-ui/variants/menu"

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
                  description="Una dependencia y cuatro variables"
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

/**
 * Columnas con título
 * El título de cada columna usa `menuLabelClassName`, el mismo de los menús, y la lista lo toma
 * con `aria-labelledby` para que el lector anuncie la columna.
 */
export function Columnas() {
  const id = useId()
  return (
    <NavigationMenu render={<div />}>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Facturación</NavigationMenuTrigger>
          <NavigationMenuContent className="sm:w-[32rem]">
            <div className="grid gap-2 sm:grid-cols-2">
              <div>
                <p className={menuLabelClassName} id={`${id}-emitir`}>
                  Emitir
                </p>
                <ul aria-labelledby={`${id}-emitir`} className="grid gap-0.5">
                  <li>
                    <NavigationMenuLink description="A cliente, con CAE" href="#facturas" icon={<ReceiptIcon />} title="Facturas" />
                  </li>
                  <li>
                    <NavigationMenuLink description="Para anular o corregir" href="#notas" icon={<FileTextIcon />} title="Notas de crédito" />
                  </li>
                </ul>
              </div>
              <div>
                <p className={menuLabelClassName} id={`${id}-administrar`}>
                  Administrar
                </p>
                <ul aria-labelledby={`${id}-administrar`} className="grid gap-0.5">
                  <li>
                    <NavigationMenuLink description="Datos fiscales y contactos" href="#clientes" icon={<UsersIcon />} title="Clientes" />
                  </li>
                </ul>
              </div>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
      <NavigationMenuViewport />
    </NavigationMenu>
  )
}
