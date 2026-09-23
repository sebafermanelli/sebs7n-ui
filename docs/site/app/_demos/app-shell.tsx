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
  SidebarHeader,
  SidebarItem,
} from "sebs7n-ui/sidebar"
import { Stat } from "sebs7n-ui/stat"
import { UserMenu } from "sebs7n-ui/user-menu"

/**
 * El layout completo
 * Achicá la ventana por debajo de 1024px: el sidebar pasa a un Sheet detrás de la hamburguesa.
 * El alto sale de `--app-shell-height`; acá está fijado en 560px para que entre en la página.
 */
export function Completo() {
  const usuario = { name: "Ana Pérez", email: "ana@acme.com" }
  return (
    <div className="overflow-hidden rounded-xl border border-gray-400">
      <AppShell
        className="[--app-shell-height:560px]"
        mobileBar={
          <>
            <div className="size-6 rounded-md bg-gray-1000" />
            <span className="ml-auto" />
            <UserMenu collapsed user={usuario} />
          </>
        }
        sidebar={
          <Sidebar>
            <SidebarHeader>
              <div className="flex h-8 items-center gap-2 px-1">
                <div className="size-6 shrink-0 rounded-md bg-gray-1000" />
                <span className="text-label-14 font-medium">Acme</span>
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
              <Button variant="accent">Nueva factura</Button>
            </PageHeaderActions>
          </PageHeader>
          <div className="grid gap-4 sm:grid-cols-2">
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
