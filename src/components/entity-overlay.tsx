"use client"

import * as React from "react"

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./alert-dialog.js"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./dialog.js"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "./sheet.js"

type EntityOverlayLabels = {
  unsavedTitle: string
  unsavedDescription: string
  /** Seguir editando. */
  cancel: string
  /** Salir y perder lo escrito. */
  discard: string
}

const entityOverlayLabels: EntityOverlayLabels = {
  unsavedTitle: "¿Descartar los cambios?",
  unsavedDescription: "Lo que escribiste no se guardó. Si salís ahora, se pierde.",
  cancel: "Seguir editando",
  discard: "Descartar",
}

type EntityOverlayContextValue = {
  /** Cierra el panel sin preguntar (al guardar). */
  close: () => void
  /** Avisa que se guardó: dejar de pedir confirmación. */
  markSaved: () => void
  /** Avisa que hay cambios (si el formulario no los dispara con un evento `input`). */
  markDirty: () => void
}

const EntityOverlayContext = React.createContext<EntityOverlayContextValue | null>(null)

/** Para que el formulario de adentro cierre el panel al guardar. `null` si no está dentro de uno. */
const useEntityOverlay = () => React.useContext(EntityOverlayContext)

type EntityOverlayProps = {
  /** `dialog` para un alta (modal, centrado); `sheet` para ver o editar algo que ya existe (lateral). */
  variant: "dialog" | "sheet"
  /** Está abierto. Con la URL como estado (`?new=1`, `?edit=<id>`), `open={params.has("new")}`. */
  open: boolean
  /** Se pidió cerrar y ya está confirmado (o no había cambios): sacá el parámetro de la URL o apagá el estado. */
  onClose: () => void
  title: string
  description?: string
  /** El formulario. Se monta recién al abrir, así no pesa en la lista. */
  children: React.ReactNode
  /** Pedir confirmación al cerrar con cambios. Default `true`. */
  confirmDiscard?: boolean
  labels?: Partial<EntityOverlayLabels>
}

/**
 * El alta o la edición de algo desde su lista, sin salir de ella: un `Dialog` para crear y un `Sheet` lateral
 * para ver o editar. No sabe de ningún router: recibe `open` y `onClose`, así sirve con la URL
 * (`?new=1` / `?edit=<id>`, que se puede compartir y que «atrás» cierra) o con un estado local.
 * Cualquier campo que se toque (evento `input`) marca cambios; cerrar con Escape, clic afuera o la X pide
 * confirmación, y el formulario cierra sin preguntar con `useEntityOverlay().close()` al guardar.
 * El contenido es un `@container`: el formulario se acomoda al ancho del panel y no al de la ventana.
 *
 * Con el router de Next, `onClose={() => router.replace(pathname, { scroll: false })}` y
 * `open={searchParams.has("new")}`.
 */
function EntityOverlay({ variant, open, onClose, title, description, children, confirmDiscard = true, labels: labelsProp }: EntityOverlayProps) {
  const labels = { ...entityOverlayLabels, ...labelsProp }
  const [dirty, setDirty] = React.useState(false)
  const [confirming, setConfirming] = React.useState(false)

  // Cerrado, vuelve a empezar: la próxima vez que abra no arrastra «sucio».
  React.useEffect(() => {
    if (!open) {
      setDirty(false)
      setConfirming(false)
    }
  }, [open])

  const value = React.useMemo<EntityOverlayContextValue>(() => ({ close: onClose, markSaved: () => setDirty(false), markDirty: () => setDirty(true) }), [onClose])
  const requestClose = () => (dirty && confirmDiscard ? setConfirming(true) : onClose())

  const body = (
    <EntityOverlayContext.Provider value={value}>
      <div className="@container min-w-0" onInput={() => setDirty(true)}>
        {children}
      </div>
    </EntityOverlayContext.Provider>
  )

  return (
    <>
      {variant === "dialog" ? (
        <Dialog onOpenChange={(next) => !next && requestClose()} open={open}>
          <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
              {description && <DialogDescription>{description}</DialogDescription>}
            </DialogHeader>
            {body}
          </DialogContent>
        </Dialog>
      ) : (
        <Sheet onOpenChange={(next) => !next && requestClose()} open={open}>
          <SheetContent className="overflow-y-auto sm:max-w-xl">
            <SheetHeader>
              <SheetTitle>{title}</SheetTitle>
              {description && <SheetDescription>{description}</SheetDescription>}
            </SheetHeader>
            <div className="px-5 pb-5">{body}</div>
          </SheetContent>
        </Sheet>
      )}
      <AlertDialog open={confirming}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{labels.unsavedTitle}</AlertDialogTitle>
            <AlertDialogDescription>{labels.unsavedDescription}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirming(false)}>{labels.cancel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setConfirming(false)
                onClose()
              }}
              variant="destructive"
            >
              {labels.discard}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export { EntityOverlay, entityOverlayLabels, useEntityOverlay, type EntityOverlayLabels, type EntityOverlayProps }
