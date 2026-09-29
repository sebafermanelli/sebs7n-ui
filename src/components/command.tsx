"use client"

import * as React from "react"
import { Autocomplete as AutocompletePrimitive } from "@base-ui/react/autocomplete"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { Radio as RadioPrimitive } from "@base-ui/react/radio"
import { RadioGroup as RadioGroupPrimitive } from "@base-ui/react/radio-group"
import { SearchIcon } from "lucide-react"

import { useLabels, type Labels } from "../lib/labels.js"
import { cn, type WithClassName } from "../lib/utils.js"
import {
  commandDialogPopupClassName,
  commandFilterClassName,
  commandInputClassName,
  commandItemClassName,
  commandItemIconClassName,
} from "../variants/command.js"
import { menuLabelClassName } from "../variants/menu.js"

// La búsqueda de iCloud (2.0, R2): el search field arriba y los resultados como filas de menú, en un
// panel con la superficie de un popover. Hasta R1 era la paleta estilo Spotlight (campo como
// cabecera, sugerencia en línea, pista `tab`); iCloud no completa en línea.
//
// Teclado, foco y ARIA de combobox + listbox son de `@base-ui/react/autocomplete` en modo `inline`:
// la lista vive adentro del panel, siempre abierta, sin popup propio. El filtrado NO es el de Base
// UI: el suyo trabaja sobre un array `items`, y acá los ítems son JSX con `keywords`, íconos y
// grupos, como en cmdk. Cada `CommandItem` decide si coincide con lo escrito y se anota en un
// registro chico cuando se ve; de ese registro sale el vacío.

/** Minúsculas y sin tildes: el mismo criterio que el buscador del sitio de docs. */
function normalize(text: string) {
  return text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
}

/** Cada palabra de la consulta tiene que aparecer en alguno de los textos, en cualquier orden. */
function matches(query: string, texts: readonly string[]) {
  const terms = normalize(query).split(/\s+/).filter(Boolean)
  if (!terms.length) return true
  const haystack = normalize(texts.join(" "))
  return terms.every((term) => haystack.includes(term))
}

/** El texto plano de un nodo de React: lo que se filtra. */
function textOf(node: React.ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node)
  if (Array.isArray(node)) return node.map(textOf).join("")
  if (React.isValidElement<{ children?: React.ReactNode }>(node)) return textOf(node.props.children)
  return ""
}

// En el servidor `useLayoutEffect` avisa y no corre; el registro se llena recién en el cliente.
const useIsoLayoutEffect = typeof window === "undefined" ? React.useEffect : React.useLayoutEffect

/**
 * Los resultados que se están viendo. Un store externo y no estado de React: cada ítem se anota en
 * su efecto, y con `useState` en el root cada anotación re-renderizaría la lista entera; así solo se
 * enteran el vacío y el root.
 *
 * `values()` los da en el orden del DOM, que es el que usa Base UI para el índice resaltado. El root
 * se los pasa como `filteredItems`: sin eso, Base UI 1.8 no se entera de una lista JSX que pasa de
 * vacía a llena con la misma consulta —el índice del buscador que llega después de la primera
 * tecla— y no queda nada elegido.
 */
