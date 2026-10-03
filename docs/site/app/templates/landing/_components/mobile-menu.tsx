"use client"

import { ThemeSwitcher } from "sebs7n-ui/theme-switcher"
import { Drawer, DrawerBody, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from "sebs7n-ui/drawer"
import { buttonVariants } from "sebs7n-ui/variants/button"

import { CTA_HREF, NAV, PRODUCT } from "../_data/content"

const linkClassName =
  "flex min-h-11 items-center rounded-control px-2 text-body text-label outline-none transition-control hover:bg-fill-1 focus-visible:focus-ring"

/** La hoja del teléfono: las páginas de cada grupo, el tema y el registro al alcance del pulgar. */
export default function MobileMenu({ onClose }: { onClose: () => void }) {
  return (
    <Drawer onOpenChange={(open) => !open && onClose()} open>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{PRODUCT.name}</DrawerTitle>
          <DrawerDescription>Ir a una sección.</DrawerDescription>
        </DrawerHeader>
        <DrawerBody className="flex flex-col gap-1 pb-5">
          <nav aria-label="Secciones" className="flex flex-col">
            {NAV.flatMap((entry) => entry.items ?? [{ href: entry.href, title: entry.label }]).map((item) => (
              <a className={linkClassName} href={item.href} key={item.href} onClick={onClose}>
                {item.title}
              </a>
            ))}
          </nav>
          <div className="mt-2 flex items-center justify-between gap-3 px-2">
            <span className="text-callout text-label-secondary">Tema</span>
            <ThemeSwitcher />
          </div>
        </DrawerBody>
        <DrawerFooter>
          <a className={buttonVariants({ className: "w-full" })} href={CTA_HREF} onClick={onClose}>
            {PRODUCT.primaryCta}
          </a>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
