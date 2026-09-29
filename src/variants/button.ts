import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../lib/utils.js"

const buttonVariantsBase = cva(
  // Deshabilitado = opacidad .4 y nada más, como los botones de iCloud: el botón apagado sigue
  // siendo el mismo botón, con su color. Los estados inactivos quedan fuera de WCAG 1.4.3.
  "relative inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-control border border-transparent whitespace-nowrap outline-none select-none transition-surface focus-visible:focus-ring data-disabled:cursor-not-allowed data-disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      // Los botones de iCloud (R4, medidos en su CSS): la jerarquía es acento sólido → gris →
      // texto de acento → ícono. No hay botón con borde ni rojo sólido. Planos: sin sombra ni
      // hundimiento; el estado lo dice el fondo.
      variant: {
        // El primario (`block.primary`): el acento sólido con su color de contraste.
        default: "bg-brand-700 text-brand-contrast hover:bg-brand-800 active:bg-brand-800 focus-visible:focus-ring-inverse",
        /** @deprecated Desde 2.0 es lo mismo que `default` (el primario de iCloud); se va en 3.0. */
        accent: "bg-brand-700 text-brand-contrast hover:bg-brand-800 active:bg-brand-800 focus-visible:focus-ring-inverse",
        // El gris (`block.secondary`): `fill-2` y `fill-3` con el puntero.
        secondary: "bg-fill-2 text-label hover:bg-fill-3 active:bg-fill-3",
        // El `push` de iCloud: sin fondo, texto semibold en el acento, `fill-2` con el puntero y el
        // tinte de la marca al apretar. El texto va en `brand-ink` porque el hover es un relleno
        // (brand-900 no llega a 4,5:1 sobre fill-2 en claro con todas las marcas); el glifo en
        // `brand-900`, el azul de la toolbar de Drive (3:1). Ver test/contrast.test.ts.
        plain: "font-semibold text-brand-ink hover:bg-fill-2 active:bg-highlight [&_svg]:text-brand-900",
        // El `push neutral`: lo mismo con el texto `label` (la X de un diálogo, la barra global).
        ghost: "text-label hover:bg-fill-2 active:bg-fill-3",
        // `block.secondary.destructive`: gris con el texto rojo. `red-ink` llega a 4,5:1 sobre fill-2
        // y fill-3 en los dos temas.
        destructive: "bg-fill-2 text-red-ink hover:bg-fill-3 active:bg-fill-3",
        // `push.destructive`: el texto rojo sin fondo («Delete», al final de una lista).
        "destructive-plain": "font-semibold text-red-ink hover:bg-fill-2 active:bg-fill-3",
        link: "h-auto! rounded-sm border-0 px-0! text-brand-900 underline-offset-4 hover:text-brand-1000 hover:underline",
      },
      size: {
        // La escala que comparten campos y botones (revisión visual de R1): 28, 36 y 40. 36 es el
        // botón del modal de iCloud y el alto de su search field, así que un botón al lado de un
        // campo del mismo `size` mide lo mismo. Texto 14 e íconos 16 en los tres: iCloud no agranda
        // la letra de un control. Con el dedo el área crece a 44 por `touch-target`.
        sm: "h-7 px-2.5 text-callout",
        md: "h-9 px-3 text-callout",
        lg: "h-10 px-3.5 text-callout",
        // Los de ícono son los de iCloud: 28 el de una barra de herramientas y el de cerrar un
        // diálogo (glifo 16; iCloud 17), 36 el de la barra global (glifo 18) y 40 con el de 20.
        "icon-sm": "size-7",
        "icon-md": "size-9 [&_svg:not([class*='size-'])]:size-4.5",
        "icon-lg": "size-10 [&_svg:not([class*='size-'])]:size-5",
      },
    },
    compoundVariants: [
      // El área táctil de 44 va en todos menos en `link`: ese es texto adentro de un párrafo, y un
      // `::after` de 44 px taparía la línea de arriba y la de abajo. Va acá y no en la base porque
      // una clase de la base no se puede sacar desde una variante.
      {
        variant: ["default", "accent", "secondary", "plain", "ghost", "destructive", "destructive-plain"],
        className: "touch-target",
      },
    ],
    defaultVariants: { variant: "default", size: "md" },
  }
)

// Pasa por cn() (tailwind-merge): usada sobre <a>/<Link>, la clase de la variante tiene que ganarle a la base.
export const buttonVariants = (props?: Parameters<typeof buttonVariantsBase>[0]) => cn(buttonVariantsBase(props))

export type ButtonVariantProps = VariantProps<typeof buttonVariants>

export type ButtonSize = NonNullable<ButtonVariantProps["size"]>

/**
 * Los tamaños cuadrados. Un botón de este tamaño es **solo** el ícono: no hay
 * texto que lo nombre, así que `ButtonProps` le exige `aria-label` o
 * `aria-labelledby`. Están separados del resto para que esa regla se pueda
 * escribir en el tipo y no solo en la documentación.
 */
export type ButtonIconSize = Extract<ButtonSize, `icon-${string}`>

/** Los tamaños con texto: el nombre accesible sale del contenido. */
export type ButtonTextSize = Exclude<ButtonSize, ButtonIconSize>
