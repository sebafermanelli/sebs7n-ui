import { cn } from "../lib/utils.js"
import { badgeVariants, BADGE_COLORS, type BadgeColor } from "./badge.js"

/** Los mismos nueve tonos del Badge: el sistema tiene una sola paleta de etiquetas. */
export const TAG_COLORS = BADGE_COLORS
export type TagColor = BadgeColor
export type TagSize = "sm" | "md"

export type TagVariantProps = {
  color?: TagColor
  size?: TagSize
  /** Deja lugar a la derecha para el botón de quitar. */
  removable?: boolean
  className?: string
}

/**
 * El cuerpo del `Tag`.
 *
 * Comparte forma y paleta con `badgeVariants({ variant: "subtle" })` a
 * propósito: una sola forma de etiqueta en todo el sistema. Lo que distingue a
 * un Tag no es cómo se ve sino qué es —un dato que puso el usuario y puede
 * sacar—, y eso se anuncia con el botón de quitar, no con otro radio.
 *
 * `ComboboxChip` sale de acá desde 0.5.0. Antes tenía su propia copia y habían
 * quedado distintas: el botón de quitar medía 20px en el chip y 16 en el tag, el
 * hover era `gray-alpha-200` contra `gray-alpha-300`, y el aire a la derecha del
 * texto era la mitad. Son dos etiquetas que el usuario ve una al lado de la otra.
 */
export const tagVariants = ({ color = "gray", size = "md", removable = false, className }: TagVariantProps = {}) =>
  cn(
    badgeVariants({ variant: "subtle", color, size }),
    // El anillo de foco del botón de quitar es un box-shadow: con el
    // overflow-hidden del badge quedaría cortado justo donde importa.
    "max-w-full overflow-visible",
    removable && (size === "sm" ? "gap-0.5 pr-0.5" : "gap-1 pr-1"),
    className
  )

/**
 * El botón de quitar. Hereda el color del tag y se apoya en `gray-alpha` para el hover.
 *
 * El círculo mide 4px menos que el alto del tag, así el aire que le queda arriba
 * y abajo (2px en `sm`, 4px en `md`) es el mismo que el `pr` del cuerpo. Con un
 * círculo más grande el hover se lee aplastado contra los bordes aunque esté
 * centrado: lo que se compara no es el centro sino los tres espacios.
 *
 * El dibujo queda en 16px y el área de toque la agrega un `::after` de
 * `-inset-1`, que la lleva a 24×24 (WCAG 2.5.8) sin mover un pixel de lo que se
 * ve. Es la misma técnica que ya usan Checkbox y Radio con `-inset-2`: agrandar
 * el círculo para llegar a 24 rompería la relación de espacios de arriba, y un
 * botón de quitar de 24px al lado de un texto de 12 se lee como otro control.
 * El `relative` es lo que ancla ese `::after` al botón.
 */
export const tagRemoveClassName: Record<TagSize, string> = {
  sm: cn(
    "relative inline-flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-full outline-none transition-control after:absolute after:-inset-1",
    "hover:bg-gray-alpha-300 focus-visible:focus-ring [&_svg]:pointer-events-none [&_svg]:size-3"
  ),
  md: cn(
    "relative inline-flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-full outline-none transition-control after:absolute after:-inset-1",
    "hover:bg-gray-alpha-300 focus-visible:focus-ring [&_svg]:pointer-events-none [&_svg]:size-3"
  ),
}
