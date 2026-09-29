"use client"

import * as React from "react"
import { FileIcon, FolderIcon } from "lucide-react"

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
 * Es un `listbox`: flechas en dos dimensiones (↑↓ saltan una fila del layout real), Home/End, Enter
 * abre, y la selección sigue al foco.
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

type FileGridProps = Omit<React.ComponentProps<"div">, "children" | "defaultValue" | "onSelect"> & {
  items: FileGridItem[]
  /** El ítem elegido. Pasarlo lo vuelve controlado. */
  selected?: string | null
  defaultSelected?: string | null
  onSelectedChange?: (id: string | null, item: FileGridItem | null) => void
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
  selected: selectedProp,
  defaultSelected = null,
  onSelectedChange,
  onOpen,
  actions,
  onKeyDown: onKeyDownProp,
  ...props
}: FileGridProps) {
  const [own, setOwn] = React.useState(defaultSelected)
  const selected = selectedProp !== undefined ? selectedProp : own
  const [focused, setFocused] = React.useState<string | null>(null)
  const refs = React.useRef(new Map<string, HTMLDivElement>())

  const tabStop =
    (focused != null && items.some((item) => item.id === focused) && focused) ||
    (selected != null && items.some((item) => item.id === selected) && selected) ||
    items[0]?.id

  const select = (item: FileGridItem) => {
    if (item.disabled) return
    if (selectedProp === undefined) setOwn(item.id)
    onSelectedChange?.(item.id, item)
  }

  const moveTo = (item: FileGridItem | undefined) => {
    if (!item) return
    setFocused(item.id)
    select(item)
    refs.current.get(item.id)?.focus()
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
    let next: number | undefined
    switch (event.key) {
      case "ArrowRight":
        next = index + 1
        break
      case "ArrowLeft":
        next = index - 1
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
        select(item)
        break
      default:
        return
    }
    event.preventDefault()
    if (next !== undefined) moveTo(items[next])
  }

  return (
    <div data-slot="file-grid-container" className={cn("group/list w-full", className)}>
      <div
        data-slot="file-grid"
        role="listbox"
        onKeyDown={onKeyDown}
        className="grid grid-cols-[repeat(auto-fill,minmax(8.5rem,1fr))] gap-x-2 gap-y-4 outline-none"
        {...props}
      >
        {items.map((item) => {
          const isSelected = selected === item.id
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
              onClick={() => {
                setFocused(item.id)
                select(item)
              }}
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

export { FileGrid, type FileGridItem, type FileGridProps }
