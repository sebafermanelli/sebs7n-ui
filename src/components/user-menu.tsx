"use client"

import type * as React from "react"
import { ChevronsUpDownIcon } from "lucide-react"

import { useLabels } from "../lib/labels.js"
import { cn } from "../lib/utils.js"
import { Children, Fragment, useContext, useRef } from "react"
import { AppShellContext, useSidebarContext } from "../internal/shell-context.js"
import { Avatar, AvatarFallback, AvatarImage } from "./avatar.js"
import { DropdownMenu, DropdownMenuContent, DropdownMenuSeparator, DropdownMenuTrigger } from "./dropdown-menu.js"
import { ThemeMenuRadio, type ThemeSwitcherLabels } from "./theme-switcher.js"
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip.js"

type UserMenuUser = { name: string; email?: string; image?: string }

type UserMenuProps = {
  user: UserMenuUser
  /** Solo el avatar (con tooltip). Por defecto, el estado del <Sidebar> que lo contiene. */
  collapsed?: boolean
  /** Lado del menú. Por defecto: "top" en el sidebar, "right" en el sidebar colapsado, "bottom" afuera. */
  side?: "top" | "bottom" | "left" | "right"
  align?: "start" | "center" | "end"
  /** Ítems de la app (Ajustes de cuenta, Ayuda…) como <DropdownMenuItem>. */
  children?: React.ReactNode
  /** Salida al final, tras un separador. Pasá un <DropdownMenuItem> neutral (no destructive). */
  signOut?: React.ReactNode
  /** false para no mostrar la fila de tema. */
  showTheme?: boolean
  labels?: { theme?: string; switcher?: Partial<ThemeSwitcherLabels> }
  className?: string
}

function initials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean)
  const first = words[0]?.[0] ?? ""
  const last = words.length > 1 ? (words[words.length - 1]?.[0] ?? "") : ""
  return (first + last).toUpperCase()
}

// Fila de usuario estilo Vercel: identifica la sesión y abre el menú de cuenta.
function UserMenu({ user, collapsed: collapsedProp, side, align, children, signOut, showTheme = true, labels, className }: UserMenuProps) {
  // `useLabels()` va suelto y no adentro de un `??`: el `??` corta, y un hook que a veces se llama
  // y a veces no rompe el orden de los hooks.
  const l = useLabels().userMenu
  const tema = labels?.theme ?? l.theme
  const sidebar = useSidebarContext()
  const shell = useContext(AppShellContext)
  // Si el ítem elegido cierra el Sheet mobile, el menú no devuelve el foco a su trigger (que se va con
  // el Sheet): lo maneja AppShell y va al main.
  const closingSheet = useRef(false)
  const collapsed = collapsedProp ?? sidebar?.collapsed ?? false
  const inSidebar = sidebar != null
  const menuSide = side ?? (inSidebar ? (collapsed ? "right" : "top") : "bottom")
  const menuAlign = align ?? (inSidebar ? (collapsed ? "end" : "start") : "end")
  const identity = user.email ? `${user.name} · ${user.email}` : user.name

  const avatar = (
    <Avatar aria-hidden="true">
      {user.image && <AvatarImage src={user.image} alt="" />}
      <AvatarFallback>{initials(user.name)}</AvatarFallback>
    </Avatar>
  )

  const trigger = collapsed ? (
    <DropdownMenuTrigger
      data-slot="user-menu-trigger"
      aria-label={identity}
      className={cn(
        "inline-flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full outline-none transition-control hover:bg-gray-alpha-100 focus-visible:focus-ring data-popup-open:bg-gray-alpha-200",
        className
      )}
    >
      {avatar}
    </DropdownMenuTrigger>
  ) : (
    <DropdownMenuTrigger
      data-slot="user-menu-trigger"
      className={cn(
        "flex h-12 w-full min-w-0 cursor-pointer items-center gap-2 rounded-md px-2 text-left outline-none transition-control hover:bg-gray-alpha-100 focus-visible:focus-ring data-popup-open:bg-gray-alpha-200",
        className
      )}
    >
      {avatar}
      <span className="flex min-w-0 flex-1 flex-col">
        <span data-slot="user-menu-name" className="truncate text-label-14 text-gray-1000">
          {user.name}
        </span>
        {user.email && (
          <span data-slot="user-menu-email" className="truncate text-label-12 text-gray-900">
            {user.email}
          </span>
        )}
      </span>
      <ChevronsUpDownIcon aria-hidden="true" className="size-4 shrink-0 text-gray-900" />
    </DropdownMenuTrigger>
  )

  return (
    <DropdownMenu
      onOpenChange={(open, details) => {
        if (open) closingSheet.current = false
        // Elegir un ítem (Ajustes, Ayuda…) es navegar: cierra también el Sheet mobile si está abierto.
        if (!open && details.reason === "item-press" && shell?.mobileOpen) {
          closingSheet.current = true
          shell.closeMobile({ focusMain: true })
        }
      }}
    >
      {collapsed ? (
        <Tooltip>
          <TooltipTrigger render={trigger} />
          <TooltipContent side="right">{identity}</TooltipContent>
        </Tooltip>
      ) : (
        trigger
      )}
      <DropdownMenuContent
        finalFocus={() => !closingSheet.current}
        side={menuSide}
        align={menuAlign}
        className={cn("min-w-56", !collapsed && inSidebar && "w-(--anchor-width)")}
      >
        {/* Un separador entre cada par de grupos no vacíos: nunca dos seguidos ni al final. */}
        {(
          [
            [
              "header",
              <div data-slot="user-menu-header" className="flex min-w-0 flex-col px-2 py-1.5">
                <span className="truncate text-label-14 text-gray-1000">{user.name}</span>
                {user.email && <span className="truncate text-label-12 text-gray-900">{user.email}</span>}
              </div>,
            ],
            ["children", Children.toArray(children).length > 0 && children],
            [
              "theme",
              showTheme && (
                <div data-slot="user-menu-theme" className="flex h-10 items-center justify-between gap-2 pr-1 pl-2 text-copy-14 text-gray-1000">
                  <span aria-hidden="true">{tema}</span>
                  <ThemeMenuRadio labels={{ group: tema, ...labels?.switcher }} />
                </div>
              ),
            ],
            ["signOut", Children.toArray(signOut).length > 0 && signOut],
          ] as const
        )
          .filter(([, node]) => node)
          .map(([key, node], i) => (
            <Fragment key={key}>
              {i > 0 && <DropdownMenuSeparator />}
              {node}
            </Fragment>
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export { UserMenu, type UserMenuProps, type UserMenuUser }
