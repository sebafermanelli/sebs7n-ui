"use client"

import * as React from "react"
import { MenuIcon } from "lucide-react"

import { defined } from "../internal/defined.js"
import { renderElement, type RenderElement } from "../lib/render.js"
import { cn } from "../lib/utils.js"
import { Button } from "./button.js"
import { Drawer, DrawerBody, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "./drawer.js"
import { ThemeSwitcher } from "./theme-switcher.js"

/**
 * El menú de navegación de una barra en el teléfono: un botón de ícono que abre la hoja de abajo con
 * los links a 44 px de alto, un pie opcional (la CTA) y el tema.
 *
 * ```tsx
 * <NavbarMobileMenu
 *   title="Menú"
 *   items={[{ href: "#beneficios", label: "Beneficios" }, { href: "#precios", label: "Precios" }]}
 *   footer={<a className={buttonVariants({ className: "w-full" })} href="#registro">Empezar</a>}
 * />
 * ```
 *
 * - Se oculta desde `md` (`md:hidden`); `className` lo cambia. El `Drawer` se monta recién al abrirlo.
 * - Elegir un link cierra la hoja. `item.render` recibe el link del router (`<Link href="…" />`).
 * - Escape y el botón de cierre salen del `Drawer`; el foco vuelve al botón.
 */
type NavbarMobileMenuItem = {
  href: string
  label: string
  /** La página actual: `aria-current="page"`. */
  active?: boolean
  /** El link del router: `render={<Link href="/precios" />}`. */
  render?: RenderElement
}

type NavbarMobileMenuLabels = {
  /** El nombre del botón que abre el menú. */
  open: string
  /** El nombre del grupo de links. */
  navigation: string
  /** El nombre de la fila del tema. */
  theme: string
}

/** Los textos por defecto (el componente es solo por subpath: no están en `defaultLabels`). */
const navbarMobileMenuLabels: NavbarMobileMenuLabels = { open: "Abrir menú", navigation: "Secciones", theme: "Tema" }

type NavbarMobileMenuProps = Omit<React.ComponentProps<"button">, "title" | "children"> & {
  /** El título de la hoja (su nombre accesible). */
  title: string
  /** Una línea bajo el título, para el lector. */
  description?: string
  items: NavbarMobileMenuItem[]
  /** Va al pie de la hoja: la CTA de la barra. */
  footer?: React.ReactNode
  /** Muestra la fila del tema (`ThemeSwitcher`). Default `false`. */
  showTheme?: boolean
  labels?: Partial<NavbarMobileMenuLabels>
}

function NavbarMobileMenu({ title, description, items, footer, showTheme = false, labels: labelsProp, className, ...props }: NavbarMobileMenuProps) {
  const labels = { ...navbarMobileMenuLabels, ...defined(labelsProp) }
  const [open, setOpen] = React.useState(false)
  return (
    <Drawer onOpenChange={setOpen} open={open}>
      <DrawerTrigger
        render={<Button aria-label={labels.open} className={cn("md:hidden", className)} size="icon-sm" variant="plain" {...props} />}
      >
        <MenuIcon aria-hidden="true" />
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{title}</DrawerTitle>
          <DrawerDescription className={description ? undefined : "sr-only"}>{description ?? title}</DrawerDescription>
        </DrawerHeader>
        <DrawerBody className="flex flex-col gap-1 pb-5">
          <nav aria-label={labels.navigation} className="flex flex-col">
            {items.map((item) =>
              renderElement(item.render, "a", {
                key: item.href,
                href: item.href,
                "aria-current": item.active ? "page" : undefined,
                "data-slot": "navbar-mobile-menu-link",
                onClick: () => setOpen(false),
                className: cn(
                  "flex min-h-11 items-center rounded-control px-2 text-body text-label outline-none transition-control hover:bg-fill-1 focus-visible:focus-ring",
                  item.active && "bg-fill-2 font-semibold"
                ),
                children: item.label,
              })
            )}
          </nav>
          {showTheme && (
            <div className="mt-2 flex items-center justify-between gap-3 px-2">
              <span className="text-callout text-label-secondary">{labels.theme}</span>
              <ThemeSwitcher />
            </div>
          )}
        </DrawerBody>
        {footer != null && <DrawerFooter>{footer}</DrawerFooter>}
      </DrawerContent>
    </Drawer>
  )
}

export { NavbarMobileMenu, navbarMobileMenuLabels, type NavbarMobileMenuItem, type NavbarMobileMenuLabels, type NavbarMobileMenuProps }
