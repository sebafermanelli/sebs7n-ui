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

type AvatarImageProps = Omit<AvatarPrimitive.Image.Props, "className"> & { className?: string }

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

export { Avatar, AvatarFallback, AvatarImage, type AvatarProps }
