"use client"

import Link from "next/link"
import { ArrowLeftIcon } from "lucide-react"
import { ThemeSwitcher } from "sebs7n-ui/theme-switcher"
import { UserMenu } from "sebs7n-ui/user-menu"
import { DropdownMenuItem } from "sebs7n-ui/dropdown-menu"
import { buttonVariants } from "sebs7n-ui/variants/button"

export function DashboardHeader() {
  return (
    <header className="flex h-11 shrink-0 items-center justify-between border-b border-separator-strong bg-surface-header px-4">
      <div className="flex items-center gap-2">
        <Link
          href="/templates"
          className={buttonVariants({ variant: "plain", size: "sm" })}
        >
          <ArrowLeftIcon className="size-4 mr-1" />
          Templates
        </Link>
        <span className="text-label-tertiary">/</span>
        <span className="text-callout font-medium text-label">Acme Facturación</span>
      </div>

      <div className="flex items-center gap-3">
        <ThemeSwitcher />
        <UserMenu
          user={{ name: "Sebastián Fermanelli", email: "admin@acme.com" }}
          align="end"
          signOut={<DropdownMenuItem destructive>Cerrar sesión</DropdownMenuItem>}
        >
          <DropdownMenuItem>Perfil y equipo</DropdownMenuItem>
          <DropdownMenuItem>Preferencias de facturación</DropdownMenuItem>
        </UserMenu>
      </div>
    </header>
  )
}
