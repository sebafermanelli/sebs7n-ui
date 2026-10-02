"use client"

import { usePathname } from "next/navigation"
import type { ReactNode } from "react"
import { AppShell } from "sebs7n-ui/app-shell"

import { DashboardHeader } from "./_components/dashboard-header"
import { DashboardSidebar } from "./_components/dashboard-sidebar"
import { InvoicesProvider } from "./_state/invoices-context"

// El shell y el store, una vez para las cuatro secciones. `pathname` le avisa al AppShell que se
// navegó: en el teléfono cierra el Sheet del sidebar y lleva el foco al contenido.
export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  return (
    <InvoicesProvider>
      <AppShell
        header={<DashboardHeader />}
        mobileBar={<DashboardHeader compact />}
        pathname={pathname}
        sidebar={<DashboardSidebar />}
      >
        {children}
      </AppShell>
    </InvoicesProvider>
  )
}
