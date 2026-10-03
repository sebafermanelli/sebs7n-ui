"use client"

import { PaperclipIcon } from "lucide-react"
import { Button } from "sebs7n-ui/button"
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from "sebs7n-ui/combobox"
import { DialogFooter } from "sebs7n-ui/dialog"
import { Field, FieldDescription, FieldError, FieldLabel } from "sebs7n-ui/field"
import { Form } from "sebs7n-ui/form"
import { Input } from "sebs7n-ui/input"
import { InputGroup, InputGroupAddon, InputGroupInput } from "sebs7n-ui/input-group"
import { TagsInput } from "sebs7n-ui/tags-input"
import { toast } from "sonner"

import type { Invoice } from "../_data/invoices-mock"
import { addDays, today } from "../_lib/format"
import { useInvoicesStore } from "../_state/invoices-context"

interface NewInvoiceFormProps {
  onAddInvoice: (inv: Omit<Invoice, "id" | "status">) => Invoice
  customers: string[]
  defaultCustomer?: string
  attachment?: string
  onClose: () => void
}

// El cuerpo del diálogo, en su propio archivo para pedirlo recién al abrirlo (`lazy` en `new-invoice-dialog`).
export default function NewInvoiceForm({ onAddInvoice, customers, defaultCustomer, attachment, onClose }: NewInvoiceFormProps) {
  const { settings } = useInvoicesStore()
  // El vencimiento arranca según el plazo de Configuración: cambiarlo allá cambia lo que se propone acá.
  const dueDate = addDays(today(), Number(settings.dueDays))

  return (
    // `Form` valida los `Field` registrados y enfoca el primero inválido. Los `FieldError` con `match`
    // fijan el texto: sin eso sale el mensaje nativo, en el idioma del navegador.
    <Form
      onFormSubmit={(values) => {
        const tags = Array.isArray(values.tags) ? (values.tags as string[]) : []
        const created = onAddInvoice({
          customer: String(values.customer),
          concept: String(values.concept),
          amount: Number(values.amount),
          date: today(),
          dueDate: String(values.dueDate),
          ...(tags.length > 0 ? { tags } : {}),
        })
        toast.success(`Factura ${created.id} creada.`)
        onClose()
      }}
    >
      <Field name="customer">
        <FieldLabel required>Cliente</FieldLabel>
        {/* Con muchos clientes se escribe para filtrar: un Select de veinte opciones obliga a recorrerlas. */}
        <Combobox defaultValue={defaultCustomer ?? null} items={customers} required>
          <ComboboxInput placeholder="Buscá un cliente" />
          <ComboboxContent>
            <ComboboxEmpty />
            <ComboboxList>
              {(item: string) => (
                <ComboboxItem key={item} value={item}>
                  {item}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
        <FieldError match="valueMissing">Elegí un cliente</FieldError>
      </Field>

      <Field name="concept">
        <FieldLabel required>Concepto</FieldLabel>
        <Input defaultValue={attachment ? `Comprobante ${attachment}` : undefined} placeholder="Ej. Suscripción mensual o consultoría" required />
        <FieldError match="valueMissing">Falta el concepto</FieldError>
      </Field>

      <Field name="amount">
        <FieldLabel required>Monto</FieldLabel>
        <InputGroup>
          <InputGroupAddon>US$</InputGroupAddon>
          <InputGroupInput inputMode="decimal" min={1} placeholder="5000" required step="0.01" type="number" />
          <InputGroupAddon>USD</InputGroupAddon>
        </InputGroup>
        <FieldError match="valueMissing">Falta el monto</FieldError>
        <FieldError match="rangeUnderflow">El monto mínimo es 1</FieldError>
        <FieldError match="stepMismatch">Hasta dos decimales</FieldError>
      </Field>

      <Field name="dueDate">
        <FieldLabel required>Fecha de vencimiento</FieldLabel>
        <Input defaultValue={dueDate} required type="date" />
        <FieldDescription>{`Según tu configuración: ${settings.dueDays} días.`}</FieldDescription>
        <FieldError match="valueMissing">Falta la fecha de vencimiento</FieldError>
      </Field>

      <Field name="tags">
        <FieldLabel>Etiquetas</FieldLabel>
        <TagsInput addOnBlur max={5} placeholder="Ej. urgente, anual" />
        <FieldDescription>Hasta 5. Sirven para buscar y agrupar. Enter o coma para agregar.</FieldDescription>
      </Field>

      {attachment && (
        <p className="flex items-center gap-2 text-callout text-label-secondary">
          <PaperclipIcon aria-hidden="true" className="size-4" />
          <span className="min-w-0 truncate">{`Comprobante adjunto: ${attachment}`}</span>
        </p>
      )}

      <DialogFooter>
        <Button onClick={onClose} type="button" variant="secondary">
          Cancelar
        </Button>
        <Button type="submit">Emitir factura</Button>
      </DialogFooter>
    </Form>
  )
}
