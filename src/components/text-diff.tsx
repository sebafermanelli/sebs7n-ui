import type * as React from "react"

import { LabelText } from "../internal/labels-text.js"
import type { Labels } from "../lib/labels.js"
import { diffWords } from "../lib/text-diff.js"
import { cn } from "../lib/utils.js"

type TextDiffLabels = NonNullable<Labels["textDiff"]>

/** Los textos por defecto (no están en `defaultLabels`: el componente es solo por subpath). */
const textDiffLabels: TextDiffLabels = { deleted: "Eliminado:", inserted: "Agregado:" }

type TextDiffProps = Omit<React.ComponentProps<"span">, "children"> & {
  /** El texto de la versión anterior. */
  from: string
  /** El texto de la versión nueva. */
  to: string
  /** Cambia los avisos para lector de pantalla; le gana al `LabelsProvider` (`labels.textDiff`). */
  labels?: Partial<TextDiffLabels>
}

/**
 * Los cambios entre dos versiones de un texto, en línea: lo quitado tachado (`<del>`) y lo agregado
 * subrayado (`<ins>`), palabra por palabra (`diffWords` de `sebs7n-ui/lib/text-diff`). Los lectores
 * de pantalla no anuncian `<del>`/`<ins>`: cada parte lleva un aviso oculto («Eliminado:»). Tampoco
 * depende del color: tachado y subrayado se leen igual en escala de grises. Server Component.
 */
function TextDiff({ from, to, labels, className, ...props }: TextDiffProps) {
  return (
    <span data-slot="text-diff" className={cn("whitespace-pre-wrap", className)} {...props}>
      {diffWords(from, to).map((part, index) =>
        part.type === "equal" ? (
          <span key={index}>{part.value}</span>
        ) : part.type === "delete" ? (
          <del key={index} className="rounded-xs bg-red-100 text-label line-through decoration-red-900">
            <span className="sr-only">
              <LabelText defaults={textDiffLabels} group="textDiff" labels={labels} name="deleted" />{" "}
            </span>
            {part.value}
          </del>
        ) : (
          <ins key={index} className="rounded-xs bg-green-100 text-label underline decoration-green-900 underline-offset-2">
            <span className="sr-only">
              <LabelText defaults={textDiffLabels} group="textDiff" labels={labels} name="inserted" />{" "}
            </span>
            {part.value}
          </ins>
        )
      )}
    </span>
  )
}

export { TextDiff, textDiffLabels, type TextDiffProps }
