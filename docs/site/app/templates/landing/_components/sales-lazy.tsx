"use client"

import dynamic from "next/dynamic"
import { useState } from "react"
import { buttonVariants } from "sebs7n-ui/variants/button"

// El diálogo y su formulario (Dialog, Form, PhoneInput, CountryPicker, Combobox…) pesan más que toda la
// landing: no se bajan hasta el primer click en «Hablar con ventas».
const SalesDialog = dynamic(() => import("./sales-dialog"), { ssr: false })

type SalesButtonProps = { variant?: "default" | "secondary" | "plain"; size?: "md" | "lg"; className?: string; children?: React.ReactNode }

/** El botón que abre el formulario de ventas. Es un `<button>` común hasta que llega el diálogo. */
export function SalesButton({ variant = "secondary", size, className, children = "Hablar con ventas" }: SalesButtonProps) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button aria-haspopup="dialog" className={buttonVariants({ variant, size, className })} onClick={() => setOpen(true)} type="button">
        {children}
      </button>
      {open && <SalesDialog onClose={() => setOpen(false)} />}
    </>
  )
}
