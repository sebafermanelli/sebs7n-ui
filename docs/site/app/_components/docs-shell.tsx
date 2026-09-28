"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type { ReactNode } from "react"
import { AppShell } from "sebs7n-ui/app-shell"
import { Badge } from "sebs7n-ui/badge"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarSearch,
} from "sebs7n-ui/sidebar"
import { ThemeSwitcher } from "sebs7n-ui/theme-switcher"
import { TooltipProvider } from "sebs7n-ui/tooltip"

import { DocsNav } from "./docs-nav"
import { useGlassConfig } from "./glass-config"
import { SearchButton, useSearch } from "./search"

const REPO = "https://github.com/sebafermanelli/sebs7n-ui"

type Grupo = { id: string; title: string; items: { title: string; href: string }[] }

function Marca({ version }: { version: string }) {
  return (
    <Link
      className="flex h-8 min-w-0 items-center gap-2 rounded-sm px-1 outline-none focus-visible:focus-ring"
      href="/"
    >
      <span className="size-5 shrink-0 rounded-control bg-gray-1000" />
      <span className="truncate text-heading-16 text-gray-1000">sebs7n-ui</span>
      <Badge size="sm">{version}</Badge>
    </Link>
  )
}

function DocsSidebar({ nav, version }: { nav: Grupo[]; version: string }) {
  const { abrir } = useSearch()
  return (
    <Sidebar>
      <SidebarHeader>
        <Marca version={version} />
        {/* El atajo lo escucha SearchProvider; SidebarSearch solo lo muestra y lo anuncia. */}
        <SidebarSearch onClick={abrir} shortcut="⌘K" />
      </SidebarHeader>
      <SidebarContent aria-label="Documentación">
        <DocsNav nav={nav} />
      </SidebarContent>
      <SidebarFooter className="flex-row items-center justify-between gap-2">
        <a
          className="rounded-control px-2 py-1 text-copy-14 text-gray-900 outline-none transition-control hover:text-gray-1000 focus-visible:focus-ring"
          href={REPO}
          rel="noreferrer"
          target="_blank"
        >
          GitHub
        </a>
        <ThemeSwitcher />
      </SidebarFooter>
    </Sidebar>
  )
}

/**
 * El shell del paquete, usado tal cual: el Sidebar queda pegado al borde de la ventana y a todo
 * el alto, y en mobile AppShell lo mete en un Sheet detrás de la hamburguesa de `mobileBar`.
 */
export function DocsShell({ nav, version, children }: { nav: Grupo[]; version: string; children: ReactNode }) {
  const pathname = usePathname()
  const { config } = useGlassConfig()
  return (
    // El `TooltipProvider` vive acá y no en `providers.tsx`: todos los tooltips del sitio están
    // bajo /docs (demos, catálogo de íconos, Playground, el Sidebar colapsado). En el layout raíz
    // metía el Tooltip entero de Base UI —con su posicionamiento de floating-ui— en el arranque
    // del home, que no tiene ninguno. Envuelve el shell entero, Sidebar incluido: para las
    // páginas de /docs no cambia nada.
    <TooltipProvider>
      <AppShell
        ambient={config.ambient}
        mainId="contenido"
        mobileBar={
          <>
            <Marca version={version} />
            <span className="ml-auto" />
            <SearchButton compact />
            <ThemeSwitcher />
          </>
        }
        pathname={pathname}
        sidebar={<DocsSidebar nav={nav} version={version} />}
      >
        {children}
      </AppShell>
    </TooltipProvider>
  )
}
