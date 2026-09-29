"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Badge } from "sebs7n-ui/badge"
import { Navbar } from "sebs7n-ui/navbar"
import { ThemeSwitcher } from "sebs7n-ui/theme-switcher"
import { cn } from "sebs7n-ui/lib/utils"

import { SearchButton } from "./search"

const LINKS = [
  { href: "/docs/instalacion", label: "Docs" },
  { href: "/docs/components/button", label: "Componentes" },
  { href: "/docs/tokens", label: "Tokens" },
  { href: "/docs/changelog", label: "Changelog" },
]

export function SiteHeader({ version }: { version: string }) {
  const pathname = usePathname()
  return (
    // El `Navbar` flotante del paquete: transparente arriba y una píldora de vidrio al
    // scrollear. El ancho es el de la página desde el principio y el aire de arriba es fijo:
    // al aparecer la píldora no se corre nada, ni de costado ni para abajo.
    <Navbar
      className="mx-auto max-w-[90rem] px-3 pt-3 md:px-4"
      surfaceClassName="max-w-none rounded-full"
      variant="floating"
    >
      <div className="flex h-14 w-full items-center gap-4 px-4">
        <Link
          className="flex shrink-0 items-center gap-2 rounded-sm outline-none focus-visible:focus-ring"
          href="/"
        >
          <span className="size-5 rounded-control bg-label" />
          <span className="text-heading-16 text-label">sebs7n-ui</span>
          <Badge size="sm">{version}</Badge>
        </Link>

        <nav aria-label="Secciones" className="hidden items-center gap-1 lg:flex">
          {LINKS.map((link) => (
            <Link
              className={cn(
                "rounded-control px-2 py-1 text-copy-14 outline-none transition-control hover:text-label focus-visible:focus-ring",
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
            className="hidden rounded-control px-2 py-1 text-copy-14 text-label-secondary outline-none transition-control hover:text-label focus-visible:focus-ring sm:inline"
            href="https://github.com/sebafermanelli/sebs7n-ui"
            rel="noreferrer"
            target="_blank"
          >
            GitHub
          </a>
          <ThemeSwitcher />
        </div>
      </div>
    </Navbar>
  )
}
