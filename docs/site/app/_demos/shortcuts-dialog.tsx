"use client"

import { useState } from "react"
import { Button } from "sebs7n-ui/button"
import { Kbd } from "sebs7n-ui/kbd"
import { ShortcutsDialog, type ShortcutItem } from "sebs7n-ui/shortcuts-dialog"
import { useKeySequence } from "sebs7n-ui/lib/use-key-sequence"

const SHORTCUTS: ShortcutItem[] = [
  { keys: ["⌘", "K"], label: "Buscar y ejecutar comandos" },
  { keys: ["?"], label: "Ver los atajos" },
  { keys: ["g", "i"], label: "Ir a Inicio", sequence: true },
  { keys: ["g", "f"], label: "Ir a Facturas", sequence: true },
  { keys: ["g", "c"], label: "Ir a Clientes", sequence: true },
]

/**
 * Abierta con «?»
 * La hoja es solo el diálogo: el atajo lo registra la app con `useKeySequence`. Probalo con el foco fuera de un campo: «?» la abre y «g» y «f» navegan (acá, solo lo anuncian).
 */
export function Sheet() {
  const [open, setOpen] = useState(false)
  const [last, setLast] = useState("—")
  useKeySequence({
    "?": () => setOpen(true),
    "g i": () => setLast("Inicio"),
    "g f": () => setLast("Facturas"),
    "g c": () => setLast("Clientes"),
  })
  return (
    <div className="flex flex-col items-start gap-3">
      <Button onClick={() => setOpen(true)} variant="secondary">
        Ver atajos <Kbd size="sm">?</Kbd>
      </Button>
      <p aria-live="polite" className="text-callout text-label-secondary">
        Última navegación por teclado: {last}
      </p>
      <ShortcutsDialog onOpenChange={setOpen} open={open} shortcuts={SHORTCUTS} />
    </div>
  )
}
