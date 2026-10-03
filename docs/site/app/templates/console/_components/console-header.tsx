"use client"

import { ArrowLeftIcon } from "lucide-react"
import Link from "next/link"
import { AiButton, AiIcon } from "sebs7n-ui/ai-button"
import { DropdownMenuItem } from "sebs7n-ui/dropdown-menu"
import { NotificationsPopover } from "sebs7n-ui/notifications-popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "sebs7n-ui/select"
import { UserMenu } from "sebs7n-ui/user-menu"
import { buttonVariants } from "sebs7n-ui/variants/button"

import { notificationsFor } from "../_data/notifications"
import { GALLERY_PATH } from "../_lib/routes"
import { useProject } from "../_state/project-context"
import { useShortcuts } from "./shortcuts"

// El contenido de la barra global (el alto y el borde los pone `AppShell`). El selector de proyecto
// es lo primero que se ve: todo lo demás depende de él. A la derecha, los avisos y el usuario; el
// tema no va aparte porque `UserMenu` ya trae su fila. `compact` es la del teléfono.
export function ConsoleHeader({ compact = false }: { compact?: boolean }) {
  const { project, projects, setProjectId, services, deployments, alertRules, readIds, setReadIds, assistantOpen, setAssistantOpen } = useProject()
  const notifications = notificationsFor(services, deployments, alertRules).map((n) => ({
    id: n.id,
    title: n.title,
    description: n.description,
    time: n.time,
    tone: n.level === "error" ? ("red" as const) : ("amber" as const),
  }))
  const shortcuts = useShortcuts()
  const items = Object.fromEntries(projects.map((p) => [p.id, p.name]))
  return (
    <>
      <div className="flex min-w-0 items-center gap-2">
        {GALLERY_PATH &&
          (compact ? (
            // En el teléfono la barra no tiene lugar para el texto: queda la flecha, con su nombre accesible.
            <Link aria-label="Volver a Templates" className={buttonVariants({ variant: "plain", size: "icon-sm" })} href={GALLERY_PATH}>
              <ArrowLeftIcon />
            </Link>
          ) : (
            <>
              <Link className={buttonVariants({ variant: "plain", size: "sm" })} href={GALLERY_PATH}>
                <ArrowLeftIcon />
                Templates
              </Link>
              <span aria-hidden="true" className="text-label-tertiary">
                /
              </span>
            </>
          ))}
        <Select items={items} onValueChange={(value) => value && setProjectId(value as string)} value={project.id}>
          <SelectTrigger aria-label="Proyecto" className="w-48" size="sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {projects.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {!compact && <span className="truncate text-callout text-label-secondary">{project.region}</span>}
      </div>

      {/* En su caja: el trigger de `UserMenu` ocupa todo el ancho que le den (es la fila del sidebar). */}
      <div className="ml-auto flex shrink-0 items-center gap-1">
        {compact ? (
          <AiButton aria-expanded={assistantOpen} aria-label="Preguntar a la IA" onClick={() => setAssistantOpen(!assistantOpen)} size="icon-sm">
            <AiIcon />
          </AiButton>
        ) : (
          <AiButton aria-expanded={assistantOpen} aria-keyshortcuts="Meta+J Control+J" onClick={() => setAssistantOpen(!assistantOpen)} size="sm">
            <AiIcon />
            Preguntar a la IA
          </AiButton>
        )}
        <NotificationsPopover items={notifications} label="Notificaciones" labels={{ title: "Notificaciones" }} onReadChange={setReadIds} read={readIds} />
        <UserMenu
          align="end"
          collapsed={compact}
          signOut={<DropdownMenuItem>Cerrar sesión</DropdownMenuItem>}
          user={{ name: "Lucía Ferrari", email: "lucia@acme.com" }}
        >
          <DropdownMenuItem>Perfil y equipo</DropdownMenuItem>
          <DropdownMenuItem onClick={shortcuts.open}>Atajos de teclado</DropdownMenuItem>
        </UserMenu>
      </div>
    </>
  )
}
