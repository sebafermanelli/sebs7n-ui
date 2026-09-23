"use client"

import { Field as FieldPrimitive } from "@base-ui/react/field"

import { cn, type WithClassName } from "../lib/utils.js"

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
 * El control va suelto adentro: `Input`, `Textarea`, `Select`, `NumberField`, `OTPField`,
 * `Slider` y `CheckboxGroup` ya se enganchan solos con el campo —todos renderizan a través
 * de un primitivo de `Field` de Base UI—. Cualquier otro elemento nativo se envuelve en
 * `FieldControl`.
 *
 * `name` es lo que ata el campo con `Form`: es la clave que se usa tanto en los
 * valores del submit como en el objeto `errors` que devuelve el servidor.
 */
type FieldProps = WithClassName<FieldPrimitive.Root.Props>

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
type FieldLabelProps = WithClassName<FieldPrimitive.Label.Props> & {
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
type FieldDescriptionProps = WithClassName<FieldPrimitive.Description.Props>

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
 * **Escribí siempre el mensaje**, con `match` o con `validate`. El del
 * navegador sale en el idioma del navegador y no en el de la página: una
 * persona con Chrome en inglés leyendo un formulario en español recibe "Please
 * fill out this field" abajo de «Razón social». `match="valueMissing"`,
 * `match="typeMismatch"` y compañía sirven además para hablar del dato —«Falta
 * la razón social»— en vez del input.
 *
 * El mensaje se lee solo al enfocar el campo, porque el campo lo referencia con
 * `aria-describedby`. Con validación al enviar alcanza: `Form` mueve el foco al
 * primer campo inválido y ahí se anuncia el nombre del campo y su error, en ese
 * orden, que es lo que hace falta.
 *
 * Con `validationMode="onChange"` eso no pasa: el error aparece mientras se
 * escribe, con el foco ya adentro del campo, y nada lo anuncia. Para ese caso
 * está `alert`, que le pone `role="alert"` al mensaje para que se lea apenas
 * aparece. Vale para cualquiera de los controles que se enganchan solos, no solo
 * para `Input`: `NumberField`, `OTPField`, `Slider` y `CheckboxGroup` también.
 *
 * **`alert` es opt-in a propósito.** `role="alert"` es una región viva
 * *assertive*: interrumpe lo que el lector esté diciendo. En el camino de
 * enviar eso duplica —el mensaje se anuncia por la región viva y otra vez
 * cuando el foco llega al campo— y encima corta el anuncio del nombre del
 * campo, que es la mitad que da contexto. Prendelo solo donde el error puede
 * aparecer sin que el foco se mueva. No está verificado con un lector real: el
 * razonamiento sale del modelo de regiones vivas, no de una sesión de
 * VoiceOver.
 */
type FieldErrorProps = WithClassName<FieldPrimitive.Error.Props> & {
  /** `role="alert"` para que el error se anuncie al aparecer. Solo con `validationMode="onChange"`. */
  alert?: boolean
}

function FieldError({ className, alert = false, ...props }: FieldErrorProps) {
  return (
    <FieldPrimitive.Error
      data-slot="field-error"
      role={alert ? "alert" : undefined}
      className={cn(
        "text-copy-13 text-red-900",
        // Con más de un mensaje, Base UI los mete en un `<ul>` sin estilo, que
        // el reset de Tailwind deja como un párrafo pegado. Con viñeta y
        // sangría se lee que son dos problemas distintos y no una frase larga.
        "[&>ul]:list-disc [&>ul]:space-y-1 [&>ul]:pl-4",
        className
      )}
      {...props}
    />
  )
}

/**
 * El control, para lo que no sea `Input`, `Textarea` ni `Select`: un `<input>`
 * nativo, un control de otra librería, un componente propio.
 *
 * ```tsx
 * <FieldControl render={<input type="date" />} />
 * ```
 *
 * **Funciona si el componente de adentro reenvía lo que recibe.** `FieldControl`
 * le pasa `id`, `name`, `aria-describedby`, `aria-invalid` y una `ref`; un
 * componente que declara `id` y `name` como props propias y no hace spread del
 * resto se queda sin nada, y el campo queda con la etiqueta apuntando al vacío.
 * Es el caso típico de un date picker o un autocomplete propio, hechos con un
 * `<input type="hidden">` más un botón: ahí el arreglo va adentro de ese
 * componente —que acepte y reenvíe el spread, y que ponga la `ref` sobre el
 * elemento enfocable—, no en cada lugar donde se usa. Mientras tanto siguen
 * necesitando su `Label` con `htmlFor`, como antes.
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
