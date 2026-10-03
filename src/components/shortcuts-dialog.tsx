"use client"

import * as React from "react"

import { defined } from "../internal/defined.js"
import { useLabels, type Labels } from "../lib/labels.js"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./dialog.js"
import { Kbd } from "./kbd.js"

type ShortcutsLabels = NonNullable<Labels["shortcuts"]>

/** Los textos por defecto (no están en `defaultLabels`: el componente es solo por subpath). */
const shortcutsLabels: ShortcutsLabels = {
  title: "Atajos de teclado",
  description: "Para ir más rápido sin soltar el teclado.",
  list: "Atajos",
  then: "luego",
}

type ShortcutItem = {
  /** Las teclas, una por elemento: `["⌘", "K"]`, `["g", "i"]`, `["?"]`. */
  keys: readonly string[]
  /** Lo que hace: «Ir a Facturas». */
  label: string
  /**
   * Si las teclas se tipean una después de la otra («g» y, enseguida, «i») en vez de juntas («⌘» y
   * «K»). El lector las lee con «luego» en el medio. Por defecto, `false`.
   */
  sequence?: boolean
}

type ShortcutsDialogProps = {
  /** Si la hoja está abierta. */
  open: boolean
  /** Avisa que se pidió abrirla o cerrarla (Escape, click afuera). */
  onOpenChange: (open: boolean) => void
  /** Los atajos, en el orden en que se muestran. */
  shortcuts: readonly ShortcutItem[]
  /** La bajada del diálogo, para explicar lo que no se ve en la lista. Por defecto, `labels.description`. */
  description?: React.ReactNode
  /** Clases del contenido del diálogo. */
  className?: string
  /** Textos: `title`, `description`, `list` y `then`. Por defecto, `shortcutsLabels`. */
  labels?: Partial<ShortcutsLabels>
}

/**
 * La hoja de atajos: un diálogo con la lista de lo que hace cada tecla, con `Kbd`. Es solo la
 * hoja: **no escucha el teclado**. El atajo que la abre (`?`), el de la paleta (⌘K) y los de
 * navegación (`g` y una letra) los registra la app con `useKeySequence` de
 * `sebs7n-ui/lib/use-key-sequence`, y le pasa `open` y `onOpenChange`.
 *
 * Es de una sola lista: la misma `shortcuts` que se muestra puede alimentar el mapa del hook y los
 * ítems de la paleta de comandos, así nunca se desfasan.
 */
function ShortcutsDialog({ open, onOpenChange, shortcuts, description, className, labels: labelsProp }: ShortcutsDialogProps) {
  const labels = { ...shortcutsLabels, ...useLabels().shortcuts, ...defined(labelsProp) }
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className={className ?? "sm:max-w-md"}>
        <DialogHeader>
          <DialogTitle>{labels.title}</DialogTitle>
          <DialogDescription>{description ?? labels.description}</DialogDescription>
        </DialogHeader>
        <ul aria-label={labels.list} className="flex flex-col divide-y divide-separator" data-slot="shortcuts-list">
          {shortcuts.map((shortcut) => (
            <li className="flex items-center justify-between gap-4 py-2.5 text-callout text-label" data-slot="shortcut" key={`${shortcut.label}|${shortcut.keys.join("+")}`}>
              <span>{shortcut.label}</span>
              <span className="flex items-center gap-1">
                {shortcut.keys.map((key, index) => (
                  <React.Fragment key={`${key}${index}`}>
                    {shortcut.sequence && index > 0 && <span className="sr-only">{labels.then}</span>}
                    <Kbd>{key}</Kbd>
                  </React.Fragment>
                ))}
              </span>
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  )
}

export { ShortcutsDialog, shortcutsLabels, type ShortcutItem, type ShortcutsDialogProps, type ShortcutsLabels }
