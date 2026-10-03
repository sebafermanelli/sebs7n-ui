"use client"

import dynamic from "next/dynamic"
import Link from "next/link"
import { NavbarLink } from "sebs7n-ui/navbar-link"

import { NAV } from "./site-nav-data"

// Los destinos de primer nivel como links comunes: es lo que se ve y funciona hasta que llega el menú.
function SiteNavFallback() {
  return (
    <nav aria-label="Secciones" className="flex items-center gap-1">
      {NAV.map((entry) => (
        <NavbarLink key={entry.label} render={<Link href={entry.href} />}>
          {entry.label}
        </NavbarLink>
      ))}
    </nav>
  )
}

// El menú con paneles (Base UI + posicionador) se pide después de hidratar: la página no paga su JS al abrir.
const SiteNav = dynamic(() => import("./site-nav"), { ssr: false, loading: () => <SiteNavFallback /> })

export function SiteNavLazy() {
  return <SiteNav />
}
