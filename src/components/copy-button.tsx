"use client"

import * as React from "react"
import { CheckIcon, CopyIcon } from "lucide-react"

import { defined } from "../internal/defined.js"
import { useLabels, type Labels } from "../lib/labels.js"
import { cn } from "../lib/utils.js"
import { Button } from "./button.js"

/**
 * Copia un texto al portapapeles: el CUIT de un cliente, el número de una factura, el link de
 * pago. Solo ícono es el botón `plain` de 28 de una barra de iCloud (radio 8, glifo 16 en el
 * acento); con `children`, el texto y el ícono a la derecha.
 *
 * Al copiar, el ícono pasa a ✓ durante 1,5 s, el tooltip dice «Copiado» y una región viva lo
 * anuncia: el cambio de ícono no lo ve un lector de pantalla y el tooltip no se anuncia. Si el
 * portapapeles no deja (contexto inseguro, permiso negado), el tooltip dice «No se pudo copiar» y se
 * anuncia igual, sin ✓: el texto sigue a la vista para copiarlo a mano.
 */
type CopyButtonProps = Omit<React.ComponentProps<"button">, "value" | "children" | "onClick" | "onCopy"> & {
  /** El texto que se copia. Vacío apaga el botón. */
  value: string
  /** Texto visible a la izquierda del ícono. Sin `children`, el botón es solo ícono (en `inline`, el valor). */
  children?: React.ReactNode
  /** 28 (`sm`, default), 36 o 40: los altos de los botones. */
  size?: "sm" | "md" | "lg"
  /**
   * `inline`: el dato en mono chico (12) con un ícono de 14 al lado, sin el alto de 28 de un botón:
   * para IDs en filas densas de una tabla. Sin `children` muestra `value`. El feedback es el mismo.
   */
  variant?: "button" | "inline"
  /** Se llama después de copiar, con el texto copiado. */
  onCopy?: (value: string) => void
  labels?: Partial<Labels["copyButton"]>
}

const ICON_SIZE = { sm: "icon-sm", md: "icon-md", lg: "icon-lg" } as const

// El tooltip (Base UI Tooltip + Floating UI, ~35 KB gzip) se pide recién cuando alguien apunta, enfoca o
// copia: un botón de copiar en cada bloque de código no puede costarle eso a cada página al abrir.
const CopyTip = React.lazy(() => import("../internal/copy-tip.js"))

/** Lo que tarda en abrirse el tooltip al apuntar: el `delay` por defecto de `TooltipProvider`. */
const TIP_DELAY_MS = 300

/** Cuánto dura el ✓: lo que tarda en leerse y no tanto como para confundir un segundo click. */
const COPIED_MS = 1500

