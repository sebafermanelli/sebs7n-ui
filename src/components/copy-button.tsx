"use client"

import * as React from "react"
import { CheckIcon, CopyIcon } from "lucide-react"

import { useLabels, type Labels } from "../lib/labels.js"
import { Button } from "./button.js"
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip.js"

/**
 * Copia un texto al portapapeles: el CUIT de un cliente, el número de una factura, el link de
 * pago. Solo ícono es el botón `plain` de 28 de una barra de iCloud (radio 8, glifo 16 en el
 * acento); con `children`, el texto y el ícono a la derecha.
 *
 * Al copiar, el ícono pasa a ✓ durante 1,5 s, el tooltip dice «Copiado» y una región viva lo
 * anuncia: el cambio de ícono no lo ve un lector de pantalla y el tooltip no se anuncia. Si el
 * portapapeles no está (contexto inseguro, permiso negado), no pasa nada: el texto sigue a la vista.
 */
type CopyButtonProps = Omit<React.ComponentProps<"button">, "value" | "children" | "onClick" | "onCopy"> & {
  /** El texto que se copia. Vacío apaga el botón. */
  value: string
  /** Texto visible a la izquierda del ícono. Sin `children`, el botón es solo ícono. */
  children?: React.ReactNode
  /** 28 (`sm`, default), 36 o 40: los altos de los botones. */
  size?: "sm" | "md" | "lg"
  /** Se llama después de copiar, con el texto copiado. */
  onCopy?: (value: string) => void
  labels?: Partial<Labels["copyButton"]>
}

const ICON_SIZE = { sm: "icon-sm", md: "icon-md", lg: "icon-lg" } as const

/** Cuánto dura el ✓: lo que tarda en leerse y no tanto como para confundir un segundo click. */
const COPIED_MS = 1500

function CopyButton({ value, children, size = "sm", onCopy, labels: labelsProp, disabled, className, ...props }: CopyButtonProps) {
  const labels = { ...useLabels().copyButton, ...labelsProp }
  const [copied, setCopied] = React.useState(false)
  const [hover, setHover] = React.useState(false)
  const timer = React.useRef<ReturnType<typeof setTimeout>>(undefined)
  React.useEffect(() => () => clearTimeout(timer.current), [])

  const copy = async (event: React.MouseEvent) => {
    // Adentro de una fila clickeable o de un link, copiar no abre la fila.
    event.preventDefault()
    event.stopPropagation()
    if (!value) return
    try {
      await navigator.clipboard.writeText(value)
    } catch {
      return
    }
    setCopied(true)
    onCopy?.(value)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setCopied(false), COPIED_MS)
  }

  const icon = copied ? <CheckIcon aria-hidden="true" /> : <CopyIcon aria-hidden="true" />
  const button = children ? (
    <Button size={size} type="button" variant="plain" disabled={disabled || !value} onClick={copy} className={className} {...props}>
      {children}
      {icon}
    </Button>
  ) : (
    <Button
      aria-label={labels.copy}
      size={ICON_SIZE[size]}
      type="button"
      variant="plain"
      disabled={disabled || !value}
      onClick={copy}
      className={className}
      {...props}
    >
      {icon}
    </Button>
  )

  return (
    <>
      {/* Con texto a la vista el tooltip de «Copiar» repite lo que ya se lee: solo aparece el «Copiado». */}
      <Tooltip open={(hover && !children) || copied} onOpenChange={setHover}>
        {/* `data-slot` del botón: el del trigger lo pisaría, y el botón sigue siendo un botón del sistema. */}
        <TooltipTrigger closeOnClick={false} data-slot="button" render={button} />
        <TooltipContent>{copied ? labels.copied : labels.copy}</TooltipContent>
      </Tooltip>
      <span className="sr-only" data-slot="copy-button-status" role="status">
        {copied ? labels.copied : ""}
      </span>
    </>
  )
}

export { CopyButton, type CopyButtonProps }
