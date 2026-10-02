"use client"

import Link from "next/link"
import { ArrowLeftIcon } from "lucide-react"
import { ThemeSwitcher } from "sebs7n-ui/theme-switcher"
import { UserMenu } from "sebs7n-ui/user-menu"
import { DropdownMenuItem } from "sebs7n-ui/dropdown-menu"
import { buttonVariants } from "sebs7n-ui/variants/button"

// El contenido de la barra global: el alto, el fondo y el borde los pone `AppShell` (prop `header`).
export function DashboardHeader() {
  return (
    <>
      <div className="flex min-w-0 items-center gap-2">
        <Link
          href="/templates"
          className={buttonVariants({ variant: "plain", size: "sm" })}
        >
          <ArrowLeftIcon />
          Templates
        </Link>
        <span className="text-label-tertiary">/</span>
        <span className="truncate text-callout font-medium text-label">Acme Facturación</span>
      </div>

      <div className="ml-auto flex items-center gap-3">
        <ThemeSwitcher />
        <UserMenu
          user={{ name: "Administración", email: "admin@acme.com" }}
          align="end"
          signOut={<DropdownMenuItem variant="destructive">Cerrar sesión</DropdownMenuItem>}
        >
          <DropdownMenuItem>Perfil y equipo</DropdownMenuItem>
          <DropdownMenuItem>Preferencias de facturación</DropdownMenuItem>
        </UserMenu>
      </div>
    </>
  )
}
