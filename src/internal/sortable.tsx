"use client"

import * as React from "react"
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type Announcements,
  type DragEndEvent,
  type DragOverEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core"
import {
  arrayMove,
  defaultAnimateLayoutChanges,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  type AnimateLayoutChanges,
  type SortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVerticalIcon, MinusIcon, PlusIcon } from "lucide-react"

import { List, ListRow } from "../components/list-row.js"
import { useLabels, type Labels } from "../lib/labels.js"
import { cn } from "../lib/utils.js"
import { defined } from "../internal/defined.js"

/**
 * La base de `SortableList` y `SortableGrid`: dnd-kit con la estrategia de lista o de grilla, el
 * teclado (Espacio toma, flechas mueven, Espacio suelta, Escape cancela) con los anuncios en
 * español de `labels.sortable`, y el orden optimista con vuelta atrás.
 *
 * No es API: cada componente expone solo lo suyo. Vive en `internal/` y no en `lib/` porque todo
 * `lib/*` se exporta, y esto importa `@dnd-kit`, que es un peer opcional.
 */
type SortableLabels = NonNullable<Labels["sortable"]>

/**
 * Los textos por defecto. No están en `defaultLabels` porque el barrel no tenía lugar (ver el tipo
 * `Labels`): se exportan desde `sebs7n-ui/sortable-list` y `sebs7n-ui/sortable-grid`.
 */
const sortableLabels: SortableLabels = {
  handle: "Reordenar",
  instructions: "Para moverlo, apretá Espacio, usá las flechas y apretá Espacio para soltarlo. Escape cancela.",
  picked: "Tomaste",
  dropped: "Soltaste",
  canceled: "Volvió a su lugar:",
  position: "posición",
  of: "de",
  failed: "No se pudo guardar el orden: volvió el anterior.",
  grabbed: "En movimiento",
  remove: "Sacar",
  removed: "Se sacó",
  add: "Agregar",
}

type SortableItemState = {
  /** La manija ⋮⋮, para ponerla donde vaya. `null` cuando se arrastra el ítem entero. */
  handle: React.ReactNode
  /** `true` mientras este ítem es el que se arrastra. */
  dragging: boolean
  index: number
  /** `true` en modo edición: la app puede esconder lo que no va mientras se ordena. */
  editing: boolean
}

type SortableProps<T> = {
  /** Los ítems en el orden actual. */
  items: readonly T[]
  /** La clave estable de cada ítem (su id). */
  getKey: (item: T) => string
  /** El nombre del ítem en la manija y en los anuncios. Por defecto, `getKey`. */
  getLabel?: (item: T) => string
  /** El contenido de cada ítem. Recibe la manija, si está arrastrando y su posición. */
  renderItem: (item: T, state: SortableItemState) => React.ReactNode
  /**
   * Recibe los ítems en el orden nuevo. El orden cambia en pantalla al soltar.
   *
   * - **Optimista:** devolvé una promesa y no toques `items` hasta que se resuelva. Si falla, el
   *   componente vuelve al orden anterior y anuncia `labels.failed`.
   * - **La app lo aplica:** si cambiás `items` vos (con o sin promesa), el orden es tuyo. Si después
   *   falla, revertilo y avisá vos: el componente no puede deshacer lo que ya es tu estado y no
   *   anuncia una vuelta atrás que no pasó.
   */
  onReorder: (items: T[]) => void | Promise<unknown>
  /** Apaga el arrastre: la lista se ve igual y no se mueve, aun en modo edición. */
  disabled?: boolean
  /**
   * Modo edición, controlado. Como la pantalla de inicio de iOS: **solo en edición se arrastra**.
   * La app lo prende con su botón («Editar») y lo apaga con «Listo».
   */
  editing?: boolean
  /** Si arranca en modo edición, sin controlarlo. */
  defaultEditing?: boolean
  /** Cuando se entra (mantener apretado un ítem ~0,5 s) o se sale (Esc, clic en un espacio vacío). */
  onEditingChange?: (editing: boolean) => void
  /**
   * Con esto, en edición cada ítem trae un «−» (arriba a la izquierda en la grilla, adelante en la
   * lista) que lo saca sin confirmar: recibe su clave, la app lo saca de `items`, y se anuncia
   * «Se sacó <nombre>».
   */
  onRemove?: (key: string) => void
  /** Con esto, en edición aparece al final una celda «+ Agregar» (una fila en la lista); la app decide qué abre. */
  onAdd?: () => void
  labels?: Partial<SortableLabels>
}

