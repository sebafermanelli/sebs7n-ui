import { cva } from "class-variance-authority"

import { cn } from "../lib/utils.js"

export const BADGE_COLORS = ["gray", "brand", "red", "amber", "green", "blue", "teal", "purple", "pink"] as const
export type BadgeColor = (typeof BADGE_COLORS)[number]

/**
 * Las dos tintas de una etiqueta sólida, con el velo del hover de su botón de quitar.
 *
 * Blanco sobre los rellenos oscuros y negro al 85 % (el `labelColor` de macOS) sobre los claros:
 * ningún color de la paleta llega a 4,5:1 con las dos, así que cada uno usa la que pasa (los
 * números están en `test/contrast.test.ts`).
 *
 * `--sf-tag-press` es el hover del botón de quitar del Tag, y va del lado contrario a la tinta:
 * oscurece bajo la X blanca y aclara bajo la negra, así el contraste sube en vez de bajar. Con el
 * `gray-alpha-300` del sistema, en oscuro aclaraba bajo la X blanca.
 */
const inkWhite = "text-white [--sf-tag-press:rgb(0_0_0/0.25)]"
const inkBlack = "text-black/85 [--sf-tag-press:rgb(255_255_255/0.3)]"

/**
 * El cuerpo de una etiqueta (2.0): la etiqueta del Finder.
 *
 * Relleno sólido, sin borde, sin brillo y sin vidrio, con 4 px de radio (`rounded-tag`). Hasta la
 * fase 3 el default era vidrio teñido con borde (`subtle`): adentro de una tabla densa se leía
 * como un control más, y el color —que es lo que dice el estado— quedaba lavado.
 *
 * El relleno es el paso de la paleta donde el color se ve vivo y su tinta llega a 4,5:1, y es el
 * mismo en los dos temas (los `-700` y `-800` de Geist casi no cambian entre claro y oscuro):
 *
 * | color  | relleno      | tinta     |
 * | ------ | ------------ | --------- |
 * | gray   | `gray-700`   | negra     |
 * | brand  | `brand-700`  | `brand-contrast` (el par del botón `accent`) |
 * | red    | `red-800`    | blanca    |
 * | amber  | `amber-700`  | negra     |
 * | green  | `green-700`  | negra     |
 * | blue   | `blue-800`   | blanca    |
 * | teal   | `teal-700`   | negra     |
 * | purple | `purple-700` | blanca    |
 * | pink   | `pink-800`   | blanca    |
 *
 * El rojo, el azul y el rosa van en `-800` porque en `-700` el blanco no llega (3,98, 4,47 y 3,88
 * en el peor tema); el verde y el teal, en oscuro, no llegan con blanco en ningún paso, y van con
 * tinta negra.
 *
 * `variant` quedó con un solo aspecto: `subtle` se acepta por compatibilidad y dibuja lo mismo
 * que `solid`.
 */
const badgeVariantsBase = cva(
  // `inside-selection:[&>svg]:text-current!`: el ítem de menú resaltado pinta todo `svg` de adentro
  // de `on-selection` con un selector más fuerte que el de acá, y un ícono blanco sobre un badge
  // ámbar no se ve. El `!` solo vale adentro de una selección.
  "inline-flex w-fit shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-tag text-footnote whitespace-nowrap [&>svg]:pointer-events-none [&>svg]:size-3 inside-selection:[&>svg]:text-current!",
  {
    variants: {
      variant: { solid: "", subtle: "" },
      color: {
        gray: cn("bg-gray-700", inkBlack),
        // El brand es el color de la selección: adentro de un ítem seleccionado se invierte, o
        // desaparecería. Los demás colores traen su tinta y se leen igual sobre el acento, como
        // las etiquetas del Finder en una fila seleccionada.
        brand: "bg-brand-700 text-brand-contrast [--sf-tag-press:rgb(0_0_0/0.25)] inside-selection:bg-on-selection inside-selection:text-selection",
        red: cn("bg-red-800", inkWhite),
        amber: cn("bg-amber-700", inkBlack),
        green: cn("bg-green-700", inkBlack),
        blue: cn("bg-blue-800", inkWhite),
        teal: cn("bg-teal-700", inkBlack),
        purple: cn("bg-purple-700", inkWhite),
        pink: cn("bg-pink-800", inkWhite),
      },
      size: { sm: "h-5 px-1.5", md: "h-6 px-2" },
    },
    defaultVariants: { variant: "solid", color: "gray", size: "md" },
  }
)

// Pasa por cn() (tailwind-merge): usada sobre <a>/<Link>, la clase de la variante tiene que ganarle a la base.
export const badgeVariants = (props?: Parameters<typeof badgeVariantsBase>[0]) => cn(badgeVariantsBase(props))

/**
 * El `-700` de cada paleta, para un punto de estado suelto (fuera de un Badge).
 *
 * El `dot` del Badge ya no lo usa (2.0): sobre el relleno sólido, un punto del mismo color no se
 * veía, y va en la tinta (`bg-current`).
 */
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
