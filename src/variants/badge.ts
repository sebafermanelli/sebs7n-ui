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
const SOLID_FILL: Record<string, string> = {
  gray: cn("bg-badge-gray", inkWhite),
  // El brand es el color de la selección: adentro de un ítem seleccionado se invierte, o desaparecería. Los demás
  // colores traen su tinta y se leen igual sobre el acento, como las etiquetas del Finder en una fila seleccionada.
  brand: "bg-brand-700 text-brand-contrast [--sf-tag-press:rgb(0_0_0/0.25)] inside-selection:bg-on-selection inside-selection:text-selection",
  red: cn("bg-red-800", inkWhite),
  amber: cn("bg-badge-amber", inkWhite),
  green: cn("bg-badge-green", inkWhite),
  blue: cn("bg-blue-800", inkWhite),
  teal: cn("bg-badge-teal", inkWhite),
  purple: cn("bg-purple-700", inkWhite),
  pink: cn("bg-pink-800", inkWhite),
}

/**
 * El aspecto suave (3.0, el default): el paso `-700` de la paleta al 12 % de fondo y la tinta de la paleta
 * (`text-<color>-ink`, el 60 % de `-900` y el 40 % de `-1000`) como texto. Se lee como un estado y no como un botón
 * de colores; `test/badge-soft-contrast.test.ts` mide la tinta sobre su tinte, en claro y oscuro y con cinco marcas.
 * El gris usa `fill-2` y el texto primario. Dentro de una fila seleccionada (acento sólido) pasa a blanco sobre
 * un velo: el tinte no se vería.
 */
const SOFT_FILL: Record<string, string> = {
  gray: "bg-fill-2 text-label",
  brand: "bg-brand-700/12 text-brand-ink",
  red: "bg-red-700/12 text-red-ink",
  amber: "bg-amber-700/12 text-amber-ink",
  green: "bg-green-700/12 text-green-ink",
  blue: "bg-blue-700/12 text-blue-ink",
  teal: "bg-teal-700/12 text-teal-ink",
  purple: "bg-purple-700/12 text-purple-ink",
  pink: "bg-pink-700/12 text-pink-ink",
}
const SOFT_SELECTED = "inside-selection:bg-on-selection/20 inside-selection:text-on-selection"
const COLORS = Object.keys(SOLID_FILL)
// `count` siempre es sólido; `solid`/`subtle` (variant) con appearance solid también.
const SOLID = COLORS.flatMap((color) => [
  { appearance: "solid" as const, color: color as BadgeColor, className: SOLID_FILL[color] },
  { variant: "count" as const, color: color as BadgeColor, className: SOLID_FILL[color] },
])
const SOFT = COLORS.map((color) => ({ appearance: "soft" as const, variant: ["solid", "subtle"] as ("solid" | "subtle")[], color: color as BadgeColor, className: cn(SOFT_FILL[color], SOFT_SELECTED) }))

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
      ...SOLID,
      ...SOFT,
      { variant: "count", size: "md", className: "min-w-5" },
      { variant: "count", size: "sm", className: "min-w-4" },
    ],
    defaultVariants: { variant: "solid", appearance: "soft", color: "gray", size: "md" },
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
