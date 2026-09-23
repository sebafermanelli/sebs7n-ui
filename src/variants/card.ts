import { cva } from "class-variance-authority"

import { cn } from "../lib/utils.js"

const cardVariantsBase = cva(
  "group/card flex flex-col gap-(--card-spacing) rounded-xl py-(--card-spacing) text-copy-14 text-gray-1000",
  {
    variants: {
      variant: {
        default: "border border-gray-400 bg-background-100",
        subtle: "bg-background-200",
      },
      size: {
        sm: "[--card-spacing:--spacing(4)]",
        md: "[--card-spacing:--spacing(6)]",
      },
      interactive: {
        true: "cursor-pointer outline-none transition-control hover:border-gray-500 hover:bg-gray-100 active:bg-gray-200 focus-visible:focus-ring",
        false: "",
      },
      selected: {
        true: "border-brand-700 ring-1 ring-brand-700",
        false: "",
      },
    },
    defaultVariants: { variant: "default", size: "md", interactive: false, selected: false },
  }
)

// Pasa por cn() (tailwind-merge): usada sobre <a>/<Link>, la clase de la variante tiene que ganarle a la base.
export const cardVariants = (props?: Parameters<typeof cardVariantsBase>[0]) => cn(cardVariantsBase(props))
