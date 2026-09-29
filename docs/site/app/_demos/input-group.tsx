"use client"

import { CopyIcon, SearchIcon } from "lucide-react"
import { Field, FieldLabel, Kbd } from "sebs7n-ui"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "sebs7n-ui/input-group"

/**
 * Antes y después del valor
 * La moneda, el dominio o la lupa van adentro del campo: la superficie y el foco son del grupo, y un click en el texto enfoca el campo.
 */
export function Basico() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <InputGroup>
        <InputGroupAddon>$</InputGroupAddon>
        <InputGroupInput aria-label="Importe" inputMode="decimal" placeholder="0,00" />
        <InputGroupAddon>ARS</InputGroupAddon>
      </InputGroup>
      <InputGroup>
        <InputGroupAddon>facturas.</InputGroupAddon>
        <InputGroupInput aria-label="Subdominio" placeholder="tu-empresa" />
        <InputGroupAddon>.com</InputGroupAddon>
      </InputGroup>
      <InputGroup>
        <InputGroupAddon>
          <SearchIcon />
        </InputGroupAddon>
        <InputGroupInput aria-label="Buscar comprobantes" placeholder="Buscar comprobantes" type="search" />
        <InputGroupAddon>
          <Kbd size="sm">⌘K</Kbd>
        </InputGroupAddon>
      </InputGroup>
    </div>
  )
}

/**
 * Con un botón
 * Un botón a escala del campo: `plain` para la acción, `ghost` para uno de ícono (con `aria-label`).
 */
export function ConBoton() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <Field>
        <FieldLabel>Cupón de descuento</FieldLabel>
        <InputGroup>
          <InputGroupInput placeholder="VERANO26" />
          <InputGroupAddon>
            <InputGroupButton variant="plain">Aplicar</InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </Field>
      <InputGroup>
        <InputGroupInput aria-label="Link de pago" readOnly value="https://pagos.example.com/f/0012" />
        <InputGroupAddon>
          <InputGroupButton aria-label="Copiar el link">
            <CopyIcon />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </div>
  )
}

/**
 * Tamaños
 * 28, 36 y 40, los mismos altos que los botones: un campo y un botón del mismo `size` miden lo mismo.
 */
export function Tamanos() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      {(["sm", "md", "lg"] as const).map((size) => (
        <InputGroup key={size} size={size}>
          <InputGroupAddon>$</InputGroupAddon>
          <InputGroupInput aria-label={`Importe ${size}`} placeholder="0,00" />
          <InputGroupAddon>
            <InputGroupButton variant="plain">Cobrar</InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      ))}
    </div>
  )
}
