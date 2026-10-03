"use client"

import dynamic from "next/dynamic"
import { NavbarLink } from "sebs7n-ui/navbar-link"

import { NAV } from "../_data/content"

// Los destinos de primer nivel como links comunes: es lo que se ve y funciona hasta que llega el menú.
function SiteNavFallback() {
  return (
    <nav aria-label="Secciones" className="flex items-center gap-1">
      {NAV.map((entry) => (
        <NavbarLink href={entry.href} key={entry.label}>
          {entry.label}
        </NavbarLink>
      ))}
    </nav>
  )
}

// El menú con paneles (Base UI + posicionador) se pide después de hidratar: la landing no paga su JS al abrir.
const SiteNav = dynamic(() => import("./site-nav"), { ssr: false, loading: () => <SiteNavFallback /> })

export function SiteNavLazy() {
  return <SiteNav />
}
