"use client"

import { lazy, Suspense, useState } from "react"
import { Button } from "sebs7n-ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "sebs7n-ui/dialog"
import { Skeleton } from "sebs7n-ui/skeleton"

import { CUSTOMERS_MOCK } from "../_data/customers-mock"
import type { Invoice } from "../_data/invoices-mock"

// El formulario trae Combobox, InputGroup y TagsInput: se pide recién al abrir el diálogo (`lazy`, no
// `next/dynamic`, que mete un preload en el HTML). Quien no emite una factura no paga ese peso.
const NewInvoiceForm = lazy(() => import("./new-invoice-form"))

interface NewInvoiceDialogProps {
  onAddInvoice: (inv: Omit<Invoice, "id" | "status">) => Invoice
  /** Los clientes a elegir: los del store. Sin ellos, los del ejemplo. */
  customers?: string[]
  /** El cliente ya elegido, cuando se abre desde su ficha. */
  defaultCustomer?: string
  /** Para abrirlo desde afuera (soltar un PDF sobre Facturas). Sin `open`, lo abre su botón. */
  open?: boolean
  onOpenChange?: (open: boolean) => void
  /** El nombre del archivo que se soltó: queda como comprobante de la factura. */
  attachment?: string
  /** Sin el botón «Nueva factura»: cuando se abre solo desde afuera. */
  hideTrigger?: boolean
}

export function NewInvoiceDialog({
  onAddInvoice,
  customers = CUSTOMERS_MOCK.map((customer) => customer.name),
  defaultCustomer,
  open: openProp,
  onOpenChange,
  attachment,
  hideTrigger = false,
}: NewInvoiceDialogProps) {
  const [ownOpen, setOwnOpen] = useState(false)
  const open = openProp ?? ownOpen
  const setOpen = (next: boolean) => {
    setOwnOpen(next)
    onOpenChange?.(next)
  }

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      {/* En el teléfono, a ancho completo: es la acción principal y la que se busca con el pulgar. */}
      {!hideTrigger && <DialogTrigger render={<Button className="w-full sm:w-auto">Nueva factura</Button>} />}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nueva factura</DialogTitle>
          <DialogDescription>Completá los datos para emitir un nuevo comprobante de cobro.</DialogDescription>
        </DialogHeader>
        <Suspense
          fallback={
            <div aria-busy="true" className="flex flex-col gap-4">
              {Array.from({ length: 4 }, (_, i) => (
                <Skeleton className="h-9 w-full" key={i} />
              ))}
            </div>
          }
        >
          <NewInvoiceForm attachment={attachment} customers={customers} defaultCustomer={defaultCustomer} onAddInvoice={onAddInvoice} onClose={() => setOpen(false)} />
        </Suspense>
      </DialogContent>
    </Dialog>
  )
}
