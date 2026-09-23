"use client"

import { Button } from "sebs7n-ui/button"
import { Input } from "sebs7n-ui/input"
import { Label } from "sebs7n-ui/label"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "sebs7n-ui/sheet"

/** Panel lateral de filtros */
export function Basico() {
  return (
    <div className="flex flex-wrap gap-3">
      <Sheet>
        <SheetTrigger render={<Button variant="outline" />}>Filtros</SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Filtrar facturas</SheetTitle>
            <SheetDescription>Se aplican al listado sin recargar la página.</SheetDescription>
          </SheetHeader>
          <div className="flex flex-col gap-4 px-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="sheet-cliente">Cliente</Label>
              <Input id="sheet-cliente" placeholder="Acme S.A." />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="sheet-desde">Desde</Label>
              <Input id="sheet-desde" type="date" />
            </div>
          </div>
          <SheetFooter>
            <Button variant="accent">Aplicar</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <Sheet>
        <SheetTrigger render={<Button variant="ghost" />}>Desde la izquierda</SheetTrigger>
        <SheetContent side="left">
          <SheetHeader>
            <SheetTitle>Navegación</SheetTitle>
            <SheetDescription>Es el lado que usa el `AppShell` en mobile.</SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    </div>
  )
}