type SortableBaseProps<T> = SortableProps<T> &
  Omit<React.ComponentProps<"ul">, "children"> & {
    variant: "list" | "grid"
    /** Con manija o el ítem entero. */
    handle: boolean
    itemClassName?: string | ((item: T, index: number) => string | undefined)
  }

type Optimistic<T> = { base: readonly T[]; next: T[] }

const isPromise = (value: unknown): value is Promise<unknown> => typeof (value as Promise<unknown> | undefined)?.then === "function"

function SortableBase<T>({
  variant,
  handle,
  items,
  getKey,
  getLabel = getKey,
  renderItem,
  onReorder,
  disabled = false,
  editing: editingProp,
  defaultEditing = false,
  onEditingChange,
  onRemove,
  onAdd,
  labels: labelsProp,
  itemClassName,
  className,
  ref,
  ...props
}: SortableBaseProps<T>) {
  const labels = { ...sortableLabels, ...useLabels().sortable, ...defined(labelsProp) }
  const container = React.useRef<HTMLUListElement | null>(null)
  // `true` desde que se toma un ítem hasta un tick después de soltarlo: el Esc que cancela un
  // arrastre es del arrastre, no sale de la edición.
  const dragging = React.useRef(false)
  const { editing, press } = useEditMode({ editingProp, defaultEditing, onEditingChange, disabled, container, dragging })
  // Fuera de edición el arrastre no existe: ni manija, ni parada de Tab, ni sensores.
  const draggable = editing && !disabled
  // El id de dnd-kit sale de `useId`: sin él, su `DndDescribedBy-N` es un contador de módulo y el
  // HTML del servidor no coincide con el del cliente.
  const id = React.useId()
  // El orden optimista vale mientras la app no mande otros `items`: si los manda (lo guardó, o lo
  // pisó el servidor), mandan los suyos.
  const [optimistic, setOptimistic] = React.useState<Optimistic<T> | null>(null)
  const [status, setStatus] = React.useState("")
  const settled = optimistic?.base === items ? optimistic.next : items
  // En la grilla el orden cambia de verdad mientras arrastrás (`onDragOver`), no con traslaciones:
  // con tarjetas de distinto ancho (una `col-span-2`), correr cada una al lugar de la vecina las
  // encimaba y dejaba huecos. Así la grilla de CSS reacomoda todo y lo que ves es lo que queda.
  // dnd-kit compensa que el nodo arrastrado cambie de lugar en el DOM (sigue bajo el puntero).
  //
  // Se guarda qué ítem se arrastra y a qué índice, no una copia del orden: si la app manda `items`
  // nuevos a mitad del arrastre (llegó uno del servidor), se ven y el orden que se entrega al soltar
  // sale de ellos, no de una foto vieja.
  const live = variant === "grid"
  const [drag, setDrag] = React.useState<{ key: string; index: number } | null>(null)
  const dragRef = React.useRef(drag)
  const setDragTarget = (next: { key: string; index: number } | null) => {
    dragRef.current = next
    setDrag(next)
  }
  const indexIn = (order: readonly T[], key: UniqueIdentifier) => order.findIndex((item) => getKey(item) === String(key))
  const placed = (target: { key: string; index: number } | null): readonly T[] => {
    if (!target) return settled
    const from = indexIn(settled, target.key)
    if (from < 0) return settled
    return arrayMove([...settled], from, Math.min(target.index, settled.length - 1))
  }
  const shown = placed(drag)
  const keys = shown.map(getKey)

  // Con manija, el puntero toma al toque (la manija es `touch-none`). Sin manija, la tarjeta entera:
  // el mouse arranca a los 8 px, así un click en un botón de adentro sigue siendo un click, y el
  // dedo hay que dejarlo apretado 250 ms, así deslizar sobre las tarjetas sigue scrolleando.
  const pointer = useSensor(PointerSensor, { activationConstraint: { distance: 4 } })
  const mouse = useSensor(MouseSensor, { activationConstraint: { distance: 8 } })
  const touch = useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
  const keyboard = useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  const sensors = useSensors(handle ? pointer : mouse, handle ? null : touch, keyboard)

  const nameOf = (key: UniqueIdentifier) => {
    const item = shown.find((candidate) => getKey(candidate) === key)
    return item === undefined ? String(key) : getLabel(item)
  }
  // dnd-kit avisa «pasó por encima» también del lugar de donde salió, apenas lo toma: sin esto, ese
  // aviso pisaba el «Tomaste…». Se anuncia cuando el lugar cambia.
  const lastOver = React.useRef<UniqueIdentifier | null>(null)
  const at = (key: UniqueIdentifier) => `${labels.position} ${keys.indexOf(String(key)) + 1} ${labels.of} ${keys.length}`
  const announcements: Announcements = {
    onDragStart: ({ active }) => {
      lastOver.current = active.id
      return `${labels.picked} ${nameOf(active.id)}, ${at(active.id)}.`
    },
    onDragOver: ({ active, over }) => {
      if (!over || over.id === lastOver.current) return undefined
      lastOver.current = over.id
      return `${nameOf(active.id)}, ${at(over.id)}.`
    },
    onDragEnd: ({ active, over }) => (over ? `${labels.dropped} ${nameOf(active.id)}, ${at(over.id)}.` : undefined),
    onDragCancel: ({ active }) => `${labels.canceled} ${nameOf(active.id)}.`,
  }

  const move = ({ active, over }: DragOverEvent) => {
    if (!live || !over || active.id === over.id) return
    const to = indexIn(placed(dragRef.current), over.id)
    if (to < 0 || indexIn(settled, active.id) < 0) return
    setDragTarget({ key: String(active.id), index: to })
  }

  const reorder = ({ active, over }: DragEndEvent) => {
    if (live) {
      const target = dragRef.current
      setDragTarget(null)
      // Soltada afuera de la grilla: vuelve a donde estaba, como Escape.
      if (!over || !target) return
      const from = indexIn(settled, active.id)
      const to = Math.min(target.index, settled.length - 1)
      if (from >= 0 && from !== to) commit(arrayMove([...settled], from, to))
      return
    }
    if (!over || active.id === over.id) return
    commit(arrayMove([...shown], keys.indexOf(String(active.id)), keys.indexOf(String(over.id))))
  }

  // Lo último que mandó la app y el último orden optimista, para decidir al fallar la promesa.
  const latestItems = React.useRef(items)
  const latestNext = React.useRef<T[] | null>(null)
  React.useEffect(() => {
    latestItems.current = items
  })

  const commit = (next: T[]) => {
    const base = items
    setOptimistic({ base, next })
    latestNext.current = next
    setStatus("")
    const result = onReorder(next)
    if (isPromise(result)) {
      result.catch(() => {
        // Solo se vuelve atrás (y se anuncia) si el orden en pantalla sigue siendo el optimista: si
        // la app ya cambió `items` (lo aplicó ella, o llegó otro), el orden es suyo; y un fallo viejo
        // no deshace un orden más nuevo.
        if (latestItems.current !== base || latestNext.current !== next) return
        latestNext.current = null
        setOptimistic(null)
        setStatus(labels.failed)
      })
    }
  }

  // Al sacar uno, el foco pasa al «−» que queda en su lugar (o al último): si no, se iba al `<body>`
  // con el botón que desaparece.
  const focusAfterRemove = React.useRef<number | null>(null)
  const removeItem = (key: string, index: number, name: string) => {
    focusAfterRemove.current = index
    setStatus(`${labels.removed} ${name}.`)
    onRemove?.(key)
  }
  React.useEffect(() => {
    const index = focusAfterRemove.current
    if (index === null) return
    focusAfterRemove.current = null
    const buttons = container.current?.querySelectorAll<HTMLElement>("[data-slot=sortable-remove]") ?? []
    const next = buttons[Math.min(index, buttons.length - 1)] ?? container.current?.querySelector<HTMLElement>("[data-slot=sortable-add] button")
    next?.focus()
  })

  const settle = () => window.setTimeout(() => (dragging.current = false))

  const Container = variant === "list" ? List : "ul"
  return (
    <>
      <DndContext
        accessibility={{ announcements, screenReaderInstructions: { draggable: labels.instructions } }}
        collisionDetection={closestCenter}
        id={id}
        onDragCancel={() => {
          setDragTarget(null)
          settle()
        }}
        onDragEnd={(event) => {
          reorder(event)
          settle()
        }}
        onDragStart={() => {
          dragging.current = true
        }}
        onDragOver={move}
        sensors={sensors}
      >
        <SortableContext disabled={!draggable} items={keys} strategy={variant === "list" ? verticalListSortingStrategy : inPlace}>
          <Container
            data-slot={`sortable-${variant}`}
            data-editing={editing ? "" : undefined}
            ref={(node: HTMLUListElement | null) => {
              container.current = node
              if (typeof ref === "function") return ref(node)
              if (ref) ref.current = node
            }}
            role="list"
            className={cn(variant === "grid" && "grid gap-5", className)}
            {...props}
          >
            {shown.map((item, index) => {
              const key = keys[index]!
              return (
                <SortableItem
                  onRemove={onRemove && editing ? () => removeItem(key, index, getLabel(item)) : undefined}
                  press={press}
                  draggable={draggable}
                  editing={editing}
                  className={typeof itemClassName === "function" ? itemClassName(item, index) : itemClassName}
                  handle={handle}
                  id={key}
                  index={index}
                  key={key}
                  label={getLabel(item)}
                  labels={labels}
                  variant={variant}
                >
                  {(state) => renderItem(item, state)}
                </SortableItem>
              )
            })}
            {editing &&
              onAdd &&
              (variant === "list" ? (
                <ListRow data-slot="sortable-add" icon={<PlusIcon />} onClick={onAdd} title={labels.add} />
              ) : (
                // El mismo radio que las tarjetas; estira al alto de la fila de la grilla.
                <li className="min-w-0" data-slot="sortable-add">
                  <button
                    type="button"
                    onClick={onAdd}
                    className="flex size-full min-h-32 items-center justify-center gap-2 rounded-surface border-2 border-dashed border-label-tertiary text-callout text-label-secondary outline-none transition-control hover:bg-fill-1 hover:text-label focus-visible:focus-ring"
                  >
                    <PlusIcon aria-hidden="true" className="size-4" />
                    {labels.add}
                  </button>
                </li>
              ))}
          </Container>
        </SortableContext>
      </DndContext>
      <span className="sr-only" data-slot="sortable-status" role="status">
        {status}
      </span>
    </>
  )
}