function createResults() {
  // Por ítem y no por `value`: dos ítems con el mismo `value` (el mismo cliente en dos grupos)
  // son dos entradas, y que uno se esconda al filtrar no borra al otro.
  const visible = new Map<string, { value: string; element: Element }>()
  const listeners = new Set<() => void>()
  let values: string[] | null = null
  const notify = () => {
    values = null
    listeners.forEach((listener) => listener())
  }
  return {
    add(id: string, value: string, element: Element) {
      visible.set(id, { value, element })
      notify()
    },
    remove(id: string) {
      visible.delete(id)
      notify()
    },
    count: () => visible.size,
    values() {
      values ??= [...visible.values()]
        .sort((a, b) => (a.element.compareDocumentPosition(b.element) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1))
        .map((entry) => entry.value)
      return values
    },
    subscribe(listener: () => void) {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
  }
}

const NO_VALUES: string[] = []

type Results = ReturnType<typeof createResults>

type CommandContextValue = {
  query: string
  shouldFilter: boolean
  results: Results
  labels: Labels["command"]
}

const CommandContext = React.createContext<CommandContextValue | null>(null)

function useCommand(part: string) {
  const context = React.useContext(CommandContext)
  if (!context) throw new Error(`${part} va adentro de <Command> o <CommandDialog>`)
  return context
}

type CommandProps = Omit<React.ComponentProps<"div">, "defaultValue" | "onChange"> & {
  /** Lo escrito en el campo. Pasarlo lo vuelve controlado. */
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  /**
   * Con `false` no filtra: muestra los `CommandItem` que reciba, en su orden. Es para cuando la
   * app ya filtró y ordenó —un ranking propio, una búsqueda en el servidor—.
   */
  shouldFilter?: boolean
  labels?: Partial<Labels["command"]>
}

/**
 * La paleta incrustada, sin diálogo. No trae superficie propia: adentro de `CommandDialog` la pone
 * el panel, y suelta la elige quien la ubica (una `Card`, un panel lateral).
 */
function Command({ value, defaultValue = "", onValueChange, shouldFilter = true, labels, className, children, ...props }: CommandProps) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue)
  const query = value ?? uncontrolled
  const [results] = React.useState(createResults)
  const provided = useLabels().command

  const onValueChangeRef = React.useRef(onValueChange)
  onValueChangeRef.current = onValueChange
  const controlled = value !== undefined
  const setQuery = React.useCallback(
    (next: string) => {
      if (!controlled) setUncontrolled(next)
      onValueChangeRef.current?.(next)
    },
    [controlled]
  )

  const values = React.useSyncExternalStore(results.subscribe, results.values, () => NO_VALUES)

  const context = React.useMemo<CommandContextValue>(
    () => ({ query, shouldFilter, results, labels: { ...provided, ...labels } }),
    // `labels` se compara por contenido: es un objeto literal en casi todos los usos.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [query, shouldFilter, results, provided, labels?.placeholder, labels?.empty, labels?.dialog, labels?.filters]
  )

  return (
    <CommandContext.Provider value={context}>
      <AutocompletePrimitive.Root
        // `inline` + `open`: la lista es parte del panel y está siempre a la vista.
        inline
        open
        // Los valores visibles en orden, ya filtrados por los ítems: ver `createResults`.
        filteredItems={values}
        value={query}
        onValueChange={(next, details) => {
          // Elegir un ítem no escribe su `value` en el campo: acá el valor es un id («f-0012»), no
          // un texto para mostrar. Lo que hace elegir lo decide `onSelect`.
          if (details.reason === "item-press") return
          setQuery(next)
        }}
        // El primer resultado está elegido desde la primera tecla y Enter lo abre.
        autoHighlight="always"
        keepHighlight
      >
        <div data-slot="command" className={cn("flex min-h-0 flex-col gap-1 text-label", className)} {...props}>
          {children}
        </div>
      </AutocompletePrimitive.Root>
    </CommandContext.Provider>
  )
}

type CommandInputProps = Omit<AutocompletePrimitive.Input.Props, "className"> & {
  className?: string
  /** Clases de la caja del campo, la que lleva el relleno, la lupa y el anillo de foco. */
  wrapperClassName?: string
}

/**
 * El search field de iCloud (catálogo §2.13): 36 px, radio 10, relleno `fill-1`, la lupa de 16 a la
 * izquierda y el texto en 14. Con el foco el relleno se va y queda el anillo interior, como en Mail.
 * La caja es el `div` y no el `input`: la lupa va adentro.
 */
function CommandInput({ className, wrapperClassName, placeholder, ...props }: CommandInputProps) {
  const { labels } = useCommand("CommandInput")
  return (
    <div data-slot="command-input-wrapper" className={cn(commandInputClassName, wrapperClassName)}>
      <SearchIcon aria-hidden="true" className="size-4 shrink-0 text-label-tertiary" />
      <AutocompletePrimitive.Input
        data-slot="command-input"
        // El nombre es lo que dice el campo vacío: un placeholder no alcanza como nombre para todos
        // los lectores, así que se repite en `aria-label`. Un `aria-label` de la app le gana.
        aria-label={placeholder ?? labels.placeholder}
        placeholder={placeholder ?? labels.placeholder}
        autoComplete="off"
        autoCapitalize="off"
        spellCheck={false}
        enterKeyHint="search"
        className={cn("h-full w-full min-w-0 bg-transparent text-callout text-label outline-none placeholder:text-label-tertiary", className)}
        {...props}
      />
    </div>
  )
}

