"use client"

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from "sebs7n-ui/navigation-menu"

import { NAV } from "../_data/content"

/** La barra con paneles: «Producto» y «Ayuda» se despliegan, «Precios» es un link. Diferida desde `site-nav-lazy`. */
export default function SiteNav() {
  return (
    <NavigationMenu aria-label="Secciones" render={<nav />}>
      <NavigationMenuList>
        {NAV.map((entry) => (
          <NavigationMenuItem key={entry.label}>
            {entry.items ? (
              <>
                <NavigationMenuTrigger>{entry.label}</NavigationMenuTrigger>
                <NavigationMenuContent className="sm:w-80">
                  <ul className="grid gap-0.5">
                    {entry.items.map((item) => (
                      <li key={item.href}>
                        <NavigationMenuLink description={item.description} href={item.href} title={item.title} />
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </>
            ) : (
              <NavigationMenuLink href={entry.href}>{entry.label}</NavigationMenuLink>
            )}
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
      <NavigationMenuViewport />
    </NavigationMenu>
  )
}
