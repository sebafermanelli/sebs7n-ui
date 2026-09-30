import type * as React from "react"

import { cn } from "../lib/utils.js"
import { renderElement, type RenderElement } from "../lib/render.js"
import { navbarLinkClassName } from "../variants/navbar-link.js"

type NavbarLinkProps = React.ComponentProps<"a"> & {
  /** La página actual: la pinta en `label` y pone `aria-current="page"`. */
  active?: boolean
  /** Un ícono solo, en el cuadrado de 28 (pide `aria-label`). */
  icon?: boolean
  /** El link del router: `render={<Link href="/ayuda" />}`. */
  render?: RenderElement
}

/**
 * Un link de texto de la barra. Ver `navbarLinkClassName` para el porqué del color.
 *
 * ```tsx
 * <NavbarContent>
 *   <Logo />
 *   <nav aria-label="Principal" className="flex items-center gap-1">
 *     <NavbarLink render={<Link href="/precios" />} active={pathname === "/precios"}>Precios</NavbarLink>
 *     <NavbarLink render={<Link href="/ayuda" />}>Ayuda</NavbarLink>
 *     <Button size="sm" render={<Link href="/ingresar" />}>Ingresar</Button>
 *   </nav>
 * </NavbarContent>
 * ```
 *
 * Sin estado ni hooks: sirve en un Server Component y sale como `<a>` real en el HTML.
 */
function NavbarLink({ active = false, icon = false, render, className, ...props }: NavbarLinkProps) {
  return renderElement(render, "a", {
    "data-slot": "navbar-link",
    "data-active": active ? "" : undefined,
    "aria-current": active ? "page" : undefined,
    ...props,
    className: cn(navbarLinkClassName({ icon }), className),
  })
}

export { NavbarLink, type NavbarLinkProps }
