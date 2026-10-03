"use client"

import { PlusIcon } from "lucide-react"
import dynamic from "next/dynamic"
import { usePathname } from "next/navigation"
import { useEffect, type ReactNode } from "react"
import { AiIcon } from "sebs7n-ui/ai-button"
import { AppShell } from "sebs7n-ui/app-shell"
import { Button } from "sebs7n-ui/button"

import { useProject } from "../_state/project-context"
import { useAssistant } from "../_state/use-assistant"
import { ConsoleHeader } from "./console-header"
import { ConsoleSidebar } from "./console-sidebar"

// El chat no hace falta para pintar la pantalla: `AppShell` solo monta el panel abierto, y recién ahí se pide.
const AssistantPanel = dynamic(() => import("./assistant-panel"), { ssr: false })

// El shell con el asistente acoplado: el panel empuja la consola, que sigue usable. El estado (abierto y
// conversación) vive acá, en el layout, y sobrevive a la navegación entre secciones. ⌘J lo abre y cierra.
export function ConsoleShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const { assistantOpen, setAssistantOpen } = useProject()
  const assistant = useAssistant()

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== "j" || !(event.metaKey || event.ctrlKey) || event.altKey || event.shiftKey) return
      event.preventDefault()
      setAssistantOpen((previous) => !previous)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [setAssistantOpen])

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
      asideOpen={assistantOpen}
      asideStorageKey="sebs7n-ui:console:aside"
      asideTitle={
        <span className="inline-flex items-center gap-2">
          <AiIcon className="size-5" />
          Asistente
        </span>
      }
      header={<ConsoleHeader />}
      mobileBar={<ConsoleHeader compact />}
      onAsideOpenChange={setAssistantOpen}
      pathname={pathname}
      sidebar={<ConsoleSidebar />}
      sidebarStorageKey="sebs7n-ui:console:sidebar"
    >
      {children}
    </AppShell>
  )
}
