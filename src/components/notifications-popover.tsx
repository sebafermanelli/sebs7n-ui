"use client"

import * as React from "react"
import { BellIcon } from "lucide-react"

import { defined } from "../internal/defined.js"
import { useLabels, type Labels } from "../lib/labels.js"
import { cn } from "../lib/utils.js"
import type { BadgeColor } from "../variants/badge.js"
import { Badge } from "./badge.js"
import { Button } from "./button.js"
import { CountBadge, countLabel } from "./count-badge.js"
import { List, ListRow } from "./list-row.js"
import { Popover, PopoverContent, PopoverDescription, PopoverHeader, PopoverTitle, PopoverTrigger } from "./popover.js"

type NotificationsLabels = NonNullable<Labels["notifications"]>

/** Los textos por defecto (no están en `defaultLabels`: el componente es solo por subpath). */
const notificationsLabels: NotificationsLabels = {
  title: "Avisos",
  unreadDetail: "sin leer",
  upToDate: "Estás al día",
  empty: "Todavía no hay avisos.",
  markAllRead: "Marcar todas como leídas",
  unreadBadge: "Nueva",
}

type NotificationItem = {
  /** Identifica el aviso; es lo que se guarda como leído. */
  id: string
  /** La primera línea. */
  title: React.ReactNode
  /** El detalle en gris debajo del título. */
  description?: React.ReactNode
  /** Cuándo pasó («hace 5 min», «3 ene»): ya formateado, en el idioma de la app. */
  time?: React.ReactNode
  /** El color del punto de un aviso sin leer. Por defecto, `blue`. */
  tone?: BadgeColor
}

type NotificationsPopoverProps = {
  /** Los avisos, del más nuevo al más viejo. */
  items: readonly NotificationItem[]
  /** Los `id` leídos, controlado: va con `onReadChange`. */
  read?: readonly string[]
  /** Los `id` leídos al montar, sin controlar. */
  defaultRead?: readonly string[]
  /** Avisa los `id` leídos cuando cambian (al marcar todas): el total, no solo lo nuevo. */
  onReadChange?: (read: string[]) => void
  /** El nombre del botón de la campana, sin el contador: «Avisos». Por defecto, `labels.title`. */
  label?: string
  /** Alineación del popover respecto de la campana. Por defecto, `end`. */
  align?: "start" | "center" | "end"
  /** Clases del botón de la campana. */
  className?: string
  /** Clases del contenido del popover. */
  contentClassName?: string
  /** Textos: `title`, `unreadDetail`, `upToDate`, `empty`, `markAllRead` y `unreadBadge`. Por defecto, `notificationsLabels`. */
  labels?: Partial<NotificationsLabels>
}

/**
 * La campana de la barra con el contador de lo no leído y un popover con la lista de avisos. Leer
 * es una acción: abrir el popover no marca nada, y «Marcar todas como leídas» queda a la vista. El
 * nombre del botón dice el número con todas las letras («Avisos, 3 sin leer»).
 *
 * El componente no sabe de dónde salen los avisos: la app los pasa en `items`. Los leídos son de
 * la app si pasa `read` + `onReadChange` (para guardarlos en el servidor), o del componente si no.
 * Un aviso sin leer se marca con un punto de color, el texto en negrita **y** la etiqueta «Nueva»:
 * el color nunca es el único dato.
 */
function NotificationsPopover({ items, read, defaultRead = [], onReadChange, label, align = "end", className, contentClassName, labels: labelsProp }: NotificationsPopoverProps) {
  const labels = { ...notificationsLabels, ...useLabels().notifications, ...defined(labelsProp) }
  const [own, setOwn] = React.useState<readonly string[]>(defaultRead)
  const readIds = read ?? own
  const unread = items.filter((item) => !readIds.includes(item.id))
  const name = label ?? labels.title

  const markAllRead = () => {
    const next = [...new Set([...readIds, ...items.map((item) => item.id)])]
    if (read === undefined) setOwn(next)
    onReadChange?.(next)
  }

  return (
    <Popover>
      <PopoverTrigger render={<Button aria-label={countLabel(name, unread.length, labels.unreadDetail)} className={className} size="icon-sm" variant="plain" />}>
        <BellIcon />
        <CountBadge count={unread.length} />
      </PopoverTrigger>
      <PopoverContent align={align} className={cn("w-96", contentClassName)}>
        <PopoverHeader>
          <PopoverTitle>{name}</PopoverTitle>
          <PopoverDescription>{unread.length > 0 ? `${unread.length} ${labels.unreadDetail}` : labels.upToDate}</PopoverDescription>
        </PopoverHeader>
        {items.length === 0 ? (
          <p className="text-callout text-label-secondary">{labels.empty}</p>
        ) : (
          <List aria-label={name}>
            {items.map((item) => {
              const isUnread = !readIds.includes(item.id)
              return (
                <ListRow
                  description={item.time != null && item.description != null ? <>{item.time} · {item.description}</> : (item.time ?? item.description)}
                  dot={isUnread ? (item.tone ?? "blue") : undefined}
                  key={item.id}
                  title={<span className={isUnread ? "font-semibold" : undefined}>{item.title}</span>}
                  trailing={
                    isUnread ? (
                      <Badge size="sm">{labels.unreadBadge}</Badge>
                    ) : undefined
                  }
                />
              )
            })}
          </List>
        )}
        <Button className="self-start" disabled={unread.length === 0} onClick={markAllRead} variant="plain">
          {labels.markAllRead}
        </Button>
      </PopoverContent>
    </Popover>
  )
}

export { NotificationsPopover, notificationsLabels, type NotificationItem, type NotificationsLabels, type NotificationsPopoverProps }
