"use client"

import * as React from "react"
import { DEFAULT_FIELD_ROOT_STATE, DEFAULT_VALIDITY_STATE } from "@base-ui/react/internals/field-constants"
import { FieldRootContext, type FieldRootContextType } from "@base-ui/react/internals/field-root-context"
import { LabelableProvider } from "@base-ui/react/internals/labelable-provider"

/** Un `Field` vacío: lo que ve un control de Base UI afuera de un `Field`. */
const ISOLATED_FIELD: FieldRootContextType = {
  invalid: undefined,
  name: undefined,
  validityData: { state: DEFAULT_VALIDITY_STATE, errors: [], error: "", value: "", initialValue: null },
  setValidityData: () => {},
  disabled: undefined,
  setTouched: () => {},
  setDirty: () => {},
  setFilled: () => {},
  setFocused: () => {},
  validationMode: "onSubmit",
  shouldValidateOnChange: () => false,
  state: DEFAULT_FIELD_ROOT_STATE,
  registerFieldControl: () => {},
  validation: {
    getValidationProps: (_disabled, props = {}) => props,
    inputRef: { current: null },
    registeredInputs: new Map(),
    registerInput: () => () => {},
    getInputControl: () => null,
    commit: async () => {},
    change: () => {},
  } as FieldRootContextType["validation"],
}

/**
 * Aísla a los controles de adentro de un control compuesto (`DateTimePicker` = `DatePicker` +
 * `TimePicker`) del `Field` de afuera: el que se registra es el compuesto, con su valor entero, y no
 * cada parte por su lado (se pisaban el registro y el `htmlFor` del `FieldLabel`).
 */
export function FieldIsolation({ children }: { children: React.ReactNode }) {
  return React.createElement(FieldRootContext.Provider, { value: ISOLATED_FIELD }, React.createElement(LabelableProvider, null, children))
}
