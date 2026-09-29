"use client"

import type { LucideIcon } from "lucide-react"
import type * as React from "react"
import { ToolbarButton } from "sebs7n-ui/toolbar"
import { Tooltip, TooltipContent, TooltipTrigger } from "sebs7n-ui/tooltip"

/** Los colores de las cajas de ícono: clases literales, para que Tailwind las encuentre. */
const FILLS = {
  brand: "bg-brand-700 text-brand-contrast",
  green: "bg-green-700 text-white",
  red: "bg-red-700 text-white",
  amber: "bg-amber-700 text-white",
  blue: "bg-blue-700 text-white",
  purple: "bg-purple-700 text-white",
  teal: "bg-teal-700 text-white",
  gray: "bg-gray-700 text-white",
} as const

export type Fill = keyof typeof FILLS

/** El ícono de una app o de un tipo de archivo: una caja de color con el glifo en blanco. */
export function AppIcon({ icon: Glyph, fill, size = "md" }: { icon: LucideIcon; fill: Fill; size?: "sm" | "md" }) {
  return (
    <span
      aria-hidden="true"
      className={`flex shrink-0 items-center justify-center ${size === "md" ? "size-10 rounded-control" : "size-7 rounded-[6px]"} ${FILLS[fill]}`}
    >
      <Glyph className={size === "md" ? "size-5" : "size-4"} />
    </span>
  )
}

/** Un botón de ícono de una `Toolbar`, con su nombre en un tooltip. */
export function ToolButton({
  label,
  icon: Glyph,
  disabled,
  onClick,
  shortcut,
}: {
  label: string
  icon: LucideIcon
  disabled?: boolean
  onClick?: () => void
  shortcut?: React.ReactNode
}) {
  return (
    <Tooltip>
      <TooltipTrigger render={<ToolbarButton aria-label={label} disabled={disabled} onClick={onClick} />}>
        <Glyph />
      </TooltipTrigger>
      <TooltipContent>
        {label}
        {shortcut}
      </TooltipContent>
    </Tooltip>
  )
}
