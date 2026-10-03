"use client"

import { FileTextIcon, FolderIcon, HomeIcon, MailIcon, PlusIcon, SearchIcon, SettingsIcon, type LucideIcon } from "lucide-react"
import { lazy, Suspense, useEffect, useRef, useState, type ReactNode } from "react"
import { AiButton, AiIcon } from "sebs7n-ui/ai-button"
import { AppShell } from "sebs7n-ui/app-shell"
import { Avatar, AvatarFallback } from "sebs7n-ui/avatar"
import { Button } from "sebs7n-ui/button"
import { Kbd } from "sebs7n-ui/kbd"
import { useKeySequence } from "sebs7n-ui/lib/use-key-sequence"
import { NotificationsPopover, type NotificationItem } from "sebs7n-ui/notifications-popover"
import { Sidebar, SidebarContent, SidebarGroup, SidebarItem } from "sebs7n-ui/sidebar"
import type { ShortcutItem } from "sebs7n-ui/shortcuts-dialog"

import { SHOWCASES, type ShowcaseId } from "./catalog"
import { AppIcon } from "./parts"

// Todo lo pesado va aparte y se pide al usarlo: el chat (al abrir el panel), la paleta y la hoja de atajos
// (al primer ⌘K o «?»). `lazy` de React y no `next/dynamic`: no suma un preload al HTML del Playground.
const AssistantPanel = lazy(() => import("./assistant"))
const CommandPalette = lazy(() => import("sebs7n-ui/command-palette").then((mod) => ({ default: mod.CommandPalette })))
const ShortcutsDialog = lazy(() => import("sebs7n-ui/shortcuts-dialog").then((mod) => ({ default: mod.ShortcutsDialog })))

const ICONOS: Record<ShowcaseId, LucideIcon> = { home: HomeIcon, files: FolderIcon, settings: SettingsIcon, mail: MailIcon }
const ATAJOS_IR: Record<ShowcaseId, string> = { home: "i", files: "a", settings: "s", mail: "c" }

const AVISOS: NotificationItem[] = [
  { id: "n1", title: "Cobraste la factura 0013", description: "Nube Digital transfirió $ 612.500.", time: "10:24", tone: "green" },
  { id: "n2", title: "Vence la factura 0014", description: "Estudio Ruiz, hoy.", time: "09:02", tone: "amber" },
  { id: "n3", title: "Cliente nuevo", description: "Taller Sur completó el alta.", time: "Ayer" }
]

/** La hoja de atajos de la muestra: la misma lista arma ⌘K, la hoja y el hook. */
const ATAJOS: ShortcutItem[] = [
  { keys: ["⌘", "K"], label: "Buscar y ejecutar comandos" },
  { keys: ["?"], label: "Ver los atajos" },
  ...SHOWCASES.map((item) => ({ keys: ["g", ATAJOS_IR[item.id]], label: `Ir a ${item.label}`, sequence: true }))
]

type ShellProps = {
  screen: ShowcaseId
  onScreen: (screen: ShowcaseId) => void
  /** El wallpaper (`AppShell ambient`): lo decide el Playground. */
  ambient: boolean
  asideOpen: boolean
  onAsideOpenChange: (open: boolean) => void
  /** Se llama con el ancho del contenido (`main`), en px, cada vez que cambia. */
  onWidth: (width: number) => void
  children: ReactNode
}

/**
 * El marco de las pantallas: un `AppShell` entero. Sidebar en riel (64, redimensionable), barra con «Preguntar a la IA» y los
 * avisos, el panel lateral acoplado con el asistente, ⌘K, la hoja de atajos (`?`) y `g` + letra. Los atajos
 * solo valen con el foco adentro del marco: ⌘K del resto del sitio sigue siendo el buscador de la documentación.
 */
