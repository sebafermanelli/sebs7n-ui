"use client"

import { BellIcon, InboxIcon } from "lucide-react"
import { useState } from "react"
import { Button } from "sebs7n-ui/button"
import { CountBadge, countLabel } from "sebs7n-ui/count-badge"
import { Toolbar, ToolbarButton } from "sebs7n-ui/toolbar"

/**
 * En una barra
 * El contador va adentro del botón, arriba a la derecha del ícono. El número lo dice el nombre del botón: «Avisos, 3 sin leer». Con 0 no se dibuja; pasado 99 dice «99+».
 */
export function InToolbar() {
  const [unread, setUnread] = useState(3)
  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <Toolbar aria-label="Facturación">
        <span className="flex-1 px-2 text-headline text-label">Facturas</span>
        <ToolbarButton render={<Button aria-label={countLabel("Pendientes de cobro", 128, "facturas")} size="icon-sm" variant="plain" />}>
          <InboxIcon />
          <CountBadge count={128} />
        </ToolbarButton>
        <ToolbarButton render={<Button aria-label={countLabel("Avisos", unread, "sin leer")} size="icon-sm" variant="plain" />}>
          <BellIcon />
          <CountBadge count={unread} />
        </ToolbarButton>
      </Toolbar>
      <div className="flex gap-2">
        <Button onClick={() => setUnread(unread + 1)} size="sm" variant="secondary">
          Llega un aviso
        </Button>
        <Button onClick={() => setUnread(0)} size="sm" variant="secondary">
          Marcar todos como leídos
        </Button>
      </div>
    </div>
  )
}
