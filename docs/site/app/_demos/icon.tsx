"use client"

import {
  AlertTriangleIcon,
  BellIcon,
  BellRingIcon,
  CheckCircle2Icon,
  DownloadIcon,
  InboxIcon,
  InfoIcon,
  Loader2Icon,
  MailIcon,
  PlusIcon,
  SearchIcon,
  SettingsIcon,
  SparklesIcon,
  Trash2Icon,
  XCircleIcon,
} from "lucide-react"
import { startTransition, useState, ViewTransition } from "react"
import { Badge } from "sebs7n-ui/badge"
import { Button } from "sebs7n-ui/button"
import { EmptyState } from "sebs7n-ui/empty-state"
import { Icon } from "sebs7n-ui/icon"
import { Input } from "sebs7n-ui/input"

/**
 * Tamaños
 * 16, 20 y 24px: los altos de línea del texto del sistema. El trazo escala con el tamaño, como en lucide.
 */
export function Tamanos() {
  return (
    <div className="flex items-end gap-6">
      <div className="flex flex-col items-center gap-2">
        <Icon icon={SettingsIcon} size="sm" />
        <span className="text-label-12 text-gray-900">sm · 16</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Icon icon={SettingsIcon} size="md" />
        <span className="text-label-12 text-gray-900">md · 20</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Icon icon={SettingsIcon} size="lg" />
        <span className="text-label-12 text-gray-900">lg · 24</span>
      </div>
    </div>
  )
}

/**
 * Tonos
 * `current` hereda del texto y es el que va casi siempre. Los otros son para un ícono que habla solo.
 */
export function Tonos() {
  return (
    <div className="grid grid-cols-4 gap-4 sm:grid-cols-7">
      {(
        [
          ["current", SparklesIcon],
          ["muted", SearchIcon],
          ["subtle", SettingsIcon],
          ["brand", SparklesIcon],
          ["success", CheckCircle2Icon],
          ["warning", AlertTriangleIcon],
          ["danger", XCircleIcon],
        ] as const
      ).map(([tone, icon]) => (
        <div className="flex flex-col items-center gap-2" key={tone}>
          <Icon icon={icon} size="lg" tone={tone} />
          <span className="text-label-12 text-gray-900">{tone}</span>
        </div>
      ))}
    </div>
  )
}

/**
 * Al lado de un texto
 * Sin `label`: el texto ya lo dice. El ícono va del mismo color que la palabra, así que el tono queda en `current`.
 */
export function ConTexto() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button>
        <PlusIcon />
        Nueva factura
      </Button>
      <Button variant="outline">
        <DownloadIcon />
        Exportar
      </Button>
      <Button size="icon-md" variant="ghost" aria-label="Configuración">
        <SettingsIcon />
      </Button>
      <Badge color="green">
        <CheckCircle2Icon />
        Pagada
      </Badge>
      <Badge color="amber">
        <AlertTriangleIcon />
        Vence hoy
      </Badge>
    </div>
  )
}

/**
 * Con nombre accesible
 * Cuando el ícono es la única señal —no hay palabra al lado—, `label` lo vuelve una imagen con nombre.
 */
export function ConNombre() {
  const filas = [
    ["Factura 0012", "Pagada", CheckCircle2Icon, "success"],
    ["Factura 0013", "Vence en 3 días", AlertTriangleIcon, "warning"],
    ["Factura 0014", "Rechazada", XCircleIcon, "danger"],
  ] as const
  return (
    <ul className="flex w-full max-w-sm flex-col divide-y divide-gray-400 rounded-xl border border-gray-400 bg-background-100">
      {filas.map(([nombre, estado, icon, tone]) => (
        <li className="flex items-center justify-between gap-3 px-4 py-3 text-copy-14" key={nombre}>
          <span className="text-gray-1000">{nombre}</span>
          <Icon icon={icon} label={estado} tone={tone} />
        </li>
      ))}
    </ul>
  )
}

/**
 * Dentro de un Input
 * Un ícono a la izquierda con padding en el input. `muted` para que no compita con el texto.
 */
export function EnUnInput() {
  return (
    <div className="relative w-full max-w-sm">
      <Icon className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2" icon={SearchIcon} size="sm" tone="muted" />
      <Input aria-label="Buscar clientes" className="pl-9" placeholder="Buscar clientes…" />
    </div>
  )
}

/**
 * Estado vacío
 * `EmptyState` ya pone el cuadrito y el `aria-hidden`: se le pasa el ícono sin tamaño.
 */
export function EnUnEstadoVacio() {
  return (
    <EmptyState
      action={
        <Button size="sm">
          <MailIcon />
          Enviar recordatorio
        </Button>
      }
      className="w-full max-w-md"
      description="Cuando un cliente te escriba, va a aparecer acá."
      icon={<InboxIcon />}
      title="Sin mensajes"
    />
  )
}

/**
 * Cambio de estado
 * Dos íconos que se reemplazan con un cruce, dentro de un `startTransition`: el navegador hace la animación, no JavaScript.
 */
export function CambioDeEstado() {
  const [activas, setActivas] = useState(false)
  return (
    <Button
      aria-pressed={activas}
      onClick={() => startTransition(() => setActivas((valor) => !valor))}
      variant="outline"
    >
      {activas ? (
        <ViewTransition key="on" enter="icon-in" exit="icon-out" default="none">
          <Icon icon={BellRingIcon} tone="brand" />
        </ViewTransition>
      ) : (
        <ViewTransition key="off" enter="icon-in" exit="icon-out" default="none">
          <Icon icon={BellIcon} />
        </ViewTransition>
      )}
      {activas ? "Notificaciones activas" : "Activar notificaciones"}
    </Button>
  )
}

/**
 * Animados
 * Las utilidades de Tailwind alcanzan: `animate-spin` para esperar, `animate-pulse` para «hay algo nuevo». Con `prefers-reduced-motion` se quedan quietos.
 */
export function Animados() {
  return (
    <div className="flex flex-wrap items-center gap-6">
      <span className="inline-flex items-center gap-2 text-copy-14 text-gray-900">
        <Icon className="animate-spin motion-reduce:animate-none" icon={Loader2Icon} />
        Sincronizando
      </span>
      <span className="inline-flex items-center gap-2 text-copy-14 text-gray-900">
        <Icon className="animate-pulse motion-reduce:animate-none" icon={InfoIcon} tone="brand" />
        Hay una versión nueva
      </span>
      <Button variant="destructive">
        <Icon className="transition-transform duration-150 group-hover:-rotate-12" icon={Trash2Icon} />
        Borrar
      </Button>
    </div>
  )
}
