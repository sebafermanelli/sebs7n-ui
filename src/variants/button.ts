import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../lib/utils.js"

const buttonVariantsBase = cva(
  "relative inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-md border border-transparent whitespace-nowrap outline-none select-none transition-surface focus-visible:focus-ring data-disabled:cursor-not-allowed data-disabled:border-gray-400 data-disabled:bg-gray-100 data-disabled:text-gray-700 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        // Los sólidos llevan `shadow-button` (filo claro arriba, 1px de sombra abajo) y
        // se hunden un pixel al apretar. Deshabilitados vuelven a ser planos. `default`
        // es gray-1000 (blanco en oscuro): lleva la variante invertida, con filo gris.
        default:
          "bg-gray-1000 text-background-100 shadow-button-inverted hover:bg-button-primary-hover active:translate-y-px active:shadow-none data-disabled:shadow-none",
        outline:
          "border-gray-alpha-400 bg-background-100 text-gray-1000 shadow-card hover:bg-gray-alpha-200 active:translate-y-px active:bg-gray-alpha-300 active:shadow-none data-disabled:shadow-none",
        // Misma sombra de 1px que `outline`: los dos son superficies que flotan sobre la página.
        // `ghost` no la lleva porque en reposo no tiene superficie, es texto.
        secondary:
          "bg-gray-100 text-gray-1000 shadow-card hover:bg-gray-200 active:translate-y-px active:bg-gray-300 active:shadow-none data-disabled:shadow-none",
        ghost: "text-gray-1000 hover:bg-gray-alpha-200 active:bg-gray-alpha-300",
        accent:
          "bg-brand-700 text-brand-contrast shadow-button hover:bg-brand-800 active:translate-y-px active:bg-brand-800 active:shadow-none data-disabled:shadow-none",
        destructive:
          "bg-red-800 text-button-error-fg shadow-button hover:bg-button-error-hover active:translate-y-px active:bg-button-error-active active:shadow-none data-disabled:shadow-none",
        link: "h-auto! rounded-sm border-0 px-0! text-brand-900 underline-offset-4 hover:text-brand-1000 hover:underline data-disabled:bg-transparent",
      },
      size: {
        sm: "h-8 px-3 text-button-14",
        md: "h-10 px-4 text-button-14",
        lg: "h-12 px-5 text-button-16 [&_svg:not([class*='size-'])]:size-5",
        "icon-sm": "size-8",
        "icon-md": "size-10",
        "icon-lg": "size-12 [&_svg:not([class*='size-'])]:size-5",
      },
      /**
       * La forma del botón.
       *
       * `pill` es `rounded-full` con un escalón más de padding horizontal: en
       * una curva completa, el texto que empieza donde empezaba en un
       * rectángulo queda pegado al borde.
       *
       * **Solo para los CTA de un hero o de una sección de marketing.** Es la
       * regla de vercel.com, donde los dos CTA del hero son píldoras y el
       * resto del sitio no: mezclar las dos formas en la misma pantalla se ve
       * descuidado, así que en el chrome de una app —nav, tablas, formularios,
       * diálogos— no va nunca.
       */
      shape: {
        default: "",
        pill: "rounded-full",
      },
    },
    compoundVariants: [
      // Un escalón más de aire, por tamaño. `lg` ya es ancho, así que sube
      // menos: a 20px de padding la curva ya no toca el texto.
      { shape: "pill", size: "sm", className: "px-5" },
      { shape: "pill", size: "md", className: "px-6" },
      { shape: "pill", size: "lg", className: "px-7" },
      // Un botón de ícono ya es cuadrado con su propio radio: `pill` no aplica
      // y se ignora, en vez de convertirlo en un círculo que nadie pidió.
      { shape: "pill", size: "icon-sm", className: "rounded-md" },
      { shape: "pill", size: "icon-md", className: "rounded-md" },
      { shape: "pill", size: "icon-lg", className: "rounded-md" },
    ],
    defaultVariants: { variant: "default", size: "md", shape: "default" },
  }
)

// Pasa por cn() (tailwind-merge): usada sobre <a>/<Link>, la clase de la variante tiene que ganarle a la base.
export const buttonVariants = (props?: Parameters<typeof buttonVariantsBase>[0]) => cn(buttonVariantsBase(props))

export type ButtonVariantProps = VariantProps<typeof buttonVariants>

/** La forma del botón: rectángulo del sistema o píldora de marketing. */
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