type CommandFiltersProps = Omit<WithClassName<RadioGroupPrimitive.Props<string>>, "onValueChange"> & {
  /** El chip prendido. El componente no filtra por chips: la app decide qué ítems pasa. */
  onValueChange?: (value: string) => void
}

/**
 * Los filtros de la búsqueda: una fila de una sola opción, con scroll horizontal si no entran. iCloud
 * acota la búsqueda con tokens (catálogo §2.13); acá van en una fila abajo del campo y no adentro,
 * para que el campo siga siendo un `input` común.
 *
 * Un `radiogroup` y no un grupo de toggles: siempre hay exactamente uno prendido —«ninguno» sería lo
 * mismo que «Todo»—, y eso es lo que anuncia un grupo de radios («Facturas, radio, 2 de 3,
 * marcado»). Las flechas recorren los filtros y Tab sale del grupo, como en cualquier radiogroup.
 * El nombre del grupo sale de `labels.filters` («Filtros»).
 */
function CommandFilters({ onValueChange, className, ...props }: CommandFiltersProps) {
  const { labels } = useCommand("CommandFilters")
  return (
    <RadioGroupPrimitive<string>
      data-slot="command-filters"
      aria-label={labels.filters}
      onValueChange={(value) => onValueChange?.(value)}
      className={cn("flex shrink-0 items-center gap-1.5 overflow-x-auto px-1 py-1 [scrollbar-width:none]", className)}
      {...props}
    />
  )
}

type CommandFilterProps = WithClassName<RadioPrimitive.Root.Props>

/** Un token: gris, y el prendido en el acento sólido (`data-checked`, el del radio). */
function CommandFilter({ className, ...props }: CommandFilterProps) {
  return <RadioPrimitive.Root data-slot="command-filter" className={cn(commandFilterClassName, className)} {...props} />
}

type CommandListProps = WithClassName<AutocompletePrimitive.List.Props>

function CommandList({ className, ...props }: CommandListProps) {
  const { results } = useCommand("CommandList")
  const count = React.useSyncExternalStore(results.subscribe, results.count, () => -1)
  return (
    <AutocompletePrimitive.List
      data-slot="command-list"
      // Sin resultados la lista no ocupa lugar: el vacío va aparte.
      data-no-results={count === 0 ? "" : undefined}
      className={cn("max-h-80 min-h-0 flex-1 overflow-y-auto overscroll-contain data-no-results:hidden", className)}
      {...props}
    />
  )
}

type CommandGroupProps = WithClassName<AutocompletePrimitive.Group.Props> & {
  heading?: React.ReactNode
}

/** Un grupo sin ítems visibles se esconde entero, título incluido. */
function CommandGroup({ heading, className, children, ...props }: CommandGroupProps) {
  return (
    <AutocompletePrimitive.Group data-slot="command-group" className={cn("[&:not(:has([role=option]))]:hidden", className)} {...props}>
      {heading != null && (
        <AutocompletePrimitive.GroupLabel data-slot="command-group-heading" className={menuLabelClassName}>
          {heading}
        </AutocompletePrimitive.GroupLabel>
      )}
      {children}
    </AutocompletePrimitive.Group>
  )
}

type CommandItemProps = Omit<WithClassName<AutocompletePrimitive.Item.Props>, "value" | "onSelect"> & {
  /** Identifica el ítem; es lo que recibe `onSelect`. Puede repetirse (el mismo cliente en dos grupos). */
  value: string
  /** Palabras que también lo encuentran, además del título. */
  keywords?: readonly string[]
  /** El detalle en gris debajo del título. */
  description?: React.ReactNode
  /** En una caja de 30 px, en el acento, como los íconos de los menús de iCloud. Un ícono de lucide va a 16 px. */
  icon?: React.ReactNode
  /** El título en texto plano, si `children` no es un string. Es lo que se filtra. */
  textValue?: string
  /** Enter o click. */
  onSelect?: (value: string) => void
}