/** Cuánto hay que mantener apretado un ítem para entrar en edición, como en iOS. */
const LONG_PRESS = 500
/** Lo que se puede mover el puntero mientras tanto: más es un scroll o un arrastre, no apretar. */
const SLOP = 8
const ITEM = "[data-slot=sortable-list-item], [data-slot=sortable-grid-item], [data-slot=sortable-add]"
/** Lo que flota encima (un diálogo, un menú): su Esc y sus clics son suyos, no salen de la edición. */
const LAYER = "[role=dialog], [role=alertdialog], [role=menu], [role=listbox], [data-slot$=-overlay]"

type PressHandlers = Pick<
  React.DOMAttributes<HTMLElement>,
  "onPointerDownCapture" | "onClickCapture" | "onPointerDown" | "onPointerMove" | "onPointerUp" | "onPointerCancel" | "onPointerLeave" | "onContextMenu"
>

type EditModeOptions = {
  editingProp: boolean | undefined
  defaultEditing: boolean
  onEditingChange: ((editing: boolean) => void) | undefined
  disabled: boolean
  container: React.RefObject<HTMLElement | null>
  dragging: React.RefObject<boolean>
}

/**
 * El modo edición: controlable, se entra manteniendo apretado un ítem y se sale con Esc o con un
 * clic en un espacio vacío. Devuelve los manejadores de puntero que va a llevar cada ítem.
 */
