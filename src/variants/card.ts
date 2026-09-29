import { cva } from "class-variance-authority"

import { cn } from "../lib/utils.js"

// El widget de iCloud (catálogo §2.7, 2.0): radio 11, cuerpo opaco con la sombra de widget y una
// franja de cabecera de otro tono (la pone `CardHeader`). `overflow-hidden` para que la franja y las
// filas sigan el radio. Sin padding propio: cada parte trae el suyo, así la franja llega al borde.
const cardVariantsBase = cva("group/card relative flex flex-col overflow-hidden rounded-surface text-callout text-label", {
  variants: {
    variant: {
      // Sobre el wallpaper (W, adentro de `data-ambient`) el cuerpo es el material translúcido con
      // blur, en la raíz: un solo blur por card. La franja de `CardHeader` va encima, sin blur propio.
      // El color de la franja lo fija la raíz en `--card-strip` y la cabecera lo lee: una variable
      // se hereda del ancestro MÁS CERCANO, así una card adentro de otra lleva la suya y no la de
      // afuera (un `group-data-[variant=…]/card` matchea con cualquier ancestro).
      default: [
        "bg-surface shadow-widget [--card-strip:var(--color-surface-bar)]",
        "in-data-ambient:material-translucent-body in-data-ambient:[--card-strip:var(--color-translucent-strip)]",
      ],
      // Hundida y plana: la que va ADENTRO de otra superficie (la card inline de Mail, fill 1). La
      // franja es del widget: acá la cabecera va sin fondo, haya wallpaper o no.
      subtle: "bg-fill-1 [--card-strip:transparent]",
    },
    size: {
      sm: "[--card-spacing:--spacing(4)]",
      // 20, el padding de un widget de iCloud.
      md: "[--card-spacing:--spacing(5)]",
    },
    interactive: {
      // Sube un pixel al pasar el puntero; al apretar vuelve a su lugar y se oscurece con una capa
      // de `fill-2` ENCIMA del fondo (`background-image`), no en su lugar: un `active:bg-fill-*`
      // cambiaba el sólido por un alfa y la card se volvía transparente justo al tocarla.
      true: "cursor-pointer outline-none transition-surface hover:-translate-y-px active:translate-y-0 active:bg-[linear-gradient(var(--color-fill-2),var(--color-fill-2))] focus-visible:focus-ring",
      false: "",
    },
    selected: {
      // Anillo de afuera: uno interior quedaría tapado por la franja de la cabecera.
      true: "ring-2 ring-brand-700",
      false: "",
    },
  },
  defaultVariants: { variant: "default", size: "md", interactive: false, selected: false },
})

// Pasa por cn() (tailwind-merge): usada sobre <a>/<Link>, la clase de la variante tiene que ganarle a la base.
export const cardVariants = (props?: Parameters<typeof cardVariantsBase>[0]) => cn(cardVariantsBase(props))
