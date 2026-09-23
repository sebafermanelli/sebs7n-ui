"use client"

import { useState } from "react"
import { Badge } from "sebs7n-ui/badge"
import { Button } from "sebs7n-ui/button"
import {
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "sebs7n-ui/drawer"
import { Input } from "sebs7n-ui/input"
import { Label } from "sebs7n-ui/label"

/**
 * Filtros en mobile
 * La hoja de abajo es el patrón de filtros del celular: entra desde el borde, se cierra con el pulgar hacia abajo y deja ver el listado de atrás. El `DrawerFooter` fija el "Aplicar" arriba del borde, donde llega la mano.
 */
export function FiltrosEnMobile() {
  return (
    <Drawer>
      <DrawerTrigger render={<Button variant="outline" />}>Filtros</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Filtrar viajes</DrawerTitle>
          <DrawerDescription>Se aplican al listado sin recargar la página.</DrawerDescription>
        </DrawerHeader>
        <DrawerBody className="flex flex-col gap-4 pb-6">
          <div className="flex flex-col gap-2">
            <Label htmlFor="drawer-cliente">Cliente</Label>
            <Input id="drawer-cliente" placeholder="Acme S.A." />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="drawer-desde">Desde</Label>
            <Input id="drawer-desde" type="date" />
          </div>
        </DrawerBody>
        <DrawerFooter>
          <DrawerClose render={<Button variant="accent" />}>Aplicar</DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

/**
 * El detalle de un ítem, a media hoja
 * Con `snapPoints` la hoja para a mitad de camino: se ve el detalle sin tapar la lista, y se puede subir hasta el final. `defaultSnapPoint` elige dónde abre. El punto más alto pone `data-expanded` en el popup, por si el header tiene que cambiar ahí.
 */
export function DetalleAMediaHoja() {
  return (
    <Drawer defaultSnapPoint={0.45} snapPoints={[0.45, 1]}>
      <DrawerTrigger render={<Button variant="outline" />}>Ver el viaje #1042</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Viaje #1042</DrawerTitle>
          <DrawerDescription>Rosario → Córdoba, 14 de marzo.</DrawerDescription>
        </DrawerHeader>
        <DrawerBody className="flex flex-col gap-4 pb-6">
          <div className="flex items-center gap-2">
            <Badge color="green">Confirmado</Badge>
            <Badge color="gray">3 pasajeros</Badge>
          </div>
          <dl className="flex flex-col gap-3 text-copy-14">
            <div className="flex justify-between">
              <dt className="text-gray-900">Salida</dt>
              <dd className="tabular-nums">07:30</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-900">Llegada estimada</dt>
              <dd className="tabular-nums">12:10</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-900">Unidad</dt>
              <dd>Sprinter · AB 123 CD</dd>
            </div>
          </dl>
        </DrawerBody>
        <DrawerFooter>
          <Button variant="accent">Abrir la hoja de ruta</Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

const CHOFERES = [
  "Acosta, Mariela",
  "Benítez, Rodrigo",
  "Cabrera, Lucía",
  "Domínguez, Iván",
  "Escobar, Paula",
  "Ferreyra, Nahuel",
  "Gauna, Micaela",
  "Herrera, Tomás",
  "Ibarra, Carolina",
  "Juárez, Emiliano",
  "Ledesma, Sofía",
  "Maidana, Gonzalo",
]

/**
 * Elegir de una lista larga
 * Lo que scrollea va adentro de `DrawerBody`: esa es la zona donde el dedo mueve la lista en vez de arrastrar la hoja. Si la lista estuviera suelta en el popup, cada intento de scrollear cerraría el drawer.
 */
export function ElegirDeUnaListaLarga() {
  const [chofer, setChofer] = useState<string | null>(null)

  return (
    <div className="flex flex-col items-start gap-3">
      <Drawer>
        <DrawerTrigger render={<Button variant="outline" />}>{chofer ?? "Asignar chofer"}</DrawerTrigger>
        <DrawerContent className="data-[swipe-direction=down]:max-h-[70%]">
          <DrawerHeader>
            <DrawerTitle>Asignar chofer</DrawerTitle>
            <DrawerDescription>Doce disponibles para el 14 de marzo.</DrawerDescription>
          </DrawerHeader>
          <DrawerBody className="pb-6">
            <ul className="flex flex-col">
              {CHOFERES.map((nombre) => (
                <li key={nombre}>
                  <DrawerClose
                    className="flex h-11 w-full items-center rounded-md px-2 text-left text-copy-14 outline-none hover:bg-gray-200 focus-visible:focus-ring"
                    onClick={() => setChofer(nombre)}
                  >
                    {nombre}
                  </DrawerClose>
                </li>
              ))}
            </ul>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
      {chofer && <p className="text-copy-13 text-gray-900">Asignado: {chofer}</p>}
    </div>
  )
}