export function ShowcaseShell({ screen, onScreen, ambient, asideOpen, onAsideOpenChange, onWidth, children }: ShellProps) {
  const frame = useRef<HTMLDivElement>(null)
  const [paletteUsed, setPaletteUsed] = useState(false)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [helpUsed, setHelpUsed] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const [read, setRead] = useState<string[]>([])

  const openPalette = () => {
    setPaletteUsed(true)
    setPaletteOpen(true)
  }
  const openHelp = () => {
    setHelpUsed(true)
    setHelpOpen(true)
  }
  const inside = () => frame.current?.contains(document.activeElement) ?? false

  // `?` y `g` + letra, como en una app real; solo cuando el foco está en el marco.
  useKeySequence({
    "?": () => inside() && openHelp(),
    ...Object.fromEntries(SHOWCASES.map((item) => [`g ${ATAJOS_IR[item.id]}`, () => inside() && onScreen(item.id)]))
  })

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== "k" || !(event.metaKey || event.ctrlKey) || !inside()) return
      event.preventDefault()
      // En captura y cortando: el buscador del sitio también escucha ⌘K, y abrirían dos paletas.
      event.stopImmediatePropagation()
      openPalette()
    }
    window.addEventListener("keydown", onKeyDown, true)
    return () => window.removeEventListener("keydown", onKeyDown, true)
  }, [])

  // El ancho del contenido, el que miden las container queries de adentro.
  useEffect(() => {
    const main = frame.current?.querySelector<HTMLElement>("[data-slot=app-shell-main]")
    if (!main) return
    const observer = new ResizeObserver(([entry]) => entry && onWidth(Math.round(entry.contentRect.width)))
    observer.observe(main)
    onWidth(Math.round(main.getBoundingClientRect().width))
    return () => observer.disconnect()
  }, [onWidth])

  const toggleAside = () => onAsideOpenChange(!asideOpen)
  const preguntar = (compact: boolean) =>
    compact ? (
      <AiButton aria-expanded={asideOpen} aria-label="Preguntar a la IA" onClick={toggleAside} size="icon-sm">
        <AiIcon />
      </AiButton>
    ) : (
      <AiButton aria-expanded={asideOpen} onClick={toggleAside} size="sm">
        <AiIcon />
        Preguntar a la IA
      </AiButton>
    )
  const barra = (compact: boolean) => (
    <>
      <span className="flex min-w-0 items-center gap-2 text-callout font-medium text-label">
        <AppIcon fill="brand" icon={FileTextIcon} size="sm" />
        <span className="truncate">Facturación</span>
      </span>
      <div className="ml-auto flex shrink-0 items-center gap-1">
        {!compact && (
          <Button onClick={openPalette} size="sm" variant="secondary">
            <SearchIcon />
            Buscar
            <Kbd>⌘K</Kbd>
          </Button>
        )}
        {preguntar(compact)}
        <NotificationsPopover items={AVISOS} onReadChange={setRead} read={read} />
        <Avatar size="sm">
          <AvatarFallback>AP</AvatarFallback>
        </Avatar>
      </div>
    </>
  )

  return (
    <div className="h-full overflow-y-auto" ref={frame}>
      <AppShell
        // El alto del marco, no el de la ventana: lo que usan el sidebar, el panel y las pantallas con paneles.
        className="[--app-shell-height:var(--showcase-height)] [--showcase-split:calc(var(--app-shell-height)-2.75rem)]"
        ambient={ambient}
        aside={
          <Suspense fallback={null}>
            <AssistantPanel screen={screen} />
          </Suspense>
        }
        asideLabel="Asistente"
        asideOpen={asideOpen}
        asideStorageKey="sebs7n-ui:playground:aside"
        asideTitle={
          <span className="inline-flex items-center gap-2">
            <AiIcon className="size-5" />
            Asistente
          </span>
        }
        asideWidth={340}
        header={barra(false)}
        mainId="showcase-main"
        defaultSidebarCollapsed
        mobileBar={barra(true)}
        onAsideOpenChange={onAsideOpenChange}
        sidebarStorageKey="sebs7n-ui:playground:sidebar"
        sidebar={
          <Sidebar>
            <SidebarContent aria-label="Pantallas de la muestra">
              <SidebarGroup>
                {SHOWCASES.map((item) => {
                  const Icono = ICONOS[item.id]
                  return (
                    <SidebarItem active={screen === item.id} icon={<Icono />} key={item.id} onClick={() => onScreen(item.id)} render={<button type="button" />} tooltip={item.label}>
                      {item.label}
                    </SidebarItem>
                  )
                })}
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>
        }
      >
        {children}
      </AppShell>
      {paletteUsed && (
        <Suspense fallback={null}>
          <CommandPalette
            groups={[
              {
                heading: "Pantallas",
                items: SHOWCASES.map((item) => {
                  const Icono = ICONOS[item.id]
                  return {
                  value: item.id,
                  label: item.label,
                  icon: <Icono />,
                  description: `g luego ${ATAJOS_IR[item.id]}`,
                  onSelect: () => onScreen(item.id)
                  }
                })
              },
              {
                heading: "Acciones",
                items: [
                  { value: "ask", label: "Preguntar a la IA", icon: <AiIcon />, onSelect: () => onAsideOpenChange(true) },
                  { value: "new", label: "Nueva factura", icon: <PlusIcon />, onSelect: () => {} },
                  { value: "help", label: "Atajos de teclado", description: "Tecla ?", onSelect: openHelp }
                ]
              }
            ]}
            labels={{ dialog: "Buscar en la muestra" }}
            onOpenChange={setPaletteOpen}
            open={paletteOpen}
            placeholder="Pantallas y acciones…"
          />
        </Suspense>
      )}
      {helpUsed && (
        <Suspense fallback={null}>
          <ShortcutsDialog description="«g» y la letra se tipean en secuencia." onOpenChange={setHelpOpen} open={helpOpen} shortcuts={ATAJOS} />
        </Suspense>
      )}
    </div>
  )
}
