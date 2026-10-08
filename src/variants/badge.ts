import { cva } from "class-variance-authority"

import { cn } from "../lib/utils.js"

export const BADGE_COLORS = ["gray", "brand", "red", "amber", "green", "blue", "teal", "purple", "pink"] as const
export type BadgeColor = (typeof BADGE_COLORS)[number]

/**
 * Las dos tintas de una etiqueta sólida, con el velo del hover de su botón de quitar.
 *
 * La tinta es blanca en los nueve colores (los números están en `test/contrast.test.ts`).
 *
 * `--sf-tag-press` es el hover del botón de quitar del Tag, del lado contrario a la tinta: oscurece
 * bajo la X blanca, así el contraste sube en vez de bajar. Con el `gray-alpha-300` del sistema, en
 * oscuro aclaraba bajo la X blanca.
 */
const inkWhite = "text-white [--sf-tag-press:rgb(0_0_0/0.25)]"

/**
 * El cuerpo de una etiqueta (2.0): la etiqueta del Finder.
 *
 * Relleno sólido, sin borde, sin brillo y sin vidrio, con 4 px de radio (`rounded-tag`). Hasta la
 * fase 3 el default era un tinte con borde (`subtle`): adentro de una tabla densa se leía
 * como un control más, y el color —que es lo que dice el estado— quedaba lavado.
 *
 * La tinta es blanca en los nueve (con dos tintas, una fila de estados se leía mezclada) y el
 * relleno es el mismo en los dos temas: un paso de la paleta donde el color se ve vivo y el blanco
 * llega a 4,5:1, o uno propio del badge donde ningún paso llega:
 *
 * | color  | relleno             |
 * | ------ | ------------------- |
 * | gray   | `badge-gray` (#6e6e73)  |
 * | brand  | `brand-700` con `brand-contrast` (el par del botón `accent`) |
 * | red    | `red-800`           |
 * | amber  | `badge-amber` (#b25e00) |
 * | green  | `badge-green` (#1e8038) |
 * | blue   | `blue-800`          |
 * | teal   | `badge-teal` (#00786c)  |
 * | purple | `purple-700`        |
 * | pink   | `pink-800`          |
 *
 * El rojo, el azul y el rosa van en `-800` porque en `-700` el blanco no llega (3,98, 4,47 y 3,88
 * en el peor tema). El ámbar con blanco es más tostado que el amarillo de la paleta: es lo que
 * pide el contraste.
 *
 * `variant`: `solid` es la etiqueta; `subtle` se acepta por compatibilidad y dibuja lo mismo que
 * `solid`; `count` (R4) es el badge de app de iCloud (§2.18): un círculo de 20 (16 en `sm`), 11 px
 * con cifras tabulares y la sombra de badge, para un número —no leídos, pendientes—.
 *
 * Tamaños (R4): `md` 20, `sm` 16, texto 12 en los dos. Un Badge nunca mide más que un botón `sm`
 * (28) ni que la fila de menú (30) donde vive.
 */
// El relleno y la tinta de cada color son utilidades de `theme.css` (`badge-soft-*`, el aspecto suave; `badge-solid-*`, el sólido de 2.x):
// las clases viajan en el JS como una sola palabra y `badgeVariants()` suelto sobre un `<a>` sigue andando. Como el nombre se arma
// con `appearance` y `color`, el `@source inline()` de `theme.css` las declara para que Tailwind las genere.
// El brand sólido es el color de la selección: adentro de un ítem seleccionado se invierte, o desaparecería; los demás colores traen
// su tinta y se leen igual sobre el acento, como las etiquetas del Finder en una fila seleccionada. El suave pasa a un velo.
const BRAND_SELECTED = "inside-selection:bg-on-selection inside-selection:text-selection"
const SOFT_SELECTED = "inside-selection:bg-on-selection/20 inside-selection:text-on-selection"

const badgeVariantsBase = cva(
  // `inside-selection:[&>svg]:text-current!`: el ítem de menú resaltado pinta todo `svg` de adentro
  // de `on-selection` con un selector más fuerte que el de acá, y un ícono blanco sobre un badge
  // ámbar no se ve. El `!` solo vale adentro de una selección.
  "inline-flex w-fit shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-tag text-footnote whitespace-nowrap [&>svg]:pointer-events-none [&>svg]:size-3 inside-selection:[&>svg]:text-current!",
  {
    variants: {
      variant: { solid: "", subtle: "", count: "rounded-full text-caption tabular-nums shadow-badge" },
      // 3.0: el default es `soft` (fondo tintado al 12 % con la tinta de la paleta, que llega a 4,5:1 sobre su propio tinte);
      // `solid` es el relleno de 2.x, opt-in. `count` siempre es sólido.
      appearance: { soft: "", solid: "" },
      color: { gray: "", brand: "", red: "", amber: "", green: "", blue: "", teal: "", purple: "", pink: "" },
      size: { sm: "h-4 px-1", md: "h-5 px-1.5" },
    },
    compoundVariants: [
      { appearance: "soft", className: SOFT_SELECTED },
      { appearance: "solid", color: "brand", className: BRAND_SELECTED },
      { variant: "count", size: "md", className: "min-w-5" },
      { variant: "count", size: "sm", className: "min-w-4" },
    ],
    defaultVariants: { variant: "solid", appearance: "soft", color: "gray", size: "md" },
  }
)

// Pasa por cn() (tailwind-merge): usada sobre <a>/<Link>, la clase de la variante tiene que ganarle a la base.
export const badgeVariants = (props?: Parameters<typeof badgeVariantsBase>[0]) => {
  // `count` siempre es sólido.
  const appearance = props?.variant === "count" ? "solid" : (props?.appearance ?? "soft")
  return cn(badgeVariantsBase({ ...props, appearance }), `badge-${appearance}-${props?.color ?? "gray"}`)
}

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