function useEditMode({ editingProp, defaultEditing, onEditingChange, disabled, container, dragging }: EditModeOptions) {
  const [own, setOwn] = React.useState(defaultEditing)
  const editing = editingProp ?? own
  // Lo de ahora, para lo que corre fuera del render (el timer, los listeners de `document`).
  const latest = React.useRef({ editing, editingProp, onEditingChange })
  latest.current = { editing, editingProp, onEditingChange }
  const setEditing = React.useCallback((next: boolean) => {
    const current = latest.current
    if (next === current.editing) return
    // Dos avisos en el mismo evento (el «Listo» de la app y el clic afuera) dicen uno solo.
    current.editing = next
    if (current.editingProp === undefined) setOwn(next)
    current.onEditingChange?.(next)
  }, [])

  const press = React.useRef<{ timer: number; x: number; y: number } | null>(null)
  // `true` cuando el mantener apretado se cumplió: el `click` que llega al soltar no es un clic.
  const longPressed = React.useRef(false)
  const cancelPress = React.useCallback(() => {
    if (press.current) window.clearTimeout(press.current.timer)
    press.current = null
  }, [])
  React.useEffect(() => cancelPress, [cancelPress])

  React.useEffect(() => {
    if (!editing) return
    const exit = () => setEditing(false)
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || event.defaultPrevented || dragging.current) return
      if (event.target instanceof Element && event.target.closest(LAYER)) return
      exit()
    }
    const onClick = (event: MouseEvent) => {
      const target = event.target
      // Desconectado: era el «−» de un ítem que ya se sacó.
      if (!(target instanceof Element) || !target.isConnected || target.closest(LAYER)) return
      const item = target.closest(ITEM)
      if (item && container.current?.contains(item)) return
      exit()
    }
    // Un tick después: el clic que prendió la edición (el «Editar» de la app) todavía está subiendo
    // al `document`, y la apagaría en el acto.
    const timer = window.setTimeout(() => {
      document.addEventListener("keydown", onKeyDown)
      document.addEventListener("click", onClick)
    })
    return () => {
      window.clearTimeout(timer)
      document.removeEventListener("keydown", onKeyDown)
      document.removeEventListener("click", onClick)
    }
  }, [editing, setEditing, container, dragging])

  const handlers: PressHandlers = {
    onPointerDownCapture: () => {
      longPressed.current = false
    },
    onClickCapture: (event) => {
      if (!longPressed.current) return
      longPressed.current = false
      event.preventDefault()
      event.stopPropagation()
    },
    ...(editing || disabled
      ? {}
      : ({
          onPointerDown: (event) => {
            if (event.button !== 0 || event.isPrimary === false) return
            cancelPress()
            const { clientX: x, clientY: y } = event
            const timer = window.setTimeout(() => {
              press.current = null
              longPressed.current = true
              setEditing(true)
            }, LONG_PRESS)
            press.current = { x, y, timer }
          },
          onPointerMove: (event) => {
            const start = press.current
            if (start && Math.hypot(event.clientX - start.x, event.clientY - start.y) > SLOP) cancelPress()
          },
          onPointerUp: cancelPress,
          onPointerCancel: cancelPress,
          onPointerLeave: cancelPress,
          // En táctil, apretar largo abre el menú del sistema (Android) justo cuando entra en edición.
          onContextMenu: (event) => {
            if (press.current) event.preventDefault()
          },
        } satisfies PressHandlers)),
  }
  return { editing, press: handlers }
}

