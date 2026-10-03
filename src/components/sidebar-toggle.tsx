"use client"

import * as React from "react"
import { PanelLeftIcon } from "lucide-react"

import { defined } from "../internal/defined.js"
import { mergeRefs } from "../internal/merge-refs.js"
import { AppShellContext, SidebarInSheetContext, useSidebarContext } from "../internal/shell-context.js"
import { useLabels } from "../lib/labels.js"
import { cn } from "../lib/utils.js"
import { Button } from "./button.js"
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip.js"

type SidebarToggleLabels = {
  /** El nombre del botón, fijo: «Barra lateral». Si está desplegada o no lo dice `aria-expanded`. */
  toggle: string
  /** El tooltip con la barra desplegada: «Plegar barra lateral». */
  collapse: string
  /** El tooltip con la barra plegada. */
  expand: string
}

/**
 * Los textos por defecto. No están en `defaultLabels`: el barrel está en su tope y este componente va
 * solo por subpath (las claves son opcionales en `Labels["sidebar"]`).
 */
const sidebarToggleLabels: SidebarToggleLabels = {
  toggle: "Barra lateral",
  collapse: "Plegar barra lateral",
  expand: "Desplegar barra lateral",
}

type SidebarToggleProps = Omit<React.ComponentProps<typeof Button>, "size" | "variant" | "loading" | "children" | "onClick"> & {
  /** Plegado o no. Sin esta prop, lo que diga el `Sidebar` de afuera (`collapsed`). */
  collapsed?: boolean
  /** Avisa el estado nuevo al hacer clic (sin esta prop, dentro de un `AppShell` pliega el sidebar del shell). Guardarlo (cookie, `localStorage`) es de la app. */
  onCollapsedChange?: (collapsed: boolean) => void
  labels?: Partial<SidebarToggleLabels>
}

/**
 * El botón que pliega y despliega el `Sidebar`, como el de la lista de fuentes de Drive y Mail de
 * iCloud: el botón de ícono `plain` de 28 con el panel, arriba, en el `SidebarHeader`, a la derecha de
 * la marca. Plegado, queda primero y centrado en la columna de íconos.
 *
 * El nombre es fijo («Barra lateral»): `aria-expanded` dice si está desplegado, y cambiar el nombre con
 * el estado hacía que el lector dijera las dos cosas. El tooltip sí dice la acción («Plegar barra
 * lateral»). `aria-controls` apunta al `id` del `Sidebar` (si lo tiene; si no, no va) o al que se pase. Adentro del Sheet del teléfono no se dibuja: ahí no hay nada que
 * plegar. El atajo (⌘B, `aria-keyshortcuts`) lo escucha la app.
 */
function SidebarToggle({
  collapsed: collapsedProp,
  onCollapsedChange,
  labels: labelsProp,
  className,
  "aria-controls": ariaControls,
  ref: refProp,
  ...props
}: SidebarToggleProps) {
  const labels = { ...sidebarToggleLabels, ...defined(useLabels().sidebar), ...defined(labelsProp) }
  const sidebar = useSidebarContext()
  const inSheet = React.useContext(SidebarInSheetContext)
  const shell = React.useContext(AppShellContext)
  const collapsed = collapsedProp ?? sidebar?.collapsed ?? false
  const ref = React.useRef<HTMLButtonElement>(null)
  const buttonRef = React.useMemo(() => mergeRefs(ref, refProp), [refProp])
  // El `id` del Sidebar de afuera, leído al montar: el Sidebar no lo publica en su contexto (está en el
  // barrel, que está en su tope) y un `aria-controls` a nada es peor que ninguno.
  const [sidebarId, setSidebarId] = React.useState<string | undefined>(undefined)
  React.useEffect(() => {
    setSidebarId(ref.current?.closest<HTMLElement>("[data-slot=sidebar]")?.id || undefined)
  }, [])
  if (inSheet) return null
  const hint = collapsed ? labels.expand : labels.collapse
  return (
    <Tooltip>
      <TooltipTrigger
        data-slot="sidebar-toggle"
        render={
          <Button
            {...props}
            ref={buttonRef}
            aria-controls={ariaControls ?? sidebarId}
            aria-expanded={!collapsed}
            aria-label={props["aria-label"] ?? labels.toggle}
            className={cn("ms-auto shrink-0 group-data-collapsed/sidebar:order-first group-data-collapsed/sidebar:ms-0", className)}
            onClick={() => (onCollapsedChange ?? shell?.setSidebarCollapsed)?.(!collapsed)}
            size="icon-sm"
            type="button"
            variant="plain"
          >
            <PanelLeftIcon />
          </Button>
        }
      />
      <TooltipContent>{hint}</TooltipContent>
    </Tooltip>
  )
}

export { SidebarToggle, sidebarToggleLabels, type SidebarToggleLabels, type SidebarToggleProps }
