"use client"

import { Fieldset as FieldsetPrimitive } from "@base-ui/react/fieldset"

import { cn } from "../lib/utils.js"

/**
 * Un grupo de campos con un título común: los datos de facturación, la
 * dirección de entrega, el horario de atención.
 *
 * No es decoración. Para quien navega con lector de pantalla, el grupo es lo
 * que da contexto a campos que solos serían ambiguos: dos campos "Calle" en la
 * misma pantalla se distinguen porque uno está en "Domicilio fiscal" y el otro
 * en "Dirección de entrega". `disabled` acá apaga todos los campos de adentro
 * de una.
 *
 * Para un grupo de opciones excluyentes va `RadioGroup`, que ya trae su propia
 * semántica de grupo.
 */
type FieldsetProps = Omit<FieldsetPrimitive.Root.Props, "className"> & { className?: string }

function Fieldset({ className, ...props }: FieldsetProps) {
  return (
    <FieldsetPrimitive.Root data-slot="fieldset" className={cn("flex w-full flex-col gap-4", className)} {...props} />
  )
}

/**
 * El título del grupo. Base UI lo asocia al `<fieldset>` con `aria-labelledby`
 * en lugar de usar un `<legend>` nativo, porque el `<legend>` no se puede
 * ubicar libremente sin pelear con el navegador.
 */
type FieldsetLegendProps = Omit<FieldsetPrimitive.Legend.Props, "className"> & { className?: string }

function FieldsetLegend({ className, ...props }: FieldsetLegendProps) {
  return (
    <FieldsetPrimitive.Legend
      data-slot="fieldset-legend"
      className={cn("text-label-14 text-gray-1000 data-disabled:text-gray-700", className)}
      {...props}
    />
  )
}

export { Fieldset, FieldsetLegend, type FieldsetLegendProps, type FieldsetProps }
