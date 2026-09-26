import type * as React from "react"
import type { LucideIcon, LucideProps } from "lucide-react"

import { cn, type WithClassName } from "../lib/utils.js"

/**
 * 16 / 20 / 24px. Son los tres altos de línea del texto del sistema: `sm` va
 * con `copy-14` y con el `Button` chico, `md` con `copy-16` y con un ítem de
 * lista, `lg` con un título o un estado vacío.
 */
const iconSizes = { sm: "size-4", md: "size-5", lg: "size-6" } as const

/**
 * `current` hereda el color del texto que lo rodea, y es el que va casi
 * siempre: un ícono al lado de una palabra es de la misma tinta que la palabra.
 * Los otros son para cuando el ícono está solo y tiene que decir algo por su
 * cuenta —un estado, una alerta, la marca—. Todos usan el 900 de su familia,
 * que es el paso que llega a 4,5:1 sobre la superficie en los dos temas.
 */
const iconTones = {
  current: "",
  muted: "text-gray-900",
  subtle: "text-gray-700",
  brand: "text-brand-900",
  success: "text-green-900",
  warning: "text-amber-900",
  danger: "text-red-900",
} as const

type IconProps = WithClassName<Omit<LucideProps, "ref" | "size">> & {
  /** El ícono de lucide, como componente: `icon={SearchIcon}`. */
  icon: LucideIcon
  size?: keyof typeof iconSizes
  tone?: keyof typeof iconTones
  /**
   * Nombre accesible. Con `label` el ícono es una imagen con nombre
   * (`role="img"`) y el lector lo anuncia; sin `label` es decoración
   * (`aria-hidden`), que es lo que corresponde cuando al lado hay un texto que
   * ya dice lo mismo. Un ícono que es la única señal de algo —un check de
   * «pagada» sin la palabra— **necesita** el `label`.
   */
  label?: string
}

/**
 * Un ícono de lucide con los tamaños, los tonos y la semántica del sistema.
 *
 * `lucide-react` ya es dependencia del paquete y los componentes lo usan
 * directo; esto no lo reemplaza, lo **normaliza**: en vez de `className="size-5
 * text-gray-900"` repetido en cada llamada, `size` y `tone` con nombres que
 * vienen de la escala. Y decide por defecto lo que casi siempre se olvida: que
 * un ícono sin nombre es decoración y va con `aria-hidden`.
 *
 * Sin `"use client"`: sirve en un Server Component. El trazo es el de lucide
 * (2 a 24px, que escala con el tamaño): igual que en los 22 componentes del
 * paquete que ya lo usan, para que un ícono de `Icon` y uno puesto a mano en
 * un `Button` no se vean distintos.
 */
function Icon({ icon: Svg, size = "md", tone = "current", label, className, ...props }: IconProps) {
  return (
    <Svg
      data-slot="icon"
      data-size={size}
      data-tone={tone}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : "true"}
      focusable="false"
      className={cn("shrink-0", iconSizes[size], iconTones[tone], className)}
      {...props}
    />
  )
}

export { Icon, type IconProps }
