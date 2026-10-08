"use client"

import Link from "next/link"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport
} from "sebs7n-ui/navigation-menu"

import { NAV } from "./site-nav-data"

/** La barra con paneles: Docs, Componentes y Templates se despliegan, Playground es un link. Diferida desde `site-nav-lazy`. */
export default function SiteNav() {
  return (
    <NavigationMenu aria-label="Secciones" render={<nav />}>
      <NavigationMenuList>
        {NAV.map((entry) => (
          <NavigationMenuItem key={entry.label}>
            {entry.items ? (
              <>
                <NavigationMenuTrigger>{entry.label}</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid gap-0.5">
                    {entry.items.map((item) => (
                      <li key={item.href}>
                        <NavigationMenuLink description={item.description} render={<Link href={item.href} />} title={item.title} />
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </>
            ) : (
              <NavigationMenuLink render={<Link href={entry.href} />}>{entry.label}</NavigationMenuLink>
            )}
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
      <NavigationMenuViewport />
    </NavigationMenu>
  )
}
