"use client"

import { BellRingIcon, BoxesIcon, FolderTreeIcon, KeyRoundIcon, ReceiptIcon, RocketIcon, TerminalIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarItem, SidebarItemBadge, SidebarSearch } from "sebs7n-ui/sidebar"

import { ALERTS_PATH, CONSOLE_PATH, COSTS_PATH, DEPLOYMENTS_PATH, LOGS_PATH, RESOURCES_PATH, VARIABLES_PATH } from "../_lib/routes"
import { useProject } from "../_state/project-context"
import { useConsoleCommand } from "./console-command"

export function ConsoleSidebar() {
  const pathname = usePathname()
  const { deployments } = useProject()
  const command = useConsoleCommand()
  const building = deployments.filter((d) => d.status === "building").length
  return (
    <Sidebar>
      <SidebarContent aria-label="Secciones">
        <SidebarSearch onClick={command.open} shortcut="⌘K" />
        <SidebarGroup>
          <SidebarGroupLabel>Proyecto</SidebarGroupLabel>
          <SidebarItem active={pathname === CONSOLE_PATH || pathname.startsWith(`${CONSOLE_PATH}/services/`)} icon={<BoxesIcon />} render={<Link href={CONSOLE_PATH} />}>
            Servicios
          </SidebarItem>
          <SidebarItem active={pathname === RESOURCES_PATH} icon={<FolderTreeIcon />} render={<Link href={RESOURCES_PATH} />}>
            Recursos
          </SidebarItem>
          <SidebarItem active={pathname === DEPLOYMENTS_PATH} icon={<RocketIcon />} render={<Link href={DEPLOYMENTS_PATH} />}>
            Despliegues
            {building > 0 && <SidebarItemBadge>{building}</SidebarItemBadge>}
          </SidebarItem>
          <SidebarItem active={pathname === LOGS_PATH} icon={<TerminalIcon />} render={<Link href={LOGS_PATH} />}>
            Logs
          </SidebarItem>
          <SidebarItem active={pathname === VARIABLES_PATH} icon={<KeyRoundIcon />} render={<Link href={VARIABLES_PATH} />}>
            Variables de entorno
          </SidebarItem>
          <SidebarItem active={pathname === ALERTS_PATH} icon={<BellRingIcon />} render={<Link href={ALERTS_PATH} />}>
            Alertas
          </SidebarItem>
          <SidebarItem active={pathname === COSTS_PATH} icon={<ReceiptIcon />} render={<Link href={COSTS_PATH} />}>
            Estado y costos
          </SidebarItem>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
