import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../lib/utils.js"

const buttonVariantsBase = cva(
  "relative inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-control border border-transparent whitespace-nowrap outline-none select-none transition-surface focus-visible:focus-ring data-disabled:cursor-not-allowed data-disabled:border-separator data-disabled:bg-fill-1 data-disabled:text-label-tertiary [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        // Planos, como en iCloud (2.0): sin sombra, sin brillo y sin hundirse al apretar; el
        // estado lo dice el fondo. `default` es el label primario (negro en claro, blanco en
        // oscuro) con el texto del color de la superficie.
        default:
          "bg-label text-surface hover:bg-button-primary-hover",
        // `outline`: borde y sin fondo. iCloud no tiene botón con borde (R4 decide si queda); vive adentro de una
        // superficie que ya lo tiene.
        outline:
          "border-separator-strong bg-transparent text-label hover:bg-fill-1 active:bg-fill-2",
        // El gris de iCloud: `fill-2` en reposo y `fill-3` con el puntero, el hover de un botón
        // en la barra global. `ghost` en reposo no tiene superficie: es texto.
        secondary:
          "bg-fill-2 text-label hover:bg-fill-3 active:bg-fill-3",
        ghost: "text-label hover:bg-fill-2 active:bg-fill-3",
        accent:
          "bg-brand-700 text-brand-contrast hover:bg-brand-800 active:bg-brand-800 focus-visible:focus-ring-inverse",
        destructive:
          "bg-red-800 text-button-error-fg hover:bg-button-error-hover active:bg-button-error-active focus-visible:focus-ring-inverse [--sf-focus-inverse:var(--sf-button-error-fg)]",
        link: "h-auto! rounded-sm border-0 px-0! text-brand-900 underline-offset-4 hover:text-brand-1000 hover:underline data-disabled:bg-transparent",
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
        // diálogo, 36 el de la barra global. El de 40 lleva el glifo de 20.
        "icon-sm": "size-7",
        "icon-md": "size-9",
        "icon-lg": "size-10 [&_svg:not([class*='size-'])]:size-5",
      },
      /**
       * La forma del botón.
       *
       * Desde 2.0 el botón es el rectángulo de iCloud (`rounded-control`, 8 px) en todas las
       * formas: de 1.0 a 1.x era una cápsula, y en iCloud no hay controles en cápsula.
       *
       * `pill` suma un escalón de padding horizontal, para los CTA de un hero. `rect` queda por
       * compatibilidad: ya es lo mismo que `default`.
       */
      shape: {
        default: "",
        pill: "",
        rect: "rounded-control",
      },
    },
    compoundVariants: [
      // El área táctil de 44 va en todos menos en `link`: ese es texto adentro de un párrafo, y un
      // `::after` de 44 px taparía la línea de arriba y la de abajo. Va acá y no en la base porque
      // una clase de la base no se puede sacar desde una variante.
      {
        variant: ["default", "outline", "secondary", "ghost", "accent", "destructive"],
        className: "touch-target",
      },
      // Un escalón más de aire, por tamaño. `lg` ya es ancho, así que sube
      // menos: a 20px de padding la curva ya no toca el texto.
      { shape: "pill", size: "sm", className: "px-4" },
      { shape: "pill", size: "md", className: "px-5" },
      { shape: "pill", size: "lg", className: "px-6" },
    ],
    defaultVariants: { variant: "default", size: "md", shape: "default" },
  }
)

// Pasa por cn() (tailwind-merge): usada sobre <a>/<Link>, la clase de la variante tiene que ganarle a la base.
export const buttonVariants = (props?: Parameters<typeof buttonVariantsBase>[0]) => cn(buttonVariantsBase(props))

export type ButtonVariantProps = VariantProps<typeof buttonVariants>

/** La forma del botón: la del sistema, con más aire (`pill`) o `rect` (igual que la del sistema). */
export type ButtonShape = NonNullable<ButtonVariantProps["shape"]>

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
