"use client"

import * as React from "react"
import { CheckCircle2Icon, CircleDotIcon } from "lucide-react"

import { cn } from "../lib/utils.js"
import { Button } from "./button.js"

type SaveBarLabels = {
  /** El estado con cambios. */
  unsaved: string
  /** El estado sin cambios. */
  saved: string
  discard: string
  save: string
}

const saveBarLabels: SaveBarLabels = { unsaved: "Cambios sin guardar", saved: "Todo guardado", discard: "Descartar", save: "Guardar" }

type SaveBarProps = Omit<React.ComponentProps<"div">, "children"> & {
  /** Hay cambios sin guardar: cambia el estado y habilita «Descartar». */
  dirty: boolean
  /** Guardando: «Guardar» muestra el spinner y «Descartar» se apaga. */
  pending?: boolean
  /** «Descartar»: volver al estado guardado. */
  onDiscard?: () => void
  /** «Guardar» como botón de la barra. Sin esto es un `submit`: la barra va dentro del `<form>` y lo envía. */
  onSave?: () => void
  /** «Guardar» apagado (formulario inválido). Con `pending` ya se apaga solo. */
  saveDisabled?: boolean
  labels?: Partial<SaveBarLabels>
}

/**
 * La barra de guardado de una pantalla de Configuración: queda **fija abajo, a todo el ancho del
 * contenido** (`sticky bottom-0`), con el estado a la izquierda —«Cambios sin guardar» o «Todo guardado»,
 * con ícono y texto, nunca solo color— y «Descartar» y «Guardar» a la derecha. En una caja angosta
 * (container query, 28 rem) los botones se reparten el ancho. Va como último hijo de la `Form` o del contenedor
 * de las secciones; el estado es un `role="status"` que el lector anuncia al cambiar.
 *
 * No calcula el «sucio»: la app (o `Form`) lo sabe y lo pasa en `dirty`.
 */
function SaveBar({ dirty, pending = false, onDiscard, onSave, saveDisabled, labels: labelsProp, className, ...props }: SaveBarProps) {
  const labels = { ...saveBarLabels, ...labelsProp }
  return (
    <div
      className={cn("@container sticky bottom-0 z-10 flex flex-wrap items-center gap-3 rounded-surface border border-separator bg-surface px-4 py-3 shadow-menu", className)}
      data-dirty={dirty ? "" : undefined}
      data-slot="save-bar"
      {...props}
    >
      <p aria-live="polite" className="flex items-center gap-2 text-callout text-label-secondary" role="status">
        {dirty ? <CircleDotIcon aria-hidden="true" className="size-4 text-warning-ink" /> : <CheckCircle2Icon aria-hidden="true" className="size-4 text-green-900" />}
        {dirty ? labels.unsaved : labels.saved}
      </p>
      <div className="flex w-full gap-2 @md:ml-auto @md:w-auto">
        <Button className="flex-1" disabled={!dirty || pending} onClick={onDiscard} type="button" variant="secondary">
          {labels.discard}
        </Button>
        <Button className="flex-1" disabled={saveDisabled} loading={pending} onClick={onSave} type={onSave ? "button" : "submit"}>
          {labels.save}
        </Button>
      </div>
    </div>
  )
}

export { SaveBar, saveBarLabels, type SaveBarLabels, type SaveBarProps }
