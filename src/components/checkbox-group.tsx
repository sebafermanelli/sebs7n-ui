"use client"

import type * as React from "react"
import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox"
import { CheckboxGroup as CheckboxGroupPrimitive } from "@base-ui/react/checkbox-group"
import { Field as FieldPrimitive } from "@base-ui/react/field"

import { cn, type WithClassName } from "../lib/utils.js"
import { Checkbox } from "./checkbox.js"
import { FieldDescription, FieldLabel } from "./field.js"

/**
 * Varios checkboxes que son **un solo dato**: qué servicios incluye el paquete,
 * qué días abre el local, qué permisos tiene el operador.
 *
 * La diferencia con tres `Checkbox` sueltos no es visual. Acá el valor es un
 * array (`["vuelo", "hotel"]`), el grupo es `role="group"` con un solo nombre
 * accesible, y el estado del grupo extiende el del `Field`: alcanza con
 * meterlo adentro para que `FieldLabel` lo nombre y `FieldError` muestre *su*
 * error —el de "tildá al menos uno"—, que no pertenece a ninguna casilla suelta.
 *
 * ```tsx
 * <Field name="servicios" validate={(v) => (Array.isArray(v) && v.length ? null : "Tildá al menos uno")}>
 *   <FieldLabel>Servicios incluidos</FieldLabel>
 *   <CheckboxGroup>
 *     <CheckboxGroupItem value="vuelo">Vuelo</CheckboxGroupItem>
 *     <CheckboxGroupItem value="hotel">Hotel</CheckboxGroupItem>
 *   </CheckboxGroup>
 *   <FieldError />
 * </Field>
 * ```
 *
 * **Va adentro de un `Field`**, incluso cuando no hay formulario ni `name`: el
 * `Field` es el que abre el ámbito de etiquetado del que `CheckboxGroupItem`
 * cuelga cada opción. Un grupo suelto —los filtros de una lista— igual se
 * envuelve en un `<Field>` pelado, que no es más que un `<div>` con contexto.
 *
 * Para opciones excluyentes va `RadioGroup`; para una sola casilla —aceptar los
 * términos— alcanza con `Checkbox`.
 */
type CheckboxGroupProps = WithClassName<CheckboxGroupPrimitive.Props>

function CheckboxGroup({ className, ...props }: CheckboxGroupProps) {
  return (
    <CheckboxGroupPrimitive
      data-slot="checkbox-group"
      className={cn("flex flex-col gap-3", className)}
      {...props}
    />
  )
}

/**
 * Una opción del grupo: la casilla, su etiqueta y su ayuda, ya atadas.
 *
 * Por dentro es un `Field.Item`, que abre un ámbito propio de etiquetado. Eso
 * es lo que permite que la etiqueta de la opción apunte a *esta* casilla
 * mientras el nombre del grupo entero sigue siendo el `FieldLabel` de afuera,
 * sin un `useId` ni un `htmlFor` escrito a mano. Sin esa pieza, adentro de un
 * `Field` las tres casillas se leerían con el nombre del campo. Es también el
 * motivo por el que el ítem necesita un `Field` arriba: es una parte del campo,
 * no un `<div>` con dos hijos.
 *
 * **`value` es la identidad de la opción y es lo que termina en el array.** No
 * uses `name` en los hijos: adentro de un `Field`, el `name` del campo le gana
 * al de la casilla y las tres opciones terminarían con el mismo valor.
 *
 * Con `parent` se hace el "seleccionar todo": no aporta valor propio al array,
 * queda indeterminado cuando hay algunos tildados y pasa a todos o a ninguno
 * de un click. Necesita que el grupo tenga `allValues`, que es de dónde saca la
 * cuenta de "todos".
 */
type CheckboxGroupItemProps = Omit<CheckboxPrimitive.Root.Props, "className" | "children"> & {
  className?: string
  /** Clases de la casilla, por si hay que correrla o agrandar el área de click. */
  checkboxClassName?: string
  /** Texto de la etiqueta de la opción. */
  children?: React.ReactNode
  /** Ayuda debajo de la etiqueta: qué incluye la opción, qué implica tildarla. */
  description?: React.ReactNode
}

function CheckboxGroupItem({
  checkboxClassName,
  children,
  className,
  description,
  disabled = false,
  // `parent` y `value` se desestructuran aunque se reenvíen tal cual: son las
  // dos props que definen al ítem, y así quedan a la vista en la tabla de props
  // del sitio en vez de perderse entre las heredadas del primitivo.
  parent = false,
  value,
  ...props
}: CheckboxGroupItemProps) {
  return (
    <FieldPrimitive.Item
      data-slot="checkbox-group-item"
      // `items-start` y no `items-center`: con ayuda debajo, centrar deja la
      // casilla flotando a mitad del bloque de texto en vez de al lado de la
      // etiqueta.
      className={cn("flex items-start gap-2", className)}
      disabled={disabled}
    >
      {/* Los 2px la alinean con el trazo del texto y no con la caja de línea:
          la etiqueta es de 12px dentro de un renglón de 16. */}
      <Checkbox
        className={cn("mt-0.5", checkboxClassName)}
        disabled={disabled}
        parent={parent}
        value={value}
        {...props}
      />
      <div className="flex flex-col gap-1">
        {/* La etiqueta es el `<label>` nativo de la casilla: el click en el
            texto tilda, que es la mitad del área útil de una opción. */}
        <FieldLabel className="cursor-pointer data-disabled:cursor-not-allowed">{children}</FieldLabel>
        {description != null && <FieldDescription>{description}</FieldDescription>}
      </div>
    </FieldPrimitive.Item>
  )
}

export { CheckboxGroup, CheckboxGroupItem, type CheckboxGroupItemProps, type CheckboxGroupProps }
