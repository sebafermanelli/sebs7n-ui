"use client"

import * as React from "react"
import { FileIcon, FolderIcon } from "lucide-react"

import type { AccessibleName } from "../internal/accessible-name.js"
import { isToggleModifier, useSelection, type SelectionProps } from "../internal/selection.js"
import { cn } from "../lib/utils.js"

/**
 * La vista de íconos de iCloud Drive: cada archivo es una miniatura en una caja de 96 (con el filo de
 * 1 px y radio 4 de las miniaturas de Drive, catálogo §1.6), el nombre en 14 hasta dos líneas y el tipo
 * en 12 gris. La elegida lleva la caja en `fill-2` y el nombre en la píldora del acento mientras la
 * grilla tiene el foco (gris sin foco), como el Finder.
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
   * El «…» de cada ítem, arriba a la derecha de la miniatura (se ve en la elegida y con el puntero).
   * Es para el puntero: sale del orden de Tab y del árbol de accesibilidad. Con teclado, las mismas
   * acciones van en un `ContextMenu` alrededor de la grilla (Shift+F10 o la tecla de menú).
   */
  actions?: (item: FileGridItem) => React.ReactNode
}

function FileGrid({
  className,
  items,
  selectionMode,
  selected: selectedProp,
  defaultSelected,
  onSelectedChange,
  onOpen,
  actions,
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

  return (
    <div data-slot="file-grid-container" className={cn("group/list w-full", className)}>
      <div
        data-slot="file-grid"
        role="listbox"
        aria-multiselectable={selection.multiple || undefined}
        onKeyDown={onKeyDown}
        className="grid grid-cols-[repeat(auto-fill,minmax(8.5rem,1fr))] gap-x-2 gap-y-4 outline-none"
        {...props}
      >
        {items.map((item) => {
          const isSelected = selection.isSelected(item.id)
          const action = actions?.(item)
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
              className="group/selectable relative flex min-w-0 cursor-default flex-col items-center gap-1 rounded-item p-1.5 outline-none select-none focus-visible:focus-ring aria-disabled:opacity-40"
            >
              <div
                data-slot="file-grid-thumbnail"
                className={cn(
                  "relative flex size-24 items-center justify-center rounded-item p-2 group-data-[state=selected]/selectable:bg-fill-2",
                  "[&>img]:max-h-full [&>img]:max-w-full [&>img]:rounded-tag [&>img]:object-contain [&>img]:shadow-thumbnail"
                )}
              >
                {item.thumbnail ??
                  (item.folder ? (
                    <FolderIcon aria-hidden="true" className="size-14 fill-brand-700/20 text-brand-900" strokeWidth={1.25} />
                  ) : (
                    <FileIcon aria-hidden="true" className="size-14 text-label-secondary" strokeWidth={1.25} />
                  ))}
                {action != null && (
                  <span
                    data-slot="file-grid-actions"
                    aria-hidden="true"
                    onDoubleClick={(event) => event.stopPropagation()}
                    // Está fuera de lo que lee el lector (`aria-hidden`): un click no le deja el foco.
                    onMouseDown={(event) => event.preventDefault()}
                    className="absolute -end-1 -top-1 opacity-0 transition-opacity group-hover/selectable:opacity-100 group-data-[state=selected]/selectable:opacity-100 motion-reduce:transition-none"
                  >
                    {React.isValidElement<{ tabIndex?: number }>(action) ? React.cloneElement(action, { tabIndex: -1 }) : action}
                  </span>
                )}
              </div>
              <span
                className={cn(
                  "line-clamp-2 max-w-full rounded-thumb px-1.5 text-center text-callout break-words text-label",
                  "group-data-[state=selected]/selectable:bg-selection-inactive group-data-[state=selected]/selectable:group-focus-within/list:bg-selection group-data-[state=selected]/selectable:group-focus-within/list:text-on-selection"
                )}
              >
                {item.name}
              </span>
              {item.kind != null && <span className="text-footnote text-label-secondary">{item.kind}</span>}
            </div>
          )
        })}
      </div>
    </div>
  )
}


type FileGridProps = FileGridPropsBase & SelectionProps<FileGridItem> & AccessibleName

export { FileGrid, type FileGridItem, type FileGridProps }
