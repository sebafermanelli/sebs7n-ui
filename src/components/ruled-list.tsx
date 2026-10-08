import type * as React from "react"

import { cn } from "../lib/utils.js"

/**
 * Listas con filetes y numeración editorial, para una landing: las funciones de un producto (01, 02…),
 * las preguntas de siempre, un modelo de seguridad (§ 1, § 2). Un filete de 1 px entre filas, sin cards
 * ni íconos.
 *
 * ```tsx
 * <RuledList marker="number">
 *   <RuledListItem title="Cargá">Desde un PDF o a mano.</RuledListItem>
 *   <RuledListItem title="Revisá">Cada cambio queda en el historial.</RuledListItem>
 * </RuledList>
 *
 * <DefinitionList>
 *   <DefinitionItem term="Plazo">30 días corridos.</DefinitionItem>
 * </DefinitionList>
 * ```
 *
 * - `RuledList` es un `<ol>` si el marcador es `number` o `section` (la numeración también está en la
 *   semántica) y un `<ul>` con `none`. El número sale de un contador CSS: no se duplica para un lector.
 * - `DefinitionList` es un `<dl>` con una fila por par término/detalle (`<div>` dentro de `<dl>`, válido).
 * - Sin estado ni hooks: sirven en un Server Component.
 */
type RuledListProps = Omit<React.ComponentProps<"ol">, "type"> & {
  /** `number` (01, 02…), `section` (§ 1, § 2…) o `none`. Default `number`. */
  marker?: "number" | "section" | "none"
}

function RuledList({ marker = "number", className, ...props }: RuledListProps) {
  const Tag = (marker === "none" ? "ul" : "ol") as "ol"
  return (
    <Tag
      data-slot="ruled-list"
      data-marker={marker}
      className={cn("m-0 flex list-none flex-col border-t border-separator p-0 [counter-reset:ruled-item]", className)}
      {...props}
    />
  )
}

type RuledListItemProps = Omit<React.ComponentProps<"li">, "title"> & {
  /** El título de la fila. */
  title?: React.ReactNode
}

/** Una fila. El marcador lo pone el contador del `RuledList` que la contiene. */
function RuledListItem({ title, className, children, ...props }: RuledListItemProps) {
  return (
    <li
      data-slot="ruled-list-item"
      className={cn(
        "grid gap-x-6 gap-y-1 border-b border-separator py-5 [counter-increment:ruled-item] @lg:grid-cols-[4rem_minmax(0,1fr)] in-data-[marker=none]:@lg:grid-cols-1",
        "before:text-footnote before:tabular-nums before:text-label-secondary before:pt-1 in-data-[marker=none]:before:hidden",
        "in-data-[marker=number]:before:content-[counter(ruled-item,decimal-leading-zero)] in-data-[marker=section]:before:content-['§_'counter(ruled-item)]",
        className
      )}
      {...props}
    >
      <div className="flex min-w-0 flex-col gap-1">
        {title != null && <p className="font-display text-title-3 text-label">{title}</p>}
        {children != null && <div className="text-callout text-label-secondary">{children}</div>}
      </div>
    </li>
  )
}

type DefinitionListProps = React.ComponentProps<"dl">

/** Una lista de definiciones con filetes: término a la izquierda, detalle a la derecha. */
function DefinitionList({ className, ...props }: DefinitionListProps) {
  return <dl data-slot="definition-list" className={cn("m-0 flex flex-col border-t border-separator", className)} {...props} />
}

type DefinitionItemProps = Omit<React.ComponentProps<"div">, "title"> & {
  /** El término (`<dt>`). */
  term: React.ReactNode
}

/** Un par término/detalle: `children` es el detalle (`<dd>`). */
function DefinitionItem({ term, className, children, ...props }: DefinitionItemProps) {
  return (
    <div data-slot="definition-item" className={cn("grid gap-1 border-b border-separator py-4 @lg:grid-cols-[12rem_minmax(0,1fr)] @lg:gap-6", className)} {...props}>
      <dt className="text-callout font-semibold text-label">{term}</dt>
      <dd className="m-0 text-callout text-label-secondary">{children}</dd>
    </div>
  )
}

export { DefinitionItem, DefinitionList, RuledList, RuledListItem, type DefinitionItemProps, type DefinitionListProps, type RuledListItemProps, type RuledListProps }
