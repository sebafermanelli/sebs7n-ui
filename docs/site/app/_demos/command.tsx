"use client"

import { FilePlusIcon, FileTextIcon, SearchIcon, UserIcon, UserPlusIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { Button } from "sebs7n-ui/button"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandFilter,
  CommandFilters,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "sebs7n-ui/command"
import { Kbd } from "sebs7n-ui/kbd"

const FACTURAS = [
  { value: "f-0012", title: "Factura 0012", description: "Acme S.A. · $ 12.400", keywords: ["acme"] },
  { value: "f-0013", title: "Factura 0013", description: "Nube Digital · $ 8.150", keywords: ["nube"] },
  { value: "f-0014", title: "Factura 0014", description: "Estudio Sur · $ 3.900", keywords: ["estudio"] },
]

const CLIENTES = [
  { value: "c-acme", title: "Acme S.A.", description: "CUIT 30-71234567-8" },
  { value: "c-nube", title: "Nube Digital", description: "CUIT 30-70987654-3" },
]

const ACCIONES = [
  { value: "a-factura", title: "Nueva factura", icon: <FilePlusIcon />, keywords: ["crear", "emitir"] },
  { value: "a-cliente", title: "Nuevo cliente", icon: <UserPlusIcon />, keywords: ["crear", "alta"] },
]

/** Los chips no filtran solos: la app decide qué grupos pasa según el valor. */
function Resultados({ filtro, onSelect }: { filtro: string; onSelect: (value: string) => void }) {
  return (
    <>
      <CommandList>
        {(filtro === "todo" || filtro === "facturas") && (
          <CommandGroup heading="Facturas">
            {FACTURAS.map((factura) => (
              <CommandItem
                description={factura.description}
                icon={<FileTextIcon />}
                key={factura.value}
                keywords={factura.keywords}
                onSelect={onSelect}
                value={factura.value}
              >
                {factura.title}
              </CommandItem>
            ))}
          </CommandGroup>
        )}
        {(filtro === "todo" || filtro === "clientes") && (
          <CommandGroup heading="Clientes">
            {CLIENTES.map((cliente) => (
              <CommandItem description={cliente.description} icon={<UserIcon />} key={cliente.value} onSelect={onSelect} value={cliente.value}>
                {cliente.title}
              </CommandItem>
            ))}
          </CommandGroup>
        )}
        {filtro === "todo" && (
          <CommandGroup heading="Acciones">
            {ACCIONES.map((accion) => (
              <CommandItem icon={accion.icon} key={accion.value} keywords={accion.keywords} onSelect={onSelect} value={accion.value}>
                {accion.title}
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
      <CommandEmpty />
    </>
  )
}

/**
 * Buscar en facturación
 * `CommandDialog` abierto por un botón o por ⌘J. Escribí «fact» y mirá la sugerencia en línea:
 * Tab la completa, Enter abre el elegido. En una app el atajo es ⌘K; acá ⌘K ya es el buscador del
 * sitio, que también es un `CommandDialog`.
 */
export function Basico() {
  const [abierto, setAbierto] = useState(false)
  const [filtro, setFiltro] = useState("todo")
  const [elegido, setElegido] = useState<string | null>(null)

  // El atajo lo registra la app: el componente no escucha teclas globales. ⌘J y no ⌘K porque en
  // este sitio ⌘K abre el buscador, y con los dos escuchando se abrirían dos paletas.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== "j" || !(event.metaKey || event.ctrlKey)) return
      event.preventDefault()
      setAbierto((previo) => !previo)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  return (
    <div className="flex flex-col items-center gap-3">
      <Button aria-keyshortcuts="Meta+J" onClick={() => setAbierto(true)} variant="outline">
        <SearchIcon />
        Buscar en facturación
        <Kbd size="sm">⌘J</Kbd>
      </Button>
      {elegido && <p className="text-body text-gray-900">Elegiste: {elegido}</p>}
      <CommandDialog labels={{ dialog: "Buscar en facturación" }} onOpenChange={setAbierto} open={abierto}>
        <CommandInput placeholder="Facturas, clientes, acciones…" />
        <CommandFilters onValueChange={setFiltro} value={filtro}>
          <CommandFilter value="todo">Todo</CommandFilter>
          <CommandFilter value="facturas">Facturas</CommandFilter>
          <CommandFilter value="clientes">Clientes</CommandFilter>
        </CommandFilters>
        <Resultados
          filtro={filtro}
          onSelect={(value) => {
            setElegido(value)
            setAbierto(false)
          }}
        />
      </CommandDialog>
    </div>
  )
}

/**
 * Incrustado
 * `Command` sin diálogo, adentro de una superficie que pone quien lo ubica.
 */
export function Incrustado() {
  const [elegido, setElegido] = useState<string | null>(null)
  return (
    <div className="flex w-full max-w-md flex-col gap-2">
      <Command className="rounded-surface material-group">
        <CommandInput />
        <Resultados filtro="todo" onSelect={setElegido} />
      </Command>
      {elegido && <p className="text-body text-gray-900">Elegiste: {elegido}</p>}
    </div>
  )
}