/**
 * La fase del temblor de cada tarjeta (un `animation-delay` negativo): sale de su clave, así no
 * cambia cuando la tarjeta cambia de lugar, y las vecinas no tiemblan al unísono.
 */
function jiggleDelay(key: string) {
  let hash = 0
  for (const char of key) hash = (hash * 31 + char.charCodeAt(0)) % 997
  return `${-(hash % 6) * 0.05}s`
}

/**
 * Cuánto gira una tarjeta de este ancho al temblar: 1° hasta 250 px y después 250/ancho, así el
 * borde se corre ~2 px en cualquier tarjeta (con 1° fijo, una de 900 px se corría 8). Piso 0,3°: por
 * debajo ya no se ve que tiembla.
 */
function jiggleAngle(width: number) {
  if (width <= 250) return 1
  return Math.max(0.3, 250 / width)
}

// La grilla no corre a nadie con transformaciones (el orden ya cambió en el DOM)…
const inPlace: SortingStrategy = () => null
// …y cada tarjeta que cambió de lugar se desliza desde donde estaba, no salta.
const animateAlways: AnimateLayoutChanges = (args) => defaultAnimateLayoutChanges({ ...args, wasDragging: true })

type SortableItemProps = {
  id: string
  onRemove: (() => void) | undefined
  press: PressHandlers
  editing: boolean
  draggable: boolean
  index: number
  label: string
  labels: SortableLabels
  variant: "list" | "grid"
  handle: boolean
  className?: string
  children: (state: SortableItemState) => React.ReactNode
}

