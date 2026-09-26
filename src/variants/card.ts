import { cva } from "class-variance-authority"

import { cn } from "../lib/utils.js"

const cardVariantsBase = cva(
  "group/card flex flex-col gap-(--card-spacing) rounded-xl py-(--card-spacing) text-copy-14 text-gray-1000",
  {
    variants: {
      variant: {
        default: "border border-gray-400 bg-background-100 shadow-card",
        subtle: "bg-background-200",
      },
      size: {
        sm: "[--card-spacing:--spacing(4)]",
        md: "[--card-spacing:--spacing(6)]",
      },
      interactive: {
        // Sube un pixel y la sombra crece: la profundidad se nota al tocar, no de lejos.
        // Al apretar vuelve a su lugar, que es el gesto de «hundir».
        true: "cursor-pointer outline-none transition-surface hover:-translate-y-px hover:border-gray-500 hover:shadow-card-hover active:translate-y-0 active:bg-gray-100 active:shadow-card focus-visible:focus-ring",
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
