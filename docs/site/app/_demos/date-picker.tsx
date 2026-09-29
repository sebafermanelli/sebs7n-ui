"use client"

import { useId, useState } from "react"
import { Calendar } from "sebs7n-ui/calendar"
import { DatePicker } from "sebs7n-ui/date-picker"
import { Field, FieldDescription, FieldError, FieldLabel } from "sebs7n-ui/field"
import { Form } from "sebs7n-ui/form"
import { TimePicker } from "sebs7n-ui/time-picker"
import { Button } from "sebs7n-ui/button"
import { DateTimePicker } from "sebs7n-ui/date-time-picker"
import { Label } from "sebs7n-ui/label"
import { LabelsProvider } from "sebs7n-ui/labels"
import type { DateRange } from "sebs7n-ui/lib/dates"

/**
 * Básico
 * El campo es un botón: el `<Label htmlFor>` lo nombra y, al hacerle clic, abre el calendario.
 */
export function Basico() {
  const id = useId()
  return (
    <div className="flex w-full max-w-xs flex-col gap-2">
      <Label htmlFor={id}>Vencimiento</Label>
      <DatePicker defaultValue={new Date(2026, 8, 27)} id={id} name="vencimiento" />
    </div>
  )
}

/**
 * Un rango
 * Se queda abierto después del desde y se cierra con el hasta.
 */
export function Rango() {
  const id = useId()
  const [periodo, setPeriodo] = useState<DateRange>({ from: null, to: null })
  return (
    <div className="flex w-full max-w-xs flex-col gap-2">
      <Label htmlFor={id}>Período</Label>
      <DatePicker id={id} mode="range" onValueChange={setPeriodo} value={periodo} />
    </div>
  )
}

/**
 * Con Limpiar
 * `clearable` suma un pie para vaciar la fecha: un filtro o un campo opcional no puede ser un
 * camino sin vuelta.
 */
export function ConLimpiar() {
  const id = useId()
  return (
    <div className="flex w-full max-w-xs flex-col gap-2">
      <Label htmlFor={id}>Facturas desde</Label>
      <DatePicker clearable defaultValue={new Date(2026, 8, 1)} id={id} name="desde" />
    </div>
  )
}

/**
 * Tamaños, formato y límites
 * Las mismas tres alturas que `Input`. `format` es el de `Intl.DateTimeFormat`.
 */
export function TamanosYFormato() {
  return (
    <div className="flex w-full max-w-xs flex-col gap-3">
      <DatePicker aria-label="Fecha corta" defaultValue={new Date(2026, 8, 27)} format={{ dateStyle: "short" }} size="sm" />
      <DatePicker aria-label="Fecha larga" defaultValue={new Date(2026, 8, 27)} format={{ dateStyle: "long" }} />
      <DatePicker aria-label="Turno" max={new Date(2026, 9, 16)} min={new Date(2026, 8, 7)} size="lg" />
      <DatePicker aria-label="Sin turnos" disabled />
    </div>
  )
}

/**
 * Una fecha lejana
 * En el calendario, el título abre la grilla de meses y su año la de años. Escape vuelve a los días sin cerrar el panel.
 */
export function FechaDeAlta() {
  const id = useId()
  return (
    <div className="flex w-full max-w-xs flex-col gap-2">
      <Label htmlFor={id}>Fecha de alta del cliente</Label>
      <DatePicker defaultValue={new Date(2006, 3, 12)} id={id} max={new Date(2026, 8, 29)} name="alta" />
    </div>
  )
}

// A nivel de módulo: el provider compara `format` por identidad.
const NUMERIC: Intl.DateTimeFormatOptions = { day: "2-digit", month: "2-digit", year: "numeric" }

/**
 * Idioma global
 * `LabelsProvider` con `dates`: idioma, semana y formato para `DatePicker`, `DateTimePicker` y `Calendar` de abajo (y `CalendarView`). La prop de cada uno le gana.
 */
export function IdiomaGlobal() {
  const [due, setDue] = useState<Date | null>(new Date(2026, 9, 15))
  return (
    <LabelsProvider value={{ dates: { locale: "en-US", weekStartsOn: 0, format: NUMERIC } }}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="due-global">Due date</Label>
          <DatePicker className="w-56" id="due-global" onValueChange={setDue} value={due} />
        </div>
        <DateTimePicker aria-label="Issued at" className="w-72" defaultValue={new Date(2026, 9, 1, 9, 30)} />
        <Calendar className="self-start" defaultMonth={new Date(2026, 9, 1)} />
      </div>
    </LabelsProvider>
  )
}

/**
 * En un Field
 * `FieldLabel`, ayuda y error se enganchan solos; con `required`, sin fecha u hora `Form` no envía y enfoca el campo.
 */
export function EnField() {
  const [sent, setSent] = useState<string | null>(null)
  return (
    <Form className="flex w-full max-w-sm flex-col gap-4" onFormSubmit={(values) => setSent(JSON.stringify(values))}>
      <Field name="due">
        <FieldLabel>Vencimiento</FieldLabel>
        <DatePicker required />
        <FieldDescription>El día que vence la factura.</FieldDescription>
        <FieldError>Elegí una fecha.</FieldError>
      </Field>
      <Field name="sendAt">
        <FieldLabel>Hora de envío</FieldLabel>
        <TimePicker required />
        <FieldError>Elegí una hora.</FieldError>
      </Field>
      <Button className="self-start" type="submit">
        Programar
      </Button>
      {sent && <p className="text-footnote text-label-secondary">{sent}</p>}
    </Form>
  )
}
