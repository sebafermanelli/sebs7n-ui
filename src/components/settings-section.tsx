import * as React from "react"

import { cn } from "../lib/utils.js"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./card.js"

type SettingsGridProps = React.ComponentProps<"div">

/**
 * La grilla de una pantalla de Configuración: una columna por debajo de 48 rem de ancho de la grilla y dos desde ahí.
 * Mide a su contenedor (container queries, en una caja `@container` propia), no a la ventana: con un panel lateral abierto queda en una.
 * Las `SettingsSection` de una fila comparten las filas (subgrid): la cabecera, el cuerpo y
 * el pie quedan alineados con los de la de al lado. Las secciones van como hijas directas.
 */
function SettingsGrid({ className, children, ...props }: SettingsGridProps) {
  return (
    <div data-slot="settings-grid-container" className="@container w-full">
    <div
      data-slot="settings-grid"
      // Sin gap vertical (separaría las filas internas de cada card): el aire entre filas es el
      // margen de cada sección, compensado al final.
      className={cn("-mb-4 grid grid-cols-1 gap-x-4 gap-y-0 @3xl:grid-cols-2 [&>[data-slot=settings-section]]:mb-4", className)}
      {...props}
    >
      {children}
    </div>
    </div>
  )
}

type SettingsSectionProps = Omit<React.ComponentProps<"section">, "title"> & {
  /** El `id` de la card. El título cuelga de él (`{id}-title`) para nombrar la región; sin `id`, se genera uno. */
  id?: string
  /** El título de la sección («Empresa»). Nombra la región. */
  title: React.ReactNode
  /** Una línea debajo del título que dice para qué sirven estos campos. */
  description?: React.ReactNode
  /** Abajo, en el pie de la card: un botón propio de la sección o una nota. */
  footer?: React.ReactNode
  /** Ocupa las dos columnas cuando la grilla las tiene (desde 48 rem) (una zona de arrastre, una tabla). */
  wide?: boolean
}

/**
 * Una sección de una pantalla de Configuración: una `Card` con su cabecera (título y descripción),
 * su cuerpo con los campos a lo ancho y, si hace falta, un pie. Es una región nombrada por el
 * título. Va dentro de una `SettingsGrid`.
 */
function SettingsSection({ className, id, title, description, footer, wide, children, ...props }: SettingsSectionProps) {
  const generated = React.useId()
  const titleId = `${id ?? generated}-title`
  return (
    <Card
      role="region"
      aria-labelledby={titleId}
      id={id}
      data-slot="settings-section"
      className={cn(
        // 24 en vez de los 20 de `Card`: los campos llevan hints y checks que, con 20, rozaban el borde de abajo.
        // El cuerpo (`CardContent`) conserva `p-(--card-spacing)` entero: el mismo aire arriba, abajo y a los costados.
        "row-span-3 grid grid-cols-[minmax(0,1fr)] grid-rows-subgrid gap-0 [&>*]:min-w-0 [--card-spacing:--spacing(6)] [&>[data-slot=card-header]]:content-start",
        wide && "@3xl:col-span-2",
        className
      )}
      {...(props as React.ComponentProps<"div">)}
    >
      <CardHeader>
        <CardTitle id={titleId}>{title}</CardTitle>
        {description != null && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="flex flex-col gap-5">{children}</CardContent>
      {footer != null && <CardFooter className="pb-(--card-spacing)">{footer}</CardFooter>}
    </Card>
  )
}

export { SettingsGrid, SettingsSection, type SettingsGridProps, type SettingsSectionProps }
