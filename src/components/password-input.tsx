"use client"

import * as React from "react"
import { EyeIcon, EyeOffIcon } from "lucide-react"

import { useLabels, type Labels } from "../lib/labels.js"
import { useFormReset } from "../internal/form-reset.js"
import { cn } from "../lib/utils.js"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput, type InputGroupInputProps } from "./input-group.js"
import { Meter } from "./meter.js"

/** 0 sin contraseña; 1 débil, 2 aceptable, 3 buena, 4 fuerte. */
type PasswordStrength = 0 | 1 | 2 | 3 | 4

/**
 * La seguridad de una contraseña, por reglas y sin librería: menos de 8 caracteres es débil; con 8
 * o más, suma un nivel por cada una de estas que cumpla —mayúsculas y minúsculas, números,
 * símbolos, 12 caracteres o más—, hasta 4. No reemplaza a la validación del servidor: es una guía
 * mientras se escribe.
 */
function passwordStrength(password: string): PasswordStrength {
  if (!password) return 0
  if (password.length < 8) return 1
  let extra = 0
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) extra++
  if (/\d/.test(password)) extra++
  if (/[^A-Za-z0-9]/.test(password)) extra++
  if (password.length >= 12) extra++
  return Math.min(4, 1 + extra) as PasswordStrength
}

// El color del nivel en la barra: rojo, ámbar y verde (los de estado del sistema). El texto dice el
// nivel; el color acompaña.
const LEVEL_COLOR = [
  "",
  "[&_[data-slot=meter-indicator]]:bg-red-700",
  "[&_[data-slot=meter-indicator]]:bg-amber-700",
  "[&_[data-slot=meter-indicator]]:bg-green-700",
  "[&_[data-slot=meter-indicator]]:bg-green-700",
]

type PasswordInputProps = Omit<InputGroupInputProps, "type"> & {
  /** 28, 36 (default) o 40, como `Input`. */
  size?: "sm" | "md" | "lg"
  /** Una barra de 4 niveles abajo del campo, con el nivel en texto. */
  strength?: boolean
  labels?: Partial<Labels["passwordInput"]>
}

/**
 * Un campo de contraseña con el ojo adentro (la superficie de `InputGroup`): un botón que alterna
 * entre mostrar y ocultar, con `aria-pressed`. Con `strength`, la barra de seguridad abajo.
 *
 * Las props son las de `Input`; `className` va en el contenedor (el campo y la barra).
 */
function PasswordInput({ className, size = "md", strength = false, labels: labelsProp, disabled, value, defaultValue, onChange, ...props }: PasswordInputProps) {
  const labels = { ...useLabels().passwordInput, ...labelsProp }
  const [visible, setVisible] = React.useState(false)
  const [own, setOwn] = React.useState(String(defaultValue ?? ""))
  const text = value !== undefined ? String(value) : own
  const level = passwordStrength(text)
  const levelText = ["", labels.weak, labels.fair, labels.good, labels.strong][level]!
  const titleId = React.useId()
  // El reset nativo vuelve el campo a `defaultValue`; la barra lo sigue.
  const formReset = useFormReset(() => setOwn(String(defaultValue ?? "")))

  return (
    <div ref={formReset} data-slot="password-input" className={cn("flex w-full flex-col gap-2", className)}>
      <InputGroup disabled={disabled} size={size}>
        <InputGroupInput
          type={visible ? "text" : "password"}
          value={value}
          defaultValue={defaultValue}
          onChange={(event) => {
            if (value === undefined) setOwn(event.currentTarget.value)
            onChange?.(event)
          }}
          {...props}
        />
        <InputGroupAddon>
          <InputGroupButton aria-label={labels.show} aria-pressed={visible} onClick={() => setVisible((v) => !v)}>
            {visible ? <EyeOffIcon aria-hidden="true" /> : <EyeIcon aria-hidden="true" />}
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      {strength && (
        <div data-slot="password-input-strength" className="flex flex-col gap-1">
          <div className="flex items-baseline justify-between text-footnote">
            <span id={titleId} className="text-label-secondary">
              {labels.strength}
            </span>
            <span aria-hidden="true" className="text-label">
              {levelText}
            </span>
          </div>
          <Meter
            aria-labelledby={titleId}
            aria-valuetext={levelText || undefined}
            className={LEVEL_COLOR[level]}
            max={4}
            min={0}
            size="sm"
            value={level}
          />
          {/* El nivel cambia mientras se escribe: la barra no se anuncia sola. Solo cambia el texto
              cuando cambia el nivel, así que no habla en cada tecla. */}
          <span className="sr-only" role="status">
            {levelText && `${labels.strength}: ${levelText}`}
          </span>
        </div>
      )}
    </div>
  )
}

export { PasswordInput, passwordStrength, type PasswordInputProps, type PasswordStrength }
