"use client"

import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, AppShell, AppShellContent, Badge, Button, Card, DropdownMenuItem, DropdownMenuShortcut,
  EmptyState, Kbd, PageHeader, PageHeaderActions, PageHeaderDescription, PageHeaderTitle, Sidebar, SidebarContent,
  SidebarFooter, SidebarGroup, SidebarGroupLabel, SidebarHeader, SidebarItem, SidebarItemBadge, SidebarSearch, Stat,
  ThemeSwitcher, Toggle, UserMenu,
} from "sebs7n-ui"
import {
  BellIcon, BoxIcon, CircleHelpIcon, CreditCardIcon, FileTextIcon, HomeIcon, InboxIcon, LogOutIcon, MegaphoneIcon,
  PanelLeftIcon, PlusIcon, ReceiptIcon, SettingsIcon, UsersIcon,
} from "lucide-react"
import type * as React from "react"
import { useState } from "react"
import { toast } from "sonner"

const USER = { name: "Ana Pérez", email: "ana@example.com" }

function DemoUserMenu({ collapsed }: { collapsed?: boolean }) {
  return (
    <UserMenu
      user={USER}
      collapsed={collapsed}
      signOut={
        <DropdownMenuItem onClick={() => toast("Sesión cerrada")}>
          <LogOutIcon />
          Cerrar sesión
        </DropdownMenuItem>
      }
    >
      <DropdownMenuItem>
        <SettingsIcon />
        Ajustes de cuenta
      </DropdownMenuItem>
      <DropdownMenuItem>
        <CircleHelpIcon />
        Ayuda
        <DropdownMenuShortcut>?</DropdownMenuShortcut>
      </DropdownMenuItem>
    </UserMenu>
  )
}

function DemoSidebar({ collapsed = false, active, onNavigate }: { collapsed?: boolean; active: string; onNavigate: (key: string) => void }) {
  const item = (key: string, icon: React.ReactNode, label: string, badge?: number) => (
    <SidebarItem
      href={`#${key}`}
      icon={icon}
      active={active === key}
      onClick={(event) => {
        event.preventDefault()
        onNavigate(key)
      }}
    >
      {label}
      {badge != null && <SidebarItemBadge>{badge}</SidebarItemBadge>}
    </SidebarItem>
  )
  return (
    <Sidebar collapsed={collapsed}>
      <SidebarHeader>
        <div className="flex h-8 min-w-0 items-center gap-2 px-1">
          <span aria-hidden="true" className="flex size-6 shrink-0 items-center justify-center rounded-md bg-gray-1000 text-label-12 text-background-100">
            A
          </span>
          <span className="truncate text-label-14 font-medium text-gray-1000 group-data-collapsed/sidebar:hidden">Acme</span>
          <Badge size="sm" className="group-data-collapsed/sidebar:hidden">Admin</Badge>
        </div>
        <SidebarSearch shortcut="⌘K" onClick={() => toast("Acá abre la paleta ⌘K de la app")} />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Operación</SidebarGroupLabel>
          {item("inicio", <HomeIcon />, "Inicio")}
          {item("facturas", <ReceiptIcon />, "Facturas")}
          {item("clientes", <UsersIcon />, "Clientes", 3)}
          {item("productos", <BoxIcon />, "Productos")}
          {item("pagos", <CreditCardIcon />, "Pagos")}
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Comunicación</SidebarGroupLabel>
          {item("avisos", <MegaphoneIcon />, "Avisos", 5)}
          {item("notificaciones", <BellIcon />, "Notificaciones")}
          {item("plantillas", <FileTextIcon />, "Plantillas")}
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <DemoUserMenu />
      </SidebarFooter>
    </Sidebar>
  )
}

export function ShellDemo() {
  const [collapsed, setCollapsed] = useState(false)
  const [active, setActive] = useState("facturas")

  return (
    <div className="h-[720px] overflow-auto rounded-xl border border-gray-400">
      <AppShell
        className="[--app-shell-height:718px]"
        sidebar={<DemoSidebar collapsed={collapsed} active={active} onNavigate={setActive} />}
        mobileBar={
          <>
            <span className="truncate text-label-14 font-medium">Acme</span>
            <span className="ml-auto" />
            <Button variant="ghost" size="icon-sm" aria-label="Notificaciones">
              <BellIcon />
            </Button>
            <DemoUserMenu collapsed />
          </>
        }
      >
        <AppShellContent>
          <div className="hidden lg:block">
            <Button variant="ghost" size="icon-sm" aria-label={collapsed ? "Expandir sidebar" : "Colapsar sidebar"} aria-pressed={collapsed} onClick={() => setCollapsed((c) => !c)}>
              <PanelLeftIcon />
            </Button>
          </div>
          <PageHeader>
            <PageHeaderTitle>Facturas</PageHeaderTitle>
            <PageHeaderDescription>12 emitidas · 3 vencen esta semana</PageHeaderDescription>
            <PageHeaderActions>
              <Button variant="outline">Exportar</Button>
              <Button variant="accent">
                <PlusIcon />
                Nueva factura
              </Button>
            </PageHeaderActions>
            <div className="flex flex-wrap gap-2">
              <Toggle defaultPressed>Emitidas</Toggle>
              <Toggle>Borradores</Toggle>
              <Toggle>Archivadas</Toggle>
            </div>
          </PageHeader>
          <Card size="sm">
            <div className="grid grid-cols-2 gap-4 px-4 md:grid-cols-4">
              <Stat label="Ingresos del mes" value="$48.200" delta="+12%" trend="up" hint="vs. agosto" />
              <Stat label="Facturas emitidas" value="12" />
              <Stat label="Clientes activos" value="86" delta="+4" trend="up" />
              <Stat label="Vencidas" value="2" delta="−1" trend="down" hint="vs. agosto" />
            </div>
          </Card>
          <EmptyState
            icon={<InboxIcon />}
            title="No hay facturas archivadas"
            description="Cuando archives una factura cobrada, aparece acá con sus pagos y documentos."
            action={<Button variant="outline">Ver facturas emitidas</Button>}
          />
        </AppShellContent>
      </AppShell>
    </div>
  )
}

export function MiscDemo() {
  const [open, setOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-copy-14 text-gray-900">
          Buscar <Kbd>⌘K</Kbd> · Cerrar <Kbd>Esc</Kbd> · Atajo <Kbd>F</Kbd>
        </span>
        <ThemeSwitcher />
        <AlertDialog open={open} onOpenChange={setOpen}>
          <AlertDialogTrigger render={<Button variant="outline" />}>Eliminar factura</AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar la factura A-0042?</AlertDialogTitle>
              <AlertDialogDescription>Se borran también sus 14 líneas y los pagos asociados. No se puede deshacer.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel />
              <AlertDialogAction
                variant="destructive"
                loading={deleting}
                onClick={() => {
                  setDeleting(true)
                  setTimeout(() => {
                    setDeleting(false)
                    setOpen(false)
                    toast.success("Factura eliminada")
                  }, 800)
                }}
              >
                Eliminar factura
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      <div className="flex flex-wrap items-start gap-4">
        <div className="h-72 w-fit overflow-hidden rounded-xl border border-gray-400">
          <DemoSidebar collapsed active="clientes" onNavigate={() => {}} />
        </div>
        <p className="text-copy-14 text-gray-900">Sidebar colapsado: solo íconos (64px), tooltip con el label, avatar con tooltip “Nombre · email”.</p>
      </div>
    </div>
  )
}
