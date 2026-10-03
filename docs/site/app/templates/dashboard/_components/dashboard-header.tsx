"use client"

import Link from "next/link"
import { ArrowLeftIcon } from "lucide-react"
import { useMemo } from "react"
import { AiButton, AiIcon } from "sebs7n-ui/ai-button"
import { DropdownMenuItem } from "sebs7n-ui/dropdown-menu"
import { NotificationsPopover } from "sebs7n-ui/notifications-popover"
import { UserMenu } from "sebs7n-ui/user-menu"
import { buttonVariants } from "sebs7n-ui/variants/button"

import { notificationsOf } from "../_data/derive"
import { formatDayMonth } from "../_lib/format"
import { GALLERY_PATH, LOGIN_PATH, SETTINGS_PATH } from "../_lib/routes"
import { useInvoicesStore } from "../_state/invoices-context"

// El contenido de la barra global: el alto, el fondo y el borde los pone `AppShell` (prop `header`).
// `compact` es la del teléfono (`mobileBar`): al lado de la hamburguesa entran el nombre y el avatar.
// El tema no va aparte: `UserMenu` ya trae su fila. Los avisos y el menú de usuario van juntos a la derecha.
export function DashboardHeader({ compact = false, assistant }: { compact?: boolean; assistant?: { open: boolean; toggle: () => void } }) {
  const { invoices, readIds, markRead } = useInvoicesStore()
  // Los avisos salen de las facturas; el paquete pinta la campana, el popover y el «leído».
  const items = useMemo(
    () => notificationsOf(invoices).map((notification) => ({ id: notification.id, title: notification.title, description: notification.description, time: formatDayMonth(notification.date), tone: notification.tone })),
    [invoices]
  )
  return (
    <>
      <div className="flex min-w-0 items-center gap-2">
        {!compact && GALLERY_PATH && (
          <>
            <Link className={buttonVariants({ variant: "plain", size: "sm" })} href={GALLERY_PATH}>
              <ArrowLeftIcon />
              Templates
            </Link>
            <span aria-hidden="true" className="text-label-tertiary">
              /
            </span>
          </>
        )}
        <span className="truncate text-callout font-medium text-label">Acme Facturación</span>
      </div>

      {/* En su caja: el trigger de `UserMenu` ocupa todo el ancho que le den (es la fila del sidebar). */}
      <div className="ml-auto flex shrink-0 items-center gap-1">
        {assistant &&
          (compact ? (
            <AiButton aria-expanded={assistant.open} aria-label="Preguntar a la IA" onClick={assistant.toggle} size="icon-sm">
              <AiIcon />
            </AiButton>
          ) : (
            <AiButton aria-expanded={assistant.open} aria-keyshortcuts="Meta+J Control+J" onClick={assistant.toggle} size="sm">
              <AiIcon />
              Preguntar a la IA
            </AiButton>
          ))}
        <NotificationsPopover items={items} onReadChange={markRead} read={readIds} />
        <UserMenu
          align="end"
          collapsed={compact}
          signOut={<DropdownMenuItem render={<Link href={LOGIN_PATH} />}>Cerrar sesión</DropdownMenuItem>}
          user={{ name: "Administración", email: "admin@acme.com" }}
        >
          <DropdownMenuItem render={<Link href={SETTINGS_PATH} />}>Perfil y equipo</DropdownMenuItem>
          <DropdownMenuItem render={<Link href={SETTINGS_PATH} />}>Preferencias de facturación</DropdownMenuItem>
        </UserMenu>
      </div>
    </>
  )
}
