"use client"

import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion"
import { ChevronDownIcon } from "lucide-react"

import { cn } from "../lib/utils.js"

/**
 * Secciones plegables que se leen como una lista: preguntas frecuentes, un
 * formulario largo partido en pasos, la ficha de un recurso con bloques que no
 * hacen falta todos a la vez.
 *
 * Por defecto se abre **una sola** sección (abrir una cierra la anterior);
 * `multiple` deja varias abiertas. Cuando hay una sola sección, `Collapsible`.
 *
 * El movimiento: el alto lo anima Base UI con `--accordion-panel-height` y el
 * chevron gira 180°. Las dos cosas pasan por `motion-reduce`, además del reset
 * global del paquete, así que con movimiento reducido el panel aparece y
 * desaparece sin recorrido.
 */
type AccordionProps = Omit<AccordionPrimitive.Root.Props, "className"> & { className?: string }

function Accordion({ className, ...props }: AccordionProps) {
  return (
    <AccordionPrimitive.Root
      data-slot="accordion"
      className={cn("flex w-full flex-col border-b border-gray-400", className)}
      {...props}
    />
  )
}

type AccordionItemProps = Omit<AccordionPrimitive.Item.Props, "className"> & { className?: string }

function AccordionItem({ className, ...props }: AccordionItemProps) {
  return <AccordionPrimitive.Item data-slot="accordion-item" className={cn("border-t border-gray-400", className)} {...props} />
}

type AccordionTriggerProps = Omit<AccordionPrimitive.Trigger.Props, "className"> & {
  className?: string
  /** Clases del `<h3>` que envuelve al botón. */
  headerClassName?: string
  /** Saca el chevron, para poner otro indicador. */
  chevron?: boolean
}

/**
 * El botón que abre la sección, ya dentro de su `<h3>`: el encabezado no es
 * decorativo, es lo que deja saltar de sección en sección con un lector de
 * pantalla.
 */
function AccordionTrigger({ className, chevron = true, children, headerClassName, ...props }: AccordionTriggerProps) {
  return (
    <AccordionPrimitive.Header data-slot="accordion-header" className={cn("flex", headerClassName)}>
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "group/accordion-trigger flex flex-1 cursor-pointer items-center justify-between gap-3 rounded-md px-1 py-4 text-left text-heading-14 text-gray-1000 outline-none select-none transition-control",
          "hover:text-gray-900 focus-visible:focus-ring",
          "data-disabled:cursor-not-allowed data-disabled:text-gray-700 data-disabled:hover:text-gray-700",
          "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
          className
        )}
        {...props}
      >
        {children}
        {chevron && (
          <ChevronDownIcon
            aria-hidden="true"
            className="text-gray-900 transition-transform duration-150 ease-out motion-reduce:transition-none group-data-panel-open/accordion-trigger:rotate-180"
          />
        )}
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

type AccordionContentProps = Omit<AccordionPrimitive.Panel.Props, "className"> & {
  className?: string
  /** Clases del panel que anima el alto. El `className` viaja al contenido, no acá. */
  panelClassName?: string
}

/**
 * El contenido de la sección. El alto lo anima el panel; el `className` cae en
 * el `div` de adentro, porque un padding sobre el elemento que anima el alto se
 * ve como un salto al abrir.
 */
function AccordionContent({ className, children, panelClassName, ...props }: AccordionContentProps) {
  return (
    <AccordionPrimitive.Panel
      data-slot="accordion-content"
      className={cn(
        "h-(--accordion-panel-height) overflow-hidden transition-[height] duration-150 ease-out motion-reduce:transition-none",
        "data-ending-style:h-0 data-starting-style:h-0",
        "[&[hidden]:not([hidden='until-found'])]:hidden",
        panelClassName
      )}
      {...props}
    >
      <div data-slot="accordion-content-inner" className={cn("px-1 pb-4 text-copy-14 text-gray-900", className)}>
        {children}
      </div>
    </AccordionPrimitive.Panel>
  )
}

export {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  type AccordionContentProps,
  type AccordionItemProps,
  type AccordionProps,
  type AccordionTriggerProps,
}
