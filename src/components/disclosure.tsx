import * as React from "react"
import { ChevronRightIcon } from "lucide-react"

import { cn } from "../lib/utils.js"

/**
 * Secciones plegables sin JavaScript: `<details>` y `<summary>` del navegador con las filas y el
 * chevron del `Accordion` de 2.0. Es un Server Component (sin `"use client"`): el contenido está en el
 * HTML aunque esté cerrado —lo lee un buscador, lo encuentra Cmd+F— y se abre antes de hidratar.
 *
 * Cuándo esto y no `Accordion`: una página de marketing o de ayuda (preguntas frecuentes, un filtro
 * plegado) que tiene que andar sin JS. `Accordion` anima el alto y maneja el foco con flechas entre
 * secciones; acá el navegador hace lo suyo y nada más.
 *
 * Varios con el mismo `name` se excluyen entre sí (abrir uno cierra el otro), como el `Accordion`
 * por defecto; sin `name`, cada uno por su cuenta, como `multiple`.
 */
type DisclosureGroupProps = React.ComponentProps<"div">

/** La lista de secciones: el separador de abajo de todo (cada `Disclosure` pone el de arriba). */
function DisclosureGroup({ className, ...props }: DisclosureGroupProps) {
  return <div data-slot="disclosure-group" className={cn("flex w-full flex-col border-b border-separator", className)} {...props} />
}

type DisclosureProps = React.ComponentProps<"details"> & {
  /**
   * `row` (el default): una fila de 44 con separador, como el `Accordion`. `inline`: el disparador en
   * línea, 14 y gris, sin separadores, para un filtro plegado arriba de una lista.
   */
  variant?: "row" | "inline"
  /** Abierto al cargar. El navegador lo abre y lo cierra después. */
  defaultOpen?: boolean
  /**
   * Abierto o cerrado, controlado: va con `onOpenChange` (en un Client Component). Sin
   * `onOpenChange` es solo el estado inicial, como `defaultOpen`: sin JS no hay quien lo controle.
   */
  open?: boolean
  /**
   * Avisa el estado nuevo cuando el navegador abre o cierra la sección (el evento `toggle` del
   * `<details>`). Con `open`, si la app no lo cambia, la sección vuelve a como dice `open`. Es una
   * función: solo desde un Client Component.
   */
  onOpenChange?: (open: boolean) => void
}

function Disclosure({ variant = "row", defaultOpen, open, onOpenChange, onToggle, className, ...props }: DisclosureProps) {
  // El handler va solo con `onOpenChange`: en un Server Component, una función en el `<details>` no se
  // puede mandar al cliente, y sin JS no hay nada que avisar.
  const toggle = onOpenChange
    ? (event: React.ToggleEvent<HTMLDetailsElement>) => {
        onToggle?.(event)
        const now = event.currentTarget.open
        onOpenChange(now)
        // Controlado: el navegador ya lo cambió; si la app no lo acompaña, vuelve a `open`.
        if (open !== undefined && now !== open) event.currentTarget.open = open
      }
    : onToggle
  return (
    <details
      data-slot="disclosure"
      data-variant={variant}
      open={open ?? defaultOpen}
      onToggle={toggle}
      className={cn("group/disclosure", variant === "row" && "border-t border-separator", className)}
      {...props}
    />
  )
}

type DisclosureTriggerProps = React.ComponentProps<"summary"> & {
  /** Saca el chevron, para poner otro indicador. */
  chevron?: boolean
}

/**
 * El `<summary>` que abre la sección: el navegador lo hace enfocable y lo abre con Enter y Espacio, y
 * anuncia si está expandido. Las partes no tienen contexto (es Server Component): la variante la leen
 * del `<details>` con `group-data-*`.
 */
function DisclosureTrigger({ chevron = true, className, children, ...props }: DisclosureTriggerProps) {
  return (
    <summary
      data-slot="disclosure-trigger"
      className={cn(
        // `list-none` y el `::-webkit-details-marker` escondido: el triángulo del navegador lo reemplaza el chevron.
        "flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 rounded-control px-1 py-2.5 text-left text-headline text-label outline-none select-none transition-control [&::-webkit-details-marker]:hidden",
        "focus-visible:focus-ring",
        "group-data-[variant=inline]/disclosure:inline-flex group-data-[variant=inline]/disclosure:min-h-0 group-data-[variant=inline]/disclosure:justify-start group-data-[variant=inline]/disclosure:gap-1.5 group-data-[variant=inline]/disclosure:px-0 group-data-[variant=inline]/disclosure:py-0 group-data-[variant=inline]/disclosure:text-callout group-data-[variant=inline]/disclosure:text-label-secondary group-data-[variant=inline]/disclosure:hover:text-label",
        className
      )}
      {...props}
    >
      {children}
      {chevron && (
        <ChevronRightIcon
          aria-hidden="true"
          className="size-3.5 shrink-0 text-label-secondary transition-transform duration-150 ease-out-expo motion-reduce:transition-none group-open/disclosure:rotate-90 group-data-[variant=inline]/disclosure:text-current"
        />
      )}
    </summary>
  )
}

type DisclosureContentProps = React.ComponentProps<"div">

/** El contenido. Con `inline`, sin la sangría de la fila y con aire arriba. */
function DisclosureContent({ className, ...props }: DisclosureContentProps) {
  return (
    <div
      data-slot="disclosure-content"
      className={cn(
        "px-1 pb-3 text-callout text-label-secondary",
        "group-data-[variant=inline]/disclosure:px-0 group-data-[variant=inline]/disclosure:pt-3 group-data-[variant=inline]/disclosure:pb-0",
        className
      )}
      {...props}
    />
  )
}

export {
  Disclosure,
  DisclosureContent,
  DisclosureGroup,
  DisclosureTrigger,
  type DisclosureContentProps,
  type DisclosureGroupProps,
  type DisclosureProps,
  type DisclosureTriggerProps,
}
