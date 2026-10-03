"use client"

import { useId } from "react"
import { Label } from "sebs7n-ui/label"
import { SettingsGrid, SettingsSection } from "sebs7n-ui/settings-section"
import { Switch } from "sebs7n-ui/switch"

const GROUPS = [
  {
    id: "email",
    title: "Por correo",
    description: "Lo que llega a tu casilla cuando pasa algo con una factura.",
    items: [
      {
        id: "overdue",
        label: "Factura vencida",
        hint: "Cuando una factura pasa su vencimiento sin cobrarse.",
        on: true
      },
      {
        id: "paid",
        label: "Cobro recibido",
        hint: "Cada vez que se marca una factura como cobrada.",
        on: true
      }
    ]
  },
  {
    id: "app",
    title: "En la app",
    description: "Los avisos de la campana, mientras estás trabajando.",
    items: [
      {
        id: "mention",
        label: "Menciones del equipo",
        hint: "Cuando alguien te nombra en una nota de una factura.",
        on: true
      },
      {
        id: "assigned",
        label: "Facturas asignadas",
        hint: "Cuando te asignan una factura para gestionar.",
        on: false
      }
    ]
  },
  {
    id: "security",
    title: "Seguridad",
    description: "Cambios en el acceso a la cuenta que conviene saber al momento.",
    items: [
      { id: "login", label: "Inicio de sesión nuevo", hint: "Cuando entran desde un dispositivo que no conocemos.", on: true },
      { id: "roles", label: "Cambios de permisos", hint: "Cuando alguien del equipo cambia de rol o se quita su acceso.", on: true }
    ]
  },
  {
    id: "digest",
    title: "Resúmenes",
    description: "Un repaso periódico en vez de un aviso por evento.",
    items: [
      {
        id: "weekly",
        label: "Resumen semanal",
        hint: "Los lunes, lo facturado y lo cobrado de la semana.",
        on: false
      },
      {
        id: "monthly",
        label: "Cierre del mes",
        hint: "El primer día hábil, el balance del mes anterior.",
        on: false
      }
    ]
  }
]

// Un `Switch` aplica en el momento: sin «Guardar». Si hiciera falta guardar, serían `Checkbox`.
export function SettingsNotifications() {
  return (
    <SettingsGrid>
      {GROUPS.map((group) => (
        <SettingsSection description={group.description} key={group.id} title={group.title}>
          {group.items.map((notification) => (
            <NotificationRow key={notification.id} {...notification} />
          ))}
        </SettingsSection>
      ))}
    </SettingsGrid>
  )
}

function NotificationRow({ label, hint, on }: { label: string; hint: string; on: boolean }) {
  const id = useId()
  const hintId = useId()
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex flex-col gap-0.5">
        <Label htmlFor={id}>{label}</Label>
        <p className="text-footnote text-label-secondary" id={hintId}>
          {hint}
        </p>
      </div>
      <Switch aria-describedby={hintId} defaultChecked={on} id={id} />
    </div>
  )
}