function CommandItem({ value, keywords, description, icon, textValue, onSelect, onClick, className, children, ref, ...props }: CommandItemProps) {
  const { query, shouldFilter, results } = useCommand("CommandItem")
  const id = React.useId()
  const element = React.useRef<HTMLDivElement | null>(null)
  // El registro necesita el elemento para ordenar por el DOM; la `ref` de la app sigue llegando.
  const setRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      element.current = node
      if (typeof ref === "function") ref(node)
      else if (ref) ref.current = node
    },
    [ref]
  )
  const title = textValue ?? textOf(children)
  const visible = !shouldFilter || matches(query, [title, ...(keywords ?? [])])

  useIsoLayoutEffect(() => {
    if (!visible || !element.current) return
    results.add(id, value, element.current)
    return () => results.remove(id)
  }, [visible, id, value, results])

  if (!visible) return null
  return (
    <AutocompletePrimitive.Item
      data-slot="command-item"
      ref={setRef}
      value={value}
      onClick={(event) => {
        onClick?.(event)
        onSelect?.(value)
      }}
      className={cn(commandItemClassName, className)}
      {...props}
    >
      {icon != null && (
        <span data-slot="command-item-icon" aria-hidden="true" className={commandItemIconClassName}>
          {icon}
        </span>
      )}
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate">{children}</span>
        {description != null && <span className="truncate text-footnote text-label-secondary">{description}</span>}
      </span>
    </AutocompletePrimitive.Item>
  )
}

/**
 * Lo que se ve cuando nada coincide. Queda siempre montado y vacío, porque es una región `status`:
 * si apareciera recién con el texto, varios lectores no lo anunciarían. Va al lado de `CommandList`,
 * no adentro: un listbox solo admite opciones y grupos.
 */
function CommandEmpty({ className, children, ...props }: React.ComponentProps<"div">) {
  const { results, labels } = useCommand("CommandEmpty")
  // -1 en el servidor: los ítems se anotan en un efecto, y sin él la paleta diría «Sin
  // resultados» en el HTML aunque tenga diez.
  const count = React.useSyncExternalStore(results.subscribe, results.count, () => -1)
  return (
    <div
      data-slot="command-empty"
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={cn("text-center text-callout text-label-secondary not-empty:px-4 not-empty:py-6", className)}
      {...props}
    >
      {count === 0 ? (children ?? labels.empty) : null}
    </div>
  )
}

type CommandDialogProps = Omit<DialogPrimitive.Root.Props, "children"> &
  Pick<CommandProps, "value" | "defaultValue" | "onValueChange" | "shouldFilter" | "labels"> & {
    /** Clases del panel. */
    className?: string
    children?: React.ReactNode
  }

/**
 * `Command` adentro de un diálogo de Base UI, anclado arriba: el campo de búsqueda con sus
 * resultados en la superficie de un popover de iCloud. Sin X —Escape y un click afuera cierran— y
 * sin velo: la búsqueda flota sobre la pantalla y no la apaga, como los popovers. Base UI
 * soporta este armado a propósito (combobox `inline` dentro de un `role="dialog"`), y el foco
 * inicial va al campo.
 *
 * Cerrar al elegir lo decide la app en `onSelect`: navegar cierra, pero «copiar el número» o
 * «cambiar de tema» pueden querer dejarla abierta.
 */
function CommandDialog({ className, labels, value, defaultValue, onValueChange, shouldFilter, children, ...props }: CommandDialogProps) {
  const provided = useLabels().command
  const name = labels?.dialog ?? provided.dialog
  const popup = React.useRef<HTMLDivElement>(null)
  return (
    <DialogPrimitive.Root {...props}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Popup
          data-slot="command-dialog"
          aria-label={name}
          // El foco va al campo aunque la app ponga algo tabulable antes (un botón en la cabecera):
          // abrir una búsqueda es para escribir. Sin campo, lo de siempre de Base UI.
          initialFocus={() => popup.current?.querySelector<HTMLElement>("[data-slot=command-input]") ?? true}
          ref={popup}
          className={cn(commandDialogPopupClassName, className)}
        >
          <Command className="flex-1" labels={labels} value={value} defaultValue={defaultValue} onValueChange={onValueChange} shouldFilter={shouldFilter}>
            {children}
          </Command>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

export {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandFilter,
  CommandFilters,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  type CommandDialogProps,
  type CommandFilterProps,
  type CommandFiltersProps,
  type CommandGroupProps,
  type CommandInputProps,
  type CommandItemProps,
  type CommandListProps,
  type CommandProps,
}
