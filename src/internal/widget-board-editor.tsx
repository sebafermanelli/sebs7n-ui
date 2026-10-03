"use client"

import * as React from "react"
import { PlusIcon, RotateCcwIcon } from "lucide-react"

import { Button } from "../components/button.js"
import { Popover, PopoverContent, PopoverDescription, PopoverHeader, PopoverTitle, PopoverTrigger } from "../components/popover.js"
import { SortableGrid } from "../components/sortable-grid.js"
import { cn } from "../lib/utils.js"
import { ADDED_TTL, addedKey } from "../internal/sortable.js"
import { WidgetEmpty, widgetGridClassName, widgetItemClassName } from "../internal/widget-board-parts.js"
import type { WidgetLayout } from "../lib/widget-layout.js"

/**
 * La parte pesada de `WidgetBoard`, que se pide aparte (`React.lazy`) la primera vez que se edita:
 * `SortableGrid` (con `@dnd-kit/*`), la barra de edición («Agregar widget», «Restablecer») y el
 * catálogo. Una vez cargada queda montada: salir de la edición no desmonta las cards ni sus estados.
 * Es el export por defecto, no es API.
 */
export default function WidgetBoardEditor({ layout, gridClassName }: { layout: WidgetLayout; gridClassName?: string }) {
  const { visible, hidden, editing, labels } = layout
  const addButton = React.useRef<HTMLButtonElement | null>(null)
  // Se eligió uno: el foco lo mueve la grilla a su «−», no vuelve al disparador del catálogo.
  const chosen = React.useRef(false)

  // Al sacar el último, el foco iba al <body> con el «−» que desaparece: pasa a «Agregar widget».
  React.useEffect(() => {
    if (!editing || visible.length > 0) return
    const active = document.activeElement
    if (!active || active === document.body || !active.isConnected) addButton.current?.focus()
  })

  const choose = (id: string) => {
    chosen.current = true
    addedKey.current = id
    layout.add(id)
    layout.setCatalogOpen(false)
    window.setTimeout(() => {
      chosen.current = false
      if (addedKey.current === id) addedKey.current = null
    }, ADDED_TTL)
  }

  return (
    <>
      {editing && (
        <div className="mb-3 flex min-h-8 flex-wrap items-center justify-between gap-x-4 gap-y-2" data-slot="widget-board-bar">
          <p className="text-footnote text-label-secondary">{labels.hint}</p>
          <div className="flex items-center gap-2">
            <Popover onOpenChange={layout.setCatalogOpen} open={layout.catalogOpen}>
              {/* `data-sortable-add`: un clic acá no saca de la edición (ver `LAYER` en `sortable.tsx`). */}
              <PopoverTrigger render={<Button data-sortable-add="" ref={addButton} size="sm" variant="secondary" />}>
                <PlusIcon />
                {labels.add}
              </PopoverTrigger>
              <PopoverContent align="end" className="w-80 max-w-(--available-width)" finalFocus={() => !chosen.current}>
                <PopoverHeader>
                  <PopoverTitle>{labels.catalogTitle}</PopoverTitle>
                  <PopoverDescription>{labels.catalogDescription}</PopoverDescription>
                </PopoverHeader>
                {hidden.length === 0 ? (
                  <p className="text-callout text-label-secondary">{labels.catalogEmpty}</p>
                ) : (
                  <ul className="flex max-h-80 flex-col gap-1 overflow-y-auto" role="list">
                    {hidden.map((widget) => (
                      <li key={widget.id}>
                        <button
                          aria-label={`${labels.addNamed} ${widget.title}`}
                          className="flex w-full flex-col gap-2 rounded-control p-2 text-start outline-none transition-control hover:bg-fill-2 focus-visible:focus-ring"
                          data-slot="widget-board-catalog-item"
                          onClick={() => choose(widget.id)}
                          type="button"
                        >
                          <span className="flex items-center gap-2 text-callout text-label">
                            {widget.icon != null && (
                              <span aria-hidden="true" className="flex shrink-0 items-center">
                                {widget.icon}
                              </span>
                            )}
                            <span className="min-w-0 flex-1 truncate font-semibold">{widget.title}</span>
                            <PlusIcon aria-hidden="true" className="size-4 shrink-0 text-label-secondary" />
                          </span>
                          {widget.description != null && <span className="text-footnote text-label-secondary">{widget.description}</span>}
                          {widget.preview != null && (
                            <span aria-hidden="true" className="pointer-events-none flex max-h-16 flex-col justify-center overflow-hidden rounded-control bg-fill-1 px-3 py-2">
                              {widget.preview}
                            </span>
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </PopoverContent>
            </Popover>
            <Button aria-disabled={layout.isDefault || undefined} data-sortable-add="" disabled={layout.isDefault} focusableWhenDisabled onClick={layout.reset} size="sm" variant="plain">
              <RotateCcwIcon />
              {labels.reset}
            </Button>
          </div>
        </div>
      )}
      {visible.length === 0 ? (
        <WidgetEmpty labels={labels} onAdd={layout.openCatalog} onReset={layout.reset} />
      ) : (
        <SortableGrid
          aria-label={labels.region}
          className={cn(widgetGridClassName, gridClassName)}
          editing={editing}
          getKey={(widget) => widget.id}
          getLabel={(widget) => widget.title}
          itemClassName={widgetItemClassName}
          items={visible}
          // Entrar lo anuncia la región del tablero (con la ayuda de teclado); salir, la grilla.
          labels={{ editing: "", done: labels.doneAnnounce }}
          onEditingChange={layout.setEditing}
          onRemove={layout.remove}
          onReorder={(next) => layout.reorder(next.map((widget) => widget.id))}
          renderItem={(widget) => widget.render()}
        />
      )}
    </>
  )
}
