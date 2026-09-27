import type * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../lib/utils.js"

// Fondo neutro: la variante solo cambia la franja izquierda (700) y el ícono (900, para llegar a 3:1).
//
// Es `glass-control` y no `glass`: alfa, sin blur. Un Alert no flota —nada le pasa por debajo—
// y su lugar más común es adentro de una Card, arriba de un formulario. Como vidrio, ahí era
// vidrio sobre vidrio: el segundo solo desenfoca lo que pintó el primero.
const alertVariants = cva(
  // La franja de color de las variantes es un pseudo-elemento y no un `box-shadow: inset`, que
  // era lo que había: la sombra es una sola propiedad, y con la franja adentro no quedaba lugar
  // para `shadow-card`.
  //
  // Es una píldora que flota ADENTRO de la superficie, a 8px del borde, y no una franja pegada a
  // él. Pegada (`left-0`) funcionaba con el radio de 12px de Geist; con el de 20 la esquina se
  // curva por debajo de la franja y sus puntas quedaban afuera del contorno. A 8px del borde y
  // 12 de arriba y de abajo entra en cualquier radio: con 20px la curva se mete 1,7px a esa
  // altura, y con 32 —el máximo que admite un alert de dos líneas—, 7.
  "group/alert relative grid w-full gap-0.5 rounded-surface border border-gray-alpha-400 glass-control py-3 pr-4 pl-5 text-left text-copy-14 shadow-card has-[>svg]:grid-cols-[auto_1fr] has-[>svg]:gap-x-3 *:[svg]:row-span-2 *:[svg]:mt-0.5 *:[svg:not([class*='size-'])]:size-4 before:pointer-events-none before:absolute before:inset-y-3 before:left-2 before:w-1 before:rounded-full before:bg-transparent",
  {
    variants: {
      variant: {
        neutral: "*:[svg]:text-gray-900",
        brand: "before:bg-brand-700 *:[svg]:text-brand-900",
        success: "before:bg-green-700 *:[svg]:text-green-900",
        warning: "before:bg-amber-700 *:[svg]:text-amber-900",
        error: "before:bg-red-700 *:[svg]:text-red-900",
      },
    },
    defaultVariants: { variant: "neutral" },
  }
)

function Alert({ className, variant, ...props }: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return <div data-slot="alert" role="alert" className={cn(alertVariants({ variant }), className)} {...props} />
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn("text-label-14 font-medium text-gray-1000 group-has-[>svg]/alert:col-start-2", className)}
      {...props}
    />
  )
}

function AlertDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn("text-copy-14 text-gray-900 [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-gray-1000", className)}
      {...props}
    />
  )
}

export { Alert, AlertDescription, AlertTitle }
