"use client"

import { CircleCheckIcon, InfoIcon, Loader2Icon, OctagonXIcon, TriangleAlertIcon } from "lucide-react"
import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"

// Íconos en el paso 900 de cada color para llegar a 3:1 sobre background-100.
function Toaster(props: ToasterProps) {
  const { resolvedTheme = "light" } = useTheme()

  return (
    <Sonner
      theme={resolvedTheme as ToasterProps["theme"]}
      position="bottom-right"
      duration={4000}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4 text-green-900" />,
        info: <InfoIcon className="size-4 text-blue-900" />,
        warning: <TriangleAlertIcon className="size-4 text-amber-900" />,
        error: <OctagonXIcon className="size-4 text-red-900" />,
        loading: <Loader2Icon className="size-4 animate-spin text-gray-900" />,
      }}
      toastOptions={{
        classNames: {
          toast: "rounded-xl! border-0! bg-background-100! text-copy-14! text-gray-1000! shadow-modal!",
          title: "text-label-14! font-medium! text-gray-1000!",
          description: "text-copy-13! text-gray-900!",
          actionButton: "rounded-md! bg-gray-1000! text-button-12! text-background-100!",
          cancelButton: "rounded-md! bg-gray-100! text-button-12! text-gray-1000!",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
