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

import { DocsNav } from "./docs-nav"
import { SearchButton, useSearch } from "./search"

const REPO = "https://github.com/sebafermanelli/sebs7n-ui"

type Grupo = { id: string; title: string; items: { title: string; href: string }[] }

function Marca({ version }: { version: string }) {
  return (
    <Link
      className="flex h-8 min-w-0 items-center gap-2 rounded-sm px-1 outline-none focus-visible:focus-ring"
      href="/"
    >
      <span className="size-5 shrink-0 rounded-md bg-gray-1000" />
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
          className="rounded-md px-2 py-1 text-copy-14 text-gray-900 outline-none transition-control hover:text-gray-1000 focus-visible:focus-ring"
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
  return (
    <AppShell
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
