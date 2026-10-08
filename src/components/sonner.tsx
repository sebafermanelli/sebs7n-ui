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
        success: <CircleCheckIcon className="size-4 text-success-ink" />,
        info: <InfoIcon className="size-4 text-info-ink" />,
        warning: <TriangleAlertIcon className="size-4 text-warning-ink" />,
        error: <OctagonXIcon className="size-4 text-danger-ink" />,
        loading: <Loader2Icon className="size-4 animate-spin text-label-secondary" />,
      }}
      toastOptions={{
        classNames: {
          // Opaco, como un popover de iCloud: flota sobre cualquier cosa y se tiene que leer igual.
          toast: "rounded-menu! border-0! bg-surface! text-callout! text-label! shadow-modal!",
          title: "text-callout! font-semibold! text-label!",
          description: "text-callout! text-label-secondary!",
          // La acción es el primario de iCloud (acento sólido) y cancelar el gris, como los botones de R4.
          actionButton: "rounded-control! bg-brand-700! text-callout! text-brand-contrast!",
          cancelButton: "rounded-control! bg-fill-2! text-callout! text-label!",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
