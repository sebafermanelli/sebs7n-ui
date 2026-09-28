import { cva } from "class-variance-authority"

import { cn } from "../lib/utils.js"

export const BADGE_COLORS = ["gray", "brand", "red", "amber", "green", "blue", "teal", "purple", "pink"] as const
export type BadgeColor = (typeof BADGE_COLORS)[number]

/**
 * El cuerpo de una etiqueta: vidrio teñido.
 *
 * El fondo y el borde son el `-700` de la paleta en alfa, no un `-100` opaco: adentro de una
 * Card o de una fila de tabla, que son de vidrio, un relleno opaco quedaba como una calcomanía
 * pegada encima. En alfa deja pasar lo que tiene debajo y toma el tono del lugar donde está.
 *
 * Sin blur: una etiqueta vive adentro de una superficie que ya lo tiene. Lo que la hace
 * material y no relleno es el filo de luz de arriba (`shadow-chip`).
 *
 * El texto es la tinta de la paleta (`text-red-ink`), no su `-900`: ver el porqué en theme.css.
 * `solid` sigue sólido —el color que tiene que leerse igual en cualquier pantalla no depende
 * de lo que pase por debajo— y suma el brillo de los botones de color.
 */
const badgeVariantsBase = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-full border text-callout whitespace-nowrap [&>svg]:pointer-events-none [&>svg]:size-3",
  {
    variants: {
      variant: { subtle: "shadow-chip", solid: "border-transparent sheen shadow-button" },
      color: {
        gray: "", brand: "", red: "", amber: "", green: "", blue: "", teal: "", purple: "", pink: "",
      },
      size: { sm: "h-5 px-1.5", md: "h-6 px-2" },
    },
    compoundVariants: [
      { variant: "subtle", color: "gray", className: "border-gray-alpha-400 bg-gray-alpha-200 text-gray-900" },
      { variant: "subtle", color: "brand", className: "border-brand-700/(--sf-tint-border) bg-brand-700/(--sf-tint-fill) text-brand-ink" },
      { variant: "subtle", color: "red", className: "border-red-700/(--sf-tint-border) bg-red-700/(--sf-tint-fill) text-red-ink" },
      { variant: "subtle", color: "amber", className: "border-amber-700/(--sf-tint-border) bg-amber-700/(--sf-tint-fill) text-amber-ink" },
      { variant: "subtle", color: "green", className: "border-green-700/(--sf-tint-border) bg-green-700/(--sf-tint-fill) text-green-ink" },
      { variant: "subtle", color: "blue", className: "border-blue-700/(--sf-tint-border) bg-blue-700/(--sf-tint-fill) text-blue-ink" },
      { variant: "subtle", color: "teal", className: "border-teal-700/(--sf-tint-border) bg-teal-700/(--sf-tint-fill) text-teal-ink" },
      { variant: "subtle", color: "purple", className: "border-purple-700/(--sf-tint-border) bg-purple-700/(--sf-tint-fill) text-purple-ink" },
      { variant: "subtle", color: "pink", className: "border-pink-700/(--sf-tint-border) bg-pink-700/(--sf-tint-fill) text-pink-ink" },
      { variant: "solid", color: "gray", className: "bg-gray-1000 text-background-100 shadow-button-inverted" },
      { variant: "solid", color: "brand", className: "bg-brand-700 text-brand-contrast" },
    ],
    defaultVariants: { variant: "subtle", color: "gray", size: "md" },
  }
)

// Pasa por cn() (tailwind-merge): usada sobre <a>/<Link>, la clase de la variante tiene que ganarle a la base.
export const badgeVariants = (props?: Parameters<typeof badgeVariantsBase>[0]) => cn(badgeVariantsBase(props))

export const badgeDotColor: Record<BadgeColor, string> = {
  gray: "bg-gray-700",
  brand: "bg-brand-700",
  red: "bg-red-700",
  amber: "bg-amber-700",
  green: "bg-green-700",
  blue: "bg-blue-700",
  teal: "bg-teal-700",
  purple: "bg-purple-700",
  pink: "bg-pink-700",
}
