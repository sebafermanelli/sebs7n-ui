import { Navbar, NavbarContent } from "sebs7n-ui/navbar"
import { NavbarLink } from "sebs7n-ui/navbar-link"
import { buttonVariants } from "sebs7n-ui/variants/button"

import { CTA_HREF, NAV_LINKS, PRODUCT } from "../_data/content"

// La barra translúcida de iCloud. Su CTA va en gris: el acento de la primera pantalla es el del hero.
export function LandingNavbar() {
  return (
    <Navbar>
      <NavbarContent maxWidth={1080}>
        <span className="text-headline text-label">{PRODUCT.name}</span>
        <nav aria-label="Secciones" className="ml-auto hidden items-center gap-1 sm:flex">
          {NAV_LINKS.map((link) => (
            <NavbarLink href={link.href} key={link.href}>
              {link.label}
            </NavbarLink>
          ))}
        </nav>
        <a className={buttonVariants({ variant: "secondary", size: "sm", className: "ml-auto sm:ml-2" })} href={CTA_HREF}>
          Empezar
        </a>
      </NavbarContent>
    </Navbar>
  )
}
