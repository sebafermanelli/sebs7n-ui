"use client"

import { CircleCheckIcon, InfoIcon, Loader2Icon, OctagonXIcon, TriangleAlertIcon } from "lucide-react"
import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"

// Íconos en el paso 900 de cada color para llegar a 3:1 sobre background-100.
function Toaster(props: ToasterProps) {
  const { resolvedTheme } = useTheme()

  return (
    <Sonner
      // `resolvedTheme` de next-themes es `string | undefined` y el `theme` de Sonner es una
      // unión cerrada. Se compara en vez de castear: así el default —claro— queda escrito y
      // no depende de que el string que llegue sea uno de los dos que Sonner entiende.
      theme={resolvedTheme === "dark" ? "dark" : "light"}
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
          // `material-popover`: en macOS un aviso es un banner de notificación, que flota sobre
          // cualquier cosa y se tiene que leer igual; el vidrio claro de `glass` dejaba pasar lo de atrás.
          toast: "rounded-surface! border-0! material-popover!text-callout! text-gray-1000! shadow-modal!",
          title: "text-callout! font-medium! text-gray-1000!",
          description: "text-callout! text-gray-900!",
          actionButton: "rounded-full! bg-gray-1000! text-callout! text-background-100!",
          cancelButton: "rounded-full! bg-gray-alpha-200! text-callout! text-gray-1000!",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
