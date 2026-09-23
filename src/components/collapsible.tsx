"use client"

import { Collapsible as CollapsiblePrimitive } from "@base-ui/react/collapsible"

import { cn } from "../lib/utils.js"

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
type CollapsibleProps = Omit<CollapsiblePrimitive.Root.Props, "className"> & { className?: string }

function Collapsible({ className, ...props }: CollapsibleProps) {
  return <CollapsiblePrimitive.Root data-slot="collapsible" className={cn("flex flex-col", className)} {...props} />
}

function CollapsibleTrigger(props: CollapsiblePrimitive.Trigger.Props) {
  return <CollapsiblePrimitive.Trigger data-slot="collapsible-trigger" {...props} />
}

type CollapsibleContentProps = Omit<CollapsiblePrimitive.Panel.Props, "className"> & {
  className?: string
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
      <div data-slot="collapsible-content-inner" className={cn("pt-2 text-copy-14 text-gray-900", className)}>
        {children}
      </div>
    </CollapsiblePrimitive.Panel>
  )
}

export { Collapsible, CollapsibleContent, CollapsibleTrigger, type CollapsibleContentProps, type CollapsibleProps }
