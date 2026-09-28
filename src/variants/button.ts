import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../lib/utils.js"

const buttonVariantsBase = cva(
  "relative inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full border border-transparent whitespace-nowrap outline-none select-none transition-surface focus-visible:focus-ring data-disabled:cursor-not-allowed data-disabled:border-gray-alpha-400 data-disabled:bg-gray-alpha-100 data-disabled:text-gray-700 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        // Los sólidos llevan `shadow-button` (filo claro arriba, 1px de sombra abajo) y
        // se hunden un pixel al apretar. Deshabilitados vuelven a ser planos. `default`
        // es gray-1000 (blanco en oscuro): lleva la variante invertida, con filo gris.
        default:
          "bg-gray-1000 text-background-100 shadow-button-inverted hover:bg-button-primary-hover active:translate-y-px active:shadow-none data-disabled:shadow-none",
        // `outline` es el botón de vidrio: alfa sin blur, porque casi siempre vive adentro de una
        // superficie que ya lo tiene.
        outline:
          "border-gray-alpha-400 glass-control text-gray-1000 shadow-card hover:bg-gray-alpha-200 active:translate-y-px active:bg-gray-alpha-300 active:shadow-none data-disabled:shadow-none",
        // Misma sombra de 1px que `outline`: los dos son superficies que flotan sobre la página.
        // `ghost` no la lleva porque en reposo no tiene superficie, es texto.
        secondary:
          "bg-gray-alpha-200 text-gray-1000 shadow-card hover:bg-gray-alpha-300 active:translate-y-px active:bg-gray-alpha-500 active:shadow-none data-disabled:shadow-none",
        ghost: "text-gray-1000 hover:bg-gray-alpha-200 active:bg-gray-alpha-300",
        accent:
          "bg-brand-700 text-brand-contrast sheen shadow-button-accent hover:bg-brand-800 active:translate-y-px active:bg-brand-800 active:shadow-none data-disabled:shadow-none",
        destructive:
          "bg-red-800 text-button-error-fg sheen shadow-button hover:bg-button-error-hover active:translate-y-px active:bg-button-error-active active:shadow-none data-disabled:shadow-none",
        // Lo que pide la acción peligrosa de una alerta de macOS: texto rojo sobre un vidrio con
        // tinte rojo. No grita como el rojo sólido: la alerta ya es la advertencia, el botón solo
        // nombra la acción. El texto es la tinta (`-ink`) y no `-900`: sobre el tinte, `-900` no
        // llega a 4,5:1 en claro. El tinte es el mismo que el del Badge (`--sf-tint-*`).
        "destructive-tinted":
          "bg-red-700/(--sf-tint-fill) text-red-ink shadow-card hover:bg-red-700/(--sf-tint-hover) active:translate-y-px active:bg-red-700/(--sf-tint-active) active:shadow-none data-disabled:shadow-none",
        // Lo mismo con el acento: una acción que importa sin ser la principal de la pantalla.
        tinted:
          "bg-brand-700/(--sf-tint-fill) text-brand-ink shadow-card hover:bg-brand-700/(--sf-tint-hover) active:translate-y-px active:bg-brand-700/(--sf-tint-active) active:shadow-none data-disabled:shadow-none",
        link: "h-auto! rounded-sm border-0 px-0! text-brand-900 underline-offset-4 hover:text-brand-1000 hover:underline data-disabled:bg-transparent",
      },
      size: {
        // Densidad de macOS (2.0): 32 px es el botón normal, como el «Push Button» regular de
        // AppKit. Con el dedo el área crece a 44 por `touch-target`, sin cambiar lo que se ve.
        // En `sm` el ícono baja a 14 px: 16 en un botón de 24 se lee como un bloque.
        sm: "h-6 px-2.5 text-body [&_svg:not([class*='size-'])]:size-3.5",
        md: "h-8 px-3 text-body",
        lg: "h-10 px-4 text-body-large [&_svg:not([class*='size-'])]:size-5",
        // El de ícono chico conserva el glifo de 16: es el botón de una barra de herramientas, y
        // ahí el dibujo es todo lo que dice qué hace.
        "icon-sm": "size-6",
        "icon-md": "size-8",
        "icon-lg": "size-10 [&_svg:not([class*='size-'])]:size-5",
      },
      /**
       * La forma del botón.
       *
       * Desde 1.0 el botón es una cápsula: es la forma de los controles de vidrio, y con un
       * radio de 6px el material se leía como un efecto pegado sobre un rectángulo de Geist.
       *
       * `pill` suma un escalón de padding horizontal, para los CTA de un hero. `rect` devuelve
       * el rectángulo (`rounded-control`) para donde una cápsula no entra: una celda de tabla
       * densa, un botón a todo el ancho de un formulario angosto.
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
        variant: ["default", "outline", "secondary", "ghost", "accent", "destructive", "tinted", "destructive-tinted"],
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

/** La forma del botón: cápsula del sistema, píldora de marketing o rectángulo. */
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
