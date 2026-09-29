"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Badge } from "sebs7n-ui/badge"
import { Navbar, NavbarContent } from "sebs7n-ui/navbar"
import { ThemeSwitcher } from "sebs7n-ui/theme-switcher"
import { cn } from "sebs7n-ui/lib/utils"

import { SearchButton } from "./search"

const LINKS = [
  { href: "/docs/instalacion", label: "Docs" },
  { href: "/docs/components/button", label: "Componentes" },
  { href: "/docs/tokens", label: "Tokens" },
]

export function SiteHeader({ version }: { version: string }) {
  const pathname = usePathname()
  return (
    // El `Navbar` del paquete: la barra de la home de iCloud, a todo el ancho, 44 de alto y translúcida.
    <Navbar>
      <NavbarContent className="justify-start">
        <Link
          className="flex shrink-0 items-center gap-2 rounded-sm outline-none focus-visible:focus-ring"
          href="/"
        >
          <span className="size-5 rounded-control bg-label" />
          <span className="text-headline text-label">sebs7n-ui</span>
          <Badge size="sm">{version}</Badge>
        </Link>

        <nav aria-label="Secciones" className="hidden items-center gap-1 lg:flex">
          {LINKS.map((link) => (
            <Link
              className={cn(
                "rounded-control px-2 py-1 text-callout outline-none transition-control hover:bg-fill-2 hover:text-label focus-visible:focus-ring",
                pathname.startsWith(link.href.split("/").slice(0, 3).join("/")) ? "text-label" : "text-label-secondary"
              )}
              href={link.href}
              key={link.href}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <SearchButton />
          <a
            className="hidden h-8 items-center rounded-control px-2 text-callout text-label-secondary outline-none transition-control hover:text-label focus-visible:focus-ring sm:inline-flex"
            href="https://github.com/sebafermanelli/sebs7n-ui"
            rel="noreferrer"
            target="_blank"
          >
            GitHub
          </a>
          <ThemeSwitcher />
        </div>
      </NavbarContent>
    </Navbar>
  )
}
