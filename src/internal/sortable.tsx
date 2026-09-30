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

import { Button } from "../components/button.js"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../components/dropdown-menu.js"
import { List, ListRow } from "../components/list-row.js"
import { Tooltip, TooltipContent, TooltipTrigger } from "../components/tooltip.js"
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
  added: "Se agregó",
  nothingToAdd: "No hay más para agregar",
  editing: "Modo edición. Arrastrá para ordenar.",
  done: "Listo.",
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
  labels?: Partial<SortableLabels>
}

type SortableBaseProps<T> = SortableProps<T> &
  Omit<React.ComponentProps<"ul">, "children"> & {
    variant: "list" | "grid"
    /** Con manija o el ítem entero. */
    handle: boolean
    /**
     * Las clases del `<li>` de cada ítem. La grilla llama a la función con `(item, index)` (2.0) y la
     * lista con `(item, { index, dragging, editing })` (2.2): cada uno la tipa en su componente.
     */
    itemClassName?: string | ((item: T, state: never) => string | undefined)
    /** Solo la lista: filas sin separador ni padding, para un `renderItem` que dibuja su card. */
    plain?: boolean
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
  labels: labelsProp,
  itemClassName,
  plain = false,
  className,
  ref,
  ...props
}: SortableBaseProps<T>) {
  const labels = { ...sortableLabels, ...useLabels().sortable, ...defined(labelsProp) }
  const container = React.useRef<HTMLUListElement | null>(null)
  // `true` desde que se toma un ítem hasta un tick después de soltarlo: el Esc que cancela un
  // arrastre es del arrastre, no sale de la edición.
  const dragging = React.useRef(false)
  const { editing, press, exitedByOther } = useEditMode({ editingProp, defaultEditing, onEditingChange, disabled, container, dragging })
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

  // Al sacar uno, el foco pasa al «−» que queda en su lugar (o al último, o a la grilla si quedó
  // vacía): si no, se iba al `<body>` con el botón que desaparece. Se resuelve
  // cuando la clave ya no está en `items`, no en el render que sigue: la app puede sacarlo tarde
  // (después de guardar), y mientras tanto el foco se queda en su «−».
  const focusAfterRemove = React.useRef<{ key: string; index: number } | null>(null)
  const removeItem = (key: string, index: number, name: string) => {
    focusAfterRemove.current = { key, index }
    setStatus(`${labels.removed} ${name}.`)
    onRemove?.(key)
  }
  React.useEffect(() => {
    const pending = focusAfterRemove.current
    if (!pending || keys.includes(pending.key)) return
    focusAfterRemove.current = null
    const root = container.current
    const buttons = root?.querySelectorAll<HTMLElement>("[data-slot=sortable-remove]") ?? []
    const next = buttons[Math.min(pending.index, buttons.length - 1)] ?? root
    next?.focus()
  })

  // Lo que se eligió en un `SortableAddButton`: cuando aparece acá, el foco va a su «−» (o a la
  // tarjeta, o a la manija) y se anuncia. Solo lo toma la que está en edición (el «+» vive al lado
  // de su «Listo»): otra que ya tenga esa clave no es la que recibe. Si la app no lo agrega, no pasa
  // nada y la elección vence sola (ver `SortableAddButton`). Cuenta solo si la clave llega ahora:
  // una grilla que se monta o ya la tenía no es la que la recibió.
  const previousKeys = React.useRef(keys)
  React.useEffect(() => {
    const before = previousKeys.current
    previousKeys.current = keys
    const key = addedKey.current
    if (!editing || key === null || !keys.includes(key) || before.includes(key)) return
    addedKey.current = null
    const item = container.current?.querySelectorAll<HTMLElement>("[data-slot=sortable-list-item], [data-slot=sortable-grid-item]")[keys.indexOf(key)]
    const target = item?.querySelector<HTMLElement>("[data-slot=sortable-remove], [data-slot=sortable-handle]") ?? (item?.tabIndex === 0 ? item : null)
    target?.focus()
    setStatus(`${labels.added} ${nameOf(key)}.`)
  })

  // Entrar y salir de la edición se anuncia (no al montar: arrancar editando no es un cambio). Una
  // vez por cambio, aunque la app vuelva a mandar `editing` igual.
  const wasEditing = React.useRef(editing)
  React.useEffect(() => {
    if (wasEditing.current === editing) return
    wasEditing.current = editing
    // Si salió porque entró otra, esa anuncia su «Modo edición…»: dos avisos seguidos se pisan.
    const quiet = !editing && exitedByOther.current
    exitedByOther.current = false
    setStatus(editing ? labels.editing : quiet ? "" : labels.done)
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
            // Enfocable por código (no por Tab): adonde va el foco si se saca el último ítem.
            tabIndex={-1}
            className={cn("outline-none", variant === "grid" && "grid gap-5", className)}
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
                  className={
                    typeof itemClassName === "function"
                      ? (dragging: boolean) =>
                          (itemClassName as (item: T, state: unknown) => string | undefined)(item, variant === "list" ? { index, dragging, editing } : index)
                      : itemClassName
                  }
                  plain={plain}
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

/** Cuánto hay que mantener apretado un ítem para entrar en edición, como en iOS. */
const LONG_PRESS = 500
/** Lo que se puede mover el puntero mientras tanto: más es un scroll o un arrastre, no apretar. */
const SLOP = 8
const ITEM = "[data-slot=sortable-list-item], [data-slot=sortable-grid-item]"
/**
 * Lo que flota encima (un diálogo, un menú, un toast) y el «+» de `SortableAddButton`: su Esc y sus
 * clics son suyos, no salen de la edición.
 */
const LAYER = "[role=dialog], [role=alertdialog], [role=menu], [role=listbox], [data-slot$=-overlay], [data-sonner-toaster], [data-sortable-add]"

/**
 * La que está en edición ahora, de todas las de la página: como en iOS, se edita una por vez.
 * Entrar en otra saca a esta, y así el Esc (que escucha solo la que edita) sale de una sola.
 */
let editingNow: { exitForOther: () => void } | null = null

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

  // `true` cuando la sacó otra que entró en edición: esa salida no se anuncia.
  const exitedByOther = React.useRef(false)
  const self = React.useRef({
    exitForOther: () => {
      exitedByOther.current = true
      setEditing(false)
    },
  })
  React.useEffect(() => {
    if (!editing) return
    exitedByOther.current = false
    const me = self.current
    if (editingNow && editingNow !== me) editingNow.exitForOther()
    editingNow = me
    return () => {
      if (editingNow === me) editingNow = null
    }
  }, [editing])

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
      // `detail` 0 es un clic de teclado (Enter, Espacio): no es el que llega al soltar el dedo. Si
      // se soltó afuera, ese clic nunca vino y la marca quedó prendida.
      if (event.detail === 0) return
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
        } satisfies PressHandlers)),
    // En táctil, apretar largo abre el menú del sistema (Android): llega a los ≥ 500 ms, cuando el
    // timer ya limpió `press` y la edición ya entró. Por eso va siempre y mira también `longPressed`.
    onContextMenu: (event) => {
      if (press.current || longPressed.current) event.preventDefault()
    },
  }
  return { editing, press: handlers, exitedByOther }
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

