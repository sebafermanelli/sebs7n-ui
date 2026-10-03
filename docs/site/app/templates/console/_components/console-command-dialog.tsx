"use client"

import { BellRingIcon, BoxesIcon, FolderTreeIcon, KeyboardIcon, KeyRoundIcon, PlusIcon, ReceiptIcon, RocketIcon, SparklesIcon, TerminalIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { CommandPalette, type CommandPaletteGroup } from "sebs7n-ui/command-palette"

import { servicePath } from "../_lib/routes"
import { useProject } from "../_state/project-context"
import { GO_SHORTCUTS, useShortcuts } from "./shortcuts"

const ICONS = { s: <BoxesIcon />, r: <FolderTreeIcon />, d: <RocketIcon />, l: <TerminalIcon />, v: <KeyRoundIcon />, a: <BellRingIcon />, c: <ReceiptIcon /> }

// El cuerpo de la paleta, en su propio archivo para pedirlo recién la primera vez que se abre: no entra
// en el primer bundle. Los grupos salen de lo que hay en pantalla y de la misma lista de atajos de la hoja.
export default function ConsoleCommandDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const router = useRouter()
  const { projects, setProjectId, services, setNewServiceOpen, setAssistantOpen } = useProject()
  const shortcuts = useShortcuts()

  const groups: CommandPaletteGroup[] = [
    {
      heading: "Acciones",
      items: [
        { value: "accion-crear-servicio", label: "Crear servicio", icon: <PlusIcon />, keywords: ["nuevo", "alta", "servicio"], onSelect: () => setNewServiceOpen(true) },
        { value: "accion-asistente", label: "Preguntarle al asistente", icon: <SparklesIcon />, keywords: ["ia", "ayuda", "chat"], onSelect: () => setAssistantOpen(true) },
        { value: "accion-atajos", label: "Atajos de teclado", icon: <KeyboardIcon />, keywords: ["teclado", "ayuda"], onSelect: () => shortcuts.open() },
      ],
    },
    {
      heading: "Ir a",
      items: GO_SHORTCUTS.map((section) => ({
        value: section.href,
        label: section.label,
        description: `Atajo: G y ${section.key.toUpperCase()}`,
        icon: ICONS[section.key],
        onSelect: () => router.push(section.href),
      })),
    },
    {
      heading: "Servicios",
      items: services.map((service) => ({ value: `servicio ${service.name}`, label: service.name, description: service.kind, icon: <BoxesIcon />, onSelect: () => router.push(servicePath(service.id)) })),
    },
    {
      heading: "Cambiar de proyecto",
      items: projects.map((project) => ({ value: `proyecto ${project.id}`, label: project.name, description: project.region, icon: <BoxesIcon />, onSelect: () => setProjectId(project.id) })),
    },
  ]

  return <CommandPalette groups={groups} labels={{ dialog: "Buscar en la consola" }} onOpenChange={onOpenChange} open={open} placeholder="Ir a una sección o cambiar de proyecto…" />
}
