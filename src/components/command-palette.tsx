"use client"

import * as React from "react"

import { defined } from "../internal/defined.js"
import { useLabels, type Labels } from "../lib/labels.js"
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, type CommandProps } from "./command.js"

type CommandPaletteLabels = NonNullable<Labels["commandPalette"]>

/** Los textos por defecto (no están en `defaultLabels`: el componente es solo por subpath). */
const commandPaletteLabels: CommandPaletteLabels = { loading: "Cargando…", loadError: "No se pudo cargar la búsqueda" }

type CommandPaletteItem = {
  /** Identifica el ítem; es lo que recibe `onSelect`. Único en toda la paleta. */
  value: string
  /** El título. Es lo que se filtra. */
  label: string
  /** Un ícono (de lucide, a 16 px). */
  icon?: React.ReactNode
  /** El detalle en gris debajo del título. */
  description?: React.ReactNode
  /** Palabras que también lo encuentran. */
  keywords?: readonly string[]
  /** Enter o click. Después se cierra la paleta, salvo con `closeOnSelect={false}`. */
  onSelect: (value: string) => void
}

type CommandPaletteGroup = {
  /** El título del grupo. */
  heading?: React.ReactNode
  /** Sus ítems. Un grupo sin ítems no se dibuja. */
  items: readonly CommandPaletteItem[]
}

type CommandPaletteProps = {
  /** Si la paleta está abierta. */
  open: boolean
  /** Avisa que se pidió abrirla o cerrarla. */
  onOpenChange: (open: boolean) => void
  /** Los grupos de ítems, en orden. */
  groups?: readonly CommandPaletteGroup[]
  /**
   * Carga diferida: trae los grupos la primera vez que se abre la paleta (no al montar la
   * pantalla), para que lo que cuesta —una lista de clientes, un índice— no se pague sin usarla. Se
   * suma a `groups`: los de la carga van después. Si falla, avisa con `labels.loadError`.
   */
  loadGroups?: () => Promise<readonly CommandPaletteGroup[]>
  /** El texto del campo vacío y su nombre. Por defecto, el de `Command`. */
  placeholder?: string
  /** Cierra la paleta al elegir un ítem. Por defecto, `true`: «copiar el número» puede querer `false`. */
  closeOnSelect?: boolean
  /** Con `false` no filtra: es para cuando la app ya filtró o ordenó. Ver `Command`. */
  shouldFilter?: CommandProps["shouldFilter"]
  /** Clases del panel. */
  className?: string
  /** Textos: `loading` y `loadError`, más los de `Command` (`dialog`, `placeholder`, `empty`, `filters`) que se pasan tal cual. */
  labels?: Partial<CommandPaletteLabels> & Partial<Labels["command"]>
}

/**
 * La paleta de comandos de una app, declarativa: `groups` con sus ítems y listo. Arma
 * `CommandDialog` → `CommandInput` → `CommandList` → `CommandGroup` → `CommandItem` y deja `Command`
 * para quien necesite otra estructura (filtros, ítems propios).
 *
 * **No escucha el teclado**: ⌘K lo registra la app (`useKeySequence` no alcanza para ⌘; en el
 * layout, un `keydown` propio) y le pasa `open`. Para que el JS de la paleta no entre en el primer
 * bundle, importala con `next/dynamic` o `React.lazy` y montala recién cuando se pidió; `loadGroups`
 * resuelve lo mismo para los datos.
 */
function CommandPalette({ open, onOpenChange, groups = [], loadGroups, placeholder, closeOnSelect = true, shouldFilter, className, labels: labelsProp }: CommandPaletteProps) {
  const own = { ...commandPaletteLabels, ...useLabels().commandPalette, ...defined(labelsProp) }
  const { loading: loadingText, loadError, ...commandLabels } = own as CommandPaletteLabels & Partial<Labels["command"]>
  const [loaded, setLoaded] = React.useState<readonly CommandPaletteGroup[]>([])
  const [state, setState] = React.useState<"idle" | "loading" | "error">("idle")
  const requested = React.useRef(false)
  const loadRef = React.useRef(loadGroups)
  loadRef.current = loadGroups

  React.useEffect(() => {
    if (!open || requested.current || !loadRef.current) return
    requested.current = true
    setState("loading")
    loadRef.current().then(
      (result) => {
        setLoaded(result)
        setState("idle")
      },
      () => {
        // Permite reintentar la próxima vez que se abra.
        requested.current = false
        setState("error")
      }
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const all = [...groups, ...loaded].filter((group) => group.items.length > 0)

  return (
    <CommandDialog className={className} labels={commandLabels} onOpenChange={onOpenChange} open={open} shouldFilter={shouldFilter}>
      <CommandInput placeholder={placeholder} />
      <CommandList>
        {all.map((group, index) => (
          <CommandGroup heading={group.heading} key={index}>
            {group.items.map((item) => (
              <CommandItem
                description={item.description}
                icon={item.icon}
                key={item.value}
                keywords={item.keywords}
                onSelect={(value) => {
                  if (closeOnSelect) onOpenChange(false)
                  item.onSelect(value)
                }}
                textValue={item.label}
                value={item.value}
              >
                {item.label}
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
      {state === "loading" && (
        <div data-slot="command-palette-status" role="status" className="px-4 py-3 text-center text-callout text-label-secondary">
          {loadingText}
        </div>
      )}
      {state === "error" && (
        <div data-slot="command-palette-status" role="alert" className="px-4 py-3 text-center text-callout text-red-ink">
          {loadError}
        </div>
      )}
      {state !== "loading" && <CommandEmpty />}
    </CommandDialog>
  )
}

export { CommandPalette, commandPaletteLabels, type CommandPaletteGroup, type CommandPaletteItem, type CommandPaletteLabels, type CommandPaletteProps }
