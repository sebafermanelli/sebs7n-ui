"use client"

import { Collapsible as CollapsiblePrimitive } from "@base-ui/react/collapsible"
import { ChevronRightIcon } from "lucide-react"

import { cn, type WithClassName } from "../lib/utils.js"

/**
 * Mostrar y ocultar un bloque con un botón. Es la pieza simple que hay detrás
 * del `Accordion`, exportada aparte porque la mitad de las veces se usa sola:
 * un "Ver detalle" en una fila, los filtros avanzados de un formulario, el
 * stack trace de un error.
 *
 * Si hay **varias** secciones que se comportan como un grupo, va `Accordion`:
 * trae el `<h3>` por sección, que es lo que un lector de pantalla necesita para
 * saltar entre ellas.
 *
 * El trigger no trae estilo: va `render={<Button variant="ghost" />}` o el
 * elemento que corresponda, como en el resto del paquete.
 */
type CollapsibleProps = WithClassName<CollapsiblePrimitive.Root.Props>

function Collapsible({ className, ...props }: CollapsibleProps) {
  return <CollapsiblePrimitive.Root data-slot="collapsible" className={cn("flex flex-col", className)} {...props} />
}

const disclosureClassName =
  "group/collapsible-trigger inline-flex cursor-pointer items-center gap-1.5 rounded-control text-left outline-none focus-visible:focus-ring"

type CollapsibleTriggerProps = CollapsiblePrimitive.Trigger.Props & {
  /**
   * Suma el disclosure de iCloud después del texto: un chevron › que gira a ⌄ al abrir (sin
   * recorrido con movimiento reducido). Sin él, el trigger no trae estilo: lo pone el `render`.
   */
  chevron?: boolean
}

function CollapsibleTrigger({ chevron = false, className, children, ...props }: CollapsibleTriggerProps) {
  if (!chevron) return <CollapsiblePrimitive.Trigger data-slot="collapsible-trigger" className={className} {...props}>{children}</CollapsiblePrimitive.Trigger>
  return (
    <CollapsiblePrimitive.Trigger
      data-slot="collapsible-trigger"
      className={typeof className === "function" ? (state) => cn(disclosureClassName, className(state)) : cn(disclosureClassName, className)}
      {...props}
    >
      {children}
      <ChevronRightIcon
        aria-hidden="true"
        className="size-3.5 shrink-0 text-label-secondary transition-transform duration-150 ease-out motion-reduce:transition-none group-data-panel-open/collapsible-trigger:rotate-90"
      />
    </CollapsiblePrimitive.Trigger>
  )
}

type CollapsibleContentProps = WithClassName<CollapsiblePrimitive.Panel.Props> & {
  /** Clases del panel que anima el alto. El `className` viaja al contenido, no acá. */
  panelClassName?: string
}

/**
 * El panel. El alto lo anima Base UI con `--collapsible-panel-height`; el
 * contenido va en un `div` adentro porque un padding sobre el elemento que
 * anima el alto se ve como un salto al abrir.
 *
 * `className` cae en ese contenido, que es donde el llamador quiere poner
 * padding y tipografía.
 */
function CollapsibleContent({ className, children, panelClassName, ...props }: CollapsibleContentProps) {
  return (
    <CollapsiblePrimitive.Panel
      data-slot="collapsible-content"
      className={cn(
        "h-(--collapsible-panel-height) overflow-hidden transition-[height] duration-150 ease-out motion-reduce:transition-none",
        "data-ending-style:h-0 data-starting-style:h-0",
        // Con `keepMounted` el panel cerrado queda en el DOM con [hidden]; `hidden="until-found"`
        // tiene que seguir siendo encontrable por el buscador del navegador.
        "[&[hidden]:not([hidden='until-found'])]:hidden",
        panelClassName
      )}
      {...props}
    >
      <div data-slot="collapsible-content-inner" className={cn("pt-2 text-callout text-label-secondary", className)}>
        {children}
      </div>
    </CollapsiblePrimitive.Panel>
  )
}

export { Collapsible, CollapsibleContent, CollapsibleTrigger, type CollapsibleContentProps, type CollapsibleProps, type CollapsibleTriggerProps }
