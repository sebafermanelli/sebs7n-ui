"use client"

import { useState } from "react"
import { Button } from "sebs7n-ui/button"
import { CheckboxGroup, CheckboxGroupItem } from "sebs7n-ui/checkbox-group"
import { Field, FieldDescription, FieldError, FieldLabel } from "sebs7n-ui/field"
import { Form } from "sebs7n-ui/form"

/**
 * Un dato que son varias casillas
 * Los tres checkboxes son un solo campo: un `name`, un array como valor y un error que es del grupo, no de una casilla. El `FieldLabel` nombra al grupo entero; cada `CheckboxGroupItem` trae su propia etiqueta.
 */
export function ServiciosDelPaquete() {
  const [enviado, setEnviado] = useState<string[] | null>(null)

  return (
    <Form
      className="w-full max-w-sm"
      onFormSubmit={(valores) => setEnviado(valores.servicios as string[])}
    >
      <Field
        name="servicios"
        validate={(valor) => ((valor as string[]).length > 0 ? null : "Elegí al menos un servicio")}
      >
        <FieldLabel required>Servicios incluidos</FieldLabel>
        <CheckboxGroup>
          <CheckboxGroupItem value="vuelo">Vuelo</CheckboxGroupItem>
          <CheckboxGroupItem value="hotel">Hotel</CheckboxGroupItem>
          <CheckboxGroupItem value="traslado">Traslado desde el aeropuerto</CheckboxGroupItem>
        </CheckboxGroup>
        <FieldDescription>Se cotizan por separado.</FieldDescription>
        <FieldError />
      </Field>
      <Button type="submit">Cotizar</Button>
      {enviado && <p className="text-copy-13-mono text-gray-900">servicios: {JSON.stringify(enviado)}</p>}
    </Form>
  )
}

/**
 * Seleccionar todo
 * El motivo principal por el que existe el componente. El padre lleva `parent` y el grupo, `allValues`: con algunos tildados queda indeterminado, y de un click pasa a todos o a ninguno. No aporta valor propio al array ni viaja en el submit.
 */
export function PermisosDelOperador() {
  const permisos = ["reservas", "pagos", "clientes", "reportes"]
  const [valor, setValor] = useState<string[]>(["reservas", "clientes"])

  return (
    <Field className="w-full max-w-sm" name="permisos">
      <FieldLabel>Permisos del operador</FieldLabel>
      <CheckboxGroup allValues={permisos} onValueChange={setValor} value={valor}>
        <CheckboxGroupItem parent>Acceso total</CheckboxGroupItem>
        <div className="flex flex-col gap-3 border-l border-gray-400 pl-4">
          <CheckboxGroupItem value="reservas">Crear y editar reservas</CheckboxGroupItem>
          <CheckboxGroupItem value="pagos">Registrar pagos</CheckboxGroupItem>
          <CheckboxGroupItem value="clientes">Ver la ficha del cliente</CheckboxGroupItem>
          <CheckboxGroupItem value="reportes">Descargar reportes</CheckboxGroupItem>
        </div>
      </CheckboxGroup>
      <FieldDescription>
        {valor.length} de {permisos.length} habilitados.
      </FieldDescription>
    </Field>
  )
}

/**
 * Opciones con ayuda y opciones apagadas
 * La ayuda de un ítem describe solo a ese ítem: el lector la anuncia al entrar en esa casilla y no en las otras. `disabled` apaga la casilla y su etiqueta juntas.
 */
export function AvisosDeLaCuenta() {
  return (
    <Field className="w-full max-w-sm" name="avisos">
      <FieldLabel>Avisos por email</FieldLabel>
      <CheckboxGroup defaultValue={["reserva"]}>
        <CheckboxGroupItem description="Al confirmar y al cancelar." value="reserva">
          Movimientos de una reserva
        </CheckboxGroupItem>
        <CheckboxGroupItem description="Un resumen los lunes a la mañana." value="resumen">
          Resumen semanal
        </CheckboxGroupItem>
        <CheckboxGroupItem description="Necesita un plan con facturación electrónica." disabled value="facturas">
          Facturas emitidas
        </CheckboxGroupItem>
      </CheckboxGroup>
    </Field>
  )
}
