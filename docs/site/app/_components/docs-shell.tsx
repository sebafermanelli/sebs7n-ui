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

import { docsWallpaper } from "../_lib/wallpaper"
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
      <span className="size-5 shrink-0 rounded-control bg-label" />
      <span className="truncate text-headline text-label">sebs7n-ui</span>
      <Badge size="sm">{version}</Badge>
    </Link>
  )
}

function GitHub() {
  return (
    <a
      className="inline-flex h-8 items-center rounded-control px-2 text-callout text-label-secondary outline-none transition-control hover:bg-fill-2 hover:text-label focus-visible:focus-ring"
      href={REPO}
      rel="noreferrer"
      target="_blank"
    >
      GitHub
    </a>
  )
}

function DocsSidebar({ nav, version }: { nav: Grupo[]; version: string }) {
  const { abrir } = useSearch()
  return (
    <Sidebar>
      <SidebarHeader>
        {/* En el teléfono no hay barra global: la marca va arriba del Sheet. */}
        <div className="lg:hidden">
          <Marca version={version} />
        </div>
        {/* El atajo lo escucha SearchProvider; SidebarSearch solo lo muestra y lo anuncia. */}
        <SidebarSearch onClick={abrir} shortcut="⌘K" />
      </SidebarHeader>
      <SidebarContent aria-label="Documentación">
        <DocsNav nav={nav} />
      </SidebarContent>
      <SidebarFooter className="flex-row items-center justify-between gap-2 lg:hidden">
        <GitHub />
        <ThemeSwitcher />
      </SidebarFooter>
    </Sidebar>
  )
}

/**
 * El shell del paquete, usado tal cual: la barra global de 44 arriba a todo el ancho, el Sidebar
 * pegado al borde debajo, y en mobile AppShell lo mete en un Sheet detrás de la hamburguesa de
 * `mobileBar`.
 */
export function DocsShell({ nav, version, children }: { nav: Grupo[]; version: string; children: ReactNode }) {
  const pathname = usePathname()
  const { config } = useGlassConfig()
  return (
    <AppShell
      // El wallpaper solo en el Playground (con su switch); el resto de las docs es opaco (W).
      ambient={docsWallpaper(pathname, config.ambient)}
      header={
        <>
          <Marca version={version} />
          <span className="ml-auto" />
          <GitHub />
          <ThemeSwitcher />
        </>
      }
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
  )
}
