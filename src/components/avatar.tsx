"use client"

import { Avatar as AvatarPrimitive } from "@base-ui/react/avatar"

import { cn, type WithClassName } from "../lib/utils.js"

type AvatarProps = WithClassName<AvatarPrimitive.Root.Props> & {
  /** Los de iCloud (catálogo §2.18): `sm` 28 (barra global), `md` 32 (listas), `lg` 40, `xl` 80 (ficha). */
  size?: "sm" | "md" | "lg" | "xl"
}

function Avatar({ className, size = "md", ...props }: AvatarProps) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      data-size={size}
      className={cn(
        "group/avatar relative inline-flex shrink-0 overflow-hidden rounded-full select-none",
        "data-[size=sm]:size-7 data-[size=md]:size-8 data-[size=lg]:size-10 data-[size=xl]:size-20",
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

type AvatarFallbackProps = WithClassName<AvatarPrimitive.Fallback.Props>

// El monograma de iCloud: iniciales blancas sobre un gradiente gris, sin color por persona. iCloud
// usa un gris más claro; este (#6e6e73 → #48484a) es el más claro en el que el blanco llega a 4,5:1
// (5,07 arriba), porque las iniciales son texto. El tamaño de las letras sigue al del avatar.
function AvatarFallback({ className, ...props }: AvatarFallbackProps) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "flex size-full items-center justify-center bg-linear-to-b from-[#6e6e73] to-[#48484a] font-semibold text-white uppercase",
        "text-callout group-data-[size=sm]/avatar:text-caption group-data-[size=sm]/avatar:font-semibold group-data-[size=lg]/avatar:text-subheadline group-data-[size=lg]/avatar:font-semibold group-data-[size=xl]/avatar:text-title-1",
        className
      )}
      {...props}
    />
  )
}

export { Avatar, AvatarFallback, AvatarImage, type AvatarFallbackProps, type AvatarImageProps, type AvatarProps }
