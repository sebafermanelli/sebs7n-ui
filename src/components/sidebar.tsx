"use client"

import * as React from "react"
import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { SearchIcon } from "lucide-react"

import { useLabels } from "../lib/labels.js"
import { cn } from "../lib/utils.js"
import { AppShellContext, SidebarContext, SidebarInSheetContext, useSidebarContext } from "../internal/shell-context.js"
import { sidebarItemVariants } from "../variants/sidebar.js"
import { Kbd } from "./kbd.js"
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip.js"

type SidebarProps = React.ComponentProps<"aside"> & {
  /** Solo íconos (64px). El ancho cambia sin animación: el spec prohíbe animar width. */
  collapsed?: boolean
}

// A ras de la ventana (no card flotante): background-200 + borde derecho, columna a todo el alto.
function Sidebar({ className, collapsed: collapsedProp = false, ...props }: SidebarProps) {
  const inSheet = React.useContext(SidebarInSheetContext)
  const collapsed = inSheet ? false : collapsedProp
  const value = React.useMemo(() => ({ collapsed }), [collapsed])
  return (
    <SidebarContext.Provider value={value}>
      <aside
        data-slot="sidebar"
        data-collapsed={collapsed ? "" : undefined}
        className={cn(
          "group/sidebar flex h-full w-60 shrink-0 flex-col border-r border-gray-400 bg-background-200 text-gray-1000 data-collapsed:w-16",
          inSheet && "w-full border-r-0",
          className
        )}
        {...props}
      />
    </SidebarContext.Provider>
  )
}

function SidebarHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-header"
      className={cn("flex shrink-0 flex-col gap-2 p-2 pt-3 group-data-collapsed/sidebar:items-center", className)}
      {...props}
    />
  )
}

type SidebarContentProps = React.ComponentProps<"nav">

// La zona que scrollea. Es un <nav>: nombralo con aria-label si hay más de uno en la página.
function SidebarContent({ className, "aria-label": ariaLabel, ...props }: SidebarContentProps) {
  const l = useLabels().sidebar
  return (
    <nav
      data-slot="sidebar-content"
      aria-label={ariaLabel ?? l.nav}
      className={cn(
        "flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain p-2 group-data-collapsed/sidebar:items-center",
        className
      )}
      {...props}
    />
  )
}

function SidebarFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-footer"
      className={cn("flex shrink-0 flex-col gap-1 border-t border-gray-400 p-2 group-data-collapsed/sidebar:items-center", className)}
      {...props}
    />
  )
}

// El id del label se decide en el render (useId + los hijos directos), igual en server y cliente:
// sin SidebarGroupLabel no hay aria-labelledby apuntando a la nada, y no hay efecto que lo agregue
// después de hidratar. Un label anidado en otro elemento no se detecta: pasá aria-labelledby a mano.
const SidebarGroupContext = React.createContext<string | null>(null)

function findGroupLabel(children: React.ReactNode): React.ReactElement<{ id?: string }> | undefined {
  for (const child of React.Children.toArray(children)) {
    if (!React.isValidElement(child)) continue
    if (child.type === SidebarGroupLabel) return child as React.ReactElement<{ id?: string }>
    if (child.type === React.Fragment) {
      const nested = findGroupLabel((child.props as { children?: React.ReactNode }).children)
      if (nested) return nested
    }
  }
  return undefined
}

function SidebarGroup({ className, children, ...props }: React.ComponentProps<"div">) {
  const generatedId = React.useId()
  const label = findGroupLabel(children)
  const labelId = label ? (label.props.id ?? generatedId) : undefined
  return (
    <SidebarGroupContext.Provider value={generatedId}>
      <div
        data-slot="sidebar-group"
        role="group"
        aria-labelledby={labelId}
        className={cn("flex w-full flex-col gap-0.5 group-data-collapsed/sidebar:items-center", className)}
        {...props}
      >
        {children}
      </div>
    </SidebarGroupContext.Provider>
  )
}

