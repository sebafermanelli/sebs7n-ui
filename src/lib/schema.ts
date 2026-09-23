/**
 * Puente entre un schema de validación y los formularios del sistema.
 *
 * Habla **Standard Schema**, la interfaz que ya implementan Zod, Valibot y
 * ArkType: un objeto con una propiedad `~standard` que sabe validar. Por eso
 * esto funciona con las tres sin que `sebs7n-ui` dependa de ninguna, y con la
 * que venga después si también la implementa.
 *
 * No hay nada de React acá a propósito: son funciones puras, se prueban sin
 * DOM y se pueden usar igual en el servidor para revalidar lo que llegó.
 */

/**
 * La parte de Standard Schema v1 que se usa acá.
 *
 * Está escrita a mano en vez de depender de `@standard-schema/spec` porque son
 * cuatro tipos que la especificación congeló en la v1: una dependencia más en
 * el `package.json` de quien instale el sistema no se paga con eso.
 */
export type StandardSchemaV1<Input = unknown, Output = Input> = {
  readonly "~standard": {
    readonly version: 1
    readonly vendor: string
    readonly validate: (value: unknown) => StandardResult<Output> | Promise<StandardResult<Output>>
    readonly types?: { readonly input: Input; readonly output: Output } | undefined
  }
}

type StandardResult<Output> = { readonly value: Output; readonly issues?: undefined } | { readonly issues: ReadonlyArray<StandardIssue> }

type StandardIssue = {
  readonly message: string
  readonly path?: ReadonlyArray<PropertyKey | { readonly key: PropertyKey }> | undefined
}

/** El tipo que sale de un schema, para tipar el `onFormSubmit`. */
export type InferOutput<Schema extends StandardSchemaV1> = NonNullable<
  Schema["~standard"]["types"]
>["output"]

/** Los errores de un formulario, con la misma forma que espera `Form`: por `name` de campo. */
export type FormErrors = Record<string, string[]>

export type ValidationResult<Output> =
  | { readonly ok: true; readonly value: Output }
  | { readonly ok: false; readonly errors: FormErrors }

/**
 * El nombre de campo al que corresponde un problema.
 *
 * Standard Schema reporta el camino como una lista de segmentos, que pueden ser
 * claves sueltas o un objeto `{ key }`. Se unen con puntos —`domicilio.calle`,
 * `items.0.cantidad`— porque ese es el `name` que se le pone al `Field`
 * correspondiente. Un problema sin camino es del objeto entero, no de un campo:
 * queda bajo la clave vacía, y así se puede mostrar arriba del formulario sin
 * pegarse a un input que no tiene la culpa.
 */
function nombreDeCampo(issue: StandardIssue): string {
  if (!issue.path || issue.path.length === 0) return ""
  return issue.path
    .map((segmento) => (typeof segmento === "object" && segmento !== null ? segmento.key : segmento))
    .map(String)
    .join(".")
}

/** Agrupa los problemas por campo, conservando el orden en que los reportó el schema. */
function agrupar(issues: ReadonlyArray<StandardIssue>): FormErrors {
  const errores: FormErrors = {}
  for (const issue of issues) {
    const campo = nombreDeCampo(issue)
    ;(errores[campo] ??= []).push(issue.message)
  }
  return errores
}

/**
 * Valida un objeto de valores contra un schema.
 *
 * Devuelve o el valor ya parseado por el schema —con sus transformaciones
 * aplicadas, que es lo que conviene mandar al servidor— o los errores listos
 * para pasarle a `<Form errors={...}>`.
 *
 * ```tsx
 * const [errors, setErrors] = useState({})
 *
 * <Form errors={errors} onFormSubmit={async (valores) => {
 *   const r = await validate(esquema, valores)
 *   if (!r.ok) return setErrors(r.errors)
 *   await guardar(r.value)
 * }}>
 * ```
 *
 * Es `async` siempre, aunque el schema valide sincrónico: un schema con una
 * regla asíncrona —"este email ya existe"— no debería cambiar el código de
 * quien lo usa.
 */
export async function validate<Schema extends StandardSchemaV1>(
  schema: Schema,
  values: unknown
): Promise<ValidationResult<InferOutput<Schema>>> {
  const resultado = await schema["~standard"].validate(values)
  if (resultado.issues) return { ok: false, errors: agrupar(resultado.issues) }
  return { ok: true, value: resultado.value as InferOutput<Schema> }
}

/**
 * Convierte un schema de **un solo valor** en la función `validate` de un
 * `Field`, para validar ese campo mientras se escribe o al salir de él.
 *
 * ```tsx
 * <Field name="email" validate={fieldValidator(z.string().email("Revisá el email"))} validationMode="onBlur">
 * ```
 *
 * Es para el schema de ese campo, no el del formulario entero: el formulario se
 * valida con `validate()` en el submit, que es cuando están todos los valores.
 */
export function fieldValidator(
  schema: StandardSchemaV1
): (value: unknown) => string[] | null | Promise<string[] | null> {
  return async (value: unknown) => {
    const resultado = await schema["~standard"].validate(value)
    if (!resultado.issues) return null
    return resultado.issues.map((issue) => issue.message)
  }
}
