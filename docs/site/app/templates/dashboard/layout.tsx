"use client"

import { usePathname } from "next/navigation"
import type { ReactNode } from "react"

import { DashboardCommandProvider } from "./_components/dashboard-command"
import { DashboardShell } from "./_components/dashboard-shell"
import { LOGIN_PATH } from "./_lib/routes"
import { InvoicesProvider } from "./_state/invoices-context"

// El shell y el store, una vez para las cuatro secciones. `pathname` le avisa al AppShell que se
// navegó: en el teléfono cierra el Sheet del sidebar y lleva el foco al contenido.
export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  // La pantalla de entrar va sola: sin sidebar ni barra, porque todavía no hay sesión.
  if (pathname === LOGIN_PATH) return <>{children}</>
  return (
    <InvoicesProvider>
      <DashboardCommandProvider>
        <DashboardShell>{children}</DashboardShell>
      </DashboardCommandProvider>
    </InvoicesProvider>
  )
}
