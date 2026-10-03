"use client"

import type { ReactNode } from "react"

import { ConsoleCommandProvider } from "./_components/console-command"
import { ConsoleShell } from "./_components/console-shell"
import { NewServiceDialog } from "./_components/new-service-dialog"
import { ShortcutsProvider } from "./_components/shortcuts"
import { ProjectProvider } from "./_state/project-context"

// El shell, el proyecto activo, los atajos y el alta de servicios, una vez para todas las secciones.
export default function ConsoleLayout({ children }: { children: ReactNode }) {
  return (
    <ProjectProvider>
      <ShortcutsProvider>
        <ConsoleCommandProvider>
          <ConsoleShell>{children}</ConsoleShell>
          <NewServiceDialog />
        </ConsoleCommandProvider>
      </ShortcutsProvider>
    </ProjectProvider>
  )
}
