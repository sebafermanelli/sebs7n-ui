import Link from "next/link"
import { Badge } from "sebs7n-ui/badge"
import { Navbar, NavbarContent } from "sebs7n-ui/navbar"
import { NavbarLink } from "sebs7n-ui/navbar-link"
import { buttonVariants } from "sebs7n-ui/variants/button"

import { MobileMenuButton } from "./mobile-menu-lazy"
import { SearchButton } from "./search"
import { SiteNavLazy } from "./site-nav-lazy"
import { GITHUB_URL, START_HREF } from "./site-nav-data"
import { ThemeToggle } from "./theme-toggle"

// La barra de la home y de /templates, con la anatomía de la de la landing de referencia: marca a la
// izquierda, menú con paneles, y a la derecha búsqueda, GitHub, tema y «Empezar» en gris (el acento de la
// primera pantalla es el del hero). Server Component: el menú, el tema y la hoja del teléfono llegan diferidos.
export function SiteHeader({ version }: { version: string }) {
  return (
    <Navbar>
      <NavbarContent maxWidth={1080}>
        <Link className="flex shrink-0 items-center gap-2 rounded-sm outline-none focus-visible:focus-ring" href="/">
          <span aria-hidden="true" className="size-5 rounded-control bg-label" />
          <span className="text-headline text-label">sebs7n-ui</span>
          <Badge size="sm">{version}</Badge>
        </Link>
        <div className="hidden lg:block">
          <SiteNavLazy />
        </div>
        <div className="ml-auto hidden items-center gap-2 lg:flex">
          <SearchButton className="sm:w-40" />
          <NavbarLink href={GITHUB_URL} rel="noreferrer" target="_blank">
            GitHub
          </NavbarLink>
          <ThemeToggle />
          <Link className={buttonVariants({ variant: "secondary", size: "sm" })} href={START_HREF}>
            Empezar
          </Link>
        </div>
        <div className="ml-auto flex items-center gap-2 lg:hidden">
          <SearchButton compact />
          <MobileMenuButton />
        </div>
      </NavbarContent>
    </Navbar>
  )
}
