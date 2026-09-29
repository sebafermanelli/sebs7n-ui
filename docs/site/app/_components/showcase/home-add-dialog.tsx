"use client"

import type { ReactNode } from "react"
import { Button } from "sebs7n-ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "sebs7n-ui/dialog"
import { List, ListRow } from "sebs7n-ui/list-row"

type Removed = { id: string; title: string; icon: ReactNode }

/**
 * El «+ Agregar» de Inicio: los widgets que se sacaron, para volver a ponerlos. Es un chunk aparte
 * que se pide recién la primera vez que se abre (ver `home.tsx`).
 */
export function AddWidgetDialog({
  open,
  onOpenChange,
  widgets,
  onAdd,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  widgets: Removed[]
  onAdd: (id: string) => void
}) {
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Agregar un widget</DialogTitle>
          <DialogDescription>{widgets.length > 0 ? "Vuelve al final de Inicio." : "Están todos en Inicio."}</DialogDescription>
        </DialogHeader>
        {widgets.length > 0 && (
          <List aria-label="Widgets sacados" className="px-4 pb-4">
            {widgets.map((widget) => (
              <ListRow
                icon={widget.icon}
                key={widget.id}
                title={widget.title}
                trailing={
                  <Button aria-label={`Agregar ${widget.title}`} onClick={() => onAdd(widget.id)} size="sm" variant="secondary">
                    Agregar
                  </Button>
                }
              />
            ))}
          </List>
        )}
      </DialogContent>
    </Dialog>
  )
}
