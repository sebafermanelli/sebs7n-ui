"use client"

import * as React from "react"
import { ChevronDownIcon, SlidersHorizontalIcon } from "lucide-react"

import { cn } from "../lib/utils.js"
import { Button } from "./button.js"

type FilterDisclosureProps = {
  /** Cuántos filtros hay aplicados: se muestra en el botón («Filtros (2)»). */
  activeCount?: number
  /** El texto del botón. Default «Filtros». */
  label?: string
  className?: string
  children: React.ReactNode
}

/**
 * Los filtros de una `FilterBar` que no entran en una fila, en un disclosure: por debajo de 36 rem de
 * ancho de la barra (`@xl`, el corte de `FilterBar`) quedan detrás de un botón «Filtros» y se abren
 * debajo de la búsqueda; desde ahí están siempre a la vista y el botón no existe. Va en el slot
 * `filters`. Los campos quedan en el DOM aunque estén cerrados, así que un `<form>` los envía igual.
 */
function FilterDisclosure({ activeCount = 0, label = "Filtros", className, children }: FilterDisclosureProps) {
  const [open, setOpen] = React.useState(false)
  const id = React.useId()
  return (
    <>
      <Button
        aria-controls={id}
        aria-expanded={open}
        className="@xl:hidden"
        data-slot="filter-disclosure-trigger"
        onClick={() => setOpen((o) => !o)}
        size="sm"
        type="button"
        variant="secondary"
      >
        <SlidersHorizontalIcon aria-hidden />
        {label}
        {activeCount > 0 ? ` (${activeCount})` : ""}
        <ChevronDownIcon aria-hidden className={cn("transition-transform motion-reduce:transition-none", open && "rotate-180")} />
      </Button>
      <div
        className={cn(
          "flex min-w-0 flex-col gap-2 @xl:flex-row @xl:flex-wrap @xl:items-center @max-xl:[&>:not(.sr-only,[role=group])]:w-full",
          !open && "@max-xl:hidden",
          className
        )}
        data-slot="filter-disclosure"
        id={id}
      >
        {children}
      </div>
    </>
  )
}

export { FilterDisclosure, type FilterDisclosureProps }
