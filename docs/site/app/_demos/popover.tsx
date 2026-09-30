"use client"

import { Button } from "sebs7n-ui/button"
import { DatePicker } from "sebs7n-ui/date-picker"
import { Label } from "sebs7n-ui/label"
import { Popover, PopoverContent, PopoverDescription, PopoverHeader, PopoverTitle, PopoverTrigger } from "sebs7n-ui/popover"

/** Contenido interactivo anclado a un control */
export function Basico() {
  return (
    <Popover>
      <PopoverTrigger render={<Button variant="secondary" />}>Rango de fechas</PopoverTrigger>
      <PopoverContent className="w-72">
        <PopoverHeader>
          <PopoverTitle>Rango</PopoverTitle>
          <PopoverDescription>Se aplica al resumen del mes.</PopoverDescription>
        </PopoverHeader>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pop-desde">Desde</Label>
            <DatePicker id="pop-desde" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pop-hasta">Hasta</Label>
            <DatePicker id="pop-hasta" />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

const AVISOS = [
  { id: "0012", texto: "La factura 0012 de Acme S.A. venció ayer." },
  { id: "0013", texto: "Globex pagó la factura 0013." },
  { id: "0014", texto: "Initech pidió una nota de crédito por la factura 0014." },
]

/**
 * Un panel de avisos
 * Contenido para leer, no acciones: por eso es un `Popover` y no un `DropdownMenu`. Achicá la ventana por debajo de 640 px: se abre como la hoja de abajo, a todo el ancho, y se cierra arrastrándola, con la X o con Escape. En la app no cambia nada.
 */
export function Avisos() {
  return (
    <Popover>
      <PopoverTrigger render={<Button variant="secondary" />}>Avisos</PopoverTrigger>
      <PopoverContent align="end" className="w-80">
        <PopoverHeader>
          <PopoverTitle>Avisos</PopoverTitle>
          <PopoverDescription>Lo último de tus facturas.</PopoverDescription>
        </PopoverHeader>
        <ul className="-mx-2 flex flex-col">
          {AVISOS.map((aviso) => (
            <li className="rounded-control px-2 py-2 text-callout text-label" key={aviso.id}>
              {aviso.texto}
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  )
}

/**
 * Anclado también en el teléfono
 * `mobile="popover"` para uno chico, que entra en cualquier pantalla. Igual nunca se sale: se achica al lugar que queda.
 */
export function SiempreAnclado() {
  return (
    <Popover mobile="popover">
      <PopoverTrigger render={<Button variant="secondary" />}>Estado</PopoverTrigger>
      <PopoverContent>
        <PopoverTitle>Al día</PopoverTitle>
        <PopoverDescription>Ningún cliente tiene facturas vencidas.</PopoverDescription>
      </PopoverContent>
    </Popover>
  )
}
