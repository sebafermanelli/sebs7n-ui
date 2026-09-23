"use client"

import { Form as FormPrimitive } from "@base-ui/react/form"

import { cn } from "../lib/utils.js"

/**
 * Un `<form>` de verdad, con los errores de todos los campos en un solo lugar.
 *
 * Es un `<form>` nativo: entra por `Enter`, lo entiende el navegador, y sin
 * JavaScript sigue siendo un formulario. Lo que agrega es el puente entre el
 * submit y los campos:
 *
 * - `onFormSubmit` recibe los valores ya juntados por `name`, sin `FormData` a
 *   mano y sin un `useState` por campo.
 * - `errors` es un objeto `{ nombreDelCampo: mensaje }` que se le pasa al
 *   formulario y cada `FieldError` muestra el suyo. Es la pieza que faltaba
 *   para los errores que solo conoce el servidor —"ese email ya está usado"—,
 *   que no se pueden validar en el navegador.
 * - `validationMode` decide cuándo se valida: `onSubmit` (por defecto, y lo
 *   sano: nadie quiere que le marquen el email en rojo mientras lo escribe),
 *   `onBlur` o `onChange`. Después del primer submit, los campos con error se
 *   revalidan al tipear, que es cuando el rojo sí sirve.
 *
 * ```tsx
 * const [errors, setErrors] = useState({})
 *
 * <Form errors={errors} onFormSubmit={async (valores) => {
 *   const r = await crearCuenta(valores)
 *   if (!r.ok) setErrors(r.errors)
 * }}>
 *   <Field name="email">…</Field>
 *   <Button type="submit">Crear cuenta</Button>
 * </Form>
 * ```
 *
 * Para validar contra un schema (Zod, Valibot, ArkType) está
 * `sebs7n-ui/lib/schema`, que traduce el schema a lo que esperan `Form` y
 * `Field`.
 */
type FormProps<Values extends Record<string, unknown> = Record<string, unknown>> = Omit<
  FormPrimitive.Props<Values>,
  "className"
> & { className?: string }

function Form<Values extends Record<string, unknown> = Record<string, unknown>>({
  className,
  ...props
}: FormProps<Values>) {
  return <FormPrimitive data-slot="form" className={cn("flex w-full flex-col gap-6", className)} {...props} />
}

export { Form, type FormProps }
