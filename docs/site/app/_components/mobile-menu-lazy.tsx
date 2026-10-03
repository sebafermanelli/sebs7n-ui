"use client"

import { MenuIcon } from "lucide-react"
import dynamic from "next/dynamic"
import { useState } from "react"
import { buttonVariants } from "sebs7n-ui/variants/button"

// La hoja (Drawer y el selector de tema) no se baja hasta el primer toque.
const MobileMenu = dynamic(() => import("./mobile-menu"), { ssr: false })

export function MobileMenuButton() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        aria-haspopup="dialog"
        aria-label="Abrir el menú"
        className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
        onClick={() => setOpen(true)}
        type="button"
      >
        <MenuIcon />
      </button>
      {open && <MobileMenu onClose={() => setOpen(false)} />}
    </>
  )
}
