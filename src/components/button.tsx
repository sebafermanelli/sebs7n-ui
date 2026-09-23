"use client"

import { Button as ButtonPrimitive } from "@base-ui/react/button"

import { cn } from "../lib/utils.js"
import { buttonVariants, type ButtonVariantProps } from "../variants/button.js"
import { Spinner } from "./spinner.js"

type ButtonProps = Omit<ButtonPrimitive.Props, "className"> &
  ButtonVariantProps & {
    className?: string
    loading?: boolean
  }

function Button({ className, variant, size, shape, loading = false, onClick, children, ...props }: ButtonProps) {
  return (
    <ButtonPrimitive
      data-slot="button"
      data-loading={loading ? "" : undefined}
      aria-busy={loading || undefined}
      aria-disabled={loading || undefined}
      onClick={loading ? (event) => event.preventDefault() : onClick}
      className={cn(buttonVariants({ variant, size, shape }), loading && "cursor-progress", className)}
      {...props}
    >
      {/* El mismo Spinner del sistema, sin nombre accesible: quien anuncia la espera es el
          aria-busy del botón, no el ícono. 20px solo en los tamaños grandes, como antes. */}
      {loading && (
        <Spinner
          data-slot="button-spinner"
          size={size === "lg" || size === "icon-lg" ? "md" : "sm"}
          className="absolute inset-0 m-auto"
        />
      )}
      <span className={cn("inline-flex items-center justify-center gap-2", loading && "opacity-0")}>{children}</span>
    </ButtonPrimitive>
  )
}

export { Button, type ButtonProps }
