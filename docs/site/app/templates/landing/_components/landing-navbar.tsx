import { ArrowLeftIcon } from "lucide-react"
import Link from "next/link"
import { Navbar, NavbarContent } from "sebs7n-ui/navbar"
import { buttonVariants } from "sebs7n-ui/variants/button"

import { CTA_HREF, PRODUCT } from "../_data/content"
import { GALLERY_PATH } from "../_lib/routes"
import { MobileMenuButton } from "./mobile-menu-lazy"
import { SiteNavLazy } from "./site-nav-lazy"
import { ThemeToggle } from "./theme-toggle"

// La barra translúcida de iCloud. Su CTA va en gris: el acento de la primera pantalla es el del hero.
// En el teléfono (390 px) no entra todo: queda la vuelta (solo el ícono), el nombre de la marca y un botón
// que abre la hoja con las secciones, el tema y el registro.
export function LandingNavbar() {
  return (
    <Navbar>
      <NavbarContent maxWidth={1080}>
        {GALLERY_PATH && (
          <>
            <Link className={buttonVariants({ variant: "plain", size: "sm" })} href={GALLERY_PATH}>
              <ArrowLeftIcon />
              <span className="max-sm:sr-only">Templates</span>
            </Link>
            <span aria-hidden="true" className="text-label-tertiary max-sm:hidden">
              /
            </span>
          </>
        )}
        <span className="min-w-0 truncate text-headline text-label">{PRODUCT.name}</span>
        <div className="ml-auto hidden items-center gap-2 sm:flex">
          <SiteNavLazy />
          <ThemeToggle />
          <a className={buttonVariants({ variant: "secondary", size: "sm" })} href={CTA_HREF}>
            Empezar
          </a>
        </div>
        <div className="ml-auto sm:hidden">
          <MobileMenuButton />
        </div>
      </NavbarContent>
    </Navbar>
  )
}
