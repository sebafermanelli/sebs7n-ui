"use client"

import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { Loader2Icon } from "lucide-react"

import { cn } from "../lib/utils.js"
import { buttonVariants, type ButtonVariantProps } from "../variants/button.js"

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
      {loading && (
        <Loader2Icon
          data-slot="button-spinner"
          aria-hidden="true"
          className="absolute inset-0 m-auto animate-spin"
        />
      )}
      <span className={cn("inline-flex items-center justify-center gap-2", loading && "opacity-0")}>{children}</span>
    </ButtonPrimitive>
  )
}

export { Button, type ButtonProps }
