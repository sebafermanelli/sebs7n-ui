"use client"

import * as React from "react"
import { Autocomplete as AutocompletePrimitive } from "@base-ui/react/autocomplete"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { Radio as RadioPrimitive } from "@base-ui/react/radio"
import { RadioGroup as RadioGroupPrimitive } from "@base-ui/react/radio-group"
import { SearchIcon } from "lucide-react"

import { useLabels, type Labels } from "../lib/labels.js"
import { cn, type WithClassName } from "../lib/utils.js"
import { commandDialogPopupClassName, commandItemClassName, commandItemIconClassName } from "../variants/command.js"
import { menuLabelClassName } from "../variants/menu.js"
import { toggleVariants } from "../variants/toggle.js"
import { Kbd } from "./kbd.js"

// La paleta de comandos estilo Spotlight (2.0).
//
// Teclado, foco y ARIA de combobox + listbox son de `@base-ui/react/autocomplete` en modo `inline`:
// la lista vive adentro del panel, siempre abierta, sin popup propio. El filtrado NO es el de Base
// UI: el suyo trabaja sobre un array `items`, y acá los ítems son JSX con `keywords`, íconos y
// grupos, como en cmdk. Cada `CommandItem` decide si coincide con lo escrito y se anota en un
// registro chico cuando se ve; de ese registro salen el vacío y la sugerencia en línea.

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

/** El texto plano de un nodo de React: lo que se filtra y lo que se sugiere en línea. */
function textOf(node: React.ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node)
  if (Array.isArray(node)) return node.map(textOf).join("")
  if (React.isValidElement<{ children?: React.ReactNode }>(node)) return textOf(node.props.children)
  return ""
}

// En el servidor `useLayoutEffect` avisa y no corre; el registro se llena recién en el cliente.
const useIsoLayoutEffect = typeof window === "undefined" ? React.useEffect : React.useLayoutEffect

type Result = { title: string; description?: string }

/**
 * Los resultados que se están viendo, por `value`. Un store externo y no estado de React: cada
 * ítem se anota en su efecto, y con `useState` en el root cada anotación re-renderizaría la lista
 * entera; así solo se enteran el vacío, la sugerencia y el root.
 *
 * `values()` los da en el orden del DOM, que es el que usa Base UI para el índice resaltado. El root
 * se los pasa como `filteredItems`: sin eso, Base UI 1.8 no se entera de una lista JSX que pasa de
 * vacía a llena con la misma consulta —el índice del buscador que llega después de la primera
 * tecla— y no queda nada elegido; y cuando el elegido desaparece al filtrar, el valor que anuncia
 * tiene que ser el de la fila que quedó en su lugar.
 */
