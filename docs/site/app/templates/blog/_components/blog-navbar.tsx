import { ArrowLeftIcon } from "lucide-react"
import Link from "next/link"
import { Navbar, NavbarContent } from "sebs7n-ui/navbar"
import { NavbarLink } from "sebs7n-ui/navbar-link"
import { buttonVariants } from "sebs7n-ui/variants/button"

import { BLOG } from "../_data/posts"
import { BLOG_PATH, GALLERY_PATH } from "../_lib/routes"
import { ThemeToggle } from "./theme-toggle"

// La barra de una lectura: opaca y quieta, sin wallpaper. En el teléfono (390 px) la vuelta queda en el ícono
// y se esconden los links: el nombre de la marca y el tema bastan, y la portada ya es una sola columna.
export function BlogNavbar() {
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
        <Link className="min-w-0 truncate text-headline text-label" href={BLOG_PATH}>
          {BLOG.name}
        </Link>
        <nav aria-label="Secciones" className="ml-auto hidden items-center gap-1 sm:flex">
          <NavbarLink render={<Link href={`${BLOG_PATH}#articulos`} />}>Artículos</NavbarLink>
          <NavbarLink render={<Link href={`${BLOG_PATH}#suscribirse`} />}>Suscribirse</NavbarLink>
        </nav>
        <div className="ml-auto sm:ml-2">
          <ThemeToggle />
        </div>
      </NavbarContent>
    </Navbar>
  )
}
