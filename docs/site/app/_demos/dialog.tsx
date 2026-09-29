"use client"

import { useId, useState } from "react"
import { Button } from "sebs7n-ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "sebs7n-ui/dialog"
import { Input } from "sebs7n-ui/input"
import { Label } from "sebs7n-ui/label"

/**
 * La hoja de macOS
 * Título a la izquierda, el contenido agrupado en un bloque `bg-grouped` y el principal
 * del acento abajo a la derecha. El pie no lleva línea: el aire alcanza.
 * «Cancelar» va primero en el DOM: en desktop queda a la izquierda de «Listo», y en mobile, donde
 * el pie se apila sin invertir, «Listo» queda abajo, al alcance del pulgar. Tab sigue ese orden.
 */
export function Hoja() {
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="outline" />}>Ver factura 0012</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Factura 0012</DialogTitle>
          <DialogDescription>Emitida el 15/09. Todavía no se cobró.</DialogDescription>
        </DialogHeader>
        <dl className="flex flex-col gap-2 rounded-surface bg-grouped p-4 text-body">
          <div className="flex justify-between gap-4">
            <dt className="text-label-secondary">Cliente</dt>
            <dd>Acme S.A.</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-label-secondary">Vence</dt>
            <dd>15/10</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-label-secondary">Total</dt>
            <dd className="text-headline tabular-nums">$ 12.400</dd>
          </div>
        </dl>
        <p className="text-footnote text-label-secondary">Pasado el vencimiento se suma el recargo que figura en las condiciones de venta.</p>
        <DialogFooter>
          <DialogClose render={<Button variant="secondary" />}>Cancelar</DialogClose>
          <DialogClose render={<Button variant="accent" />}>Listo</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/**
 * Con formulario
 * El trigger usa `render={<Button … />}`, no `asChild`.
 */
export function Basico() {
  const id = useId()
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="outline" />}>Editar cliente</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar cliente</DialogTitle>
          <DialogDescription>Los cambios se aplican a las facturas nuevas, no a las emitidas.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <Label htmlFor={id}>Razón social</Label>
          <Input defaultValue="Acme S.A." id={id} />
        </div>
        <DialogFooter>
          <DialogClose render={<Button variant="secondary" />}>Cancelar</DialogClose>
          <DialogClose render={<Button variant="accent" />}>Guardar</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/**
 * Controlado, con carga
 * `open` en el estado de la app: el diálogo se cierra cuando termina la operación.
 */
export function Controlado() {
  const [abierto, setAbierto] = useState(false)
  const [guardando, setGuardando] = useState(false)
  return (
    <Dialog onOpenChange={setAbierto} open={abierto}>
      <DialogTrigger render={<Button />}>Emitir factura</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Emitir la factura 0014</DialogTitle>
          <DialogDescription>Se envía a AFIP y después no se puede editar.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="secondary" />}>Cancelar</DialogClose>
          <Button
            loading={guardando}
            onClick={() => {
              setGuardando(true)
              setTimeout(() => {
                setGuardando(false)
                setAbierto(false)
              }, 1400)
            }}
            variant="accent"
          >
            Emitir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
