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
 *
 * **El error del grupo no va acá.** `Fieldset` no tiene parte de error, y no es
 * un olvido de esta capa: el `<fieldset>` no tiene forma estándar de llevar un
 * mensaje que el lector de pantalla anuncie —lo que anuncia al entrar es la
 * leyenda—, así que un `FieldsetError` pintaría un cartel rojo que media
 * pantalla nunca escucha. Base UI tampoco lo expone.
 *
 * Cuando el error es de un conjunto de opciones ("tildá al menos un servicio"),
 * ese conjunto **es un campo**: un `name`, un valor, un error. Se arma con un
 * `Field` alrededor del control de grupo, y ahí el `FieldError` sí queda atado
 * al `role="group"` por `aria-describedby`, entra en el `errors` de `Form` por
 * su `name` y se limpia solo al tildar:
 *
 * ```tsx
 * <Field name="servicios" validate={(v) => ((v as string[]).length ? null : "Elegí al menos uno")}>
 *   <FieldLabel>Servicios incluidos</FieldLabel>
 *   <CheckboxGroup>
 *     <CheckboxGroupItem value="vuelo">Vuelo</CheckboxGroupItem>
 *   </CheckboxGroup>
 *   <FieldError />
 * </Field>
 * ```
 *
 * Si el error cruza campos que siguen siendo distintos entre sí ("el domicilio
 * no existe" sobre calle + localidad), va en el campo que se puede corregir, o
 * arriba del formulario en un `Alert`; un `<fieldset>` no es el lugar.
 */
type FieldsetProps = Omit<FieldsetPrimitive.Root.Props, "className"> & { className?: string }

function Fieldset({ className, ...props }: FieldsetProps) {
  return (
    <FieldsetPrimitive.Root data-slot="fieldset" className={cn("flex flex-col gap-4", className)} {...props} />
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
