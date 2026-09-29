import { cva } from "class-variance-authority"

import { cn } from "../lib/utils.js"

const cardVariantsBase = cva(
  "group/card flex flex-col gap-(--card-spacing) rounded-surface py-(--card-spacing) text-callout text-label",
  {
    variants: {
      variant: {
        default: "bg-grouped",
        // Hundida: es la que va ADENTRO de otra superficie, y ahí una segunda superficie
        // no tiene nada que desenfocar.
        subtle: "bg-fill-1",
      },
      size: {
        sm: "[--card-spacing:--spacing(4)]",
        md: "[--card-spacing:--spacing(6)]",
      },
      interactive: {
        // Sube un pixel y la sombra crece: la profundidad se nota al tocar, no de lejos.
        // Al apretar vuelve a su lugar, que es el gesto de «hundir», y se oscurece con una capa
        // de `gray-alpha-200` ENCIMA del fondo (`background-image`), no en su lugar: un
        // `active:bg-gray-alpha-*` cambiaba el sólido del grupo por un alfa y la card se volvía
        // transparente justo al tocarla.
        true: "cursor-pointer outline-none transition-surface hover:-translate-y-px hover:border-separator-strong hover:shadow-card-hover active:translate-y-0 active:bg-[linear-gradient(var(--color-fill-2),var(--color-fill-2))] active:shadow-card focus-visible:focus-ring",
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