// label-12 gray-900, sin uppercase (spec de Menú). Colapsado se oculta pero sigue nombrando al grupo.
function SidebarGroupLabel({ className, id, ...props }: React.ComponentProps<"div">) {
  const groupId = React.useContext(SidebarGroupContext)
  return (
    <div
      data-slot="sidebar-group-label"
      id={id ?? groupId ?? undefined}
      className={cn("flex h-8 shrink-0 items-center px-2 text-label-12 text-gray-900 group-data-collapsed/sidebar:hidden", className)}
      {...props}
    />
  )
}

type SidebarItemBadgeProps = React.ComponentProps<"span"> & {
  /** Texto para el lector de pantalla con contexto ("3 pendientes"). Por defecto, el número visible. */
  label?: string
}

// Contador a la derecha del ítem. Para el lector va separado del label ("Clientes, 3").
// Colapsado se oculta y SidebarItem muestra un punto si el valor no es cero.
function SidebarItemBadge({ className, label, children, ...props }: SidebarItemBadgeProps) {
  return (
    <span
      data-slot="sidebar-item-badge"
      className={cn("ml-auto shrink-0 text-label-12 text-gray-900 tabular-nums group-data-collapsed/sidebar:sr-only", className)}
      {...props}
    >
      {/* La coma es solo para el lector; el espacio queda al inicio de línea y CSS lo colapsa. */}
      <span className="sr-only">,</span>{" "}
      {label ? (
        <>
          <span aria-hidden="true">{children}</span>
          <span className="sr-only">{label}</span>
        </>
      ) : (
        children
      )}
    </span>
  )
}

function isNonZero(badge: React.ReactNode) {
  if (!React.isValidElement<{ children?: React.ReactNode }>(badge)) return false
  const value = badge.props.children
  return value != null && value !== false && value !== "" && value !== 0 && value !== "0"
}

// Children.toArray no abre fragments: <>{label}{badge}</> tiene que separar el badge igual.
function flattenFragments(children: React.ReactNode): React.ReactNode[] {
  return React.Children.toArray(children).flatMap((child) =>
    React.isValidElement<{ children?: React.ReactNode }>(child) && child.type === React.Fragment
      ? flattenFragments(child.props.children)
      : [child]
  )
}

function textOf(nodes: React.ReactNode[]): string | undefined {
  const parts = nodes.filter((n) => typeof n === "string" || typeof n === "number")
  return parts.length === nodes.length && parts.length > 0 ? parts.join("").trim() : undefined
}

type SidebarItemProps = Omit<useRender.ComponentProps<"a">, "className"> & {
  className?: string
  icon?: React.ReactNode
  /** Marca la sección actual: pone aria-current="page" y data-active. */
  active?: boolean
  /** Texto del tooltip cuando el sidebar está colapsado. Por defecto, el label si es texto. */
  tooltip?: React.ReactNode
}

