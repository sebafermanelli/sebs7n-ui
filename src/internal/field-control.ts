"use client"

import * as React from "react"
import { DEFAULT_FIELD_ROOT_STATE } from "@base-ui/react/internals/field-constants"
import { useFieldRootContext } from "@base-ui/react/internals/field-root-context"
import { useRegisterFieldControl } from "@base-ui/react/internals/field-register-control"
import { useFormContext } from "@base-ui/react/internals/form-context"
import { useLabelableContext, useLabelableId } from "@base-ui/react/internals/labelable-provider"

type FieldControlOptions = {
  /** El `id` que pasó la app; sin él, el del `Field` (el que usa `FieldLabel` en su `htmlFor`). */
  id?: string
  /** El `name` que pasó la app; el del `Field` le gana, como en los controles de Base UI. */
  name?: string
  /** El valor lógico: lo que `Form` manda en `onFormSubmit` y lo que recibe `validate` del `Field`. */
  value: unknown
  /** Si tiene valor, para `data-filled` del `Field`. */
  filled: boolean
  disabled?: boolean
  /** El elemento que `Form` enfoca cuando el campo queda inválido al enviar. */
  controlRef: React.RefObject<HTMLElement | null>
  /**
   * `false` para un control que no es «labelable» (un grupo): el `FieldLabel` no lleva `htmlFor` (que
   * apuntaría a nada) y el control se nombra con `labelId` en su `aria-labelledby`.
   */
  labelable?: boolean
}

/**
 * Igualdad por estructura para `data-dirty`: los controles arman una lista, un rango o una fecha nuevos
 * en cada cambio, y por referencia volver al valor inicial seguía marcando «sucio». Un archivo es el
 * mismo si coinciden nombre, tamaño y fecha (soltarlo de nuevo crea otro `File`).
 */
function isSameValue(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true
  if (!a || !b || typeof a !== "object" || typeof b !== "object") return false
  if (a instanceof Date) return b instanceof Date && a.getTime() === b.getTime()
  if (typeof File !== "undefined" && a instanceof File) return b instanceof File && a.name === b.name && a.size === b.size && a.lastModified === b.lastModified
  if (Array.isArray(a)) return Array.isArray(b) && a.length === b.length && a.every((item, index) => isSameValue(item, b[index]))
  if (Array.isArray(b) || Object.getPrototypeOf(a) !== Object.prototype || Object.getPrototypeOf(b) !== Object.prototype) return false
  const keys = Object.keys(a)
  return keys.length === Object.keys(b).length && keys.every((key) => isSameValue((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key]))
}

/**
 * Engancha un control propio (no un primitivo de Base UI) con el `Field` que lo envuelve, igual que
 * lo hacen `Switch` o `Select` por dentro: se registra en el `Form` (que lo enfoca si queda inválido
 * y manda su valor con el `name` del campo), marca tocado/lleno/sucio y valida con `validationMode`.
 *
 * Usa los hooks que Base UI exporta como `@base-ui/react/internals/*`. No son API documentada: por
 * eso el peer de Base UI está acotado a la versión probada y `test/base-ui-internals.test.tsx` rompe
 * si cambian. Afuera de un `Field` devuelven el contexto vacío y no hacen nada.
 */
export function useFieldControl({ id, name, value, filled, disabled = false, controlRef, labelable: forLabel = true }: FieldControlOptions) {
  const field = useFieldRootContext()
  const labelable = useLabelableContext()
  const form = useFormContext()
  const controlId = useLabelableId({ id, enabled: forLabel })
  const { registerControlId } = labelable
  React.useLayoutEffect(() => {
    if (forLabel) return
    // `null` le dice al `FieldLabel` que no lleve `htmlFor`.
    const source = Symbol()
    registerControlId(source, null)
    return () => registerControlId(source, undefined)
  }, [forLabel, registerControlId])
  const off = disabled || field.disabled === true
  const fieldName = field.name ?? name
  useRegisterFieldControl(controlRef, controlId, value, undefined, !off, name)

  const { setFilled, setDirty, validation, validityData } = field
  React.useLayoutEffect(() => {
    setFilled(filled)
  }, [filled, setFilled])

  // Al cambiar (no al montar): borra el error del servidor, marca sucio y revalida con `onChange`.
  const mounted = React.useRef(false)
  React.useEffect(() => {
    if (!mounted.current) {
      mounted.current = true
      return
    }
    form.clearErrors(fieldName)
    setDirty(!isSameValue(value, validityData.initialValue))
    validation.change(value)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- solo cuando cambia el valor
  }, [value])

  // Afuera de un `Field` el contexto es el de por defecto: sin esto, el control llevaría un `id`
  // generado que la app no pidió.
  const inField = field.state !== DEFAULT_FIELD_ROOT_STATE
  return {
    inField,
    /** El `id` del control: el del `Field` adentro de uno; afuera, el de la app (o ninguno). */
    id: inField ? controlId : id,
    controlId,
    disabled: off,
    name: fieldName,
    /** Adentro de un `Field`, el `id` de su `FieldLabel`: para un control que no es «labelable» (un `div` con rol). */
    labelId: labelable.labelId,
    invalid: field.invalid === true || field.state.valid === false,
    /** Los `id` de `FieldDescription` y `FieldError`, para sumar al `aria-describedby` propio. */
    messageIds: labelable.messageIds,
    /** Para el `<input>` que lleva la validación nativa (`required`) del campo. */
    inputRef: validation.inputRef as React.RefObject<HTMLInputElement | null>,
    onFocus: () => {
      if (!off) field.setFocused(true)
    },
    /** `next`: el valor si el blur mismo lo cambió (todavía no llegó al render). */
    onBlur: (next: unknown = value) => {
      if (off) return
      field.setTouched(true)
      field.setFocused(false)
      if (field.validationMode === "onBlur") validation.commit(next)
    },
  }
}
