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
import { GripVerticalIcon } from "lucide-react"

import { List, ListRow } from "../components/list-row.js"
import { useLabels, type Labels } from "../lib/labels.js"
import { cn } from "../lib/utils.js"

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
}

type SortableItemState = {
  /** La manija ⋮⋮, para ponerla donde vaya. `null` cuando se arrastra el ítem entero. */
  handle: React.ReactNode
  /** `true` mientras este ítem es el que se arrastra. */
  dragging: boolean
  index: number
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
  /** Apaga el arrastre: la lista se ve igual y no se mueve. */
  disabled?: boolean
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
  labels: labelsProp,
  itemClassName,
  className,
  ...props
}: SortableBaseProps<T>) {
  const labels = { ...sortableLabels, ...useLabels().sortable, ...labelsProp }
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

  const Container = variant === "list" ? List : "ul"
  return (
    <>
      <DndContext
        accessibility={{ announcements, screenReaderInstructions: { draggable: labels.instructions } }}
        collisionDetection={closestCenter}
        id={id}
        onDragCancel={() => setDragTarget(null)}
        onDragEnd={reorder}
        onDragOver={move}
        sensors={sensors}
      >
        <SortableContext disabled={disabled} items={keys} strategy={variant === "list" ? verticalListSortingStrategy : inPlace}>
          <Container
            data-slot={`sortable-${variant}`}
            role="list"
            className={cn(variant === "grid" && "grid gap-5", className)}
            {...props}
          >
            {shown.map((item, index) => {
              const key = keys[index]!
              return (
                <SortableItem
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
          </Container>
        </SortableContext>
      </DndContext>
      <span className="sr-only" data-slot="sortable-status" role="status">
        {status}
      </span>
    </>
  )
}

// La grilla no corre a nadie con transformaciones (el orden ya cambió en el DOM)…
const inPlace: SortingStrategy = () => null
// …y cada tarjeta que cambió de lugar se desliza desde donde estaba, no salta.
const animateAlways: AnimateLayoutChanges = (args) => defaultAnimateLayoutChanges({ ...args, wasDragging: true })

type SortableItemProps = {
  id: string
  index: number
  label: string
  labels: SortableLabels
  variant: "list" | "grid"
  handle: boolean
  className?: string
  children: (state: SortableItemState) => React.ReactNode
}

function SortableItem({ id, index, label, labels, variant, handle, className, children }: SortableItemProps) {
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
  // Con movimiento reducido no se desliza: salta. `!` porque el `transition` de dnd-kit va inline.
  const motion = "motion-reduce:transition-none!"

  const grip = handle ? (
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
  const content = children({ handle: variant === "list" ? null : grip, dragging: isDragging, index })

  if (variant === "list") {
    return (
      <ListRow
        ref={setNodeRef}
        style={style}
        data-dragging={isDragging ? "" : undefined}
        data-slot="sortable-list-item"
        className={cn("data-dragging:z-10 data-dragging:bg-surface data-dragging:shadow-menu", motion, className)}
      >
        {grip}
        <div className="flex min-w-0 flex-1 items-center gap-3">{content}</div>
      </ListRow>
    )
  }
  return (
    <li
      ref={(node) => {
        setNodeRef(node)
        if (!handle) setActivatorNodeRef(node)
      }}
      style={style}
      data-dragging={isDragging ? "" : undefined}
      data-slot="sortable-grid-item"
      {...(handle
        ? {}
        : { ...a11y, ...listeners, "aria-describedby": cn(pressed && grabbedId, a11y["aria-describedby"]) || undefined })}
      className={cn(
        "relative min-w-0 rounded-surface data-dragging:z-10 data-dragging:[&>*]:shadow-modal",
        !handle && "cursor-grab outline-none active:cursor-grabbing focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(color:--sf-focus)",
        motion,
        className
      )}
    >
      {content}
      {!handle && pressed && (
        <span hidden id={grabbedId}>
          {labels.grabbed}
        </span>
      )}
    </li>
  )
}

export { SortableBase, sortableLabels, type SortableItemState, type SortableLabels, type SortableProps }
