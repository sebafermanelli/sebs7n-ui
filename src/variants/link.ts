import { cva } from "class-variance-authority"

import { cn } from "../lib/utils.js"

/**
 * Links de texto (los que NO tienen forma de botón: para esos está `buttonVariants`).
 *
 * Cuatro usos, porque un link no se ve igual metido en una frase que suelto debajo de una sección:
 *
 * - `accent`: el link de iCloud (R4): semibold en el acento, sin subrayado en reposo («Find
 *   Devices ›», «account.apple.com ↗» en Settings). Va sobre la página: `brand-900` llega a 4,5:1
 *   ahí con todas las marcas, pero no sobre un relleno, así que nunca pinta fondo. Con el adorno
 *   (› o ↗) es el componente `TextLink`.
 * - `inline`: dentro de una oración (Términos, "Registrate", una nota legal). Va subrayado
 *   siempre — en medio de un párrafo, el subrayado es lo único que lo distingue del texto — con
 *   la línea tenue y el texto fuerte; en hover se refuerza la línea, no el color.
 * - `subtle`: suelto y secundario ("Ver todos los artículos", un email, GitHub, "Volver").
 *   Sin subrayado en reposo: el contexto ya dice que es un link. En hover sube a `gray-1000` y
 *   aparece la línea.
 * - `row`: el nombre clickeable de una fila de tabla o de lista. Igual que el texto de la fila
 *   (para no ensuciar la grilla) y se subraya en hover.
 *
 * Todas: 150ms de la escala, foco visible y `rounded-sm` para que el anillo no apriete el texto.
 */
const linkVariantsBase = cva(
  "rounded-sm underline-offset-4 outline-none transition-control focus-visible:focus-ring",
  {
    variants: {
      variant: {
        accent: "font-semibold text-brand-900 hover:underline",
        inline: "text-label underline decoration-label-tertiary hover:decoration-label",
        subtle: "text-label-secondary hover:text-label hover:underline",
        row: "text-label hover:underline",
      },
      /** Un link suelto con ícono o flecha: alinea el ícono con la línea de texto. */
      icon: { true: "inline-flex items-center gap-1.5", false: "" },
    },
    defaultVariants: { variant: "inline", icon: false },
  }
)

// Pasa por cn() (tailwind-merge): usada sobre <a>/<Link>, la clase de la variante tiene que ganarle
// a la base y el className del llamador a las dos.
export const linkVariants = (props?: Parameters<typeof linkVariantsBase>[0]) => cn(linkVariantsBase(props))
