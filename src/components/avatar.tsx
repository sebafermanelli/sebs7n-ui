"use client"

import { Avatar as AvatarPrimitive } from "@base-ui/react/avatar"

import { cn } from "../lib/utils.js"

type AvatarProps = Omit<AvatarPrimitive.Root.Props, "className"> & {
  className?: string
  size?: "sm" | "md" | "lg"
}

function Avatar({ className, size = "md", ...props }: AvatarProps) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      data-size={size}
      className={cn(
        "group/avatar relative inline-flex shrink-0 overflow-hidden rounded-full select-none",
        "data-[size=sm]:size-6 data-[size=md]:size-8 data-[size=lg]:size-10",
        className
      )}
      {...props}
    />
  )
}

/**
 * La foto. El `alt` es **obligatorio y explícito**, incluso vacío.
 *
 * Un `<img>` sin `alt` lo anuncian los lectores leyendo la URL del archivo:
 * «a-v-a-t-a-r-guion-3-4-f-2 punto j-p-g». Un `alt=""` lo saca del árbol y deja
 * que nombre el contexto —lo correcto cuando al lado ya está el nombre de la
 * persona, que es el caso más común—. Las dos decisiones son válidas; la que no
 * lo es es no haber decidido, y por eso el tipo obliga a escribir una.
 */
type AvatarImageProps = Omit<AvatarPrimitive.Image.Props, "className" | "alt"> & {
  className?: string
  /** El texto alternativo. `""` es la respuesta correcta cuando el nombre ya está al lado. */
  alt: string
}

function AvatarImage({ className, ...props }: AvatarImageProps) {
  return <AvatarPrimitive.Image data-slot="avatar-image" className={cn("size-full object-cover", className)} {...props} />
}

type AvatarFallbackProps = Omit<AvatarPrimitive.Fallback.Props, "className"> & { className?: string }

// Sin color por persona: siempre gris.
function AvatarFallback({ className, ...props }: AvatarFallbackProps) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn("flex size-full items-center justify-center bg-gray-200 text-label-12 text-gray-900 uppercase", className)}
      {...props}
    />
  )
}

export { Avatar, AvatarFallback, AvatarImage, type AvatarFallbackProps, type AvatarImageProps, type AvatarProps }