/**
 * La clave elegida en el último `SortableAddButton`, hasta que la grilla o la lista en edición la ve
 * llegar en `items` (ver el efecto en `SortableBase`) o hasta `ADDED_TTL`. De módulo: el botón vive
 * afuera, al lado del «Listo» de la app, y se edita una grilla por vez.
 */
const addedKey: { current: string | null } = { current: null }
/** Cuánto vale una elección: si la app no la agregó para entonces, ya no mueve el foco ni se anuncia. */
const ADDED_TTL = 500

type SortableAddItem = { id: string; label: string; icon?: React.ReactNode }

type SortableAddButtonProps = {
  /** Lo que se puede agregar (lo que se sacó, lo que falta). Vacío, el «+» se deshabilita y dice por qué. */
  items: readonly SortableAddItem[]
  /**
   * Recibe el id elegido; la app lo suma a `items` de la grilla. Si el id es la clave del ítem
   * (`getKey`), cuando aparece el foco va a su «−» y se anuncia «Se agregó …».
   */
  onSelect: (id: string) => void
  /** `icon-md` (36) como los botones de una barra; `icon-sm` (28) al lado de un «Listo» `sm`. */
  size?: "icon-sm" | "icon-md"
  labels?: Partial<Pick<SortableLabels, "add" | "nothingToAdd">>
  className?: string
}