// Link de navegación. Por defecto <a>; con Next: render={<Link href="/viajes" />}.
// Hijos: el label y, opcionalmente, un <SidebarItemBadge>. Dentro del Sheet mobile de AppShell,
// el click cierra el Sheet.
function SidebarItem({ className, icon, active = false, tooltip, render, children, ...props }: SidebarItemProps) {
  const sidebar = useSidebarContext()
  const shell = React.useContext(AppShellContext)
  const collapsed = sidebar?.collapsed ?? false

  const all = flattenFragments(children)
  const badges = all.filter((c) => React.isValidElement(c) && c.type === SidebarItemBadge)
  const label = all.filter((c) => !badges.includes(c))

  const element = useRender({
    defaultTagName: "a",
    render,
    props: mergeProps<"a">(
      {
        className: cn(sidebarItemVariants(), className),
        "aria-current": active ? "page" : undefined,
        onClick: (event: React.MouseEvent<HTMLAnchorElement>) => {
          // ⌘/Ctrl/Shift/Alt o click del medio abren en otra pestaña: el Sheet se queda abierto.
          if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return
          shell?.closeMobile({ focusMain: true })
        },
        children: (
          <>
            {icon}
            <span data-slot="sidebar-item-label" className="min-w-0 flex-1 truncate group-data-collapsed/sidebar:sr-only">
              {label}
            </span>
            {badges}
            {badges.some(isNonZero) && (
              <span
                data-slot="sidebar-item-dot"
                aria-hidden="true"
                className="absolute top-1 right-1 hidden size-1.5 rounded-full bg-gray-900 group-data-collapsed/sidebar:block"
              />
            )}
          </>
        ),
      },
      props,
      { "data-active": active ? "" : undefined } as React.ComponentProps<"a">
    ),
    state: { slot: "sidebar-item", active },
  })

  const tip = tooltip ?? textOf(label)
  if (!collapsed || tip == null) return element
  return (
    <Tooltip>
      <TooltipTrigger render={element} />
      <TooltipContent side="right">{tip}</TooltipContent>
    </Tooltip>
  )
}

type SidebarSearchProps = Omit<React.ComponentProps<"button">, "children"> & {
  /** Texto del botón (y su nombre accesible). */
  placeholder?: string
  /**
   * Atajo que se muestra a la derecha ("⌘K"). El atajo lo registra la app; sin shortcut no se anuncia
   * ninguno. Para "⌘K" y "Ctrl K" aria-keyshortcuts se deduce; para otros pasalo explícito.
   */
  shortcut?: React.ReactNode
}

const KEYSHORTCUTS: Record<string, string | undefined> = { "⌘K": "Meta+K", "Ctrl K": "Control+K", "Ctrl+K": "Control+K" }

// Botón con aspecto de Input que abre la paleta de comandos (la pone la app).
function SidebarSearch({
  className,
  placeholder,
  shortcut,
  "aria-keyshortcuts": keyshortcuts = KEYSHORTCUTS[String(shortcut)],
  ...props
}: SidebarSearchProps) {
  const collapsed = useSidebarContext()?.collapsed ?? false
  // `useLabels()` va suelto y no adentro de un `??`: el `??` corta, y un hook que a veces se llama
  // y a veces no rompe el orden de los hooks.
  const l = useLabels().sidebar
  const texto = placeholder ?? l.search
  const button = (
    <button
      type="button"
      data-slot="sidebar-search"
      aria-keyshortcuts={keyshortcuts}
      className={cn(
        "flex h-8 w-full min-w-0 cursor-pointer items-center gap-2 rounded-md border border-gray-400 bg-background-100 px-2 text-left text-copy-14 text-gray-900 outline-none transition-control hover:border-gray-500 hover:text-gray-1000 focus-visible:focus-ring [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
        "group-data-collapsed/sidebar:w-8 group-data-collapsed/sidebar:justify-center group-data-collapsed/sidebar:px-0",
        className
      )}
      {...props}
    >
      <SearchIcon aria-hidden="true" />
      <span className="min-w-0 flex-1 truncate group-data-collapsed/sidebar:sr-only">{texto}</span>
      {shortcut != null && (
        <Kbd aria-hidden="true" className="group-data-collapsed/sidebar:hidden">
          {shortcut}
        </Kbd>
      )}
    </button>
  )
  if (!collapsed) return button
  return (
    <Tooltip>
      <TooltipTrigger render={button} />
      <TooltipContent side="right">{placeholder}</TooltipContent>
    </Tooltip>
  )
}

/** Estado del Sidebar más cercano (collapsed), o null fuera de un Sidebar. */
function useSidebar() {
  return useSidebarContext()
}

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarItem,
  SidebarItemBadge,
  SidebarSearch,
  useSidebar,
  type SidebarItemBadgeProps,
  type SidebarItemProps,
  type SidebarProps,
  type SidebarSearchProps,
}
