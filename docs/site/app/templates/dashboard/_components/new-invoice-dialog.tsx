"use client"

import { useState } from "react"
import { Button } from "sebs7n-ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "sebs7n-ui/dialog"
import { Field, FieldError, FieldLabel } from "sebs7n-ui/field"
import { Form } from "sebs7n-ui/form"
import { Input } from "sebs7n-ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "sebs7n-ui/select"
import { toast } from "sonner"
import type { Invoice } from "../_data/invoices-mock"

const CUSTOMERS = [
  "Acme Corporation",
  "Globex Industries",
  "Initech Soluciones",
  "Soylent Logistics",
  "Wayne Enterprises",
]

// La fecha local: `toISOString()` da la de UTC, que en Argentina después de las 21 ya es mañana.
function today() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

interface NewInvoiceDialogProps {
  onAddInvoice: (inv: Omit<Invoice, "id" | "status">) => Invoice
}

export function NewInvoiceDialog({ onAddInvoice }: NewInvoiceDialogProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button>Nueva factura</Button>} />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nueva factura</DialogTitle>
          <DialogDescription>Completá los datos para emitir un nuevo comprobante de cobro.</DialogDescription>
        </DialogHeader>

        {/* `Form` valida los `Field` registrados y enfoca el primero inválido: el error queda en su campo. */}
        <Form
          onFormSubmit={(values) => {
            const created = onAddInvoice({
              customer: String(values.customer),
              concept: String(values.concept),
              amount: Number(values.amount),
              date: today(),
              dueDate: String(values.dueDate),
            })
            toast.success(`Factura ${created.id} creada.`)
            setOpen(false)
          }}
        >
          <Field name="customer">
            <FieldLabel required>Cliente</FieldLabel>
            <Select required>
              <SelectTrigger>
                <SelectValue placeholder="Seleccioná un cliente" />
              </SelectTrigger>
              <SelectContent>
                {CUSTOMERS.map((customer) => (
                  <SelectItem key={customer} value={customer}>
                    {customer}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError />
          </Field>

          <Field name="concept">
            <FieldLabel required>Concepto</FieldLabel>
            <Input placeholder="Ej. Suscripción mensual o consultoría" required />
            <FieldError />
          </Field>

          <Field name="amount">
            <FieldLabel required>Monto (USD)</FieldLabel>
            <Input type="number" min={1} step="0.01" placeholder="Ej. 5000" required />
            <FieldError />
          </Field>

          <Field name="dueDate">
            <FieldLabel required>Fecha de vencimiento</FieldLabel>
            <Input type="date" defaultValue="2026-10-31" required />
            <FieldError />
          </Field>

          <DialogFooter>
            <Button variant="secondary" type="button" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Emitir factura</Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
