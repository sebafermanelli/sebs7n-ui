"use client"

import { FileTextIcon, LogOutIcon, UsersIcon } from "lucide-react"
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
  SidebarItem,
} from "sebs7n-ui/sidebar"
import { Stat } from "sebs7n-ui/stat"
import { UserMenu } from "sebs7n-ui/user-menu"

/**
 * El layout completo
 * La barra global de 44 a todo el ancho (`header`), el sidebar a ras debajo y el contenido. Achicá la ventana por debajo de 1024px: el sidebar pasa a un Sheet detrás de la hamburguesa de la barra del teléfono.
 * El alto sale de `--app-shell-height`; acá está fijado en 560px para que entre en la página.
 */
export function Completo() {
  const usuario = { name: "Ana Pérez", email: "ana@acme.com" }
  return (
    <div className="overflow-hidden rounded-surface border border-separator">
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
          <Sidebar>
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
          <div className="grid gap-4 2xl:grid-cols-2">
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
