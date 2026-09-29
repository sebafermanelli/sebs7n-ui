"use client"

import * as React from "react"
import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn, type WithClassName } from "../lib/utils.js"
import { inputShellClassName, inputShellInputClassName } from "../variants/input.js"
import { Spinner } from "./spinner.js"

/**
 * Un campo con cosas pegadas adentro: «$» antes del importe, «.com» después del dominio, la lupa,
 * un ⌘K o un botón «Aplicar». iCloud lo hace con la búsqueda (§2.13: la lupa adentro del campo) y se
 * generaliza: la superficie —relleno `fill-1`, radio 10, los altos 28/36/40— es el grupo, y el foco
 * (el anillo interior de 3 px, sin relleno) se dibuja en el grupo cuando el `<input>` de adentro lo
 * tiene. Es la misma superficie que Combobox y Autocomplete (`inputShellClassName`).
 */
type InputGroupSize = "sm" | "md" | "lg"

const GroupContext = React.createContext<{ disabled?: boolean }>({})

type InputGroupProps = React.ComponentProps<"div"> & {
  /** 28, 36 (default) o 40: los altos que comparten campos y botones. */
  size?: InputGroupSize
  /** Apaga el campo, los botones de adentro y la superficie. */
  disabled?: boolean
}

function InputGroup({ className, size = "md", disabled, ...props }: InputGroupProps) {
  const value = React.useMemo(() => ({ disabled }), [disabled])
  return (
    <GroupContext.Provider value={value}>
      <div
        data-slot="input-group"
        data-size={size}
        data-disabled={disabled ? "" : undefined}
        className={cn("group/input-group", inputShellClassName, className)}
        {...props}
      />
    </GroupContext.Provider>
  )
}

type InputGroupAddonProps = React.ComponentProps<"div">

// Lo que va pegado: texto 14 gris («$», «.com»), un ícono de 16, un `Kbd`, un botón. Del lado de
// afuera lleva el aire del campo (12); con un botón, 4, para que el botón quede a la misma distancia
// del borde arriba, abajo y al costado.
function InputGroupAddon({ className, onMouseDown, ...props }: InputGroupAddonProps) {
  return (
    <div
      data-slot="input-group-addon"
      onMouseDown={(event) => {
        onMouseDown?.(event)
        // Un click en el texto o el ícono enfoca el campo, como en un campo nativo con la lupa
        // adentro. En un botón o un link no: tienen su propio click.
        const target = event.target as Element
        if (event.defaultPrevented || target.closest("button, a, input, select, textarea, [role=button]")) return
        const input = event.currentTarget.closest("[data-slot=input-group]")?.querySelector("input")
        if (!input || input.disabled) return
        event.preventDefault()
        input.focus()
      }}
      className={cn(
        "flex h-full shrink-0 cursor-text items-center gap-1.5 text-callout whitespace-nowrap text-label-secondary select-none",
        "first:ps-3 last:pe-3 has-[button]:first:ps-1 has-[button]:last:pe-1",
        "[&>svg]:pointer-events-none [&>svg]:size-4 [&>svg]:shrink-0",
        className
      )}
      {...props}
    />
  )
}

type InputGroupInputProps = Omit<InputPrimitive.Props, "className" | "size"> & { className?: string }

// El `<input>` transparente de adentro. Pegado a un addon pierde parte de su aire de ese lado: el
// addon ya trae el suyo.
function InputGroupInput({ className, disabled, ...props }: InputGroupInputProps) {
  const group = React.useContext(GroupContext)
  return (
    <InputPrimitive
      data-slot="input-group-input"
      disabled={disabled ?? group.disabled}
      className={cn(
        inputShellInputClassName,
        "[[data-slot=input-group-addon]+&]:ps-2 [&:has(+[data-slot=input-group-addon])]:pe-2",
        className
      )}
      {...props}
    />
  )
}

type InputGroupButtonProps = WithClassName<ButtonPrimitive.Props> & {
  /**
   * `ghost` (default): texto en el label y `fill-2` con el puntero, el botón neutro de adentro de un
   * campo. `plain`: texto en el acento, para la acción («Aplicar»). `default`: el acento sólido.
   */
  variant?: "ghost" | "plain" | "default"
  /**
   * Esperando (validando el cupón, buscando): como `Button`, el spinner en el lugar del contenido (el
   * ancho no salta), `aria-busy` y el clic no pasa.
   */
  loading?: boolean
}

const BUTTON_VARIANT = {
  ghost: "text-label hover:bg-fill-2 active:bg-fill-3",
  plain: "font-semibold text-brand-ink hover:bg-fill-2 active:bg-fill-3",
  default: "bg-brand-700 text-brand-contrast hover:bg-brand-800 focus-visible:focus-ring-inverse",
}

// Un botón a escala del campo: 20 en uno de 28, 28 en uno de 36 y 32 en uno de 40 (con el dedo, 28 y 36), con el radio del
// campo menos el aire que lo separa del borde. Solo ícono: `aria-label`.
function InputGroupButton({ className, variant = "ghost", disabled, loading = false, onClick, children, ...props }: InputGroupButtonProps) {
  const group = React.useContext(GroupContext)
  return (
    <ButtonPrimitive
      data-slot="input-group-button"
      data-loading={loading ? "" : undefined}
      aria-busy={loading || undefined}
      aria-disabled={loading || undefined}
      onClick={loading ? (event) => event.preventDefault() : onClick}
      disabled={disabled ?? group.disabled}
      className={cn(
        "inline-flex h-7 min-w-7 shrink-0 cursor-pointer items-center justify-center gap-1 rounded-[calc(var(--radius-field)-4px)] px-2 text-callout outline-none transition-control focus-visible:focus-ring",
        "group-data-[size=sm]/input-group:h-5 group-data-[size=sm]/input-group:min-w-5 group-data-[size=sm]/input-group:px-1.5 group-data-[size=lg]/input-group:h-8 group-data-[size=lg]/input-group:min-w-8",
        // Con el dedo el campo crece (sm 36, md 44): el botón lo sigue, como los de inputShellButtonClassName.
        "pointer-coarse:group-data-[size=sm]/input-group:h-7 pointer-coarse:group-data-[size=sm]/input-group:min-w-7 pointer-coarse:group-data-[size=md]/input-group:h-9 pointer-coarse:group-data-[size=md]/input-group:min-w-9",
        "data-disabled:pointer-events-none data-disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
        BUTTON_VARIANT[variant],
        loading && "relative cursor-progress",
        className
      )}
      {...props}
    >
      {loading ? (
        <>
          {/* Sin nombre: la espera la anuncia el `aria-busy` del botón. El contenido queda invisible y
              sigue midiendo, así el campo no salta. */}
          <Spinner data-slot="input-group-button-spinner" size="sm" className="absolute inset-0 m-auto" />
          <span className="inline-flex items-center gap-1 opacity-0">{children}</span>
        </>
      ) : (
        children
      )}
    </ButtonPrimitive>
  )
}

export {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  type InputGroupAddonProps,
  type InputGroupButtonProps,
  type InputGroupInputProps,
  type InputGroupProps,
}
