"use client"

import { BoldIcon, ItalicIcon, StrikethroughIcon, UnderlineIcon } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Suspense, useState } from "react"
import { Field, FieldLabel } from "sebs7n-ui/field"
import { Input } from "sebs7n-ui/input"
import { ToggleGroup, ToggleGroupItem } from "sebs7n-ui/toggle-group"

/**
 * Uno de varios
 * El grupo entero es una sola parada de tabulación; adentro se recorre con las flechas. Con `required`, tocar la opción prendida no la apaga.
 */
export function Basico() {
  const [vista, setVista] = useState(["tabla"])
  return (
    <ToggleGroup aria-label="Vista" onValueChange={setVista} required value={vista}>
      <ToggleGroupItem value="tabla">Tabla</ToggleGroupItem>
      <ToggleGroupItem value="tarjetas">Tarjetas</ToggleGroupItem>
      <ToggleGroupItem value="calendario">Calendario</ToggleGroupItem>
    </ToggleGroup>
  )
}

/**
 * Varios a la vez
 * Con `multiple`, cada ítem se prende solo: los B/I/U de un editor, como el formato de Notes.
 */
export function Varios() {
  return (
    <ToggleGroup aria-label="Formato" defaultValue={["bold"]} multiple>
      <ToggleGroupItem aria-label="Negrita" value="bold">
        <BoldIcon />
      </ToggleGroupItem>
      <ToggleGroupItem aria-label="Cursiva" value="italic">
        <ItalicIcon />
      </ToggleGroupItem>
      <ToggleGroupItem aria-label="Subrayado" value="underline">
        <UnderlineIcon />
      </ToggleGroupItem>
      <ToggleGroupItem aria-label="Tachado" value="strike">
        <StrikethroughIcon />
      </ToggleGroupItem>
    </ToggleGroup>
  )
}

/**
 * Filtro de selección única
 * En una barra de filtros, al lado de la búsqueda: los dos miden 36 (`md`, el default). `required` hace que siempre haya una elegida y «Todas» es una opción más, con `value=""`, que es lo que suele traer la URL.
 */
export function FiltroUnico() {
  const [estado, setEstado] = useState([""])
  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex w-full flex-wrap items-center gap-2">
        <Input aria-label="Buscar facturas" className="w-48" placeholder="Buscar" size="md" type="search" />
        <ToggleGroup aria-label="Estado" onValueChange={setEstado} required value={estado}>
          <ToggleGroupItem value="">Todas</ToggleGroupItem>
          <ToggleGroupItem value="paid">Pagadas</ToggleGroupItem>
          <ToggleGroupItem value="due">Vencidas</ToggleGroupItem>
        </ToggleGroup>
      </div>
      <p className="text-mono-callout text-label-secondary">value: {JSON.stringify(estado)}</p>
    </div>
  )
}

function FiltroEnLaUrlInterno() {
  const estado = useSearchParams().get("status") ?? ""
  const opciones = [
    { value: "", label: "Todas" },
    { value: "paid", label: "Pagadas" },
    { value: "due", label: "Vencidas" },
    { value: "draft", label: "Borradores" },
  ]
  return (
    <ToggleGroup aria-label="Estado" value={[estado]}>
      {opciones.map((opcion) => (
        <ToggleGroupItem
          key={opcion.value}
          render={<Link href={opcion.value ? `?status=${opcion.value}` : "?"} replace scroll={false} />}
          value={opcion.value}
        >
          {opcion.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}

/**
 * Filtro en la URL
 * Si el filtro vive en los searchParams, cada opción es un link: `href`, o `render={<Link href />}` con el router de Next. Son `<a>` de verdad (Cmd-clic abre una pestaña nueva, el router precarga) y la elegida lleva `aria-current="page"`.
 */
export function FiltroEnLaUrl() {
  return (
    <Suspense>
      <FiltroEnLaUrlInterno />
    </Suspense>
  )
}

/**
 * En un formulario
 * En un `Field` con `name`, manda cada valor prendido; `size="sm"` (28) para un panel denso.
 */
export function EnFormulario() {
  return (
    <Field name="status">
      <FieldLabel>Estados</FieldLabel>
      <ToggleGroup defaultValue={["paid"]} multiple size="sm">
        <ToggleGroupItem value="paid">Pagadas</ToggleGroupItem>
        <ToggleGroupItem value="due">Vencidas</ToggleGroupItem>
        <ToggleGroupItem value="draft">Borradores</ToggleGroupItem>
      </ToggleGroup>
    </Field>
  )
}
