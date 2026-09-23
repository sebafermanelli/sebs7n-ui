"use client"

import { Field as FieldPrimitive } from "@base-ui/react/field"

import { cn } from "../lib/utils.js"

/**
 * Un campo: la etiqueta, el control, la ayuda y el error, atados entre sí.
 *
 * Sin `Field`, cada campo de cada app repite el mismo cableado a mano —un
 * `useId`, el `htmlFor`, el `aria-describedby` que hay que armar condicional
 * según si hay error o ayuda, el `aria-invalid`— y alcanza con olvidarse de uno
 * para que el lector de pantalla lea un campo sin nombre o no anuncie el error.
 * Acá eso lo hace Base UI: alcanza con anidar las partes.
 *
 * ```tsx
 * <Field name="email">
 *   <FieldLabel>Email</FieldLabel>
 *   <Input type="email" required />
 *   <FieldDescription>Te escribimos solo por este pedido.</FieldDescription>
 *   <FieldError />
 * </Field>
 * ```
 *
 * El control va suelto adentro: `Input`, `Textarea` y `Select` ya se enganchan
 * solos con el campo. Cualquier otro elemento nativo se envuelve en
 * `FieldControl`.
 *
 * `name` es lo que ata el campo con `Form`: es la clave que se usa tanto en los
 * valores del submit como en el objeto `errors` que devuelve el servidor.
 */
type FieldProps = Omit<FieldPrimitive.Root.Props, "className"> & { className?: string }

function Field({ className, ...props }: FieldProps) {
  return (
    <FieldPrimitive.Root data-slot="field" className={cn("flex flex-col gap-2", className)} {...props} />
  )
}

/**
 * La etiqueta del campo. Mismo estilo que `Label`, pero sin `htmlFor`: la
 * asociación con el control la resuelve el campo.
 *
 * `required` solo dibuja el asterisco. Que el campo sea obligatorio de verdad
 * lo decide el `required` del control, que es lo que valida el navegador.
 */
type FieldLabelProps = Omit<FieldPrimitive.Label.Props, "className"> & {
  className?: string
  required?: boolean
}

function FieldLabel({ className, required = false, children, ...props }: FieldLabelProps) {
  return (
    <FieldPrimitive.Label
      data-slot="field-label"
      className={cn(
        "inline-flex items-center gap-1 text-label-12 text-gray-1000 select-none",
        "data-disabled:cursor-not-allowed data-disabled:text-gray-700",
        className
      )}
      {...props}
    >
      {children}
      {required && (
        <span aria-hidden="true" className="text-red-900">
          *
        </span>
      )}
    </FieldPrimitive.Label>
  )
}

/**
 * La ayuda del campo: qué formato espera, para qué se usa el dato, qué pasa si
 * se deja vacío. Va siempre visible, no en un tooltip: una ayuda que hay que
 * descubrir no ayuda a quien más la necesita.
 */
type FieldDescriptionProps = Omit<FieldPrimitive.Description.Props, "className"> & { className?: string }

function FieldDescription({ className, ...props }: FieldDescriptionProps) {
  return (
    <FieldPrimitive.Description
      data-slot="field-description"
      className={cn("text-copy-13 text-gray-900", className)}
      {...props}
    />
  )
}

/**
 * El error del campo. Sin hijos muestra el mensaje que corresponda —el del
 * navegador, el de `validate` o el que mandó el servidor por `Form`—, y no
 * ocupa lugar mientras el campo esté bien.
 *
 * Con `match` se escribe un mensaje propio para un motivo puntual
 * (`match="valueMissing"`, `match="typeMismatch"`), que es mejor que el del
 * navegador porque puede hablar del dato y no del input.
 */
type FieldErrorProps = Omit<FieldPrimitive.Error.Props, "className"> & { className?: string }

function FieldError({ className, ...props }: FieldErrorProps) {
  return (
    <FieldPrimitive.Error data-slot="field-error" className={cn("text-copy-13 text-red-900", className)} {...props} />
  )
}

/**
 * El control, para lo que no sea `Input`, `Textarea` ni `Select`: un `<input>`
 * nativo, un control de otra librería, un componente propio.
 *
 * ```tsx
 * <FieldControl render={<input type="date" />} />
 * ```
 */
function FieldControl(props: FieldPrimitive.Control.Props) {
  return <FieldPrimitive.Control data-slot="field-control" {...props} />
}

/**
 * Acceso al estado del campo —si está tocado, sucio, válido, y a los errores—
 * para dibujar algo que dependa de eso: un contador que se pone rojo, un tilde
 * cuando el dato ya es válido.
 *
 * ```tsx
 * <FieldValidity>{({ value }) => <span>{String(value).length} / 280</span>}</FieldValidity>
 * ```
 */
function FieldValidity(props: FieldPrimitive.Validity.Props) {
  return <FieldPrimitive.Validity {...props} />
}

export {
  Field,
  FieldControl,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldValidity,
  type FieldDescriptionProps,
  type FieldErrorProps,
  type FieldLabelProps,
  type FieldProps,
}
