"use client"

import { useState } from "react"
import { Button } from "sebs7n-ui/button"
import { EntityOverlay, useEntityOverlay } from "sebs7n-ui/entity-overlay"
import { Field, FieldLabel } from "sebs7n-ui/field"
import { Form } from "sebs7n-ui/form"
import { Input } from "sebs7n-ui/input"

function InvoiceForm() {
  const overlay = useEntityOverlay()
  return (
    <Form
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault()
        overlay?.markSaved()
        overlay?.close()
      }}
    >
      <Field name="client">
        <FieldLabel>Cliente</FieldLabel>
        <Input />
      </Field>
      <Button type="submit">Guardar</Button>
    </Form>
  )
}

/**
 * Alta en un Dialog, edición en un Sheet
 * Escribí algo y cerrá con Escape: pide confirmación. Con la URL como estado, `open` es `searchParams.has("new")` y `onClose` saca el parámetro.
 */
export function Basic() {
  const [open, setOpen] = useState<"new" | "edit" | null>(null)
  return (
    <div className="flex gap-2">
      <Button onClick={() => setOpen("new")}>Nueva factura</Button>
      <Button onClick={() => setOpen("edit")} variant="secondary">
        Editar factura
      </Button>
      <EntityOverlay onClose={() => setOpen(null)} open={open === "new"} title="Nueva factura" variant="dialog">
        <InvoiceForm />
      </EntityOverlay>
      <EntityOverlay description="Cambiá los datos de la factura." onClose={() => setOpen(null)} open={open === "edit"} title="Editar factura" variant="sheet">
        <InvoiceForm />
      </EntityOverlay>
    </div>
  )
}
