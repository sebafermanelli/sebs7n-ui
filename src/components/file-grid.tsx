"use client"

import * as React from "react"
import { EllipsisIcon, FileIcon, FolderIcon } from "lucide-react"

import type { AccessibleName } from "../internal/accessible-name.js"
import { isToggleModifier, useSelection, type SelectionProps } from "../internal/selection.js"
import { cn } from "../lib/utils.js"
import { ContextMenu, ContextMenuContent, ContextMenuTrigger } from "./context-menu.js"

/**
 * La vista de íconos de iCloud Drive: cada archivo es una miniatura en una caja de 96 (con el filo de
 * 1 px y radio 4 de las miniaturas de Drive, catálogo §1.6), el nombre en 14 hasta dos líneas y el tipo
 * en 12 gris. Con el puntero encima, una sola caja gris de radio 12 envuelve miniatura, nombre y tipo,
 * como Drive; la elegida lleva además un borde de 2 px del acento por dentro. El nombre sigue en
 * `label` (sin la píldora del acento del Finder).
 *
 * Drive web no se midió en esta vista (cambiarla escribe la preferencia de la cuenta): las medidas
 * salen de la lista de Drive y de la grilla de Photos (§2.6).
 *
 * Es un `listbox`: flechas en dos dimensiones (↑↓ saltan una fila del layout real; en RTL ← y →
 * se invierten), Home/End, type-ahead, Enter abre, y la selección sigue al foco. Con
 * `selectionMode="multiple"`, el modelo de selección múltiple de WAI-ARIA (ver `SelectionProps`).
 */
type FileGridItem = {
  id: string
  name: string
  /** El tipo, debajo del nombre en 12 gris: «PDF», «Carpeta», «12 ítems». */
  kind?: React.ReactNode
  /** La miniatura: un `<img>` (se ajusta sin recortar) o un ícono propio. */
  thumbnail?: React.ReactNode
  /** Sin miniatura, muestra el ícono de carpeta en vez del de archivo. */
  folder?: boolean
  disabled?: boolean
}

const normalize = (text: string) => text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase()

type FileGridPropsBase = Omit<React.ComponentProps<"div">, "children" | "defaultValue" | "onSelect"> & {
  items: FileGridItem[]
  /** Enter o doble click: abrir el archivo, entrar en la carpeta. */
  onOpen?: (item: FileGridItem) => void
  /**
   * Las acciones de un ítem: los ítems de un menú (`ContextMenuItem`, o `DropdownMenuItem`, que es el
   * mismo componente de Base UI), sin el `ContextMenuContent`. Un solo juego que abren el click
   * derecho, Shift+F10 o la tecla de menú sobre el ítem enfocado, y el click en el «…» que la grilla
   * pone arriba a la derecha de la caja (con el puntero o el foco; fuera del orden de Tab y del
   * lector, porque el teclado ya tiene el menú contextual).
   *
   * Como Drive, abrirlo sobre un ítem que no estaba elegido lo elige. `selected` son los ítems sobre
   * los que actúa: en `multiple`, sobre uno de los elegidos, todos los elegidos; si no, ese solo.
   */
  menu?: (item: FileGridItem, selected: FileGridItem[]) => React.ReactNode
}

// Shift+F10 o la tecla de menú: el `contextmenu` que el navegador no manda bien (llega con las
// coordenadas en 0), sintetizado sobre el elemento. Mismo motivo que en `ContextMenuTrigger`.
function openMenuAt(element: HTMLElement, x: number, y: number) {
  element.dispatchEvent(new MouseEvent("contextmenu", { bubbles: true, cancelable: true, clientX: Math.round(x), clientY: Math.round(y) }))
}

