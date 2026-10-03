"use client"

import { lazy, Suspense, useState } from "react"
import { Button } from "sebs7n-ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "sebs7n-ui/dialog"
import { Skeleton } from "sebs7n-ui/skeleton"

import type { CustomerRecord } from "../_data/customers-mock"

// País y teléfono traen la lista de países con sus códigos: el formulario se pide recién al abrir el
// diálogo (`lazy`), no con la pantalla de Clientes.
const NewCustomerForm = lazy(() => import("./new-customer-form"))

interface NewCustomerDialogProps {
  /** Los nombres que ya existen: dos clientes con el mismo nombre se confundirían en las facturas. */
  existingNames: string[]
  onAddCustomer: (input: Omit<CustomerRecord, "id">) => CustomerRecord
  /** Para llevar al detalle del recién creado. */
  onCreated?: (customer: CustomerRecord) => void
}

export function NewCustomerDialog({ existingNames, onAddCustomer, onCreated }: NewCustomerDialogProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger render={<Button className="w-full sm:w-auto" variant="secondary">Nuevo cliente</Button>} />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nuevo cliente</DialogTitle>
          <DialogDescription>Con estos datos se le emiten las facturas y se le mandan los recordatorios.</DialogDescription>
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
          <NewCustomerForm existingNames={existingNames} onAddCustomer={onAddCustomer} onClose={() => setOpen(false)} onCreated={onCreated} />
        </Suspense>
      </DialogContent>
    </Dialog>
  )
}