/**
 * El «+» del modo edición, para poner al lado del «Listo» de la app: un botón de ícono que abre un
 * menú con lo que se puede agregar, como el «Editar widgets» de iOS. Reemplaza a la celda «+
 * Agregar» del final: un lugar fijo, que no se corre con la grilla.
 */
function SortableAddButton({ items, onSelect, size = "icon-md", labels: labelsProp, className }: SortableAddButtonProps) {
  const labels = { ...sortableLabels, ...useLabels().sortable, ...defined(labelsProp) }
  const why = React.useId()
  const chosen = React.useRef(false)
  const trigger = React.useRef<HTMLButtonElement | null>(null)
  if (items.length === 0) {
    // Deshabilitado pero enfocable (`focusableWhenDisabled`): así el teclado y el lector llegan y
    // escuchan por qué; el tooltip lo dice al puntero. `aria-disabled` explícito a propósito: el
    // que `Button` maneja por `loading` pisa el que pondría `focusableWhenDisabled`.
    return (
      <Tooltip>
        <TooltipTrigger
          render={
            <Button aria-describedby={why} aria-disabled aria-label={labels.add} className={className} data-sortable-add="" disabled focusableWhenDisabled size={size} variant="plain" />
          }
        >
          <PlusIcon />
          <span hidden id={why}>
            {labels.nothingToAdd}
          </span>
        </TooltipTrigger>
        <TooltipContent>{labels.nothingToAdd}</TooltipContent>
      </Tooltip>
    )
  }
  return (
    <DropdownMenu
      onOpenChangeComplete={(open) => {
        // Si lo elegido no apareció en ninguna grilla (o la app no lo agregó), el foco quedó en el
        // <body> con el menú que se fue: vuelve al «+».
        if (open || !chosen.current) return
        window.setTimeout(() => {
          const active = document.activeElement
          if (!active || active === document.body || !active.isConnected) trigger.current?.focus()
        })
      }}
    >
      <DropdownMenuTrigger ref={trigger} render={<Button aria-label={labels.add} className={className} data-sortable-add="" size={size} variant="plain" />}>
        <PlusIcon />
      </DropdownMenuTrigger>
      {/* Si se eligió uno, el foco lo mueve la grilla a lo agregado: el menú no lo devuelve al «+». */}
      <DropdownMenuContent align="end" finalFocus={() => !chosen.current}>
        {items.map((item) => (
          <DropdownMenuItem
            key={item.id}
            onClick={() => {
              chosen.current = true
              addedKey.current = item.id
              onSelect(item.id)
              window.setTimeout(() => {
                chosen.current = false
                if (addedKey.current === item.id) addedKey.current = null
              }, ADDED_TTL)
            }}
          >
            {item.icon != null && (
              <span aria-hidden="true" className="contents">
                {item.icon}
              </span>
            )}
            {item.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
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
  /** Una función si depende de si se está arrastrando (el `itemClassName` de la lista). */
  className?: string | ((dragging: boolean) => string | undefined)
  plain: boolean
  children: (state: SortableItemState) => React.ReactNode
}

function SortableItem({ id, onRemove, press, editing, draggable, index, label, labels, variant, handle, className: classNameProp, plain, children }: SortableItemProps) {
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
  const className = typeof classNameProp === "function" ? classNameProp(isDragging) : classNameProp
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
        data-plain={plain ? "" : undefined}
        {...press}
        // Mantenerla apretada entra en edición: sin seleccionar texto ni el globo de iOS. `plain`: la
        // fila de `ListRow` sin su separador ni su padding (el `div` de adentro es el de `ListRow`).
        className={cn(
          "select-none [-webkit-touch-callout:none] data-dragging:z-10 data-dragging:bg-surface data-dragging:shadow-menu",
          plain && "before:hidden [&>div]:min-h-0 [&>div]:p-0",
          motion,
          className
        )}
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
        "relative min-w-0 rounded-surface select-none [-webkit-touch-callout:none] data-dragging:z-10 data-dragging:[&>*]:shadow-modal",
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

export { jiggleAngle, SortableAddButton, SortableBase, sortableLabels, type SortableAddButtonProps, type SortableAddItem, type SortableItemState, type SortableLabels, type SortableProps }
