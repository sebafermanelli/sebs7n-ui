"use client"

import { FileTextIcon, LogOutIcon, UsersIcon } from "lucide-react"
import { AiButton, AiIcon } from "sebs7n-ui/ai-button"
import { useState } from "react"
import { AppShell } from "sebs7n-ui/app-shell"
import { AppShellContent } from "sebs7n-ui/app-shell-content"
import { Button } from "sebs7n-ui/button"
import { Card, CardContent } from "sebs7n-ui/card"
import { DropdownMenuItem } from "sebs7n-ui/dropdown-menu"
import { PageHeader, PageHeaderActions, PageHeaderDescription, PageHeaderTitle } from "sebs7n-ui/page-header"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarItem,
} from "sebs7n-ui/sidebar"
import { SidebarToggle } from "sebs7n-ui/sidebar-toggle"
import { Stat } from "sebs7n-ui/stat"
import { UserMenu } from "sebs7n-ui/user-menu"

/**
 * El layout completo
 * La barra global de 44 a todo el ancho (`header`), el sidebar a ras debajo y el contenido. Arrastrá el borde del sidebar para ensancharlo o angostarlo (por debajo de 140 px pliega al riel; doble clic o Enter alternan). Achicá la ventana por debajo de 1024px: el sidebar pasa a un Sheet detrás de la hamburguesa de la barra del teléfono, donde no hay separador.
 * El alto sale de `--app-shell-height`; acá está fijado en 560px para que entre en la página.
 */
export function Completo() {
  const usuario = { name: "Ana Pérez", email: "ana@acme.com" }
  return (
    <div className="w-full min-w-0 overflow-hidden rounded-surface border border-separator">
      <AppShell
        className="[--app-shell-height:560px]"
        header={
          <>
            <span className="text-title-3 text-label">
              Acme <span className="text-brand-900">Facturas</span>
            </span>
            <span className="ml-auto" />
            <UserMenu collapsed user={usuario} />
          </>
        }
        mobileBar={
          <>
            <div className="size-6 rounded-control bg-label" />
            <span className="ml-auto" />
            <UserMenu collapsed user={usuario} />
          </>
        }
        sidebar={
          <Sidebar id="shell-sidebar">
            <SidebarHeader>
              <div className="flex h-8 items-center gap-2 ps-1 group-data-collapsed/sidebar:h-auto group-data-collapsed/sidebar:flex-col group-data-collapsed/sidebar:ps-0">
                <span className="text-callout font-semibold text-label-secondary group-data-collapsed/sidebar:hidden">Espacio de trabajo</span>
                <SidebarToggle />
              </div>
            </SidebarHeader>
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel>Operación</SidebarGroupLabel>
                <SidebarItem active icon={<FileTextIcon />}>
                  Facturas
                </SidebarItem>
                <SidebarItem icon={<UsersIcon />}>Clientes</SidebarItem>
              </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
              <UserMenu
                signOut={
                  <DropdownMenuItem>
                    <LogOutIcon />
                    Cerrar sesión
                  </DropdownMenuItem>
                }
                user={usuario}
              />
            </SidebarFooter>
          </Sidebar>
        }
      >
        <AppShellContent>
          <PageHeader>
            <PageHeaderTitle>Facturas</PageHeaderTitle>
            <PageHeaderDescription>Todo lo emitido en septiembre.</PageHeaderDescription>
            <PageHeaderActions>
              <Button>Nueva factura</Button>
            </PageHeaderActions>
          </PageHeader>
          <div className="grid gap-4 @3xl:grid-cols-2">
            <Card size="sm">
              <CardContent>
                <Stat delta="+12,4 %" hint="vs. agosto" label="Facturado" trend="up" value="$ 1.284.000" />
              </CardContent>
            </Card>
            <Card size="sm">
              <CardContent>
                <Stat delta="6 facturas" label="Vencido" trend="down" value="$ 142.900" />
              </CardContent>
            </Card>
          </div>
        </AppShellContent>
      </AppShell>
    </div>
  )
}

/**
 * Con panel lateral acoplado
 * El asistente o la ayuda van en `aside`: se acoplan a la derecha y empujan el contenido, sin tapar nada, y se ensanchan o angostan arrastrando su borde (doble clic restaura el ancho). El botón que lo abre vive en la barra global; el panel tiene su cabecera con la «X». Por debajo de 1024px pasa a un Sheet.
 */
export function ConPanelLateral() {
  const [open, setOpen] = useState(false)
  const boton = (
    <AiButton aria-label="Preguntar a la IA" onClick={() => setOpen((previous) => !previous)} size="icon-sm">
      <AiIcon />
    </AiButton>
  )
  return (
    <div className="w-full min-w-0 overflow-hidden rounded-surface border border-separator">
      <AppShell
        aside={
          <div className="flex flex-col gap-3 p-4">
            <p className="text-callout text-label-secondary">Preguntame por tus facturas.</p>
            <input aria-label="Mensaje" className="h-9 rounded-control border border-separator-strong bg-surface px-3 text-callout" placeholder="Escribí tu pregunta" />
          </div>
        }
        asideLabel="Asistente"
        asideOpen={open}
        className="[--app-shell-height:420px]"
        header={
          <>
            <span className="text-title-3 text-label">
              Acme <span className="text-brand-900">Facturas</span>
            </span>
            <span className="ml-auto" />
            {boton}
          </>
        }
        mobileBar={
          <>
            <span className="ml-auto" />
            {boton}
          </>
        }
        onAsideOpenChange={setOpen}
        sidebar={
          <Sidebar>
            <SidebarContent>
              <SidebarGroup>
                <SidebarItem active icon={<FileTextIcon />}>
                  Facturas
                </SidebarItem>
                <SidebarItem icon={<UsersIcon />}>Clientes</SidebarItem>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>
        }
      >
        <AppShellContent>
          <PageHeader>
            <PageHeaderTitle>Facturas</PageHeaderTitle>
            <PageHeaderDescription>Con el panel abierto, la página se achica y sigue operable.</PageHeaderDescription>
          </PageHeader>
          <Button>Nueva factura</Button>
        </AppShellContent>
      </AppShell>
    </div>
  )
}

/**
 * Ancho y plegado controlados
 * Para guardarlos donde quiera la app: `sidebarWidth` y `sidebarCollapsed` mandan, y `onSidebarWidthChange` / `onSidebarCollapsedChange` avisan al soltar. Con `sidebarStorageKey` el shell los recuerda solo, sin estado propio.
 */
export function AnchoControlado() {
  const [width, setWidth] = useState(256)
  const [collapsed, setCollapsed] = useState(false)
  return (
    <div className="w-full min-w-0 overflow-hidden rounded-surface border border-separator">
      <AppShell
        className="[--app-shell-height:320px]"
        mobileBar={<span className="ml-auto" />}
        onSidebarCollapsedChange={setCollapsed}
        onSidebarWidthChange={setWidth}
        sidebar={
          <Sidebar>
            <SidebarContent>
              <SidebarGroup>
                <SidebarItem active icon={<FileTextIcon />}>
                  Facturas
                </SidebarItem>
                <SidebarItem icon={<UsersIcon />}>Clientes</SidebarItem>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>
        }
        sidebarCollapsed={collapsed}
        sidebarWidth={width}
      >
        <AppShellContent>
          <PageHeader>
            <PageHeaderTitle>Facturas</PageHeaderTitle>
            <PageHeaderDescription>{collapsed ? "Sidebar plegado al riel." : `Sidebar de ${width} px.`}</PageHeaderDescription>
          </PageHeader>
        </AppShellContent>
      </AppShell>
    </div>
  )
}