function SortableItem({ id, onRemove, press, editing, draggable, index, label, labels, variant, handle, className, children }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id,
    animateLayoutChanges: variant === "grid" ? animateAlways : undefined,
  })
  // dnd-kit pone `role="button"` y `aria-roledescription="sortable"` (en inglés). La manija ya es un
  // `<button>` con nombre; el ítem entero es un `listitem` con botones adentro, y un botón no puede
  // tener otros adentro. Las instrucciones llegan por `aria-describedby`.
  const { role: _role, "aria-roledescription": _roleDescription, "aria-pressed": pressed, ...a11y } = attributes
  // Sin manija, el `<li>` no puede llevar `aria-pressed` (un `listitem` no es un botón): que está
  // tomada se dice en su descripción, antes de las instrucciones.
  const grabbedId = React.useId()
  // `Translate` y no `Transform`: en una grilla con tarjetas de distinto ancho, dnd-kit escala la que
  // pasa por encima y el contenido se deforma.
  const style: React.CSSProperties = { transform: CSS.Translate.toString(transform), transition }
  // El ángulo del temblor según el ancho, medido al entrar en edición. Va directo al nodo (no en
  // `style`): React no toca una propiedad que no maneja, y así no hay un render más.
  const node = React.useRef<HTMLLIElement | null>(null)
  React.useLayoutEffect(() => {
    if (editing && node.current) node.current.style.setProperty("--sf-jiggle-angle", `${jiggleAngle(node.current.offsetWidth)}deg`)
  }, [editing])
  // Con movimiento reducido no se desliza: salta. `!` porque el `transition` de dnd-kit va inline.
  const motion = "motion-reduce:transition-none!"

  const grip = handle && draggable ? (
    <button
      type="button"
      ref={setActivatorNodeRef}
      {...a11y}
      aria-pressed={pressed}
      {...listeners}
      aria-label={`${labels.handle} ${label}`}
      data-slot="sortable-handle"
      className="relative flex size-7 shrink-0 cursor-grab touch-none items-center justify-center rounded-control text-label-tertiary outline-none transition-control touch-target hover:bg-fill-2 hover:text-label-secondary focus-visible:focus-ring active:cursor-grabbing"
    >
      <GripVerticalIcon aria-hidden="true" className="size-4" />
    </button>
  ) : null
  const content = children({ handle: variant === "list" ? null : grip, dragging: isDragging, index, editing })
  const wholeItem = !handle && draggable
  // El «−» de iOS: un círculo gris oscuro de 22 con el «−» blanco (el área de toque la agranda
  // `touch-target`). `gray-800` y no `surface-bar`: ese es el color de la cabecera de la card y el
  // círculo no se veía; este llega a 3:1 contra cabecera, superficie y página en los dos temas
  // (`contrast.test.ts`). No va en la que se arrastra.
  const remove =
    onRemove && !isDragging ? (
      <button
        type="button"
        aria-label={`${labels.remove} ${label}`}
        data-slot="sortable-remove"
        onClick={onRemove}
        className={cn(
          "relative z-10 flex size-[22px] shrink-0 items-center justify-center rounded-full bg-gray-800 text-white shadow-menu outline-none transition-control touch-target hover:brightness-90 focus-visible:focus-ring",
          variant === "grid" && "absolute -top-2 -left-2"
        )}
      >
        <MinusIcon aria-hidden="true" className="size-3.5" strokeWidth={3} />
      </button>
    ) : null

  if (variant === "list") {
    return (
      <ListRow
        ref={setNodeRef}
        style={style}
        data-dragging={isDragging ? "" : undefined}
        data-slot="sortable-list-item"
        {...press}
        className={cn("data-dragging:z-10 data-dragging:bg-surface data-dragging:shadow-menu", motion, className)}
      >
        {remove}
        <div className="flex min-w-0 flex-1 items-center gap-3">{content}</div>
        {/* La manija al final, como la tabla de iOS en edición: adelante va el «−». */}
        {grip}
      </ListRow>
    )
  }
  return (
    <li
      ref={(element) => {
        node.current = element
        setNodeRef(element)
        if (!handle) setActivatorNodeRef(element)
      }}
      style={editing ? { ...style, animationDelay: jiggleDelay(id) } : style}
      data-dragging={isDragging ? "" : undefined}
      data-slot="sortable-grid-item"
      {...press}
      {...(wholeItem ? { ...a11y, ...listeners, "aria-describedby": cn(pressed && grabbedId, a11y["aria-describedby"]) || undefined } : {})}
      className={cn(
        "relative min-w-0 rounded-surface [-webkit-touch-callout:none] data-dragging:z-10 data-dragging:[&>*]:shadow-modal",
        wholeItem && "cursor-grab outline-none active:cursor-grabbing focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(color:--sf-focus)",
        // En edición tiembla, salvo la que se arrastra (ver `animate-jiggle` en theme.css).
        editing && !isDragging && "animate-jiggle",
        motion,
        className
      )}
    >
      {content}
      {remove}
      {wholeItem && pressed && (
        <span hidden id={grabbedId}>
          {labels.grabbed}
        </span>
      )}
    </li>
  )
}

export { jiggleAngle, SortableBase, sortableLabels, type SortableItemState, type SortableLabels, type SortableProps }
