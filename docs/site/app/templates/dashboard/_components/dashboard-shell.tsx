"use client"

import { PlusIcon } from "lucide-react"
import dynamic from "next/dynamic"
import { usePathname } from "next/navigation"
import { useEffect, useState, type ReactNode } from "react"
import { AiIcon } from "sebs7n-ui/ai-button"
import { AppShell } from "sebs7n-ui/app-shell"
import { Button } from "sebs7n-ui/button"

import { useAssistant } from "../_state/use-assistant"
import { DashboardHeader } from "./dashboard-header"
import { DashboardSidebar } from "./dashboard-sidebar"

// El chat no hace falta para pintar la pantalla: `AppShell` solo monta el panel abierto, y recién ahí se pide.
const AssistantPanel = dynamic(() => import("./assistant-panel"), { ssr: false })

// El shell con el asistente acoplado a la derecha: empuja el contenido y el resto sigue usable. El estado
// (abierto y conversación) vive acá, en el layout, y sobrevive a la navegación entre secciones. ⌘J lo alterna.
export function DashboardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const assistant = useAssistant()

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== "j" || !(event.metaKey || event.ctrlKey) || event.altKey || event.shiftKey) return
      event.preventDefault()
      setOpen((previous) => !previous)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  const assistantToggle = { open, toggle: () => setOpen((previous) => !previous) }

  return (
    <AppShell
      aside={<AssistantPanel assistant={assistant} />}
      asideActions={
        assistant.turns.length > 0 && (
          <Button aria-label="Nueva conversación" onClick={assistant.reset} size="icon-sm" variant="plain">
            <PlusIcon />
          </Button>
        )
      }
      asideLabel="Asistente"
      asideOpen={open}
      asideStorageKey="sebs7n-ui:dashboard:aside"
      asideTitle={
        <span className="inline-flex items-center gap-2">
          <AiIcon className="size-5" />
          Asistente
        </span>
      }
      header={<DashboardHeader assistant={assistantToggle} />}
      mobileBar={<DashboardHeader assistant={assistantToggle} compact />}
      onAsideOpenChange={setOpen}
      pathname={pathname}
      sidebar={<DashboardSidebar />}
      sidebarStorageKey="sebs7n-ui:dashboard:sidebar"
    >
      {children}
    </AppShell>
  )
}