function createResults() {
  // Por ítem y no por `value`: dos ítems con el mismo `value` (el mismo cliente en dos grupos)
  // son dos entradas, y que uno se esconda al filtrar no borra al otro.
  const visible = new Map<string, { value: string; result: Result; element: Element }>()
  const listeners = new Set<() => void>()
  let ordered: { value: string; result: Result }[] | null = null
  let values: string[] = []
  const notify = () => {
    ordered = null
    listeners.forEach((listener) => listener())
  }
  const inOrder = () => {
    if (!ordered) {
      ordered = [...visible.values()].sort((a, b) =>
        a.element.compareDocumentPosition(b.element) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1
      )
      values = ordered.map((entry) => entry.value)
    }
    return ordered
  }
  return {
    add(id: string, value: string, result: Result, element: Element) {
      visible.set(id, { value, result, element })
      notify()
    },
    remove(id: string) {
      visible.delete(id)
      notify()
    },
    /** El primero en pantalla con ese `value`. */
    get: (value: string | undefined) => (value === undefined ? undefined : inOrder().find((entry) => entry.value === value)?.result),
    count: () => visible.size,
    values() {
      inOrder()
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

/**
 * Lo que el resultado elegido completa en línea: el resto del título y su detalle. `accepts` dice si
 * Tab o → hacen algo: con el título entero ya escrito solo queda el detalle, que se ve pero no se
 * completa, y ahí Tab tiene que seguir moviendo el foco y la pista `tab` no se muestra.
 */
type Completion = { value: string; title: string; text: string; accepts: boolean }

type CommandContextValue = {
  query: string
  setQuery: (query: string) => void
  shouldFilter: boolean
  results: Results
  completion: Completion | null
  setOverflowing: (overflowing: boolean) => void
  labels: Labels["command"]
}

const CommandContext = React.createContext<CommandContextValue | null>(null)

function useCommand(part: string) {
  const context = React.useContext(CommandContext)
  if (!context) throw new Error(`${part} va adentro de <Command> o <CommandDialog>`)
  return context
}

/**
 * La sugerencia en línea de Spotlight («set|ting — System Settings.app»): si lo escrito es el
 * principio del título del elegido —sin distinguir mayúsculas ni tildes—, el resto del título y
 * « — » con su detalle. Sigue al elegido y no al primer resultado: con las flechas cambia, como en
 * Spotlight, y así la pista `tab` de la fila dice la verdad sobre lo que va a completar.
 */
function completionOf(query: string, value: string | undefined, result: Result | undefined): Completion | null {
  if (!query || value === undefined || !result) return null
  const { title, description } = result
  if (title.length < query.length || normalize(title.slice(0, query.length)) !== normalize(query)) return null
  const text = title.slice(query.length) + (description ? ` — ${description}` : "")
  return text ? { value, title, text, accepts: normalize(title) !== normalize(query) } : null
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
  const [highlighted, setHighlighted] = React.useState<string | undefined>(undefined)
  // Lo escrito no entra en el campo: ver `CommandInput`.
  const [overflowing, setOverflowing] = React.useState(false)
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

  const result = React.useSyncExternalStore(
    results.subscribe,
    () => results.get(highlighted),
    () => undefined
  )
  const completion = overflowing ? null : completionOf(query, highlighted, result)
  const values = React.useSyncExternalStore(results.subscribe, results.values, () => NO_VALUES)

  const context = React.useMemo<CommandContextValue>(
    () => ({ query, setQuery, shouldFilter, results, completion, setOverflowing, labels: { ...provided, ...labels } }),
    // `labels` se compara por contenido: es un objeto literal en casi todos los usos.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [query, setQuery, shouldFilter, results, completion?.value, completion?.text, completion?.accepts, provided, labels?.placeholder, labels?.empty, labels?.dialog, labels?.filters]
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
        // Como Spotlight: el primer resultado está elegido desde la primera tecla y Enter lo abre.
        autoHighlight="always"
        keepHighlight
        onItemHighlighted={(next) => setHighlighted(next === undefined ? undefined : String(next))}
      >
        <div data-slot="command" className={cn("flex min-h-0 flex-col text-gray-1000", className)} {...props}>
          {children}
        </div>
      </AutocompletePrimitive.Root>
    </CommandContext.Provider>
  )
}

type CommandInputProps = Omit<AutocompletePrimitive.Input.Props, "className"> & {
  className?: string
  /** Clases de la cabecera que envuelve lupa y campo. */
  wrapperClassName?: string
}

/**
 * El campo ES la cabecera del panel, como en Spotlight: sin caja propia, 48 px, la lupa a la
 * izquierda y una línea abajo. Con borde y fondo sería una caja de radio 10 a pocos píxeles del
 * borde de otra de 26: dos curvas que no se acompañan.
 *
 * El texto es `body-large` (15 px regular) y no `title-2` con `font-normal`: Spotlight escribe en
 * regular, y un rol trae su peso —pisarlo es usar un título como cuerpo (ver
 * `test/typography.test.ts`)—. `body-large` es el cuerpo regular más grande que tiene la escala.
 *
 * La sugerencia en línea es un `<span aria-hidden>` encima del campo que repite lo escrito en
 * transparente —para empezar justo donde termina el texto— y sigue en gris. El valor del campo no
 * cambia hasta aceptarla con `Tab` o `→` al final: el lector de pantalla oye lo que se escribió, y
 * el resultado elegido ya lo anuncia el listbox.
 */
function CommandInput({ className, wrapperClassName, placeholder, onKeyDown, ref, ...props }: CommandInputProps) {
  const { query, setQuery, completion, setOverflowing, labels } = useCommand("CommandInput")
  const input = React.useRef<HTMLInputElement | null>(null)
  const setRef = React.useCallback(
    (node: HTMLInputElement | null) => {
      input.current = node
      if (typeof ref === "function") ref(node)
      else if (ref) ref.current = node
    },
    [ref]
  )
  // Si lo escrito no entra, el navegador desplaza el texto adentro del campo y la superposición
  // —que arranca en el borde— ya no quedaría pegada al cursor. Ahí la sugerencia se esconde (y con
  // ella Tab y la pista): se mide en cada tecla, antes de pintar.
  useIsoLayoutEffect(() => {
    const node = input.current
    setOverflowing(!!node && node.scrollWidth > node.clientWidth)
  }, [query, setOverflowing])
  return (
    <div data-slot="command-input-wrapper" className={cn("flex h-12 shrink-0 items-center gap-3 border-b border-gray-alpha-400 px-4", wrapperClassName)}>
      <SearchIcon aria-hidden="true" className="size-5 shrink-0 text-gray-900" />
      <div className="relative flex h-full min-w-0 flex-1 items-center">
        <AutocompletePrimitive.Input
          data-slot="command-input"
          ref={setRef}
          // El nombre es lo que dice el campo vacío: un placeholder no alcanza como nombre para todos
          // los lectores, así que se repite en `aria-label`. Un `aria-label` de la app le gana.
          aria-label={placeholder ?? labels.placeholder}
          placeholder={placeholder ?? labels.placeholder}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          enterKeyHint="search"
          className={cn("h-full w-full min-w-0 bg-transparent text-body-large text-gray-1000 outline-none placeholder:text-gray-700", className)}
          onKeyDown={(event) => {
            onKeyDown?.(event)
            // Con un IME (japonés, chino, acentos con tecla muerta) las teclas son de la composición.
            if (event.defaultPrevented || event.nativeEvent.isComposing || !completion) return
            const input = event.currentTarget
            const atEnd = input.selectionStart === input.value.length && input.selectionEnd === input.value.length
            const acceptKey = (event.key === "Tab" && !event.shiftKey) || event.key === "ArrowRight"
            if (!acceptKey || !atEnd || !completion.accepts) return
            event.preventDefault()
            setQuery(completion.title)
          }}
          {...props}
        />
        {completion && (
          <span aria-hidden="true" className="pointer-events-none absolute inset-0 flex items-center overflow-hidden text-body-large whitespace-pre">
            <span className="invisible">{query}</span>
            <span data-slot="command-completion" className="truncate text-gray-700">
              {completion.text}
            </span>
          </span>
        )}
      </div>
    </div>
  )
}

type CommandFiltersProps = Omit<WithClassName<RadioGroupPrimitive.Props<string>>, "onValueChange"> & {
  /** El chip prendido. El componente no filtra por chips: la app decide qué ítems pasa. */
  onValueChange?: (value: string) => void
}

/**
 * Los chips de Spotlight: una fila de una sola opción, con scroll horizontal si no entran.
 *
 * Un `radiogroup` y no un grupo de toggles: siempre hay exactamente uno prendido —«ninguno» sería lo
 * mismo que «Todo»—, y eso es lo que anuncia un grupo de radios («Facturas, radio, 2 de 3,
 * marcado»). Las flechas recorren los chips y Tab sale del grupo, como en cualquier radiogroup.
 * Se ven como los chips de `Toggle`. El nombre del grupo sale de `labels.filters` («Filtros»).
 */
function CommandFilters({ onValueChange, className, ...props }: CommandFiltersProps) {
  const { labels } = useCommand("CommandFilters")
  return (
    <RadioGroupPrimitive<string>
      data-slot="command-filters"
      aria-label={labels.filters}
      onValueChange={(value) => onValueChange?.(value)}
      className={cn("flex shrink-0 items-center gap-2 overflow-x-auto px-4 pt-2.5 pb-1 [scrollbar-width:none]", className)}
      {...props}
    />
  )
}

type CommandFilterProps = WithClassName<RadioPrimitive.Root.Props>

/** Un chip: el mismo dibujo que `Toggle`, con `data-checked` (el del radio) en lugar de `data-pressed`. */
function CommandFilter({ className, ...props }: CommandFilterProps) {
  return (
    <RadioPrimitive.Root
      data-slot="command-filter"
      className={cn(
        toggleVariants(),
        "data-checked:border-gray-900 data-checked:bg-gray-alpha-200 data-checked:text-gray-1000 data-checked:hover:bg-gray-alpha-300",
        className
      )}
      {...props}
    />
  )
}

type CommandListProps = WithClassName<AutocompletePrimitive.List.Props>

function CommandList({ className, ...props }: CommandListProps) {
  const { results } = useCommand("CommandList")
  const count = React.useSyncExternalStore(results.subscribe, results.count, () => -1)
  return (
    <AutocompletePrimitive.List
      data-slot="command-list"
      // Sin resultados la lista no ocupa lugar: el vacío va aparte y no quedan 12 px de padding.
      data-no-results={count === 0 ? "" : undefined}
      className={cn("max-h-96 min-h-0 flex-1 scroll-py-1.5 overflow-y-auto overscroll-contain p-1.5 data-no-results:p-0", className)}
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
  /** El detalle en gris debajo del título; también es lo que sigue a « — » en la sugerencia. */
  description?: React.ReactNode
  /** 32×32 con radio 8. Un ícono de lucide va a 20 px. */
  icon?: React.ReactNode
  /** El título en texto plano, si `children` no es un string. Es lo que se filtra y se sugiere. */
  textValue?: string
  /** Enter o click. */
  onSelect?: (value: string) => void
}

function CommandItem({ value, keywords, description, icon, textValue, onSelect, onClick, className, children, ref, ...props }: CommandItemProps) {
  const { query, shouldFilter, results, completion } = useCommand("CommandItem")
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
  const detail = textOf(description)
  const visible = !shouldFilter || matches(query, [title, ...(keywords ?? [])])

  useIsoLayoutEffect(() => {
    if (!visible || !element.current) return
    results.add(id, value, { title, description: detail || undefined }, element.current)
    return () => results.remove(id)
  }, [visible, id, value, title, detail, results])

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
        <span className="truncate text-callout font-medium">{children}</span>
        {description != null && <span className="truncate text-callout text-gray-900">{description}</span>}
      </span>
      {/* Solo cuando Tab hace algo: en el elegido, si su título completa lo escrito. */}
      {completion?.value === value && completion.accepts && (
        <Kbd data-slot="command-item-hint" aria-hidden="true" size="sm" className="hidden group-data-highlighted/command-item:inline-flex">
          tab
        </Kbd>
      )}
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
      className={cn("text-center text-callout text-gray-900 not-empty:px-4 not-empty:py-6", className)}
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
 * `Command` adentro de un diálogo de Base UI, anclado arriba como Spotlight. Sin X —Escape y un
 * click afuera cierran— y sin velo: la búsqueda flota sobre la pantalla y no la apaga. Base UI
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
