"use client"

import { FileTextIcon, HomeIcon, UsersIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { Button } from "sebs7n-ui/button"
import { CommandPalette, type CommandPaletteGroup } from "sebs7n-ui/command-palette"
import { Kbd } from "sebs7n-ui/kbd"

/** Un hook de la app, no del paquete: ⌘K lo registra quien arma el layout. */
function useCommandShortcut(open: () => void) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        open()
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [open])
}

/**
 * Grupos declarativos
 * Un grupo por tipo de cosa, con ícono, detalle y palabras clave. Se abre con ⌘K (registrado acá, en la demo) o con el botón; elegir un ítem cierra la paleta.
 */
export function Groups() {
  const [open, setOpen] = useState(false)
  const [chosen, setChosen] = useState("nada todavía")
  useCommandShortcut(() => setOpen(true))
  const groups: CommandPaletteGroup[] = [
    {
      heading: "Secciones",
      items: [
        { value: "home", label: "Inicio", icon: <HomeIcon />, onSelect: () => setChosen("Inicio") },
        { value: "invoices", label: "Facturas", icon: <FileTextIcon />, keywords: ["cobros"], onSelect: () => setChosen("Facturas") },
        { value: "customers", label: "Clientes", icon: <UsersIcon />, onSelect: () => setChosen("Clientes") },
      ],
    },
    {
      heading: "Facturas",
      items: [
        { value: "F-0042", label: "F-0042", description: "Acme S.A. · Servicio mensual", icon: <FileTextIcon />, keywords: ["Acme"], onSelect: () => setChosen("F-0042") },
        { value: "F-0039", label: "F-0039", description: "Globex SRL · Licencias", icon: <FileTextIcon />, keywords: ["Globex"], onSelect: () => setChosen("F-0039") },
      ],
    },
  ]
  return (
    <div className="flex flex-col items-start gap-3">
      <Button onClick={() => setOpen(true)} variant="secondary">
        Buscar <Kbd size="sm">⌘K</Kbd>
      </Button>
      <p aria-live="polite" className="text-callout text-label-secondary">
        Elegiste: {chosen}
      </p>
      <CommandPalette groups={groups} onOpenChange={setOpen} open={open} placeholder="Secciones y facturas…" />
    </div>
  )
}

/**
 * Carga diferida
 * `loadGroups` trae los clientes la primera vez que se abre, no al montar la pantalla. Mientras llega dice «Cargando…».
 */
export function Deferred() {
  const [open, setOpen] = useState(false)
  return (
    <div className="flex flex-col items-start gap-3">
      <Button onClick={() => setOpen(true)} variant="secondary">
        Buscar un cliente
      </Button>
      <CommandPalette
        loadGroups={async () => {
          await new Promise((resolve) => setTimeout(resolve, 800))
          return [
            {
              heading: "Clientes",
              items: ["Acme S.A.", "Globex SRL", "Initech", "Umbrella Corp."].map((name) => ({ value: name, label: name, icon: <UsersIcon />, onSelect: () => {} })),
            },
          ]
        }}
        onOpenChange={setOpen}
        open={open}
        placeholder="Clientes…"
      />
    </div>
  )
}
