"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Badge } from "sebs7n-ui/badge"
import { Navbar, NavbarContent } from "sebs7n-ui/navbar"
import { NavbarLink } from "sebs7n-ui/navbar-link"
import { ThemeSwitcher } from "sebs7n-ui/theme-switcher"

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
            <NavbarLink
              active={pathname.startsWith(link.href.split("/").slice(0, 3).join("/"))}
              key={link.href}
              render={<Link href={link.href} />}
            >
              {link.label}
            </NavbarLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <SearchButton />
          <NavbarLink className="hidden sm:inline-flex" href="https://github.com/sebafermanelli/sebs7n-ui" rel="noreferrer" target="_blank">
            GitHub
          </NavbarLink>
          <ThemeSwitcher />
        </div>
      </NavbarContent>
    </Navbar>
  )
}
