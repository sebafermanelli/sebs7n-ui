"use client"

import * as React from "react"
import { EllipsisIcon } from "lucide-react"

import { Button } from "../components/button.js"

// El menú (DropdownMenu: Base UI Menu + Floating UI, ~35 KB gzip) no viaja con la grilla: un
// `StatGrid` sin acciones no lo necesita, y uno con acciones lo pide después de hidratar.
const StatActionsMenu = React.lazy(() => import("../internal/stat-actions-menu.js"))

type StatActionsProps = { name: string; loading?: boolean; children: React.ReactNode }

/**
 * El botón «…» de una card de `StatGrid`. Arranca como un `Button` común, del mismo tamaño que el
 * disparador del menú (sin salto de layout), y cuando el navegador queda libre pide el menú y lo
 * reemplaza. Si el click llega antes, el menú se abre apenas termina de llegar.
 */
function StatActions({ name, loading, children }: StatActionsProps) {
  const [armed, setArmed] = React.useState(false)
  const [openOnLoad, setOpenOnLoad] = React.useState(false)
  React.useEffect(() => {
    if (typeof requestIdleCallback === "function") {
      const id = requestIdleCallback(() => setArmed(true))
      return () => cancelIdleCallback(id)
    }
    const id = setTimeout(() => setArmed(true), 200)
    return () => clearTimeout(id)
  }, [])

  const placeholder = (
    <Button
      aria-label={name}
      disabled={loading}
      size="icon-sm"
      variant="plain"
      onClick={() => {
        setOpenOnLoad(true)
        setArmed(true)
      }}
    >
      <EllipsisIcon aria-hidden="true" />
    </Button>
  )
  if (!armed) return placeholder
  return (
    <React.Suspense fallback={placeholder}>
      <StatActionsMenu defaultOpen={openOnLoad} loading={loading} name={name}>
        {children}
      </StatActionsMenu>
    </React.Suspense>
  )
}

export { StatActions }