function FileGrid({
  className,
  items,
  selectionMode,
  selected: selectedProp,
  defaultSelected,
  onSelectedChange,
  onOpen,
  menu,
  onKeyDown: onKeyDownProp,
  ...props
}: FileGridProps) {
  const selection = useSelection<FileGridItem>(
    { selectionMode, selected: selectedProp, defaultSelected, onSelectedChange } as SelectionProps<FileGridItem>,
    (id) => items.find((item) => item.id === id)
  )
  const [focused, setFocused] = React.useState<string | null>(null)

  // Si un elegido ya no está en `items`, sale de la selección y se avisa (igual que en `Tree`).
  React.useEffect(() => {
    const exists = new Set(items.map((item) => item.id))
    selection.prune((id) => exists.has(id))
  })

  const refs = React.useRef(new Map<string, HTMLDivElement>())
  // El ítem del menú abierto (o del último: queda durante la animación de salida).
  const [target, setTarget] = React.useState<{ item: FileGridItem; selected: FileGridItem[] } | null>(null)
  const typed = React.useRef({ text: "", at: 0 })

  const tabStop =
    (focused != null && items.some((item) => item.id === focused) && focused) ||
    items.find((item) => selection.isSelected(item.id))?.id ||
    items[0]?.id

  const select = (item: FileGridItem) => {
    if (item.disabled) return
    selection.only(item)
  }

  // En `single` la selección sigue al foco. En `multiple` las flechas solas mueven el foco (y el
  // ancla), y con ⇧ extienden el rango desde el ancla.
  const moveTo = (item: FileGridItem | undefined, extend = false) => {
    if (!item) return
    const from = focused ?? item.id
    setFocused(item.id)
    if (!selection.multiple) select(item)
    else if (extend) selection.extend(item, items, from)
    else selection.anchorAt(item.id)
    refs.current.get(item.id)?.focus()
  }

  const onItemClick = (event: React.MouseEvent, item: FileGridItem) => {
    const from = focused ?? item.id
    setFocused(item.id)
    if (item.disabled) return
    if (selection.multiple && event.shiftKey) selection.extend(item, items, from)
    else if (selection.multiple && isToggleModifier(event)) selection.toggle(item, items)
    else selection.only(item)
  }

  // Antes de abrir el menú de un ítem: como Drive, si no estaba elegido pasa a ser el único elegido.
  // Con el dedo (`choose` en `false`) solo se anota: un scroll que arranca sobre un ítem no lo elige.
  const prepareMenu = (item: FileGridItem, choose = true) => {
    const inSelection = selection.multiple && selection.isSelected(item.id)
    if (choose) {
      setFocused(item.id)
      if (!inSelection) selection.only(item)
    }
    setTarget({ item, selected: inSelection ? items.filter((candidate) => selection.isSelected(candidate.id)) : [item] })
  }

  // Cuántos ítems hay en la fila del actual, según el layout: los que comparten su `top`.
  const rowStep = (index: number, direction: 1 | -1) => {
    const top = (i: number) => refs.current.get(items[i]!.id)?.getBoundingClientRect().top ?? 0
    const left = (i: number) => refs.current.get(items[i]!.id)?.getBoundingClientRect().left ?? 0
    const here = { top: top(index), left: left(index) }
    let target: number | undefined
    for (let i = index + direction; i >= 0 && i < items.length; i += direction) {
      if (top(i) === here.top) continue
      // La primera fila distinta: el ítem de esa fila más cerca en horizontal.
      if (target !== undefined && top(i) !== top(target)) break
      if (target === undefined || Math.abs(left(i) - here.left) < Math.abs(left(target) - here.left)) target = i
    }
    return target
  }

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    // El de la app va primero y puede cancelar el nuestro con `preventDefault()`; antes el suyo, que
    // llegaba por `...props` después, reemplazaba la navegación entera.
    onKeyDownProp?.(event)
    if (event.defaultPrevented) return
    const index = items.findIndex((item) => item.id === tabStop)
    const item = items[index]
    if (!item) return
    if (menu && (event.key === "ContextMenu" || (event.key === "F10" && event.shiftKey))) {
      // Siempre se cancela: si no, el `ContextMenuTrigger` lo abriría anclado a la grilla entera.
      event.preventDefault()
      const element = refs.current.get(item.id)
      if (element && !item.disabled) {
        const rect = element.getBoundingClientRect()
        openMenuAt(element, rect.left + 8, rect.top + 8)
      }
      return
    }
    if (selection.multiple && isToggleModifier(event) && event.key.toLowerCase() === "a") {
      event.preventDefault()
      selection.all(items)
      return
    }
    let next: number | undefined
    // En RTL la grilla corre de derecha a izquierda: → va al anterior.
    const forward = event.currentTarget.closest("[dir]")?.getAttribute("dir") === "rtl" ? -1 : 1
    switch (event.key) {
      case "ArrowRight":
        next = index + forward
        break
      case "ArrowLeft":
        next = index - forward
        break
      case "ArrowDown":
        next = rowStep(index, 1)
        break
      case "ArrowUp":
        next = rowStep(index, -1)
        break
      case "Home":
        next = 0
        break
      case "End":
        next = items.length - 1
        break
      case "Enter":
        if (!item.disabled) onOpen?.(item)
        break
      case " ":
        if (!item.disabled) selection.toggle(item, items)
        break
      default: {
        if (event.key.length !== 1 || event.ctrlKey || event.metaKey || event.altKey) return
        // Type-ahead, como en el Finder: lo tipeado en el último medio segundo, desde el que sigue; la
        // misma letra repetida recorre los que empiezan con ella.
        const now = Date.now()
        let text = (now - typed.current.at > 500 ? "" : typed.current.text) + normalize(event.key)
        typed.current = { text, at: now }
        if (text.length > 1 && [...text].every((char) => char === text[0])) text = text[0]!
        const ordered = [...items.slice(index + (text.length === 1 ? 1 : 0)), ...items.slice(0, index + 1)]
        const found = ordered.find((candidate) => normalize(candidate.name).startsWith(text))
        if (found) next = items.indexOf(found)
      }
    }
    event.preventDefault()
    // Type-ahead no extiende: ⇧ + una letra es una mayúscula.
    if (next !== undefined) moveTo(items[next], event.shiftKey && event.key.length > 1)
  }

  const grid = (
    <div
      data-slot="file-grid"
      role="listbox"
      aria-multiselectable={selection.multiple || undefined}
      onKeyDown={onKeyDown}
      // El click derecho en el espacio vacío no abre el menú de nadie.
      onContextMenu={(event) => {
        if (!(event.target as Element).closest("[role=option]")) event.stopPropagation()
      }}
      className="grid grid-cols-[repeat(auto-fill,minmax(8.5rem,1fr))] gap-x-2 gap-y-4 outline-none"
      {...props}
    >
      {items.map((item) => {
        const isSelected = selection.isSelected(item.id)
        return (
          <div
            key={item.id}
            ref={(element) => {
              if (element) refs.current.set(item.id, element)
              else refs.current.delete(item.id)
            }}
            role="option"
            aria-selected={isSelected}
            aria-disabled={item.disabled || undefined}
            tabIndex={item.id === tabStop ? 0 : -1}
            data-state={isSelected ? "selected" : undefined}
            onFocus={() => setFocused(item.id)}
            onClick={(event) => onItemClick(event, item)}
            onDoubleClick={() => !item.disabled && onOpen?.(item)}
            onContextMenu={(event) => {
              if (item.disabled) event.stopPropagation()
              else if (menu) prepareMenu(item)
            }}
            onTouchStart={menu && !item.disabled ? () => prepareMenu(item, false) : undefined}
            // La caja gris de Drive: una sola, radio 12, alrededor de miniatura, nombre y tipo. Con el
            // puntero, solo la caja; elegida (una o varias), la caja más 2 px del acento por dentro
            // (`inset-ring`: no corre el layout y sigue el radio). El foco en una no elegida es el
            // anillo de siempre; en una elegida el borde ya es del acento, así que el foco lo duplica
            // (2 → 4 px): en `multiple` hay varias elegidas y la enfocada se tiene que distinguir.
            className={cn(
              "group/selectable relative flex min-w-0 cursor-default flex-col items-center gap-1 rounded-menu p-1.5 pb-2 outline-none select-none hover:bg-fill-1 focus-visible:focus-ring aria-disabled:opacity-40 aria-disabled:hover:bg-transparent",
              "data-[state=selected]:bg-selection-inactive data-[state=selected]:inset-ring-2 data-[state=selected]:inset-ring-selection-border data-[state=selected]:focus-visible:inset-ring-4"
            )}
          >
            <div
              data-slot="file-grid-thumbnail"
              className={cn(
                "relative flex size-24 items-center justify-center p-2",
                "[&>img]:max-h-full [&>img]:max-w-full [&>img]:rounded-tag [&>img]:object-contain [&>img]:shadow-thumbnail"
              )}
            >
              {item.thumbnail ??
                (item.folder ? (
                  <FolderIcon aria-hidden="true" className="size-14 fill-brand-700/20 text-brand-900" strokeWidth={1.25} />
                ) : (
                  <FileIcon aria-hidden="true" className="size-14 text-label-secondary" strokeWidth={1.25} />
                ))}
            </div>
            {menu && !item.disabled && (
              // El «…» de Drive: un círculo gris translúcido de 24 en la esquina de la caja, solo en la
              // del puntero o la del foco (no en cada elegida). Es del puntero (el teclado tiene
              // Shift+F10): fuera del lector y del orden de Tab.
              <span
                data-slot="file-grid-more"
                aria-hidden="true"
                className="absolute end-1.5 top-1.5 opacity-0 transition-opacity group-hover/selectable:opacity-100 group-focus/selectable:opacity-100 motion-reduce:transition-none"
              >
                <button
                  type="button"
                  tabIndex={-1}
                  // Un click no le deja el foco a lo que el lector no ve.
                  onMouseDown={(event) => event.preventDefault()}
                  onDoubleClick={(event) => event.stopPropagation()}
                  onClick={(event) => {
                    event.stopPropagation()
                    const rect = event.currentTarget.getBoundingClientRect()
                    openMenuAt(event.currentTarget, rect.left, rect.bottom + 4)
                  }}
                  className="flex size-6 items-center justify-center rounded-full bg-fill-3 text-label transition-control hover:bg-fill-2"
                >
                  <EllipsisIcon className="size-4" />
                </button>
              </span>
            )}
            <span className="line-clamp-2 max-w-full px-1.5 text-center text-callout break-words text-label">{item.name}</span>
            {item.kind != null && <span className="text-footnote text-label-secondary">{item.kind}</span>}
          </div>
        )
      })}
    </div>
  )

  if (!menu) {
    return (
      <div data-slot="file-grid-container" className={cn("w-full", className)}>
        {grid}
      </div>
    )
  }
  return (
    <ContextMenu>
      <ContextMenuTrigger data-slot="file-grid-container" focusable={false} className={cn("w-full rounded-none", className)}>
        {grid}
      </ContextMenuTrigger>
      <ContextMenuContent finalFocus={() => (target && refs.current.get(target.item.id)) ?? true}>
        {target && menu(target.item, target.selected)}
      </ContextMenuContent>
    </ContextMenu>
  )
}

type FileGridProps = FileGridPropsBase & SelectionProps<FileGridItem> & AccessibleName

export { FileGrid, type FileGridItem, type FileGridProps }