function CopyButton({ value, children, size = "sm", variant = "button", onCopy, labels: labelsProp, disabled, className, ref, ...props }: CopyButtonProps) {
  const labels = { ...useLabels().copyButton, ...defined(labelsProp) }
  // Lo que pasó con el último click, mientras dura: «Copiado» o «No se pudo copiar».
  const [result, setResult] = React.useState<"copied" | "failed" | null>(null)
  const copied = result === "copied"
  const [hover, setHover] = React.useState(false)
  // El tooltip no existe hasta la primera interacción: ahí se pide su módulo.
  const [armed, setArmed] = React.useState(false)
  const [anchor, setAnchor] = React.useState<HTMLButtonElement | null>(null)
  const timer = React.useRef<ReturnType<typeof setTimeout>>(undefined)
  const hoverTimer = React.useRef<ReturnType<typeof setTimeout>>(undefined)
  React.useEffect(
    () => () => {
      clearTimeout(timer.current)
      clearTimeout(hoverTimer.current)
    },
    []
  )
  const setRef = (node: HTMLButtonElement | null) => {
    setAnchor(node)
    if (typeof ref === "function") ref(node)
    else if (ref) ref.current = node
  }
  const show = (delay: number) => {
    setArmed(true)
    clearTimeout(hoverTimer.current)
    hoverTimer.current = setTimeout(() => setHover(true), delay)
  }
  const hide = () => {
    clearTimeout(hoverTimer.current)
    setHover(false)
  }
  const tip = {
    onPointerEnter: (event: React.PointerEvent<HTMLButtonElement>) => {
      props.onPointerEnter?.(event)
      show(TIP_DELAY_MS)
    },
    onPointerLeave: (event: React.PointerEvent<HTMLButtonElement>) => {
      props.onPointerLeave?.(event)
      hide()
    },
    onFocus: (event: React.FocusEvent<HTMLButtonElement>) => {
      props.onFocus?.(event)
      if (event.currentTarget.matches(":focus-visible")) show(0)
    },
    onBlur: (event: React.FocusEvent<HTMLButtonElement>) => {
      props.onBlur?.(event)
      hide()
    },
    onKeyDown: (event: React.KeyboardEvent<HTMLButtonElement>) => {
      props.onKeyDown?.(event)
      if (event.key === "Escape") hide()
    }
  }

  const copy = async (event: React.MouseEvent) => {
    // Adentro de una fila clickeable o de un link, copiar no abre la fila.
    event.preventDefault()
    event.stopPropagation()
    if (!value) return
    setArmed(true)
    let ok = true
    try {
      await navigator.clipboard.writeText(value)
    } catch {
      ok = false
    }
    setResult(ok ? "copied" : "failed")
    if (ok) onCopy?.(value)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setResult(null), COPIED_MS)
  }

  const icon = copied ? <CheckIcon aria-hidden="true" /> : <CopyIcon aria-hidden="true" />
  const inline = variant === "inline"
  const button = inline ? (
    // Un `<button>` propio y no `Button`: el más chico mide 28 y en una fila de tabla empuja el alto.
    // 24 de alto es el mínimo de WCAG 2.5.8; con el dedo, `touch-target-y` lo lleva a 44 sin ensanchar.
    <button
      // Sin `aria-label`, «Copiar F-0012»: el valor solo dice el dato, no qué hace el botón. Empieza
      // con el verbo y sigue con el texto visible (2.5.3). El de la app, si lo hay, le gana.
      aria-label={`${labels.copy} ${value}`}
      data-slot="copy-button"
      data-variant="inline"
      type="button"
      disabled={disabled || !value}
      onClick={copy}
      ref={setRef}
      className={cn(
        "inline-flex min-h-6 max-w-full cursor-pointer items-center gap-1 rounded-tag px-0.5 font-mono text-footnote text-label-secondary outline-none transition-control touch-target-y",
        "hover:text-label focus-visible:focus-ring disabled:cursor-not-allowed disabled:text-label-tertiary [&_svg]:size-3.5 [&_svg]:shrink-0",
        className
      )}
      {...props}
      {...tip}
    >
      <span className="truncate">{children ?? value}</span>
      {icon}
    </button>
  ) : children ? (
    <Button size={size} type="button" variant="plain" disabled={disabled || !value} onClick={copy} ref={setRef} className={className} {...props} {...tip}>
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
      ref={setRef}
      className={className}
      {...props}
      {...tip}
    >
      {icon}
    </Button>
  )

  return (
    <>
      {button}
      {/* Con texto a la vista el tooltip de «Copiar» repite lo que ya se lee: solo aparece el «Copiado». */}
      {armed ? (
        <React.Suspense fallback={null}>
          <CopyTip anchor={anchor} open={(hover && !children && !inline) || result !== null}>
            {result ? labels[result] : labels.copy}
          </CopyTip>
        </React.Suspense>
      ) : null}
      <span className="sr-only" data-slot="copy-button-status" role="status">
        {result ? labels[result] : ""}
      </span>
    </>
  )
}

export { CopyButton, type CopyButtonProps }
