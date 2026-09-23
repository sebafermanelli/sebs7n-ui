import { cva } from "class-variance-authority"

import { cn } from "../lib/utils.js"

export const BADGE_COLORS = ["gray", "brand", "red", "amber", "green", "blue", "teal", "purple", "pink"] as const
export type BadgeColor = (typeof BADGE_COLORS)[number]

const badgeVariantsBase = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-full border text-label-12 whitespace-nowrap [&>svg]:pointer-events-none [&>svg]:size-3",
  {
    variants: {
      variant: { subtle: "", solid: "border-transparent" },
      color: {
        gray: "", brand: "", red: "", amber: "", green: "", blue: "", teal: "", purple: "", pink: "",
      },
      size: { sm: "h-5 px-1.5", md: "h-6 px-2" },
    },
    compoundVariants: [
      { variant: "subtle", color: "gray", className: "border-gray-400 bg-gray-100 text-gray-900" },
      { variant: "subtle", color: "brand", className: "border-brand-400 bg-brand-100 text-brand-900" },
      { variant: "subtle", color: "red", className: "border-red-400 bg-red-100 text-red-900" },
      { variant: "subtle", color: "amber", className: "border-amber-400 bg-amber-100 text-amber-900" },
      { variant: "subtle", color: "green", className: "border-green-400 bg-green-100 text-green-900" },
      { variant: "subtle", color: "blue", className: "border-blue-400 bg-blue-100 text-blue-900" },
      { variant: "subtle", color: "teal", className: "border-teal-400 bg-teal-100 text-teal-900" },
      { variant: "subtle", color: "purple", className: "border-purple-400 bg-purple-100 text-purple-900" },
      { variant: "subtle", color: "pink", className: "border-pink-400 bg-pink-100 text-pink-900" },
      { variant: "solid", color: "gray", className: "bg-gray-1000 text-background-100" },
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
