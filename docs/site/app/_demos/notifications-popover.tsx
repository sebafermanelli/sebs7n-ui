"use client"

import { NotificationsPopover, type NotificationItem } from "sebs7n-ui/notifications-popover"
import { Toolbar } from "sebs7n-ui/toolbar"
import { useState } from "react"

const NOTIFICATIONS: NotificationItem[] = [
  { id: "n-1", title: "Factura F-0042 vencida", description: "Acme S.A. · US$ 1.200", time: "hace 5 min", tone: "red" },
  { id: "n-2", title: "Cobro recibido", description: "Globex SRL pagó F-0039", time: "hace 2 h", tone: "green" },
  { id: "n-3", title: "Factura F-0045 por vencer", description: "Vence en 3 días", time: "ayer", tone: "amber" },
]

/**
 * En una barra
 * La campana lleva el contador y su nombre dice el número («Avisos, 3 sin leer»). Abrir el popover no marca nada: «Marcar todas como leídas» sí.
 */
export function InToolbar() {
  return (
    <Toolbar aria-label="Facturación" className="w-full max-w-md">
      <span className="flex-1 px-2 text-headline text-label">Facturas</span>
      <NotificationsPopover items={NOTIFICATIONS} />
    </Toolbar>
  )
}

/**
 * Leídos de la app
 * Con `read` y `onReadChange` los ids leídos los lleva la app: acá se muestran debajo, pero es donde se guardarían en el servidor.
 */
export function Controlled() {
  const [read, setRead] = useState<string[]>(["n-2"])
  return (
    <div className="flex items-center gap-3">
      <NotificationsPopover items={NOTIFICATIONS} onReadChange={setRead} read={read} />
      <span className="text-callout text-label-secondary">Leídos: {read.join(", ") || "ninguno"}</span>
    </div>
  )
}

/**
 * Sin avisos
 * La lista vacía lo dice y «Marcar todas» queda apagado.
 */
export function Empty() {
  return <NotificationsPopover items={[]} />
}
