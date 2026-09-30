import type * as React from "react"

import { cn } from "../lib/utils.js"
import type { BadgeColor } from "../variants/badge.js"
import { Badge } from "./badge.js"

type CountBadgeProps = Omit<React.ComponentProps<"span">, "children" | "color"> & {
  /** La cantidad. Con 0 (o menos, o `NaN`) no se dibuja nada. */
  count: number
  /** Desde cuánto se escribe «99+». El nombre del botón dice el número real (`countLabel`). */
  max?: number
  /** Rojo por defecto, como el de las notificaciones. */
  color?: BadgeColor
}

/**
 * El contador de un botón de ícono de barra: la campana con los no leídos, la bandeja con los
 * pendientes. Un `Badge variant="count"` chico arriba a la derecha del ícono, con «99+» pasado el tope.
 *
 * Va **adentro** del `Button` (que ya es `relative`), después del ícono. Es decorativo: el número lo
 * dice el nombre del botón, con `countLabel`, porque un botón de ícono se nombra con `aria-label` y ese
 * nombre le gana a lo de adentro.
 *
 * ```tsx
 * <Button variant="plain" size="icon-sm" aria-label={countLabel("Notificaciones", unread, "sin leer")}>
 *   <BellIcon />
 *   <CountBadge count={unread} />
 * </Button>
 * ```
 *
 * El anillo del color de la barra lo separa del ícono (`surface-bar`, el de `Toolbar`); en otra
 * superficie, `className="ring-surface-header"`. Sin estado: va en un Server Component.
 */
function CountBadge({ count, max = 99, color = "red", className, ...props }: CountBadgeProps) {
  if (!(count > 0)) return null
  return (
    <Badge
      aria-hidden="true"
      data-slot="count-badge"
      variant="count"
      size="sm"
      color={color}
      className={cn(
        // Anclado a la esquina de arriba a la derecha del botón, 4 px afuera: con un dígito queda sobre
        // la esquina del ícono, y un «99+» crece hacia adentro (sobre su propio ícono) y no tapa al
        // botón de al lado en una barra.
        "pointer-events-none absolute -end-1 -top-1 ring-2 ring-surface-bar",
        className
      )}
      {...props}
    >
      {count > max ? `${max}+` : count}
    </Badge>
  )
}

/**
 * El nombre de un botón con contador: «Notificaciones, 3 sin leer». Con 0, el nombre solo.
 * `detail` es lo que se cuenta, en el idioma de la app.
 */
function countLabel(name: string, count: number, detail?: string): string {
  return count > 0 ? `${name}, ${count}${detail ? ` ${detail}` : ""}` : name
}

export { CountBadge, countLabel, type CountBadgeProps }
